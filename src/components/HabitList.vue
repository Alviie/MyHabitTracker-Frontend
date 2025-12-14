<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import axios from 'axios'
import { FwbButton } from 'flowbite-vue'

// Typ für Habit
interface Habit {
  id: number        // Java Long -> number
  name: string
  completed: boolean
  streakCount: number
  lastCompletedDate: string | null  // LocalDate -> ISO-String oder null
}

// Typ für Habit-Stats
interface HabitStats {
  total: number
  completed: number
  completionRate: number
  longestStreak: number
  avgStreak: number
}

// Backend URL aus Environment-Variable
const baseURL = import.meta.env.VITE_BACKEND_BASE_URL
const endpoint = baseURL + '/habits'


// Habits laden (anonyme Funktion onMounted)
const habits = ref<Habit[]>([]) // reaktive Liste, die Backend-Daten speichert, Variable ref aktualisiert Template

onMounted(async () => {

  const saved = localStorage.getItem('darkMode')
  if (saved === 'true') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }


  try {
    const response = await axios.get(endpoint) // JS-Bibliothek axios ermöglicht Kommunikation zw. Front- und Backend
    console.log("response" + response)
    habits.value = response.data // Backend wird geladen
    console.log("Habits vom Backend:", habits.value)

  } catch (err) {
    console.error("Fehler beim Laden der Habits:", err)
  }
})

// Methode: Neues Habit hinzufügen und Liste aktualisieren
const newHabitName = ref('')

const addHabit = async () => {
  const trimmed = newHabitName.value.trim()
  if (!trimmed) return

  try {
    const response = await axios.post(endpoint, { name: trimmed })
    habits.value.push(response.data)
    newHabitName.value = ''
  } catch (err) {
    console.error('Fehler beim Anlegen des Habits:', err)
  }
}

// Habit löschen
const deleteHabit = async (id: number) => {
  try {
    await axios.delete(`${endpoint}/${id}`)
    habits.value = habits.value.filter(h => h.id !== id)
  } catch (err) {
    console.error('Fehler beim Löschen des Habits:', err)
  }
}

// Habit als erledigt markieren / toggeln
const toggleCompleted = async (habit: Habit) => {
  try {
    // Annahme: Backend-Endpoint erwartet PUT mit aktualisiertem Habit
    const updated = { ...habit, completed: !habit.completed }
    const response = await axios.put(`${endpoint}/${habit.id}`, updated)

    // Habit in der Liste ersetzen
    habits.value = habits.value.map(h =>
      h.id === habit.id ? response.data : h
    )
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Habits:', err)
  }
}

// Methode: Filter (nach habits/newHabitName)
const filterMode = ref<'all' | 'open' | 'completed'>('all')

const filteredHabits = computed(() => {
  switch (filterMode.value) {
    case 'open':
      return habits.value.filter(h => !h.completed)
    case 'completed':
      return habits.value.filter(h => h.completed)
    default:
      return habits.value
  }
})

// Habits Stats
const stats = computed<HabitStats>(() => {
  const total = habits.value.length
  const completedToday = habits.value.filter(h => h.completed).length
  const longestStreak = Math.max(0, ...habits.value.map(h => h.streakCount))
  const avgStreak = total > 0 ? Math.round(
    habits.value.reduce((sum, h) => sum + h.streakCount, 0) / total
  ) : 0

  return {
    total,
    completed: completedToday,
    completionRate: total > 0 ? Math.round((completedToday / total) * 100) : 0,
    longestStreak,
    avgStreak
  }
})

// Wochentags-Navigation
const habitCompletions = ref<Record<string, boolean>[]>([])  // Array pro Tag

const selectedDay = ref(0)
const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

// Computed: Habits + Completion für aktuellen Tag
const habitsForDay = computed(() => {
  const dayIndex = selectedDay.value
  const dayCompletions = habitCompletions.value[dayIndex] || {}

  let filtered = habits.value
  switch (filterMode.value) {
    case 'open':
      filtered = habits.value.filter(h => !dayCompletions[h.id.toString()])
      break
    case 'completed':
      filtered = habits.value.filter(h => dayCompletions[h.id.toString()])
      break
  }

  return filtered.map((habit: Habit) => ({
    ...habit,
    completed: dayCompletions[habit.id.toString()] || false
  }))
})

// Toggle für spezifischen Tag
const toggleHabit = async (habitId: number) => {
  const currentCompleted = habitsForDay.value.find(h => h.id === habitId)?.completed || false
  const newCompleted = !currentCompleted

  try {
    // Backend Call
    const response = await axios.put(
      `${endpoint}/${habitId}/complete?completed=${newCompleted}`,
      null
    )

    // 1. Backend-Daten aktualisieren (Streak!)
    habits.value = habits.value.map(h =>
      h.id === habitId ? response.data : h
    )

    // 2. LOCAL syncen (für Tag-View!)
    const dayIndex = selectedDay.value
    if (!habitCompletions.value[dayIndex]) {
      habitCompletions.value[dayIndex] = {}
    }
    habitCompletions.value[dayIndex][habitId.toString()] = newCompleted

  } catch (err) {
    console.error('Backend-Fehler:', err)
  }
}

// ← NEU: Woche + Offset
const weekOffset = ref<number>(0)

