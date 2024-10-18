// import { User } from "./../node_modules/stream-chat/src/types";
// Import packages
import { Router } from "express";
import {
  WithdrawTypeState,
  Withdrawal,
  WithdrawalStatus,
} from "../models/Withdrawal";
import { Users } from "../models/Users";
import { Tokens } from "../models/Token";
import { UserTokens } from "../models/UserToken";
import {
  ServiceType,
  TransactionStatus,
  TransactionType,
  Transactions,
} from "../models/Transaction";
import { createRandomRef } from "../helpers/utility";
import { sendEmail, sendFcmNotification } from "../services/notification";
import { templateEmail } from "../config/template";
import { Admin } from "../models/Admin";
import axios from "axios";
import { Order } from "../models/Order";
import { Price } from "../models/Price";
import { Wallet } from "../models/Wallet";

const routes = Router();

// index page
routes.get("/invoice", function (req, res) {
  const { id } = req.query;
  res.render("pages/invoice", { id });
});

routes.get("/admin/invoice", async function (req, res) {
  const { page } = req.query;
  const perPage = 5;
  const currentPage = page || 1;
  const withdrawal = await Withdrawal.findAll({
    where: {
      type: WithdrawTypeState.P2P,
      status: WithdrawalStatus.PENDING,
    },
    offset: perPage * Number(currentPage) - perPage,
    limit: perPage,
    order: [["createdAt", "DESC"]],
  });
  const count = await Withdrawal.count();
  res.render("pages/invoice-list", {
    withdrawal,
    current: page,
    pages: Math.ceil(count / perPage),
  });
});

routes.get("/admin/order", async function (req, res) {
  const { page } = req.query;
  const perPage = 5;
  const currentPage = page || 1;
  const order = await Order.findAll({
    where: {
      status: WithdrawalStatus.PENDING,
    },
    include: [{ model: Users }],
    offset: perPage * Number(currentPage) - perPage,
    limit: perPage,
    order: [["createdAt", "DESC"]],
  });
  const count = await Order.count();
  res.render("pages/order", {
    order,
    current: page,
    pages: Math.ceil(count / perPage),
  });
});

routes.get("/admin/order-view", async function (req, res) {
  const { id } = req.query;
  const order = await Order.findOne({
    where: {
      id,
    },
    include: [{ model: Users }],
  });
  const price = await Price.findOne({});
  const generateMailtoLink = () => {
    const recipientEmail = order?.user.email;
    return `mailto:${recipientEmail}`;
  };

  res.render("pages/order-overview", {
    order,
    generateMailtoLink,
    rate: price?.rate,
  });
});

routes.get("/admin/invoice-view", async function (req, res) {
  const { id } = req.query;
  const withdrawal = await Withdrawal.findOne({
    where: {
      id,
    },
    include: [{ model: Users }],
  });
  const admins = await Admin.findOne({});
  const generateMailtoLink = () => {
    const recipientEmail = withdrawal?.user.email;
    return `mailto:${recipientEmail}`;
  };

  const combinbedValue =
    Number(withdrawal!.amount.toString()) * Number(admins?.rate);
  // const bankInfo = JSON.parse(withdrawal!.bank)
  // console.log(bankInfo!)

  // res.render('pages/invoice-overview', {
  //     withdrawal, generateMailtoLink,
  //     rate: admins?.rate, value: combinbedValue.toFixed(4),
  //     bankName: bankInfo.bankName,
  //     accountNumber: bankInfo.accountNumber,
  //     accountName: bankInfo.accountName,

  // });

  res.render("pages/invoice-overview", {
    withdrawal,
    generateMailtoLink,
    rate: admins?.rate,
    value: combinbedValue.toFixed(4),
    bankName: withdrawal!.bank.bankName,
    accountNumber: withdrawal!.bank.accountNumber,
    accountName: withdrawal!.bank.accountName,
  });
});

routes.get("/admin/approve-order", async function (req, res) {
  const { id } = req.query;
  const order = await Order.findOne({
    where: {
      id,
    },
    include: [{ model: Users }],
  });
  const wallet = await Wallet.findOne({ where: { userId: order?.userId } });
  await order?.update({ processed: true, status: WithdrawalStatus.COMPLETE });
  await wallet?.update({
    pendingAmount: Number(wallet.pendingAmount) - Number(order?.usd),
  });
  await sendFcmNotification(
    "Naira Deposit Processed",
    {
      description: `Your Naira Deposit has been Processed Successfully`,
      title: "Naira Deposit Processed",
      type: TransactionType.NOTIFICATION,
      mata: {
        // token: {
        // }
      },
      service: ServiceType.NOTIFICATION,
    },
    order!.user!.fcmToken
  );
  await sendEmail(
    order!.user!.email,
    "Naira Deposit Processed",
    templateEmail(
      "Naira Deposit Processed",
      `<div>Your Naira Deposit has been Processed Successfully.<br><br>
 Thank you for choosing our service, and we look forward to serving you again in the future.</div>`
    )
  );
  res.redirect("/admin/order?page=1");
});

routes.get("/admin/approve-withdraw", async function (req, res) {
  const { id } = req.query;
  const withdrawalOne = await Withdrawal.findOne({
    where: {
      id,
    },
    include: [
      { model: Users },
      { model: UserTokens, include: [{ model: Tokens }] },
    ],
  });
  await withdrawalOne?.update({
    processed: true,
    status: WithdrawalStatus.COMPLETE,
  });
  await Transactions.create({
    ref: createRandomRef(8, "txt"),
    description: `You Recieved a Payment of ${withdrawalOne?.symbol} ${withdrawalOne?.amount} Successfully`,
    title: "Withdrawal Paid Successfully",
    type: TransactionType.DEBIT,
    service: ServiceType.WITHDRAWAL,
    amount: withdrawalOne?.amount,
    status: TransactionStatus.COMPLETE,
    mata: withdrawalOne,
    userId: withdrawalOne?.userId,
  });
  await sendFcmNotification(
    "Payment Request Paid Successfully",
    {
      description: `You Recieved a Payment of ${withdrawalOne?.symbol} ${withdrawalOne} Successfully`,
      title: "Withdrawal Paid Successfully",
      type: TransactionType.CREDIT,
      mata: {
        // token: {
        // }
      },
      service: ServiceType.WITHDRAWAL,
    },
    withdrawalOne!.user!.fcmToken
  );
  await sendEmail(
    withdrawalOne!.user!.email,
    "Withdrawal Successful",
    templateEmail(
      "Withdrawal Successful",
      `<div>We're pleased to inform you that your recent withdrawal request has been successfully processed. The funds have been transferred to your designated account.<br><br>

  Here are the details of the withdrawal:<br><br>
  
  Withdrawal ID: ${withdrawalOne!.id} <br>
  Amount Withdrawn: ${withdrawalOne?.symbol} ${withdrawalOne!.amount}<br>
  Date of Withdrawal: ${withdrawalOne!.createdAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}<br><br>

  We hope this transaction meets your expectations, and we're here to assist you with any further inquiries or assistance you may require.<br>
  
  Thank you for choosing our service, and we look forward to serving you again in the future.</div>`
    )
  );
  res.redirect("/admin/invoice?page=1");
});

export default routes;
