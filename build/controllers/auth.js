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
exports.testApi = exports.changePassword = exports.getUser = exports.updateUser = exports.login = exports.register = exports.verifyOtp = exports.sendOtp = void 0;
const utility_1 = require("../helpers/utility");
const Users_1 = require("../models/Users");
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
// yarn add stream-chat
const stream_chat_1 = require("stream-chat");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const Verify_1 = require("../models/Verify");
// import { sendEmailResend } from "../services/sms";
const template_1 = require("../config/template");
const notification_1 = require("../services/notification");
const axios_1 = __importDefault(require("axios"));
const Token_1 = require("../models/Token");
const UserToken_1 = require("../models/UserToken");
const random_avatar_generator_1 = require("random-avatar-generator");
const Transaction_1 = require("../models/Transaction");
const Wallet_1 = require("../models/Wallet");
const generator = new random_avatar_generator_1.AvatarGenerator();
// instantiate your stream client using the API key and secret
// the secret is only used server side and gives you full access to the API
const serverClient = stream_chat_1.StreamChat.getInstance('zzfb7h72xhc5', '5pfxakc5zasma3hw9awd2qsqgk2fxyr4a5qb3au4kkdt27d7ttnca7vnusfuztud');
// you can still use new StreamChat('api_key', 'api_secret');
// generate a token for the user with id 'john'
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const emailServiceId = (0, utility_1.randomId)(12);
    const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
    yield Verify_1.Verify.create({
        serviceId: emailServiceId,
        code: codeEmail,
        client: email,
        secret_key: (0, utility_1.createRandomRef)(12, "eizyapp"),
    });
    console.log(codeEmail);
    yield (0, notification_1.sendEmail)(email, "Eizy App otp code", (0, template_1.templateEmail)("Eizy Payment otp code", `<div> Your Verification code is: ${codeEmail} <div/>`));
    return (0, utility_1.successResponse)(res, "Successful", {
        status: true,
        emailServiceId
    });
});
exports.sendOtp = sendOtp;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailServiceId, emailCode, type } = req.body;
    console.log(emailServiceId);
    const verifyEmail = yield Verify_1.Verify.findOne({
        where: {
            serviceId: emailServiceId
        }
    });
    if (verifyEmail) {
        if (verifyEmail.code === emailCode) {
            const verifyEmailResult = yield Verify_1.Verify.findOne({ where: { id: verifyEmail.id } });
            const user = yield Users_1.Users.findOne({ where: { email: verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.client } });
            console.log(user === null || user === void 0 ? void 0 : user.dataValues);
            yield (user === null || user === void 0 ? void 0 : user.update({ state: Users_1.UserState.VERIFIED }));
            yield (verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.destroy());
            return (0, utility_1.successResponse)(res, "Successful", {
                message: "successful",
                status: true
            });
        }
        else {
            (0, utility_1.errorResponse)(res, "Failed", {
                message: `Invalid ${"Email"} Code`,
                status: false
            });
        }
    }
    else {
        (0, utility_1.errorResponse)(res, "Failed", {
            message: `Invalid ${"Email"} Code`,
            status: false
        });
    }
});
exports.verifyOtp = verifyOtp;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, fullname, password, fcmToken, countryCode, phone } = req.body;
    const [firstName, lastName] = fullname.split(' ');
    (0, axios_1.default)({
        method: 'POST',
        url: 'https://sandboxapi.bitnob.co/api/v1/customers',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: `Bearer ${configSetup_1.default.BITNOM}`
        },
        data: {
            email: email,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            countryCode: countryCode
        }
    }).then(function (response) {
        console.log(response.data);
        (0, bcryptjs_1.hash)(password, utility_1.saltRounds, function (err, hashedPassword) {
            return __awaiter(this, void 0, void 0, function* () {
                const userEmail = yield Users_1.Users.findOne({ where: { email } });
                if (!(0, utility_1.validateEmail)(email))
                    return (0, utility_1.errorResponse)(res, "Enter a valid email");
                const user = yield Users_1.Users.create({
                    bitnumData: response.data.data,
                    fcmToken,
                    email, fullname, password: hashedPassword, customerId: "", avater: generator.generateRandomAvatar("https://avataaars.io/?avatarStyle=Circle&topType=WinterHat4&accessoriesType=Blank&hatColor=Heather&facialHairType=BeardMajestic&facialHairColor=Red&clotheType=ShirtScoopNeck&clotheColor=Blue01&eyeType=Surprised&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Brown")
                });
                const emailServiceId = (0, utility_1.randomId)(12);
                const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
                yield Verify_1.Verify.create({
                    serviceId: emailServiceId,
                    code: codeEmail,
                    client: email,
                    secret_key: (0, utility_1.createRandomRef)(12, "eizyapp"),
                });
                yield (0, notification_1.sendEmail)(email, "Eizy Payment otp code", (0, template_1.templateEmail)("Eizy Payment otp code", `<div> Your Verification code is: ${codeEmail} <div/>`));
                //  sendEmailResend(email, codeEmail.toString());
                let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email }, utility_1.TOKEN_SECRET);
                const wallet = yield Wallet_1.Wallet.create({
                    userId: user.id
                });
                yield user.update({ walletId: wallet.id });
                const tokens = yield Token_1.Tokens.findAll({
                    limit: 6,
                    order: [
                        ['createdAt', 'DESC']
                    ],
                });
                tokens.reverse();
                let insertData = [];
                tokens.forEach((e) => {
                    console.log(e.dataValues.id);
                    insertData.push({ tokenId: e.id, userId: user.id });
                });
                yield UserToken_1.UserTokens.bulkCreate(insertData);
                return (0, utility_1.successResponse)(res, "Successful", {
                    email, fullname, token, emailServiceId
                });
            });
        });
    }).catch(function (error) {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(email);
            console.log("error");
            const userEmail = yield Users_1.Users.findOne({ where: { email } });
            if ((userEmail === null || userEmail === void 0 ? void 0 : userEmail.state) === Users_1.UserState.VERIFIED) {
                if (userEmail)
                    return (0, utility_1.errorResponse)(res, "Email already exist", { state: userEmail.state });
            }
            else {
                const emailServiceId = (0, utility_1.randomId)(12);
                const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
                yield Verify_1.Verify.create({
                    serviceId: emailServiceId,
                    code: codeEmail,
                    client: email,
                    secret_key: (0, utility_1.createRandomRef)(12, "eizyapp"),
                });
                yield (0, notification_1.sendEmail)(email, "Eizy Payment otp code", (0, template_1.templateEmail)("Eizy Payment otp code", `<div> Your Verification code is: ${codeEmail} <div/>`));
                let token = (0, jsonwebtoken_1.sign)({ id: userEmail.id, email: userEmail.email }, utility_1.TOKEN_SECRET);
                return (0, utility_1.successResponse)(res, "Successful", {
                    email, fullname, token, emailServiceId
                });
            }
        });
    });
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, password, fcmToken } = req.body;
    const user = yield Users_1.Users.findOne({ where: { email } });
    if (!user)
        return (0, utility_1.errorResponse)(res, "User does not exist");
    const match = yield (0, bcryptjs_1.compare)(password, user.password);
    if (!match)
        return (0, utility_1.errorResponse)(res, "Invalid Credentials");
    let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email }, utility_1.TOKEN_SECRET);
    yield user.update({ fcmToken });
    return (0, utility_1.successResponse)(res, "Successful", Object.assign(Object.assign({}, user.dataValues), { token }));
});
exports.login = login;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { fullname, fcmToken } = req.body;
    let { id } = req.user;
    const user = yield Users_1.Users.findOne({ where: { id } });
    if (!user)
        return (0, utility_1.errorResponse)(res, "Failed", { status: false, message: "User does not exist" });
    if (req.files) {
        let uploadedImageurl = [];
        for (var file of req.files) {
            const result = yield cloudinary.uploader.upload(file.path.replace(/ /g, "_"));
            uploadedImageurl.push(result.secure_url);
        }
        yield user.update({ avater: uploadedImageurl[0] });
        const updatedUser = yield Users_1.Users.findOne({ where: { id } });
        return (0, utility_1.successResponse)(res, "Successful", updatedUser);
    }
    else {
        yield user.update({ fullname: fullname == null || fullname == "" ? user.fullname : fullname, fcmToken });
        const updatedUser = yield Users_1.Users.findOne({ where: { id } });
        return (0, utility_1.successResponse)(res, "Successful", updatedUser);
    }
});
exports.updateUser = updateUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.user;
    const user = yield Users_1.Users.findOne({
        where: { id },
        include: [{
                model: UserToken_1.UserTokens,
                include: [{ model: Token_1.Tokens }]
            }, { model: Wallet_1.Wallet }]
    });
    return (0, utility_1.successResponse)(res, "Successful", user);
});
exports.getUser = getUser;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, email } = req.body;
    (0, bcryptjs_1.hash)(password, utility_1.saltRounds, function (err, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield Users_1.Users.findOne({ where: { email } });
            user === null || user === void 0 ? void 0 : user.update({ password: hashedPassword });
            let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email, admin: true }, utility_1.TOKEN_SECRET);
            return (0, utility_1.successResponse)(res, "Successful", Object.assign(Object.assign({}, user === null || user === void 0 ? void 0 : user.dataValues), { token }));
        });
    });
});
exports.changePassword = changePassword;
const testApi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { invoiceId } = req.query;
    // const invoice = await Invoice.findOne({ where: { randoId: invoiceId } })
    const user = yield Users_1.Users.findOne({ where: { id } });
    // const token = await Tokens.findOne({ where: { symbol: invoice?.symbol } })
    // const creditedToken = await UserTokens.findOne({ where: { tokenId: token?.id } })
    // await creditedToken?.update({ balance: (Number(creditedToken?.balance) + Number(100)) })
    // await Transactions.create({
    //   ref: createRandomRef(8, "txt"),
    //   description: `You Recieved an Invoice Payment of $${100} Successfully`,
    //   title: "Invoice Payment Successful",
    //   type: TransactionType.CREDIT,
    //   service: ServiceType.INVOICE,
    //   amount: 100,
    //   status: TransactionStatus.COMPLETE,
    //   mata: invoice,
    //   userId: id
    // })
    yield (0, notification_1.sendFcmNotification)("Invoice Payment Successful", {
        description: `You Recieved an Invoice Payment of Successfully`,
        title: "Invoice Payment Successful",
        type: Transaction_1.TransactionType.CREDIT,
        service: Transaction_1.ServiceType.INVOICE,
        mata: {
            invoice: {}, token: {
                title: "symbol",
                tokenId: "symbol",
                id: "symbol",
                currency: "symbol",
                amount: "symbol",
                icon: "symbol"
            }
        },
    }, user.fcmToken);
    return (0, utility_1.successResponse)(res, "Successful");
});
exports.testApi = testApi;
//# sourceMappingURL=auth.js.map