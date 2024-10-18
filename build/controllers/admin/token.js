"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFunding = exports.fetchPrices = exports.fetchTokens = exports.deleteToken = exports.createToken = void 0;
const utility_1 = require("../../helpers/utility");
const template_1 = require("../../config/template");
const Token_1 = require("../../models/Token");
const Price_1 = require("../../models/Price");
const Users_1 = require("../../models/Users");
// import { templateEmail } from ".";
const configSetup_1 = __importStar(require("../../config/configSetup"));
const Wallet_1 = require("../../models/Wallet");
const notification_1 = require("../../services/notification");
const Order_1 = require("../../models/Order");
const Withdrawal_1 = require("../../models/Withdrawal");
const fs = require("fs");
const axios = require("axios");
const createToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { currency, symbol, url } = req.body;
    const available = yield Token_1.Tokens.findOne({ where: { symbol } });
    if (available)
        return (0, utility_1.successResponse)(res, "Currency already exist");
    const token = yield Token_1.Tokens.create({
        currency,
        symbol,
        url,
    });
    return (0, utility_1.successResponse)(res, "Successful", token);
});
exports.createToken = createToken;
const deleteToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const token = yield Token_1.Tokens.findOne({
        where: { id },
    });
    yield (token === null || token === void 0 ? void 0 : token.destroy());
    return (0, utility_1.successResponse)(res, "Deleted");
});
exports.deleteToken = deleteToken;
const fetchTokens = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield Token_1.Tokens.findAll({
        limit: 6,
        order: [["createdAt", "DESC"]],
    });
    return (0, utility_1.successResponse)(res, "Successful", token.reverse());
});
exports.fetchTokens = fetchTokens;
const fetchPrices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const price = yield Price_1.Price.findOne();
    return (0, utility_1.successResponse)(res, "Successful", price);
});
exports.fetchPrices = fetchPrices;
const createFunding = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, type, amount, usd } = req.body;
    try {
        const user = yield Users_1.Users.findOne({ where: { id } });
        const wallet = yield Wallet_1.Wallet.findOne({ where: { userId: user.id } });
        if (type === "USDC") {
            const response = yield axios({
                method: "POST",
                url: `https://${configSetup_1.mainUrlBitnob}.bitnob.co/api/v1/addresses/generate/usdc`,
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    Authorization: `Bearer ${configSetup_1.default.BITNOM}`,
                },
                data: {
                    chain: "TRX",
                    customerEmail: user === null || user === void 0 ? void 0 : user.email,
                    label: "Eisy Global USDC Wallet",
                },
            });
            console.log(response);
            yield (user === null || user === void 0 ? void 0 : user.update({ address: response.data.data.address }));
            yield (wallet === null || wallet === void 0 ? void 0 : wallet.update({
                pendingAmount: Number(usd) + Number(wallet.pendingAmount),
            }));
            yield Order_1.Order.create({
                network: "TRX",
                token: type,
                address: response.data.data.address,
                symbol: type,
                processed: false,
                amount,
                usd,
                userId: user === null || user === void 0 ? void 0 : user.id,
                type: Order_1.OrderTypeState.BUY,
                status: Withdrawal_1.WithdrawalStatus.PENDING,
            });
            yield (0, notification_1.sendEmailBuy)("Request to Buy Crypto in Naira", (0, template_1.templateEmail)("Request to Buy Crypto in Naira", `<div> view admin to process order. <div/><br><br><a href=https://app.eisyglobal.com/admin/order /> VIEW ADMIN <a/>`));
            return (0, utility_1.successResponse)(res, "Successful", response.data.data);
        }
        else {
            const response = yield axios({
                method: "POST",
                url: `https://${configSetup_1.mainUrlBitnob}.bitnob.co/api/v1/addresses/generate/usdt`,
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    Authorization: `Bearer ${configSetup_1.default.BITNOM}`,
                },
                data: {
                    chain: "TRX",
                    customerEmail: user === null || user === void 0 ? void 0 : user.email,
                    label: "Eisy Global USDT Wallet",
                },
            });
            yield (user === null || user === void 0 ? void 0 : user.update({ address: response.data.data.address }));
            yield (wallet === null || wallet === void 0 ? void 0 : wallet.update({
                pendingAmount: Number(usd) + Number(wallet.pendingAmount),
            }));
            yield (0, notification_1.sendEmailBuy)("Request to Buy Crypto in Naira", (0, template_1.templateEmail)("Request to Buy Crypto in Naira", `<div> view admin to process order. <div/><br><br><a href=https://app.eisyglobal.com/admin/order /> VIEW ADMIN <a/>`));
            yield Order_1.Order.create({
                network: "TRX",
                token: type,
                address: response.data.data.address,
                symbol: type,
                processed: false,
                usd,
                amount,
                userId: user === null || user === void 0 ? void 0 : user.id,
                type: Order_1.OrderTypeState.BUY,
                status: Withdrawal_1.WithdrawalStatus.PENDING,
            });
            console.log(response);
            return (0, utility_1.successResponse)(res, "Successful", response.data.data);
        }
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            return (0, utility_1.errorResponse)(res, "Failed", error);
            // Do something with this error...
        }
        else {
            console.error(error);
            return (0, utility_1.errorResponse)(res, "Failed", error);
        }
    }
});
exports.createFunding = createFunding;
//# sourceMappingURL=token.js.map