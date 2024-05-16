
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
import { Invoice } from "../models/Invoice";
import { Tokens } from "../models/Token";
import { UserTokens } from "../models/UserToken";
import { parseJsonText } from "typescript";
import { Withdrawal, WithdrawalStatus } from "../models/Withdrawal";
import { sendFcmNotification, sendEmail, sendEmailWithdraw } from "../services/notification";
import { PaymentRequests, TypeState } from "../models/Payment";
import { ServiceType, TransactionStatus, TransactionType, Transactions } from "../models/Transaction";
import { templateEmail } from "../config/template";
const fs = require("fs");
const axios = require('axios')




export const createInvoice = async (req: Request, res: Response) => {
  const { id } = req.user;
  const { lineItems, overdueAt, network, customerId, token, subTotal, symbol, business, title, invoiceNo, invoiceDate, noteHidden, noteVisible } = req.body;
  const user = await Users.findOne({ where: { id } })

  try {
    const response = await axios({
      method: 'POST',
      url: 'https://api.radom.network/invoice',
      headers: { 'Content-Type': 'application/json', Authorization: `${config.RADON}` },
      data: {
        customerIds: [customerId],
        products: [],
        lineItems: lineItems,
        overdueAt: new Date(overdueAt).toISOString(),
        inputData: [{
          "key": "name",
          "value": user?.email
        }],
        memo: null,
        gateway: {
          managed: { methods: [{ network, token, discountPercentOff: null }] }
        }
      }
    })

    console.log(util.inspect(response.data, false, null, true /* enable colors */))
    const invoice = await Invoice.create({
      randoId: response.data[0].id,
      title,
      invoiceNo,
      business,
      subTotal,
      network,
      symbol,
      note: noteVisible,
      organizationId: response.data[0].organizationId,
      seller: response.data[0].seller,
      customer: response.data[0].customer,
      gateway: response.data[0].gateway,
      products: response.data[0].products,
      lineItems: response.data[0].lineItems,
      issuedAt: new Date(invoiceDate).toISOString(),
      noteHidden,
      noteVisible,
      paidAt: response.data[0].paidAt,
      voidedAt: response.data[0].voidedAt,
      overdueAt: response.data[0].overdueAt,
      inputData: response.data[0].inputData,
      status: response.data[0].status,
      memo: response.data[0].memo,
      url: response.data[0].url,
      payment: response.data[0].payment,
      userId: id
    })
    await sendEmail(invoice?.customer.email, "Invoice", templateEmail("Invoice", `<div>An Invoice was sent to you from ${invoice.customer.email}.
    <br> Click the link below to view the invoice<br>
    <a href=https://eizypayment-bk.onrender.com/invoice?id=${invoice.randoId}> VIEW INVOICE <a/>
    </div>`));
    return successResponse(res, "Successful", invoice);
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





export const fetchInvoice = async (req: Request, res: Response) => {
  const { id } = req.user;
  const invoice = await Invoice.findAll({
    where: { userId: id }, order: [
      ['createdAt', 'DESC']
    ],
  })
  console.log(invoice);
  return successResponse(res, "Successful", invoice);

}




export const fetchSignleInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await Users.findOne({ where: { id } })
  const invoice = await Invoice.findOne({ where: { randoId: id } })
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.radom.network/invoice/${id}`,
      headers: { 'Content-Type': 'application/json', Authorization: `${config.RADON}` },
    })
    const data = JSON.parse(JSON.stringify(response.data))
    await invoice!.update({
      organizationId: data.organizationId,
      seller: data.seller,
      customer: data.customer,
      gateway: data.gateway,
      products: data.products,
      lineItems: data.lineItems,
      issuedAt: data.issuedAt,
      paidAt: data.paidAt,
      voidedAt: data.voidedAt,
      overdueAt: data.overdueAt,
      inputData: data.inputData,
      status: data.status,
      memo: data.memo,
      url: data.url,
      payment: data.payment,
    })
    const newInvoice = await Invoice.findOne({ where: { randoId: id } })
    return successResponse(res, "Successful", newInvoice);
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



export const fetchAllNetwork = async (req: Request, res: Response) => {
  const { type } = req.query
  return successResponse(res, "Successful", type == "TESTNET" ? testnet : mainnet);

}



export const webhookMoonPay = async (req: Request, res: Response) => {
  const data = req.body;
  // data.data.status === "completed"
  const invoice = await Invoice.findOne({ where: { randoId: data.data.externalTransactionId } })
  if (invoice?.processedForFiat == false) {
    if (data.data.status === "completed") {
      console.log("update invoice on successful")
      console.log("success...")

      const user = await Users.findOne({ where: { id: invoice?.userId } })
      await invoice?.update({ status: "PROCESSING", processedForFiat: true })
    
      const customerInfo = JSON.parse(invoice!.customer)

      await sendEmail(customerInfo.email, "Invoice Payment Confirmation - Eisy Global",
        templateEmail("Invoice Payment Confirmation - Eisy Global", `<div>
      This is an automated message to confirm that your invoice #${invoice?.invoiceNo} has been received and is being processed by Eisy Global.<br><br>
      Invoice Details:<br><br>
      Invoice Number: ${invoice?.invoiceNo} <br>
      Amount: ${invoice?.subTotal}<br>
      Invoice Date: ${invoice!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>

      We hope this transaction meets your expectations, and we're here to assist you with any further inquiries or assistance you may require.<br>

      Thank you for choosing our service, and we look forward to serving you again in the future.</div>`));


      await sendEmail(user!.email, "Invoice Payment Confirmation - Eisy Global",
        templateEmail("Invoice Payment Confirmation - Eisy Global", `<div>
  This is an automated message to confirm that your invoice #${invoice?.invoiceNo} has been received and is being processed by Eisy Global.<br><br>
  Invoice Details:<br><br>
  Invoice Number: ${invoice?.invoiceNo} <br>
  Amount: ${invoice?.subTotal}<br>
  Invoice Date: ${invoice!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>
  
  We hope this transaction meets your expectations, and we're here to assist you with any further inquiries or assistance you may require.<br>
  
  Thank you for choosing our service, and we look forward to serving you again in the future.</div>`));


      await sendFcmNotification("Invoice Payment Processing", {
        description: `Invoice payment for #${invoice?.invoiceNo} has been received and is being processed by Eisy Global.`,
        title: "Invoice Payment Processing",
        type: TransactionType.CREDIT,
        mata: {

        },
        service: ServiceType.WITHDRAWAL,
      }, user!.fcmToken)

      sendEmailWithdraw("", "Invoice Payment Processing", "Review Invoice Payment Fiat Payment")

      res.status(200).json({ status: 'success' });
    } else {
      console.log("update invoice on failed")
      console.log("failed...")

      res.status(200).json({ status: 'success' });
    }
  } else {
    console.log("already proceesed")
    console.log("processed...")

    res.status(200).json({ status: 'success' });
  }

}



