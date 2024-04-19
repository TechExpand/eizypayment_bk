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
exports.sendInvoiceReminder = exports.updateInvoiceStatus = exports.webhook = exports.fetchAllNetwork = exports.fetchSignleInvoice = exports.fetchInvoice = exports.createInvoice = void 0;
const utility_1 = require("../helpers/utility");
const Users_1 = require("../models/Users");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const paymentMainNet_json_1 = __importDefault(require("../config/paymentMainNet.json"));
const paymentTestNet_json_1 = __importDefault(require("../config/paymentTestNet.json"));
// yarn add stream-chat
const util = require('util');
const Invoice_1 = require("../models/Invoice");
const Token_1 = require("../models/Token");
const UserToken_1 = require("../models/UserToken");
const Withdrawal_1 = require("../models/Withdrawal");
const notification_1 = require("../services/notification");
const Payment_1 = require("../models/Payment");
const Transaction_1 = require("../models/Transaction");
const fs = require("fs");
const axios = require('axios');
const createInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { lineItems, overdueAt, network, customerId, token, subTotal, symbol, business, title, invoiceNo, invoiceDate, noteHidden, noteVisible } = req.body;
    const user = yield Users_1.Users.findOne({ where: { id } });
    try {
        const response = yield axios({
            method: 'POST',
            url: 'https://api.radom.network/invoice',
            headers: { 'Content-Type': 'application/json', Authorization: `${configSetup_1.default.RADON}` },
            data: {
                customerIds: [customerId],
                products: [],
                lineItems: lineItems,
                overdueAt: new Date(overdueAt).toISOString(),
                inputData: [{
                        "key": "name",
                        "value": user === null || user === void 0 ? void 0 : user.email
                    }],
                memo: null,
                gateway: {
                    managed: { methods: [{ network, token, discountPercentOff: null }] }
                }
            }
        });
        console.log(util.inspect(response.data, false, null, true /* enable colors */));
        const invoice = yield Invoice_1.Invoice.create({
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
        });
        yield (0, notification_1.sendEmail)(invoice === null || invoice === void 0 ? void 0 : invoice.customer.email, "Invoice", `<div>invoice sent</div>`);
        return (0, utility_1.successResponse)(res, "Successful", invoice);
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            return (0, utility_1.successResponse)(res, "Failed", error.response.data);
            // Do something with this error...
        }
        else {
            console.error(error);
            return (0, utility_1.successResponse)(res, "Failed", error);
        }
    }
});
exports.createInvoice = createInvoice;
const fetchInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const invoice = yield Invoice_1.Invoice.findAll({ where: { userId: id } });
    console.log(invoice);
    return (0, utility_1.successResponse)(res, "Successful", invoice);
});
exports.fetchInvoice = fetchInvoice;
const fetchSignleInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield Users_1.Users.findOne({ where: { id } });
    const invoice = yield Invoice_1.Invoice.findOne({ where: { randoId: id } });
    try {
        const response = yield axios({
            method: 'GET',
            url: `https://api.radom.network/invoice/${id}`,
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
        const newInvoice = yield Invoice_1.Invoice.findOne({ where: { randoId: id } });
        return (0, utility_1.successResponse)(res, "Successful", newInvoice);
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            return (0, utility_1.successResponse)(res, "Failed", error.response.data);
            // Do something with this error...
        }
        else {
            console.error(error);
            return (0, utility_1.successResponse)(res, "Failed", error);
        }
    }
});
exports.fetchSignleInvoice = fetchSignleInvoice;
const fetchAllNetwork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.query;
    return (0, utility_1.successResponse)(res, "Successful", type == "TESTNET" ? paymentTestNet_json_1.default : paymentMainNet_json_1.default);
});
exports.fetchAllNetwork = fetchAllNetwork;
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
                    yield (0, notification_1.sendAppNotification)(user === null || user === void 0 ? void 0 : user.id, {
                        description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
                        title: "Invoice Payment Successful",
                        type: Transaction_1.TransactionType.CREDIT,
                        service: Transaction_1.ServiceType.INVOICE,
                    });
                    yield (0, notification_1.sendEmail)(data.customer.email, "Payment Successful", `<div>invoice paid by you</div>`);
                    yield (0, notification_1.sendEmail)(user.email, "Payment Successful", `<div>invoice paid</div>`);
                    return res.sendStatus(200);
                }
                else {
                    const userToken = yield UserToken_1.UserTokens.create({ tokenId: getToken.id, userId: invoice === null || invoice === void 0 ? void 0 : invoice.userId });
                    yield userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) });
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
                    yield (0, notification_1.sendAppNotification)(user === null || user === void 0 ? void 0 : user.id, {
                        description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
                        title: "Invoice Payment Successful",
                        type: Transaction_1.TransactionType.CREDIT,
                        service: Transaction_1.ServiceType.INVOICE,
                    });
                    yield (0, notification_1.sendEmail)(data.customer.email, "Payment Successful", `<div>invoice sent</div>`);
                    yield (0, notification_1.sendEmail)(user.email, "Payment Successful", `<div>invoice paid</div>`);
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
                yield (0, notification_1.sendAppNotification)(user === null || user === void 0 ? void 0 : user.id, {
                    description: `You Recieved an Invoice Payment of $${amountToCredit} Successfully`,
                    title: "Invoice Payment Successful",
                    type: Transaction_1.TransactionType.CREDIT,
                    service: Transaction_1.ServiceType.INVOICE,
                });
                yield (0, notification_1.sendEmail)(data.customer.email, "Payment Successful", `<div>invoice paid by you</div>`);
                yield (0, notification_1.sendEmail)(user.email, "Payment Successful", `<div>invoice paid</div>`);
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
                        yield Transaction_1.Transactions.create({
                            ref: (0, utility_1.createRandomRef)(8, "txt"),
                            description: `You Recieved a Payment Request of $${amountToCredit} Successfully`,
                            title: "Payment Request Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            service: Transaction_1.ServiceType.PAYMENT_REQUEST,
                            amount: amountToCredit,
                            status: Transaction_1.TransactionStatus.COMPLETE,
                            mata: newRequest,
                            userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId
                        });
                        yield (0, notification_1.sendAppNotification)(user === null || user === void 0 ? void 0 : user.id, {
                            description: `You Recieved a Payment Request of $${amountToCredit} Successfully`,
                            title: "Payment Request Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            service: Transaction_1.ServiceType.PAYMENT_REQUEST,
                        });
                        yield (0, notification_1.sendEmail)(newRequest.email, "Payment Successful", `<div>payment request paid by you</div>`);
                        yield (0, notification_1.sendEmail)(user.email, "Payment Successful", `<div>payment request paid</div>`);
                        return res.sendStatus(200);
                    }
                    else {
                        const userToken = yield UserToken_1.UserTokens.create({ tokenId: getToken.id, userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId });
                        yield userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) });
                        yield newRequest.update({ processed: true });
                        const user = yield Users_1.Users.findOne({ where: { id: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId } });
                        yield Transaction_1.Transactions.create({
                            ref: (0, utility_1.createRandomRef)(8, "txt"),
                            description: `You Recieved a Payment Request of $${amountToCredit} Successfully`,
                            title: "Payment Request Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            service: Transaction_1.ServiceType.PAYMENT_REQUEST,
                            amount: amountToCredit,
                            status: Transaction_1.TransactionStatus.COMPLETE,
                            mata: newRequest,
                            userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId
                        });
                        yield (0, notification_1.sendAppNotification)(user === null || user === void 0 ? void 0 : user.id, {
                            description: `You Recieved a Payment Request of $${amountToCredit} Successfully`,
                            title: "Payment Request Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            service: Transaction_1.ServiceType.PAYMENT_REQUEST,
                        });
                        yield (0, notification_1.sendEmail)(newRequest.email, "Payment Successful", `<div>payment request paid by you</div>`);
                        yield (0, notification_1.sendEmail)(user.email, "Payment Successful", `<div>payment request paid</div>`);
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
                    yield newRequest.update({ processed: true });
                    const user = yield Users_1.Users.findOne({ where: { id: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId } });
                    yield Transaction_1.Transactions.create({
                        ref: (0, utility_1.createRandomRef)(8, "txt"),
                        description: `You Recieved a Payment Request of $${amountToCredit} Successfully`,
                        title: "Payment Request Paid Successfully",
                        type: Transaction_1.TransactionType.CREDIT,
                        service: Transaction_1.ServiceType.PAYMENT_REQUEST,
                        amount: amountToCredit,
                        status: Transaction_1.TransactionStatus.COMPLETE,
                        mata: newRequest,
                        userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId
                    });
                    yield (0, notification_1.sendAppNotification)(user === null || user === void 0 ? void 0 : user.id, {
                        description: `You Recieved a Payment Request of $${amountToCredit} Successfully`,
                        title: "Payment Request Paid Successfully",
                        type: Transaction_1.TransactionType.CREDIT,
                        service: Transaction_1.ServiceType.PAYMENT_REQUEST,
                    });
                    yield (0, notification_1.sendEmail)(newRequest.email, "Payment Successful", `<div>invoice paid by you</div>`);
                    yield (0, notification_1.sendEmail)(user.email, "Payment Successful", `<div>invoice paid</div>`);
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
                        Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.targetReached) >= Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.target) ?
                            yield (0, notification_1.sendEmail)(user.email, "Crowdfund Goal Reached", `<div>invoice paid</div>`) :
                            yield (0, notification_1.sendEmail)(user.email, "Crowdfund Payment Successful", `<div>invoice paid</div>`);
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
                        yield (0, notification_1.sendAppNotification)(user === null || user === void 0 ? void 0 : user.id, {
                            title: "Crowdfund Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            service: Transaction_1.ServiceType.CROWD_FUND,
                        });
                        return res.sendStatus(200);
                    }
                    else {
                        const userToken = yield UserToken_1.UserTokens.create({ tokenId: getToken.id, userId: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId });
                        yield userToken.update({ balance: (Number(userToken.balance) + Number(amountToCredit)) });
                        yield newRequest.update({ targetReached: Number(newRequest === null || newRequest === void 0 ? void 0 : newRequest.targetReached) + Number(amountToCredit) });
                        const newRequestLatest = yield Payment_1.PaymentRequests.findOne({ where: { randoId: body.radomData.paymentLink.paymentLinkId } });
                        yield newRequestLatest.update({ processed: Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.targetReached) >= Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.target) ? true : false });
                        const user = yield Users_1.Users.findOne({ where: { id: newRequest === null || newRequest === void 0 ? void 0 : newRequest.userId } });
                        Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.targetReached) >= Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.target) ?
                            yield (0, notification_1.sendEmail)(user.email, "Crowdfund Goal Reached", `<div>invoice paid</div>`) :
                            yield (0, notification_1.sendEmail)(user.email, "Crowdfund Payment Successful", `<div>invoice paid</div>`);
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
                        yield (0, notification_1.sendAppNotification)(user === null || user === void 0 ? void 0 : user.id, {
                            description: `You Recieved a Crowdfund Paymemt of $${amountToCredit} Successfully`,
                            title: "Crowdfund Paid Successfully",
                            type: Transaction_1.TransactionType.CREDIT,
                            service: Transaction_1.ServiceType.CROWD_FUND,
                        });
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
                    Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.targetReached) >= Number(newRequestLatest === null || newRequestLatest === void 0 ? void 0 : newRequestLatest.target) ?
                        yield (0, notification_1.sendEmail)(user.email, "Crowdfund Goal Reached", `<div>invoice paid</div>`) :
                        yield (0, notification_1.sendEmail)(user.email, "Crowdfund Payment Successful", `<div>invoice paid</div>`);
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
                    yield (0, notification_1.sendAppNotification)(user === null || user === void 0 ? void 0 : user.id, {
                        description: `You Recieved a Crowdfund Paymemt of $${amountToCredit} Successfully`,
                        title: "Crowdfund Paid Successfully",
                        type: Transaction_1.TransactionType.CREDIT,
                        service: Transaction_1.ServiceType.CROWD_FUND,
                    });
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
        yield (0, notification_1.sendEmail)(user.email, "Withdrawal Successful", `<div>recieved by you</div>`);
        yield Transaction_1.Transactions.create({
            ref: (0, utility_1.createRandomRef)(8, "txt"),
            description: `Withdrawal of $${withdrawal.amount} is Successful`,
            title: "Withdrawal Successful",
            type: Transaction_1.TransactionType.DEBIT,
            service: Transaction_1.ServiceType.WITHDRAWAL,
            amount: withdrawal.amount,
            status: Transaction_1.TransactionStatus.COMPLETE,
            mata: withdrawal,
            userId: withdrawal === null || withdrawal === void 0 ? void 0 : withdrawal.userId
        });
        yield (0, notification_1.sendAppNotification)(user === null || user === void 0 ? void 0 : user.id, {
            description: `Withdrawal of $${withdrawal.amount} is Successful`,
            title: "Withdrawal Successful",
            type: Transaction_1.TransactionType.DEBIT,
            service: Transaction_1.ServiceType.WITHDRAWAL,
        });
        return res.sendStatus(200);
    }
    else {
        return res.sendStatus(200);
    }
});
exports.webhook = webhook;
const updateInvoiceStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const invoice = yield Invoice_1.Invoice.findOne({ where: { randoId: id } });
    yield invoice.update({
        paidAt: new Date().toISOString,
        status: "paid",
        processed: true
    });
    const newInvoice = yield Invoice_1.Invoice.findOne({ where: { randoId: id } });
    return (0, utility_1.successResponse)(res, "Successful", newInvoice);
});
exports.updateInvoiceStatus = updateInvoiceStatus;
const sendInvoiceReminder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const invoice = yield Invoice_1.Invoice.findOne({ where: { randoId: id } });
    yield (0, notification_1.sendEmail)(invoice === null || invoice === void 0 ? void 0 : invoice.customer.name, "Invoice Reminder", `<div>invoice reminder</div>`);
    const newInvoice = yield Invoice_1.Invoice.findOne({ where: { randoId: id } });
    return (0, utility_1.successResponse)(res, "Successful", newInvoice);
});
exports.sendInvoiceReminder = sendInvoiceReminder;
//# sourceMappingURL=invoice.js.map