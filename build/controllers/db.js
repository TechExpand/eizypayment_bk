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
exports.initDB = exports.sequelize = void 0;
// Import packages
const sequelize_typescript_1 = require("sequelize-typescript");
// Import configs
const configSetup_1 = __importDefault(require("../config/configSetup"));
const Users_1 = require("../models/Users");
const Verify_1 = require("../models/Verify");
const Token_1 = require("../models/Token");
const Customers_1 = require("../models/Customers");
const Invoice_1 = require("../models/Invoice");
const UserToken_1 = require("../models/UserToken");
const Withdrawal_1 = require("../models/Withdrawal");
const Payment_1 = require("../models/Payment");
const Transaction_1 = require("../models/Transaction");
const Bank_1 = require("../models/Bank");
const Admin_1 = require("../models/Admin");
const Wallet_1 = require("../models/Wallet");
const Card_1 = require("../models/Card");
const Price_1 = require("../models/Price");
const sequelize = new sequelize_typescript_1.Sequelize(configSetup_1.default.DBNAME, configSetup_1.default.DBUSERNAME, configSetup_1.default.DBPASSWORD, {
    host: configSetup_1.default.DBHOST,
    port: configSetup_1.default.DBPORT,
    dialect: 'mysql',
    logging: false,
    // dialectOptions: {
    // 	ssl: { require: true, rejectUnauthorized: false },
    // },
    ssl: false,
    models: [
        Users_1.Users,
        Verify_1.Verify,
        Admin_1.Admin,
        Price_1.Price,
        Card_1.Card,
        Bank_1.Banks,
        Token_1.Tokens,
        UserToken_1.UserTokens,
        Wallet_1.Wallet,
        Transaction_1.Transactions,
        Customers_1.Customers,
        Payment_1.PaymentRequests,
        Invoice_1.Invoice,
        Withdrawal_1.Withdrawal
    ],
});
exports.sequelize = sequelize;
const initDB = () => __awaiter(void 0, void 0, void 0, function* () {
    yield sequelize.authenticate();
    yield sequelize
        .sync({ alter: true })
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Database connected!');
    }))
        .catch(function (err) {
        console.log(err, 'Something went wrong with the Database Update!');
    });
});
exports.initDB = initDB;
//# sourceMappingURL=db.js.map