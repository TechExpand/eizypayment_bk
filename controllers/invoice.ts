
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
          "label": "name",
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
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.radom.network/invoice/${id}`,
      headers: { 'Content-Type': 'application/json', Authorization: `${config.RADON}` },
    })
    console.log(response.data);
    return successResponse(res, "Successful", response.data);
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

  res.sendStatus(200)
}
