<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import axios from 'axios'
import { FwbButton } from 'flowbite-vue'

// ======================================
// DATENMODELL
// ======================================

// Typ für Habit (alle Felder inkl. neue Attribute)
interface Habit {
  id: number
  name: string
  completed: boolean
  streakCount: number
  lastCompletedDate: string | null
  category: string
  targetAmount: number
  targetUnit: string
  frequency: 'daily' | 'weekly' | 'custom'
  notes: string
  color: string
  icon: string
  completions?: { date: string; completed: boolean }[]
}

// Typ für Habit-Stats
interface HabitStats {
  total: number
  completed: number
  completionRate: number
  longestStreak: number
  avgStreak: number
}

// ======================================
// BACKEND-KOMMUNIKATION
// ======================================

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL
const endpoint = baseURL + '/habits'


// Habits vom Backend laden
const habits = ref<Habit[]>([]) // reaktive Liste, die Backend-Daten speichert, Variable ref aktualisiert Template

onMounted(async () => {
  const saved = localStorage.getItem('darkMode')
  if (saved === 'true') {
    document.documentElement.classList.add('dark')
  }
  const savedDay = localStorage.getItem('selectedDay')
  const savedOffset = localStorage.getItem('weekOffset')
  if (savedDay !== null) selectedDay.value = Number(savedDay)
  if (savedOffset !== null) weekOffset.value = Number(savedOffset)

  try {
    const response = await axios.get(endpoint)
    habits.value = response.data.map((h: any) => ({
      category: '', targetAmount: 0, targetUnit: '', frequency: 'daily',
      notes: '', color: '#22c55e', icon: '', completions: [],
      ...h
    }))

    await Promise.all(
      habits.value.map(async (habit) => {
        try {
          const compResponse = await axios.get(
            `${endpoint}/${habit.id}/completions?daysBack=90`
          )
          habit.completions = compResponse.data
        } catch {
          habit.completions = []
        }
      })
    )


  } catch (err) {
    console.error('Fehler:', err)
  }
})




// Neues Habit hinzufügen und Liste aktualisieren
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

// ======================================
// HABIT BEARBEITEN (MODAL)
// ======================================
const editingHabitId = ref<number | null>(null)
const editHabit = ref<Partial<Habit> | null>(null)
const showEditModal = ref(false)

// Vorgegebene Icons, Farben, Kategorien
const availableIcons = [
  '🏃‍♂️', '🚴‍♂️', '🏋️', '🧘', '🧗‍♂️', '🥗', '🍎', '💧', '🛌', '📚',
  '✏️', '💻', '📱', '📝', '📅', '🧹', '🛒', '💰', '📞', '💌',
  '🎸', '🎨', '🌱', '🌳', '🐕', '😴', '🧴', '👔', '🚿', '🧺'
]
const availableColors = [
  { value: '#10b981', label: 'Grün', class: 'bg-emerald-500' },
  { value: '#3b82f6', label: 'Blau', class: 'bg-blue-500' },
  { value: '#f59e0b', label: 'Orange', class: 'bg-orange-500' },
  { value: '#ec4899', label: 'Rosa', class: 'bg-pink-500' },
  { value: '#8b5cf6', label: 'Violett', class: 'bg-purple-500' },
  { value: '#ef4444', label: 'Rot', class: 'bg-red-500' },
  { value: '#6b7280', label: 'Grau', class: 'bg-gray-500' }
]

const availableCategories = [
  'Sport',
  'Ernährung',
  'Familie',
  'Arbeit',
  'Lernen',
  'Haushalt',
  'Finanzen',
  'Soziales',
  'Hobby',
  'Entspannung'
]

const startEdit = (habit: Habit) => {
  editingHabitId.value = habit.id
  editHabit.value = { ...habit }
  showEditModal.value = true
}

const cancelEdit = () => {
  editingHabitId.value = null
  editHabit.value = null
  showEditModal.value = false
}

const saveEdit = async () => {
  if (!editingHabitId.value || !editHabit.value) return

  const habit = habits.value.find(h => h.id === editingHabitId.value)
  if (!habit) return

  const updated = { ...habit, ...editHabit.value }

  try {
    const response = await axios.put(`${endpoint}/${habit.id}`, updated)
    habits.value = habits.value.map(h =>
      h.id === habit.id ? response.data : h
    )
    editingHabitId.value = null
    editHabit.value = null
    showEditModal.value = false
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Habits:', err)
  }
}


// ======================================
// HABIT LÖSCHEN & STATUS WECHSELN
// ======================================
const deleteHabit = async (id: number) => {
  try {
    await axios.delete(`${endpoint}/${id}`)
    habits.value = habits.value.filter(h => h.id !== id)
  } catch (err) {
    console.error('Fehler beim Löschen des Habits:', err)
  }
}

// ======================================
// FILTER & STATISTIKEN
// ======================================
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

// ======================================
// WOCHEN- & TAG-NAVIGATION
// ======================================


