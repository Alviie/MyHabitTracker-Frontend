<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import HabitHeatmap from '@/components/HabitHeatmap.vue'
import axios from 'axios'

// 🔥 Interface mit completions!
interface Habit {
  id: number
  name: string
  icon?: string
  completions?: { date: string; completed: boolean }[]  // ← FEHLT!
}

const router = useRouter()
const habits = ref<Habit[]>([])

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL
const endpoint = baseURL + '/habits'

const fetchHabitsWithCompletions = async () => {
  try {
    // 1. Habits laden
    const response = await axios.get(endpoint)

    // 2. 🔥 COMPLETIONS PARALLEL laden!
    const habitsWithCompletions = await Promise.all(
      response.data.map(async (h: any) => {
        try {
          const compResponse = await axios.get(`${endpoint}/${h.id}/completions?daysBack=90`)
          console.log(`✅ ${h.name}: ${compResponse.data.filter((c: any) => c.completed).length}/90`)
          return { ...h, completions: compResponse.data }
        } catch (err) {
          console.warn(`❌ Keine Completions für ${h.name}`)
          return { ...h, completions: [] }
        }
      })
    )

    return habitsWithCompletions
  } catch (err) {
    console.error('Fehler:', err)
    return []
  }
}

onMounted(async () => {
  habits.value = await fetchHabitsWithCompletions()
})
</script>


<template>
  <div class="pb-32 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="text-center mb-16">
        <h1 class="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
          🔥 Heatmap
        </h1>
        <p class="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Dein Fortschritt in den letzten 3 Monaten!
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="!habits.length" class="text-center py-20">
        <div class="w-20 h-20 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-500 dark:text-slate-400">Lade Heatmaps...</p>
      </div>

      <!-- Heatmaps Grid (Responsive) -->
      <div v-else class="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
        <HabitHeatmap
          v-for="habit in habits"
          :key="habit.id"
          :habit="habit"
          class="animate-fade-in-up"
        />
      </div>

      <!-- Empty State -->
      <div v-if="habits.length === 0" class="text-center py-32">
        <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <span class="text-4xl">📊</span>
        </div>
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Noch keine Habits</h2>
        <p class="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
          Füge deine ersten Habits in der Liste hinzu, um Heatmaps zu sehen.
        </p>
        <router-link to="/" class="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl shadow-lg transition-all">
          Habits hinzufügen
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
          </svg>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animate-fade-in-up:nth-child(1) { animation-delay: 0.1s; }
.animate-fade-in-up:nth-child(2) { animation-delay: 0.2s; }
.animate-fade-in-up:nth-child(3) { animation-delay: 0.3s; }
.animate-fade-in-up:nth-child(4) { animation-delay: 0.4s; }
.animate-fade-in-up:nth-child(5) { animation-delay: 0.5s; }
.animate-fade-in-up:nth-child(6) { animation-delay: 0.6s; }
</style>
