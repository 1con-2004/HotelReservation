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
const db_1 = __importDefault(require("./db"));
const initDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield db_1.default.getConnection();
        // 创建users表
        yield connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user'
      )
    `);
        // 检查是否有管理员账号，如果没有则创建一个默认管理员
        const [rows] = yield connection.query('SELECT * FROM users WHERE role = "admin" LIMIT 1');
        if (rows.length === 0) {
            yield connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', 'admin123', 'admin']);
            console.log('已创建默认管理员账号: admin/admin123');
        }
        // 创建一个普通用户账号
        const [userRows] = yield connection.query('SELECT * FROM users WHERE username = "user" LIMIT 1');
        if (userRows.length === 0) {
            yield connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['user', 'user123', 'user']);
            console.log('已创建默认用户账号: user/user123');
        }
        connection.release();
        console.log('数据库初始化完成');
    }
    catch (error) {
        console.error('数据库初始化失败:', error);
        process.exit(1);
    }
});
exports.default = initDatabase;