const selectedDay = ref(0)
const weekOffset = ref<number>(0)

const selectDay = (dayIndex: number) => {
  selectedDay.value = dayIndex
  localStorage.setItem('selectedDay', String(dayIndex))
}

const navigateWeek = (direction: number) => {
  weekOffset.value += direction
  localStorage.setItem('weekOffset', String(weekOffset.value))
}


const getMondayOfCurrentWeek = () => {
  const today = new Date()
  const day = today.getDay() // 0 = Sonntag, 1 = Montag, ...
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(today.getFullYear(), today.getMonth(), diff)
}


const currentDate = computed(() => {
  const mondayThisWeek = getMondayOfCurrentWeek()
  const date = new Date(mondayThisWeek)
  date.setDate(mondayThisWeek.getDate() + weekOffset.value * 7 + selectedDay.value)
  return date
})

const formatDate = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const currentDateStr = computed(() => formatDate(currentDate.value))


const getWeekdayHeader = (dayIndex: number) => {
  const mondayThisWeek = getMondayOfCurrentWeek()
  const date = new Date(mondayThisWeek)
  date.setDate(mondayThisWeek.getDate() + weekOffset.value * 7 + dayIndex)
  return date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' })
}

const habitsForDay = computed(() => {
  const dateKey = currentDateStr.value

  const base = habits.value.map(habit => {
    const completedToday = habit.completions?.some(
      c => c.date === dateKey && c.completed
    ) ?? false

    return {
      ...habit,
      completedToday
    }
  })

  switch (filterMode.value) {
    case 'open':
      return base.filter(h => !h.completedToday)
    case 'completed':
      return base.filter(h => h.completedToday)
    default:
      return base
  }
})



// Toggle für spezifischen Tag
const toggleHabit = async (habitId: number) => {
  const dateKey = currentDateStr.value
  const index = habits.value.findIndex(h => h.id === habitId)
  if (index === -1) return

  const habit = habits.value[index]
  if (!habit) return

  // Guard: wenn für diesen Tag schon erledigt, nichts tun
  const alreadyCompletedToday = habit.completions?.some(
    c => c.date === dateKey && c.completed
  ) ?? false
  if (alreadyCompletedToday) return

  try {
    const response = await axios.put(
      `${endpoint}/${habitId}/complete?completed=true&date=${dateKey}`,
      null
    )

    const updatedHabit: Habit = response.data
    habits.value[index] = {
      ...habits.value[index],
      ...updatedHabit
    }

    if (!habits.value[index].completions) {
      habits.value[index].completions = []
    }
    habits.value[index].completions!.push({ date: dateKey, completed: true })

    console.log('toggle for', habitId, 'dateKey', dateKey)

  } catch (err) {
    console.error('Fehler:', err)
  }

}
</script>

