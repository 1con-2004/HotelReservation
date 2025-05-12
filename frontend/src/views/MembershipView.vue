<template>
  <div class="membership">
    <Navbar />
    <div class="content">
      <h1>会员中心</h1>
      <p>这是会员中心页面，内容待开发。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue';
</script>

<style scoped>
.membership {
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