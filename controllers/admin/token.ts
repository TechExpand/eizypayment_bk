import {
  TOKEN_SECRET,
  createRandomRef,
  deleteKey,
  errorResponse,
  handleResponse,
  randomId,
  saltRounds,
  successResponse,
  validateEmail,
} from "../../helpers/utility";
import { Request, Response } from "express";
import { Op, where } from "sequelize";

// yarn add stream-chat
// import { StreamChat } from "stream-chat";
import { Sequelize } from "sequelize-typescript";
import { templateEmail } from "../../config/template";
import { Tokens } from "../../models/Token";
import { Price } from "../../models/Price";
import { Users } from "../../models/Users";
// import { templateEmail } from ".";
import config, { mainUrlBitnob } from "../../config/configSetup";
import { Wallet } from "../../models/Wallet";
import { sendEmail, sendEmailBuy } from "../../services/notification";
import { Order, OrderTypeState } from "../../models/Order";
import { WithdrawalStatus, WithdrawTypeState } from "../../models/Withdrawal";
const fs = require("fs");
const axios = require("axios");

export const createToken = async (req: Request, res: Response) => {
  const { currency, symbol, url } = req.body;
  const available = await Tokens.findOne({ where: { symbol } });
  if (available) return successResponse(res, "Currency already exist");
  const token = await Tokens.create({
    currency,
    symbol,
    url,
  });
  return successResponse(res, "Successful", token);
};

export const deleteToken = async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = await Tokens.findOne({
    where: { id },
  });
  await token?.destroy();
  return successResponse(res, "Deleted");
};

export const fetchTokens = async (req: Request, res: Response) => {
  const token = await Tokens.findAll({
    limit: 6,
    order: [["createdAt", "DESC"]],
  });
  return successResponse(res, "Successful", token.reverse());
};

export const fetchPrices = async (req: Request, res: Response) => {
  const price = await Price.findOne();
  return successResponse(res, "Successful", price);
};

export const createFunding = async (req: Request, res: Response) => {
  const { id, type, amount, usd } = req.body;
  try {
    const user = await Users.findOne({ where: { id } });
    const wallet = await Wallet.findOne({ where: { userId: user!.id } });
    if (type === "USDC") {
      const response = await axios({
        method: "POST",
        url: `https://${mainUrlBitnob}.bitnob.co/api/v1/addresses/generate/usdc`,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${config.BITNOM}`,
        },
        data: {
          chain: "TRX",
          customerEmail: user?.email,
          label: "Eisy Global USDC Wallet",
        },
      });
      console.log(response);
      await user?.update({ address: response.data.data.address });
      await wallet?.update({
        pendingAmount: Number(usd) + Number(wallet.pendingAmount),
      });
      await Order.create({
        network: "TRX",
        token: type,
        address: response.data.data.address,
        symbol: type,
        processed: false,
        amount,
        usd,
        userId: user?.id,
        type: OrderTypeState.BUY,
        status: WithdrawalStatus.PENDING,
      });
      await sendEmailBuy(
        "Request to Buy Crypto in Naira",
        templateEmail(
          "Request to Buy Crypto in Naira",
          `<div> view admin to process order. <div/><br><br><a href=https://app.eisyglobal.com/admin/order /> VIEW ADMIN <a/>`
        )
      );
      return successResponse(res, "Successful", response.data.data);
    } else {
      const response = await axios({
        method: "POST",
        url: `https://${mainUrlBitnob}.bitnob.co/api/v1/addresses/generate/usdt`,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${config.BITNOM}`,
        },
        data: {
          chain: "TRX",
          customerEmail: user?.email,
          label: "Eisy Global USDT Wallet",
        },
      });
      await user?.update({ address: response.data.data.address });
      await wallet?.update({
        pendingAmount: Number(usd) + Number(wallet.pendingAmount),
      });
      await sendEmailBuy(
        "Request to Buy Crypto in Naira",
        templateEmail(
          "Request to Buy Crypto in Naira",
          `<div> view admin to process order. <div/><br><br><a href=https://app.eisyglobal.com/admin/order /> VIEW ADMIN <a/>`
        )
      );
      await Order.create({
        network: "TRX",
        token: type,
        address: response.data.data.address,
        symbol: type,
        processed: false,
        usd,
        amount,
        userId: user?.id,
        type: OrderTypeState.BUY,
        status: WithdrawalStatus.PENDING,
      });
      console.log(response);
      return successResponse(res, "Successful", response.data.data);
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return errorResponse(res, "Failed", error);
      // Do something with this error...
    } else {
      console.error(error);
      return errorResponse(res, "Failed", error);
    }
  }
};
