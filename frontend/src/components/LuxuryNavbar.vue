<template>
  <nav class="luxury-navbar" :class="{ 'scrolled': isScrolled, 'dark-mode': isDarkMode, 'light-mode': isLightMode, 'spring-festival': isSpringFestival, 'christmas': isChristmas }">
    <!-- 浮雕边框装饰 -->
    <div class="navbar-border-top"></div>
    <div class="navbar-border-bottom"></div>
    
    <div class="navbar-container">
      <!-- 品牌标识区域 -->
      <div class="brand">
        <router-link to="/" class="brand-link">
          <div class="logo-container">
            <img src="../assets/hotel-icon.svg" alt="Feng Hotel" class="hotel-logo">
          </div>
          <div class="brand-text">
            <h1 class="hotel-name">
              <span class="hotel-name-text">feng</span>
              <span class="hotel-name-accent">酒店</span>
            </h1>
            <span class="hotel-tagline">THE FENG HOTEL</span>
          </div>
        </router-link>
      </div>
      
      <!-- 导航菜单区域 -->
      <div class="nav-menu">
        <div v-for="(item, index) in navItems" :key="index" class="nav-item-container">
          <router-link :to="item.path" class="nav-item" :class="{ 'active': currentRoute === item.path }">
            {{ item.name }}
            <div class="nav-indicator"></div>
          </router-link>
          <div v-if="index < navItems.length - 1" class="nav-separator">
            <span class="crystal-ball"></span>
          </div>
        </div>
      </div>
      
      <!-- 用户区域 -->
      <div class="user-area">
        <!-- 风格切换按钮 -->
        <div class="style-toggle">
          <button class="toggle-button" @click="toggleStyle">
            <span v-if="styleMode === 'dark'" class="toggle-icon dark-icon">🌙</span>
            <span v-else-if="styleMode === 'light'" class="toggle-icon light-icon">☀️</span>
            <span v-else class="toggle-icon auto-icon">🔄</span>
          </button>
        </div>
        
        <template v-if="!isLoggedIn">
          <router-link to="/login" class="login-btn">登录</router-link>
          <router-link to="/register" class="register-btn">注册</router-link>
        </template>
        <template v-else>
          <div class="user-menu">
            <div class="user-profile" @click="toggleUserMenu">
              <div class="user-avatar">
                <span>{{ userInitial }}</span>
              </div>
              <span class="username">{{ username }}</span>
              <img src="../assets/key-icon.svg" alt="Menu" class="key-icon">
            </div>
            
            <div class="dropdown-menu" v-if="showUserMenu">
              <div class="dropdown-item" @click="navigateTo('/profile')">
                <svg class="service-icon"><use xlink:href="../assets/service-icons.svg#room-service"></use></svg>
                <span>个人中心</span>
              </div>
              <div class="dropdown-item" @click="navigateTo('/orders')">
                <svg class="service-icon"><use xlink:href="../assets/service-icons.svg#spa"></use></svg>
                <span>我的订单</span>
              </div>
              <div v-if="isAdmin" class="dropdown-item" @click="navigateTo('/admin')">
                <svg class="service-icon"><use xlink:href="../assets/service-icons.svg#concierge"></use></svg>
                <span>后台管理</span>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item logout" @click="handleLogout">
                <span>退出登录</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../store/userStore';

// 状态管理
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const isScrolled = ref(false);
const isDarkMode = ref(false);
const isLightMode = ref(false);
const showUserMenu = ref(false);

// 风格模式：'auto'(自动), 'dark'(暗黑), 'light'(纯白)
const styleMode = ref(localStorage.getItem('preferredStyle') || 'auto');

// 监听风格模式变化
watch(styleMode, (newMode) => {
  localStorage.setItem('preferredStyle', newMode);
  updateStyleMode();
});

// 更新风格模式
const updateStyleMode = () => {
  if (styleMode.value === 'dark') {
    isDarkMode.value = true;
    isLightMode.value = false;
  } else if (styleMode.value === 'light') {
    isDarkMode.value = false;
    isLightMode.value = true;
  } else {
    // 'auto' 模式：根据系统偏好设置
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isLightMode.value = !isDarkMode.value;
  }
};

