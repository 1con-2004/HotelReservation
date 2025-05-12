<template>
  <div class="navbar">
    <div class="logo">
      <h1>酒店预约管理系统</h1>
    </div>
    <div class="nav-links">
      <router-link to="/">首页</router-link>
      <router-link to="/room-booking">房间预定</router-link>
      <router-link to="/membership">会员中心</router-link>
      <router-link to="/promotions">优惠活动</router-link>
    </div>
    <div class="auth-links">
      <router-link v-if="isAdmin" to="/admin">后台管理</router-link>
      <button v-if="isLoggedIn" @click="logout">退出登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../store/userStore';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const isLoggedIn = computed(() => userStore.isLoggedIn);
const isAdmin = computed(() => userStore.isAdmin());

const logout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.logo h1 {
  font-size: 20px;
  color: #333;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 16px;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #3498db;
}

.auth-links {
  display: flex;
  gap: 10px;
}

.auth-links a,
.auth-links button {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
}

.auth-links button {
  background-color: #e74c3c;
}

.auth-links a:hover,
.auth-links button:hover {
  opacity: 0.9;
}
</style> 