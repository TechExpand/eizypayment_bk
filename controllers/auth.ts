
import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';
import { Op, where } from "sequelize";
import { UserState, UserStatus, Users } from "../models/Users";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { compareTwoStrings } from 'string-similarity';
const cloudinary = require("cloudinary").v2;
// yarn add stream-chat
import { StreamChat } from 'stream-chat';
import config, { mainUrlBitnob } from '../config/configSetup';
import { Verify } from "../models/Verify";
// import { sendEmailResend } from "../services/sms";
import { templateEmail } from "../config/template";
import { sendFcmNotification, sendEmail } from "../services/notification";
import axios from "axios";
import { Tokens } from "../models/Token";
import { UserTokens } from "../models/UserToken";
import { AvatarGenerator } from 'random-avatar-generator';
import { ServiceType, TransactionStatus, TransactionType, Transactions } from "../models/Transaction";
import { Invoice } from "../models/Invoice";
import { Wallet } from "../models/Wallet";

const generator = new AvatarGenerator();


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
  await sendEmail(email, "Eisy App otp code",
    templateEmail("Eisy Payment otp code", `<div> Your Verification code is: ${codeEmail} <div/>`));
  return successResponse(res, "Successful", {
    status: true,
    emailServiceId
  })
};





export const verifyOtp = async (req: Request, res: Response) => {
  const { emailServiceId, emailCode, type } = req.body;


  console.log(emailServiceId)
  const verifyEmail = await Verify.findOne({
    where: {
      serviceId: emailServiceId
    }
  })

  if (verifyEmail) {
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
      message: `Invalid ${"Email"} Code`,
      status: false
    })
  }

}






