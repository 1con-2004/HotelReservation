"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
// 数据库连接配置
const pool = promise_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hotel',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
exports.default = pool;
