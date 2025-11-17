<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Typ für Habit
interface Habit {
  id: number
  name: string
}

// Backend URL aus Environment-Variable
const baseURL = import.meta.env.VITE_BACKEND_BASE_URL
const endpoint = baseURL + '/habits'
const habits = ref<Habit[]>([]) // reaktive Liste, die Backend-Daten speichert, Variable ref aktualisiert Template

onMounted(async () => {
  try {
    const response = await axios.get(endpoint)
    console.log("respone" + response)
    habits.value = response.data
    console.log("Habits vom Backend:", habits.value)
  } catch (err) {
    console.error("Fehler beim Laden der Habits:", err)
  }
})
</script>

<template>
  <div>
    <h2>Meine Habits</h2>
    <ul>
      <li v-for="habit in habits" :key="habit.id">{{ habit.name }}</li>
    </ul>
  </div>
</template>

<style scoped>

</style>
