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
exports.Admin = exports.VerificationType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
var VerificationType;
(function (VerificationType) {
    VerificationType["EMAIL"] = "EMAIL";
    VerificationType["SMS"] = "SMS";
    VerificationType["BOTH"] = "BOTH";
    VerificationType["RESET"] = "RESET";
})(VerificationType || (exports.VerificationType = VerificationType = {}));
let Admin = class Admin extends sequelize_typescript_1.Model {
};
exports.Admin = Admin;
__decorate([
    (0, sequelize_typescript_1.Default)("1000"),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Admin.prototype, "rate", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Admin.prototype, "USDC", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Admin.prototype, "ETH", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Admin.prototype, "USDT", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Admin.prototype, "BTC", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Admin.prototype, "BUSD", void 0);
exports.Admin = Admin = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'admin' })
], Admin);
//# sourceMappingURL=Admin.js.map