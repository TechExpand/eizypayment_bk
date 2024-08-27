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
exports.Wallet = exports.UserState = exports.UserStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const uuid_1 = require("uuid");
const Users_1 = require("./Users");
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var UserState;
(function (UserState) {
    UserState["STEP_ONE"] = "STEP_ONE";
    UserState["STEP_TWO"] = "STEP_TWO";
    UserState["VERIFIED"] = "VERIFIED";
})(UserState || (exports.UserState = UserState = {}));
let Wallet = class Wallet extends sequelize_typescript_1.Model {
};
exports.Wallet = Wallet;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(uuid_1.v4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Wallet.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0.0),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.FLOAT),
    __metadata("design:type", Object)
], Wallet.prototype, "balance", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Users_1.Users),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Wallet.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Users_1.Users, { onDelete: 'CASCADE' }),
    __metadata("design:type", Users_1.Users)
], Wallet.prototype, "user", void 0);
exports.Wallet = Wallet = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'wallet' })
], Wallet);
//# sourceMappingURL=Wallet.js.map