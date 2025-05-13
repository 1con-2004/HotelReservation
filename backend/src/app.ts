import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import initDatabase from './config/initDb';

const app = express();
const PORT = process.env.PORT || 3000;

// 先解析请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 中间件
app.use(cors({
  origin: '*', // 开发环境允许所有来源访问
  credentials: true, // 允许跨域请求带上凭证
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的HTTP方法
  allowedHeaders: ['Content-Type', 'Authorization'] // 允许的请求头
}));

// 打印所有请求信息，帮助调试
app.use((req, res, next) => {
  console.log(`收到请求: ${req.method} ${req.url}`);
  console.log('请求头:', req.headers);
  if (req.method !== 'GET') {
    console.log('请求体:', req.body);
  }
  next();
});

// 添加错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误，请稍后重试'
  });
});

// 路由
app.use('/api/auth', authRoutes);

// 简单的健康检查路由
app.get('/', (req, res) => {
  res.json({ message: '酒店预约管理系统 API 服务正常运行' });
});

// 初始化数据库并启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await initDatabase();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在端口: ${PORT}`);
      console.log(`前端可以通过 http://localhost:${PORT}/api 访问服务`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  // 保持进程运行，但记录错误
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  // 保持进程运行，但记录错误
});

startServer(); 