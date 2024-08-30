
import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';
import { Op, Sequelize, where } from "sequelize";
import { UserState, UserStatus, Users } from "../models/Users";
import { compare, hash } from "bcryptjs"
import config from '../config/configSetup';
import network from "../config/network.json";
import mainnet from "../config/paymentMainNet.json";
import testnet from "../config/paymentTestNet.json";
import { sign } from "jsonwebtoken";
import { compareTwoStrings } from 'string-similarity';

// yarn add stream-chat
const util = require('util')
import { Invoice } from "../models/Invoice";
import { Tokens } from "../models/Token";
import { UserTokens } from "../models/UserToken";
import { parseJsonText } from "typescript";
import { Withdrawal, WithdrawalStatus } from "../models/Withdrawal";
import { sendFcmNotification, sendEmail, sendEmailWithdraw } from "../services/notification";
import { PaymentRequests, TypeState } from "../models/Payment";
import { ServiceType, TransactionStatus, TransactionType, Transactions } from "../models/Transaction";
import { templateEmail } from "../config/template";
import { Customers } from "../models/Customers";
const fs = require("fs");
const axios = require('axios')




export const createInvoice = async (req: Request, res: Response) => {
  const { id } = req.user;
  const { lineItems, overdueAt, network, customerId, token, subTotal, symbol, business, title, invoiceNo, invoiceDate, noteHidden, noteVisible } = req.body;
  const user = await Users.findOne({ where: { id } })

  try {
    const response = await axios({
      method: 'POST',
      url: 'https://api.radom.network/invoice',
      headers: { 'Content-Type': 'application/json', Authorization: `${config.RADON}` },
      data: {
        customerIds: [customerId],
        products: [],
        lineItems: lineItems,
        overdueAt: new Date(overdueAt).toISOString(),
        inputData: [{
          "key": "name",
          "value": user?.email
        }],
        memo: null,
        gateway: {
          managed: { methods: [{ network, token, discountPercentOff: null }] }
        }
      }
    })

    console.log(util.inspect(response.data, false, null, true /* enable colors */))
    const invoice = await Invoice.create({
      randoId: response.data[0].id,
      title,
      invoiceNo,
      business,
      subTotal,
      network,
      symbol,
      note: noteVisible,
      organizationId: response.data[0].organizationId,
      seller: response.data[0].seller,
      customer: response.data[0].customer,
      gateway: response.data[0].gateway,
      products: response.data[0].products,
      lineItems: response.data[0].lineItems,
      issuedAt: new Date(invoiceDate).toISOString(),
      noteHidden,
      noteVisible,
      paidAt: response.data[0].paidAt,
      voidedAt: response.data[0].voidedAt,
      overdueAt: response.data[0].overdueAt,
      inputData: response.data[0].inputData,
      status: response.data[0].status,
      memo: response.data[0].memo,
      url: response.data[0].url,
      payment: response.data[0].payment,
      userId: id
    })
    await sendEmail(invoice?.customer.email.toString().replace("eisyappmail", ""), "Invoice", templateEmail("Invoice", `<div>An Invoice was sent to you from ${user?.email}.
    <br> Click the link below to view the invoice<br>
    <a href=https://eizypayment-bk.onrender.com/invoice?id=${invoice.randoId}> VIEW INVOICE <a/>
    </div>`));
    return successResponse(res, "Successful", invoice);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return successResponse(res, "Failed", error.response.data);
      // Do something with this error...
    } else {
      console.error(error);
      return successResponse(res, "Failed", error);
    }
  }
}





export const fetchInvoice = async (req: Request, res: Response) => {
  const { id } = req.user;
  const invoice = await Invoice.findAll({
    where: { userId: id }, order: [
      ['createdAt', 'DESC']
    ],
  })
  console.log(invoice);
  return successResponse(res, "Successful", invoice);

}