export const webhook = async (req: Request, res: Response) => {
  const body = req.body;
  if (req.headers["radom-verification-key"] != config.VERIFICATIONKEY) {
    return res.sendStatus(401)
  }



  console.log(util.inspect(req.body, false, null, true /* enable colors */))

  if (body.eventType == "managedPayment") {
    if (body.radomData.invoice) {
      const invoice = await Invoice.findOne({ where: { randoId: body.radomData.invoice.invoiceId } })
      if (!invoice) return res.sendStatus(200)
      if (invoice?.processed) return res.sendStatus(200)
      const response = await axios({
        method: 'GET',
        url: `https://api.radom.network/invoice/${body.radomData.invoice.invoiceId}`,
        headers: { 'Content-Type': 'application/json', Authorization: `${config.RADON}` },
      })
      const data = JSON.parse(JSON.stringify(response.data))
      await invoice!.update({
        organizationId: data.organizationId,
        seller: data.seller,
        customer: data.customer,
        gateway: data.gateway,
        products: data.products,
        lineItems: data.lineItems,
        issuedAt: data.issuedAt,
        paidAt: data.paidAt,
        voidedAt: data.voidedAt,
        overdueAt: data.overdueAt,
        inputData: data.inputData,
        status: data.status,
        memo: data.memo,
        url: data.url,
        payment: data.payment,
      })
      const newInvoice = await Invoice.findOne({ where: { randoId: body.radomData.invoice.invoiceId } })
      // let formattedJson = JSON.parse(JSON.stringify(newInvoice?.dataValues.payment))
      let formattedJson = JSON.parse(JSON.stringify(newInvoice?.payment))
      let finalFormattedJson = JSON.parse(formattedJson)
      let token = finalFormattedJson.managed.conversionRates[0].to

      let amountToCredit = body.eventData.managedPayment.amount
      let getToken = await Tokens.findOne({ where: { currency: token } })
      if (getToken) {
        const userToken = await UserTokens.findOne({ where: { tokenId: getToken.id, userId: invoice?.userId } })
        const user = await Users.findOne({ where: { id: invoice?.userId } })
        if (userToken) {

          await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
          await invoice.update({ processed: true })


          const tokenX = await Tokens.findOne({ where: { symbol: invoice?.symbol } })
          const creditedToken = await UserTokens.findOne({ where: { tokenId: tokenX?.id } })

          await Transactions.create({
            ref: createRandomRef(8, "txt"),
            description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
            title: "Invoice Payment Successful",
            type: TransactionType.CREDIT,
            service: ServiceType.INVOICE,
            amount: amountToCredit,
            status: TransactionStatus.COMPLETE,
            mata: invoice,
            userId: invoice?.userId
          })
          await sendFcmNotification("Invoice Payment Successful", {
            description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
            title: "Invoice Payment Successful",
            type: TransactionType.CREDIT,
            service: ServiceType.INVOICE,
            mata: {
              invoice: { ...invoice?.dataValues }, token: {
                title: tokenX?.dataValues.symbol,
                tokenId: tokenX?.dataValues.id,
                id: creditedToken?.dataValues.id,
                currency: tokenX?.dataValues.currency,
                amount: creditedToken?.dataValues.balance,
                icon: tokenX?.dataValues.url
              }
            },
          }, user!.fcmToken)
          await sendEmail(data.customer!.email, `Payment Received for Invoice ${invoice.randoId}`,
            templateEmail(`Payment Received for Invoice ${invoice.randoId}`, `<div>We are pleased to inform you that we have successfully received your payment for the invoice ${invoice.randoId}. Your prompt action is greatly appreciated.<br>

          Here are the details of your payment:<br><br>
          
          Invoice Number: ${invoice.randoId}<br>
          Amount Received: ${amountToCredit}<br>
          Payment Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          Thank you for your timely settlement. Your cooperation is essential in maintaining smooth business operations.<br><br>
    
          Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
          
          </div>`));
          await sendEmail(user!.email, `Payment Received for Invoice ${invoice.randoId}`,
            templateEmail(`Payment Received for Invoice ${invoice.randoId}`, `<div>We are pleased to inform you that ${invoice.customer.name} successfully paid for your invoice ${invoice.randoId}.<br>

          Here are the details of the payment:<br><br>
          
          Invoice Number: ${invoice.randoId}<br>
          Amount Received: ${amountToCredit}<br>
          Payment Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          Your cooperation is essential in maintaining smooth business operations.<br><br>
    
          Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
          
          </div>`)

          );
          return res.sendStatus(200)
        } else {
          const userToken = await UserTokens.create({ tokenId: getToken.id, userId: invoice?.userId })
          await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })

          const tokenX = await Tokens.findOne({ where: { symbol: invoice?.symbol } })
          const creditedToken = await UserTokens.findOne({ where: { tokenId: tokenX?.id } })


          await Transactions.create({
            ref: createRandomRef(8, "txt"),
            description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
            title: "Invoice Payment Successful",
            type: TransactionType.CREDIT,
            service: ServiceType.INVOICE,
            amount: amountToCredit,
            status: TransactionStatus.COMPLETE,
            mata: invoice,
            userId: invoice?.userId
          })
          await sendFcmNotification("Invoice Payment Successful", {
            description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
            title: "Invoice Payment Successful",
            type: TransactionType.CREDIT,
            mata: {
              invoice: { ...invoice?.dataValues }, token: {
                title: tokenX?.dataValues.symbol,
                tokenId: tokenX?.dataValues.id,
                id: creditedToken?.dataValues.id,
                currency: tokenX?.dataValues.currency,
                amount: creditedToken?.dataValues.balance,
                icon: tokenX?.dataValues.url
              }
            },
            service: ServiceType.INVOICE,
          }, user!.fcmToken)


          await sendEmail(data.customer!.email, `Payment Received for Invoice ${invoice.randoId}`,
            templateEmail(`Payment Received for Invoice ${invoice.randoId}`, `<div>We are pleased to inform you that we have successfully received your payment for the invoice ${invoice.randoId}. Your prompt action is greatly appreciated.<br>

          Here are the details of your payment:<br><br>
          
          Invoice Number: ${invoice.randoId}<br>
          Amount Received: ${amountToCredit}<br>
          Payment Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          Thank you for your timely settlement. Your cooperation is essential in maintaining smooth business operations.<br><br>
    
          Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
          
          </div>`));
          await sendEmail(user!.email, `Payment Received for Invoice ${invoice.randoId}`,
            templateEmail(`Payment Received for Invoice ${invoice.randoId}`, `<div>We are pleased to inform you that ${invoice.customer.name} successfully paid for your invoice ${invoice.randoId}.<br>

          Here are the details of the payment:<br><br>
          
          Invoice Number: ${invoice.randoId}<br>
          Amount Received: ${amountToCredit}<br>
          Payment Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          Your cooperation is essential in maintaining smooth business operations.<br><br>
    
          Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
          
          </div>`)

          );
          await invoice.update({ processed: true })
          return res.sendStatus(200)
        }
      } else {

        const response = await axios({
          method: 'GET',
          url: `https://api.coinranking.com/v2/coins`,
          headers: { 'Content-Type': 'application/json' },
        })

        const coinObject = response.data.data.coins.find((obj: any) => obj.symbol == token);

        let getToken = await Tokens.create({
          currency: token,
          symbol: token,
          url: coinObject.iconUrl

        })

        const userToken = await UserTokens.create({ tokenId: getToken.id, userId: invoice?.userId })
        await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
        await invoice.update({ processed: true })
        const user = await Users.findOne({ where: { id: invoice?.userId } })

        const tokenX = await Tokens.findOne({ where: { symbol: invoice?.symbol } })
        const creditedToken = await UserTokens.findOne({ where: { tokenId: tokenX?.id } })

        await Transactions.create({
          ref: createRandomRef(8, "txt"),
          description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
          title: "Invoice Payment Successful",
          type: TransactionType.CREDIT,
          service: ServiceType.INVOICE,
          amount: amountToCredit,
          status: TransactionStatus.COMPLETE,
          mata: invoice,
          userId: invoice?.userId
        })
        await sendFcmNotification("Invoice Payment Successful", {
          description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
          title: "Invoice Payment Successful",
          type: TransactionType.CREDIT,
          service: ServiceType.INVOICE,
          mata: {
            invoice: { ...invoice?.dataValues },
            token: {
              title: tokenX?.dataValues.symbol,
              tokenId: tokenX?.dataValues.id,
              id: creditedToken?.dataValues.id,
              currency: tokenX?.dataValues.currency,
              amount: creditedToken?.dataValues.balance,
              icon: tokenX?.dataValues.url
            }
          },
        }, user!.fcmToken)
        await sendEmail(data.customer!.email, `Payment Received for Invoice ${invoice.randoId}`,
          templateEmail(`Payment Received for Invoice ${invoice.randoId}`, `<div>We are pleased to inform you that we have successfully received your payment for the invoice ${invoice.randoId}. Your prompt action is greatly appreciated.<br>

      Here are the details of your payment:<br><br>
      
      Invoice Number: ${invoice.randoId}<br>
      Amount Received: ${amountToCredit}<br>
      Payment Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
      Thank you for your timely settlement. Your cooperation is essential in maintaining smooth business operations.<br><br>

      Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
      
      </div>`));
        await sendEmail(user!.email, `Payment Received for Invoice ${invoice.randoId}`,
          templateEmail(`Payment Received for Invoice ${invoice.randoId}`, `<div>We are pleased to inform you that ${invoice.customer.name} successfully paid for your invoice ${invoice.randoId}.<br>

      Here are the details of the payment:<br><br>
      
      Invoice Number: ${invoice.randoId}<br>
      Amount Received: ${amountToCredit}<br>
      Payment Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
      Your cooperation is essential in maintaining smooth business operations.<br><br>

      Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
      
      </div>`)

        );

        return res.sendStatus(200)
      }
    }
    else if (body.radomData.paymentLink) {
      const request = await PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } })
      if (!request) return res.sendStatus(200)
      if (request?.processed) return res.sendStatus(200)
      const response = await axios({
        method: 'GET',
        url: `https://api.radom.network/payment_link/${body.radomData.paymentLink.paymentLinkId}`,
        headers: { 'Content-Type': 'application/json', Authorization: `${config.RADON}` },
      })
      const data = JSON.parse(JSON.stringify(response.data))
      await request!.update({
        organizationId: data.organizationId,
        url: data.url,
        sellerName: data.sellerName,
        sellerLogoUrl: data.sellerLogoUrl,
        cancelUrl: data.cancelUrl,
        successUrl: data.successUrl,
        products: data.products,
        gateway: data.gateway
      })
      const newRequest = await PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } })
      let token = request.symbol
      let amountToCredit = body.eventData.managedPayment.amount
      if (request.type == TypeState.PAYMENT_LINK) {
        let getToken = await Tokens.findOne({ where: { currency: token } })
        if (getToken) {
          const userToken = await UserTokens.findOne({ where: { tokenId: getToken.id, userId: newRequest?.userId } })
          if (userToken) {
            await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
            await newRequest!.update({ processed: true })
            const user = await Users.findOne({ where: { id: newRequest?.userId } })


            const tokenX = await Tokens.findOne({ where: { symbol: getToken?.symbol } })
            const creditedToken = await UserTokens.findOne({ where: { tokenId: tokenX?.id } })

            await Transactions.create({
              ref: createRandomRef(8, "txt"),
              description: `You Recieved a Payment Request of ${tokenX?.symbol} ${amountToCredit} Successfully`,
              title: "Payment Request Paid Successfully",
              type: TransactionType.CREDIT,
              service: ServiceType.PAYMENT_REQUEST,
              amount: amountToCredit,
              status: TransactionStatus.COMPLETE,
              mata: newRequest,
              userId: newRequest?.userId
            })
            await sendFcmNotification("Payment Request Paid Successfully", {
              description: `You Recieved a Payment Request of ${tokenX?.symbol} ${amountToCredit} Successfully`,
              title: "Payment Request Paid Successfully",
              type: TransactionType.CREDIT,
              mata: {
                token: {
                  title: tokenX?.dataValues.symbol,
                  tokenId: tokenX?.dataValues.id,
                  id: creditedToken?.dataValues.id,
                  currency: tokenX?.dataValues.currency,
                  amount: creditedToken?.dataValues.balance,
                  icon: tokenX?.dataValues.url
                }
              },
              service: ServiceType.PAYMENT_REQUEST,
            }, user!.fcmToken)
            await sendEmail(data.customer!.email, `Payment Received for Request ${newRequest!.randoId}`,
              templateEmail(`Payment Received for Request ${newRequest!.randoId}`, `<div>We are pleased to inform you that we have successfully received your payment for the request ${newRequest!.randoId}. Your prompt action is greatly appreciated.<br>

          Here are the details of your payment:<br><br>
          
          Request Number: ${newRequest!.randoId}<br>
          Amount Received: ${tokenX?.symbol} ${amountToCredit}<br>
          Payment Date: ${newRequest!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          Thank you for your timely settlement. Your cooperation is essential in maintaining smooth business operations.<br><br>
    
          Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
          
          </div>`));
            await sendEmail(user!.email, `Payment Received for Request ${newRequest!.randoId}`,
              templateEmail(`Payment Received for Request ${newRequest!.randoId}`, `<div>We are pleased to inform you that ${newRequest!.email} successfully paid for your request ${newRequest!.randoId}.<br>

          Here are the details of the payment:<br><br>
          
          Request Number: ${newRequest!.randoId}<br>
          Amount Received: ${amountToCredit}<br>
          Payment Date: ${newRequest!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          Your cooperation is essential in maintaining smooth business operations.<br><br>
    
          Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
          
          </div>`)

            );
            return res.sendStatus(200)
          } else {
            const userToken = await UserTokens.create({ tokenId: getToken.id, userId: newRequest?.userId })
            await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
            await newRequest!.update({ processed: true })
            const user = await Users.findOne({ where: { id: newRequest?.userId } })

            const tokenX = await Tokens.findOne({ where: { symbol: getToken?.symbol } })
            const creditedToken = await UserTokens.findOne({ where: { tokenId: tokenX?.id } })


            await Transactions.create({
              ref: createRandomRef(8, "txt"),
              description: `You Recieved a Payment Request of ${tokenX?.symbol} ${amountToCredit} Successfully`,
              title: "Payment Request Paid Successfully",
              type: TransactionType.CREDIT,
              service: ServiceType.PAYMENT_REQUEST,
              amount: amountToCredit,
              status: TransactionStatus.COMPLETE,
              mata: newRequest,
              userId: newRequest?.userId
            })
            await sendFcmNotification("Payment Request Paid Successfully", {
              description: `You Recieved a Payment Request of ${tokenX?.symbol} ${amountToCredit} Successfully`,
              title: "Payment Request Paid Successfully",
              type: TransactionType.CREDIT,
              mata: {
                token: {
                  title: tokenX?.dataValues.symbol,
                  tokenId: tokenX?.dataValues.id,
                  id: creditedToken?.dataValues.id,
                  currency: tokenX?.dataValues.currency,
                  amount: creditedToken?.dataValues.balance,
                  icon: tokenX?.dataValues.url
                }
              },
              service: ServiceType.PAYMENT_REQUEST,
            }, user!.fcmToken)
            await sendEmail(data.customer!.email, `Payment Received for Request ${newRequest!.randoId}`,
              templateEmail(`Payment Received for Request ${newRequest!.randoId}`, `<div>We are pleased to inform you that we have successfully received your payment for the request ${newRequest!.randoId}. Your prompt action is greatly appreciated.<br>

          Here are the details of your payment:<br><br>
          
          Request Number: ${newRequest!.randoId}<br>
          Amount Received: ${tokenX?.symbol} ${amountToCredit}<br>
          Payment Date: ${newRequest!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          Thank you for your timely settlement. Your cooperation is essential in maintaining smooth business operations.<br><br>
    
          Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
          
          </div>`));
            await sendEmail(user!.email, `Payment Received for Request ${newRequest!.randoId}`,
              templateEmail(`Payment Received for Request ${newRequest!.randoId}`, `<div>We are pleased to inform you that ${newRequest!.email} successfully paid for your request ${newRequest!.randoId}.<br>

          Here are the details of the payment:<br><br>
          
          Request Number: ${newRequest!.randoId}<br>
          Amount Received: ${amountToCredit}<br>
          Payment Date: ${newRequest!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          Your cooperation is essential in maintaining smooth business operations.<br><br>
    
          Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
          
          </div>`))
            return res.sendStatus(200)
          }
        } else {

          const response = await axios({
            method: 'GET',
            url: `https://api.coinranking.com/v2/coins`,
            headers: { 'Content-Type': 'application/json' },
          })

          const coinObject = response.data.data.coins.find((obj: any) => obj.symbol == token);

          let getToken = await Tokens.create({
            currency: token,
            symbol: token,
            url: coinObject.iconUrl

          })

          const tokenX = await Tokens.findOne({ where: { symbol: getToken?.symbol } })
          const creditedToken = await UserTokens.findOne({ where: { tokenId: tokenX?.id } })

          const userToken = await UserTokens.create({ tokenId: getToken.id, userId: newRequest?.userId })
          await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
          await newRequest!.update({ processed: true })
          const user = await Users.findOne({ where: { id: newRequest?.userId } })
          await Transactions.create({
            ref: createRandomRef(8, "txt"),
            description: `You Recieved a Payment Request of ${tokenX?.symbol} ${amountToCredit} Successfully`,
            title: "Payment Request Paid Successfully",
            type: TransactionType.CREDIT,
            service: ServiceType.PAYMENT_REQUEST,
            amount: amountToCredit,
            status: TransactionStatus.COMPLETE,
            mata: newRequest,
            userId: newRequest?.userId
          })
          await sendFcmNotification("Payment Request Paid Successfully", {
            description: `You Recieved a Payment Request of ${tokenX?.symbol} ${amountToCredit} Successfully`,
            title: "Payment Request Paid Successfully",
            type: TransactionType.CREDIT,
            mata: {
              token: {
                title: tokenX?.dataValues.symbol,
                tokenId: tokenX?.dataValues.id,
                id: creditedToken?.dataValues.id,
                currency: tokenX?.dataValues.currency,
                amount: creditedToken?.dataValues.balance,
                icon: tokenX?.dataValues.url
              }
            },
            service: ServiceType.PAYMENT_REQUEST,
          }, user!.fcmToken)
          await sendEmail(data.customer!.email, `Payment Received for Request ${newRequest!.randoId}`,
            templateEmail(`Payment Received for Request ${newRequest!.randoId}`, `<div>We are pleased to inform you that we have successfully received your payment for the request ${newRequest!.randoId}. Your prompt action is greatly appreciated.<br>

        Here are the details of your payment:<br><br>
        
        Request Number: ${newRequest!.randoId}<br>
        Amount Received: ${tokenX?.symbol} ${amountToCredit}<br>
        Payment Date: ${newRequest!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
        Thank you for your timely settlement. Your cooperation is essential in maintaining smooth business operations.<br><br>
  
        Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
        
        </div>`));
          await sendEmail(user!.email, `Payment Received for Request ${newRequest!.randoId}`,
            templateEmail(`Payment Received for Request ${newRequest!.randoId}`, `<div>We are pleased to inform you that ${newRequest!.email} successfully paid for your request ${newRequest!.randoId}.<br>

        Here are the details of the payment:<br><br>
        
        Request Number: ${newRequest!.randoId}<br>
        Amount Received: ${amountToCredit}<br>
        Payment Date: ${newRequest!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
        Your cooperation is essential in maintaining smooth business operations.<br><br>
  
        Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
        
        </div>`))
          return res.sendStatus(200)
        }
      } else {
        let getToken = await Tokens.findOne({ where: { currency: token } })
        if (getToken) {
          const userToken = await UserTokens.findOne({ where: { tokenId: getToken.id, userId: newRequest?.userId } })
          if (userToken) {
            await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
            await newRequest!.update({ targetReached: Number(newRequest?.targetReached) + Number(amountToCredit) })
            const newRequestLatest = await PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } })
            await newRequestLatest!.update({ processed: Number(newRequestLatest?.targetReached) >= Number(newRequestLatest?.target) ? true : false })
            const user = await Users.findOne({ where: { id: newRequest?.userId } })

            const tokenX = await Tokens.findOne({ where: { symbol: getToken?.symbol } })
            const creditedToken = await UserTokens.findOne({ where: { tokenId: tokenX?.id } })


            Number(newRequestLatest?.targetReached) >= Number(newRequestLatest?.target) ?
              await sendEmail(user!.email, "Congratulations! You've Reached Your Crowdfunding Goal",
                templateEmail(
                  "Congratulations! You've Reached Your Crowdfunding Goal",
                  `<div>We are thrilled to inform you that your crowdfunding campaign has successfully reached its goal! Congratulations on this incredible achievement!<br><br>

              Your dedication, hard work, and passion have paid off, and your campaign has resonated with supporters who believe in your vision. Together, you've created something truly remarkable.<br><br>
              
              Reaching this milestone is a testament to your determination and the strength of your community. Your supporters have rallied behind you, demonstrating their belief in your project and their commitment to helping you succeed.<br><br>
              
              We want to extend our heartfelt congratulations to you on this momentous occasion. Your success is well-deserved, and we are excited to see where your journey takes you next.<br><br>
              
              As you celebrate this achievement, please know that we are here to support you every step of the way. If you need any assistance or have any questions, please don't hesitate to reach out to us.<br><br>
              
              Once again, congratulations on reaching your crowdfunding goal! We wish you continued success and look forward to seeing the incredible impact of your project.</div>`)) :
              await sendEmail(user!.email, "Crowdfund Payment Successful",
                templateEmail(
                  "Crowdfund Payment Successful",
                  `<div>We're excited to inform you that a payment has been successfully processed for your crowdfunding campaign.<br><br>
               Your supporters are rallying behind your project, and their contributions are making a tangible impact.<br><br>

              Here are the details of the transaction:<br><br>
              
              Amount Received: ${tokenX?.symbol} ${amountToCredit}<br>
              Date of Payment: ${newRequest!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>
  
              This payment represents another step forward in achieving your crowdfunding goal. We're thrilled to see the support pouring in for your project, and we're committed to helping you every step of the way.<br><br>
              
              If you have any questions or need further assistance, please feel free to reach out to us. We're here to support you and ensure the success of your crowdfunding campaign.<br><br>
              
              Congratulations on this successful payment, and best of luck with your project!</div>`));



            await Transactions.create({
              ref: createRandomRef(8, "txt"),
              description: "Crowdfund Paid Successfully",
              title: "Crowdfund Paid Successfully",
              type: TransactionType.CREDIT,
              service: ServiceType.CROWD_FUND,
              amount: amountToCredit,
              status: TransactionStatus.COMPLETE,
              mata: newRequestLatest,
              userId: newRequestLatest?.userId
            })
            await sendFcmNotification("Crowdfund Paid Successfully", {
              title: "Crowdfund Paid Successfully",
              type: TransactionType.CREDIT,
              mata: {
                token: {
                  title: tokenX?.dataValues.symbol,
                  tokenId: tokenX?.dataValues.id,
                  id: creditedToken?.dataValues.id,
                  currency: tokenX?.dataValues.currency,
                  amount: creditedToken?.dataValues.balance,
                  icon: tokenX?.dataValues.url
                }
              },
              service: ServiceType.CROWD_FUND,
            }, user!.fcmToken)
            return res.sendStatus(200)
          } else {
            const userToken = await UserTokens.create({ tokenId: getToken.id, userId: newRequest?.userId })
            await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
            await newRequest!.update({ targetReached: Number(newRequest?.targetReached) + Number(amountToCredit) })
            const newRequestLatest = await PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } })
            await newRequestLatest!.update({ processed: Number(newRequestLatest?.targetReached) >= Number(newRequestLatest?.target) ? true : false })
            const user = await Users.findOne({ where: { id: newRequest?.userId } })

            const tokenX = await Tokens.findOne({ where: { symbol: getToken?.symbol } })
            const creditedToken = await UserTokens.findOne({ where: { tokenId: tokenX?.id } })


            Number(newRequestLatest?.targetReached) >= Number(newRequestLatest?.target) ?
              await sendEmail(user!.email, "Congratulations! You've Reached Your Crowdfunding Goal",
                templateEmail("Congratulations! You've Reached Your Crowdfunding Goal", `<div>We are thrilled to inform you that your crowdfunding campaign has successfully reached its goal! Congratulations on this incredible achievement!<br><br>

           Your dedication, hard work, and passion have paid off, and your campaign has resonated with supporters who believe in your vision. Together, you've created something truly remarkable.<br><br>
           
           Reaching this milestone is a testament to your determination and the strength of your community. Your supporters have rallied behind you, demonstrating their belief in your project and their commitment to helping you succeed.<br><br>
           
           We want to extend our heartfelt congratulations to you on this momentous occasion. Your success is well-deserved, and we are excited to see where your journey takes you next.<br><br>
           
           As you celebrate this achievement, please know that we are here to support you every step of the way. If you need any assistance or have any questions, please don't hesitate to reach out to us.<br><br>
           
           Once again, congratulations on reaching your crowdfunding goal! We wish you continued success and look forward to seeing the incredible impact of your project.</div>`)) :
              await sendEmail(user!.email, "Crowdfund Payment Successful", templateEmail("Crowdfund Payment Successful", `
           <div>We're excited to inform you that a payment has been successfully processed for your crowdfunding campaign.<br><br>
            Your supporters are rallying behind your project, and their contributions are making a tangible impact.<br><br>

           Here are the details of the transaction:<br><br>
           
           Amount Received: ${tokenX?.symbol} ${amountToCredit}<br>
           Date of Payment: ${newRequest!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>

           This payment represents another step forward in achieving your crowdfunding goal. We're thrilled to see the support pouring in for your project, and we're committed to helping you every step of the way.<br><br>
           
           If you have any questions or need further assistance, please feel free to reach out to us. We're here to support you and ensure the success of your crowdfunding campaign.<br><br>
           
           Congratulations on this successful payment, and best of luck with your project!</div>`));
            await Transactions.create({
              ref: createRandomRef(8, "txt"),
              description: "Crowdfund Paid Successfully",
              title: "Crowdfund Paid Successfully",
              type: TransactionType.CREDIT,
              service: ServiceType.CROWD_FUND,
              amount: amountToCredit,
              status: TransactionStatus.COMPLETE,
              mata: newRequestLatest,
              userId: newRequestLatest?.userId
            })
            await sendFcmNotification("Crowdfund Paid Successfully", {
              description: `You Recieved a Crowdfund Paymemt of $${amountToCredit} Successfully`,
              title: "Crowdfund Paid Successfully",
              type: TransactionType.CREDIT,
              mata: {
                token: {
                  title: tokenX?.dataValues.symbol,
                  tokenId: tokenX?.dataValues.id,
                  id: creditedToken?.dataValues.id,
                  currency: tokenX?.dataValues.currency,
                  amount: creditedToken?.dataValues.balance,
                  icon: tokenX?.dataValues.url
                }
              },
              service: ServiceType.CROWD_FUND,
            }, user!.fcmToken)
            return res.sendStatus(200)
          }
        } else {

          const response = await axios({
            method: 'GET',
            url: `https://api.coinranking.com/v2/coins`,
            headers: { 'Content-Type': 'application/json' },
          })

          const coinObject = response.data.data.coins.find((obj: any) => obj.symbol == token);

          let getToken = await Tokens.create({
            currency: token,
            symbol: token,
            url: coinObject.iconUrl

          })

          const userToken = await UserTokens.create({ tokenId: getToken.id, userId: newRequest?.userId })
          await userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) })
          await newRequest!.update({ targetReached: Number(newRequest?.targetReached) + Number(amountToCredit) })
          const newRequestLatest = await PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } })
          await newRequestLatest!.update({ processed: Number(newRequestLatest?.targetReached) >= Number(newRequestLatest?.target) ? true : false })
          const user = await Users.findOne({ where: { id: newRequest?.userId } })
          const tokenX = await Tokens.findOne({ where: { symbol: getToken?.symbol } })
          const creditedToken = await UserTokens.findOne({ where: { tokenId: tokenX?.id } })

          Number(newRequestLatest?.targetReached) >= Number(newRequestLatest?.target) ?
            await sendEmail(user!.email, "Congratulations! You've Reached Your Crowdfunding Goal",
              templateEmail("Congratulations! You've Reached Your Crowdfunding Goal", `<div>We are thrilled to inform you that your crowdfunding campaign has successfully reached its goal! Congratulations on this incredible achievement!<br><br>

         Your dedication, hard work, and passion have paid off, and your campaign has resonated with supporters who believe in your vision. Together, you've created something truly remarkable.<br><br>
         
         Reaching this milestone is a testament to your determination and the strength of your community. Your supporters have rallied behind you, demonstrating their belief in your project and their commitment to helping you succeed.<br><br>
         
         We want to extend our heartfelt congratulations to you on this momentous occasion. Your success is well-deserved, and we are excited to see where your journey takes you next.<br><br>
         
         As you celebrate this achievement, please know that we are here to support you every step of the way. If you need any assistance or have any questions, please don't hesitate to reach out to us.<br><br>
         
         Once again, congratulations on reaching your crowdfunding goal! We wish you continued success and look forward to seeing the incredible impact of your project.</div>`)) :
            await sendEmail(user!.email, "Crowdfund Payment Successful", templateEmail("Crowdfund Payment Successful", `
         <div>We're excited to inform you that a payment has been successfully processed for your crowdfunding campaign.<br><br>
          Your supporters are rallying behind your project, and their contributions are making a tangible impact.<br><br>

         Here are the details of the transaction:<br><br>
         
         Amount Received: ${tokenX?.symbol} ${amountToCredit}<br>
         Date of Payment: ${newRequest!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>

         This payment represents another step forward in achieving your crowdfunding goal. We're thrilled to see the support pouring in for your project, and we're committed to helping you every step of the way.<br><br>
         
         If you have any questions or need further assistance, please feel free to reach out to us. We're here to support you and ensure the success of your crowdfunding campaign.<br><br>
         
         Congratulations on this successful payment, and best of luck with your project!</div>`));
          await Transactions.create({
            ref: createRandomRef(8, "txt"),
            description: `You Recieved a Crowdfund Paymemt of $${amountToCredit} Successfully`,
            title: "Crowdfund Paid Successfully",
            type: TransactionType.CREDIT,
            service: ServiceType.CROWD_FUND,
            amount: amountToCredit,
            status: TransactionStatus.COMPLETE,
            mata: newRequestLatest,
            userId: newRequestLatest?.userId
          })
          await sendFcmNotification("Crowdfund Paid Successfully", {
            description: `You Recieved a Crowdfund Paymemt of $${amountToCredit} Successfully`,
            title: "Crowdfund Paid Successfully",
            type: TransactionType.CREDIT,
            mata: {
              token: {
                title: tokenX?.dataValues.symbol,
                tokenId: tokenX?.dataValues.id,
                id: creditedToken?.dataValues.id,
                currency: tokenX?.dataValues.currency,
                amount: creditedToken?.dataValues.balance,
                icon: tokenX?.dataValues.url
              }
            },
            service: ServiceType.CROWD_FUND,
          }, user!.fcmToken)
          return res.sendStatus(200)
        }
      }

    }
    else {
      return res.sendStatus(200)
    }
  } else if (body.eventType == "managedWithdrawal") {
    const withdrawal = await Withdrawal.findOne({ where: { randoId: body.eventData.managedWithdrawal.withdrawalRequestId } })
    if (!withdrawal) return res.sendStatus(200)
    if (withdrawal?.processed) return res.sendStatus(200)
    await withdrawal?.update({
      status: body.eventData.managedWithdrawal.isSuccess == true ? WithdrawalStatus.COMPLETE : WithdrawalStatus.FAILED,
      reason: body.eventData.managedWithdrawal.failureReason, processed: true
    })
    const user = await Users.findOne({ where: { id: withdrawal?.userId } })
    const tokenX = await Tokens.findOne({ where: { symbol: withdrawal?.symbol } })
    const creditedToken = await UserTokens.findOne({ where: { tokenId: tokenX?.id } })


    await Transactions.create({
      ref: createRandomRef(8, "txt"),
      description: `Withdrawal of ${withdrawal.symbol} ${withdrawal.amount} is Successful`,
      title: "Withdrawal Successful",
      type: TransactionType.DEBIT,
      service: ServiceType.WITHDRAWAL,
      amount: withdrawal.amount,
      status: TransactionStatus.COMPLETE,
      mata: withdrawal,
      userId: withdrawal?.userId
    })
    await sendEmail(user!.email, "Withdrawal Successful",
      templateEmail("Withdrawal Successful", `<div>We're pleased to inform you that your recent withdrawal request has been successfully processed. The funds have been transferred to your designated account.<br><br>

    Here are the details of the withdrawal:<br><br>
    
    Withdrawal ID: ${withdrawal.id} <br>
    Amount Withdrawn: ${withdrawal.amount}<br>
    Date of Withdrawal: ${withdrawal!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>
  
    We hope this transaction meets your expectations, and we're here to assist you with any further inquiries or assistance you may require.<br>
    
    Thank you for choosing our service, and we look forward to serving you again in the future.</div>`));
    await sendFcmNotification("Withdrawal Successful", {
      description: `Withdrawal of ${withdrawal.symbol} ${withdrawal.amount} is Successful`,
      title: "Withdrawal Successful",
      type: TransactionType.DEBIT,
      mata: {
        token: {
          title: tokenX?.dataValues.symbol,
          tokenId: tokenX?.dataValues.id,
          id: creditedToken?.dataValues.id,
          currency: tokenX?.dataValues.currency,
          amount: creditedToken?.dataValues.balance,
          icon: tokenX?.dataValues.url
        }
      },
      service: ServiceType.WITHDRAWAL,
    }, user!.fcmToken)
    console.log(user!.fcmToken)
    console.log(user!.fcmToken)
    return res.sendStatus(200)
  }
  else {
    return res.sendStatus(200)
  }
}




