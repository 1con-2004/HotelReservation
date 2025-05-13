import axios, { AxiosError } from 'axios';

// 设置为true启用模拟模式，不需要后端服务器
const USE_MOCK_MODE = true;

// 模拟数据存储，使用localStorage持久化
const getLocalUsers = (): any[] => {
  try {
    const savedUsers = localStorage.getItem('mock_users');
    if (savedUsers) {
      return JSON.parse(savedUsers);
    }
  } catch (e) {
    console.error('获取本地用户数据失败:', e);
  }
  
  // 默认用户
  const defaultUsers = [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      role: 'admin',
      emailVerified: true
    },
    {
      id: 2,
      username: 'user',
      password: 'user123',
      email: 'user@example.com',
      role: 'user',
      emailVerified: true
    }
  ];
  
  localStorage.setItem('mock_users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

// 获取邮箱验证码数据
const getLocalVerificationCodes = (): any[] => {
  try {
    const savedCodes = localStorage.getItem('mock_verification_codes');
    if (savedCodes) {
      return JSON.parse(savedCodes);
    }
  } catch (e) {
    console.error('获取本地验证码数据失败:', e);
  }
  
  // 默认为空数组
  localStorage.setItem('mock_verification_codes', JSON.stringify([]));
  return [];
};

// 保存验证码数据到localStorage
const saveLocalVerificationCodes = (codes: any[]) => {
  localStorage.setItem('mock_verification_codes', JSON.stringify(codes));
};

// 模拟优惠活动数据
const getLocalPromotions = (): any[] => {
  try {
    const savedPromotions = localStorage.getItem('mock_promotions');
    if (savedPromotions) {
      return JSON.parse(savedPromotions);
    }
  } catch (e) {
    console.error('获取本地优惠活动数据失败:', e);
  }
  
  // 默认优惠活动
  const defaultPromotions = [
    {
      id: 1,
      title: '暑期特惠8折',
      description: '预订7月至8月的房间，所有房型享受8折优惠',
      // 优惠类型: percent(百分比折扣), fixed(固定金额优惠), gift(赠品), additional(额外服务)
      promotionType: 'percent',
      discount: 20,
      // 优惠金额(仅当promotionType为fixed时使用)
      amount: 0,
      // 最低消费要求(0表示无门槛)
      minAmount: 0,
      // 适用范围: all(所有), room(特定房型), dining(餐饮), spa(水疗)
      applicableScope: 'all',
      // 特定房型IDs(仅当applicableScope为room时使用)
      applicableRooms: [],
      startDate: '2023-07-01',
      endDate: '2023-08-31',
      code: 'SUMMER2023',
      // 优惠状态: active(进行中), coming(即将开始), expired(已过期)
      status: 'active',
      // 是否推荐显示
      isFeature: true,
      // 库存/配额限制(0表示无限制)
      quota: 0,
      // 每用户使用次数限制(0表示无限制)
      userLimit: 0,
      // 已使用次数
      usedCount: 8,
      // 赠品/额外服务描述(仅当promotionType为gift或additional时使用)
      giftDescription: '',
      // 适用的用户群体: all(所有用户), member(会员), vip(VIP会员)
      userGroup: 'all',
      // 标签(用于分类和筛选)
      tags: ['夏季', '热门'],
      // 创建日期
      createdAt: '2023-05-15',
      // 更新日期
      updatedAt: '2023-05-15'
    },
    {
      id: 2,
      title: '长住优惠',
      description: '连续入住7天以上，享受7.5折优惠',
      promotionType: 'percent',
      discount: 25,
      amount: 0,
      minAmount: 0,
      applicableScope: 'room',
      applicableRooms: [1, 2, 3, 4, 5],
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      code: 'LONGSTAY',
      status: 'active',
      isFeature: true,
      quota: 0,
      userLimit: 1,
      usedCount: 12,
      giftDescription: '',
      userGroup: 'all',
      tags: ['长住', '全年'],
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    },
    {
      id: 3,
      title: '双十一优惠',
      description: '11月11日预订任意房型，享受6.5折优惠',
      promotionType: 'percent',
      discount: 35,
      amount: 0,
      minAmount: 0,
      applicableScope: 'all',
      applicableRooms: [],
      startDate: '2023-11-01',
      endDate: '2023-11-15',
      code: 'DOUBLE11',
      status: 'coming',
      isFeature: false,
      quota: 100,
      userLimit: 1,
      usedCount: 0,
      giftDescription: '',
      userGroup: 'all',
      tags: ['节日', '限时'],
      createdAt: '2023-09-01',
      updatedAt: '2023-09-01'
    },
    {
      id: 4,
      title: '春节特惠',
      description: '农历春节期间预订享受8.5折优惠',
      promotionType: 'percent',
      discount: 15,
      amount: 0,
      minAmount: 0,
      applicableScope: 'all',
      applicableRooms: [],
      startDate: '2023-01-20',
      endDate: '2023-02-05',
      code: 'SPRING2023',
      status: 'expired',
      isFeature: false,
      quota: 0,
      userLimit: 0,
      usedCount: 45,
      giftDescription: '',
      userGroup: 'all',
      tags: ['节日', '春节'],
      createdAt: '2022-12-01',
      updatedAt: '2022-12-01'
    },
    {
      id: 5,
      title: '满1000减200',
      description: '预订金额满1000元减200元',
      promotionType: 'fixed',
      discount: 0,
      amount: 200,
      minAmount: 1000,
      applicableScope: 'all',
      applicableRooms: [],
      startDate: '2023-06-01',
      endDate: '2023-09-30',
      code: 'SAVE200',
      status: 'active',
      isFeature: true,
      quota: 50,
      userLimit: 1,
      usedCount: 22,
      giftDescription: '',
      userGroup: 'all',
      tags: ['满减', '夏季'],
      createdAt: '2023-05-20',
      updatedAt: '2023-05-20'
    },
    {
      id: 6,
      title: '会员专享8.5折',
      description: '会员专享，任意房型享受8.5折优惠',
      promotionType: 'percent',
      discount: 15,
      amount: 0,
      minAmount: 0,
      applicableScope: 'all',
      applicableRooms: [],
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      code: 'MEMBER2023',
      status: 'active',
      isFeature: false,
      quota: 0,
      userLimit: 0,
      usedCount: 68,
      giftDescription: '',
      userGroup: 'member',
      tags: ['会员', '全年'],
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    },
    {
      id: 7,
      title: '入住即送SPA券',
      description: '入住豪华套房即送价值300元SPA体验券一张',
      promotionType: 'gift',
      discount: 0,
      amount: 0,
      minAmount: 0,
      applicableScope: 'room',
      applicableRooms: [4],
      startDate: '2023-07-15',
      endDate: '2023-10-15',
      code: 'FREESPA',
      status: 'active',
      isFeature: true,
      quota: 30,
      userLimit: 1,
      usedCount: 12,
      giftDescription: '价值300元SPA体验券一张',
      userGroup: 'all',
      tags: ['赠品', '高端'],
      createdAt: '2023-07-01',
      updatedAt: '2023-07-01'
    },
    {
      id: 8,
      title: 'VIP专享接送机',
      description: 'VIP会员入住三天以上即享免费接送机服务',
      promotionType: 'additional',
      discount: 0,
      amount: 0,
      minAmount: 0,
      applicableScope: 'all',
      applicableRooms: [],
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      code: 'VIPTRANSFER',
      status: 'active',
      isFeature: false,
      quota: 0,
      userLimit: 0,
      usedCount: 15,
      giftDescription: '免费接送机服务一次',
      userGroup: 'vip',
      tags: ['VIP', '额外服务'],
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    }
  ];
  
  localStorage.setItem('mock_promotions', JSON.stringify(defaultPromotions));
  return defaultPromotions;
};

// 模拟房间数据
const getLocalRooms = (): any[] => {
  try {
    const savedRooms = localStorage.getItem('mock_rooms');
    if (savedRooms) {
      const parsedRooms = JSON.parse(savedRooms);
      console.log('从localStorage读取到房间数据:', parsedRooms.length, '个房间');
      return parsedRooms;
    }
  } catch (e) {
    console.error('获取本地房间数据失败:', e);
  }
  
  // 默认房间数据
  console.log('创建默认房间数据');
  const defaultRooms = [
    {
      id: 1,
      name: '豪华单人间',
      price: 388,
      discount: 0,
      roomType: '单人间',
      bedType: '单人床',
      area: 25,
      capacity: 1,
      hasBreakfast: true,
      hasWindow: true,
      description: '宽敞明亮的单人房间，配备舒适的单人床和现代化设施，享受宁静的休息环境。',
      facilities: ['免费WiFi', '空调', '电视', '保险箱', '独立卫浴', '吹风机'],
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
      floor: 3,
      position: { x: 30, y: 40 },
      available: true,
      isPromotion: false
    },
    {
      id: 2,
      name: '豪华双人间',
      price: 488,
      discount: 10,
      roomType: '双人间',
      bedType: '大床',
      area: 30,
      capacity: 2,
      hasBreakfast: true,
      hasWindow: true,
      description: '豪华双人间提供一张舒适的大床，精致的装修风格，配备齐全的现代化设施，让您享受高品质的住宿体验。',
      facilities: ['免费WiFi', '空调', '电视', '保险箱', '独立卫浴', '吹风机', '迷你吧'],
      images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
      floor: 5,
      position: { x: 70, y: 50 },
      available: true,
      isPromotion: true
    },
    {
      id: 3,
      name: '行政双床房',
      price: 588,
      discount: 0,
      roomType: '双人间',
      bedType: '双床',
      area: 35,
      capacity: 2,
      hasBreakfast: true,
      hasWindow: true,
      description: '行政双床房配备两张舒适单人床，宽敞明亮的空间，适合商务旅行或两人同行的客人。',
      facilities: ['免费WiFi', '空调', '电视', '保险箱', '独立卫浴', '吹风机', '书桌', '沙发'],
      images: ['https://images.unsplash.com/photo-1594560913095-8cf34bae6e26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
      floor: 8,
      position: { x: 120, y: 60 },
      available: true,
      isPromotion: false
    },
    {
      id: 4,
      name: '豪华套房',
      price: 888,
      discount: 15,
      roomType: '套房',
      bedType: '特大床',
      area: 50,
      capacity: 2,
      hasBreakfast: true,
      hasWindow: true,
      description: '豪华套房提供独立客厅和卧室，宽敞的空间和豪华的设施，为追求高品质住宿体验的客人提供完美选择。',
      facilities: ['免费WiFi', '空调', '电视', '保险箱', '独立卫浴', '吹风机', '迷你吧', '咖啡机', '浴缸', '客厅'],
      images: ['https://images.unsplash.com/photo-1631049035182-249067d7618e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
      floor: 10,
      position: { x: 150, y: 30 },
      available: true,
      isPromotion: true
    },
    {
      id: 5,
      name: '家庭房',
      price: 688,
      discount: 5,
      roomType: '家庭房',
      bedType: '大床+单人床',
      area: 45,
      capacity: 3,
      hasBreakfast: true,
      hasWindow: true,
      description: '家庭房提供一张大床和一张单人床，适合家庭或三人入住，宽敞舒适的空间让您享受愉快的家庭时光。',
      facilities: ['免费WiFi', '空调', '电视', '保险箱', '独立卫浴', '吹风机', '迷你吧', '书桌'],
      images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
      floor: 6,
      position: { x: 80, y: 120 },
      available: true,
      isPromotion: false
    },
    {
      id: 6,
      name: '经济单人间',
      price: 268,
      discount: 0,
      roomType: '单人间',
      bedType: '单人床',
      area: 18,
      capacity: 1,
      hasBreakfast: false,
      hasWindow: false,
      description: '经济实惠的单人间，虽然空间紧凑但功能齐全，适合预算有限的商务旅客或单人旅行者。',
      facilities: ['免费WiFi', '空调', '电视', '独立卫浴', '吹风机'],
      images: ['https://images.unsplash.com/photo-1631049552240-59c37f38802b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
      floor: 2,
      position: { x: 40, y: 90 },
      available: true,
      isPromotion: false
    }
  ];
  
  localStorage.setItem('mock_rooms', JSON.stringify(defaultRooms));
  return defaultRooms;
};

// 模拟会员数据
const getLocalMemberships = (): any[] => {
  try {
    const savedMemberships = localStorage.getItem('mock_memberships');
    if (savedMemberships) {
      return JSON.parse(savedMemberships);
    }
  } catch (e) {
    console.error('获取本地会员数据失败:', e);
  }
  
  // 默认会员数据 - 与用户ID关联
  const defaultMemberships = [
    {
      userId: 1,
      level: 'gold',  // 金卡会员
      points: 2800,
      joinDate: '2022-05-15',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      coupons: [
        { id: 1, name: '满500减100', discount: 100, minAmount: 500, expireDate: '2023-12-31' },
        { id: 2, name: '生日特惠8折', discount: 20, expireDate: '2023-11-30', type: 'percent' }
      ],
      benefits: {
        discountRate: 15,   // 折扣率15%
        freeBreakfast: 5,   // 免费早餐次数
        lateCheckout: 3,    // 延迟退房次数
        roomUpgrade: 2,     // 免费升级房间次数
        welcomeGift: true,  // 欢迎礼物
        memberLounge: true  // 会员休息室
      }
    },
    {
      userId: 2,
      level: 'silver',  // 银卡会员
      points: 850,
      joinDate: '2023-02-10',
      avatar: '',  // 无头像
      coupons: [
        { id: 3, name: '满300减50', discount: 50, minAmount: 300, expireDate: '2023-12-31' }
      ],
      benefits: {
        discountRate: 10,   // 折扣率10%
        freeBreakfast: 2,   // 免费早餐次数
        lateCheckout: 1,    // 延迟退房次数
        roomUpgrade: 0,     // 免费升级房间次数
        welcomeGift: true,  // 欢迎礼物
        memberLounge: false // 无会员休息室
      }
    }
  ];
  
  localStorage.setItem('mock_memberships', JSON.stringify(defaultMemberships));
  return defaultMemberships;
};

// 模拟订单数据
const getLocalOrders = (): any[] => {
  try {
    const savedOrders = localStorage.getItem('mock_orders');
    if (savedOrders) {
      return JSON.parse(savedOrders);
    }
  } catch (e) {
    console.error('获取本地订单数据失败:', e);
  }
  
  // 默认订单数据
  const defaultOrders = [
    {
      id: "ORD20230001",
      userId: 1,
      roomId: 4,
      roomName: "豪华套房",
      checkInDate: "2023-07-15",
      checkOutDate: "2023-07-18",
      guests: 2,
      amount: 2664,  // 888 * 3天
      status: "completed",  // 已完成
      createTime: "2023-06-20T10:25:30",
      paymentMethod: "信用卡",
      specialRequests: "希望安排高层房间",
      roomImage: "https://images.unsplash.com/photo-1631049035182-249067d7618e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "ORD20230002",
      userId: 1,
      roomId: 2,
      roomName: "豪华双人间",
      checkInDate: "2023-08-05",
      checkOutDate: "2023-08-07",
      guests: 2,
      amount: 976,  // 488 * 2天
      status: "paid",  // 已支付
      createTime: "2023-07-25T14:38:12",
      paymentMethod: "微信支付",
      specialRequests: "",
      roomImage: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "ORD20230003",
      userId: 2,
      roomId: 1,
      roomName: "豪华单人间",
      checkInDate: "2023-09-10",
      checkOutDate: "2023-09-12",
      guests: 1,
      amount: 776,  // 388 * 2天
      status: "paid",  // 已支付
      createTime: "2023-08-15T09:22:45",
      paymentMethod: "支付宝",
      specialRequests: "希望提供加床服务",
      roomImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "ORD20230004",
      userId: 1,
      roomId: 5,
      roomName: "家庭房",
      checkInDate: "2023-10-01",
      checkOutDate: "2023-10-03",
      guests: 3,
      amount: 1376,  // 688 * 2天
      status: "unpaid",  // 未支付
      createTime: "2023-09-20T16:40:22",
      paymentMethod: "",
      specialRequests: "需要婴儿床",
      roomImage: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    }
  ];
  
  localStorage.setItem('mock_orders', JSON.stringify(defaultOrders));
  return defaultOrders;
};

// 模拟积分兑换商品数据
const getLocalRewards = (): any[] => {
  try {
    const savedRewards = localStorage.getItem('mock_rewards');
    if (savedRewards) {
      return JSON.parse(savedRewards);
    }
  } catch (e) {
    console.error('获取本地积分兑换商品数据失败:', e);
  }
  
  // 默认积分兑换商品
  const defaultRewards = [
    {
      id: 1,
      name: "房间升级券",
      description: "可将预订的房间免费升级为更高级别的房型",
      points: 500,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "upgrade",
      stock: 10
    },
    {
      id: 2,
      name: "餐饮代金券",
      description: "可在酒店内餐厅使用的100元代金券",
      points: 300,
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "dining",
      stock: 20
    },
    {
      id: 3,
      name: "SPA折扣券",
      description: "酒店SPA服务7折优惠券",
      points: 400,
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "spa",
      stock: 15
    },
    {
      id: 4,
      name: "高级茶壶套装",
      description: "精美茶壶茶杯套装，含4个杯子",
      points: 1000,
      image: "https://images.unsplash.com/photo-1556679343-c1c1c9308e5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "merchandise",
      stock: 5
    },
    {
      id: 5,
      name: "延迟退房券",
      description: "可延迟至下午2点退房",
      points: 200,
      image: "https://images.unsplash.com/photo-1580237541049-2d715a09486e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "service",
      stock: 25
    },
    {
      id: 6,
      name: "精美酒店毛巾",
      description: "高档柔软舒适的酒店同款毛巾",
      points: 350,
      image: "https://images.unsplash.com/photo-1585211969224-3e992986159d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "merchandise",
      stock: 30
    }
  ];
  
  localStorage.setItem('mock_rewards', JSON.stringify(defaultRewards));
  return defaultRewards;
};

// 保存用户数据到localStorage
const saveLocalUsers = (users: any[]) => {
  localStorage.setItem('mock_users', JSON.stringify(users));
};

// 保存优惠活动到localStorage
const saveLocalPromotions = (promotions: any[]) => {
  localStorage.setItem('mock_promotions', JSON.stringify(promotions));
};

// 保存房间数据到localStorage
const saveLocalRooms = (rooms: any[]) => {
  localStorage.setItem('mock_rooms', JSON.stringify(rooms));
};

// 保存会员数据到localStorage
const saveLocalMemberships = (memberships: any[]) => {
  localStorage.setItem('mock_memberships', JSON.stringify(memberships));
};

// 保存订单数据到localStorage
const saveLocalOrders = (orders: any[]) => {
  localStorage.setItem('mock_orders', JSON.stringify(orders));
};

// 保存积分兑换商品数据到localStorage
const saveLocalRewards = (rewards: any[]) => {
  localStorage.setItem('mock_rewards', JSON.stringify(rewards));
};

// 配置API地址，优先使用相对路径，让Vite代理处理
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒超时
  withCredentials: false // 跨域请求不发送凭证
});

// 添加请求拦截器，用于调试和添加认证
api.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.method, config.url);
    console.log('请求数据:', config.data);
    
    // 从localStorage获取当前用户
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        // 添加用户名到请求头，用于后端认证
        config.headers.username = user.username;
      } catch (e) {
        console.error('解析本地存储的用户信息失败', e);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器，用于调试
api.interceptors.response.use(
  (response) => {
    console.log('响应状态码:', response.status);
    console.log('响应数据:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`响应错误(${error.response.status}):`, error.response.data);
    } else if (error.request) {
      console.error('无响应错误:', error.request);
    } else {
      console.error('请求配置错误:', error.message);
    }
    
    // 如果启用了模拟模式，可以在这里拦截网络错误
    if (!error.response && USE_MOCK_MODE) {
      console.log('检测到网络错误，自动切换到模拟模式');
      return Promise.resolve({ data: { success: false, message: '自动切换到模拟模式' } });
    }
    
    return Promise.reject(error);
  }
);

// 检查后端服务是否在线
export const checkBackendStatus = async (): Promise<boolean> => {
  if (USE_MOCK_MODE) {
    return true;
  }
  
  try {
    const response = await fetch('/api', { method: 'GET' });
    return response.ok;
  } catch (error) {
    console.error('后端服务检查失败:', error);
    return false;
  }
};

// 模拟登录
const mockLogin = async (username: string, password: string) => {
  const users = getLocalUsers();
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return { success: false, message: '用户不存在' };
  }
  
  if (user.password !== password) {
    return { success: false, message: '密码错误' };
  }
  
  const { password: _, ...safeUser } = user;
  return { 
    success: true, 
    message: '登录成功', 
    user: safeUser
  };
};

