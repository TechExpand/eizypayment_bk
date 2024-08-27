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
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const Users_1 = require("../models/Users");
const Invoice_1 = require("../models/Invoice");
const sequelize_1 = require("sequelize");
const routes = (0, express_1.Router)();
routes.get('/buy', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const address = "";
        const { id } = req.query;
        res.render('pages/fiat-buy', { address, invoiceId: id });
    });
});
routes.get('/sell', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.render('pages/fiat-sell', { invoiceId: "invoiceId" });
    });
});
routes.get('/preview', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.query;
        const invoice = yield Invoice_1.Invoice.findOne({ where: { randoId: id } });
        console.log(invoice === null || invoice === void 0 ? void 0 : invoice.lineItems);
        res.render('pages/preview', { invoice });
    });
});
routes.get('/admin/invoice-fiat-overview', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.query;
        const invoice = yield Invoice_1.Invoice.findOne({
            where: {
                id,
            }, include: [{ model: Users_1.Users }]
        });
        const generateMailtoLink = () => {
            const recipientEmail = invoice === null || invoice === void 0 ? void 0 : invoice.user.email;
            return `mailto:${recipientEmail}`;
        };
        res.render('pages/invoice-fiat-overview', {
            invoice, generateMailtoLink
        });
    });
});
routes.get('/admin/invoice-fiat', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page } = req.query;
        const perPage = 5;
        const currentPage = page || 1;
        const invoice = yield Invoice_1.Invoice.findAll({
            where: {
                // processedForFiat: true,
                // status: "PROCESSING"
                [sequelize_1.Op.or]: [
                    { '$status$': { [sequelize_1.Op.like]: '%' + "PROCESSING" + '%' } },
                ]
            },
            offset: (perPage * Number(currentPage)) - perPage,
            limit: perPage,
            order: [
                ['createdAt', 'DESC'],
            ],
        });
        const count = yield Invoice_1.Invoice.count();
        res.render('pages/invoice-fiat', {
            invoice, current: page,
            pages: Math.ceil(count / perPage)
        });
    });
});
exports.default = routes;
//# sourceMappingURL=webUser.js.map