
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
const fs = require("fs");
const axios = require('axios')




export const createInvoice = async (req: Request, res: Response) => {
  const { id } = req.user;
  const { lineItems, overdueAt, network, customerId, token } = req.body;
  const user = await Users.findOne({ where: { id } })
  console.log(util.inspect({
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
  }, false, null, true /* enable colors */))

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



  // console.log(util.inspect(req.body, false, null, true /* enable colors */))

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
      // let yy = JSON.parse(y)
      // console.log(typeof yy)
      console.log(typeof formattedJson)
      // console.log(yy)
      console.log(finalFormattedJson)
      let token = finalFormattedJson.managed.conversionRates[0].to

      let amountToCredit = body.eventData.managedPayment.amount
      let getToken = await Tokens.findOne({ where: { currency: token } })
      if (getToken) {
        const userToken = await UserTokens.findOne({ where: { tokenId: getToken.id, userId: invoice?.userId } })
        if (userToken) {
          await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
          await invoice.update({ processed: true })
          return res.sendStatus(200)
        } else {
          const userToken = await UserTokens.create({ tokenId: getToken.id, userId: invoice?.userId })
          await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
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
        return res.sendStatus(200)

      }



    } else {
      return res.sendStatus(200)
    }
  } else {
    return res.sendStatus(200)
  }
}