// 切换风格
const toggleStyle = () => {
  if (styleMode.value === 'auto') {
    styleMode.value = 'dark';
  } else if (styleMode.value === 'dark') {
    styleMode.value = 'light';
  } else {
    styleMode.value = 'auto';
  }
};

// 导航项目数据
const navItems = [
  { name: '首页', path: '/home' },
  { name: '客房预订', path: '/room-booking' },
  { name: '会员中心', path: '/membership' },
  { name: '优惠活动', path: '/promotions' },
];

// 计算属性
const isLoggedIn = computed(() => userStore.isLoggedIn);
const isAdmin = computed(() => userStore.isAdmin());
const username = computed(() => userStore.user?.username || '贵宾');
const userInitial = computed(() => {
  const name = username.value;
  return name ? name.charAt(0).toUpperCase() : '贵';
});
const currentRoute = computed(() => route.path);
const isHoliday = computed(() => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // 简单判断是否为春节或圣诞
  const isSpringFestival = (month === 1 || month === 2) && (day >= 20 || day <= 10);
  const isChristmas = month === 12 && (day >= 20 && day <= 31);
  
  return isSpringFestival || isChristmas;
});

// 方法
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

const checkDarkMode = () => {
  if (styleMode.value === 'auto') {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isLightMode.value = !isDarkMode.value;
  }
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleLogout = () => {
  userStore.logout();
  showUserMenu.value = false;
  router.push('/login');
};

const navigateTo = (path: string) => {
  showUserMenu.value = false;
  router.push(path);
};

// 关闭菜单的点击外部监听
const closeMenuOnClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (showUserMenu.value && !target.closest('.user-menu')) {
    showUserMenu.value = false;
  }
};

// 生命周期钩子
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('click', closeMenuOnClickOutside);
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeMediaQuery.addEventListener('change', checkDarkMode);
  updateStyleMode();
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('click', closeMenuOnClickOutside);
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', checkDarkMode);
});
</script>

<style scoped>
/* 整体视觉基调 */
.luxury-navbar {
  height: 85px; /* 高端酒店比例 */
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: #0F1A3D; /* 深海军蓝 */
  background-image: url('../assets/silk-texture.svg');
  background-size: cover;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* 纯白风格 */
.luxury-navbar.light-mode {
  background-color: #ffffff;
  background-image: none;
}

.luxury-navbar.light-mode .hotel-name,
.luxury-navbar.light-mode .hotel-tagline,
.luxury-navbar.light-mode .nav-item {
  color: #0F1A3D; /* 深海军蓝 */
}

.luxury-navbar.light-mode .navbar-border-top,
.luxury-navbar.light-mode .navbar-border-bottom {
  background: linear-gradient(to right, transparent, #0F1A3D, transparent);
}

.luxury-navbar.light-mode .login-btn {
  color: #0F1A3D;
  border-color: #0F1A3D;
}

.luxury-navbar.light-mode .register-btn {
  color: #ffffff;
  background-color: #0F1A3D;
  border-color: #0F1A3D;
}

.luxury-navbar.light-mode .nav-indicator {
  background-color: #0F1A3D;
}

.luxury-navbar.light-mode .nav-item.active .nav-indicator {
  background-image: linear-gradient(90deg, 
    transparent, #0F1A3D 20%, 
    #333333 50%, 
    #0F1A3D 80%, transparent
  );
  box-shadow: 0 0 6px rgba(15, 26, 61, 0.8);
}

.luxury-navbar.light-mode .crystal-ball {
  background: radial-gradient(circle at 30% 30%, rgba(15, 26, 61, 0.8), rgba(15, 26, 61, 0.6));
  box-shadow: 0 0 2px rgba(15, 26, 61, 0.6);
}

.luxury-navbar.light-mode .user-profile:hover {
  background-color: rgba(15, 26, 61, 0.1);
}

/* 边框装饰 */
.navbar-border-top, .navbar-border-bottom {
  position: absolute;
  left: 0;
  width: 100%;
  height: 0.5px;
  background: linear-gradient(to right, transparent, #D4AF37, transparent);
}

.navbar-border-top {
  top: 0;
}

.navbar-border-bottom {
  bottom: 0;
  box-shadow: 0 3px 5px rgba(212, 175, 55, 0.3); /* 金色光晕投影 */
}

/* 风格切换按钮样式 */
.style-toggle {
  margin-right: 10px;
}

.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.1);
}

.luxury-navbar.light-mode .toggle-button {
  background-color: rgba(15, 26, 61, 0.1);
}

.toggle-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.luxury-navbar.light-mode .toggle-button:hover {
  background-color: rgba(15, 26, 61, 0.2);
}

.toggle-icon {
  font-size: 18px;
}

.dark-icon {
  color: #ffdb7d;
}

.light-icon {
  color: #ff7e00;
}

.auto-icon {
  color: #ffffff;
}

.luxury-navbar.light-mode .auto-icon {
  color: #0F1A3D;
}

/* 品牌标识 */
.brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  position: relative;
  padding: 8px;
}

