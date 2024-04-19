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
exports.Redis = void 0;
const redis_1 = require("redis");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const client = (0, redis_1.createClient)({ url: configSetup_1.default.REDIS_INSTANCE_URL });
client.on('error', (err) => console.log('Redis Client Error', err));
(() => __awaiter(void 0, void 0, void 0, function* () { return yield client.connect(); }))();
class Redis {
    setData(key, value, expiry = 3600) {
        return __awaiter(this, void 0, void 0, function* () {
            yield client.setEx(key, expiry, value);
        });
    }
    getData(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield client.get(key);
            return value;
        });
    }
    deleteData(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield client.del(key);
        });
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            yield client.flushAll();
        });
    }
}
exports.Redis = Redis;
//# sourceMappingURL=redis.js.map