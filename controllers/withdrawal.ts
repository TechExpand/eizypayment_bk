

import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successFalseResponse, successResponse, validateEmail } from "../helpers/utility";
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
import { sendEmail, sendEmailWithdraw } from "../services/notification";
import { templateEmail } from "../config/template";
import { Tokens } from "../models/Token";
import { Customers } from "../models/Customers";
import { UserTokens } from "../models/UserToken";
import { WithdrawTypeState, Withdrawal } from "../models/Withdrawal";
import { Banks } from "../models/Bank";
const fs = require("fs");
const axios = require('axios')
const WAValidator = require('multicoin-address-validator');




export const createWithdrawal = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { network, token, amount, withdrawalAddress, symbol } = req.body;
    console.log({
        network,
        token: token == "-" ? null : token,
        amount,
        withdrawalAddress,
        withdrawalAccountId: null
    })
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
                    token: token == "-" ? null : token,
                    amount,
                    withdrawalAddress,
                    withdrawalAccountId: null
                }
            })
            console.log(response.data)



            await userToken.update({ balance: (Number(userToken.balance) - Number(amount)) })


            const response2 = await axios({
                method: 'GET',
                url: 'https://api.radom.network/withdrawal',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${config.RADON}`
                },
            })

            // await sendEmailWithdraw("", "Withdrawal Request", `<div>recieved by you</div>`);
            const withdrawal = await Withdrawal.create({
                randoId: response2.data[0].id,
                network,
                token,
                symbol,
                amount,
                type: WithdrawTypeState.CRYPTO,
                withdrawalAddress,
                userTokenId: userToken?.id,
                userId: id
            })
            return successResponse(res, "Successful", withdrawal);
        } else {
            return errorResponse(res, "Insuffient funds");
        }


    } catch (error: any) {
        console.log(error)
        if (axios.isAxiosError(error)) {
            return successResponse(res, "Failed", error.response.data);
            // Do something with this error...
        } else {
            console.error(error);
            return successResponse(res, "Failed", error);
        }
    }
}





export const createBank = async (req: Request, res: Response) => {
    const { id } = req.user;
    console.log("ddddd")
    const { accountName, bankName, accountNumber } = req.body;
    const bank = await Banks.create({
        accountName,
        bankName,
        bankAccount: accountNumber,
        userId: id
    })
    return successResponse(res, "Successful", bank);
}



export const fetchBank = async (req: Request, res: Response) => {
    const { id } = req.user;
    const bank = await Banks.findAll({
        where: { userId: id },
        order: [
            ['createdAt', 'DESC']
        ],
    })
    // console.log(bank)
    return successResponse(res, "Successful", bank);
}


export const createWithdrawalCash = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { network, token, amount, bank, symbol } = req.body;

    const tokens = await Tokens.findOne({ where: { symbol } })
    if (!tokens) return errorResponse(res, "Token Not found");
    const userToken = await UserTokens.findOne({ where: { tokenId: tokens?.id, userId: id } })
    if (!userToken) return errorResponse(res, "User Token Not found");

    const response = await axios({
        method: 'GET',
        url: `https://api.coinranking.com/v2/coins`,
        headers: { 'Content-Type': 'application/json' },
    })

    const coinObjectTemp = response.data.data.coins.find((obj: any) => symbol == "BAT" ?
        obj.symbol == "USDC" : symbol == "BUSD" ?
            obj.symbol == "USDC" : obj.symbol == symbol);
    const convertedAmount = ((Number(amount)) / Number(coinObjectTemp.price))

    if (userToken?.balance >= convertedAmount) {

        sendEmailWithdraw("", "Withdrawal Request Approval", "review withdrawal from admin dashboard")

        await userToken.update({ balance: (Number(userToken.balance) - Number(convertedAmount)) })

        const withdrawal = await Withdrawal.create({
            randoId: "",
            network,
            token,
            symbol,
            type: WithdrawTypeState.P2P,
            amount: convertedAmount,
            bank,
            userTokenId: userToken?.id,
            userId: id
        })
        return successResponse(res, "Successful", withdrawal);
    } else {
        return errorResponse(res, "Insuffient funds");
    }


}





export const fetchWithdrawal = async (req: Request, res: Response) => {
    const { id } = req.user;
    const withdrawal = await Withdrawal.findAll({
        where: { userId: id }, order: [
            ['createdAt', 'DESC']
        ],
    })
    return successResponse(res, "Successful", withdrawal);
}


export const confirmAddress = async (req: Request, res: Response) => {
    const { address, crypto } = req.query
    const valid = WAValidator.validate(address, crypto?.toString().toLowerCase(), 'testnet');
    if (valid) {
        console.log('This is a valid address');
        return successResponse(res, `This is a valid ${crypto} address`);
    } else {
        console.log('Address INVALID');
        return successFalseResponse(res, `This is an invalid ${crypto} address`);
    }
}

// export const deleteCustomer = async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const customer = await Customers.findOne({ where: { id } })
//     if (!customer) return successResponse(res, "Customer not found");
//     await customer?.destroy()
//     return successResponse(res, "Successful");
// }

