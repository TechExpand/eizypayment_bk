"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const routes = (0, express_1.Router)();
// index page
routes.get('/invoice', function (req, res) {
    const { id } = req.query;
    res.render('pages/invoice', { id });
});
exports.default = routes;
//# sourceMappingURL=web.js.map