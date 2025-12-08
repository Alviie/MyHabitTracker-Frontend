<script setup lang="ts">
const props = defineProps<{
  currentFilter: 'all' | 'active' | 'completed'
}>()

const emit = defineEmits<{
  (e: 'change', filter: 'all' | 'active' | 'completed'): void
}>()

const filters = [
  { value: 'all', label: 'Alle' },
  { value: 'active', label: 'Aktive' },
  { value: 'completed', label: 'Erledigte' }
]
</script>

<template>
  <div class="border-b border-gray-200 pb-4 mb-4">
    <div class="flex gap-3">

      <button
        v-for="f in filters"
        :key="f.value"
        @click="emit('change', f.value)"
        class="px-4 py-2 rounded-lg transition-colors"
        :class="currentFilter === f.value
          ? 'bg-orange-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
      >
        {{ f.label }}
      </button>

    </div>
  </div>
</template>
