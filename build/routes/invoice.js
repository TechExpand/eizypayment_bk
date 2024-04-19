"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const invoice_1 = require("../controllers/invoice");
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
routes.post('/user/invoice', invoice_1.createInvoice);
routes.get('/user/invoice', invoice_1.fetchInvoice);
routes.get('/user/invoice/:id', invoice_1.fetchSignleInvoice);
routes.get('/user/network', invoice_1.fetchAllNetwork);
routes.post('/user/update-invoice', invoice_1.updateInvoiceStatus);
routes.post('/user/update-invoice', invoice_1.sendInvoiceReminder);
routes.post('/user/webhook', invoice_1.webhook);
routes.get('/invoice/test', auth_1.testApi);
exports.default = routes;
//# sourceMappingURL=invoice.js.map