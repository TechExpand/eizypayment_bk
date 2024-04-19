"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const token_1 = require("../../controllers/admin/token");
const routes = (0, express_1.Router)();
/*************************************************************************
API CALL START
*************************************************************************/
// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/admin/token', token_1.createToken);
routes.delete('/admin/token/:id', token_1.deleteToken);
routes.get('/admin/token', token_1.fetchTokens);
// routes.get('/sendemail', sendEmailTest);
exports.default = routes;
//# sourceMappingURL=token.js.map