// 模拟注册
const mockRegister = async (email: string, password: string, username: string, verificationCode?: string) => {
  const users = getLocalUsers();
  
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: '邮箱格式不正确' };
  }
  
  // 验证用户名长度
  if (username.length < 3) {
    return { success: false, message: '用户名至少需要3个字符' };
  }
  
  // 验证密码长度和强度
  if (password.length < 8) {
    return { success: false, message: '密码至少需要8个字符' };
  }
  
  // 增加密码强度验证
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
    return { success: false, message: '密码必须包含大小写字母和数字' };
  }
  
  // 检查用户名是否已存在
  if (users.some(u => u.username === username)) {
    return { success: false, message: '用户名已被使用，请更换其他用户名' };
  }
  
  // 检查邮箱是否已注册
  if (users.some(u => u.email === email)) {
    return { success: false, message: '该邮箱已被注册，请使用其他邮箱' };
  }
  
  // 验证验证码
  if (verificationCode) {
    const verificationResult = await mockVerifyEmailCode(email, verificationCode);
    if (!verificationResult.success) {
      return verificationResult;
    }
  }
  
  // 创建新用户
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    username,
    password,
    email,
    role: 'user',
    emailVerified: !!verificationCode, // 如果使用验证码注册，标记为已验证邮箱
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveLocalUsers(users);
  
  console.log('注册成功，当前用户列表:', users);
  return { success: true, message: '注册成功' };
};

