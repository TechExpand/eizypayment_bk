"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const withdrawal_1 = require("../controllers/withdrawal");
const routes = (0, express_1.Router)();
/*************************************************************************
API CALL START
*************************************************************************/
// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/user/withdraw', withdrawal_1.createWithdrawal);
routes.post('/user/bank', withdrawal_1.createBank);
routes.get('/user/bank', withdrawal_1.fetchBank);
routes.post('/user/withdraw-cash', withdrawal_1.createWithdrawalCash);
routes.get('/user/withdraw', withdrawal_1.fetchWithdrawal);
routes.get('/test', auth_1.testApi);
routes.get("/user/confirm-address", withdrawal_1.confirmAddress);
exports.default = routes;
//# sourceMappingURL=withdrawal.js.map