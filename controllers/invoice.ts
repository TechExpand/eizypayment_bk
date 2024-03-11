
import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';
import { Op, where } from "sequelize";
import { UserState, UserStatus, Users } from "../models/Users";
import { compare, hash } from "bcryptjs"
import config from '../config/configSetup';
import network from "../config/network.json";
import { sign } from "jsonwebtoken";
import { compareTwoStrings } from 'string-similarity';

// yarn add stream-chat
const util = require('util')
import { Invoice } from "../models/Invoice";
import { Tokens } from "../models/Token";
import { UserTokens } from "../models/UserToken";
const fs = require("fs");
const axios = require('axios')




export const createInvoice = async (req: Request, res: Response) => {
  const { id } = req.user;
  const { lineItems, overdueAt, network, customerId } = req.body;
  const user = await Users.findOne({ where: { id } })
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://api.radom.network/invoice',
      headers: { 'Content-Type': 'application/json', Authorization: `${config.RADON}` },
      data: {
        customerIds: [customerId],
        products: [
          // {
          //   product: {
          //     id: '497f6eca-6276-4993-bfeb-53cbbbba6f08',
          //     name: 'string',
          //     description: 'string',
          //     organizationId: '7bc05553-4b68-44e8-b7bc-37be63c6d9e9',
          //     addOns: [{ id: '497f6eca-6276-4993-bfeb-53cbbbba6f08', name: 'string', price: 0 }],
          //     chargingIntervalSeconds: 0,
          //     currency: 'USD',
          //     price: 0,
          //     imageUrl: 'string',
          //     createdAt: '2019-08-24T14:15:22Z',
          //     updatedAt: '2019-08-24T14:15:22Z',
          //     isInventoried: true,
          //     quantity: 0,
          //     isArchived: true,
          //     meteredBudget: 0,
          //     meteredChargingInterval: 0,
          //     allowanceDuration: 0,
          //     sendSubscriptionEmails: true
          //   },
          //   quantity: 0
          // }
        ],
        lineItems: lineItems,
        overdueAt: new Date(overdueAt).toISOString(),
        inputData: [{
          "key": "name",
          "value": user?.email
        }],
        memo: null,
        gateway: {
          managed: { methods: [{ network, token: null, discountPercentOff: null }] }
        }
      }
    })
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
    await invoice!.update({
      organizationId: response.data.organizationId,
      seller: response.data.seller,
      customer: response.data.customer,
      gateway: response.data.gateway,
      products: response.data.products,
      lineItems: response.data.lineItems,
      issuedAt: response.data.issuedAt,
      paidAt: response.data.paidAt,
      voidedAt: response.data.voidedAt,
      overdueAt: response.data.overdueAt,
      inputData: response.data.inputData,
      status: response.data.status,
      memo: response.data.memo,
      url: response.data.url,
      payment: response.data.payment,
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
  return successResponse(res, "Successful", network);

}




export const webhook = async (req: Request, res: Response) => {
  const body = req.body;
  if (req.headers["radom-verification-key"] != config.VERIFICATIONKEY) {
    return res.sendStatus(401)
  }



  console.log(util.inspect(req.body, false, null, true /* enable colors */))

  if (body.eventType == "managedPayment") {
    if (body.radomData.invoice) {
      const invoice = await Invoice.findOne({ where: { id: body.radomData.invoice.invoiceId } })
      const response = await axios({
        method: 'GET',
        url: `https://api.radom.network/invoice/${body.radomData.invoice.invoiceId}`,
        headers: { 'Content-Type': 'application/json', Authorization: `${config.RADON}` },
      })
      await invoice!.update({
        organizationId: response.data.organizationId,
        seller: response.data.seller,
        customer: response.data.customer,
        gateway: response.data.gateway,
        products: response.data.products,
        lineItems: response.data.lineItems,
        issuedAt: response.data.issuedAt,
        paidAt: response.data.paidAt,
        voidedAt: response.data.voidedAt,
        overdueAt: response.data.overdueAt,
        inputData: response.data.inputData,
        status: response.data.status,
        memo: response.data.memo,
        url: response.data.url,
        payment: response.data.payment,
      })
      const newInvoice = await Invoice.findOne({ where: { randoId: body.radomData.invoice.invoiceId } })
      let token = newInvoice?.payment.managed.conversionRates[0].to
      let amountToCredit = body.radomData.managedPayment.amount
      let getToken = await Tokens.findOne({ where: { currency: token } })
      if (getToken) {
        const userToken = await UserTokens.findOne({ where: { tokenId: getToken.id, userId: invoice?.userId } })
        if (userToken) {
          await userToken.update({ balance: amountToCredit })
          res.sendStatus(200)
        } else {
          const userToken = await UserTokens.create({ tokenId: getToken.id, userId: invoice?.userId })
          await userToken.update({ balance: amountToCredit })
          res.sendStatus(200)
        }
      } else {
        const response = await axios({
          method: 'GET',
          url: `https://api.coinranking.com/v2/coins`,
          headers: { 'Content-Type': 'application/json' },
        })
        const coinObject = response.data.coins.find((obj: any) => obj.symbol == token);

        let getToken = await Tokens.create({
          currency: token,
          symbol: token,
          url: coinObject.iconUrl

        })
        const userToken = await UserTokens.findOne({ where: { tokenId: getToken.id, userId: invoice?.userId } })
        if (userToken) {
          await userToken.update({ balance: amountToCredit })
          res.sendStatus(200)
        } else {
          const userToken = await UserTokens.create({ tokenId: getToken.id, userId: invoice?.userId })
          await userToken.update({ balance: amountToCredit })
          res.sendStatus(200)
        }
      }



    } else {
      res.sendStatus(200)
    }
  } else {
    res.sendStatus(200)
  }
}
