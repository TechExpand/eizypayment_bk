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
exports.fetchSignlePaymenntRequest = exports.fetchPaymenntRequest = exports.createPaymentLink = void 0;
const utility_1 = require("../helpers/utility");
const Users_1 = require("../models/Users");
const configSetup_1 = __importDefault(require("../config/configSetup"));
;
const notification_1 = require("../services/notification");
const template_1 = require("../config/template");
const Payment_1 = require("../models/Payment");
const fs = require("fs");
const util = require('util');
const axios = require('axios');
const createPaymentLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { description, price, network, currency, token, userId, symbol } = req.body;
    const user = yield Users_1.Users.findOne({ where: { id: userId } });
    try {
        const response1 = yield axios({
            method: 'POST',
            url: 'https://api.radom.com/product/create',
            headers: { 'Content-Type': 'application/json', Authorization: `${configSetup_1.default.RADON}` },
            data: {
                name: "Payment request",
                description: description,
                // chargingIntervalSeconds: 0,
                currency,
                addOns: [{ name: description, price }],
                price,
                // meteredBudget: 0,
                // meteredChargingInterval: 0,
                // isInventoried: true,
                quantity: 1,
                // allowanceDuration: 0,
                // sendSubscriptionEmails: false
            }
        });
        const response = yield axios({
            method: 'POST',
            url: 'https://api.radom.com/payment_link/create',
            headers: { 'Content-Type': 'application/json', Authorization: `${configSetup_1.default.RADON}` },
            data: {
                products: [response1.data.id],
                gateway: {
                    managed: { methods: [{ network: network, token: token, discountPercentOff: 0 }] }
                },
                // customizations: {
                //   leftPanelColor: 'string',
                //   primaryButtonColor: 'string',
                //   slantedEdge: true,
                //   allowDiscountCodes: true
                // },
                successUrl: 'https://www.youtube.com/',
                cancelUrl: 'https://www.youtube.com/',
                // inputFields: [{inputLabel: 'string', isRequired: true, dataType: 'String'}],
                sendEmailReceipt: false,
                chargeCustomerNetworkFee: true
            }
        });
        // console.log(util.inspect(response.data, false, null, true /* enable colors */))
        const paymentLink = yield Payment_1.PaymentRequests.create({
            randoId: response.data.id,
            organizationId: response.data.organizationId,
            url: response.data.url,
            sellerName: response.data.sellerName,
            sellerLogoUrl: response.data.sellerLogoUrl,
            cancelUrl: response.data.cancelUrl,
            successUrl: response.data.successUrl,
            products: response.data.products,
            gateway: response.data.gateway,
            symbol,
            userId: id,
            email: user === null || user === void 0 ? void 0 : user.email
        });
        yield (0, notification_1.sendEmail)(user.email, "Payment request", (0, template_1.templateEmail)("Payment request", `<div
        I hope this email finds you well.<br><br>
        
        I am reaching out to request a payment for ${description}. The amount requested is ${symbol}  ${price}.<br><br>
        
        Your prompt attention to this request would be greatly appreciated. If you have any questions or concerns regarding the payment, please feel free to reach out to me.</div>`));
        return (0, utility_1.successResponse)(res, "Successful", paymentLink);
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
exports.createPaymentLink = createPaymentLink;
const fetchPaymenntRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const request = yield Payment_1.PaymentRequests.findAll({
        where: { userId: id, type: Payment_1.TypeState.PAYMENT_LINK }, order: [
            ['createdAt', 'DESC']
        ],
    });
    return (0, utility_1.successResponse)(res, "Successful", request);
});
exports.fetchPaymenntRequest = fetchPaymenntRequest;
const fetchSignlePaymenntRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield Users_1.Users.findOne({ where: { id } });
    const request = yield Payment_1.PaymentRequests.findOne({ where: { randoId: id } });
    try {
        const response = yield axios({
            method: 'GET',
            url: `https://api.radom.network/payment_link/${id}`,
            headers: { 'Content-Type': 'application/json', Authorization: `${configSetup_1.default.RADON}` },
        });
        const data = JSON.parse(JSON.stringify(response.data));
        yield request.update({
            randoId: data.id,
            organizationId: data.organizationId,
            url: data.url,
            sellerName: data.sellerName,
            sellerLogoUrl: data.sellerLogoUrl,
            cancelUrl: data.cancelUrl,
            successUrl: data.successUrl,
            products: data.products,
            gateway: data.gateway,
            userId: id
        });
        const newRequest = yield Payment_1.PaymentRequests.findOne({ where: { randoId: id } });
        return (0, utility_1.successResponse)(res, "Successful", data);
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
exports.fetchSignlePaymenntRequest = fetchSignlePaymenntRequest;
//# sourceMappingURL=paymentLink.js.map