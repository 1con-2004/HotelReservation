import { Request, Response } from 'express';
import { getUserByUsername } from '../models/userModel';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码是必填项'
      });
    }

    const user = await getUserByUsername(username);

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
  } catch (error) {
    console.error('登录失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
}; 