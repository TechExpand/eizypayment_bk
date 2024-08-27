"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const upload_1 = require("../helpers/upload");
const routes = (0, express_1.Router)();
/*************************************************************************
API CALL START
*************************************************************************/
// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/user/login', auth_1.login);
routes.post('/user/update', upload_1.upload.array("image"), auth_1.updateUser);
routes.post('/user/register', auth_1.register);
routes.post('/user/forget', auth_1.changePassword);
routes.post('/user/verify', auth_1.verifyOtp);
routes.post('/user/send-otp', auth_1.sendOtp);
routes.get('/user', auth_1.getUser);
// routes.get('/sendemail', sendEmailTest);
exports.default = routes;
//# sourceMappingURL=auth.js.map