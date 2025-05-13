import mysql from 'mysql2/promise';

// 使用内存模式标志
const USE_MEMORY_MODE = true; // 设置为true使用内存模式，无需MySQL

// 内存数据存储
const memoryDB = {
  users: [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      role: 'admin'
    },
    {
      id: 2,
      username: 'user',
      password: 'user123',
      email: 'user@example.com',
      role: 'user'
    }
  ],
  nextId: 3
};

// 内存模式模拟函数
const memoryPool = {
  async query(sql: string, params: any[] = []): Promise<any> {
    console.log('执行SQL查询(内存模式):', sql, params);
    
    // 模拟查询用户
    if (sql.includes('SELECT * FROM users WHERE username =')) {
      const username = params[0];
      const user = memoryDB.users.find(u => u.username === username);
      return [user ? [user] : [], {}];
    }
    
    // 模拟查询邮箱
    if (sql.includes('SELECT * FROM users WHERE email =')) {
      const email = params[0];
      const user = memoryDB.users.find(u => u.email === email);
      return [user ? [user] : [], {}];
    }
    
    // 模拟插入用户
    if (sql.includes('INSERT INTO users')) {
      const [username, password, email, role] = params;
      const newUser = {
        id: memoryDB.nextId++,
        username,
        password,
        email,
        role: role || 'user'
      };
      memoryDB.users.push(newUser);
      return [{}, { insertId: newUser.id }];
    }
    
    // 默认返回空结果
    return [[], {}];
  },
  
  async getConnection() {
    return {
      release: () => {},
      query: this.query
    };
  }
};

// 数据库连接配置
const mysqlPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'hotel',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 选择使用的池
const pool = USE_MEMORY_MODE ? memoryPool : mysqlPool;

// 测试数据库连接
const testConnection = async () => {
  try {
    if (USE_MEMORY_MODE) {
      console.log('使用内存模式，无需连接真实数据库');
      return true;
    }
    
    const connection = await (pool as typeof mysqlPool).getConnection();
    console.log('数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    console.log('将切换到内存模式...');
    return false;
  }
};

// 在应用启动时测试连接
testConnection();

// mysql2/promise不直接支持error事件监听
// 我们可以在每次使用时添加错误捕获

export default pool; 