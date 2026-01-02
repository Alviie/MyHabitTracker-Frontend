<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import HabitHeatmap from '@/components/HabitHeatmap.vue'
import axios from 'axios'

// Interface mit completions!
interface Habit {
  id: number
  name: string
  icon?: string
  completions?: { date: string; completed: boolean }[]
}

const router = useRouter()
const habits = ref<Habit[]>([])

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL
const endpoint = baseURL + '/habits'

const userId = localStorage.getItem('userId')

if (!userId) {
  window.location.href = '/login'
}

const fetchHabitsWithCompletions = async () => {
  try {
    // 1. Habits laden
    const response = await axios.get(`${endpoint}?userId=${userId}`)

    // 2. COMPLETIONS PARALLEL laden!
    const habitsWithCompletions = await Promise.all(
      response.data.map(async (h: any) => {
        try {
          const compResponse = await axios.get(`${endpoint}/${h.id}/completions?daysBack=90&userId=${userId}`)
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
  <div class="pb-24">
    <div class="px-4 sm:px-6 lg:px-11 py-12">
      <!-- Header -->
      <div class="flex items-center justify-center gap-3 mb-12">
        <h2 class="text-6xl font-bold text-violet-600"
            style="font-family: Arial, sans-serif;">🔥My Heatmap
        </h2>
      </div>

      <!-- Vertikaler Abstand zwischen Header und Loading/Grid -->
      <div class="h-10"></div>

      <!-- Loading State -->
      <div v-if="!habits.length" class="text-center py-20">
        <div class="w-20 h-20 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto mb-6">
        </div>
        <p class="text-slate-500 dark:text-slate-400">Lade Heatmaps...</p>
      </div>

      <!-- Heatmaps Grid (Responsive) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HabitHeatmap
          v-for="habit in habits"
          :key="habit.id"
          :habit="habit"
          class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-neutral-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all animate-fade-in-up"
          :style="{ animationDelay: `${(index + 1) * 0.1}s` }"
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
