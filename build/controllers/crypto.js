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
exports.withdrawBank = exports.sendUsdc = exports.sendUsdt = exports.unfreezeCard = exports.freezeCard = exports.withdrawCard = exports.topUpCard = exports.cardTransaction = exports.fetchCard = exports.fetchAllCard = exports.createCard = exports.userKyc = exports.createAddress = void 0;
const utility_1 = require("../helpers/utility");
const Users_1 = require("../models/Users");
const configSetup_1 = __importDefault(require("../config/configSetup"));
// yarn add stream-chat
const util = require('util');
const Card_1 = require("../models/Card");
const Wallet_1 = require("../models/Wallet");
const Withdrawal_1 = require("../models/Withdrawal");
const notification_1 = require("../services/notification");
const fs = require("fs");
const axios = require('axios');
const createAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { type } = req.query;
    try {
        const user = yield Users_1.Users.findOne({ where: { id } });
        if (type === "USDC") {
            const response = yield axios({
                method: 'POST',
                url: 'https://sandboxapi.bitnob.co/api/v1/addresses/generate/usdc',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${configSetup_1.default.BITNOM}`
                },
                data: { chain: 'TRX', customerEmail: user === null || user === void 0 ? void 0 : user.email, label: "Eisy Global USDC Wallet" }
            });
            console.log(response);
            return (0, utility_1.successResponse)(res, "Successful", response.data.data);
        }
        else {
            const response = yield axios({
                method: 'POST',
                url: 'https://sandboxapi.bitnob.co/api/v1/addresses/generate/usdt',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${configSetup_1.default.BITNOM}`
                },
                data: { chain: 'TRX', customerEmail: user === null || user === void 0 ? void 0 : user.email, label: "Eisy Global USDT Wallet" }
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
exports.createAddress = createAddress;
const userKyc = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { idType, phoneNumber, idNumber, city, state, country, zipCode, line1, houseNumber, idImage, bvn, userPhoto, dateOfBirth } = req.body;
    // BVN, NIN, PASSPORT
    try {
        const user = yield Users_1.Users.findOne({ where: { id } });
        const [firstName, lastName] = user.fullname.split(" ");
        const response = yield axios({
            method: 'POST',
            url: 'https://sandboxapi.bitnob.co/api/v1/virtualcards/registercarduser',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${configSetup_1.default.BITNOM}`
            },
            data: {
                customerEmail: user === null || user === void 0 ? void 0 : user.email,
                idNumber,
                idType,
                firstName,
                lastName,
                phoneNumber,
                city,
                state,
                country,
                zipCode,
                line1,
                houseNumber,
                idImage,
                bvn,
                userPhoto,
                dateOfBirth
            }
        });
        yield (user === null || user === void 0 ? void 0 : user.update({ kycComplete: true }));
        return (0, utility_1.successResponse)(res, "Successful", response.data.data);
    }
    catch (error) {
        return (0, utility_1.errorResponse)(res, error.response.data.message.toString().replace("[", "").replace("]", ""));
    }
});
exports.userKyc = userKyc;
const createCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { type } = req.body;
    // BVN, NIN, PASSPORT
    const user = yield Users_1.Users.findOne({ where: { id } });
    const [firstName, lastName] = user.fullname.split(" ");
    try {
        const response = yield axios({
            method: 'POST',
            url: 'https://sandboxapi.bitnob.co/api/v1/virtualcards/create',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${configSetup_1.default.BITNOM}`
            },
            data: {
                cardBrand: type,
                cardType: 'virtual',
                reference: (0, utility_1.randomId)(8),
                amount: 200,
                firstName: firstName,
                lastName: lastName,
                customerEmail: user === null || user === void 0 ? void 0 : user.email
            }
        });
        yield Card_1.Card.create({
            meta: response.data.data,
            cardId: response.data.data.id,
            userId: user.id
        });
        return (0, utility_1.successResponse)(res, "Successful", response.data.data);
    }
    catch (error) {
        return (0, utility_1.errorResponse)(res, error.response.data.message);
    }
});
exports.createCard = createCard;
const fetchAllCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const card = yield Card_1.Card.findAll({
        where: {
            userId: id,
        }
    });
    return (0, utility_1.successResponse)(res, "Successful", card);
});
exports.fetchAllCard = fetchAllCard;
const fetchCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { cardId } = req.query;
    // BVN, NIN, PASSPORT
    try {
        const response = yield axios({
            method: 'GET',
            url: `https://sandboxapi.bitnob.co/api/v1/virtualcards/cards/${cardId}`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${configSetup_1.default.BITNOM}`
            }
        });
        const card = yield Card_1.Card.findOne({
            where: {
                cardId,
            }
        });
        yield (card === null || card === void 0 ? void 0 : card.update({ meta: response.data.data }));
        return (0, utility_1.successResponse)(res, "Successful", response.data.data);
    }
    catch (error) {
        return (0, utility_1.errorResponse)(res, error.response.data.message);
    }
});
exports.fetchCard = fetchCard;
const cardTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { cardId } = req.query;
    // BVN, NIN, PASSPORT
    try {
        const response = yield axios({
            method: 'GET',
            url: `https://sandboxapi.bitnob.co/api/v1/virtualcards/cards/${cardId}/transactions`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${configSetup_1.default.BITNOM}`
            }
        });
        return (0, utility_1.successResponse)(res, "Successful", response.data.data);
    }
    catch (error) {
        return (0, utility_1.errorResponse)(res, error.response.data.message);
    }
});
exports.cardTransaction = cardTransaction;
const topUpCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { cardId, amount } = req.body;
    try {
        const user = yield Users_1.Users.findOne({ where: { id } });
        const wallet = yield Wallet_1.Wallet.findOne({ where: { userId: user === null || user === void 0 ? void 0 : user.id } });
        if (Number(wallet === null || wallet === void 0 ? void 0 : wallet.balance) >= Number(amount)) {
            const response = yield axios({
                method: 'POST',
                url: 'https://sandboxapi.bitnob.co/api/v1/virtualcards/topup',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${configSetup_1.default.BITNOM}`
                },
                data: {
                    cardId,
                    reference: (0, utility_1.randomId)(8),
                    amount: Number(amount) * 100,
                }
            });
            yield (wallet === null || wallet === void 0 ? void 0 : wallet.update({ balance: Number(wallet.balance) - Number(amount) }));
            return (0, utility_1.successResponse)(res, "Successful", response.data.data);
        }
        else {
            return (0, utility_1.errorResponse)(res, "Insufficient Funds in Wallet");
        }
    }
    catch (error) {
        return (0, utility_1.errorResponse)(res, error.response.data.message);
    }
});
exports.topUpCard = topUpCard;
const withdrawCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { cardId, amount } = req.body;
    // BVN, NIN, PASSPORT
    try {
        const user = yield Users_1.Users.findOne({ where: { id } });
        const wallet = yield Wallet_1.Wallet.findOne({ where: { userId: user === null || user === void 0 ? void 0 : user.id } });
        const response = yield axios({
            method: 'POST',
            url: 'https://sandboxapi.bitnob.co/api/v1/virtualcards/withdraw',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${configSetup_1.default.BITNOM}`
            },
            data: {
                cardId,
                reference: (0, utility_1.randomId)(8),
                amount: Number(amount) * 100,
            }
        });
        yield (wallet === null || wallet === void 0 ? void 0 : wallet.update({ balance: Number(wallet.balance) + Number(amount) }));
        return (0, utility_1.successResponse)(res, "Successful", response.data.data);
    }
    catch (error) {
        return (0, utility_1.errorResponse)(res, error.response.data.message);
    }
});
exports.withdrawCard = withdrawCard;
const freezeCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { cardId } = req.body;
    // BVN, NIN, PASSPORT
    try {
        const response = yield axios({
            method: 'POST',
            url: `https://sandboxapi.bitnob.co/api/v1/virtualcards/freeze`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${configSetup_1.default.BITNOM}`
            },
            data: {
                cardId,
            }
        });
        const card = yield Card_1.Card.findOne({ where: { cardId } });
        yield (card === null || card === void 0 ? void 0 : card.update({ freeze: true }));
        return (0, utility_1.successResponse)(res, "Successful", response.data.data);
    }
    catch (error) {
        return (0, utility_1.errorResponse)(res, error.response.data.message);
    }
});
exports.freezeCard = freezeCard;
const unfreezeCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { cardId } = req.body;
    // BVN, NIN, PASSPORT
    try {
        const response = yield axios({
            method: 'POST',
            url: `https://sandboxapi.bitnob.co/api/v1/virtualcards/unfreeze`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${configSetup_1.default.BITNOM}`
            },
            data: {
                cardId
            }
        });
        const card = yield Card_1.Card.findOne({ where: { cardId } });
        yield (card === null || card === void 0 ? void 0 : card.update({ freeze: true }));
        return (0, utility_1.successResponse)(res, "Successful", response.data.data);
    }
    catch (error) {
        return (0, utility_1.errorResponse)(res, error.response.data.message);
    }
});
exports.unfreezeCard = unfreezeCard;
const sendUsdt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { amount, address } = req.body;
    const user = yield Users_1.Users.findOne({ where: { id } });
    const wallet = yield Wallet_1.Wallet.findOne({ where: { userId: user === null || user === void 0 ? void 0 : user.id } });
    // BVN, NIN, PASSPORT
    try {
        if (Number(wallet === null || wallet === void 0 ? void 0 : wallet.balance) >= Number(amount)) {
            const response = yield axios({
                method: 'POST',
                url: `https://sandboxapi.bitnob.co/api/v1/wallets/send-usdt`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${configSetup_1.default.BITNOM}`
                },
                data: {
                    reference: (0, utility_1.randomId)(8),
                    amount: Number(amount) * 100,
                    description: "usdt withdrawal",
                    address,
                    chain: "TRX",
                    customerEmail: user === null || user === void 0 ? void 0 : user.email
                }
            });
            const wallet = yield Wallet_1.Wallet.findOne({ where: { userId: user === null || user === void 0 ? void 0 : user.id } });
            yield (wallet === null || wallet === void 0 ? void 0 : wallet.update({ balance: Number(wallet.balance) - Number(amount) }));
            const withdrawal = yield Withdrawal_1.Withdrawal.create({
                randoId: "",
                network: "TRX",
                token: "USDT",
                symbol: "USDT",
                amount,
                type: Withdrawal_1.WithdrawTypeState.CRYPTO,
                withdrawalAddress: address,
                // userTokenId: ,
                userId: id
            });
            return (0, utility_1.successResponse)(res, "Successful", response.data.data);
        }
        else {
            return (0, utility_1.errorResponse)(res, "Insufficient Funds in Wallet");
        }
    }
    catch (error) {
        return (0, utility_1.errorResponse)(res, error.response.data.message);
    }
});
exports.sendUsdt = sendUsdt;
const sendUsdc = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { amount, address, description } = req.body;
    // BVN, NIN, PASSPORT
    const user = yield Users_1.Users.findOne({ where: { id } });
    const wallet = yield Wallet_1.Wallet.findOne({ where: { userId: user === null || user === void 0 ? void 0 : user.id } });
    try {
        if (Number(wallet === null || wallet === void 0 ? void 0 : wallet.balance) >= Number(amount)) {
            const response = yield axios({
                method: 'POST',
                url: `https://sandboxapi.bitnob.co/api/v1/wallets/send-usdc`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${configSetup_1.default.BITNOM}`
                },
                data: {
                    reference: (0, utility_1.randomId)(8),
                    amount: Number(amount) * 100,
                    description,
                    address,
                    chain: "TRX",
                    customerEmail: user === null || user === void 0 ? void 0 : user.email
                }
            });
            const wallet = yield Wallet_1.Wallet.findOne({ where: { userId: user === null || user === void 0 ? void 0 : user.id } });
            yield (wallet === null || wallet === void 0 ? void 0 : wallet.update({ balance: Number(wallet.balance) - Number(amount) }));
            const withdrawal = yield Withdrawal_1.Withdrawal.create({
                randoId: "",
                network: "TRX",
                token: "USDT",
                symbol: "USDT",
                amount,
                type: Withdrawal_1.WithdrawTypeState.CRYPTO,
                withdrawalAddress: address,
                // userTokenId: ,
                userId: id
            });
            return (0, utility_1.successResponse)(res, "Successful", response.data.data);
        }
        else {
            return (0, utility_1.errorResponse)(res, "Insufficient Funds in Wallet");
        }
    }
    catch (error) {
        return (0, utility_1.errorResponse)(res, error.response.data.message);
    }
});
exports.sendUsdc = sendUsdc;
const withdrawBank = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { amount, address, bank } = req.body;
    const user = yield Users_1.Users.findOne({ where: { id } });
    const wallet = yield Wallet_1.Wallet.findOne({ where: { userId: user === null || user === void 0 ? void 0 : user.id } });
    // BVN, NIN, PASSPORT
    try {
        if (Number(wallet === null || wallet === void 0 ? void 0 : wallet.balance) >= Number(amount)) {
            (0, notification_1.sendEmailWithdraw)("", "Withdrawal Request Approval", "review withdrawal from admin dashboard");
            const withdrawal = yield Withdrawal_1.Withdrawal.create({
                randoId: "",
                network: "USDT",
                token: "USDT",
                symbol: "USDT",
                amount,
                card: true,
                type: Withdrawal_1.WithdrawTypeState.P2P,
                bank,
                withdrawalAddress: address,
                userId: id
            });
            const wallet = yield Wallet_1.Wallet.findOne({ where: { userId: user === null || user === void 0 ? void 0 : user.id } });
            yield (wallet === null || wallet === void 0 ? void 0 : wallet.update({ balance: Number(wallet.balance) - Number(amount) }));
            return (0, utility_1.successResponse)(res, "Successful", withdrawal);
        }
        else {
            return (0, utility_1.errorResponse)(res, "Insufficient Funds in Wallet");
        }
    }
    catch (error) {
        return (0, utility_1.errorResponse)(res, error);
    }
});
exports.withdrawBank = withdrawBank;
//# sourceMappingURL=crypto.js.map