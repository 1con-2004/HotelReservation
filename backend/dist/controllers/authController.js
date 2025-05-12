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
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const userModel_1 = require("../models/userModel");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码是必填项'
            });
        }
        const user = yield (0, userModel_1.getUserByUsername)(username);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户不存在'
            });
        }
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: '密码错误'
            });
        }
        // 登录成功
        return res.status(200).json({
            success: true,
            message: '登录成功',
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('登录失败:', error);
        return res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});
exports.login = login;
