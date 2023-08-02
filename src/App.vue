<template>
  <Navbar />
  <div class="h-2"></div>
  <div class="container mx-auto">
    <RouterView />
  </div>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
</script>
