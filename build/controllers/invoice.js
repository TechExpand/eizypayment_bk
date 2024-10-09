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
exports.sendInvoiceReminder = exports.updateInvoiceStatus = exports.fetchAllNetwork = exports.fetchSignleInvoice = exports.fetchInvoiceSummary = exports.fetchInvoice = exports.createInvoice = void 0;
const utility_1 = require("../helpers/utility");
const Users_1 = require("../models/Users");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const paymentMainNet_json_1 = __importDefault(require("../config/paymentMainNet.json"));
const paymentTestNet_json_1 = __importDefault(require("../config/paymentTestNet.json"));
// yarn add stream-chat
const util = require('util');
const Invoice_1 = require("../models/Invoice");
const notification_1 = require("../services/notification");
const template_1 = require("../config/template");
const Customers_1 = require("../models/Customers");
const fs = require("fs");
const axios = require('axios');
const createInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { lineItems, overdueAt, network, customerId, token, subTotal, symbol, business, title, invoiceNo, invoiceDate, noteHidden, noteVisible } = req.body;
    const user = yield Users_1.Users.findOne({ where: { id } });
    console.log({
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
    });
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
        yield (0, notification_1.sendEmail)(invoice === null || invoice === void 0 ? void 0 : invoice.customer.email.toString().replace("eisyappmail", ""), "Invoice", (0, template_1.templateEmail)("Invoice", `<div>An Invoice was sent to you from ${user === null || user === void 0 ? void 0 : user.email}.
    <br> Click the link below to view the invoice<br>
    <a href=https://app.eisyglobal.com/invoice?id=${invoice.randoId}> VIEW INVOICE <a/>
    </div>`));
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
    const invoice = yield Invoice_1.Invoice.findAll({
        where: { userId: id }, order: [
            ['createdAt', 'DESC']
        ],
    });
    console.log(invoice);
    return (0, utility_1.successResponse)(res, "Successful", invoice);
});
exports.fetchInvoice = fetchInvoice;
const fetchInvoiceSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const invoice = yield Invoice_1.Invoice.findAll({
        where: { userId: id }, order: [
            ['createdAt', 'DESC']
        ],
    });
    let paidInvoice = 0;
    let overdueInvoice = 0;
    let outStandingInvoice = 0;
    for (let value of invoice) {
        console.log(value.status.toString().replace('"', '').replace('"', ''));
        console.log(value.status.toString().replace('"', "") === "paid");
        console.log(value.status.toString().replace('"', "") === "overdue");
        console.log(value.status.toString().replace('"', "") === "pending");
        if (value.status.toString().replace('"', '').replace('"', '') === "paid") {
            paidInvoice = paidInvoice + Number(value.subTotal);
        }
        if (value.status.toString().replace('"', '').replace('"', '') === "overdue") {
            overdueInvoice = overdueInvoice + Number(value.subTotal);
        }
        if (value.status.toString().replace('"', '').replace('"', '') === "pending") {
            outStandingInvoice = outStandingInvoice + Number(value.subTotal);
        }
    }
    const customers = yield Customers_1.Customers.findAll({
        where: { userId: id }, order: [
            ['createdAt', 'DESC']
        ],
    });
    return (0, utility_1.successResponse)(res, "Successful", {
        overdueInvoice,
        paidInvoice,
        outStandingInvoice,
        customers: customers.length
    });
});
exports.fetchInvoiceSummary = fetchInvoiceSummary;
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
const updateInvoiceStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    const invoice = yield Invoice_1.Invoice.findOne({ where: { randoId: id } });
    const date = new Date().toISOString();
    yield invoice.update({
        paidAt: date,
        status: "paid",
        processed: true
    });
    const newInvoice = yield Invoice_1.Invoice.findOne({ where: { randoId: id } });
    return (0, utility_1.successResponse)(res, "Successful", newInvoice);
});
exports.updateInvoiceStatus = updateInvoiceStatus;
const sendInvoiceReminder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    const invoice = yield Invoice_1.Invoice.findOne({ where: { randoId: id } });
    const data = JSON.parse(invoice === null || invoice === void 0 ? void 0 : invoice.customer);
    console.log(data);
    yield (0, notification_1.sendEmail)(data.email, "Invoice Reminder", (0, template_1.templateEmail)("Invoice Reminder", `<div>I hope this message finds you well.<br>

  I'm writing to kindly remind you about the outstanding invoice ${invoice === null || invoice === void 0 ? void 0 : invoice.randoId}, which remains unpaid.<br>
  
  Here are the details of the invoice:<br><br>
  
  Invoice Number: ${invoice === null || invoice === void 0 ? void 0 : invoice.randoId}<br>
  Invoice Date: ${invoice.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
  Amount Due: ${invoice === null || invoice === void 0 ? void 0 : invoice.subTotal}<br>
  Due Date:  ${invoice.overdueAt}<br><br>
  <a href=https://app.eisyglobal.com/invoice?id=${invoice.randoId}> VIEW INVOICE <a/>
  <br><br>
  We understand that oversight can happen, and we want to ensure that this matter is resolved promptly to avoid any inconvenience.<br>Please take a moment to review the invoice, and if you've already made the payment, kindly disregard this reminder.<br>
    
  If you have any questions regarding the invoice or need assistance with payment, please don't hesitate to reach out to us. We're here to help and ensure a smooth resolution.<br>
  
  Thank you for your attention to this matter. We appreciate your cooperation and look forward to receiving your payment soon.</div>`));
    const newInvoice = yield Invoice_1.Invoice.findOne({ where: { randoId: id } });
    return (0, utility_1.successResponse)(res, "Successful", newInvoice);
});
exports.sendInvoiceReminder = sendInvoiceReminder;
//# sourceMappingURL=invoice.js.map