<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <router-view />
</template>

<style scoped>
:root {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.5;
  color: #333;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  margin: 0;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
