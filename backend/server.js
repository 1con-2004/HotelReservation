const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// 内存数据库
const db = {
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
  nextId: 3,
  // 添加优惠活动数据
  promotions: [
    {
      id: 1,
      title: '暑期特惠8折',
      description: '预订7月至8月的房间，所有房型享受8折优惠',
      discount: 20,
      startDate: '2023-07-01',
      endDate: '2023-08-31',
      code: 'SUMMER2023',
      status: 'active',
      isFeature: true
    },
    {
      id: 2,
      title: '长住优惠',
      description: '连续入住7天以上，享受7.5折优惠',
      discount: 25,
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      code: 'LONGSTAY',
      status: 'active',
      isFeature: true
    },
    {
      id: 3,
      title: '双十一优惠',
      description: '11月11日预订任意房型，享受6.5折优惠',
      discount: 35,
      startDate: '2023-11-01',
      endDate: '2023-11-15',
      code: 'DOUBLE11',
      status: 'coming',
      isFeature: false
    },
    {
      id: 4,
      title: '春节特惠',
      description: '农历春节期间预订享受8.5折优惠',
      discount: 15,
      startDate: '2023-01-20',
      endDate: '2023-02-05',
      code: 'SPRING2023',
      status: 'expired',
      isFeature: false
    }
  ],
  promotionNextId: 5
};

// 中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 身份验证中间件
const authenticateUser = (req, res, next) => {
  const { username } = req.headers;
  
  if (!username) {
    return res.status(401).json({
      success: false,
      message: '需要登录才能访问'
    });
  }
  
  const user = db.users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: '无效的用户'
    });
  }
  
  req.user = user;
  next();
};

// 管理员身份验证中间件
const authenticateAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  
  next();
};

// 登录API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: '用户名和密码是必填项'
    });
  }
  
  const user = db.users.find(u => u.username === username);
  
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
  
  res.json({
    success: true,
    message: '登录成功',
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

// 注册API
app.post('/api/auth/register', (req, res) => {
  const { username, password, email } = req.body;
  
  console.log('接收到注册请求:', { username, email, password: '******' });
  
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
  if (db.users.some(u => u.username === username)) {
    return res.status(409).json({
      success: false,
      message: '用户名已被使用，请更换其他用户名'
    });
  }
  
  // 检查邮箱是否已注册
  if (db.users.some(u => u.email === email)) {
    return res.status(409).json({
      success: false,
      message: '该邮箱已被注册，请使用其他邮箱'
    });
  }
  
  // 创建新用户
  const newUser = {
    id: db.nextId++,
    username,
    password,
    email,
    role: 'user'
  };
  
  db.users.push(newUser);
  console.log('注册成功，当前用户列表:', db.users);
  
  res.status(201).json({
    success: true,
    message: '注册成功'
  });
});

// 获取所有优惠活动API（公开）
app.get('/api/promotions', (req, res) => {
  // 默认只返回活跃的优惠活动
  const { status = 'active', all = 'false' } = req.query;
  
  let promotions = db.promotions;
  
  // 根据状态筛选
  if (status !== 'all' && all !== 'true') {
    promotions = promotions.filter(p => p.status === status);
  }
  
  // 排序：优先显示推荐，然后是活跃的优惠
  promotions.sort((a, b) => {
    if (a.isFeature !== b.isFeature) {
      return a.isFeature ? -1 : 1;
    }
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1;
    }
    return new Date(a.startDate) - new Date(b.startDate);
  });
  
  res.json({
    success: true,
    data: promotions
  });
});

// 获取单个优惠活动详情API（公开）
app.get('/api/promotions/:id', (req, res) => {
  const promotionId = parseInt(req.params.id);
  const promotion = db.promotions.find(p => p.id === promotionId);
  
  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: '优惠活动不存在'
    });
  }
  
  res.json({
    success: true,
    data: promotion
  });
});

// 管理员：添加优惠活动API
app.post('/api/admin/promotions', authenticateUser, authenticateAdmin, (req, res) => {
  const { title, description, discount, startDate, endDate, code, status, isFeature } = req.body;
  
  // 验证必填字段
  if (!title || !description || discount === undefined || !startDate || !endDate || !code) {
    return res.status(400).json({
      success: false,
      message: '标题、描述、折扣率、开始日期、结束日期和优惠码都是必填项'
    });
  }
  
  // 检查优惠码是否已存在
  if (db.promotions.some(p => p.code === code)) {
    return res.status(409).json({
      success: false,
      message: '优惠码已被使用，请更换其他优惠码'
    });
  }
  
  // 创建新优惠活动
  const newPromotion = {
    id: db.promotionNextId++,
    title,
    description,
    discount: parseFloat(discount),
    startDate,
    endDate,
    code,
    status: status || 'active',
    isFeature: isFeature || false
  };
  
  db.promotions.push(newPromotion);
  console.log('创建优惠活动成功:', newPromotion);
  
  res.status(201).json({
    success: true,
    message: '创建优惠活动成功',
    data: newPromotion
  });
});

// 管理员：更新优惠活动API
app.put('/api/admin/promotions/:id', authenticateUser, authenticateAdmin, (req, res) => {
  const promotionId = parseInt(req.params.id);
  const promotionIndex = db.promotions.findIndex(p => p.id === promotionId);
  
  if (promotionIndex === -1) {
    return res.status(404).json({
      success: false,
      message: '优惠活动不存在'
    });
  }
  
  const { title, description, discount, startDate, endDate, code, status, isFeature } = req.body;
  
  // 验证必填字段
  if (!title || !description || discount === undefined || !startDate || !endDate || !code) {
    return res.status(400).json({
      success: false,
      message: '标题、描述、折扣率、开始日期、结束日期和优惠码都是必填项'
    });
  }
  
  // 检查优惠码是否已被其他优惠活动使用
  const codeExists = db.promotions.some(p => p.code === code && p.id !== promotionId);
  if (codeExists) {
    return res.status(409).json({
      success: false,
      message: '优惠码已被使用，请更换其他优惠码'
    });
  }
  
  // 更新优惠活动
  db.promotions[promotionIndex] = {
    ...db.promotions[promotionIndex],
    title,
    description,
    discount: parseFloat(discount),
    startDate,
    endDate,
    code,
    status: status || db.promotions[promotionIndex].status,
    isFeature: isFeature !== undefined ? isFeature : db.promotions[promotionIndex].isFeature
  };
  
  console.log('更新优惠活动成功:', db.promotions[promotionIndex]);
  
  res.json({
    success: true,
    message: '更新优惠活动成功',
    data: db.promotions[promotionIndex]
  });
});

// 管理员：删除优惠活动API
app.delete('/api/admin/promotions/:id', authenticateUser, authenticateAdmin, (req, res) => {
  const promotionId = parseInt(req.params.id);
  const promotionIndex = db.promotions.findIndex(p => p.id === promotionId);
  
  if (promotionIndex === -1) {
    return res.status(404).json({
      success: false,
      message: '优惠活动不存在'
    });
  }
  
  db.promotions.splice(promotionIndex, 1);
  console.log('删除优惠活动成功，ID:', promotionId);
  
  res.json({
    success: true,
    message: '删除优惠活动成功'
  });
});

// 健康检查API
app.get('/', (req, res) => {
  res.json({ message: '酒店预约管理系统 API 服务正常运行' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口: ${PORT}`);
  console.log(`前端可以通过 http://localhost:${PORT}/api 访问服务`);
}); 