

import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';


// yarn add stream-chat
import { Transactions } from "../models/Transaction";
import { Admin } from "../models/Admin";
import { Tokens } from "../models/Token";
const fs = require("fs");
const axios = require('axios')





export const fetchFirstSixTransactions = async (req: Request, res: Response) => {
    const { id } = req.user;
    const transactions = await Transactions.findAll({
        where: { userId: id },
        limit: 6,
        order: [
            ['createdAt', 'DESC'],
        ],
    })
    return successResponse(res, "Successful", transactions);
}



export const fetchTransactions = async (req: Request, res: Response) => {
    const { id } = req.user;
    const transactions = await Transactions.findAll({
        where: { userId: id },
        limit: 6,
        order: [
            ['createdAt', 'DESC'],
        ],
    })
    return successResponse(res, "Successful", transactions);
}




export const fetchAdmin = async (req: Request, res: Response) => {
    let coinList: any[] = []
    const admins = await Admin.findOne({})
    const token = await Tokens.findAll({})
    const response = await axios({
        method: 'GET',
        url: `https://api.coinranking.com/v2/coins`,
        headers: { 'Content-Type': 'application/json' },
    })

    token.forEach((e) => {
        if (e.currency == "BAT") {

        } else if (e.currency == "BUSD") {
            const coinObjectTemp = response.data.data.coins.find((obj: any) => obj.symbol == "USDT");
            coinList.push({ symbol: "BUSD", price: coinObjectTemp.price })
        }
        else {
            const coinObjectTemp = response.data.data.coins.find((obj: any) => obj.symbol == e.currency);
            coinList.push({ symbol: coinObjectTemp.symbol, price: coinObjectTemp.price })
        }

    })

    return successResponse(res, "Successful", { admins, coinList });
}
