
import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';
import { Op, where } from "sequelize";
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
import { sendEmail } from "../services/sms";
import { PaymentRequests, TypeState } from "../models/Payment";
const fs = require("fs");
const axios = require('axios')




export const createInvoice = async (req: Request, res: Response) => {
  const { id } = req.user;
  const { lineItems, overdueAt, network, customerId, token } = req.body;
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
      organizationId: response.data[0].organizationId,
      seller: response.data[0].seller,
      customer: response.data[0].customer,
      gateway: response.data[0].gateway,
      products: response.data[0].products,
      lineItems: response.data[0].lineItems,
      issuedAt: response.data[0].issuedAt,
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
    await sendEmail(invoice?.customer.name, "Invoice", `<div>invoice sent</div>`);
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
  const invoice = await Invoice.findAll({ where: { userId: id } })
  return successResponse(res, "Successful", invoice);

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




export const webhook = async (req: Request, res: Response) => {
  const body = req.body;
  if (req.headers["radom-verification-key"] != config.VERIFICATIONKEY) {
    return res.sendStatus(401)
  }



  console.log(util.inspect(req.body, false, null, true /* enable colors */))

  if (body.eventType == "managedPayment") {
    if (body.radomData.invoice) {
      const invoice = await Invoice.findOne({ where: { randoId: body.radomData.invoice.invoiceId } })
      if (!invoice) return res.sendStatus(200)
      if (invoice?.processed) return res.sendStatus(200)
      const response = await axios({
        method: 'GET',
        url: `https://api.radom.network/invoice/${body.radomData.invoice.invoiceId}`,
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
      const newInvoice = await Invoice.findOne({ where: { randoId: body.radomData.invoice.invoiceId } })
      // let formattedJson = JSON.parse(JSON.stringify(newInvoice?.dataValues.payment))
      let formattedJson = JSON.parse(JSON.stringify(newInvoice?.payment))
      let finalFormattedJson = JSON.parse(formattedJson)
      let token = finalFormattedJson.managed.conversionRates[0].to

      let amountToCredit = body.eventData.managedPayment.amount
      let getToken = await Tokens.findOne({ where: { currency: token } })
      if (getToken) {
        const userToken = await UserTokens.findOne({ where: { tokenId: getToken.id, userId: invoice?.userId } })
        const user = await Users.findOne({ where: { id: invoice?.userId } })
        if (userToken) {
          await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
          await invoice.update({ processed: true })
          await sendEmail(data.customer!.email, "Payment Successful", `<div>invoice paid by you</div>`);
          await sendEmail(user!.email, "Payment Successful", `<div>invoice paid</div>`);
          return res.sendStatus(200)
        } else {
          const userToken = await UserTokens.create({ tokenId: getToken.id, userId: invoice?.userId })
          await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
          await sendEmail(data.customer!.email, "Payment Successful", `<div>invoice sent</div>`);
          await sendEmail(user!.email, "Payment Successful", `<div>invoice paid</div>`);
          await invoice.update({ processed: true })
          return res.sendStatus(200)
        }
      } else {

        const response = await axios({
          method: 'GET',
          url: `https://api.coinranking.com/v2/coins`,
          headers: { 'Content-Type': 'application/json' },
        })

        const coinObject = response.data.data.coins.find((obj: any) => obj.symbol == token);

        let getToken = await Tokens.create({
          currency: token,
          symbol: token,
          url: coinObject.iconUrl

        })

        const userToken = await UserTokens.create({ tokenId: getToken.id, userId: invoice?.userId })
        await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
        await invoice.update({ processed: true })
        const user = await Users.findOne({ where: { id: invoice?.userId } })
        await sendEmail(data.customer!.email, "Payment Successful", `<div>invoice paid by you</div>`);
        await sendEmail(user!.email, "Payment Successful", `<div>invoice paid</div>`);
        return res.sendStatus(200)
      }
    }
    else if (body.radomData.paymentLink) {
      const request = await PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } })
      if (!request) return res.sendStatus(200)
      if (request?.processed) return res.sendStatus(200)
      const response = await axios({
        method: 'GET',
        url: `https://api.radom.network/payment_link/${body.radomData.paymentLink.paymentLinkId}`,
        headers: { 'Content-Type': 'application/json', Authorization: `${config.RADON}` },
      })
      const data = JSON.parse(JSON.stringify(response.data))
      await request!.update({
        organizationId: data.organizationId,
        url: data.url,
        sellerName: data.sellerName,
        sellerLogoUrl: data.sellerLogoUrl,
        cancelUrl: data.cancelUrl,
        successUrl: data.successUrl,
        products: data.products,
        gateway: data.gateway
      })
      const newRequest = await PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } })
      let token = request.symbol
      let amountToCredit = body.eventData.managedPayment.amount
      if (request.type == TypeState.PAYMENT_LINK) {
        let getToken = await Tokens.findOne({ where: { currency: token } })
        if (getToken) {
          const userToken = await UserTokens.findOne({ where: { tokenId: getToken.id, userId: newRequest?.userId } })
          if (userToken) {
            await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
            await newRequest!.update({ processed: true })
            const user = await Users.findOne({ where: { id: newRequest?.userId } })
            await sendEmail(newRequest!.email, "Payment Successful", `<div>invoice paid by you</div>`);
            await sendEmail(user!.email, "Payment Successful", `<div>invoice paid</div>`);
            return res.sendStatus(200)
          } else {
            const userToken = await UserTokens.create({ tokenId: getToken.id, userId: newRequest?.userId })
            await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
            await newRequest!.update({ processed: true })
            const user = await Users.findOne({ where: { id: newRequest?.userId } })
            await sendEmail(newRequest!.email, "Payment Successful", `<div>invoice paid by you</div>`);
            await sendEmail(user!.email, "Payment Successful", `<div>invoice paid</div>`);
            return res.sendStatus(200)
          }
        } else {

          const response = await axios({
            method: 'GET',
            url: `https://api.coinranking.com/v2/coins`,
            headers: { 'Content-Type': 'application/json' },
          })

          const coinObject = response.data.data.coins.find((obj: any) => obj.symbol == token);

          let getToken = await Tokens.create({
            currency: token,
            symbol: token,
            url: coinObject.iconUrl

          })

          const userToken = await UserTokens.create({ tokenId: getToken.id, userId: newRequest?.userId })
          await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
          await newRequest!.update({ processed: true })
          const user = await Users.findOne({ where: { id: newRequest?.userId } })
          await sendEmail(newRequest!.email, "Payment Successful", `<div>invoice paid by you</div>`);
          await sendEmail(user!.email, "Payment Successful", `<div>invoice paid</div>`);
          return res.sendStatus(200)
        }
      } else {
        let getToken = await Tokens.findOne({ where: { currency: token } })
        if (getToken) {
          const userToken = await UserTokens.findOne({ where: { tokenId: getToken.id, userId: newRequest?.userId } })
          if (userToken) {
            await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
            await newRequest!.update({ targetReached: Number(newRequest?.targetReached) + Number(amountToCredit) })
            const newRequestLatest = await PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } })
            await newRequestLatest!.update({ processed: Number(newRequestLatest?.targetReached) >= Number(newRequestLatest?.target) ? true : false })
            const user = await Users.findOne({ where: { id: newRequest?.userId } })
            Number(newRequestLatest?.targetReached) >= Number(newRequestLatest?.target) ?
              await sendEmail(user!.email, "Crowdfund Goal Reached", `<div>invoice paid</div>`) :
              await sendEmail(user!.email, "Crowdfund Payment Successful", `<div>invoice paid</div>`);
            return res.sendStatus(200)
          } else {
            const userToken = await UserTokens.create({ tokenId: getToken.id, userId: newRequest?.userId })
            await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
            await newRequest!.update({ targetReached: Number(newRequest?.targetReached) + Number(amountToCredit) })
            const newRequestLatest = await PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } })
            await newRequestLatest!.update({ processed: Number(newRequestLatest?.targetReached) >= Number(newRequestLatest?.target) ? true : false })
            const user = await Users.findOne({ where: { id: newRequest?.userId } })
            Number(newRequestLatest?.targetReached) >= Number(newRequestLatest?.target) ?
              await sendEmail(user!.email, "Crowdfund Goal Reached", `<div>invoice paid</div>`) :
              await sendEmail(user!.email, "Crowdfund Payment Successful", `<div>invoice paid</div>`);
            return res.sendStatus(200)
          }
        } else {

          const response = await axios({
            method: 'GET',
            url: `https://api.coinranking.com/v2/coins`,
            headers: { 'Content-Type': 'application/json' },
          })

          const coinObject = response.data.data.coins.find((obj: any) => obj.symbol == token);

          let getToken = await Tokens.create({
            currency: token,
            symbol: token,
            url: coinObject.iconUrl

          })

          const userToken = await UserTokens.create({ tokenId: getToken.id, userId: newRequest?.userId })
          await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
          await newRequest!.update({ targetReached: Number(newRequest?.targetReached) + Number(amountToCredit) })
          const newRequestLatest = await PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } })
          await newRequestLatest!.update({ processed: Number(newRequestLatest?.targetReached) >= Number(newRequestLatest?.target) ? true : false })
          const user = await Users.findOne({ where: { id: newRequest?.userId } })
          Number(newRequestLatest?.targetReached) >= Number(newRequestLatest?.target) ?
            await sendEmail(user!.email, "Crowdfund Goal Reached", `<div>invoice paid</div>`) :
            await sendEmail(user!.email, "Crowdfund Payment Successful", `<div>invoice paid</div>`);
          return res.sendStatus(200)
        }
      }

    }
    else {
      return res.sendStatus(200)
    }
  } else if (body.eventType == "managedWithdrawal") {
    const withdrawal = await Withdrawal.findOne({ where: { randoId: body.eventData.managedWithdrawal.withdrawalRequestId } })
    if (!withdrawal) return res.sendStatus(200)
    if (withdrawal?.processed) return res.sendStatus(200)
    await withdrawal?.update({
      status: body.eventData.managedWithdrawal.isSuccess == true ? WithdrawalStatus.COMPLETE : WithdrawalStatus.FAILED,
      reason: body.eventData.managedWithdrawal.failureReason, processed: true
    })
    const user = await Users.findOne({ where: { id: withdrawal?.userId } })
    await sendEmail(user!.email, "Withdrawal Successful", `<div>recieved by you</div>`);
    return res.sendStatus(200)
  }
  else {
    return res.sendStatus(200)
  }
}




export const updateInvoiceStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const invoice = await Invoice.findOne({ where: { randoId: id } })
  await invoice!.update({
    paidAt: new Date().toISOString,
    status: "paid",
    processed: true
  })
  const newInvoice = await Invoice.findOne({ where: { randoId: id } })
  return successResponse(res, "Successful", newInvoice);
}





export const sendInvoiceReminder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const invoice = await Invoice.findOne({ where: { randoId: id } })
  await sendEmail(invoice?.customer.name, "Invoice Reminder", `<div>invoice reminder</div>`);
  const newInvoice = await Invoice.findOne({ where: { randoId: id } })
  return successResponse(res, "Successful", newInvoice);
}
