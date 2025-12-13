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
  try {
    const response = await axios.get(endpoint) // JS-Bibliothek axios ermöglicht Kommunikation zw. Front- und Backend
    console.log("respone" + response)
    habits.value = response.data
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
const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

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
  const dayOffset = selectedDay.value - today.getDay()
  const weekOffsetDays = weekOffset.value * 7
  const date = new Date(today)
  date.setDate(today.getDate() + dayOffset + weekOffsetDays)
  return date
})

const getWeekdayHeader = (dayIndex: number) => {
  const baseDate = currentDate.value  // ← NUR .value!
  const date = new Date(baseDate)
  date.setDate(baseDate.getDate() + (dayIndex - selectedDay.value))
  return date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' })
}






</script>

<template>
  <div>
    <h2>Meine Habits</h2>

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
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-6 bg-slate-800 rounded-lg">
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
      <span class="font-bold text-lg">
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
              :class="selectedDay === day ? 'bg-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600'"
              @click="selectedDay = day">
        {{ getWeekdayHeader(day) }}
      </button>
    </div>

    <!-- ← DATUM (zentriert) -->
    <div class="mb-6 text-center">
      <h3 class="text-2xl font-bold">{{ currentDate.toLocaleDateString('de-DE') }}</h3>
    </div>


    <!-- Habit-Eingabe -->
    <div class="mb-6 flex gap-3">
      <input v-model="newHabitName" type="text" placeholder="Neues Habit..."
             class="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2" />
      <button @click="addHabit"
              class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-medium">
        Hinzufügen
      </button>
    </div>

    <ul>
      <li v-for="habit in habitsForDay" :key="habit.id"
          class="p-4 bg-slate-800 rounded-lg mb-2 flex justify-between items-center">
        <!-- Bestehende Habit-Row -->
        <div class="flex-1">
          <h3 class="text-xl font-bold text-white">{{ habit.name }}</h3>
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

