import pool from './db';

const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // 创建users表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user'
      )
    `);
    
    // 检查是否有管理员账号，如果没有则创建一个默认管理员
    const [rows]: any = await connection.query('SELECT * FROM users WHERE role = "admin" LIMIT 1');
    
    if (rows.length === 0) {
      await connection.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', 'admin123', 'admin']
      );
      console.log('已创建默认管理员账号: admin/admin123');
    }

    // 创建一个普通用户账号
    const [userRows]: any = await connection.query('SELECT * FROM users WHERE username = "user" LIMIT 1');
    
    if (userRows.length === 0) {
      await connection.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['user', 'user123', 'user']
      );
      console.log('已创建默认用户账号: user/user123');
    }

    connection.release();
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

export default initDatabase; 