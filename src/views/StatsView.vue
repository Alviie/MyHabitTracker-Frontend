<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

interface Completion {
  date: string
  completed: boolean
}

interface Habit {
  id: number
  name: string
  completed: boolean
  streakCount: number
  lastCompletedDate: string | null
  category: string | null
  targetAmount: number | null
  targetUnit: string | null
  frequency: string | null
  notes: string | null
  color: string | null
  icon: string | null
  completions?: Completion[]
}

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL
const endpoint = baseURL + '/habits'

const habits = ref<Habit[]>([])
const loading = ref(true)

const formatDate = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

onMounted(async () => {
  try {
    const response = await axios.get(endpoint)
    habits.value = response.data

    await Promise.all(
      habits.value.map(async habit => {
        try {
          const compRes = await axios.get(
            `${endpoint}/${habit.id}/completions?daysBack=90`
          )
          habit.completions = compRes.data
        } catch {
          habit.completions = []
        }
      })
    )
  } finally {
    loading.value = false
  }
})

const totalHabits = computed(() => habits.value.length)

const todayStr = computed(() => formatDate(new Date()))

const habitsCompletedToday = computed(() =>
  habits.value.filter(h =>
    h.completions?.some(c => c.date === todayStr.value && c.completed)
  ).length
)

const successRateForDays = (days: number) => {
  if (!habits.value.length) return 0

  const today = new Date()
  const start = new Date()
  start.setDate(today.getDate() - (days - 1))
  const startStr = formatDate(start)
  const endStr = formatDate(today)

  let totalPossible = 0
  let totalCompleted = 0

  habits.value.forEach(habit => {
    const comps = habit.completions ?? []
    const inRange = comps.filter(
      c => c.date >= startStr && c.date <= endStr
    )
    totalPossible += days
    totalCompleted += inRange.filter(c => c.completed).length
  })

  if (totalPossible === 0) return 0
  return Math.round((totalCompleted / totalPossible) * 100)
}

const success7Days = computed(() => successRateForDays(7))
const success30Days = computed(() => successRateForDays(30))
const success90Days = computed(() => successRateForDays(90))

const longestStreakOverall = computed(() =>
  habits.value.length
    ? Math.max(...habits.value.map(h => h.streakCount))
    : 0
)

const top3ByStreak = computed(() =>
  [...habits.value]
    .sort((a, b) => b.streakCount - a.streakCount)
    .slice(0, 3)
)

const habitsWithStats = computed(() =>
  habits.value.map(habit => {
    const comps = habit.completions ?? []
    const daysCompleted = comps.filter(c => c.completed).length
    const rate =
      comps.length > 0
        ? Math.round((daysCompleted / comps.length) * 100)
        : 0

    return {
      ...habit,
      daysCompleted,
      rate
    }
  })
)

const avgPerDayLast30 = computed(() => {
  const today = new Date()
  const start = new Date()
  start.setDate(today.getDate() - 29)
  const startStr = formatDate(start)
  const endStr = formatDate(today)

  let total = 0
  habits.value.forEach(h =>
    h.completions?.forEach(c => {
      if (c.date >= startStr && c.date <= endStr && c.completed) total++
    })
  )
  return Math.round(total / 30)
})
</script>

