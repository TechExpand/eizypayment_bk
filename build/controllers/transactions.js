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
exports.fetchTransactions = void 0;
const utility_1 = require("../helpers/utility");
;
const Transaction_1 = require("../models/Transaction");
const fs = require("fs");
const axios = require('axios');
const fetchTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const transactions = yield Transaction_1.Transactions.findAll({ where: { userId: id } });
    return (0, utility_1.successResponse)(res, "Successful", transactions);
});
exports.fetchTransactions = fetchTransactions;
//# sourceMappingURL=transactions.js.map