<template>
  <div>
    <h2 class="text-5xl font-extrabold light:text-black dark:text-white">Meine Habits</h2>

    <div class="h-24"></div>

    <!-- ====================================== -->
    <!-- FILTER BUTTONS (Alle/Offen/Erledigt) -->
    <!-- ====================================== -->
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

    <div class="h-12"></div>

    <!-- ====================================== -->
    <!-- WOCHEN-NAVIGATION (← Woche →) -->
    <!-- ====================================== -->
    <div class="flex items-center justify-center gap-4 mb-6">
      <button @click="navigateWeek(-1)" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm">
        ← Woche
      </button>
      <span class="font-bold text-lg text-slate-900 dark:text-white">
    Woche {{ weekOffset === 0 ? 'aktuell' : `${Math.abs(weekOffset)} ${weekOffset < 0 ? 'zurück' : 'vor'}` }}
  </span>
      <button @click="navigateWeek(1)" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm">
        Woche →
      </button>
    </div>

    <div class="h-6"></div>

    <!-- ====================================== -->
    <!-- WOCHENTAGE BUTTONS (So Mo Di Mi Do Fr Sa) -->
    <!-- ====================================== -->
    <div class="flex gap-1 mb-6 overflow-x-auto pb-2">
      <button
        v-for="dayIndex in 7"
        :key="dayIndex"
        class="flex-1 min-w-[60px] px-3 py-2 rounded-full text-sm font-medium transition-all"
        :class="selectedDay === (dayIndex - 1)
      ? 'bg-emerald-500 text-white'
      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600'"
        @click="selectDay(dayIndex - 1)"
      >
        {{ getWeekdayHeader(dayIndex - 1) }}
      </button>
    </div>

    <div class="h-6"></div>


    <!-- ====================================== -->
    <!-- AKTUELLES DATUM -->
    <!-- ====================================== -->
    <div class="mb-6 text-center">
      <h3 class="font-bold text-2xl text-black dark:text-white">{{ currentDate.toLocaleDateString('de-DE') }}</h3>
    </div>

    <div class="h-6"></div>

    <!-- ====================================== -->
    <!-- NEUES HABIT HINZUFÜGEN -->
    <!-- ====================================== -->
    <div class="mb-6 flex gap-3">
      <input v-model="newHabitName" type="text" placeholder="Neues Habit..."
             class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800" />
      <button @click="addHabit"
              class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-medium">
        Hinzufügen
      </button>
    </div>

    <!-- ====================================== -->
    <!-- HABITS LISTE (mit Icon, Kategorie-Tag, Buttons) -->
    <!-- ====================================== -->
    <ul>
      <li
        v-for="habit in habitsForDay"
        :key="habit.id"
        class="p-4 bg-white border dark:bg-slate-800 dark:border-slate-700 rounded-lg mb-2 flex justify-between items-center"
      >
        <div class="flex-1">
          <h3 class="text-xl font-bold flex items-center gap-2">
            <span v-if="habit.icon" class="text-lg">{{ habit.icon }}</span>
            <span :style="{ color: habit.color }">{{ habit.name }}</span>
          </h3>

          <!-- Streak Anzeige -->
          <p class="text-emerald-400">
            Streak: {{ habit.streakCount }} 🔥 {{ habit.completed ? '✓' : '' }}
          </p>
          <!-- Kategorie Tag -->
          <div v-if="habit.category" class="mt-1">
            <span class="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
            {{ habit.category }}
            </span>
          </div>
        </div>

        <!-- Buttons: Bearbeiten / Erledigt / Löschen -->
        <div class="flex gap-2">
          <button
            class="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-medium"
            @click="startEdit(habit)"
          >
            Bearbeiten
          </button>
          <button
            class="px-4 py-2 rounded font-medium text-white"
            :class="habit.completedToday ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'"
            @click="toggleHabit(habit.id)"
            :disabled="habit.completedToday"
          >
            {{ habit.completedToday ? 'Erledigt' : 'Erledigen' }}
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

    <!-- ====================================== -->
    <!-- HABITS BEARBEITEN MODAL (Overlay mit Formular) -->
    <!-- ====================================== -->
    <div
      v-if="showEditModal && editHabit"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
        <h3 class="mb-4 text-xl font-bold text-slate-900 dark:text-white">
          Habit bearbeiten
        </h3>

        <!-- Edit Formular (alle Felder) -->
        <div class="space-y-3">
          <input
            v-model="editHabit.name"
            type="text"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            placeholder="Name"
          />

          <!-- Kategorie Dropdown -->
          <div class="space-y-1">
            <label class="text-sm text-slate-600 dark:text-slate-300">Kategorie:</label>
            <select
              v-model="editHabit.category"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            >
              <option value="">Keine Kategorie</option>
              <option v-for="cat in availableCategories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <!-- Ziel (Anzahl + Einheit) -->
          <div class="flex gap-2">
            <input
              v-model.number="editHabit.targetAmount"
              type="number"
              min="0"
              class="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              placeholder="Ziel"
            />
            <input
              v-model="editHabit.targetUnit"
              type="text"
              class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              placeholder="Einheit"
            />
          </div>

          <!-- Frequenz Dropdown -->
          <select
            v-model="editHabit.frequency"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="daily">Täglich</option>
            <option value="weekly">Mehrmals pro Woche</option>
            <option value="custom">Custom</option>
          </select>

          <!-- Farbe Auswahl -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-600 dark:text-slate-300">Farbe:</span>
            <div class="space-y-1">
              <span class="text-sm text-slate-600 dark:text-slate-300">Farbe:</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in availableColors"
                  :key="color.value"
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-lg border-2 text-white shadow-sm transition
                    hover:scale-105 hover:shadow-md"
                  :class="[
                    editHabit.color === color.value
                      ? 'border-emerald-500 ring-2 ring-emerald-500 ring-offset-2'
                      : 'border-slate-300 dark:border-slate-600 hover:border-slate-400',
                    color.class
                   ]"
                  @click="editHabit.color = color.value"
                >
                  <span class="sr-only">{{ color.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Icon Auswahl -->
          <div class="space-y-1">
            <span class="text-sm text-slate-600 dark:text-slate-300">Icon:</span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="icon in availableIcons"
                :key="icon"
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-full border text-xl
             transition
             hover:bg-slate-100 dark:hover:bg-slate-700"
                :class="editHabit.icon === icon
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'border-slate-300 dark:border-slate-600'"
                @click="editHabit.icon = icon"
              >
                {{ icon }}
              </button>
            </div>
          </div>

          <!-- Notizen Textarea -->
          <textarea
            v-model="editHabit.notes"
            rows="3"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            placeholder="Notizen / Beschreibung"
          />
        </div>

        <!-- Modal Buttons -->
        <div class="mt-6 flex justify-end gap-2">
          <button
            class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-slate-800 text-sm font-medium"
            @click="cancelEdit"
          >
            Abbrechen
          </button>
          <button
            class="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium"
            @click="saveEdit"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>


  </div>
</template>


