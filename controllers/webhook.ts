

import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';
import { Op, where } from "sequelize";
import { UserState, UserStatus, Users } from "../models/Users";
import config from '../config/configSetup';
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
import { Card } from "../models/Card";
import { Price } from "../models/Price";
import { Wallet } from "../models/Wallet";
const fs = require("fs");
const axios = require('axios')


const crypto = require('crypto');
const webhookSecret = process.env.BITNOB_WEBHOOK_SECRET;
// Using Express




export const webhookBitnom = async (req: Request, res: Response) => {
    //validate event
    const hash = crypto.createHmac('sha512', webhookSecret).update(JSON.stringify(req.body)).digest('hex');
    if (hash == req.headers['x-bitnob-signature']) {
        // Retrieve the request's body
        const event = req.body;
        console.log(event)
        console.log(event.data.id)
        if (event.event === "virtualcard.user.kyc.success") {
            const user = await Users.findOne({ where: { email: event.data.customerEmail } })
            await user?.update({ kyc: true, kycComplete: true })
            await sendEmail(user!.email, "Kyc Status",
                templateEmail("Kyc Status", `<div>Kyc Successful</div>`));
        } else if (event.event === "virtualcard.user.kyc.failed") {
            const user = await Users.findOne({ where: { email: event.data.customerEmail } })
            await user?.update({ kyc: false, kycComplete: true })
            await sendEmail(user!.email, "Kyc Status",
                templateEmail("Kyc Status", `<div>Kyc Failed. Data Mismatch</div>`));
        } else if (event.event === "stablecoin.usdc.received.success") {
            const user = await Users.findOne({ where: { address: event.address } })
            const wallet = await Wallet.findOne({
                where: { userId: user?.id }
            })
            await wallet?.update({ balance: Number(wallet.balance) + Number(event.amount) })

            await sendFcmNotification("Wallet Top Up", {
                description: `Card Your Wallet Top Up was Successful`,
                title: "Wallet Top Up",
                type: TransactionType.NOTIFICATION,
                service: ServiceType.NOTIFICATION,
                mata: {},
            }, user!.fcmToken)
            await sendEmail(user!.email, "Wallet Top Up",
                templateEmail("Wallet Top Up", `<div>Your Card Wallet Top Up was Successful</div>`));

            await Transactions.create({
                ref: createRandomRef(8, "txt"),
                description: `You Recieved a card wallet top  up of $${event.amount} Successfully`,
                title: "Card Wallet Topup Successful",
                type: TransactionType.CREDIT,
                service: ServiceType.NOTIFICATION,
                amount: event.amount,
                status: TransactionStatus.COMPLETE,
                mata: {},
                userId: user?.id
            })


        } else if (event.event === "stablecoin.usdt.received.success") {

            const user = await Users.findOne({ where: { address: event.address } })
            const wallet = await Wallet.findOne({
                where: { userId: user?.id }
            })
            await wallet?.update({ balance: Number(wallet.balance) + Number(event.amount) })

            await sendFcmNotification("Wallet Top Up", {
                description: `Card Your Wallet Top Up was Successful`,
                title: "Wallet Top Up",
                type: TransactionType.NOTIFICATION,
                service: ServiceType.NOTIFICATION,
                mata: {},
            }, user!.fcmToken)
            await sendEmail(user!.email, "Wallet Top Up",
                templateEmail("Wallet Top Up", `<div>Your Card Wallet Top Up was Successful</div>`));

            await Transactions.create({
                ref: createRandomRef(8, "txt"),
                description: `You Recieved a card wallet top  up of $${event.amount} Successfully`,
                title: "Card Wallet Topup Successful",
                type: TransactionType.CREDIT,
                service: ServiceType.NOTIFICATION,
                amount: event.amount,
                status: TransactionStatus.COMPLETE,
                mata: {},
                userId: user?.id
            })
        }
        else if (event.event === "virtualcard.topup.success") {
            const card = await Card.findOne({ where: { cardId: event.data.cardId } })
            const user = await Users.findOne({ where: { id: card?.userId } })
            await sendFcmNotification("Card Top Up", {
                description: `Your Card Top Up was Successful`,
                title: "Card Top Up",
                type: TransactionType.NOTIFICATION,
                service: ServiceType.NOTIFICATION,
                mata: {},
            }, user!.fcmToken)
            await sendEmail(user!.email, "Card Top Up",
                templateEmail("Card Top Up", `<div>Card Top Up Successful</div>`));
        }
        else if (event.event === "virtualcard.topup.failed") {
            const card = await Card.findOne({ where: { cardId: event.data.cardId } })
            const user = await Users.findOne({ where: { id: card?.userId } })
            await sendFcmNotification("Card Top Up", {
                description: `Your Card Top Up Failed`,
                title: "Card Top Up",
                type: TransactionType.NOTIFICATION,
                service: ServiceType.NOTIFICATION,
                mata: {},
            }, user!.fcmToken)
            await sendEmail(user!.email, "Card Top Up",
                templateEmail("Card Top Up", `<div>Card Top Up Failed</div>`));
        }
        else if (event.event === "virtualcard.withdrawal.success") {
            const card = await Card.findOne({ where: { cardId: event.data.cardId } })
            const user = await Users.findOne({ where: { id: card?.userId } })
            await sendFcmNotification("Card Withdrawal", {
                description: `Card Withdrawal Successful`,
                title: "Card Withdrawal",
                type: TransactionType.NOTIFICATION,
                service: ServiceType.NOTIFICATION,
                mata: {},
            }, user!.fcmToken)
            await sendEmail(user!.email, "Card Withdrawal",
                templateEmail("Card Withdrawal", `<div>Card Withdrawal Successful</div>`));
        }
        else if (event.event === "virtualcard.withdrawal.failed") {
            const card = await Card.findOne({ where: { cardId: event.data.cardId } })
            const user = await Users.findOne({ where: { id: card?.userId } })
            await sendFcmNotification("Card Withdrawal", {
                description: `Card Withdrawal Failed`,
                title: "Card Withdrawal",
                type: TransactionType.NOTIFICATION,
                service: ServiceType.NOTIFICATION,
                mata: {},
            }, user!.fcmToken)
            await sendEmail(user!.email, "Card Withdrawal",
                templateEmail("Card Withdrawal", `<div>Card Withdrawal Fail</div>`));
        }
        else if (event.event === "virtualcard.transaction.debit") {
            const card = await Card.findOne({ where: { cardId: event.data.cardId } })
            const user = await Users.findOne({ where: { id: card?.userId } })
            await sendFcmNotification("Card Debited", {
                description: `Card has been debited $${event.data.amount}.`,
                title: "Card Debited",
                type: TransactionType.NOTIFICATION,
                service: ServiceType.NOTIFICATION,
                mata: {},
            }, user!.fcmToken)
            await sendEmail(user!.email, "Card Debited",
                templateEmail("Card Debited", `<div>Your card has been debited $${event.data.amount}</div>`));
        }
        else if (event.event === "virtualcard.transaction.declined") {
            const card = await Card.findOne({ where: { cardId: event.data.cardId } })
            const user = await Users.findOne({ where: { id: card?.userId } })
            await sendFcmNotification("Card Declined", {
                description: `Card Transaction: Card has been declined`,
                title: "Card Declined",
                type: TransactionType.NOTIFICATION,
                service: ServiceType.NOTIFICATION,
                mata: {},
            }, user!.fcmToken)
            await sendEmail(user!.email, "Card Declined",
                templateEmail("Card Declined", `<div>Card Transaction: Card has been declined</div>`));
        }
        else if (event.event === "virtualcard.transaction.reversed") {
            const card = await Card.findOne({ where: { cardId: event.data.cardId } })
            const user = await Users.findOne({ where: { id: card?.userId } })
            await sendFcmNotification("Card Transaction Reversed", {
                description: `Card Transaction has been Reversed`,
                title: "Card Transaction Reversed",
                type: TransactionType.NOTIFICATION,
                service: ServiceType.NOTIFICATION,
                mata: {},
            }, user!.fcmToken)
            await sendEmail(user!.email, "Card Transaction Reversed",
                templateEmail("Card Transaction Reversed", `<div>Cards Transaction has been Reversed</div>`));
        }
        else if (event.event === "virtualcard.transaction.declined.terminated") {
            const card = await Card.findOne({ where: { cardId: event.data.cardId } })
            const user = await Users.findOne({ where: { id: card?.userId } })
            await sendFcmNotification("Transaction Terminated", {
                description: `Cards Transaction: Terminated`,
                title: "Transaction Terminated",
                type: TransactionType.NOTIFICATION,
                service: ServiceType.NOTIFICATION,
                mata: {},
            }, user!.fcmToken)
            await sendEmail(user!.email, "Transaction Terminated",
                templateEmail("Transaction Terminated", `<div>Cards Transaction: Terminated</div>`));

        }
        else if (event.event === "virtualcard.transaction.authorization.failed") {
            const card = await Card.findOne({ where: { cardId: event.data.cardId } })
            const user = await Users.findOne({ where: { id: card?.userId } })
            await sendFcmNotification("Card Transaction: Failed", {
                description: `Card Transaction: Failed`,
                title: "Card Transaction: Failed",
                type: TransactionType.NOTIFICATION,
                service: ServiceType.NOTIFICATION,
                mata: {},
            }, user!.fcmToken)
            await sendEmail(user!.email, "Cards Transaction: Failed",
                templateEmail("Card Transaction: Failed", `<div>Cards Transaction has Failed</div>`));
        }
        else if (event.event === "virtualcard.created.success") {
            const card = await Card.findOne({ where: { cardId: event.data.id } })
            const user = await Users.findOne({ where: { id: card?.userId } })
            await sendFcmNotification("Card Created", {
                description: `Your Card is Ready`,
                title: "Card Created",
                type: TransactionType.NOTIFICATION,
                service: ServiceType.NOTIFICATION,
                mata: {},
            }, user!.fcmToken)
            await sendEmail(user!.email, "Card Created",
                templateEmail("Card Created", `<div>Your Card is Ready</div>`));
        }
        else if (event.event === "virtualcard.created.failed") {
            const card = await Card.findOne({ where: { cardId: event.data.id } })
            const user = await Users.findOne({ where: { id: card?.userId } })
            await sendFcmNotification("Error Creating Card", {
                description: `An issue was encountered creating your card. Try again`,
                title: "Error Creating Card",
                type: TransactionType.NOTIFICATION,
                service: ServiceType.NOTIFICATION,
                mata: {},
            }, user!.fcmToken)
            await sendEmail(user!.email, "Error Creating Card",
                templateEmail("Error Creating Card", `<div>An issue was encountered creating your card. Try again</div>`));
        }




        // Do something with event  
    }
    res.send(200);
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
        Amount: ${invoice.symbol} ${invoice?.subTotal}<br>
        Invoice Date: ${invoice!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>
  
        We hope this transaction meets your expectations, and we're here to assist you with any further inquiries or assistance you may require.<br>
  
        Thank you for choosing our service, and we look forward to serving you again in the future.</div>`));


            await sendEmail(user!.email, "Invoice Payment Confirmation - Eisy Global",
                templateEmail("Invoice Payment Confirmation - Eisy Global", `<div>
    This is an automated message to confirm that your invoice #${invoice?.invoiceNo} has been received and is being processed by Eisy Global.<br><br>
    Invoice Details:<br><br>
    Invoice Number: ${invoice?.invoiceNo} <br>
    Amount: ${invoice.symbol}${invoice?.subTotal}<br>
    Invoice Date: ${invoice!.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>
    
    We hope this transaction meets your expectations, and we're here to assist you with any further inquiries or assistance you may require.<br>
    
    Thank you for choosing our service, and we look forward to serving you again in the future.</div>`));


            await sendFcmNotification("Invoice Payment Processing", {
                description: `Invoice payment for #${invoice?.invoiceNo} has been received and is being processed by Eisy Global.`,
                title: "Invoice Payment Processing",
                type: TransactionType.CREDIT,
                mata: {},
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
            const priceFee = await Price.findOne()
            const fee = ((Number(priceFee?.invoiceFeeValue) * Number(amountToCredit)) / 100)
            amountToCredit = (Number(amountToCredit) - Number(fee))
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
            const priceFee = await Price.findOne()
            const fee = ((Number(priceFee?.invoiceFeeValue) * Number(amountToCredit)) / 100)
            amountToCredit = (Number(amountToCredit) - Number(fee))
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