// ← Computed HINZUFÜGEN:
const currentDate = computed(() => {
  const today = new Date()
  const todayDay = today.getDay()  // JS: So=0
  const daysFromToday = selectedDay.value + (weekOffset.value * 7)
  const date = new Date(today)
  date.setDate(today.getDate() + daysFromToday)
  return date
})

const getWeekdayHeader = (dayIndex: number) => {
  const today = new Date()
  const todayDay = today.getDay()  // Heute So=0
  const daysFromToday = dayIndex + (weekOffset.value * 7)  // ← FIX!
  const date = new Date(today)
  date.setDate(today.getDate() + daysFromToday)
  return date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' })
}


// Dark-Mode
const darkMode = ref(false)

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  const html = document.documentElement

  if (darkMode.value) {
    html.classList.add('dark')
    html.classList.remove('light')
    localStorage.setItem('darkMode', 'true')
  } else {
    html.classList.add('light')
    html.classList.remove('dark')
    localStorage.setItem('darkMode', 'false')
  }
}





</script>

<template>
  <div>
    <h2 class="text-3xl">Meine Habits</h2>

    <div class="flex justify-end mb-4">
      <button @click="toggleDarkMode" class="p-2 rounded-full bg-slate-200 text-slate-800 hover:bg-slate-300 transition-all dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
        <svg v-if="!darkMode" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>

    <!-- ← NEUER FILTER BUTTON -->
    <div class="mb-6 flex gap-2">
      <button
        class="px-4 py-2 rounded font-medium text-white transition-all
           bg-blue-500 hover:bg-blue-600"
        :class="{ 'bg-blue-700': filterMode === 'all' }"
        @click="filterMode = 'all'"
      >
        Alle
      </button>
      <button
        class="px-4 py-2 rounded font-medium text-white transition-all
           bg-emerald-500 hover:bg-emerald-600"
        :class="{ 'bg-emerald-600': filterMode === 'open' }"
        @click="filterMode = 'open'"
      >
        Offen
      </button>
      <button
        class="px-4 py-2 rounded font-medium text-white transition-all
           bg-gray-500 hover:bg-gray-600"
        :class="{ 'bg-gray-600': filterMode === 'completed' }"
        @click="filterMode = 'completed'"
      >
        Erledigt
      </button>
    </div>

    <!-- Habit-Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-6 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <div class="text-center">
        <div class="text-2xl font-bold text-emerald-400">{{ stats.completed }}</div>
        <div class="text-sm opacity-75">Heute erledigt</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-400">{{ stats.completionRate }}%</div>
        <div class="text-sm opacity-75">Erfolgsrate</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-orange-400">{{ stats.longestStreak }}</div>
        <div class="text-sm opacity-75">Longest Streak</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-purple-400">{{ stats.avgStreak }}</div>
        <div class="text-sm opacity-75">Ø Streak</div>
      </div>
    </div>

    <!-- ← WOCHEN-NAVIGATION (nach Stats, vor Wochentags-Balken) -->
    <div class="flex items-center justify-center gap-4 mb-6">
      <button @click="weekOffset--" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm">
        ← Woche
      </button>
      <span class="font-bold text-lg text-slate-900 dark:text-white">
    Woche {{ weekOffset === 0 ? 'aktuell' : `${Math.abs(weekOffset)} ${weekOffset < 0 ? 'zurück' : 'vor'}` }}
  </span>
      <button @click="weekOffset++" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm">
        Woche →
      </button>
    </div>


    <!-- ← WOCHENTAGS-BALKEN (angepasst) -->
    <div class="flex gap-1 mb-6 overflow-x-auto pb-2">
      <button v-for="day in 7" :key="day"
              class="flex-1 min-w-[60px] px-3 py-2 rounded-full text-sm font-medium transition-all"
              :class="selectedDay === day ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600'"
              @click="selectedDay = day">
        {{ getWeekdayHeader(day) }}
      </button>
    </div>

    <!-- ← DATUM (zentriert) -->
    <div class="mb-6 text-center">
      <h3 class="font-bold text-2xl text-black dark:text-white">{{ currentDate.toLocaleDateString('de-DE') }}</h3>
    </div>


    <!-- Habit-Eingabe -->
    <div class="mb-6 flex gap-3">
      <input v-model="newHabitName" type="text" placeholder="Neues Habit..."
             class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800" />
      <button @click="addHabit"
              class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-medium">
        Hinzufügen
      </button>
    </div>

    <ul>
      <li v-for="habit in habitsForDay" :key="habit.id"
          class="p-4 bg-white border dark:bg-slate-800 dark:border-slate-700 rounded-lg mb-2 flex justify-between items-center">
        <!-- Bestehende Habit-Row -->
        <div class="flex-1">
          <h3 class="text-xl font-bold text-shadow-slate-900 dark:text-white">{{ habit.name }}</h3>
          <p class="text-emerald-400">
            Streak: {{ habit.streakCount }} 🔥 {{ habit.completed ? '✓' : '' }}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class="px-4 py-2 rounded font-medium text-white"
            :class="habit.completed ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'"
            @click="toggleHabit(habit.id)"
          >
            {{ habit.completed ? 'Offen' : 'Erledigt' }}
          </button>
          <button
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-all"
            @click="deleteHabit(habit.id)"
          >
            Löschen
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>


<style></style>

