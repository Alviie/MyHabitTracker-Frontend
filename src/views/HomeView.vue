<script setup lang="ts">
import HabitTrackerLogo from '@/components/HabitTrackerLogo.vue'
import HabitList from '@/components/HabitList.vue'
</script>
<template>
  <div class="min-h-screen flex flex-col items-center justify-center app-font">
    <HabitTrackerLogo size="xl" class="-translate-y-10 mb-12" />

    <div class="app-heading -translate-y-15">
      Your daily habits shape your future
    </div>

    <p class="app-subtext -translate-y-6">
      Ready to take care of yourself today?
    </p>

    <p class="app-subtext mt-8 opacity-70">
      Tap to get started
    </p>

  </div>

</template>
