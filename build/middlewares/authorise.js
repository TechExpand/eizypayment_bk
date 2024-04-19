"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthorized = void 0;
const configSetup_1 = __importDefault(require("../config/configSetup"));
const utility_1 = require("../helpers/utility");
const jsonwebtoken_1 = require("jsonwebtoken");
const TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";
const isAuthorized = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //this is the url without query params
    const route = req.originalUrl.split('?').shift();
    let publicRoutes = configSetup_1.default.PUBLIC_ROUTES;
    // console.log({ route , check1:publicRoutes.includes(route), publicRoutes})
    if (publicRoutes.includes(route) || (publicRoutes.includes(`/${route.split('/')[1]}`) && !isNaN(route.split('/')[3])))
        return next();
    let token = req.headers.authorization;
    if (!token)
        return (0, utility_1.handleResponse)(res, 401, false, `Access Denied / Unauthorized request`);
    token = token.split(' ')[1]; // Remove Bearer from string
    if (token === 'null' || !token)
        return (0, utility_1.handleResponse)(res, 401, false, `Unauthorized request`);
    let verified = (0, jsonwebtoken_1.verify)(token, TOKEN_SECRET);
    if (!verified)
        return (0, utility_1.handleResponse)(res, 401, false, `Unauthorized request`);
    req.user = verified;
    next();
});
exports.isAuthorized = isAuthorized;
//# sourceMappingURL=authorise.js.map