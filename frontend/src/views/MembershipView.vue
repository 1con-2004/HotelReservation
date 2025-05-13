<template>
  <div class="membership">
    <LuxuryNavbar />
    <div class="membership-content">
      <div class="container">
        <h1 class="page-title">会员中心</h1>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载会员信息...</p>
        </div>
        
        <div v-else-if="memberInfo" class="membership-sections">
          <!-- 会员信息区 -->
          <section class="member-info-section">
            <div class="member-card">
              <div class="member-profile">
                <div class="avatar-container">
                  <img 
                    :src="memberInfo.avatar || 'https://ui-avatars.com/api/?name=' + userStore.user?.username" 
                    :alt="userStore.user?.username" 
                    class="member-avatar"
                  >
                </div>
                <div class="member-details">
                  <h2 class="member-name">{{ userStore.user?.username }}</h2>
                  <div 
                    class="member-level" 
                    :class="{
                      'level-regular': memberInfo.level === 'regular',
                      'level-silver': memberInfo.level === 'silver',
                      'level-gold': memberInfo.level === 'gold'
                    }"
                  >
                    {{ getMemberLevelText(memberInfo.level) }}
                  </div>
                  <div class="member-since">
                    会员注册日期: {{ formatDate(memberInfo.joinDate) }}
                  </div>
                </div>
              </div>
              
              <div class="member-stats">
                <div class="stat-card">
                  <div class="stat-icon">🏆</div>
                  <div class="stat-info">
                    <div class="stat-value">{{ memberInfo.points }}</div>
                    <div class="stat-label">会员积分</div>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">🎟️</div>
                  <div class="stat-info">
                    <div class="stat-value">{{ memberInfo.coupons.length }}</div>
                    <div class="stat-label">可用优惠券</div>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">💰</div>
                  <div class="stat-info">
                    <div class="stat-value">{{ memberInfo.benefits.discountRate }}%</div>
                    <div class="stat-label">会员折扣</div>
                  </div>
                </div>
              </div>
              
              <div v-if="memberInfo.coupons.length > 0" class="member-coupons">
                <h3 class="section-subtitle">我的优惠券</h3>
                <div class="coupon-list">
                  <div v-for="coupon in memberInfo.coupons" :key="coupon.id" class="coupon-card">
                    <div class="coupon-details">
                      <div class="coupon-name">{{ coupon.name }}</div>
                      <div class="coupon-value">
                        {{ coupon.type === 'percent' ? `${coupon.discount}%折扣` : `¥${coupon.discount}` }}
                      </div>
                      <div v-if="coupon.minAmount" class="coupon-condition">
                        满¥{{ coupon.minAmount }}可用
                      </div>
                    </div>
                    <div class="coupon-validity">
                      有效期至 {{ formatDate(coupon.expireDate) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <!-- 订单管理区 -->
          <section class="orders-section">
            <div class="section-header">
              <h3 class="section-title">我的订单</h3>
              <div class="order-filters">
                <button 
                  v-for="status in orderStatusOptions" 
                  :key="status.value"
                  :class="['filter-btn', { active: orderFilter === status.value }]"
                  @click="filterOrders(status.value)"
                >
                  {{ status.label }}
                </button>
              </div>
            </div>
            
            <div v-if="filteredOrders.length === 0" class="no-orders">
              <div class="no-data-icon">🔍</div>
              <p>暂无{{ getOrderStatusLabel(orderFilter) }}订单</p>
            </div>
            
            <div v-else class="order-list">
              <div v-for="order in filteredOrders" :key="order.id" class="order-card">
                <div class="order-header">
                  <div class="order-id">订单号: {{ order.id }}</div>
                  <div 
                    class="order-status" 
                    :class="{
                      'status-unpaid': order.status === 'unpaid',
                      'status-paid': order.status === 'paid',
                      'status-checkin': order.status === 'checkin',
                      'status-completed': order.status === 'completed',
                      'status-cancelled': order.status === 'cancelled'
                    }"
                  >
                    {{ getOrderStatusText(order.status) }}
                  </div>
                </div>
                
                <div class="order-content">
                  <div class="order-image">
                    <img :src="order.roomImage" :alt="order.roomName">
                  </div>
                  
                  <div class="order-info">
                    <h4 class="order-room">{{ order.roomName }}</h4>
                    
                    <div class="order-detail">
                      <div class="detail-label">入住日期:</div>
                      <div class="detail-value">{{ formatDate(order.checkInDate) }}</div>
                    </div>
                    
                    <div class="order-detail">
                      <div class="detail-label">退房日期:</div>
                      <div class="detail-value">{{ formatDate(order.checkOutDate) }}</div>
                    </div>
                    
                    <div class="order-detail">
                      <div class="detail-label">入住人数:</div>
                      <div class="detail-value">{{ order.guests }}人</div>
                    </div>
                    
                    <div class="order-detail">
                      <div class="detail-label">支付方式:</div>
                      <div class="detail-value">{{ order.paymentMethod || '暂未支付' }}</div>
                    </div>
                    
                    <div class="order-amount">
                      <span class="amount-label">总价:</span>
                      <span class="amount-value">¥{{ order.amount }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="order-footer">
                  <button class="detail-btn">查看详情</button>
                  <div v-if="order.status === 'unpaid'" class="action-btns">
                    <button class="action-btn pay-btn">去支付</button>
                    <button class="action-btn cancel-btn">取消订单</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <!-- 会员权益区 -->
          <section class="benefits-section">
            <h3 class="section-title">会员权益</h3>
            
            <div class="benefits-grid">
              <div class="benefit-item">
                <div class="benefit-icon">💰</div>
                <div class="benefit-details">
                  <h4 class="benefit-title">会员折扣</h4>
                  <p class="benefit-desc">预订房间享受{{ memberInfo.benefits.discountRate }}%的会员折扣</p>
                </div>
              </div>
              
              <div class="benefit-item">
                <div class="benefit-icon">🍳</div>
                <div class="benefit-details">
                  <h4 class="benefit-title">免费早餐</h4>
                  <p class="benefit-desc">本年度还可享受{{ memberInfo.benefits.freeBreakfast }}次免费早餐</p>
                </div>
              </div>
              
              <div class="benefit-item">
                <div class="benefit-icon">⏰</div>
                <div class="benefit-details">
                  <h4 class="benefit-title">延迟退房</h4>
                  <p class="benefit-desc">本年度还可享受{{ memberInfo.benefits.lateCheckout }}次延迟退房至14:00</p>
                </div>
              </div>
              
              <div class="benefit-item">
                <div class="benefit-icon">🔄</div>
                <div class="benefit-details">
                  <h4 class="benefit-title">房间升级</h4>
                  <p class="benefit-desc">本年度还可享受{{ memberInfo.benefits.roomUpgrade }}次免费房间升级</p>
                </div>
              </div>
              
              <div class="benefit-item" :class="{ 'disabled': !memberInfo.benefits.welcomeGift }">
                <div class="benefit-icon">🎁</div>
                <div class="benefit-details">
                  <h4 class="benefit-title">欢迎礼物</h4>
                  <p class="benefit-desc">{{ memberInfo.benefits.welcomeGift ? '每次入住可获得欢迎小礼物' : '升级会员等级可解锁此权益' }}</p>
                </div>
              </div>
              
              <div class="benefit-item" :class="{ 'disabled': !memberInfo.benefits.memberLounge }">
                <div class="benefit-icon">🛋️</div>
                <div class="benefit-details">
                  <h4 class="benefit-title">会员休息室</h4>
                  <p class="benefit-desc">{{ memberInfo.benefits.memberLounge ? '可免费使用酒店会员休息室' : '升级会员等级可解锁此权益' }}</p>
                </div>
              </div>
            </div>
          </section>
          
          <!-- 积分兑换区 -->
          <section class="rewards-section">
            <div class="section-header">
              <h3 class="section-title">积分兑换</h3>
              <div class="reward-filters">
                <button 
                  v-for="category in rewardCategories" 
                  :key="category.value"
                  :class="['filter-btn', { active: rewardFilter === category.value }]"
                  @click="filterRewards(category.value)"
                >
                  {{ category.label }}
                </button>
              </div>
            </div>
            
            <div class="reward-points">
              <span class="points-label">当前积分:</span>
              <span class="points-value">{{ memberInfo.points }}</span>
            </div>
            
            <div v-if="filteredRewards.length === 0" class="no-rewards">
              <div class="no-data-icon">🔍</div>
              <p>暂无符合条件的兑换商品</p>
            </div>
            
            <div v-else class="rewards-grid">
              <div v-for="reward in filteredRewards" :key="reward.id" class="reward-card">
                <div class="reward-image">
                  <img :src="reward.image" :alt="reward.name">
                  <div class="reward-points">{{ reward.points }} 积分</div>
                </div>
                
                <div class="reward-content">
                  <h4 class="reward-name">{{ reward.name }}</h4>
                  <p class="reward-description">{{ reward.description }}</p>
                  <div class="reward-stock">库存: {{ reward.stock }}</div>
                </div>
                
                <div class="reward-footer">
                  <button 
                    class="redeem-btn" 
                    :disabled="memberInfo.points < reward.points || reward.stock <= 0"
                    @click="handleRedeem(reward.id)"
                  >
                    {{ memberInfo.points < reward.points ? '积分不足' : (reward.stock <= 0 ? '已售罄' : '立即兑换') }}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <!-- 兑换成功提示 -->
        <div v-if="showRedeemSuccess" class="redeem-success-popup">
          <div class="popup-content">
            <div class="success-icon">✓</div>
            <h3>兑换成功！</h3>
            <p>已成功兑换商品，剩余积分：{{ memberInfo.points }}</p>
            <button class="close-btn" @click="showRedeemSuccess = false">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LuxuryNavbar from '../components/LuxuryNavbar.vue';
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '../store/userStore';
import { getMembership, getOrders, getRewards, redeemReward } from '../utils/api';

// 用户状态
const userStore = useUserStore();

// 加载状态
const loading = ref(true);

// 会员信息
const memberInfo = ref<any>(null);

// 订单信息
const orders = ref<any[]>([]);

// 积分兑换商品
const rewards = ref<any[]>([]);

// 订单状态筛选
const orderFilter = ref('all');
const orderStatusOptions = [
  { value: 'all', label: '全部订单' },
  { value: 'unpaid', label: '待支付' },
  { value: 'paid', label: '已支付' },
  { value: 'checkin', label: '已入住' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
];

// 积分兑换过滤器
const rewardFilter = ref('all');
const rewardCategories = [
  { value: 'all', label: '全部商品' },
  { value: 'upgrade', label: '房间升级' },
  { value: 'dining', label: '餐饮券' },
  { value: 'service', label: '服务券' },
  { value: 'merchandise', label: '周边商品' },
  { value: 'spa', label: 'SPA服务' }
];

// 显示兑换成功提示
const showRedeemSuccess = ref(false);

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

// 获取会员等级文本
const getMemberLevelText = (level: string) => {
  const levelMap: Record<string, string> = {
    'regular': '普通会员',
    'silver': '银卡会员',
    'gold': '金卡会员'
  };
  return levelMap[level] || '普通会员';
};

// 筛选订单
const filterOrders = (status: string) => {
  orderFilter.value = status;
};

// 根据筛选条件获取订单
const filteredOrders = computed(() => {
  if (orderFilter.value === 'all') {
    return orders.value;
  }
  return orders.value.filter(order => order.status === orderFilter.value);
});

// 获取订单状态文本
const getOrderStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'unpaid': '待支付',
    'paid': '已支付',
    'checkin': '已入住',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  return statusMap[status] || '未知状态';
};

// 获取订单状态筛选标签
const getOrderStatusLabel = (status: string) => {
  const option = orderStatusOptions.find(opt => opt.value === status);
  return option ? option.label : '全部';
};

// 筛选积分兑换商品
const filterRewards = (category: string) => {
  rewardFilter.value = category;
};

// 根据筛选条件获取积分兑换商品
const filteredRewards = computed(() => {
  if (rewardFilter.value === 'all') {
    return rewards.value;
  }
  return rewards.value.filter(reward => reward.category === rewardFilter.value);
});

// 处理积分兑换
const handleRedeem = async (rewardId: number) => {
  try {
    if (userStore.user) {
      const response = await redeemReward(userStore.user.id, rewardId);
      if (response.success) {
        // 更新会员积分
        memberInfo.value.points = response.data.remainingPoints;
        
        // 更新兑换商品库存
        const rewardIndex = rewards.value.findIndex(r => r.id === rewardId);
        if (rewardIndex !== -1) {
          rewards.value[rewardIndex].stock -= 1;
        }
        
        // 显示兑换成功提示
        showRedeemSuccess.value = true;
        
        // 3秒后自动关闭提示
        setTimeout(() => {
          showRedeemSuccess.value = false;
        }, 3000);
      } else {
        alert(response.message || '兑换失败');
      }
    }
  } catch (error) {
    console.error('积分兑换出错:', error);
    alert('兑换过程中出现错误，请稍后重试');
  }
};

// 加载会员信息
const loadMemberInfo = async () => {
  loading.value = true;
  try {
    if (userStore.user) {
      const response = await getMembership(userStore.user.id);
      if (response.success) {
        memberInfo.value = response.data;
      } else {
        console.error('获取会员信息失败:', response.message);
      }
    } else {
      console.error('用户未登录');
    }
  } catch (error) {
    console.error('加载会员信息出错:', error);
  } finally {
    loading.value = false;
  }
};

// 加载订单信息
const loadOrders = async () => {
  try {
    if (userStore.user) {
      const response = await getOrders(userStore.user.id);
      if (response.success) {
        orders.value = response.data;
      } else {
        console.error('获取订单信息失败:', response.message);
      }
    }
  } catch (error) {
    console.error('加载订单信息出错:', error);
  }
};

// 加载积分兑换商品
const loadRewards = async () => {
  try {
    const response = await getRewards();
    if (response.success) {
      rewards.value = response.data;
    } else {
      console.error('获取积分兑换商品失败:', response.message);
    }
  } catch (error) {
    console.error('加载积分兑换商品出错:', error);
  }
};

// 页面加载时获取数据
onMounted(async () => {
  await loadMemberInfo();
  await loadOrders();
  await loadRewards();
});
</script>

<style scoped>
.membership {
  min-height: 100vh;
  background-color: var(--background-color);
  padding-top: 70px; /* 为固定导航栏留出空间 */
}

.membership-content {
  width: 100%;
  padding: 30px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 2rem;
  font-weight: 600;
}

.membership-sections {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 加载指示器样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(74, 144, 226, 0.3);
  border-radius: 50%;
  border-top: 4px solid var(--primary-color);
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 各个区域通用样式 */
.member-info-section,
.orders-section,
.benefits-section,
.rewards-section {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 25px;
}

/* 会员信息区样式 */
.member-card {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.member-profile {
  display: flex;
  align-items: center;
  gap: 25px;
}

.avatar-container {
  position: relative;
}

.member-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color);
}

.member-details {
  flex: 1;
}

.member-name {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color);
}

.member-level {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.level-regular {
  background-color: #e1e1e1;
  color: #666;
}

.level-silver {
  background-color: #C0C0C0;
  color: #333;
}

.level-gold {
  background-color: #D4AF37;
  color: white;
}

.member-since {
  font-size: 0.9rem;
  color: var(--text-light);
}

.member-stats {
  display: flex;
  gap: 20px;
}

.stat-card {
  flex: 1;
  background-color: #EBF5FF;
  border-radius: var(--border-radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-light);
}

.section-subtitle {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: var(--text-color);
}

.member-coupons {
  margin-top: 10px;
}

.coupon-list {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding: 5px 0;
}

.coupon-card {
  min-width: 220px;
  background: linear-gradient(135deg, #4A90E2, #72A7E8);
  color: white;
  border-radius: var(--border-radius);
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
}

.coupon-details {
  margin-bottom: 10px;
}

.coupon-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.coupon-value {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.coupon-condition {
  font-size: 0.8rem;
  opacity: 0.9;
}

.coupon-validity {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .member-profile {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .member-stats {
    flex-direction: column;
  }
}

/* 订单管理区样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.order-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 12px;
  border-radius: 20px;
  background-color: #f0f4f8;
  border: none;
  font-size: 0.9rem;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active {
  background-color: var(--primary-color);
  color: white;
}

.no-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  text-align: center;
}

.no-data-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
  opacity: 0.5;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  border: 1px solid #eee;
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: white;
  transition: transform 0.3s, box-shadow 0.3s;
}

.order-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.order-id {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-light);
}

.order-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-unpaid {
  background-color: #ffedf0;
  color: #e74c3c;
}

.status-paid {
  background-color: #edfaf2;
  color: #27ae60;
}

.status-checkin {
  background-color: #f0f7ff;
  color: #3498db;
}

.status-completed {
  background-color: #eee;
  color: #666;
}

.status-cancelled {
  background-color: #f3f3f3;
  color: #95a5a6;
}

.order-content {
  display: flex;
  padding: 15px;
  gap: 20px;
}

.order-image {
  width: 120px;
  height: 90px;
  overflow: hidden;
  border-radius: 8px;
}

.order-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-room {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--text-color);
}

.order-detail {
  display: flex;
  gap: 10px;
}

.detail-label {
  font-size: 0.9rem;
  color: var(--text-light);
  width: 80px;
}

.detail-value {
  font-size: 0.9rem;
  color: var(--text-color);
  font-weight: 500;
}

.order-amount {
  margin-top: 5px;
}

.amount-label {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-right: 10px;
}

.amount-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
}

.detail-btn {
  background-color: white;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.detail-btn:hover {
  background-color: rgba(74, 144, 226, 0.1);
}

.action-btns {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.pay-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.pay-btn:hover {
  background-color: #3a7bc8;
}

.cancel-btn {
  background-color: white;
  border: 1px solid #ddd;
  color: var(--text-light);
}

.cancel-btn:hover {
  background-color: #f5f5f5;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-content {
    flex-direction: column;
  }
  
  .order-image {
    width: 100%;
    height: 150px;
  }
}

/* 会员权益区样式 */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: var(--border-radius);
  border: 1px solid #eee;
  transition: transform 0.3s, box-shadow 0.3s;
}

.benefit-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.benefit-item.disabled {
  opacity: 0.6;
  background-color: #f9f9f9;
}

.benefit-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.benefit-details {
  flex: 1;
}

.benefit-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--text-color);
}

.benefit-desc {
  font-size: 0.9rem;
  color: var(--text-light);
  line-height: 1.4;
}

/* 积分兑换区样式 */
.reward-points {
  font-size: 1.1rem;
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: #f0f7ff;
  border-radius: var(--border-radius);
  display: inline-block;
}

.points-label {
  font-weight: 500;
  color: var(--text-light);
  margin-right: 8px;
}

.points-value {
  font-weight: 700;
  color: var(--primary-color);
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.reward-card {
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.reward-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.reward-image {
  height: 180px;
  position: relative;
  overflow: hidden;
}

.reward-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.reward-card:hover .reward-image img {
  transform: scale(1.05);
}

.reward-points {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--primary-color);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.reward-content {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.reward-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-color);
}

.reward-description {
  font-size: 0.9rem;
  color: var(--text-light);
  line-height: 1.5;
  margin-bottom: 10px;
  flex: 1;
}

.reward-stock {
  font-size: 0.8rem;
  color: var(--text-light);
}

.reward-footer {
  padding: 15px;
  border-top: 1px solid #eee;
}

.redeem-btn {
  width: 100%;
  padding: 8px 0;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.redeem-btn:hover:not(:disabled) {
  background-color: #3a7bc8;
}

.redeem-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.no-rewards {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  text-align: center;
}

/* 兑换成功提示样式 */
.redeem-success-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 30px;
  text-align: center;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.success-icon {
  width: 60px;
  height: 60px;
  line-height: 60px;
  font-size: 2rem;
  background-color: #2ecc71;
  color: white;
  border-radius: 50%;
  margin: 0 auto 15px;
}

.close-btn {
  margin-top: 20px;
  padding: 8px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background-color: #3a7bc8;
}

/* 响应式样式 */
@media (max-width: 992px) {
  .benefits-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .reward-filters {
    overflow-x: auto;
    padding-bottom: 10px;
    margin-bottom: 5px;
    white-space: nowrap;
    display: flex;
    width: 100%;
  }
  
  .filter-btn {
    flex-shrink: 0;
  }
}
</style> 