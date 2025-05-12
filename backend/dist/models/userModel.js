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
exports.createUser = exports.getUserByUsername = void 0;
const db_1 = __importDefault(require("../config/db"));
const getUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.default.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows.length > 0 ? rows[0] : null;
    }
    catch (error) {
        console.error('获取用户信息失败:', error);
        throw error;
    }
});
exports.getUserByUsername = getUserByUsername;
const createUser = (username_1, password_1, ...args_1) => __awaiter(void 0, [username_1, password_1, ...args_1], void 0, function* (username, password, role = 'user') {
    try {
        yield db_1.default.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role]);
    }
    catch (error) {
        console.error('创建用户失败:', error);
        throw error;
    }
});
exports.createUser = createUser;
