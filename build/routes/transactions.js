"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const transactions_1 = require("../controllers/transactions");
const routes = (0, express_1.Router)();
/*************************************************************************
API CALL START
*************************************************************************/
// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.get('/user/transactions', transactions_1.fetchTransactions);
routes.get('/user/admin', transactions_1.fetchAdmin);
routes.get('/user/first-six-transactions', transactions_1.fetchFirstSixTransactions);
routes.get('/test', auth_1.testApi);
exports.default = routes;
//# sourceMappingURL=transactions.js.map