.brand-link::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 4px;
  box-shadow: 0 0 0.8px rgba(255, 255, 255, 0.4);
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.05) 100%);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.hotel-logo {
  height: 40px;
  width: 40px;
  filter: drop-shadow(0 0 2px rgba(212, 175, 55, 0.5));
  animation: goldShine 0.8s ease-in-out forwards;
}

.brand-text {
  display: flex;
  flex-direction: column;
  animation: riseUp 0.8s ease-in-out forwards;
}

.hotel-name {
  color: #D4AF37; /* 24K金 */
  font-family: '方正清刻本悦宋', serif;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
  line-height: 1.2;
}

.hotel-name-text {
  /* 特殊样式用于Feng部分 */
}

.hotel-name-accent {
  /* 特殊样式用于酒店部分 */
}

.hotel-tagline {
  color: #D4AF37; /* 24K金 */
  font-family: 'Trajan Pro', 'Times New Roman', serif;
  font-size: 12px;
  letter-spacing: 1.2px;
  opacity: 0.9;
}

/* 动画定义 */
@keyframes goldShine {
  0% { 
    opacity: 0;
    filter: brightness(0.8) drop-shadow(0 0 2px rgba(212, 175, 55, 0.5));
  }
  100% { 
    opacity: 1;
    filter: brightness(1) drop-shadow(0 0 2px rgba(212, 175, 55, 0.5)); 
  }
}

@keyframes riseUp {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 导航菜单 */
.nav-menu {
  display: flex;
  align-items: center;
  height: 100%;
}

.nav-item-container {
  display: flex;
  align-items: center;
  height: 100%;
}

.nav-item {
  color: #D4AF37; /* 14K金色 */
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 0 12px;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 宝格丽弹簧式弹性动画 */
}

.nav-item:hover {
  color: #F8F8F8; /* 珍珠白 */
  transform: translateY(-2px);
}

.nav-item.active {
  color: #F8F8F8; /* 珍珠白 */
}

.nav-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  height: 0.3mm; /* 0.3mm宽度 */
  width: 70%;
  background-color: #D4AF37;
  transition: transform 0.2s ease-out;
}

.nav-item:hover .nav-indicator,
.nav-item.active .nav-indicator {
  transform: translateX(-50%) scaleX(1);
}

.nav-item.active .nav-indicator {
  background-image: linear-gradient(90deg, 
    transparent, #D4AF37 20%, 
    #FFFFFF 50%, 
    #D4AF37 80%, transparent
  );
  box-shadow: 0 0 6px rgba(212, 175, 55, 0.8);
}

.nav-separator {
  display: flex;
  align-items: center;
  height: 100%;
}

.crystal-ball {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(212, 175, 55, 0.6));
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.6);
  margin: 0 15px;
  display: block;
}

/* 用户区域 */
.user-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.login-btn, .register-btn {
  padding: 10px 24px;
  border: 1px solid #D4AF37;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-btn {
  color: #D4AF37;
  background-color: transparent;
}

.register-btn {
  color: #0F1A3D;
  background-color: #D4AF37;
}

