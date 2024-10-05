"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const crowdFund_1 = require("../controllers/crowdFund");
const routes = (0, express_1.Router)();
/*************************************************************************
API CALL START
*************************************************************************/
// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/user/crowdfund', crowdFund_1.createCrowdFund);
routes.get('/user/crowdfund', crowdFund_1.fetchCrowdFund);
routes.get('/user/crowdfund/:id', crowdFund_1.fetchSignleCrowdFund);
exports.default = routes;
//# sourceMappingURL=crowdFund.js.map