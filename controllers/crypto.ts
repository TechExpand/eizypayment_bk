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
import { sendFcmNotification, sendEmail, sendEmailWithdraw } from "../services/notification";
import { PaymentRequests, TypeState } from "../models/Payment";
import { ServiceType, TransactionStatus, TransactionType, Transactions } from "../models/Transaction";
import { templateEmail } from "../config/template";
const fs = require("fs");
const axios = require('axios')






export const createAddress = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { type } = req.body;
    try {
        const user = await Users.findOne({ where: { id } })
        if (type === "USDC") {
            const response = await axios({
                method: 'POST',
                url: 'https://sandboxapi.bitnob.co/api/v1/addresses/generate/usdc',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${config.BITNOM}`
                },
                data: { chain: 'TRX', customerEmail: user?.email, label: "Eisy Global USDC Wallet" }
            })
            console.log(response)
            return successResponse(res, "Successful",  response.data.data);
        } else {
            const response = await axios({
                method: 'POST',
                url: 'https://sandboxapi.bitnob.co/api/v1/addresses/generate/usdt',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${config.BITNOM}`
                },
                data: { chain: 'TRX', customerEmail: user?.email, label: "Eisy Global USDT Wallet" }
            })
            console.log(response)
            return successResponse(res, "Successful", response.data.data);
        }


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





// export const fetchCustomer = async (req: Request, res: Response) => {
//     const { id } = req.user;
//     const customer = await Customers.findAll({
//         where: { userId: id }, order: [
//             ['createdAt', 'DESC']
//         ],
//     })
//     return successResponse(res, "Successful", customer);
// }




// export const deleteCustomer = async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const customer = await Customers.findOne({ where: { id } })
//     if (!customer) return successResponse(res, "Customer not found");
//     await customer?.destroy()
//     return successResponse(res, "Successful");
// }


