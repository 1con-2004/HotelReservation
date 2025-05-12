import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import initDatabase from './config/initDb';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer(); 