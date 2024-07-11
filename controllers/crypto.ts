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
import { Card } from "../models/Card";
import { Wallet } from "../models/Wallet";
import { WithdrawTypeState, Withdrawal } from "../models/Withdrawal";
import { sendEmailWithdraw } from "../services/notification";
const fs = require("fs");
const axios = require('axios')







export const createAddress = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { type } = req.query;
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
            return successResponse(res, "Successful", response.data.data);
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
            return errorResponse(res, "Failed", error);
            // Do something with this error...
        } else {
            console.error(error);
            return errorResponse(res, "Failed", error);
        }
    }
}



export const userKyc = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { idType, phoneNumber, idNumber, city, state, country,
        zipCode, line1, houseNumber, idImage, bvn, userPhoto, dateOfBirth } = req.body;
    // BVN, NIN, PASSPORT
    try {
        const user = await Users.findOne({ where: { id } })
        const [firstName, lastName] = user!.fullname.split(" ");
        const response = await axios({
            method: 'POST',
            url: 'https://sandboxapi.bitnob.co/api/v1/virtualcards/registercarduser',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${config.BITNOM}`
            },
            data: {
                customerEmail: user?.email,
                idNumber,
                idType,
                firstName,
                lastName,
                phoneNumber,
                city,
                state,
                country,
                zipCode,
                line1,
                houseNumber,
                idImage,
                bvn,
                userPhoto,
                dateOfBirth

            }
        })
        await user?.update({ kycComplete: true })
        return successResponse(res, "Successful", response.data.data);
    } catch (error: any) {
        return errorResponse(res, error.response.data.message.toString().replace("[", "").replace("]", ""));
    }
}


export const createCard = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { type } = req.body;
    // BVN, NIN, PASSPORT


    const user = await Users.findOne({ where: { id } })
    const [firstName, lastName] = user!.fullname.split(" ");
    try {
        const response = await axios({
            method: 'POST',
            url: 'https://sandboxapi.bitnob.co/api/v1/virtualcards/create',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${config.BITNOM}`
            },
            data: {
                cardBrand: type,
                cardType: 'virtual',
                reference: randomId(8),
                amount: 200,
                firstName: firstName,
                lastName: lastName,
                customerEmail: user?.email
            }
        })
        await Card.create(
            {
                meta: response.data.data,
                cardId: response.data.data.id,
                userId: user!.id
            }

        )
        return successResponse(res, "Successful", response.data.data);
    } catch (error: any) {
        return errorResponse(res, error.response.data.message);
    }


}



export const fetchAllCard = async (req: Request, res: Response) => {
    const { id } = req.user;
    const card = await Card.findAll(
        {
            where: {
                userId: id,
            }
        }
    )
    return successResponse(res, "Successful", card);
}



export const fetchCard = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { cardId } = req.query;
    // BVN, NIN, PASSPORT
    try {
        const response = await axios(
            {
                method: 'GET',
                url: `https://sandboxapi.bitnob.co/api/v1/virtualcards/cards/${cardId}`,
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${config.BITNOM}`
                }

            })
        const card = await Card.findOne(
            {
                where: {
                    cardId,
                }
            }

        )
        await card?.update({ meta: response.data.data })
        return successResponse(res, "Successful", response.data.data);

    } catch (error: any) {

        return errorResponse(res, error.response.data.message);
    }
}



export const cardTransaction = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { cardId } = req.query;
    // BVN, NIN, PASSPORT
    try {
        const response = await axios(
            {
                method: 'GET',
                url: `https://sandboxapi.bitnob.co/api/v1/virtualcards/cards/${cardId}/transactions`,
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${config.BITNOM}`
                }

            })
        return successResponse(res, "Successful", response.data.data);
    } catch (error: any) {

        return errorResponse(res, error.response.data.message);
    }
}





export const topUpCard = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { cardId, amount } = req.body;
    try {
        const user = await Users.findOne({ where: { id } })
        const wallet = await Wallet.findOne({ where: { userId: user?.id } })
        if (Number(wallet?.balance) >= Number(amount)) {
            const response = await axios({
                method: 'POST',
                url: 'https://sandboxapi.bitnob.co/api/v1/virtualcards/topup',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${config.BITNOM}`
                },
                data: {
                    cardId,
                    reference: randomId(8),
                    amount: Number(amount) * 100,
                }
            })
            await wallet?.update({ balance: Number(wallet.balance) - Number(amount) })
            return successResponse(res, "Successful", response.data.data);
        } else {
            return errorResponse(res, "Insufficient Funds in Wallet");
        }

    } catch (error: any) {
        return errorResponse(res, error.response.data.message);
    }
}





