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
exports.confirmAddress = exports.fetchWithdrawal = exports.createWithdrawalCash = exports.fetchBank = exports.createBank = exports.createWithdrawal = void 0;
const utility_1 = require("../helpers/utility");
const configSetup_1 = __importDefault(require("../config/configSetup"));
;
const notification_1 = require("../services/notification");
const Token_1 = require("../models/Token");
const UserToken_1 = require("../models/UserToken");
const Withdrawal_1 = require("../models/Withdrawal");
const Bank_1 = require("../models/Bank");
const fs = require("fs");
const axios = require('axios');
const WAValidator = require('multicoin-address-validator');
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
                    token: token == "-" ? null : token,
                    amount,
                    withdrawalAddress,
                    withdrawalAccountId: null
                }
            });
            yield userToken.update({ balance: (Number(userToken.balance) - Number(amount)) });
            const withdrawal = yield Withdrawal_1.Withdrawal.create({
                randoId: response.data.withdrawalRequestId,
                network,
                token,
                symbol,
                amount,
                type: Withdrawal_1.WithdrawTypeState.CRYPTO,
                withdrawalAddress,
                userTokenId: userToken === null || userToken === void 0 ? void 0 : userToken.id,
                userId: id
            });
            // console.log(withdrawal)
            return (0, utility_1.successResponse)(res, "Successful", withdrawal);
        }
        else {
            return (0, utility_1.errorResponse)(res, "Insuffient funds");
        }
    }
    catch (error) {
        console.log(error);
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
const createBank = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    console.log("ddddd");
    const { accountName, bankName, accountNumber } = req.body;
    const bank = yield Bank_1.Banks.create({
        accountName,
        bankName,
        bankAccount: accountNumber,
        userId: id
    });
    return (0, utility_1.successResponse)(res, "Successful", bank);
});
exports.createBank = createBank;
const fetchBank = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const bank = yield Bank_1.Banks.findAll({
        where: { userId: id },
        order: [
            ['createdAt', 'DESC']
        ],
    });
    // console.log(bank)
    return (0, utility_1.successResponse)(res, "Successful", bank);
});
exports.fetchBank = fetchBank;
const createWithdrawalCash = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { network, token, amount, bank, symbol } = req.body;
    const tokens = yield Token_1.Tokens.findOne({ where: { symbol } });
    if (!tokens)
        return (0, utility_1.errorResponse)(res, "Token Not found");
    const userToken = yield UserToken_1.UserTokens.findOne({ where: { tokenId: tokens === null || tokens === void 0 ? void 0 : tokens.id, userId: id } });
    if (!userToken)
        return (0, utility_1.errorResponse)(res, "User Token Not found");
    // const response = await axios({
    //     method: 'GET',
    //     url: `https://api.coinranking.com/v2/coins`,
    //     headers: { 'Content-Type': 'application/json' },
    // })
    // const coinObjectTemp = response.data.data.coins.find((obj: any) => symbol == "BAT" ?
    //     obj.symbol == "USDC" : symbol == "BUSD" ?
    //         obj.symbol == "USDC" : obj.symbol == symbol);
    // const convertedAmount = ((Number(amount)) / Number(coinObjectTemp.price))
    if ((userToken === null || userToken === void 0 ? void 0 : userToken.balance) >= amount) {
        (0, notification_1.sendEmailWithdraw)("", "Withdrawal Request Approval", "review withdrawal from admin dashboard");
        yield userToken.update({ balance: (Number(userToken.balance) - Number(amount)) });
        const withdrawal = yield Withdrawal_1.Withdrawal.create({
            randoId: "",
            network,
            token,
            symbol,
            type: Withdrawal_1.WithdrawTypeState.P2P,
            amount: amount,
            bank,
            userTokenId: userToken === null || userToken === void 0 ? void 0 : userToken.id,
            userId: id
        });
        return (0, utility_1.successResponse)(res, "Successful", withdrawal);
    }
    else {
        return (0, utility_1.errorResponse)(res, "Insuffient funds");
    }
});
exports.createWithdrawalCash = createWithdrawalCash;
const fetchWithdrawal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const withdrawal = yield Withdrawal_1.Withdrawal.findAll({
        where: { userId: id }, order: [
            ['createdAt', 'DESC']
        ],
    });
    return (0, utility_1.successResponse)(res, "Successful", withdrawal);
});
exports.fetchWithdrawal = fetchWithdrawal;
const confirmAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address, crypto } = req.query;
    // const { id } = req.user
    // const user = await Users.findOne({ where: { id } })
    // console.log(user!.fcmToken)
    // await sendFcmNotification("Wallet Top Up", {
    //     description: `Card Your Wallet Top Up was Successful`,
    //     title: "Wallet Top Up",
    //     type: TransactionType.NOTIFICATION,
    //     service: ServiceType.NOTIFICATION,
    //     mata: {},
    // }, user!.fcmToken)
    // await sendEmail(user!.email, "Wallet Top Up",
    //     templateEmail("Wallet Top Up", `<div>Your Card Wallet Top Up was Successful</div>`));
    const valid = WAValidator.validate(address, crypto === null || crypto === void 0 ? void 0 : crypto.toString().toLowerCase(), 'testnet');
    if (valid) {
        console.log('This is a valid address');
        return (0, utility_1.successResponse)(res, `This is a valid ${crypto} address`);
    }
    else {
        console.log('Address INVALID');
        return (0, utility_1.successFalseResponse)(res, `This is an invalid ${crypto} address`);
    }
});
exports.confirmAddress = confirmAddress;
// export const deleteCustomer = async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const customer = await Customers.findOne({ where: { id } })
//     if (!customer) return successResponse(res, "Customer not found");
//     await customer?.destroy()
//     return successResponse(res, "Successful");
// }
//# sourceMappingURL=withdrawal.js.map