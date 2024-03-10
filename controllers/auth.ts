
import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';
import { Op, where } from "sequelize";
import { UserState, UserStatus, Users } from "../models/Users";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { compareTwoStrings } from 'string-similarity';
import config from '../config/configSetup';
// yarn add stream-chat
import { StreamChat } from 'stream-chat';
import { Sequelize } from "sequelize-typescript";
import { Verify } from "../models/Verify";
// import { sendEmailResend } from "../services/sms";
import { templateEmail } from "../config/template";
import { sendEmail } from "../services/sms";
import axios from "axios";
import { Tokens } from "../models/Token";
import { UserTokens } from "../models/UserToken";


// instantiate your stream client using the API key and secret
// the secret is only used server side and gives you full access to the API
const serverClient = StreamChat.getInstance('zzfb7h72xhc5',
  '5pfxakc5zasma3hw9awd2qsqgk2fxyr4a5qb3au4kkdt27d7ttnca7vnusfuztud');
// you can still use new StreamChat('api_key', 'api_secret');

// generate a token for the user with id 'john'





export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  const emailServiceId = randomId(12);
  const codeEmail = String(Math.floor(1000 + Math.random() * 9000));

  await Verify.create({
    serviceId: emailServiceId,
    code: codeEmail,
    client: email,
    secret_key: createRandomRef(12, "eizyapp",),
  })
  console.log(codeEmail)
  await sendEmail(email, "Eizy App otp code", templateEmail("OTP CODE", codeEmail.toString()));
  return successResponse(res, "Successful", {
    status: true,
    emailServiceId
  })
};





export const verifyOtp = async (req: Request, res: Response) => {
  const { emailServiceId, emailCode, type } = req.body;



  const verifyEmail = await Verify.findOne({
    where: {
      serviceId: emailServiceId
    }
  })

  if (

    verifyEmail) {
    if (verifyEmail.code === emailCode) {


      const verifyEmailResult = await Verify.findOne({ where: { id: verifyEmail.id } })
      const user = await Users.findOne({ where: { email: verifyEmailResult?.client } })
      console.log(user?.dataValues)
      await user?.update({ state: UserState.VERIFIED })
      await verifyEmailResult?.destroy()
      return successResponse(res, "Successful", {
        message: "successful",
        status: true
      })

    } else {
      errorResponse(res, "Failed", {
        message: `Invalid ${"Email"} Code`,
        status: false
      })
    }
  } else {
    errorResponse(res, "Failed", {
      message: `${"Email"} Code Already Used`,
      status: false
    })
  }

}






export const register = async (req: Request, res: Response) => {
  const { email, fullname, password } = req.body;
  hash(password, saltRounds, async function (err, hashedPassword) {
    const userEmail = await Users.findOne({ where: { email } })
    if (!validateEmail(email)) return errorResponse(res, "Failed", { status: false, message: "Enter a valid email" })
    if (userEmail) {
      if (userEmail?.state === UserState.VERIFIED) {
        if (userEmail) return errorResponse(res, "Failed", { status: false, message: "Email already exist", state: userEmail.state })
      } else {
        await userEmail?.destroy();

        const user = await Users.create({
          email, fullname, password: hashedPassword, customerId: ""
        })
        const emailServiceId = randomId(12);
        const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
        await Verify.create({
          serviceId: emailServiceId,
          code: codeEmail,
          client: email,
          secret_key: createRandomRef(12, "eizyapp",),
        })
        await sendEmail(email, "Eizy Payment otp code", templateEmail("OTP CODE", codeEmail.toString()));

        let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
        const tokens = await Tokens.findAll({
          limit: 6,
        },)
        tokens.reverse()
        let insertData: any = [];
        tokens.every((e: any) => {
          insertData.push({ tokenId: e.id, userId: user.id })
        })

        await UserTokens.bulkCreate(insertData)
        return successResponse(res, "Successful", {
          status: true,
          message: {
            email, fullname, token, emailServiceId
          }
        })

      }
    } else {

      const user = await Users.create({
        email, fullname, password: hashedPassword, customerId: ""
      })
      const emailServiceId = randomId(12);
      const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
      await Verify.create({
        serviceId: emailServiceId,
        code: codeEmail,
        client: email,
        secret_key: createRandomRef(12, "eizyapp",),
      })
      await sendEmail(email, "Eizy Payment otp code", templateEmail("OTP CODE", codeEmail.toString()));
      //  sendEmailResend(email, codeEmail.toString());
      let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
      const tokens = await Tokens.findAll({
        limit: 6,
      },)
      tokens.reverse()
      let insertData: any = [];
      tokens.forEach((e: any) => {
        console.log(e.dataValues.id)
        insertData.push({ tokenId: e.id, userId: user.id })
      })

      await UserTokens.bulkCreate(insertData)
      return successResponse(res, "Successful", {
        status: true,
        message: {
          email, fullname, token, emailServiceId
        }
      })

    }
  });
}






export const login = async (req: Request, res: Response) => {
  let { email, password } = req.body;
  const user = await Users.findOne({ where: { email } })
  if (!user) return errorResponse(res, "Failed", { status: false, message: "User does not exist" })
  const match = await compare(password, user.password)
  if (!match) return errorResponse(res, "Failed", { status: false, message: "Invalid Credentials" })
  let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
  return successResponse(res, "Successful", { status: true, message: { ...user.dataValues, token } })
}




export const updateUser = async (req: Request, res: Response) => {
  let { fullname } = req.body;
  let { id } = req.user;
  const user = await Users.findOne({ where: { id } })
  if (!user) return errorResponse(res, "Failed", { status: false, message: "User does not exist" })
  await user.update({ fullname })
  const updatedUser = await Users.findOne({ where: { id } })
  return successResponse(res, "Successful", updatedUser)
}



export const getUser = async (req: Request, res: Response) => {
  let { id } = req.user;
  const user = await Users.findOne({ where: { id }, include: [{ model: UserTokens, include: [{ model: Tokens }] }] })
  return successResponse(res, "Successful", user)
}



export const changePassword = async (req: Request, res: Response) => {
  const { password, email } = req.body;

  hash(password, saltRounds, async function (err, hashedPassword) {
    const user = await Users.findOne({ where: { email } });
    user?.update({ password: hashedPassword })
    let token = sign({ id: user!.id, email: user!.email, admin: true }, TOKEN_SECRET);
    return successResponse(res, "Successful", { ...user?.dataValues, token })
  });
};



export const testApi = async (req: Request, res: Response) => {
  return successResponse(res, "Successful")
};





