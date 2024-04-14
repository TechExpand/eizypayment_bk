

import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';
import { Op, Transaction, where } from "sequelize";
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
import { Transactions } from "../models/Transaction";
const fs = require("fs");
const axios = require('axios')





export const fetchTransactions = async (req: Request, res: Response) => {
    const { id } = req.user;
    const transactions = await Transactions.findAll({ where: { userId: id } })
    return successResponse(res, "Successful", transactions);

}

