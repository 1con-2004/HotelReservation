import express, { Request, Response, NextFunction } from 'express';
import { login, register } from '../controllers/authController';

const router = express.Router();

// 调试中间件
const logRouteAccess = (routeName: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    console.log(`访问 ${routeName} 路由 - 请求参数:`, req.body);
    next();
  };
};

// 登录路由
router.post('/login', logRouteAccess('登录'), (req: Request, res: Response, next: NextFunction) => {
  console.log('处理登录请求');
  login(req, res).catch((err) => {
    console.error('登录请求处理错误:', err);
    next(err);
  });
});

// 注册路由
router.post('/register', logRouteAccess('注册'), (req: Request, res: Response, next: NextFunction) => {
  console.log('处理注册请求');
  register(req, res).catch((err) => {
    console.error('注册请求处理错误:', err);
    next(err);
  });
});

export default router; 