<template>
  <div>
    <header
      class=" flex flex-col md:flex-row md:items-center md:justify-between gap-12 fx-auto px-12 py-6 text-center md:text-left"
    >
      <div>
        <h2 class="text-5xl md:text-5xl font-extrabold text-violet-600 dark:text-violet-600 tracking-tight"
            style="font-family: Arial, sans-serif;">
          My Statistics
        </h2>
        <p class="py-2 text-slate-500 dark:text-slate-300 text-medium mt-1"
           style="font-family: Arial, sans-serif;">
          Übersicht über deine Habits und deine Konsistenz der letzten 90 Tage.
        </p>
      </div>
      <div
        class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-400 to-pink-400 hover:from-fuchsia-500 text-slate-300 text-xs md:text-sm font-medium dark:bg-emerald-900/40 dark:hover:text-white"
      >
        <span class="text-lg">🔥</span>
        <span>Längster Streak: {{ longestStreakOverall }} Tage</span>
      </div>
    </header>

    <div
      v-if="loading"
      class="py-16 text-center text-slate-500 dark:text-slate-400"
    >
      Lade Statistiken …
    </div>

    <div
      v-else
      class="flex flex-col gap-12 md:gap-5"
    >
      <!-- KPI-Grid groß -->
      <section class="" >
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-12 py-4">
          <div
            class="rounded-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col gap-2"
          >
            <span class="text-medium uppercase tracking-wide text-slate-600 dark:text-slate-300 px-4">Habits 📦</span>
            <span class="text-3xl md:text-4xl font-bold text-pink-500 px-4"
                  style="font-family: Arial, sans-serif;">{{ totalHabits }}</span>
            <span class="text-medium text-slate-600 dark:text-slate-300 px-4"
                  style="font-family: Arial, sans-serif;">Gesamt angelegt</span>
          </div>

          <div
            class="rounded-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col gap-2"
          >
            <span class="text-medium uppercase tracking-wide text-slate-600 dark:text-slate-300 px-4">Heute erledigt 📅</span>
            <span class="text-3xl md:text-4xl font-bold text-green-400 px-4"
                  style="font-family: Arial, sans-serif;">
              {{ habitsCompletedToday }}
            </span>
            <span class="text-medium text-slate-600 dark:text-slate-300 px-4"
                  style="font-family: Arial, sans-serif;">
              am {{ todayStr }}
            </span>
          </div>

          <div
            class="rounded-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col gap-2"
          >
            <span class="text-medium uppercase tracking-wide text-slate-600 dark:text-slate-300 px-4">Erfolgsrate 7 Tage 📈</span>
            <span class="text-3xl md:text-4xl font-bold text-blue-500 px-4"
                  style="font-family: Arial, sans-serif;">
              {{ success7Days }}%
            </span>
            <span class="text-medium text-slate-600 dark:text-slate-300 px-4"
                  style="font-family: Arial, sans-serif;">
              Kurzfristige Konsistenz
            </span>
          </div>

          <div
            class="rounded-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col gap-2"
          >
            <span class="text-medium uppercase tracking-wide text-slate-600 dark:text-slate-300 px-4">Ø / Tag (30 Tage) ⏱</span>
            <span class="text-3xl md:text-4xl font-bold text-purple-500 px-4"
                  style="font-family: Arial, sans-serif;">
              {{ avgPerDayLast30 }}
            </span>
            <span class="text-medium text-slate-600 dark:text-slate-300 px-4"
                  style="font-family: Arial, sans-serif;">
              erledigte Habits pro Tag
            </span>
          </div>
        </div>
      </section>

      <!-- Erfolgsraten + Top 3 breiter -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-12 px-12">
        <div
          class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-7 shadow-sm h-full"
        >
          <h3 class="text-xl md:text-xl font-semibold mb-4 text-slate-900 dark:text-slate-300 px-2"
              style="font-family: Arial, sans-serif;">
            Erfolgsraten 🎯
          </h3>
          <div class="space-y-2 text-medium px-2">
            <div class="flex items-center justify-between">
              <span class="text-slate-600 dark:text-slate-300">Letzte 7 Tage</span>
              <span class="font-semibold text-blue-500">{{ success7Days }}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-600 dark:text-slate-300">Letzte 30 Tage</span>
              <span class="font-semibold text-indigo-500">{{ success30Days }}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-600 dark:text-slate-300">Letzte 90 Tage</span>
              <span class="font-semibold text-purple-500">{{ success90Days }}%</span>
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-7 shadow-sm h-full"
        >
          <h3 class="text-xl md:text-xl font-semibold mb-4 text-slate-900 dark:text-white px-2">
            Stärkste Habits 💪
          </h3>
          <ul class="space-y-2 text-medium px-2">
            <li
              v-for="habit in top3ByStreak"
              :key="habit.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <span v-if="habit.icon" class="text-lg">{{ habit.icon }}</span>
                <span class="text-slate-800 dark:text-slate-300">{{ habit.name }}</span>
              </div>
              <span class="text-green-400 font-semibold">
                {{ habit.streakCount }} Tage 🔥
              </span>
            </li>
            <li
              v-if="top3ByStreak.length === 0"
              class="text-slate-500 dark:text-slate-300 text-xs"
            >
              Noch keine Daten.
            </li>
          </ul>
        </div>
      </section>

      <!-- Habit-Tabelle breit -->
      <section class="pb-10 px-12">
        <h3 class="text-lg md:text-xl font-semibold mb-5 text-slate-900 dark:text-slate-200">
          Habits im Detail (letzte 90 Tage)
        </h3>
        <div
          class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <table class="min-w-full text-sm text-left">
            <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <tr>
              <th class="px-4 py-3 font-lg">Habit</th>
              <th class="px-4 py-3 font-medium">Tage erledigt</th>
              <th class="px-4 py-3 font-medium">Erfolgsrate</th>
              <th class="px-4 py-3 font-medium">Aktueller Streak</th>
            </tr>
            </thead>
            <tbody>
            <tr
              v-for="habit in habitsWithStats"
              :key="habit.id"
              class="border-t border-slate-100 dark:border-slate-800"
            >
              <td class="px-4 py-3 flex items-center gap-2">
                <span v-if="habit.icon" class="text-lg">{{ habit.icon }}</span>
                <span>{{ habit.name }}</span>
              </td>
              <td class="px-4 py-3">{{ habit.daysCompleted }}</td>
              <td class="px-4 py-3">{{ habit.rate }}%</td>
              <td class="px-4 py-3">{{ habit.streakCount }}</td>
            </tr>
            <tr v-if="habitsWithStats.length === 0">
              <td colspan="4" class="px-4 py-5 text-center text-slate-500 dark:text-slate-400">
                Keine Habits vorhanden.
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
