

import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';
import { Op, where } from "sequelize";
import { UserState, UserStatus, Users } from "../models/Users";
import { compare, hash } from "bcryptjs"
import config from '../config/configSetup';;
import { sign } from "jsonwebtoken";
import { compareTwoStrings } from 'string-similarity';

// yarn add stream-chat
import { StreamChat } from 'stream-chat';
import { Sequelize } from "sequelize-typescript";
import { Verify } from "../models/Verify";
import { sendEmail } from "../services/sms";
import { templateEmail } from "../config/template";
import { Tokens } from "../models/Token";
import { Customers } from "../models/Customers";
import { UserTokens } from "../models/UserToken";
import { Withdrawal } from "../models/Withdrawal";
import { PaymentRequests, TypeState } from "../models/Payment";
const fs = require("fs");
const util = require('util')
const axios = require('axios')






export const createCrowdFund= async (req: Request, res: Response) => {
    const { id } = req.user;
    const { description, target, network, currency, token, symbol } = req.body;

    try {
        const response1 = await axios({
            method: 'POST',
            url: 'https://api.radom.com/product/create',
            headers: { 'Content-Type': 'application/json', Authorization: `${config.RADON}` },
            data: {
                name: "Payment request",
                description: description,
                // chargingIntervalSeconds: 0,
                currency,
                addOns: [{ name: description, price: target }],
                price: target,
                // meteredBudget: 0,
                // meteredChargingInterval: 0,
                // isInventoried: true,
                quantity: 1,
                // allowanceDuration: 0,
                // sendSubscriptionEmails: false
            }
        })


        const response = await axios({
            method: 'POST',
            url: 'https://api.radom.com/payment_link/create',
            headers: { 'Content-Type': 'application/json', Authorization: `${config.RADON}` },
            data: {
                products: [response1.data.id],
                gateway: {
                    managed: { methods: [{ network: network, token: token, discountPercentOff: 0 }] }
                },

                successUrl: 'https://www.youtube.com/',
                cancelUrl: 'https://www.youtube.com/',

                sendEmailReceipt: false,
                chargeCustomerNetworkFee: true
            }
        })


        // console.log(util.inspect(response.data, false, null, true /* enable colors */))
        const crowdFund = await PaymentRequests.create({
            randoId: response.data.id,
            organizationId: response.data.organizationId,
            url: response.data.url,
            sellerName: response.data.sellerName,
            sellerLogoUrl: response.data.sellerLogoUrl,
            cancelUrl: response.data.cancelUrl,
            successUrl: response.data.successUrl,
            products: response.data.products,
            gateway: response.data.gateway,
            symbol,
            userId: id,
            target,
            type: TypeState.CROWD_FUND
        })
        return successResponse(res, "Successful", crowdFund);
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





export const fetchCrowdFund = async (req: Request, res: Response) => {
    const { id } = req.user;
    const request = await PaymentRequests.findAll({ where: { userId: id , type: TypeState.CROWD_FUND} })
    return successResponse(res, "Successful", request);

}




export const fetchSignleCrowdFund = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await Users.findOne({ where: { id } })
    const request = await PaymentRequests.findOne({ where: { randoId: id } })
    try {
        const response = await axios({
            method: 'GET',
            url: `https://api.radom.network/payment_link/${id}`,
            headers: { 'Content-Type': 'application/json', Authorization: `${config.RADON}` },
        })
        const data = JSON.parse(JSON.stringify(response.data))
        await request!.update({
            randoId: data.id,
            organizationId: data.organizationId,
            url: data.url,
            sellerName: data.sellerName,
            sellerLogoUrl: data.sellerLogoUrl,
            cancelUrl: data.cancelUrl,
            successUrl: data.successUrl,
            products: data.products,
            gateway: data.gateway,
            userId: id
        })
        const newRequest = await PaymentRequests.findOne({ where: { randoId: id } })
        return successResponse(res, "Successful", data);
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
