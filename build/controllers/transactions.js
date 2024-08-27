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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAdmin = exports.fetchTransactions = exports.fetchFirstSixTransactions = void 0;
const utility_1 = require("../helpers/utility");
// yarn add stream-chat
const Transaction_1 = require("../models/Transaction");
const Admin_1 = require("../models/Admin");
const fs = require("fs");
const axios = require('axios');
const fetchFirstSixTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const transactions = yield Transaction_1.Transactions.findAll({
        where: { userId: id },
        limit: 6,
        order: [
            ['createdAt', 'DESC'],
        ],
    });
    return (0, utility_1.successResponse)(res, "Successful", transactions);
});
exports.fetchFirstSixTransactions = fetchFirstSixTransactions;
const fetchTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const transactions = yield Transaction_1.Transactions.findAll({
        where: { userId: id },
        limit: 6,
        order: [
            ['createdAt', 'DESC'],
        ],
    });
    return (0, utility_1.successResponse)(res, "Successful", transactions);
});
exports.fetchTransactions = fetchTransactions;
const fetchAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // let coinList: any[] = []
    const admins = yield Admin_1.Admin.findOne({});
    // const token = await Tokens.findAll({})
    // const response = await axios({
    //     method: 'GET',
    //     url: `https://api.coinranking.com/v2/coins`,
    //     headers: { 'Content-Type': 'application/json' },
    // })
    // token.forEach((e) => {
    //     if (e.currency == "BAT") {
    //     } else if (e.currency == "BUSD") {
    //         const coinObjectTemp = response.data.data.coins.find((obj: any) => obj.symbol == "USDT");
    //         coinList.push({ symbol: "BUSD", price: coinObjectTemp.price })
    //     }
    //     else {
    //         const coinObjectTemp = response.data.data.coins.find((obj: any) => obj.symbol == e.currency);
    //         coinList.push({ symbol: coinObjectTemp.symbol, price: coinObjectTemp.price })
    //     }
    // })
    return (0, utility_1.successResponse)(res, "Successful", { admins,
        // coinList
    });
});
exports.fetchAdmin = fetchAdmin;
//# sourceMappingURL=transactions.js.map