export const updateInvoiceStatus = async (req: Request, res: Response) => {
  const { id } = req.query;
  const invoice = await Invoice.findOne({ where: { randoId: id } })
  const date: string = new Date().toISOString();
  await invoice!.update({
    paidAt: date,
    status: "paid",
    processed: true
  })
  const newInvoice = await Invoice.findOne({ where: { randoId: id } })
  return successResponse(res, "Successful", newInvoice);
}





export const sendInvoiceReminder = async (req: Request, res: Response) => {
  const { id } = req.query;
  const invoice = await Invoice.findOne({ where: { randoId: id } })
  const data = JSON.parse(invoice?.customer)
  console.log(data)
  await sendEmail(data.email, "Invoice Reminder",
    templateEmail("Invoice Reminder", `<div>I hope this message finds you well.<br>

  I'm writing to kindly remind you about the outstanding invoice ${invoice?.randoId}, which remains unpaid.<br>
  
  Here are the details of the invoice:<br><br>
  
  Invoice Number: ${invoice?.randoId}<br>
  Invoice Date: ${invoice!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
  Amount Due: ${invoice?.subTotal}<br>
  Due Date:  ${invoice!.overdueAt}<br><br>
  <a href=https://eizypayment-bk.onrender.com/invoice?id=${invoice!.randoId}> VIEW INVOICE <a/>
  <br><br>
  We understand that oversight can happen, and we want to ensure that this matter is resolved promptly to avoid any inconvenience.<br>Please take a moment to review the invoice, and if you've already made the payment, kindly disregard this reminder.<br>
    
  If you have any questions regarding the invoice or need assistance with payment, please don't hesitate to reach out to us. We're here to help and ensure a smooth resolution.<br>
  
  Thank you for your attention to this matter. We appreciate your cooperation and look forward to receiving your payment soon.</div>`));

  const newInvoice = await Invoice.findOne({ where: { randoId: id } })
  return successResponse(res, "Successful", newInvoice);
}
