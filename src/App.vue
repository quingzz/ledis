<script setup>
// import { RouterLink, RouterView } from 'vue-router'
import HomeView from "@/views/HomeView.vue";
import "./index.css";
</script>

<template>
  <header></header>

  <div class="flex-grow h-screen bg-slate-800 text-white">
    <HomeView />
  </div>
</template>
