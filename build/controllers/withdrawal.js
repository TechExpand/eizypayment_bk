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
exports.fetchWithdrawal = exports.createWithdrawal = void 0;
const utility_1 = require("../helpers/utility");
const configSetup_1 = __importDefault(require("../config/configSetup"));
;
const Token_1 = require("../models/Token");
const UserToken_1 = require("../models/UserToken");
const Withdrawal_1 = require("../models/Withdrawal");
const fs = require("fs");
const axios = require('axios');
const createWithdrawal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { network, token, amount, withdrawalAddress, symbol } = req.body;
    try {
        const tokens = yield Token_1.Tokens.findOne({ where: { symbol } });
        if (!tokens)
            return (0, utility_1.errorResponse)(res, "Token Not found");
        const userToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: tokens === null || tokens === void 0 ? void 0 : tokens.id, userId: id } });
        if (!userToken)
            return (0, utility_1.errorResponse)(res, "User Token Not found");
        if ((userToken === null || userToken === void 0 ? void 0 : userToken.balance) >= amount) {
            const response = yield axios({
                method: 'POST',
                url: 'https://api.radom.network/withdrawal',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${configSetup_1.default.RADON}`
                },
                data: {
                    network,
                    token,
                    amount,
                    withdrawalAddress,
                    withdrawalAccountId: null
                }
            });
            yield userToken.update({ balance: (Number(userToken.balance) - Number(amount)) });
            const response2 = yield axios({
                method: 'GET',
                url: 'https://api.radom.network/withdrawal',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${configSetup_1.default.RADON}`
                },
            });
            console.log(response2.data);
            const withdrawal = yield Withdrawal_1.Withdrawal.create({
                randoId: response2.data[0].id,
                network,
                token,
                symbol,
                amount,
                withdrawalAddress,
                userTokenId: userToken === null || userToken === void 0 ? void 0 : userToken.id,
                userId: id
            });
            return (0, utility_1.successResponse)(res, "Successful", withdrawal);
        }
        else {
            return (0, utility_1.errorResponse)(res, "Insuffient funds");
        }
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
exports.createWithdrawal = createWithdrawal;
const fetchWithdrawal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const withdrawal = yield Withdrawal_1.Withdrawal.findAll({ where: { userId: id } });
    return (0, utility_1.successResponse)(res, "Successful", withdrawal);
});
exports.fetchWithdrawal = fetchWithdrawal;
// export const deleteCustomer = async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const customer = await Customers.findOne({ where: { id } })
//     if (!customer) return successResponse(res, "Customer not found");
//     await customer?.destroy()
//     return successResponse(res, "Successful");
// }
//# sourceMappingURL=withdrawal.js.map