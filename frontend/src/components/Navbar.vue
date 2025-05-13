<template>
  <div class="navbar">
    <div class="logo">
      <router-link to="/home" class="logo-link">
        <span class="hotel-icon">🏨</span>
        <h1>金玉<span class="logo-accent">酒店</span></h1>
      </router-link>
    </div>
    <div class="nav-links">
      <router-link to="/home" class="nav-item">首页</router-link>
      <router-link to="/room-booking" class="nav-item">房间预定</router-link>
      <router-link to="/membership" class="nav-item">会员中心</router-link>
      <router-link to="/promotions" class="nav-item">优惠活动</router-link>
    </div>
    <div class="auth-links">
      <template v-if="!isLoggedIn">
        <router-link to="/login" class="login-btn">登录</router-link>
        <router-link to="/register" class="register-btn">注册</router-link>
      </template>
      <template v-else>
        <div class="user-menu">
          <div class="user-info" @click="toggleUserMenu">
            <span class="user-avatar">{{ userInitial }}</span>
            <span class="user-name">{{ username }}</span>
            <span class="dropdown-icon">▼</span>
          </div>
          <div class="dropdown-menu" v-if="showUserMenu">
            <router-link to="/profile" class="dropdown-item">个人信息</router-link>
            <router-link to="/orders" class="dropdown-item">我的订单</router-link>
            <router-link v-if="isAdmin" to="/admin" class="dropdown-item admin">后台管理</router-link>
            <div class="dropdown-divider"></div>
            <button @click="logout" class="dropdown-item logout">退出登录</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../store/userStore';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();
const showUserMenu = ref(false);

const isLoggedIn = computed(() => userStore.isLoggedIn);
const isAdmin = computed(() => userStore.isAdmin());
const username = computed(() => userStore.user?.username || '用户');
const userInitial = computed(() => {
  const name = username.value;
  return name ? name.charAt(0).toUpperCase() : 'U';
});

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

// 点击页面其他区域关闭下拉菜单
const closeMenu = (e: MouseEvent) => {
  if (showUserMenu.value) {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      showUserMenu.value = false;
    }
  }
};

// 挂载事件监听器
if (typeof window !== 'undefined') {
  window.addEventListener('click', closeMenu);
}

const logout = () => {
  showUserMenu.value = false;
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  height: 70px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.hotel-icon {
  font-size: 24px;
  margin-right: 8px;
}

.logo h1 {
  font-size: 24px;
  color: #D4AF37; /* 金色 */
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.logo-accent {
  color: #4A90E2; /* 浅蓝色 */
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-item {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 16px;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s ease;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #4A90E2; /* 浅蓝色 */
}

.nav-item:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #4A90E2;
  transition: width 0.3s ease;
}

.nav-item:hover:after,
.nav-item.router-link-active:after {
  width: 100%;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 15px;
}

.login-btn, .register-btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.login-btn {
  color: #4A90E2;
  border: 1px solid #4A90E2;
}

.register-btn {
  background-color: #4A90E2;
  color: white;
  border: 1px solid #4A90E2;
}

.login-btn:hover {
  background-color: rgba(74, 144, 226, 0.1);
}

.register-btn:hover {
  background-color: #3a7fce;
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  background-color: #4A90E2;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 8px;
}

.user-name {
  font-weight: 500;
  margin-right: 6px;
}

.dropdown-icon {
  font-size: 10px;
  color: #666;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  width: 180px;
  padding: 8px 0;
  margin-top: 10px;
  z-index: 1001;
}

.dropdown-item {
  display: block;
  padding: 10px 16px;
  font-size: 14px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
}

.dropdown-item.admin {
  color: #D4AF37;
}

.dropdown-item.logout {
  color: #e74c3c;
  text-align: left;
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
}

.dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 8px 0;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 20px;
  }
  
  .logo h1 {
    font-size: 20px;
  }
  
  .nav-links {
    display: none;
  }
}
</style> 