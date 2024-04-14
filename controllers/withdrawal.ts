

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
import { sendEmail } from "../services/notification";
import { templateEmail } from "../config/template";
import { Tokens } from "../models/Token";
import { Customers } from "../models/Customers";
import { UserTokens } from "../models/UserToken";
import { Withdrawal } from "../models/Withdrawal";
const fs = require("fs");
const axios = require('axios')




export const createWithdrawal = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { network, token, amount, withdrawalAddress, symbol } = req.body;
    try {
        const tokens = await Tokens.findOne({ where: { symbol } })
        if (!tokens) return errorResponse(res, "Token Not found");
        const userToken = await UserTokens.findOne({ where: { tokenId: tokens?.id, userId: id } })
        if (!userToken) return errorResponse(res, "User Token Not found");

        if (userToken?.balance >= amount) {
            const response = await axios({
                method: 'POST',
                url: 'https://api.radom.network/withdrawal',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${config.RADON}`
                },
                data: {
                    network,
                    token,
                    amount,
                    withdrawalAddress,
                    withdrawalAccountId: null
                }
            })



            await userToken.update({ balance: (Number(userToken.balance) - Number(amount)) })


            const response2 = await axios({
                method: 'GET',
                url: 'https://api.radom.network/withdrawal',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${config.RADON}`
                },
            })
            console.log(response2.data)

            const withdrawal = await Withdrawal.create({
                randoId: response2.data[0].id,
                network,
                token,
                symbol,
                amount,
                withdrawalAddress,
                userTokenId: userToken?.id,
                userId: id
            })
            return successResponse(res, "Successful", withdrawal);
        } else {
            return errorResponse(res, "Insuffient funds");
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





export const fetchWithdrawal = async (req: Request, res: Response) => {
    const { id } = req.user;
    const withdrawal = await Withdrawal.findAll({ where: { userId: id } })
    return successResponse(res, "Successful", withdrawal);
}




// export const deleteCustomer = async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const customer = await Customers.findOne({ where: { id } })
//     if (!customer) return successResponse(res, "Customer not found");
//     await customer?.destroy()
//     return successResponse(res, "Successful");
// }

