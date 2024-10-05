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
exports.deleteCustomer = exports.fetchCustomer = exports.createCustomer = void 0;
const utility_1 = require("../helpers/utility");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const Customers_1 = require("../models/Customers");
const fs = require("fs");
const axios = require('axios');
const createCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { email, fullname } = req.body;
    try {
        const response = yield axios({
            method: 'POST',
            url: 'https://api.radom.network/customer',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${configSetup_1.default.RADON}`
            },
            data: {
                "name": fullname,
                "email": email == "dailydevo9@gmail.com" ? email :
                    email.toString().replace("@", "eisyappmail@")
            }
        });
        console.log(response.data);
        const customer = yield Customers_1.Customers.create({
            randoId: response.data.id,
            email: response.data.email.toString().toString().replace("eisyappmail", ""),
            name: response.data.name,
            billingAddress: response.data.billingAddress,
            phone: response.data.phone,
            telegram: response.data.telegram,
            discord: response.data.discord,
            userId: id
        });
        return (0, utility_1.successResponse)(res, "Successful", customer);
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            return (0, utility_1.successResponse)(res, "Failed", error.response.data);
            // Do something with this error...
        }
        else {
            console.error(error);
            return (0, utility_1.successResponse)(res, "Failed", error);
        }
    }
});
exports.createCustomer = createCustomer;
const fetchCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const customer = yield Customers_1.Customers.findAll({
        where: { userId: id }, order: [
            ['createdAt', 'DESC']
        ],
    });
    return (0, utility_1.successResponse)(res, "Successful", customer);
});
exports.fetchCustomer = fetchCustomer;
const deleteCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const customer = yield Customers_1.Customers.findOne({ where: { id } });
    if (!customer)
        return (0, utility_1.successResponse)(res, "Customer not found");
    yield (customer === null || customer === void 0 ? void 0 : customer.destroy());
    return (0, utility_1.successResponse)(res, "Successful");
});
exports.deleteCustomer = deleteCustomer;
//# sourceMappingURL=customer.js.map