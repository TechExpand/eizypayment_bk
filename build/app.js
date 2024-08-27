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
exports.socketio = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const configSetup_1 = __importDefault(require("./config/configSetup"));
const db_1 = require("./controllers/db");
const invoice_1 = __importDefault(require("./routes/invoice"));
const withdrawal_1 = __importDefault(require("./routes/withdrawal"));
const auth_1 = __importDefault(require("./routes/auth"));
const paymentLink_1 = __importDefault(require("./routes/paymentLink"));
const crowdFund_1 = __importDefault(require("./routes/crowdFund"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const webAdmin_1 = __importDefault(require("./routes/webAdmin"));
const webUser_1 = __importDefault(require("./routes/webUser"));
const token_1 = __importDefault(require("./routes/admin/token"));
const crypto_1 = __importDefault(require("./routes/crypto"));
const customer_1 = __importDefault(require("./routes/customer"));
const authorise_1 = require("./middlewares/authorise");
const redis_1 = require("./services/redis");
const app = (0, express_1.default)();
const http = require('http').Server(app);
//Socket Logic
exports.socketio = require('socket.io')(http, {
    cors: {
        origin: "*"
    }
});
exports.socketio.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("connetetd");
    console.log(socket.id, "has joined");
    socket.on("signin_notification", (id) => __awaiter(void 0, void 0, void 0, function* () {
        const redis = new redis_1.Redis();
        console.log(id, "userid o");
        const cachedUserSocket = yield redis.setData(`notification-${id}`, socket.id);
    }));
    socket.on("notification", (data) => __awaiter(void 0, void 0, void 0, function* () {
    }));
}));
app.use((0, morgan_1.default)('dev'));
// PARSE JSON
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ENABLE CORS AND START SERVER
app.use((0, cors_1.default)({ origin: true }));
(0, db_1.initDB)();
http.listen(configSetup_1.default.PORT, () => {
    console.log(`Server started on port ${configSetup_1.default.PORT}`);
});
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express_1.default.static(__dirname + '/public'));
// use res.render to load up an ejs view file
app.all('*', authorise_1.isAuthorized);
app.use("/api", invoice_1.default);
app.use("/api", auth_1.default);
app.use("/api", paymentLink_1.default);
app.use("/api", crowdFund_1.default);
app.use("/api", token_1.default);
app.use("/api", customer_1.default);
app.use("/api", transactions_1.default);
app.use("/api", withdrawal_1.default);
app.use("/", webAdmin_1.default);
app.use("/", webUser_1.default);
app.use("/api", crypto_1.default);
//# sourceMappingURL=app.js.map