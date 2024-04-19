"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const paymentLink_1 = require("../controllers/paymentLink");
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
routes.post('/user/payment', paymentLink_1.createPaymentLink);
routes.get('/user/payment', paymentLink_1.fetchPaymenntRequest);
routes.get('/user/payment/:id', paymentLink_1.fetchSignlePaymenntRequest);
routes.get('/test', auth_1.testApi);
exports.default = routes;
//# sourceMappingURL=paymentLink.js.map