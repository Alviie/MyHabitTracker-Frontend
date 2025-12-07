<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HabitList from './components/HabitList.vue';
import HabitTrackerLogo from "@/components/HabitTrackerLogo.vue";
</script>

<template>
  <div class="p-4">
    <HabitTrackerLogo size="md" />
  </div>

  <RouterView />
</template>
