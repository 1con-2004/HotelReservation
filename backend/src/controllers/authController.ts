import { Request, Response } from 'express';
import { getUserByUsername, getUserByEmail, createUser } from '../models/userModel';

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
      message: '服务器错误，请稍后重试'
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;
    
    // 验证输入
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: '用户名、密码和邮箱都是必填项'
      });
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确'
      });
    }
    
    // 验证用户名长度
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: '用户名至少需要3个字符'
      });
    }
    
    // 验证密码长度
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: '密码至少需要8个字符'
      });
    }
    
    // 检查用户名是否已存在
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '用户名已被使用，请更换其他用户名'
      });
    }
    
    // 检查邮箱是否已注册
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: '该邮箱已被注册，请使用其他邮箱'
      });
    }
    
    // 创建新用户
    await createUser(username, password, email);
    
    return res.status(201).json({
      success: true,
      message: '注册成功'
    });
  } catch (error: any) {
    console.error('注册失败:', error);
    
    // 处理唯一键约束错误（数据库级别）
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('username')) {
        return res.status(409).json({
          success: false,
          message: '用户名已被使用，请更换其他用户名'
        });
      } else if (error.message.includes('email')) {
        return res.status(409).json({
          success: false,
          message: '该邮箱已被注册，请使用其他邮箱'
        });
      }
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试'
    });
  }
}; 