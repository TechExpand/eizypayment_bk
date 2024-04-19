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
// routes.get('/user/country', fetchCountry);
// routes.get('/user/platform', fetchPlaforms);
// routes.get('/user/price', fetchPrice);
// routes.get('/user/number', fetchNewNumber);
// routes.get('/user/status', fetchNumberStatus);
routes.post('/user/withdraw', withdrawal_1.createWithdrawal);
routes.get('/user/withdraw', withdrawal_1.fetchWithdrawal);
// routes.delete('/user/withdraw/:id', deleteCustomer);
routes.get('/test', auth_1.testApi);
exports.default = routes;
//# sourceMappingURL=withdrawal.js.map