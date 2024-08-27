"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhook = exports.webhookMoonPay = exports.webhookBitnom = void 0;
const utility_1 = require("../helpers/utility");
const Users_1 = require("../models/Users");
const configSetup_1 = __importDefault(require("../config/configSetup"));
// yarn add stream-chat
const util = require('util');
const Invoice_1 = require("../models/Invoice");
const Token_1 = require("../models/Token");
const UserToken_1 = require("../models/UserToken");
const Withdrawal_1 = require("../models/Withdrawal");
const notification_1 = require("../services/notification");
const Payment_1 = require("../models/Payment");
const Transaction_1 = require("../models/Transaction");
const template_1 = require("../config/template");
const Card_1 = require("../models/Card");
const fs = require("fs");
const axios = require('axios');
const crypto = require('crypto');
const webhookSecret = process.env.BITNOB_WEBHOOK_SECRET;
// Using Express
const webhookBitnom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //validate event
    const hash = crypto.createHmac('sha512', webhookSecret).update(JSON.stringify(req.body)).digest('hex');
    if (hash == req.headers['x-bitnob-signature']) {
        // Retrieve the request's body
        const event = req.body;
        console.log(event);
        console.log(event.data.id);
        if (event.event === "virtualcard.user.kyc.success") {
            const user = yield Users_1.Users.findOne({ where: { email: event.data.customerEmail } });
            yield (user === null || user === void 0 ? void 0 : user.update({ kyc: true, kycComplete: true }));
            yield (0, notification_1.sendEmail)(user.email, "Kyc Successful", (0, template_1.templateEmail)("Kyc Successful", `<div>Kyc Successful</div>`));
        }
        else if (event.event === "virtualcard.user.kyc.failed") {
            const user = yield Users_1.Users.findOne({ where: { email: event.data.customerEmail } });
            yield (user === null || user === void 0 ? void 0 : user.update({ kyc: false, kycComplete: true }));
            yield (0, notification_1.sendEmail)(user.email, "Kyc Failed", (0, template_1.templateEmail)("Kyc Failed", `<div>Kyc Failed</div>`));
        }
        else if (event.event === "stablecoin.usdc.received.success") {
            // await Transactions.create({
            //     ref: createRandomRef(8, "txt"),
            //     description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
            //     title: "Invoice Payment Successful",
            //     type: TransactionType.CREDIT,
            //     service: ServiceType.INVOICE,
            //     amount: amountToCredit,
            //     status: TransactionStatus.COMPLETE,
            //     mata: invoice,
            //     userId: invoice?.userId
            // })
            // const card = await Card.findOne({ where: { cardId: event.data.cardId } })
            // const user = await Users.findOne({ where: { id: card?.userId } })
            // await sendEmail(user!.email, "Wallet Funded",
            //     templateEmail("Wallet Funded", `<div>Wallet Funded with USDC</div>`));
        }
        else if (event.event === "stablecoin.usdt.received.success") {
            // await Transactions.create({
            //     ref: createRandomRef(8, "txt"),
            //     description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
            //     title: "Invoice Payment Successful",
            //     type: TransactionType.CREDIT,
            //     service: ServiceType.INVOICE,
            //     amount: amountToCredit,
            //     status: TransactionStatus.COMPLETE,
            //     mata: invoice,
            //     userId: invoice?.userId
            // })
            // const card = await Card.findOne({ where: { cardId: event.data.cardId } })
            // const user = await Users.findOne({ where: { id: card?.userId } })
            // await sendEmail(user!.email, "Wallet Funded",
            //     templateEmail("Wallet Funded", `<div>Wallet Funded with USDT</div>`));
        }
        else if (event.event === "virtualcard.topup.success") {
            const card = yield Card_1.Card.findOne({ where: { cardId: event.data.cardId } });
            const user = yield Users_1.Users.findOne({ where: { id: card === null || card === void 0 ? void 0 : card.userId } });
            yield (0, notification_1.sendEmail)(user.email, "Card Top Up Successful", (0, template_1.templateEmail)("Card Top Up Successful", `<div>Card Top Up Successful</div>`));
        }
        else if (event.event === "virtualcard.topup.failed") {
            const card = yield Card_1.Card.findOne({ where: { cardId: event.data.cardId } });
            const user = yield Users_1.Users.findOne({ where: { id: card === null || card === void 0 ? void 0 : card.userId } });
            yield (0, notification_1.sendEmail)(user.email, "Card Top Up Failed", (0, template_1.templateEmail)("Card Top Up Failed", `<div>Card Top Up Failed</div>`));
        }
        else if (event.event === "virtualcard.withdrawal.success") {
            const card = yield Card_1.Card.findOne({ where: { cardId: event.data.cardId } });
            const user = yield Users_1.Users.findOne({ where: { id: card === null || card === void 0 ? void 0 : card.userId } });
            yield (0, notification_1.sendEmail)(user.email, "Card Withdrawal Successful", (0, template_1.templateEmail)("Card Withdrawal Successful", `<div>Card Withdrawal Successful</div>`));
        }
        else if (event.event === "virtualcard.withdrawal.failed") {
            const card = yield Card_1.Card.findOne({ where: { cardId: event.data.cardId } });
            const user = yield Users_1.Users.findOne({ where: { id: card === null || card === void 0 ? void 0 : card.userId } });
            yield (0, notification_1.sendEmail)(user.email, "Card Withdrawal Failed", (0, template_1.templateEmail)("Card Withdrawal Failed", `<div>Card Withdrawal Fail</div>`));
        }
        else if (event.event === "virtualcard.transaction.debit") {
            const card = yield Card_1.Card.findOne({ where: { cardId: event.data.cardId } });
            const user = yield Users_1.Users.findOne({ where: { id: card === null || card === void 0 ? void 0 : card.userId } });
            yield (0, notification_1.sendEmail)(user.email, "Cards Transaction: Debit", (0, template_1.templateEmail)("Cards Transaction: Debit", `<div>Cards Transaction: Debit</div>`));
        }
        else if (event.event === "virtualcard.transaction.declined") {
            const card = yield Card_1.Card.findOne({ where: { cardId: event.data.cardId } });
            const user = yield Users_1.Users.findOne({ where: { id: card === null || card === void 0 ? void 0 : card.userId } });
            yield (0, notification_1.sendEmail)(user.email, "Cards Transaction: Declined", (0, template_1.templateEmail)("Cards Transaction: Declined", `<div>Cards Transaction: Declined</div>`));
        }
        else if (event.event === "virtualcard.transaction.reversed") {
            const card = yield Card_1.Card.findOne({ where: { cardId: event.data.cardId } });
            const user = yield Users_1.Users.findOne({ where: { id: card === null || card === void 0 ? void 0 : card.userId } });
            yield (0, notification_1.sendEmail)(user.email, "Cards Transaction: Reversed", (0, template_1.templateEmail)("Cards Transaction: Reversed", `<div>Cards Transaction: Reversed</div>`));
        }
        else if (event.event === "virtualcard.transaction.declined.terminated") {
            const card = yield Card_1.Card.findOne({ where: { cardId: event.data.cardId } });
            const user = yield Users_1.Users.findOne({ where: { id: card === null || card === void 0 ? void 0 : card.userId } });
            yield (0, notification_1.sendEmail)(user.email, "Cards Transaction: Terminated", (0, template_1.templateEmail)("Cards Transaction: Terminated", `<div>Cards Transaction: Terminated</div>`));
        }
        else if (event.event === "virtualcard.transaction.authorization.failed") {
            const card = yield Card_1.Card.findOne({ where: { cardId: event.data.cardId } });
            const user = yield Users_1.Users.findOne({ where: { id: card === null || card === void 0 ? void 0 : card.userId } });
            yield (0, notification_1.sendEmail)(user.email, "Cards Transaction: Failed", (0, template_1.templateEmail)("Cards Transaction: Failed", `<div>Cards Transaction: Failed</div>`));
        }
        else if (event.event === "virtualcard.created.success") {
            const card = yield Card_1.Card.findOne({ where: { cardId: event.data.id } });
            const user = yield Users_1.Users.findOne({ where: { id: card === null || card === void 0 ? void 0 : card.userId } });
            yield (0, notification_1.sendEmail)(user.email, "Cards Created Successfully", (0, template_1.templateEmail)("Cards Created Successfully", `<div>Cards Created Successfully</div>`));
        }
        else if (event.event === "virtualcard.created.failed") {
            const card = yield Card_1.Card.findOne({ where: { cardId: event.data.id } });
            const user = yield Users_1.Users.findOne({ where: { id: card === null || card === void 0 ? void 0 : card.userId } });
            yield (0, notification_1.sendEmail)(user.email, "Error Creating Card", (0, template_1.templateEmail)("Error Creating Card", `<div>Error Creating Card</div>`));
        }
        // Do something with event  
    }
    res.send(200);
});
exports.webhookBitnom = webhookBitnom;
const webhookMoonPay = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    // data.data.status === "completed"
    const invoice = yield Invoice_1.Invoice.findOne({ where: { randoId: data.data.externalTransactionId } });
    if ((invoice === null || invoice === void 0 ? void 0 : invoice.processedForFiat) == false) {
        if (data.data.status === "completed") {
            console.log("update invoice on successful");
            console.log("success...");
            const user = yield Users_1.Users.findOne({ where: { id: invoice === null || invoice === void 0 ? void 0 : invoice.userId } });
            yield (invoice === null || invoice === void 0 ? void 0 : invoice.update({ status: "PROCESSING", processedForFiat: true }));
            const customerInfo = JSON.parse(invoice.customer);
            yield (0, notification_1.sendEmail)(customerInfo.email, "Invoice Payment Confirmation - Eisy Global", (0, template_1.templateEmail)("Invoice Payment Confirmation - Eisy Global", `<div>
        This is an automated message to confirm that your invoice #${invoice === null || invoice === void 0 ? void 0 : invoice.invoiceNo} has been received and is being processed by Eisy Global.<br><br>
        Invoice Details:<br><br>
        Invoice Number: ${invoice === null || invoice === void 0 ? void 0 : invoice.invoiceNo} <br>
        Amount: ${invoice.symbol} ${invoice === null || invoice === void 0 ? void 0 : invoice.subTotal}<br>
        Invoice Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>
  
        We hope this transaction meets your expectations, and we're here to assist you with any further inquiries or assistance you may require.<br>
  
        Thank you for choosing our service, and we look forward to serving you again in the future.</div>`));
            yield (0, notification_1.sendEmail)(user.email, "Invoice Payment Confirmation - Eisy Global", (0, template_1.templateEmail)("Invoice Payment Confirmation - Eisy Global", `<div>
    This is an automated message to confirm that your invoice #${invoice === null || invoice === void 0 ? void 0 : invoice.invoiceNo} has been received and is being processed by Eisy Global.<br><br>
    Invoice Details:<br><br>
    Invoice Number: ${invoice === null || invoice === void 0 ? void 0 : invoice.invoiceNo} <br>
    Amount: ${invoice.symbol}${invoice === null || invoice === void 0 ? void 0 : invoice.subTotal}<br>
    Invoice Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>
    
    We hope this transaction meets your expectations, and we're here to assist you with any further inquiries or assistance you may require.<br>
    
    Thank you for choosing our service, and we look forward to serving you again in the future.</div>`));
            yield (0, notification_1.sendFcmNotification)("Invoice Payment Processing", {
                description: `Invoice payment for #${invoice === null || invoice === void 0 ? void 0 : invoice.invoiceNo} has been received and is being processed by Eisy Global.`,
                title: "Invoice Payment Processing",
                type: Transaction_1.TransactionType.CREDIT,
                mata: {},
                service: Transaction_1.ServiceType.WITHDRAWAL,
            }, user.fcmToken);
            (0, notification_1.sendEmailWithdraw)("", "Invoice Payment Processing", "Review Invoice Payment Fiat Payment");
            res.status(200).json({ status: 'success' });
        }
        else {
            console.log("update invoice on failed");
            console.log("failed...");
            res.status(200).json({ status: 'success' });
        }
    }
    else {
        console.log("already proceesed");
        console.log("processed...");
        res.status(200).json({ status: 'success' });
    }
});
exports.webhookMoonPay = webhookMoonPay;
const webhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    if (req.headers["radom-verification-key"] != configSetup_1.default.VERIFICATIONKEY) {
        return res.sendStatus(401);
    }
    console.log(util.inspect(req.body, false, null, true /* enable colors */));
    if (body.eventType == "managedPayment") {
        if (body.radomData.invoice) {
            const invoice = yield Invoice_1.Invoice.findOne({ where: { randoId: body.radomData.invoice.invoiceId } });
            if (!invoice)
                return res.sendStatus(200);
            if (invoice === null || invoice === void 0 ? void 0 : invoice.processed)
                return res.sendStatus(200);
            const response = yield axios({
                method: 'GET',
                url: `https://api.radom.network/invoice/${body.radomData.invoice.invoiceId}`,
                headers: { 'Content-Type': 'application/json', Authorization: `${configSetup_1.default.RADON}` },
            });
            const data = JSON.parse(JSON.stringify(response.data));
            yield invoice.update({
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
            });
            const newInvoice = yield Invoice_1.Invoice.findOne({ where: { randoId: body.radomData.invoice.invoiceId } });
            // let formattedJson = JSON.parse(JSON.stringify(newInvoice?.dataValues.payment))
            let formattedJson = JSON.parse(JSON.stringify(newInvoice === null || newInvoice === void 0 ? void 0 : newInvoice.payment));
            let finalFormattedJson = JSON.parse(formattedJson);
            let token = finalFormattedJson.managed.conversionRates[0].to;
            let amountToCredit = body.eventData.managedPayment.amount;
            let getToken = yield Token_1.Tokens.findOne({ where: { currency: token } });
            if (getToken) {
                const userToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: getToken.id, userId: invoice === null || invoice === void 0 ? void 0 : invoice.userId } });
                const user = yield Users_1.Users.findOne({ where: { id: invoice === null || invoice === void 0 ? void 0 : invoice.userId } });
                if (userToken) {
                    yield userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) });
                    yield invoice.update({ processed: true });
                    const tokenX = yield Token_1.Tokens.findOne({ where: { symbol: invoice === null || invoice === void 0 ? void 0 : invoice.symbol } });
                    const creditedToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.id } });
                    yield Transaction_1.Transactions.create({
                        ref: (0, utility_1.createRandomRef)(8, "txt"),
                        description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
                        title: "Invoice Payment Successful",
                        type: Transaction_1.TransactionType.CREDIT,
                        service: Transaction_1.ServiceType.INVOICE,
                        amount: amountToCredit,
                        status: Transaction_1.TransactionStatus.COMPLETE,
                        mata: invoice,
                        userId: invoice === null || invoice === void 0 ? void 0 : invoice.userId
                    });
                    yield (0, notification_1.sendFcmNotification)("Invoice Payment Successful", {
                        description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
                        title: "Invoice Payment Successful",
                        type: Transaction_1.TransactionType.CREDIT,
                        service: Transaction_1.ServiceType.INVOICE,
                        mata: {
                            invoice: Object.assign({}, invoice === null || invoice === void 0 ? void 0 : invoice.dataValues), token: {
                                title: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.symbol,
                                tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.id,
                                id: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.id,
                                currency: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.currency,
                                amount: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.balance,
                                icon: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.url
                            }
                        },
                    }, user.fcmToken);
                    yield (0, notification_1.sendEmail)(data.customer.email, `Payment Received for Invoice ${invoice.randoId}`, (0, template_1.templateEmail)(`Payment Received for Invoice ${invoice.randoId}`, `<div>We are pleased to inform you that we have successfully received your payment for the invoice ${invoice.randoId}. Your prompt action is greatly appreciated.<br>
  
            Here are the details of your payment:<br><br>
            
            Invoice Number: ${invoice.randoId}<br>
            Amount Received: ${amountToCredit}<br>
            Payment Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
            Thank you for your timely settlement. Your cooperation is essential in maintaining smooth business operations.<br><br>
      
            Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
            
            </div>`));
                    yield (0, notification_1.sendEmail)(user.email, `Payment Received for Invoice ${invoice.randoId}`, (0, template_1.templateEmail)(`Payment Received for Invoice ${invoice.randoId}`, `<div>We are pleased to inform you that ${invoice.customer.name} successfully paid for your invoice ${invoice.randoId}.<br>
  
            Here are the details of the payment:<br><br>
            
            Invoice Number: ${invoice.randoId}<br>
            Amount Received: ${amountToCredit}<br>
            Payment Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
            Your cooperation is essential in maintaining smooth business operations.<br><br>
      
            Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
            
            </div>`));
                    return res.sendStatus(200);
                }
                else {
                    const userToken = yield UserToken_1.UserTokens.create({ tokenId: getToken.id, userId: invoice === null || invoice === void 0 ? void 0 : invoice.userId });
                    yield userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) });
                    const tokenX = yield Token_1.Tokens.findOne({ where: { symbol: invoice === null || invoice === void 0 ? void 0 : invoice.symbol } });
                    const creditedToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.id } });
                    yield Transaction_1.Transactions.create({
                        ref: (0, utility_1.createRandomRef)(8, "txt"),
                        description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
                        title: "Invoice Payment Successful",
                        type: Transaction_1.TransactionType.CREDIT,
                        service: Transaction_1.ServiceType.INVOICE,
                        amount: amountToCredit,
                        status: Transaction_1.TransactionStatus.COMPLETE,
                        mata: invoice,
                        userId: invoice === null || invoice === void 0 ? void 0 : invoice.userId
                    });
                    yield (0, notification_1.sendFcmNotification)("Invoice Payment Successful", {
                        description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
                        title: "Invoice Payment Successful",
                        type: Transaction_1.TransactionType.CREDIT,
                        mata: {
                            invoice: Object.assign({}, invoice === null || invoice === void 0 ? void 0 : invoice.dataValues), token: {
                                title: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.symbol,
                                tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.id,
                                id: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.id,
                                currency: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.currency,
                                amount: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.balance,
                                icon: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.url
                            }
                        },
                        service: Transaction_1.ServiceType.INVOICE,
                    }, user.fcmToken);
                    yield (0, notification_1.sendEmail)(data.customer.email, `Payment Received for Invoice ${invoice.randoId}`, (0, template_1.templateEmail)(`Payment Received for Invoice ${invoice.randoId}`, `<div>We are pleased to inform you that we have successfully received your payment for the invoice ${invoice.randoId}. Your prompt action is greatly appreciated.<br>
  
            Here are the details of your payment:<br><br>
            
            Invoice Number: ${invoice.randoId}<br>
            Amount Received: ${amountToCredit}<br>
            Payment Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
            Thank you for your timely settlement. Your cooperation is essential in maintaining smooth business operations.<br><br>
      
            Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
            
            </div>`));
                    yield (0, notification_1.sendEmail)(user.email, `Payment Received for Invoice ${invoice.randoId}`, (0, template_1.templateEmail)(`Payment Received for Invoice ${invoice.randoId}`, `<div>We are pleased to inform you that ${invoice.customer.name} successfully paid for your invoice ${invoice.randoId}.<br>
  
            Here are the details of the payment:<br><br>
            
            Invoice Number: ${invoice.randoId}<br>
            Amount Received: ${amountToCredit}<br>
            Payment Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
            Your cooperation is essential in maintaining smooth business operations.<br><br>
      
            Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
            
            </div>`));
                    yield invoice.update({ processed: true });
                    return res.sendStatus(200);
                }
            }
            else {
                const response = yield axios({
                    method: 'GET',
                    url: `https://api.coinranking.com/v2/coins`,
                    headers: { 'Content-Type': 'application/json' },
                });
                const coinObject = response.data.data.coins.find((obj) => obj.symbol == token);
                let getToken = yield Token_1.Tokens.create({
                    currency: token,
                    symbol: token,
                    url: coinObject.iconUrl
                });
                const userToken = yield UserToken_1.UserTokens.create({ tokenId: getToken.id, userId: invoice === null || invoice === void 0 ? void 0 : invoice.userId });
                yield userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) });
                yield invoice.update({ processed: true });
                const user = yield Users_1.Users.findOne({ where: { id: invoice === null || invoice === void 0 ? void 0 : invoice.userId } });
                const tokenX = yield Token_1.Tokens.findOne({ where: { symbol: invoice === null || invoice === void 0 ? void 0 : invoice.symbol } });
                const creditedToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.id } });
                yield Transaction_1.Transactions.create({
                    ref: (0, utility_1.createRandomRef)(8, "txt"),
                    description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
                    title: "Invoice Payment Successful",
                    type: Transaction_1.TransactionType.CREDIT,
                    service: Transaction_1.ServiceType.INVOICE,
                    amount: amountToCredit,
                    status: Transaction_1.TransactionStatus.COMPLETE,
                    mata: invoice,
                    userId: invoice === null || invoice === void 0 ? void 0 : invoice.userId
                });
                yield (0, notification_1.sendFcmNotification)("Invoice Payment Successful", {
                    description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
                    title: "Invoice Payment Successful",
                    type: Transaction_1.TransactionType.CREDIT,
                    service: Transaction_1.ServiceType.INVOICE,
                    mata: {
                        invoice: Object.assign({}, invoice === null || invoice === void 0 ? void 0 : invoice.dataValues),
                        token: {
                            title: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.symbol,
                            tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.id,
                            id: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.id,
                            currency: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.currency,
                            amount: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.balance,
                            icon: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.url
                        }
                    },
                }, user.fcmToken);
                yield (0, notification_1.sendEmail)(data.customer.email, `Payment Received for Invoice ${invoice.randoId}`, (0, template_1.templateEmail)(`Payment Received for Invoice ${invoice.randoId}`, `<div>We are pleased to inform you that we have successfully received your payment for the invoice ${invoice.randoId}. Your prompt action is greatly appreciated.<br>
  
        Here are the details of your payment:<br><br>
        
        Invoice Number: ${invoice.randoId}<br>
        Amount Received: ${amountToCredit}<br>
        Payment Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
        Thank you for your timely settlement. Your cooperation is essential in maintaining smooth business operations.<br><br>
  
        Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
        
        </div>`));
                yield (0, notification_1.sendEmail)(user.email, `Payment Received for Invoice ${invoice.randoId}`, (0, template_1.templateEmail)(`Payment Received for Invoice ${invoice.randoId}`, `<div>We are pleased to inform you that ${invoice.customer.name} successfully paid for your invoice ${invoice.randoId}.<br>
  
        Here are the details of the payment:<br><br>
        
        Invoice Number: ${invoice.randoId}<br>
        Amount Received: ${amountToCredit}<br>
        Payment Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
        Your cooperation is essential in maintaining smooth business operations.<br><br>
  
        Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
        
        </div>`));
                return res.sendStatus(200);
            }
        }
        else if (body.radomData.paymentLink) {
            const request = yield Payment_1.PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } });
            if (!request)
                return res.sendStatus(200);
            if (request === null || request === void 0 ? void 0 : request.processed)
                return res.sendStatus(200);
            const response = yield axios({
                method: 'GET',
                url: `https://api.radom.network/payment_link/${body.radomData.paymentLink.paymentLinkId}`,
                headers: { 'Content-Type': 'application/json', Authorization: `${configSetup_1.default.RADON}` },
            });
            const data = JSON.parse(JSON.stringify(response.data));
            yield request.update({
                organizationId: data.organizationId,
                url: data.url,
                sellerName: data.sellerName,
                sellerLogoUrl: data.sellerLogoUrl,
                cancelUrl: data.cancelUrl,
                successUrl: data.successUrl,
                products: data.products,
                gateway: data.gateway
            });
            const newRequest = yield Payment_1.PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } });
            let token = request.symbol;
            let amountToCredit = body.eventData.managedPayment.amount;
            if (request.type == Payment_1.TypeState.PAYMENT_LINK) {
                let getToken = yield Token_1.Tokens.findOne({ where: { currency: token } });
                if (getToken) {
                    const userToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: getToken.id, userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId } });
                    if (userToken) {
                        yield userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) });
                        yield newRequest.update({ processed: true });
                        const user = yield Users_1.Users.findOne({ where: { id: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId } });
                        const tokenX = yield Token_1.Tokens.findOne({ where: { symbol: getToken === null || getToken === void 0 ? void 0 : getToken.symbol } });
                        const creditedToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.id } });
                        yield Transaction_1.Transactions.create({
                            ref: (0, utility_1.createRandomRef)(8, "txt"),
                            description: `You Recieved a Payment Request of ${tokenX === null || tokenX === void 0 ? void 0 : tokenX.symbol} ${amountToCredit} Successfully`,
                            title: "Payment Request Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            service: Transaction_1.ServiceType.PAYMENT_REQUEST,
                            amount: amountToCredit,
                            status: Transaction_1.TransactionStatus.COMPLETE,
                            mata: newRequest,
                            userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId
                        });
                        yield (0, notification_1.sendFcmNotification)("Payment Request Paid Successfully", {
                            description: `You Recieved a Payment Request of ${tokenX === null || tokenX === void 0 ? void 0 : tokenX.symbol} ${amountToCredit} Successfully`,
                            title: "Payment Request Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            mata: {
                                token: {
                                    title: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.symbol,
                                    tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.id,
                                    id: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.id,
                                    currency: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.currency,
                                    amount: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.balance,
                                    icon: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.url
                                }
                            },
                            service: Transaction_1.ServiceType.PAYMENT_REQUEST,
                        }, user.fcmToken);
                        yield (0, notification_1.sendEmail)(data.customer.email, `Payment Received for Request ${newRequest.randoId}`, (0, template_1.templateEmail)(`Payment Received for Request ${newRequest.randoId}`, `<div>We are pleased to inform you that we have successfully received your payment for the request ${newRequest.randoId}. Your prompt action is greatly appreciated.<br>
  
            Here are the details of your payment:<br><br>
            
            Request Number: ${newRequest.randoId}<br>
            Amount Received: ${tokenX === null || tokenX === void 0 ? void 0 : tokenX.symbol} ${amountToCredit}<br>
            Payment Date: ${newRequest.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
            Thank you for your timely settlement. Your cooperation is essential in maintaining smooth business operations.<br><br>
      
            Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
            
            </div>`));
                        yield (0, notification_1.sendEmail)(user.email, `Payment Received for Request ${newRequest.randoId}`, (0, template_1.templateEmail)(`Payment Received for Request ${newRequest.randoId}`, `<div>We are pleased to inform you that ${newRequest.email} successfully paid for your request ${newRequest.randoId}.<br>
  
            Here are the details of the payment:<br><br>
            
            Request Number: ${newRequest.randoId}<br>
            Amount Received: ${amountToCredit}<br>
            Payment Date: ${newRequest.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
            Your cooperation is essential in maintaining smooth business operations.<br><br>
      
            Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
            
            </div>`));
                        return res.sendStatus(200);
                    }
                    else {
                        const userToken = yield UserToken_1.UserTokens.create({ tokenId: getToken.id, userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId });
                        yield userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) });
                        yield newRequest.update({ processed: true });
                        const user = yield Users_1.Users.findOne({ where: { id: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId } });
                        const tokenX = yield Token_1.Tokens.findOne({ where: { symbol: getToken === null || getToken === void 0 ? void 0 : getToken.symbol } });
                        const creditedToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.id } });
                        yield Transaction_1.Transactions.create({
                            ref: (0, utility_1.createRandomRef)(8, "txt"),
                            description: `You Recieved a Payment Request of ${tokenX === null || tokenX === void 0 ? void 0 : tokenX.symbol} ${amountToCredit} Successfully`,
                            title: "Payment Request Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            service: Transaction_1.ServiceType.PAYMENT_REQUEST,
                            amount: amountToCredit,
                            status: Transaction_1.TransactionStatus.COMPLETE,
                            mata: newRequest,
                            userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId
                        });
                        yield (0, notification_1.sendFcmNotification)("Payment Request Paid Successfully", {
                            description: `You Recieved a Payment Request of ${tokenX === null || tokenX === void 0 ? void 0 : tokenX.symbol} ${amountToCredit} Successfully`,
                            title: "Payment Request Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            mata: {
                                token: {
                                    title: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.symbol,
                                    tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.id,
                                    id: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.id,
                                    currency: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.currency,
                                    amount: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.balance,
                                    icon: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.url
                                }
                            },
                            service: Transaction_1.ServiceType.PAYMENT_REQUEST,
                        }, user.fcmToken);
                        yield (0, notification_1.sendEmail)(data.customer.email, `Payment Received for Request ${newRequest.randoId}`, (0, template_1.templateEmail)(`Payment Received for Request ${newRequest.randoId}`, `<div>We are pleased to inform you that we have successfully received your payment for the request ${newRequest.randoId}. Your prompt action is greatly appreciated.<br>
  
            Here are the details of your payment:<br><br>
            
            Request Number: ${newRequest.randoId}<br>
            Amount Received: ${tokenX === null || tokenX === void 0 ? void 0 : tokenX.symbol} ${amountToCredit}<br>
            Payment Date: ${newRequest.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
            Thank you for your timely settlement. Your cooperation is essential in maintaining smooth business operations.<br><br>
      
            Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
            
            </div>`));
                        yield (0, notification_1.sendEmail)(user.email, `Payment Received for Request ${newRequest.randoId}`, (0, template_1.templateEmail)(`Payment Received for Request ${newRequest.randoId}`, `<div>We are pleased to inform you that ${newRequest.email} successfully paid for your request ${newRequest.randoId}.<br>
  
            Here are the details of the payment:<br><br>
            
            Request Number: ${newRequest.randoId}<br>
            Amount Received: ${amountToCredit}<br>
            Payment Date: ${newRequest.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
            Your cooperation is essential in maintaining smooth business operations.<br><br>
      
            Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
            
            </div>`));
                        return res.sendStatus(200);
                    }
                }
                else {
                    const response = yield axios({
                        method: 'GET',
                        url: `https://api.coinranking.com/v2/coins`,
                        headers: { 'Content-Type': 'application/json' },
                    });
                    const coinObject = response.data.data.coins.find((obj) => obj.symbol == token);
                    let getToken = yield Token_1.Tokens.create({
                        currency: token,
                        symbol: token,
                        url: coinObject.iconUrl
                    });
                    const tokenX = yield Token_1.Tokens.findOne({ where: { symbol: getToken === null || getToken === void 0 ? void 0 : getToken.symbol } });
                    const creditedToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.id } });
                    const userToken = yield UserToken_1.UserTokens.create({ tokenId: getToken.id, userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId });
                    yield userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) });
                    yield newRequest.update({ processed: true });
                    const user = yield Users_1.Users.findOne({ where: { id: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId } });
                    yield Transaction_1.Transactions.create({
                        ref: (0, utility_1.createRandomRef)(8, "txt"),
                        description: `You Recieved a Payment Request of ${tokenX === null || tokenX === void 0 ? void 0 : tokenX.symbol} ${amountToCredit} Successfully`,
                        title: "Payment Request Paid Successfully",
                        type: Transaction_1.TransactionType.CREDIT,
                        service: Transaction_1.ServiceType.PAYMENT_REQUEST,
                        amount: amountToCredit,
                        status: Transaction_1.TransactionStatus.COMPLETE,
                        mata: newRequest,
                        userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId
                    });
                    yield (0, notification_1.sendFcmNotification)("Payment Request Paid Successfully", {
                        description: `You Recieved a Payment Request of ${tokenX === null || tokenX === void 0 ? void 0 : tokenX.symbol} ${amountToCredit} Successfully`,
                        title: "Payment Request Paid Successfully",
                        type: Transaction_1.TransactionType.CREDIT,
                        mata: {
                            token: {
                                title: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.symbol,
                                tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.id,
                                id: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.id,
                                currency: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.currency,
                                amount: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.balance,
                                icon: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.url
                            }
                        },
                        service: Transaction_1.ServiceType.PAYMENT_REQUEST,
                    }, user.fcmToken);
                    yield (0, notification_1.sendEmail)(data.customer.email, `Payment Received for Request ${newRequest.randoId}`, (0, template_1.templateEmail)(`Payment Received for Request ${newRequest.randoId}`, `<div>We are pleased to inform you that we have successfully received your payment for the request ${newRequest.randoId}. Your prompt action is greatly appreciated.<br>
  
          Here are the details of your payment:<br><br>
          
          Request Number: ${newRequest.randoId}<br>
          Amount Received: ${tokenX === null || tokenX === void 0 ? void 0 : tokenX.symbol} ${amountToCredit}<br>
          Payment Date: ${newRequest.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          Thank you for your timely settlement. Your cooperation is essential in maintaining smooth business operations.<br><br>
    
          Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
          
          </div>`));
                    yield (0, notification_1.sendEmail)(user.email, `Payment Received for Request ${newRequest.randoId}`, (0, template_1.templateEmail)(`Payment Received for Request ${newRequest.randoId}`, `<div>We are pleased to inform you that ${newRequest.email} successfully paid for your request ${newRequest.randoId}.<br>
  
          Here are the details of the payment:<br><br>
          
          Request Number: ${newRequest.randoId}<br>
          Amount Received: ${amountToCredit}<br>
          Payment Date: ${newRequest.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          Your cooperation is essential in maintaining smooth business operations.<br><br>
    
          Should you have any questions or require further assistance, please don't hesitate to contact us. We're here to help!
          
          </div>`));
                    return res.sendStatus(200);
                }
            }
            else {
                let getToken = yield Token_1.Tokens.findOne({ where: { currency: token } });
                if (getToken) {
                    const userToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: getToken.id, userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId } });
                    if (userToken) {
                        yield userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) });
                        yield newRequest.update({ targetReached: Number(newRequest === null || newRequest === void 0 ? void 0 : newRequest.targetReached) + Number(amountToCredit) });
                        const newRequestLatest = yield Payment_1.PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } });
                        yield newRequestLatest.update({ processed: Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.targetReached) >= Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.target) ? true : false });
                        const user = yield Users_1.Users.findOne({ where: { id: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId } });
                        const tokenX = yield Token_1.Tokens.findOne({ where: { symbol: getToken === null || getToken === void 0 ? void 0 : getToken.symbol } });
                        const creditedToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.id } });
                        Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.targetReached) >= Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.target) ?
                            yield (0, notification_1.sendEmail)(user.email, "Congratulations! You've Reached Your Crowdfunding Goal", (0, template_1.templateEmail)("Congratulations! You've Reached Your Crowdfunding Goal", `<div>We are thrilled to inform you that your crowdfunding campaign has successfully reached its goal! Congratulations on this incredible achievement!<br><br>
  
                Your dedication, hard work, and passion have paid off, and your campaign has resonated with supporters who believe in your vision. Together, you've created something truly remarkable.<br><br>
                
                Reaching this milestone is a testament to your determination and the strength of your community. Your supporters have rallied behind you, demonstrating their belief in your project and their commitment to helping you succeed.<br><br>
                
                We want to extend our heartfelt congratulations to you on this momentous occasion. Your success is well-deserved, and we are excited to see where your journey takes you next.<br><br>
                
                As you celebrate this achievement, please know that we are here to support you every step of the way. If you need any assistance or have any questions, please don't hesitate to reach out to us.<br><br>
                
                Once again, congratulations on reaching your crowdfunding goal! We wish you continued success and look forward to seeing the incredible impact of your project.</div>`)) :
                            yield (0, notification_1.sendEmail)(user.email, "Crowdfund Payment Successful", (0, template_1.templateEmail)("Crowdfund Payment Successful", `<div>We're excited to inform you that a payment has been successfully processed for your crowdfunding campaign.<br><br>
                 Your supporters are rallying behind your project, and their contributions are making a tangible impact.<br><br>
  
                Here are the details of the transaction:<br><br>
                
                Amount Received: ${tokenX === null || tokenX === void 0 ? void 0 : tokenX.symbol} ${amountToCredit}<br>
                Date of Payment: ${newRequest.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>
    
                This payment represents another step forward in achieving your crowdfunding goal. We're thrilled to see the support pouring in for your project, and we're committed to helping you every step of the way.<br><br>
                
                If you have any questions or need further assistance, please feel free to reach out to us. We're here to support you and ensure the success of your crowdfunding campaign.<br><br>
                
                Congratulations on this successful payment, and best of luck with your project!</div>`));
                        yield Transaction_1.Transactions.create({
                            ref: (0, utility_1.createRandomRef)(8, "txt"),
                            description: "Crowdfund Paid Successfully",
                            title: "Crowdfund Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            service: Transaction_1.ServiceType.CROWD_FUND,
                            amount: amountToCredit,
                            status: Transaction_1.TransactionStatus.COMPLETE,
                            mata: newRequestLatest,
                            userId: newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.userId
                        });
                        yield (0, notification_1.sendFcmNotification)("Crowdfund Paid Successfully", {
                            title: "Crowdfund Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            mata: {
                                token: {
                                    title: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.symbol,
                                    tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.id,
                                    id: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.id,
                                    currency: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.currency,
                                    amount: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.balance,
                                    icon: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.url
                                }
                            },
                            service: Transaction_1.ServiceType.CROWD_FUND,
                        }, user.fcmToken);
                        return res.sendStatus(200);
                    }
                    else {
                        const userToken = yield UserToken_1.UserTokens.create({ tokenId: getToken.id, userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId });
                        yield userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) });
                        yield newRequest.update({ targetReached: Number(newRequest === null || newRequest === void 0 ? void 0 : newRequest.targetReached) + Number(amountToCredit) });
                        const newRequestLatest = yield Payment_1.PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } });
                        yield newRequestLatest.update({ processed: Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.targetReached) >= Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.target) ? true : false });
                        const user = yield Users_1.Users.findOne({ where: { id: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId } });
                        const tokenX = yield Token_1.Tokens.findOne({ where: { symbol: getToken === null || getToken === void 0 ? void 0 : getToken.symbol } });
                        const creditedToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.id } });
                        Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.targetReached) >= Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.target) ?
                            yield (0, notification_1.sendEmail)(user.email, "Congratulations! You've Reached Your Crowdfunding Goal", (0, template_1.templateEmail)("Congratulations! You've Reached Your Crowdfunding Goal", `<div>We are thrilled to inform you that your crowdfunding campaign has successfully reached its goal! Congratulations on this incredible achievement!<br><br>
  
             Your dedication, hard work, and passion have paid off, and your campaign has resonated with supporters who believe in your vision. Together, you've created something truly remarkable.<br><br>
             
             Reaching this milestone is a testament to your determination and the strength of your community. Your supporters have rallied behind you, demonstrating their belief in your project and their commitment to helping you succeed.<br><br>
             
             We want to extend our heartfelt congratulations to you on this momentous occasion. Your success is well-deserved, and we are excited to see where your journey takes you next.<br><br>
             
             As you celebrate this achievement, please know that we are here to support you every step of the way. If you need any assistance or have any questions, please don't hesitate to reach out to us.<br><br>
             
             Once again, congratulations on reaching your crowdfunding goal! We wish you continued success and look forward to seeing the incredible impact of your project.</div>`)) :
                            yield (0, notification_1.sendEmail)(user.email, "Crowdfund Payment Successful", (0, template_1.templateEmail)("Crowdfund Payment Successful", `
             <div>We're excited to inform you that a payment has been successfully processed for your crowdfunding campaign.<br><br>
              Your supporters are rallying behind your project, and their contributions are making a tangible impact.<br><br>
  
             Here are the details of the transaction:<br><br>
             
             Amount Received: ${tokenX === null || tokenX === void 0 ? void 0 : tokenX.symbol} ${amountToCredit}<br>
             Date of Payment: ${newRequest.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>
  
             This payment represents another step forward in achieving your crowdfunding goal. We're thrilled to see the support pouring in for your project, and we're committed to helping you every step of the way.<br><br>
             
             If you have any questions or need further assistance, please feel free to reach out to us. We're here to support you and ensure the success of your crowdfunding campaign.<br><br>
             
             Congratulations on this successful payment, and best of luck with your project!</div>`));
                        yield Transaction_1.Transactions.create({
                            ref: (0, utility_1.createRandomRef)(8, "txt"),
                            description: "Crowdfund Paid Successfully",
                            title: "Crowdfund Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            service: Transaction_1.ServiceType.CROWD_FUND,
                            amount: amountToCredit,
                            status: Transaction_1.TransactionStatus.COMPLETE,
                            mata: newRequestLatest,
                            userId: newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.userId
                        });
                        yield (0, notification_1.sendFcmNotification)("Crowdfund Paid Successfully", {
                            description: `You Recieved a Crowdfund Paymemt of $${amountToCredit} Successfully`,
                            title: "Crowdfund Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            mata: {
                                token: {
                                    title: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.symbol,
                                    tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.id,
                                    id: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.id,
                                    currency: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.currency,
                                    amount: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.balance,
                                    icon: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.url
                                }
                            },
                            service: Transaction_1.ServiceType.CROWD_FUND,
                        }, user.fcmToken);
                        return res.sendStatus(200);
                    }
                }
                else {
                    const response = yield axios({
                        method: 'GET',
                        url: `https://api.coinranking.com/v2/coins`,
                        headers: { 'Content-Type': 'application/json' },
                    });
                    const coinObject = response.data.data.coins.find((obj) => obj.symbol == token);
                    let getToken = yield Token_1.Tokens.create({
                        currency: token,
                        symbol: token,
                        url: coinObject.iconUrl
                    });
                    const userToken = yield UserToken_1.UserTokens.create({ tokenId: getToken.id, userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId });
                    yield userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) });
                    yield newRequest.update({ targetReached: Number(newRequest === null || newRequest === void 0 ? void 0 : newRequest.targetReached) + Number(amountToCredit) });
                    const newRequestLatest = yield Payment_1.PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } });
                    yield newRequestLatest.update({ processed: Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.targetReached) >= Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.target) ? true : false });
                    const user = yield Users_1.Users.findOne({ where: { id: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId } });
                    const tokenX = yield Token_1.Tokens.findOne({ where: { symbol: getToken === null || getToken === void 0 ? void 0 : getToken.symbol } });
                    const creditedToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.id } });
                    Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.targetReached) >= Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.target) ?
                        yield (0, notification_1.sendEmail)(user.email, "Congratulations! You've Reached Your Crowdfunding Goal", (0, template_1.templateEmail)("Congratulations! You've Reached Your Crowdfunding Goal", `<div>We are thrilled to inform you that your crowdfunding campaign has successfully reached its goal! Congratulations on this incredible achievement!<br><br>
  
           Your dedication, hard work, and passion have paid off, and your campaign has resonated with supporters who believe in your vision. Together, you've created something truly remarkable.<br><br>
           
           Reaching this milestone is a testament to your determination and the strength of your community. Your supporters have rallied behind you, demonstrating their belief in your project and their commitment to helping you succeed.<br><br>
           
           We want to extend our heartfelt congratulations to you on this momentous occasion. Your success is well-deserved, and we are excited to see where your journey takes you next.<br><br>
           
           As you celebrate this achievement, please know that we are here to support you every step of the way. If you need any assistance or have any questions, please don't hesitate to reach out to us.<br><br>
           
           Once again, congratulations on reaching your crowdfunding goal! We wish you continued success and look forward to seeing the incredible impact of your project.</div>`)) :
                        yield (0, notification_1.sendEmail)(user.email, "Crowdfund Payment Successful", (0, template_1.templateEmail)("Crowdfund Payment Successful", `
           <div>We're excited to inform you that a payment has been successfully processed for your crowdfunding campaign.<br><br>
            Your supporters are rallying behind your project, and their contributions are making a tangible impact.<br><br>
  
           Here are the details of the transaction:<br><br>
           
           Amount Received: ${tokenX === null || tokenX === void 0 ? void 0 : tokenX.symbol} ${amountToCredit}<br>
           Date of Payment: ${newRequest.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>
  
           This payment represents another step forward in achieving your crowdfunding goal. We're thrilled to see the support pouring in for your project, and we're committed to helping you every step of the way.<br><br>
           
           If you have any questions or need further assistance, please feel free to reach out to us. We're here to support you and ensure the success of your crowdfunding campaign.<br><br>
           
           Congratulations on this successful payment, and best of luck with your project!</div>`));
                    yield Transaction_1.Transactions.create({
                        ref: (0, utility_1.createRandomRef)(8, "txt"),
                        description: `You Recieved a Crowdfund Paymemt of $${amountToCredit} Successfully`,
                        title: "Crowdfund Paid Successfully",
                        type: Transaction_1.TransactionType.CREDIT,
                        service: Transaction_1.ServiceType.CROWD_FUND,
                        amount: amountToCredit,
                        status: Transaction_1.TransactionStatus.COMPLETE,
                        mata: newRequestLatest,
                        userId: newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.userId
                    });
                    yield (0, notification_1.sendFcmNotification)("Crowdfund Paid Successfully", {
                        description: `You Recieved a Crowdfund Paymemt of $${amountToCredit} Successfully`,
                        title: "Crowdfund Paid Successfully",
                        type: Transaction_1.TransactionType.CREDIT,
                        mata: {
                            token: {
                                title: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.symbol,
                                tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.id,
                                id: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.id,
                                currency: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.currency,
                                amount: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.balance,
                                icon: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.url
                            }
                        },
                        service: Transaction_1.ServiceType.CROWD_FUND,
                    }, user.fcmToken);
                    return res.sendStatus(200);
                }
            }
        }
        else {
            return res.sendStatus(200);
        }
    }
    else if (body.eventType == "managedWithdrawal") {
        const withdrawal = yield Withdrawal_1.Withdrawal.findOne({ where: { randoId: body.eventData.managedWithdrawal.withdrawalRequestId } });
        if (!withdrawal)
            return res.sendStatus(200);
        if (withdrawal === null || withdrawal === void 0 ? void 0 : withdrawal.processed)
            return res.sendStatus(200);
        yield (withdrawal === null || withdrawal === void 0 ? void 0 : withdrawal.update({
            status: body.eventData.managedWithdrawal.isSuccess == true ? Withdrawal_1.WithdrawalStatus.COMPLETE : Withdrawal_1.WithdrawalStatus.FAILED,
            reason: body.eventData.managedWithdrawal.failureReason, processed: true
        }));
        const user = yield Users_1.Users.findOne({ where: { id: withdrawal === null || withdrawal === void 0 ? void 0 : withdrawal.userId } });
        const tokenX = yield Token_1.Tokens.findOne({ where: { symbol: withdrawal === null || withdrawal === void 0 ? void 0 : withdrawal.symbol } });
        const creditedToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.id } });
        yield Transaction_1.Transactions.create({
            ref: (0, utility_1.createRandomRef)(8, "txt"),
            description: `Withdrawal of ${withdrawal.symbol} ${withdrawal.amount} is Successful`,
            title: "Withdrawal Successful",
            type: Transaction_1.TransactionType.DEBIT,
            service: Transaction_1.ServiceType.WITHDRAWAL,
            amount: withdrawal.amount,
            status: Transaction_1.TransactionStatus.COMPLETE,
            mata: withdrawal,
            userId: withdrawal === null || withdrawal === void 0 ? void 0 : withdrawal.userId
        });
        yield (0, notification_1.sendEmail)(user.email, "Withdrawal Successful", (0, template_1.templateEmail)("Withdrawal Successful", `<div>We're pleased to inform you that your recent withdrawal request has been successfully processed. The funds have been transferred to your designated account.<br><br>
  
      Here are the details of the withdrawal:<br><br>
      
      Withdrawal ID: ${withdrawal.id} <br>
      Amount Withdrawn: ${withdrawal.amount}<br>
      Date of Withdrawal: ${withdrawal.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>
    
      We hope this transaction meets your expectations, and we're here to assist you with any further inquiries or assistance you may require.<br>
      
      Thank you for choosing our service, and we look forward to serving you again in the future.</div>`));
        yield (0, notification_1.sendFcmNotification)("Withdrawal Successful", {
            description: `Withdrawal of ${withdrawal.symbol} ${withdrawal.amount} is Successful`,
            title: "Withdrawal Successful",
            type: Transaction_1.TransactionType.DEBIT,
            mata: {
                token: {
                    title: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.symbol,
                    tokenId: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.id,
                    id: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.id,
                    currency: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.currency,
                    amount: creditedToken === null || creditedToken === void 0 ? void 0 : creditedToken.dataValues.balance,
                    icon: tokenX === null || tokenX === void 0 ? void 0 : tokenX.dataValues.url
                }
            },
            service: Transaction_1.ServiceType.WITHDRAWAL,
        }, user.fcmToken);
        console.log(user.fcmToken);
        console.log(user.fcmToken);
        return res.sendStatus(200);
    }
    else {
        return res.sendStatus(200);
    }
});
exports.webhook = webhook;
//# sourceMappingURL=webhook.js.map