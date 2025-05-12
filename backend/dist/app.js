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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const initDb_1 = __importDefault(require("./config/initDb"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// 中间件
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// 路由
app.use('/api/auth', authRoutes_1.default);
// 简单的健康检查路由
app.get('/', (req, res) => {
    res.json({ message: '酒店预约管理系统 API 服务正常运行' });
});
// 初始化数据库并启动服务器
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 初始化数据库
        yield (0, initDb_1.default)();
        // 启动服务器
        app.listen(PORT, () => {
            console.log(`服务器运行在端口: ${PORT}`);
        });
    }
    catch (error) {
        console.error('启动服务器失败:', error);
        process.exit(1);
    }
});
startServer();
