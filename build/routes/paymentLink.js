"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const paymentLink_1 = require("../controllers/paymentLink");
const routes = (0, express_1.Router)();
/*************************************************************************
API CALL START
*************************************************************************/
// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/user/payment', paymentLink_1.createPaymentLink);
routes.get('/user/payment', paymentLink_1.fetchPaymenntRequest);
routes.get('/user/payment/:id', paymentLink_1.fetchSignlePaymenntRequest);
exports.default = routes;
//# sourceMappingURL=paymentLink.js.map