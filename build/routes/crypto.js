"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const crypto_1 = require("../controllers/crypto");
const routes = (0, express_1.Router)();
/*************************************************************************
API CALL START
*************************************************************************/
// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.get('/user/address', crypto_1.createAddress);
routes.post('/user/kyc', crypto_1.userKyc);
routes.post('/user/create-card', crypto_1.createCard);
routes.get('/user/card', crypto_1.fetchCard);
routes.get('/user/allcard', crypto_1.fetchAllCard);
routes.get('/user/card-transactions', crypto_1.cardTransaction);
routes.post('/user/topup-card', crypto_1.topUpCard);
routes.post('/user/withdraw-card', crypto_1.withdrawCard);
routes.post('/user/withdraw-usd', crypto_1.topUpCard);
routes.post('/user/freeze-card', crypto_1.freezeCard);
routes.post('/user/unfreeze-card', crypto_1.unfreezeCard);
routes.post('/user/send-usdt', crypto_1.sendUsdt);
routes.post('/user/send-usdc', crypto_1.sendUsdc);
routes.post('/user/send-usdt-bank', crypto_1.withdrawBank);
exports.default = routes;
//# sourceMappingURL=crypto.js.map