

import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';


// yarn add stream-chat
import { Transactions } from "../models/Transaction";
const fs = require("fs");
const axios = require('axios')





export const fetchFirstSixTransactions = async (req: Request, res: Response) => {
    const { id } = req.user;
    const transactions = await Transactions.findAll({
        where: { userId: id },
        limit: 6,
        order: [
            ['id', 'DESC'],
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
            ['id', 'DESC'],
        ],
    })
    return successResponse(res, "Successful", transactions);
}

