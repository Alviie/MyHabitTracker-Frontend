<script setup lang="ts">
import { ref } from 'vue'

// Event an Parent senden
const emit = defineEmits(['add'])

const habitName = ref('')

const handleSubmit = () => {
  if (!habitName.value.trim()) return
  emit('add', habitName.value.trim())
  habitName.value = ''
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="flex gap-2">
    <input
      v-model="habitName"
      type="text"
      placeholder="Add a new habit"
      class="app-input flex-1"
    />

    <button
      type="submit"
      class="btn-primary flex items-center gap-2"
      :disabled="!habitName.trim()"
    >
      <span class="text-lg leading-none">+</span>
      Add
    </button>
  </form>
</template>
