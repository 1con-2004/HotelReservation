import pool from '../config/db';

interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  role: string;
}

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

export const createUser = async (
  username: string, 
  password: string, 
  email: string,
  role: string = 'user'
): Promise<void> => {
  try {
    await pool.query(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, password, email, role]
    );
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
}; 