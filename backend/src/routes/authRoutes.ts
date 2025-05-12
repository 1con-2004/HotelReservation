import express, { Request, Response, NextFunction } from 'express';
import { login } from '../controllers/authController';

const router = express.Router();

// 使用中间件包装来解决类型问题
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  login(req, res).catch(next);
});

export default router; 