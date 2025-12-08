<script setup lang="ts">
const props = defineProps<{
  habit: {
    id: number | string
    name: string
    completed?: boolean
    streak?: number
  }
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string | number): void
  (e: 'delete', id: string | number): void
}>()
</script>

<template>
  <div class="px-6 py-4 hover:bg-gray-50 transition-colors group cursor-pointer">
    <div class="flex items-center gap-4">

      <!-- Checkbox -->
      <button
        @click="emit('toggle', habit.id)"
        class="flex-shrink-0"
      >
        <div
          :class="[
            'w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all',
            habit.completed
              ? 'bg-orange-600 border-orange-600'
              : 'border-gray-300 hover:border-orange-400'
          ]"
        >
          <!-- Check Icon -->
