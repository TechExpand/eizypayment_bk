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
exports.sendAppNotification = exports.sendWhatsapp = exports.sendEmail = void 0;
const axios = require("axios");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const redis_1 = require("./redis");
const app_1 = require("../app");
const sendEmail = (email, subject, template) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios.post(`https://api.brevo.com/v3/smtp/email`, {
        "sender": {
            "name": "Eizy App",
            "email": "support@eizyapp.com"
        },
        "to": [
            {
                "email": email,
                "name": "User"
            }
        ],
        subject: `${subject}`,
        "htmlContent": `${template}`
    }, {
        headers: {
            "api-key": configSetup_1.default.BREVO,
            "accept": "application/json",
            'Content-Type': ['application/json', 'application/json']
        }
    });
    if (response.status <= 300) {
        return {
            status: true,
            message: response.data,
        };
    }
    else {
        return {
            status: false,
            message: response.data,
        };
    }
});
exports.sendEmail = sendEmail;
const sendWhatsapp = (number, subject, template) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios.post(`https://api.brevo.com/v3/smtp/email`, {
        "sender": {
            "name": "Eizy App",
            "email": "support@eizyapp.com"
        },
        "to": [
            {
                "email": number,
                "name": "User"
            }
        ],
        subject: `${subject}`,
        "htmlContent": `${template}`
    }, {
        headers: {
            "api-key": configSetup_1.default.BREVO,
            "accept": "application/json",
            'Content-Type': ['application/json', 'application/json']
        }
    });
    if (response.status <= 300) {
        return {
            status: true,
            message: response.data,
        };
    }
    else {
        return {
            status: false,
            message: response.data,
        };
    }
});
exports.sendWhatsapp = sendWhatsapp;
const sendAppNotification = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const redis = new redis_1.Redis();
    const cachedSocket = yield redis.getData(`notification-${id}`);
    const socket = app_1.socketio.sockets.sockets.get(cachedSocket);
    console.log(socket);
    console.log(cachedSocket);
    if (socket) {
        socket.emit("notification", data);
    }
});
exports.sendAppNotification = sendAppNotification;
//# sourceMappingURL=notification.js.map