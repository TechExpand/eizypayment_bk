

import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, validateEmail } from "../../helpers/utility";
import { Request, Response } from 'express';
import { Op, where } from "sequelize";

// yarn add stream-chat
import { StreamChat } from 'stream-chat';
import { Sequelize } from "sequelize-typescript";
import { templateEmail } from "../../config/template";
import { Tokens } from "../../models/Token";
// import { templateEmail } from ".";
const fs = require("fs");
const axios = require('axios')




export const createToken = async (req: Request, res: Response) => {
    const { currency, symbol, url } = req.body;
    const available = await Tokens.findOne({ where: { symbol } })
    if (available) return successResponse(res, "Currency already exist");
    const token = await Tokens.create({
        currency, symbol, url
    })
    return successResponse(res, "Successful", token);
}



export const deleteToken = async (req: Request, res: Response) => {
    const { id } = req.params;
    const token = await Tokens.findOne({
        where: { id }
    })
    await token?.destroy();
    return successResponse(res, "Deleted");
}


export const fetchTokens = async (req: Request, res: Response) => {
    const token = await Tokens.findAll({
        limit: 6,
        order: [
            ['createdAt', 'DESC']
        ],
    },)
    return successResponse(res, "Successful", token.reverse());
}