// 模拟检查邮箱是否已注册
const mockCheckEmailExists = async (email: string) => {
  const users = getLocalUsers();
  const exists = users.some(u => u.email === email);
  
  return { 
    success: true, 
    exists,
    message: exists ? '该邮箱已被注册' : '该邮箱可以使用'
  };
};

// 模拟发送邮箱验证码
const mockSendEmailVerificationCode = async (email: string) => {
  // 检查邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: '邮箱格式不正确' };
  }
  
  // 获取已有验证码
  const codes = getLocalVerificationCodes();
  
  // 检查是否存在有效且未过期的验证码
  const now = new Date();
  const existingCodeIndex = codes.findIndex(c => 
    c.email === email && 
    new Date(c.expiresAt) > now &&
    !c.used
  );
  
  // 如果存在未过期的验证码，检查上次发送时间，限制发送频率
  if (existingCodeIndex !== -1) {
    const lastSentTime = new Date(codes[existingCodeIndex].createdAt);
    const timeDiff = Math.floor((now.getTime() - lastSentTime.getTime()) / 1000); // 秒
    
    if (timeDiff < 60) { // 60秒内不能重复发送
      return { 
        success: false, 
        message: `请等待${60 - timeDiff}秒后再重新发送验证码`,
        countdown: 60 - timeDiff
      };
    }
  }
  
  // 生成6位随机验证码
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 设置过期时间(5分钟)
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  
  // 创建或更新验证码记录
  if (existingCodeIndex !== -1) {
    codes[existingCodeIndex] = {
      ...codes[existingCodeIndex],
      code: verificationCode,
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString(),
      attemptCount: 0,
      used: false
    };
  } else {
    codes.push({
      id: codes.length > 0 ? Math.max(...codes.map(c => c.id)) + 1 : 1,
      email,
      code: verificationCode,
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString(),
      attemptCount: 0,
      used: false
    });
  }
  
  saveLocalVerificationCodes(codes);
  
  // 模拟邮件发送
  console.log(`向${email}发送验证码: ${verificationCode}`);
  
  return { 
    success: true, 
    message: '验证码已发送至您的邮箱',
    // 在真实环境下不要返回验证码，这里仅为了模拟方便
    debugCode: USE_MOCK_MODE ? verificationCode : undefined
  };
};

