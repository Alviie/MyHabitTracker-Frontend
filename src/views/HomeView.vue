<script setup lang="ts">
import HabitList from "@/components/HabitList.vue";
</script>

<template>
  <main>
    <h1>Willkommen beim HabitTracker</h1>
    <HabitList />
  </main>
</template>

<style scoped>
main {
  padding: 0;
  margin: 0;
}
h1 {
  margin-bottom: 10rem;
  margin-top: 10rem;
}
</style>
