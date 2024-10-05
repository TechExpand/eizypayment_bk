"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const customer_1 = require("../controllers/customer");
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
routes.post('/user/customer', customer_1.createCustomer);
routes.get('/user/customer', customer_1.fetchCustomer);
routes.delete('/user/customer/:id', customer_1.deleteCustomer);
exports.default = routes;
//# sourceMappingURL=customer.js.map