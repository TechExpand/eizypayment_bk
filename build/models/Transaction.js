"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transactions = exports.TransactionStatus = exports.TransactionDateType = exports.ServiceType = exports.TransactionType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Users_1 = require("./Users");
var TransactionType;
(function (TransactionType) {
    TransactionType["DEBIT"] = "DEBIT";
    TransactionType["CREDIT"] = "CREDIT";
    TransactionType["NOTIFICATION"] = "NOTIFICATION";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var ServiceType;
(function (ServiceType) {
    ServiceType["INVOICE"] = "INVOICE";
    ServiceType["PAYMENT_REQUEST"] = "PAYMENT_REQUEST";
    ServiceType["CROWD_FUND"] = "CROWD_FUND";
    ServiceType["WITHDRAWAL"] = "WITHDRAWAL";
    ServiceType["NOTIFICATION"] = "NOTIFICATION";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
var TransactionDateType;
(function (TransactionDateType) {
    TransactionDateType["SINGLE_DATE"] = "SINGLE_DATE";
    TransactionDateType["THIS_MONTH"] = "THIS_MONTH";
    TransactionDateType["DATE_RANGE"] = "DATE_RANGE";
    TransactionDateType["ALL"] = "ALL";
})(TransactionDateType || (exports.TransactionDateType = TransactionDateType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["COMPLETE"] = "COMPLETE";
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["NONE"] = "NONE";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let Transactions = class Transactions extends sequelize_typescript_1.Model {
};
exports.Transactions = Transactions;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Transactions.prototype, "ref", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Transactions.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Transactions.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(TransactionType.CREDIT, TransactionType.DEBIT, TransactionType.NOTIFICATION)),
    __metadata("design:type", String)
], Transactions.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(ServiceType.INVOICE, ServiceType.PAYMENT_REQUEST, ServiceType.WITHDRAWAL, ServiceType.CROWD_FUND, ServiceType.NOTIFICATION)),
    __metadata("design:type", String)
], Transactions.prototype, "service", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", Number)
], Transactions.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Transactions.prototype, "read", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(TransactionStatus.COMPLETE, TransactionStatus.PENDING, TransactionStatus.NONE)),
    __metadata("design:type", String)
], Transactions.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", Object)
], Transactions.prototype, "mata", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.ForeignKey)(() => Users_1.Users),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Transactions.prototype, "userId", void 0);
exports.Transactions = Transactions = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'transactions' })
], Transactions);
//# sourceMappingURL=Transaction.js.map