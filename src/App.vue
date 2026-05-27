<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('小学课后强化学习助手已启动')
})
</script>

<style>
#app {
  background: #f5f5f5;
}
</style>