export const fetchInvoiceSummary = async (req: Request, res: Response) => {
  const { id } = req.user;
  const invoice = await Invoice.findAll({
    where: { userId: id }, order: [
      ['createdAt', 'DESC']
    ],
  })
  let paidInvoice: number = 0;
  let overdueInvoice: number = 0;
  let outStandingInvoice: number = 0;

  for (let value of invoice) {
    console.log(value.status.toString().replace('"', '').replace('"', ''))
    console.log(value.status.toString().replace('"', "") === "paid")
    console.log(value.status.toString().replace('"', "") === "overdue")
    console.log(value.status.toString().replace('"', "") === "pending")
    if (value.status.toString().replace('"', '') === "paid") {
      paidInvoice = paidInvoice + Number(value.subTotal)
    }
    if (value.status.toString().replace('"', '') === "overdue") {
      overdueInvoice = overdueInvoice + Number(value.subTotal)
    }
    if (value.status.toString().replace('"', '') === "pending") {
      outStandingInvoice = outStandingInvoice + Number(value.subTotal)
    }
  }



  const customers = await Customers.findAll({
    where: { userId: id }, order: [
      ['createdAt', 'DESC']
    ],

  })

  return successResponse(res, "Successful",
    {
      overdueInvoice,
      paidInvoice,
      outStandingInvoice,
      customers: customers.length
    });

}




export const fetchSignleInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await Users.findOne({ where: { id } })
  const invoice = await Invoice.findOne({ where: { randoId: id } })
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.radom.network/invoice/${id}`,
      headers: { 'Content-Type': 'application/json', Authorization: `${config.RADON}` },
    })
    const data = JSON.parse(JSON.stringify(response.data))
    await invoice!.update({
      organizationId: data.organizationId,
      seller: data.seller,
      customer: data.customer,
      gateway: data.gateway,
      products: data.products,
      lineItems: data.lineItems,
      issuedAt: data.issuedAt,
      paidAt: data.paidAt,
      voidedAt: data.voidedAt,
      overdueAt: data.overdueAt,
      inputData: data.inputData,
      status: data.status,
      memo: data.memo,
      url: data.url,
      payment: data.payment,
    })
    const newInvoice = await Invoice.findOne({ where: { randoId: id } })
    return successResponse(res, "Successful", newInvoice);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return successResponse(res, "Failed", error.response.data);
      // Do something with this error...
    } else {
      console.error(error);
      return successResponse(res, "Failed", error);
    }
  }
}



export const fetchAllNetwork = async (req: Request, res: Response) => {
  const { type } = req.query
  return successResponse(res, "Successful", type == "TESTNET" ? testnet : mainnet);

}



export const updateInvoiceStatus = async (req: Request, res: Response) => {
  const { id } = req.query;
  const invoice = await Invoice.findOne({ where: { randoId: id } })
  const date: string = new Date().toISOString();
  await invoice!.update({
    paidAt: date,
    status: "paid",
    processed: true
  })
  const newInvoice = await Invoice.findOne({ where: { randoId: id } })
  return successResponse(res, "Successful", newInvoice);
}





export const sendInvoiceReminder = async (req: Request, res: Response) => {
  const { id } = req.query;
  const invoice = await Invoice.findOne({ where: { randoId: id } })
  const data = JSON.parse(invoice?.customer)
  console.log(data)
  await sendEmail(data.email, "Invoice Reminder",
    templateEmail("Invoice Reminder", `<div>I hope this message finds you well.<br>

  I'm writing to kindly remind you about the outstanding invoice ${invoice?.randoId}, which remains unpaid.<br>
  
  Here are the details of the invoice:<br><br>
  
  Invoice Number: ${invoice?.randoId}<br>
  Invoice Date: ${invoice!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
  Amount Due: ${invoice?.subTotal}<br>
  Due Date:  ${invoice!.overdueAt}<br><br>
  <a href=https://eizypayment-bk.onrender.com/invoice?id=${invoice!.randoId}> VIEW INVOICE <a/>
  <br><br>
  We understand that oversight can happen, and we want to ensure that this matter is resolved promptly to avoid any inconvenience.<br>Please take a moment to review the invoice, and if you've already made the payment, kindly disregard this reminder.<br>
    
  If you have any questions regarding the invoice or need assistance with payment, please don't hesitate to reach out to us. We're here to help and ensure a smooth resolution.<br>
  
  Thank you for your attention to this matter. We appreciate your cooperation and look forward to receiving your payment soon.</div>`));

  const newInvoice = await Invoice.findOne({ where: { randoId: id } })
  return successResponse(res, "Successful", newInvoice);
}
