<script setup lang="ts">
import HabitTrackerLogo from '@/components/HabitTrackerLogo.vue'
import HabitList from '@/components/HabitList.vue'
</script>
<template>
  <div class="min-h-screen flex flex-col items-center justify-center">
    <HabitTrackerLogo
      size="lg"
      class="-translate-y-12 mb-12"
    />

    <div class="text-4xl font-semibold text-orange-600">
      Welcome to your Habit Tracker
    </div>
  </div>

</template>
