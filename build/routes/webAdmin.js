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
// Import packages
const express_1 = require("express");
const Withdrawal_1 = require("../models/Withdrawal");
const Users_1 = require("../models/Users");
const Token_1 = require("../models/Token");
const UserToken_1 = require("../models/UserToken");
const Transaction_1 = require("../models/Transaction");
const utility_1 = require("../helpers/utility");
const notification_1 = require("../services/notification");
const template_1 = require("../config/template");
const Admin_1 = require("../models/Admin");
const routes = (0, express_1.Router)();
// index page
routes.get('/invoice', function (req, res) {
    const { id } = req.query;
    res.render('pages/invoice', { id });
});
routes.get('/admin/invoice', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page } = req.query;
        const perPage = 5;
        const currentPage = page || 1;
        const withdrawal = yield Withdrawal_1.Withdrawal.findAll({
            where: {
                type: Withdrawal_1.WithdrawTypeState.P2P,
                status: Withdrawal_1.WithdrawalStatus.PENDING
            },
            offset: (perPage * Number(currentPage)) - perPage,
            limit: perPage,
            order: [
                ['createdAt', 'DESC'],
            ],
        });
        const count = yield Withdrawal_1.Withdrawal.count();
        res.render('pages/invoice-list', {
            withdrawal, current: page,
            pages: Math.ceil(count / perPage)
        });
    });
});
routes.get('/admin/invoice-view', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.query;
        const withdrawal = yield Withdrawal_1.Withdrawal.findOne({
            where: {
                id,
            },
            include: [
                { model: Users_1.Users },
            ]
        });
        const admins = yield Admin_1.Admin.findOne({});
        const generateMailtoLink = () => {
            const recipientEmail = withdrawal === null || withdrawal === void 0 ? void 0 : withdrawal.user.email;
            return `mailto:${recipientEmail}`;
        };
        const combinbedValue = Number(withdrawal.amount.toString()) * Number(admins === null || admins === void 0 ? void 0 : admins.rate);
        // const bankInfo = JSON.parse(withdrawal!.bank)
        // console.log(bankInfo!)
        // res.render('pages/invoice-overview', {
        //     withdrawal, generateMailtoLink,
        //     rate: admins?.rate, value: combinbedValue.toFixed(4),
        //     bankName: bankInfo.bankName,
        //     accountNumber: bankInfo.accountNumber,
        //     accountName: bankInfo.accountName,
        // });
        res.render('pages/invoice-overview', {
            withdrawal, generateMailtoLink,
            rate: admins === null || admins === void 0 ? void 0 : admins.rate, value: combinbedValue.toFixed(4),
            bankName: withdrawal.bank.bankName,
            accountNumber: withdrawal.bank.accountNumber,
            accountName: withdrawal.bank.accountName,
        });
    });
});
routes.get('/admin/approve-withdraw', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.query;
        const withdrawalOne = yield Withdrawal_1.Withdrawal.findOne({
            where: {
                id
            },
            include: [
                { model: Users_1.Users },
                { model: UserToken_1.UserTokens, include: [{ model: Token_1.Tokens }] }
            ]
        });
        yield (withdrawalOne === null || withdrawalOne === void 0 ? void 0 : withdrawalOne.update({ processed: true, status: Withdrawal_1.WithdrawalStatus.COMPLETE }));
        yield Transaction_1.Transactions.create({
            ref: (0, utility_1.createRandomRef)(8, "txt"),
            description: `You Recieved a Payment of ${withdrawalOne === null || withdrawalOne === void 0 ? void 0 : withdrawalOne.symbol} ${withdrawalOne === null || withdrawalOne === void 0 ? void 0 : withdrawalOne.amount} Successfully`,
            title: "Withdrawal Paid Successfully",
            type: Transaction_1.TransactionType.DEBIT,
            service: Transaction_1.ServiceType.WITHDRAWAL,
            amount: withdrawalOne === null || withdrawalOne === void 0 ? void 0 : withdrawalOne.amount,
            status: Transaction_1.TransactionStatus.COMPLETE,
            mata: withdrawalOne,
            userId: withdrawalOne === null || withdrawalOne === void 0 ? void 0 : withdrawalOne.userId
        });
        yield (0, notification_1.sendFcmNotification)("Payment Request Paid Successfully", {
            description: `You Recieved a Payment of ${withdrawalOne === null || withdrawalOne === void 0 ? void 0 : withdrawalOne.symbol} ${withdrawalOne} Successfully`,
            title: "Withdrawal Paid Successfully",
            type: Transaction_1.TransactionType.CREDIT,
            mata: {
            // token: {
            // }
            },
            service: Transaction_1.ServiceType.WITHDRAWAL,
        }, withdrawalOne.user.fcmToken);
        yield (0, notification_1.sendEmail)(withdrawalOne.user.email, "Withdrawal Successful", (0, template_1.templateEmail)("Withdrawal Successful", `<div>We're pleased to inform you that your recent withdrawal request has been successfully processed. The funds have been transferred to your designated account.<br><br>

  Here are the details of the withdrawal:<br><br>
  
  Withdrawal ID: ${withdrawalOne.id} <br>
  Amount Withdrawn: ${withdrawalOne === null || withdrawalOne === void 0 ? void 0 : withdrawalOne.symbol} ${withdrawalOne.amount}<br>
  Date of Withdrawal: ${withdrawalOne.createdAt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br><br>

  We hope this transaction meets your expectations, and we're here to assist you with any further inquiries or assistance you may require.<br>
  
  Thank you for choosing our service, and we look forward to serving you again in the future.</div>`));
        res.redirect('/admin/invoice?page=1');
    });
});
exports.default = routes;
//# sourceMappingURL=webAdmin.js.map