.login-btn:hover {
  background-color: rgba(212, 175, 55, 0.1);
}

.register-btn:hover {
  background-color: #C9A769;
}

.user-menu {
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.user-profile:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #D4AF37;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  position: relative;
  border: 0.5px solid rgba(212, 175, 55, 0.6);
}

.user-avatar::after {
  content: '';
  position: absolute;
  top: -1.5px;
  left: -1.5px;
  right: -1.5px;
  bottom: -1.5px;
  border-radius: 50%;
  border: 1.2px solid #D4AF37;
  pointer-events: none;
}

.user-avatar span {
  color: #0F1A3D;
  font-weight: 600;
  font-size: 16px;
}

.username {
  color: #3D3D3D; /* 深灰绒布色 */
  font-family: '华文细黑', sans-serif;
  font-weight: 500;
  font-size: 14px;
  margin-right: 6px;
}

.key-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.3s ease;
}

.user-profile:hover .key-icon {
  transform: rotate(90deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background-color: #F5F0E6; /* 米白真皮质感 */
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  width: 200px;
  padding: 8px 0;
  z-index: 1001;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #3D3D3D;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: linear-gradient(to right, #F5F0E6, #E8D9B5); /* 香槟色渐变 */
}

.service-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}

.dropdown-item span {
  font-size: 14px;
  font-weight: 500;
}

.dropdown-divider {
  height: 1px;
  background-color: rgba(0, 0, 0, 0.1);
  margin: 8px 0;
}

.dropdown-item.logout {
  color: #9E2B25;
}

/* 滚动效果 */
.luxury-navbar.scrolled {
  height: 70px;
  background-color: rgba(15, 26, 61, 0.88); /* 降低透明度 */
}

/* 夜间模式适应 */
.luxury-navbar.dark-mode {
  background-color: #0A142E;
}

.luxury-navbar.dark-mode .hotel-name,
.luxury-navbar.dark-mode .hotel-tagline,
.luxury-navbar.dark-mode .nav-item {
  color: #C9A769; /* 暖金色调 */
}

/* 节日特效 - 春节 */
.luxury-navbar.spring-festival::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0.5px;
  background: linear-gradient(90deg, 
    transparent, 
    #D40000 20%, 
    #FF0000 50%, 
    #D40000 80%, 
    transparent);
  background-size: 200% 100%;
  animation: flowingRibbon 15s infinite linear;
}

/* 节日特效 - 圣诞节 */
.luxury-navbar.christmas .brand-link:hover::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background-image: radial-gradient(circle at 50% 50%, transparent 90%, #FFF 100%);
  opacity: 0.2;
  pointer-events: none;
  animation: snowflakeGlow 2s infinite alternate;
}

/* 动画 */
@keyframes flowingRibbon {
  0% { background-position: 0% 0; }
  100% { background-position: 200% 0; }
}

@keyframes snowflakeGlow {
  0% { opacity: 0.1; }
  100% { opacity: 0.3; }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .nav-item {
    padding: 0 10px;
    font-size: 15px;
  }
  
  .crystal-ball {
    margin: 0 10px;
  }
  
  .navbar-container {
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .luxury-navbar {
    height: 60px; /* 压缩高度 */
  }
  
  .luxury-navbar.scrolled {
    height: 60px;
  }
  
  .hotel-tagline {
    display: none;
  }
  
  .nav-menu {
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    height: auto;
    background-color: #0F1A3D;
    flex-direction: column;
    align-items: stretch;
    padding: 10px 0;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
    transform: translateY(-150%);
    transition: transform 0.3s ease;
    z-index: 999;
  }
  
  .nav-menu.visible {
    transform: translateY(0);
  }
  
  .nav-item-container {
    flex-direction: column;
    height: auto;
  }
  
  .nav-item {
    padding: 15px 20px;
    width: 100%;
    justify-content: center;
  }
  
  .nav-separator {
    display: none;
  }
}

@media (max-width: 480px) {
  .login-btn, .register-btn {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .brand-link {
    padding: 4px;
  }
  
  .hotel-name {
    font-size: 20px;
  }
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 40px;
}
</style> 