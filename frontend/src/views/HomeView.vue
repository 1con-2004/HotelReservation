<template>
  <div class="home">
    <Navbar />
    <div class="content">
      <h1>欢迎使用酒店预约管理系统</h1>
      <p>这是系统首页，请使用上方导航栏访问其他功能。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue';
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.content {
  padding: 40px;
  width: 100%;
  text-align: center;
}

h1 {
  margin-bottom: 20px;
  color: #2c3e50;
}

p {
  font-size: 18px;
  color: #34495e;
}
</style> 