export const register = async (req: Request, res: Response) => {
  const { email, fullname, password, fcmToken, countryCode, phone } = req.body;
  const [firstName, lastName] = fullname.split(' ');
  axios({
    method: 'POST',
    url: `https://${mainUrlBitnob}.bitnob.co/api/v1/customers`,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${config.BITNOM}`
    },
    data: {
      email: email,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      countryCode: countryCode
    }
  }).then(function (response) {
    console.log(response.data);

    hash(password, saltRounds, async function (err, hashedPassword) {
      const userEmail = await Users.findOne({ where: { email } })
      if (!validateEmail(email)) return errorResponse(res, "Enter a valid email")


      const user = await Users.create({
        bitnumData: response.data.data,
        fcmToken,
        email, fullname, password: hashedPassword, customerId: "", avater: generator.generateRandomAvatar("https://avataaars.io/?avatarStyle=Circle&topType=WinterHat4&accessoriesType=Blank&hatColor=Heather&facialHairType=BeardMajestic&facialHairColor=Red&clotheType=ShirtScoopNeck&clotheColor=Blue01&eyeType=Surprised&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Brown")
      })

      const emailServiceId = randomId(12);
      const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
      await Verify.create({
        serviceId: emailServiceId,
        code: codeEmail,
        client: email,
        secret_key: createRandomRef(12, "eizyapp",),
      })
      await sendEmail(email, "Eisy Payment otp code", templateEmail("Eisy Payment otp code", `<div> Your Verification code is: ${codeEmail} <div/>`));
      //  sendEmailResend(email, codeEmail.toString());
      let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
      const wallet = await Wallet.create({
        userId: user.id
      });
      await user.update({ walletId: wallet.id })
      const tokens = await Tokens.findAll({
        limit: 6,
        order: [
          ['createdAt', 'DESC']
        ],
      },)
      tokens.reverse()
      let insertData: any = [];
      tokens.forEach((e: any) => {
        console.log(e.dataValues.id)
        insertData.push({ tokenId: e.id, userId: user.id })
      })

      await UserTokens.bulkCreate(insertData)
      return successResponse(res, "Successful", {

        email, fullname, token, emailServiceId

      })

    }
    );
  }).catch(async function (error) {
    console.error(email);
    console.log("error")
    const userEmail = await Users.findOne({ where: { email } })
    if (userEmail?.state === UserState.VERIFIED) {
      if (userEmail) return errorResponse(res, "Email already exist", { state: userEmail.state })
    } else {
      const emailServiceId = randomId(12);
      const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
      await Verify.create({
        serviceId: emailServiceId,
        code: codeEmail,
        client: email,
        secret_key: createRandomRef(12, "eizyapp",),
      })
      await sendEmail(email, "Eisy Payment otp code", templateEmail("Eszy Payment otp code", `<div> Your Verification code is: ${codeEmail} <div/>`));

      let token = sign({ id: userEmail!.id, email: userEmail!.email }, TOKEN_SECRET);

      return successResponse(res, "Successful", {

        email, fullname, token, emailServiceId

      })

    }

  });




}






export const login = async (req: Request, res: Response) => {
  let { email, password, fcmToken } = req.body;
  const user = await Users.findOne({ where: { email } })
  if (!user) return errorResponse(res, "User does not exist")
  const match = await compare(password, user.password)
  if (!match) return errorResponse(res, "Invalid Credentials",)
  let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
  await user.update({ fcmToken })
  return successResponse(res, "Successful", { ...user.dataValues, token })
}




export const updateUser = async (req: Request, res: Response) => {
  let { fullname, fcmToken } = req.body;
  let { id } = req.user;
  const user = await Users.findOne({ where: { id } })
  if (!user) return errorResponse(res, "Failed", { status: false, message: "User does not exist" })

  if (req.files) {
    let uploadedImageurl = []
    for (var file of req.files as any) {
      const result = await cloudinary.uploader.upload(file.path.replace(/ /g, "_"))
      uploadedImageurl.push(result.secure_url)
    }
    await user.update({ avater: uploadedImageurl[0] })
    const updatedUser = await Users.findOne({ where: { id } })
    return successResponse(res, "Successful", updatedUser)
  } else {
    await user.update({ fullname: fullname == null || fullname == "" ? user.fullname : fullname, fcmToken })
    const updatedUser = await Users.findOne({ where: { id } })
    return successResponse(res, "Successful", updatedUser)
  }
}



export const getUser = async (req: Request, res: Response) => {
  let { id } = req.user;
  const user = await Users.findOne({
    where: { id },
    include: [{
      model: UserTokens,
      include: [{ model: Tokens }]
    }, { model: Wallet }]
  })
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
  // const { id } = req.user;
  // const { invoiceId } = req.query;
  // const invoice = await Invoice.findOne({ where: { randoId: invoiceId } })

  // const user = await Users.findOne({ where: { id } })


  // const token = await Tokens.findOne({ where: { symbol: invoice?.symbol } })
  // const creditedToken = await UserTokens.findOne({ where: { tokenId: token?.id } })

  // await creditedToken?.update({ balance: (Number(creditedToken?.balance) + Number(100)) })

  // await Transactions.create({
  //   ref: createRandomRef(8, "txt"),
  //   description: `You Recieved an Invoice Payment of $${100} Successfully`,
  //   title: "Invoice Payment Successful",
  //   type: TransactionType.CREDIT,
  //   service: ServiceType.INVOICE,
  //   amount: 100,
  //   status: TransactionStatus.COMPLETE,
  //   mata: invoice,
  //   userId: id
  // })

  // await sendFcmNotification("Invoice Payment Successful", {
  //   description: `You Recieved an Invoice Payment of Successfully`,
  //   title: "Invoice Payment Successful",
  //   type: TransactionType.CREDIT,
  //   service: ServiceType.INVOICE,
  //   mata: {
  //     invoice: {}, token: {
  //       title: "symbol",
  //       tokenId: "symbol",
  //       id: "symbol",
  //       currency: "symbol",
  //       amount: "symbol",
  //       icon: "symbol"
  //     }
  //   },
  // }, user!.fcmToken)
  return successResponse(res, "Successful")
};





