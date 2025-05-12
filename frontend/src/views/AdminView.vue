<template>
  <div class="admin">
    <Navbar />
    <div class="content">
      <h1>后台管理</h1>
      <div class="admin-panels">
        <div class="panel">
          <h2>用户管理</h2>
          <p>用户管理功能待开发</p>
        </div>
        <div class="panel">
          <h2>房间管理</h2>
          <p>房间管理功能待开发</p>
        </div>
        <div class="panel">
          <h2>订单管理</h2>
          <p>订单管理功能待开发</p>
        </div>
        <div class="panel">
          <h2>优惠活动管理</h2>
          <p>优惠活动管理功能待开发</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue';
import { useUserStore } from '../store/userStore';
import { onMounted, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

onBeforeMount(() => {
  if (!userStore.isLoggedIn || !userStore.isAdmin()) {
    router.push('/login');
  }
});
</script>

<style scoped>
.admin {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.content {
  padding: 40px;
  width: 100%;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
  text-align: center;
}

.admin-panels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.panel {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.panel h2 {
  margin-bottom: 15px;
  color: #3498db;
  font-size: 20px;
}

.panel p {
  color: #7f8c8d;
}
</style> 