// 模拟验证邮箱验证码
const mockVerifyEmailCode = async (email: string, code: string) => {
  const codes = getLocalVerificationCodes();
  const now = new Date();
  
  // 查找该邮箱最新的验证码记录
  const codeRecord = codes
    .filter(c => c.email === email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  
  if (!codeRecord) {
    return { success: false, message: '未找到验证码记录，请重新发送验证码' };
  }
  
  // 检查验证码是否已使用
  if (codeRecord.used) {
    return { success: false, message: '验证码已被使用，请重新发送' };
  }
  
  // 检查验证码是否过期
  if (new Date(codeRecord.expiresAt) < now) {
    return { success: false, message: '验证码已过期，请重新发送' };
  }
  
  // 检查尝试次数是否超过限制(最多5次)
  if (codeRecord.attemptCount >= 5) {
    return { success: false, message: '验证失败次数过多，请重新发送验证码' };
  }
  
  // 验证码不匹配
  if (codeRecord.code !== code) {
    // 增加尝试次数
    const updatedIndex = codes.findIndex(c => c.id === codeRecord.id);
    codes[updatedIndex].attemptCount += 1;
    saveLocalVerificationCodes(codes);
    
    const remainingAttempts = 5 - codes[updatedIndex].attemptCount;
    return { 
      success: false, 
      message: `验证码错误，您还有${remainingAttempts}次尝试机会` 
    };
  }
  
  // 验证成功，标记验证码为已使用
  const updatedIndex = codes.findIndex(c => c.id === codeRecord.id);
  codes[updatedIndex].used = true;
  saveLocalVerificationCodes(codes);
  
  return { success: true, message: '验证码验证成功' };
};

// 模拟获取优惠活动列表
const mockGetPromotions = async (status = 'active') => {
  const promotions = getLocalPromotions();
  
  let filteredPromotions = promotions;
  if (status !== 'all') {
    filteredPromotions = promotions.filter(p => p.status === status);
  }
  
  // 排序：优先显示推荐，然后是活跃的优惠
  filteredPromotions.sort((a, b) => {
    if (a.isFeature !== b.isFeature) {
      return a.isFeature ? -1 : 1;
    }
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1;
    }
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
  
  return { success: true, data: filteredPromotions };
};

// 模拟获取单个优惠活动
const mockGetPromotion = async (id: number) => {
  const promotions = getLocalPromotions();
  const promotion = promotions.find(p => p.id === id);
  
  if (!promotion) {
    return { success: false, message: '优惠活动不存在' };
  }
  
  return { success: true, data: promotion };
};

// 模拟创建优惠活动（仅管理员）
const mockCreatePromotion = async (promotionData: any) => {
  const promotions = getLocalPromotions();
  
  // 验证必填字段
  const { title, description, discount, startDate, endDate, code, status, isFeature } = promotionData;
  if (!title || !description || discount === undefined || !startDate || !endDate || !code) {
    return { success: false, message: '标题、描述、折扣率、开始日期、结束日期和优惠码都是必填项' };
  }
  
  // 检查优惠码是否已存在
  if (promotions.some(p => p.code === code)) {
    return { success: false, message: '优惠码已被使用，请更换其他优惠码' };
  }
  
  // 创建新优惠活动
  const newPromotion = {
    id: promotions.length > 0 ? Math.max(...promotions.map(p => p.id)) + 1 : 1,
    title,
    description,
    discount: parseFloat(discount),
    startDate,
    endDate,
    code,
    status: status || 'active',
    isFeature: isFeature || false
  };
  
  promotions.push(newPromotion);
  saveLocalPromotions(promotions);
  
  return { success: true, message: '创建优惠活动成功', data: newPromotion };
};

// 模拟更新优惠活动（仅管理员）
const mockUpdatePromotion = async (id: number, promotionData: any) => {
  const promotions = getLocalPromotions();
  const promotionIndex = promotions.findIndex(p => p.id === id);
  
  if (promotionIndex === -1) {
    return { success: false, message: '优惠活动不存在' };
  }
  
  // 验证必填字段
  const { title, description, discount, startDate, endDate, code, status, isFeature } = promotionData;
  if (!title || !description || discount === undefined || !startDate || !endDate || !code) {
    return { success: false, message: '标题、描述、折扣率、开始日期、结束日期和优惠码都是必填项' };
  }
  
  // 检查优惠码是否已被其他优惠活动使用
  const codeExists = promotions.some(p => p.code === code && p.id !== id);
  if (codeExists) {
    return { success: false, message: '优惠码已被使用，请更换其他优惠码' };
  }
  
  // 更新优惠活动
  promotions[promotionIndex] = {
    ...promotions[promotionIndex],
    title,
    description,
    discount: parseFloat(discount),
    startDate,
    endDate,
    code,
    status: status || promotions[promotionIndex].status,
    isFeature: isFeature !== undefined ? isFeature : promotions[promotionIndex].isFeature
  };
  
  saveLocalPromotions(promotions);
  
  return { success: true, message: '更新优惠活动成功', data: promotions[promotionIndex] };
};

// 模拟删除优惠活动（仅管理员）
const mockDeletePromotion = async (id: number) => {
  const promotions = getLocalPromotions();
  const promotionIndex = promotions.findIndex(p => p.id === id);
  
  if (promotionIndex === -1) {
    return { success: false, message: '优惠活动不存在' };
  }
  
  promotions.splice(promotionIndex, 1);
  saveLocalPromotions(promotions);
  
  return { success: true, message: '删除优惠活动成功' };
};

export const login = async (username: string, password: string) => {
  // 无论是否开启模拟模式，先尝试直接访问后端
  try {
    // 如果模拟模式开启，直接使用模拟登录
    if (USE_MOCK_MODE) {
      console.log('使用模拟模式登录');
      return mockLogin(username, password);
    }
    
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error: any) {
    console.error('登录请求失败', error);
    
    // 如果是网络错误且模拟模式开启，使用模拟登录
    if (!error.response && USE_MOCK_MODE) {
      console.log('后端服务不可用，切换到模拟模式登录');
      return mockLogin(username, password);
    }
    
    throw error;
  }
};

export const register = async (email: string, password: string, username: string) => {
  // 无论是否开启模拟模式，都先尝试访问后端
  try {
    // 如果模拟模式开启，直接使用模拟注册
    if (USE_MOCK_MODE) {
      console.log('使用模拟模式注册');
      return mockRegister(email, password, username);
    }
    
    console.log('准备发送注册请求:', { email, username, password: '******' });
    const requestData = { email, password, username };
    const response = await api.post('/auth/register', requestData);
    console.log('注册请求成功:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('注册请求失败:', error);
    
    // 如果是网络错误且模拟模式开启，使用模拟注册
    if (!error.response && USE_MOCK_MODE) {
      console.log('后端服务不可用，切换到模拟模式注册');
      return mockRegister(email, password, username);
    }
    
    // 如果有响应但状态码不是2xx
    if (error.response) {
      return { 
        success: false, 
        message: error.response.data?.message || `注册失败(${error.response.status})` 
      };
    }
    
    // 其他错误情况
    return { 
      success: false, 
      message: '无法连接到服务器，请确保后端服务正在运行' 
    };
  }
};

// ================= 优惠活动相关API ====================

// 获取优惠活动列表
export const getPromotions = async (status = 'active') => {
  try {
    if (USE_MOCK_MODE) {
      console.log('使用模拟模式获取优惠活动');
      return mockGetPromotions(status);
    }
    
    const response = await api.get(`/promotions`, { params: { status } });
    return response.data;
  } catch (error: any) {
    console.error('获取优惠活动失败:', error);
    
    if (!error.response && USE_MOCK_MODE) {
      console.log('后端服务不可用，切换到模拟模式获取优惠活动');
      return mockGetPromotions(status);
    }
    
    throw error;
  }
};

// 获取单个优惠活动详情
export const getPromotion = async (id: number) => {
  try {
    if (USE_MOCK_MODE) {
      console.log('使用模拟模式获取优惠活动详情');
      return mockGetPromotion(id);
    }
    
    const response = await api.get(`/promotions/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('获取优惠活动详情失败:', error);
    
    if (!error.response && USE_MOCK_MODE) {
      console.log('后端服务不可用，切换到模拟模式获取优惠活动详情');
      return mockGetPromotion(id);
    }
    
    throw error;
  }
};

// 创建优惠活动（仅管理员）
export const createPromotion = async (promotionData: any) => {
  try {
    if (USE_MOCK_MODE) {
      console.log('使用模拟模式创建优惠活动');
      return mockCreatePromotion(promotionData);
    }
    
    const response = await api.post('/admin/promotions', promotionData);
    return response.data;
  } catch (error: any) {
    console.error('创建优惠活动失败:', error);
    
    if (!error.response && USE_MOCK_MODE) {
      console.log('后端服务不可用，切换到模拟模式创建优惠活动');
      return mockCreatePromotion(promotionData);
    }
    
    // 处理权限错误
    if (error.response && error.response.status === 403) {
      return { success: false, message: '您没有创建优惠活动的权限' };
    }
    
    throw error;
  }
};

// 更新优惠活动（仅管理员）
export const updatePromotion = async (id: number, promotionData: any) => {
  try {
    if (USE_MOCK_MODE) {
      console.log('使用模拟模式更新优惠活动');
      return mockUpdatePromotion(id, promotionData);
    }
    
    const response = await api.put(`/admin/promotions/${id}`, promotionData);
    return response.data;
  } catch (error: any) {
    console.error('更新优惠活动失败:', error);
    
    if (!error.response && USE_MOCK_MODE) {
      console.log('后端服务不可用，切换到模拟模式更新优惠活动');
      return mockUpdatePromotion(id, promotionData);
    }
    
    // 处理权限错误
    if (error.response && error.response.status === 403) {
      return { success: false, message: '您没有更新优惠活动的权限' };
    }
    
    throw error;
  }
};

// 删除优惠活动（仅管理员）
export const deletePromotion = async (id: number) => {
  try {
    if (USE_MOCK_MODE) {
      console.log('使用模拟模式删除优惠活动');
      return mockDeletePromotion(id);
    }
    
    const response = await api.delete(`/admin/promotions/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('删除优惠活动失败:', error);
    
    if (!error.response && USE_MOCK_MODE) {
      console.log('后端服务不可用，切换到模拟模式删除优惠活动');
      return mockDeletePromotion(id);
    }
    
    // 处理权限错误
    if (error.response && error.response.status === 403) {
      return { success: false, message: '您没有删除优惠活动的权限' };
    }
    
    throw error;
  }
};

// 模拟获取房间列表
const mockGetRooms = async (filters: any = {}) => {
  let rooms = getLocalRooms();
  
  console.log('模拟获取房间列表，原始数据:', rooms);
  console.log('应用筛选条件:', filters);
  
  // 应用筛选条件
  if (filters.roomType && filters.roomType.length > 0) {
    rooms = rooms.filter(room => filters.roomType.includes(room.roomType));
  }
  
  if (filters.minPrice !== undefined) {
    rooms = rooms.filter(room => {
      // 计算折扣后价格
      const discountedPrice = room.price * (1 - room.discount / 100);
      return discountedPrice >= filters.minPrice;
    });
  }
  
  if (filters.maxPrice !== undefined) {
    rooms = rooms.filter(room => {
      // 计算折扣后价格
      const discountedPrice = room.price * (1 - room.discount / 100);
      return discountedPrice <= filters.maxPrice;
    });
  }
  
  if (filters.hasBreakfast !== undefined) {
    rooms = rooms.filter(room => room.hasBreakfast === filters.hasBreakfast);
  }
  
  if (filters.capacity !== undefined) {
    rooms = rooms.filter(room => room.capacity >= filters.capacity);
  }
  
  if (filters.isPromotion !== undefined) {
    rooms = rooms.filter(room => room.isPromotion === filters.isPromotion);
  }
  
  console.log('筛选后的房间数据:', rooms);
  
  return { 
    success: true, 
    message: '获取房间列表成功', 
    data: rooms
  };
};

// 模拟获取房间详情
const mockGetRoomDetail = async (id: number) => {
  const rooms = getLocalRooms();
  const room = rooms.find(r => r.id === id);
  
  if (!room) {
    return { success: false, message: '房间不存在' };
  }
  
  return { 
    success: true, 
    message: '获取房间详情成功', 
    data: room
  };
};

// 获取房间列表
export const getRooms = async (filters: any = {}) => {
  console.log('调用getRooms函数，模拟模式:', USE_MOCK_MODE);
  
  // 在模拟模式下直接调用模拟函数
  if (USE_MOCK_MODE) {
    console.log('使用模拟模式获取房间列表');
    try {
      return await mockGetRooms(filters);
    } catch (error) {
      console.error('模拟获取房间列表失败:', error);
      // 确保即使模拟函数出错也返回一个有效的响应
      return { 
        success: true, 
        message: '模拟获取房间列表出错，返回空列表', 
        data: [] 
      };
    }
  }
  
  // 尝试从API获取数据
  try {
    const response = await api.get('/rooms', { params: filters });
    return response.data;
  } catch (error) {
    console.error('获取房间列表失败:', error);
    
    // 如果API调用失败且启用了模拟模式，尝试使用模拟数据
    if (USE_MOCK_MODE) {
      console.log('API调用失败，使用模拟数据');
      try {
        return await mockGetRooms(filters);
      } catch (mockError) {
        console.error('模拟获取房间列表失败:', mockError);
        return { 
          success: true, 
          message: '模拟获取房间列表出错，返回空列表', 
          data: [] 
        };
      }
    }
    
    return { success: false, message: '获取房间列表失败', data: [] };
  }
};

// 获取房间详情
export const getRoomDetail = async (id: number) => {
  if (USE_MOCK_MODE) {
    return mockGetRoomDetail(id);
  }
  
  try {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && !error.response && USE_MOCK_MODE) {
      console.log('API调用失败，使用模拟数据');
      return mockGetRoomDetail(id);
    }
    
    console.error('获取房间详情失败:', error);
    return { success: false, message: '获取房间详情失败' };
  }
};

// ================= 会员中心相关API ====================

// 获取会员信息
const mockGetMembership = async (userId: number) => {
  const memberships = getLocalMemberships();
  const membership = memberships.find(m => m.userId === userId);
  
  if (!membership) {
    // 如果没有会员信息，创建一个默认的普通会员
    const newMembership = {
      userId,
      level: 'regular',  // 普通会员
      points: 0,
      joinDate: new Date().toISOString().split('T')[0],
      avatar: '',
      coupons: [],
      benefits: {
        discountRate: 5,    // 折扣率5%
        freeBreakfast: 0,   // 无免费早餐
        lateCheckout: 0,    // 无延迟退房
        roomUpgrade: 0,     // 无免费升级
        welcomeGift: false, // 无欢迎礼物
        memberLounge: false // 无会员休息室
      }
    };
    
    memberships.push(newMembership);
    saveLocalMemberships(memberships);
    
    return { success: true, data: newMembership };
  }
  
  return { success: true, data: membership };
};

// 获取用户订单列表
const mockGetOrders = async (userId: number, status: string = 'all') => {
  const orders = getLocalOrders();
  
  let userOrders = orders.filter(o => o.userId === userId);
  
  // 按状态筛选订单
  if (status !== 'all') {
    userOrders = userOrders.filter(o => o.status === status);
  }
  
  // 按日期倒序排序（最新的订单在前）
  userOrders.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  
  return { success: true, data: userOrders };
};

// 获取订单详情
const mockGetOrderDetail = async (orderId: string) => {
  const orders = getLocalOrders();
  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    return { success: false, message: '订单不存在' };
  }
  
  return { success: true, data: order };
};

// 获取积分兑换商品列表
const mockGetRewards = async (category: string = 'all') => {
  const rewards = getLocalRewards();
  
  let filteredRewards = rewards;
  if (category !== 'all') {
    filteredRewards = rewards.filter(r => r.category === category);
  }
  
  return { success: true, data: filteredRewards };
};

// 兑换积分商品
const mockRedeemReward = async (userId: number, rewardId: number) => {
  const memberships = getLocalMemberships();
  const rewards = getLocalRewards();
  
  const membershipIndex = memberships.findIndex(m => m.userId === userId);
  if (membershipIndex === -1) {
    return { success: false, message: '会员信息不存在' };
  }
  
  const reward = rewards.find(r => r.id === rewardId);
  if (!reward) {
    return { success: false, message: '兑换商品不存在' };
  }
  
  if (reward.stock <= 0) {
    return { success: false, message: '商品库存不足' };
  }
  
  const membership = memberships[membershipIndex];
  if (membership.points < reward.points) {
    return { success: false, message: '积分不足' };
  }
  
  // 扣减积分
  membership.points -= reward.points;
  
  // 减少库存
  reward.stock -= 1;
  
  // 保存数据
  saveLocalMemberships(memberships);
  saveLocalRewards(rewards);
  
  return { 
    success: true, 
    message: '兑换成功', 
    data: { 
      reward,
      remainingPoints: membership.points 
    } 
  };
};

// 更新会员信息
const mockUpdateMembership = async (userId: number, data: any) => {
  const memberships = getLocalMemberships();
  const membershipIndex = memberships.findIndex(m => m.userId === userId);
  
  if (membershipIndex === -1) {
    return { success: false, message: '会员信息不存在' };
  }
  
  // 仅允许更新头像
  if (data.avatar) {
    memberships[membershipIndex].avatar = data.avatar;
    saveLocalMemberships(memberships);
  }
  
  return { 
    success: true, 
    message: '更新成功', 
    data: memberships[membershipIndex] 
  };
};

// 获取会员信息
export const getMembership = async (userId: number) => {
  try {
    if (USE_MOCK_MODE) {
      console.log('使用模拟模式获取会员信息');
      return mockGetMembership(userId);
    }
    
    const response = await api.get(`/membership/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('获取会员信息失败:', error);
    
    if (!error.response && USE_MOCK_MODE) {
      console.log('后端服务不可用，切换到模拟模式获取会员信息');
      return mockGetMembership(userId);
    }
    
    throw error;
  }
};

// 获取用户订单列表
export const getOrders = async (userId: number, status: string = 'all') => {
  try {
    if (USE_MOCK_MODE) {
      console.log('使用模拟模式获取订单列表');
      return mockGetOrders(userId, status);
    }
    
    const response = await api.get(`/orders`, { params: { userId, status } });
    return response.data;
  } catch (error: any) {
    console.error('获取订单列表失败:', error);
    
    if (!error.response && USE_MOCK_MODE) {
      console.log('后端服务不可用，切换到模拟模式获取订单列表');
      return mockGetOrders(userId, status);
    }
    
    throw error;
  }
};

// 获取订单详情
export const getOrderDetail = async (orderId: string) => {
  try {
    if (USE_MOCK_MODE) {
      console.log('使用模拟模式获取订单详情');
      return mockGetOrderDetail(orderId);
    }
    
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error: any) {
    console.error('获取订单详情失败:', error);
    
    if (!error.response && USE_MOCK_MODE) {
      console.log('后端服务不可用，切换到模拟模式获取订单详情');
      return mockGetOrderDetail(orderId);
    }
    
    throw error;
  }
};

// 获取积分兑换商品列表
export const getRewards = async (category: string = 'all') => {
  try {
    if (USE_MOCK_MODE) {
      console.log('使用模拟模式获取积分兑换商品');
      return mockGetRewards(category);
    }
    
    const response = await api.get(`/rewards`, { params: { category } });
    return response.data;
  } catch (error: any) {
    console.error('获取积分兑换商品失败:', error);
    
    if (!error.response && USE_MOCK_MODE) {
      console.log('后端服务不可用，切换到模拟模式获取积分兑换商品');
      return mockGetRewards(category);
    }
    
    throw error;
  }
};

// 兑换积分商品
export const redeemReward = async (userId: number, rewardId: number) => {
  try {
    if (USE_MOCK_MODE) {
      console.log('使用模拟模式兑换积分商品');
      return mockRedeemReward(userId, rewardId);
    }
    
    const response = await api.post(`/rewards/redeem`, { userId, rewardId });
    return response.data;
  } catch (error: any) {
    console.error('兑换积分商品失败:', error);
    
    if (!error.response && USE_MOCK_MODE) {
      console.log('后端服务不可用，切换到模拟模式兑换积分商品');
      return mockRedeemReward(userId, rewardId);
    }
    
    throw error;
  }
};

// 更新会员信息
export const updateMembership = async (userId: number, data: any) => {
  try {
    if (USE_MOCK_MODE) {
      console.log('使用模拟模式更新会员信息');
      return mockUpdateMembership(userId, data);
    }
    
    const response = await api.put(`/membership/${userId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('更新会员信息失败:', error);
    
    if (!error.response && USE_MOCK_MODE) {
      console.log('后端服务不可用，切换到模拟模式更新会员信息');
      return mockUpdateMembership(userId, data);
    }
    
    throw error;
  }
};

// 导出新的API函数
export const checkEmailExists = async (email: string) => {
  if (USE_MOCK_MODE) {
    return mockCheckEmailExists(email);
  }
  
  try {
    const response = await api.post('/auth/check-email', { email });
    return response.data;
  } catch (error: any) {
    if (!error.response && USE_MOCK_MODE) {
      return mockCheckEmailExists(email);
    }
    throw error;
  }
};

export const sendEmailVerificationCode = async (email: string) => {
  if (USE_MOCK_MODE) {
    return mockSendEmailVerificationCode(email);
  }
  
  try {
    const response = await api.post('/auth/send-verification-code', { email });
    return response.data;
  } catch (error: any) {
    if (!error.response && USE_MOCK_MODE) {
      return mockSendEmailVerificationCode(email);
    }
    throw error;
  }
};

export const verifyEmailCode = async (email: string, code: string) => {
  if (USE_MOCK_MODE) {
    return mockVerifyEmailCode(email, code);
  }
  
  try {
    const response = await api.post('/auth/verify-code', { email, code });
    return response.data;
  } catch (error: any) {
    if (!error.response && USE_MOCK_MODE) {
      return mockVerifyEmailCode(email, code);
    }
    throw error;
  }
};

export const registerWithVerification = async (email: string, password: string, username: string, code: string) => {
  if (USE_MOCK_MODE) {
    return mockRegister(email, password, username, code);
  }
  
  try {
    const response = await api.post('/auth/register', { email, password, username, verificationCode: code });
    return response.data;
  } catch (error: any) {
    if (!error.response && USE_MOCK_MODE) {
      return mockRegister(email, password, username, code);
    }
    
    if (error.response) {
      return { 
        success: false, 
        message: error.response.data?.message || `注册失败(${error.response.status})` 
      };
    }
    
    return { 
      success: false, 
      message: '无法连接到服务器，请确保后端服务正在运行' 
    };
  }
};

export default api; 