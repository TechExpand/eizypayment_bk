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
exports.fetchPrices = exports.fetchTokens = exports.deleteToken = exports.createToken = void 0;
const utility_1 = require("../../helpers/utility");
const Token_1 = require("../../models/Token");
const Price_1 = require("../../models/Price");
// import { templateEmail } from ".";
const fs = require("fs");
const axios = require('axios');
const createToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { currency, symbol, url } = req.body;
    const available = yield Token_1.Tokens.findOne({ where: { symbol } });
    if (available)
        return (0, utility_1.successResponse)(res, "Currency already exist");
    const token = yield Token_1.Tokens.create({
        currency, symbol, url
    });
    return (0, utility_1.successResponse)(res, "Successful", token);
});
exports.createToken = createToken;
const deleteToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const token = yield Token_1.Tokens.findOne({
        where: { id }
    });
    yield (token === null || token === void 0 ? void 0 : token.destroy());
    return (0, utility_1.successResponse)(res, "Deleted");
});
exports.deleteToken = deleteToken;
const fetchTokens = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield Token_1.Tokens.findAll({
        limit: 6,
        order: [
            ['createdAt', 'DESC']
        ],
    });
    return (0, utility_1.successResponse)(res, "Successful", token.reverse());
});
exports.fetchTokens = fetchTokens;
const fetchPrices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const price = yield Price_1.Price.findOne();
    return (0, utility_1.successResponse)(res, "Successful", price);
});
exports.fetchPrices = fetchPrices;
//# sourceMappingURL=token.js.map