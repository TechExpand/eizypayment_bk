

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
const fs = require("fs");
const axios = require('axios')




export const createCustomer = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { email, fullname } = req.body;
    try {
        const response = await axios({
            method: 'POST',
            url: 'https://api.radom.network/customer',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${config.RADON}`
            },
            data: {
                "name": fullname,
                "email": email
            }
        })
        console.log(response.data);
        const customer = await Customers.create({
            randoId: response.data.id,
            email: response.data.email,
            name: response.data.name,
            billingAddress: response.data.billingAddress,
            phone: response.data.phone,
            telegram: response.data.telegram,
            discord: response.data.discord,
            userId: id
        })
        return successResponse(res, "Successful", customer);
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





export const fetchCustomer = async (req: Request, res: Response) => {
    const { id } = req.user;
    const customer = await Customers.findAll({ where: { userId: id } })
    return successResponse(res, "Successful", customer);
}




export const deleteCustomer = async (req: Request, res: Response) => {
    const { id } = req.params;
    const customer = await Customers.findOne({ where: { id } })
    if (!customer) return successResponse(res, "Customer not found");
    await customer?.destroy()
    return successResponse(res, "Successful");
}

