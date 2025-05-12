<template>
  <div class="room-booking">
    <Navbar />
    <div class="content">
      <h1>房间预定</h1>
      <p>这是房间预定页面，内容待开发。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue';
</script>

<style scoped>
.room-booking {
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