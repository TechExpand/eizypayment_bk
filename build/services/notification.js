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
exports.sendFcmNotification = exports.sendWhatsapp = exports.sendEmailWithdraw = exports.sendEmail = void 0;
const axios = require("axios");
const configSetup_1 = __importDefault(require("../config/configSetup"));
var admin = require("firebase-admin");
const { getMessaging } = require('firebase-admin/messaging');
const serviceAccount = require("../keys/key.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const sendEmail = (email, subject, template) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios.post(`https://api.brevo.com/v3/smtp/email`, {
        "sender": {
            "name": "Eisy App",
            "email": "support@eisyglobal.com"
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
const sendEmailWithdraw = (email, subject, template) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios.post(`https://api.brevo.com/v3/smtp/email`, {
        "sender": {
            "name": "Eisy App",
            "email": "support@eisyglobal.com"
        },
        "to": [
            {
                "email": "dailydevo9@gmail.com",
                "name": "Agent"
            },
            {
                "email": "edikufranklyn@gmail.com",
                "name": "Agent"
            },
            {
                "email": "bencarsonbenedict@gmail.com",
                "name": "Agent"
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
exports.sendEmailWithdraw = sendEmailWithdraw;
const sendWhatsapp = (number, subject, template) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios.post(`https://graph.facebook.com/v18.0/FROM_PHONE_NUMBER_ID/messages`, {
        'messaging_product': 'whatsapp',
        'to': '+2347065625368',
        'text': { 'body': 'hi' }
    }, {
        headers: {
            'Authorization': 'ACCESS_TOKEN',
            // 'Content-Type': ['application/json', 'application/json']
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
// export const sendAppNotification = async (id: any, data: any) => {
//   const redis = new Redis();
//   const cachedSocket: any = await redis.getData(`notification-${id}`)
//   const socket = socketio.sockets.sockets.get(cachedSocket);
//   console.log(socket)
//   console.log(cachedSocket)
//   if (socket) {
//     socket.emit("notification", data)
//   } else {
//     console.log("failed")
//   }
// }
const sendFcmNotification = (title, data, token) => __awaiter(void 0, void 0, void 0, function* () {
    const message = {
        notification: {
            title: "Eisy Payment",
            body: title,
        },
        data: { data: JSON.stringify(data) },
        token: token,
    };
    try {
        // Send a message to the device corresponding to the provided
        // registration token.
        const response = yield getMessaging().send(message);
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
        return {
            status: true,
            message: response,
        };
    }
    catch (e) {
        console.log('Error sending message:', e);
        return {
            status: false,
            message: e,
        };
    }
});
exports.sendFcmNotification = sendFcmNotification;
//# sourceMappingURL=notification.js.map