export const withdrawCard = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { cardId, amount } = req.body;
    // BVN, NIN, PASSPORT
    try {
        const user = await Users.findOne({ where: { id } })
        const wallet = await Wallet.findOne({ where: { userId: user?.id } })
        const response = await axios({
            method: 'POST',
            url: 'https://sandboxapi.bitnob.co/api/v1/virtualcards/withdraw',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${config.BITNOM}`
            },
            data: {
                cardId,
                reference: randomId(8),
                amount: Number(amount) * 100,
            }
        })
        await wallet?.update({ balance: Number(wallet.balance) + Number(amount) })
        return successResponse(res, "Successful", response.data.data);
    } catch (error: any) {
        return errorResponse(res, error.response.data.message);
    }
}



export const freezeCard = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { cardId } = req.body;
    // BVN, NIN, PASSPORT
    try {
        const response = await axios({
            method: 'POST',
            url: `https://sandboxapi.bitnob.co/api/v1/virtualcards/freeze`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${config.BITNOM}`
            },
            data: {
                cardId,
            }
        })
        const card = await Card.findOne({ where: { cardId } })
        await card?.update({ freeze: true })
        return successResponse(res, "Successful", response.data.data);
    } catch (error: any) {
        return errorResponse(res, error.response.data.message);
    }
}



export const unfreezeCard = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { cardId } = req.body;
    // BVN, NIN, PASSPORT
    try {
        const response = await axios({
            method: 'POST',
            url: `https://sandboxapi.bitnob.co/api/v1/virtualcards/unfreeze`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${config.BITNOM}`
            },
            data: {
                cardId
            }
        })
        const card = await Card.findOne({ where: { cardId } })
        await card?.update({ freeze: true })
        return successResponse(res, "Successful", response.data.data);
    } catch (error: any) {
        return errorResponse(res, error.response.data.message);
    }
}



export const sendUsdt = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { amount, address } = req.body;
    const user = await Users.findOne({ where: { id } })
    const wallet = await Wallet.findOne({ where: { userId: user?.id } })
    // BVN, NIN, PASSPORT
    try {
        if (Number(wallet?.balance) >= Number(amount)) {
            const response = await axios({
                method: 'POST',
                url: `https://sandboxapi.bitnob.co/api/v1/wallets/send-usdt`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${config.BITNOM}`
                },
                data: {
                    reference: randomId(8),
                    amount: Number(amount) * 100,
                    description: "usdt withdrawal",
                    address,
                    chain: "TRX",
                    customerEmail: user?.email
                }
            })

            const wallet = await Wallet.findOne({ where: { userId: user?.id } })
            await wallet?.update({ balance: Number(wallet.balance) - Number(amount) })
            const withdrawal = await Withdrawal.create({
                randoId: "",
                network:
                    "TRX",
                token: "USDT",
                symbol: "USDT",
                amount,
                type: WithdrawTypeState.CRYPTO,
                withdrawalAddress: address,
                // userTokenId: ,
                userId: id
            })

            return successResponse(res, "Successful", response.data.data);
        }

        else {
            return errorResponse(res, "Insufficient Funds in Wallet");
        }
    } catch (error: any) {
        return errorResponse(res, error.response.data.message);
    }
}



export const sendUsdc = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { amount, address, description } = req.body;
    // BVN, NIN, PASSPORT
    const user = await Users.findOne({ where: { id } })
    const wallet = await Wallet.findOne({ where: { userId: user?.id } })
    try {
        if (Number(wallet?.balance) >= Number(amount)) {

            const response = await axios({
                method: 'POST',
                url: `https://sandboxapi.bitnob.co/api/v1/wallets/send-usdc`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${config.BITNOM}`
                },
                data: {
                    reference: randomId(8),
                    amount: Number(amount) * 100,
                    description,
                    address,
                    chain: "TRX",
                    customerEmail: user?.email
                }
            })
            const wallet = await Wallet.findOne({ where: { userId: user?.id } })
            await wallet?.update({ balance: Number(wallet.balance) - Number(amount) })
            const withdrawal = await Withdrawal.create({
                randoId: "",
                network:
                    "TRX",
                token: "USDT",
                symbol: "USDT",
                amount,
                type: WithdrawTypeState.CRYPTO,
                withdrawalAddress: address,
                // userTokenId: ,
                userId: id
            })
            return successResponse(res, "Successful", response.data.data);
        }

        else {
            return errorResponse(res, "Insufficient Funds in Wallet");
        }
    } catch (error: any) {
        return errorResponse(res, error.response.data.message);
    }
}




export const withdrawBank = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { amount, address, bank } = req.body;
    const user = await Users.findOne({ where: { id } })
    const wallet = await Wallet.findOne({ where: { userId: user?.id } })
    // BVN, NIN, PASSPORT
    try {
        if (Number(wallet?.balance) >= Number(amount)) {
            sendEmailWithdraw("", "Withdrawal Request Approval", "review withdrawal from admin dashboard")
            const withdrawal = await Withdrawal.create({
                randoId: "",
                network:
                    "USDT",
                token: "USDT",
                symbol: "USDT",
                amount,
                card: true,
                type: WithdrawTypeState.P2P,
                bank,
                withdrawalAddress: address,
                userId: id
            })
            const wallet = await Wallet.findOne({ where: { userId: user?.id } })
            await wallet?.update({ balance: Number(wallet.balance) - Number(amount) })
            return successResponse(res, "Successful", withdrawal);
        }
        else {
            return errorResponse(res, "Insufficient Funds in Wallet");
        }
    } catch (error: any) {
        return errorResponse(res, error);
    }
}


