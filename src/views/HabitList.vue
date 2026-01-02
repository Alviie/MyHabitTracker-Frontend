<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import axios from 'axios'

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
const userId = localStorage.getItem('userId')

if (!userId) {
  window.location.href = '/login'
}

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
    const response = await axios.get(`${endpoint}?userId=${userId}`)
    habits.value = response.data.map((h: any) => ({
      category: '', targetAmount: 0, targetUnit: '', frequency: 'daily',
      notes: '', color: '#22c55e', icon: '', completions: [],
      ...h
    }))

    await Promise.all(
      habits.value.map(async (habit) => {
        try {
          const compResponse = await axios.get(
            `${endpoint}/${habit.id}/completions?daysBack=90&userId=${userId}`
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
    const response = await axios.post(`${endpoint}?userId=${userId}`, { name: trimmed })
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
    const response = await axios.put(`${endpoint}/${habit.id}?userId=${userId}`, updated)
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
    await axios.delete(`${endpoint}/${id}?userId=${userId}`)
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

const isRealToday = computed(() => { //neu
  const today = new Date()
  return formatDate(today) === currentDateStr.value
})

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
      `${endpoint}/${habitId}/complete?completed=true&date=${dateKey}&userId=${userId}`,
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
  <div class="w-full px-15 py-0 mt-8">

    <div class="px-0 py-0 mb-6 flex gap-2.5">
    <!-- ====================================== -->
    <!-- FILTER BUTTONS (Alle/Offen/Erledigt)   -->
    <!-- ====================================== -->
      <button
        @click="filterMode = 'all'"
        class="px-5 py-2 rounded-lg transition-all font-bold text-medium"
        style="font-family: Arial, sans-serif;"
        :class="filterMode === 'all'
          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl shadow-violet-500/40 scale-105'
          : 'bg-white/90 text-neutral-700 hover:bg-neutral-100 border-2 border-neutral-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'"
      > Alle
      </button>

      <button
        @click="filterMode = 'open'"
        class="px-5 py-2 rounded-lg transition-all font-bold text-medium"
        style="font-family: Arial, sans-serif;"
        :class="filterMode === 'open'
          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
          : 'bg-white text-neutral-700 hover:bg-neutral-100 border-2 border-neutral-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'"
      > Offen
      </button>

      <button
        @click="filterMode = 'completed'"
        class="px-5 py-2 rounded-lg transition-all font-bold text-medium"
        style="font-family: Arial, sans-serif;"
        :class="filterMode === 'completed'
          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 border-2 border-transparent'
          : 'bg-white text-neutral-700 hover:bg-neutral-100 border-2 border-neutral-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'"
      > Erledigt
      </button>

    </div>

    <!-- ====================================== -->
    <!-- WOCHEN-NAVIGATION (← Woche →)          -->
    <!-- ====================================== -->
    <div class="flex items-center justify-center gap-6 mb-4">
      <button @click="navigateWeek(-1)"
              class="px-5 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-500/30 font-medium active:scale-95"
              style="font-family: Arial, sans-serif;">
        ← Woche
      </button>

      <span class="text-slate-700 dark:text-slate-200 font-semibold text-lg tracking-tight"
            style="font-family: Arial, sans-serif;">
        Woche {{ weekOffset === 0 ? 'aktuell' : `${Math.abs(weekOffset)} ${weekOffset < 0 ? 'zurück' : 'vor'}` }}
      </span>

      <button @click="navigateWeek(1)"
              class="px-5 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-500/30 font-medium active:scale-95"
              style="font-family: Arial, sans-serif;">
        Woche →
      </button>
    </div>

    <div class="h-4"></div>

    <!-- ========================================== -->
    <!-- WOCHENTAGE BUTTONS (So Mo Di Mi Do Fr Sa)  -->
    <!-- ========================================== -->
    <div class="grid grid-cols-7 gap-2 mb-6">
      <button
        v-for="dayIndex in 7"
        :key="dayIndex"
        class="py-3 px-1 rounded-xl text-center transition-all text-sm font-semibold tracking-tight outline-none"
        style="font-family: Arial, sans-serif;"
        :class="selectedDay === (dayIndex - 1)
          ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
          : 'bg-white text-neutral-600 border-2 border-neutral-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'"
        @click="selectDay(dayIndex - 1)"
      >
        {{ getWeekdayHeader(dayIndex - 1) }}
      </button>
    </div>

    <div class="h-4"></div>

    <!-- ====================================== -->
    <!-- AKTUELLES DATUM                        -->
    <!-- ====================================== -->
    <div class="text-center">
      <h3 class="text-lg font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight"
          style="font-family: Arial, sans-serif;"
      >{{ currentDate.toLocaleDateString('de-DE') }}</h3>
    </div>

    <div class="h-4"></div>

    <!-- ====================================== -->
    <!-- NEUES HABIT HINZUFÜGEN                 -->
    <!-- ====================================== -->
    <div class="mb-4 flex gap-3">
      <input v-model="newHabitName" type="text" placeholder="Neues Habit..."
             class="flex-1 px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-neutral-900 placeholder:text-neutral-400 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
             style="font-family: Arial, sans-serif;"
      />

      <button @click="addHabit"
              class="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-semibold tracking-tight transition-all shadow-lg shadow-violet-500/30 active:scale-95"
              style="font-family: Arial, sans-serif;"
      > Hinzufügen
      </button>
    </div>

    <div class="h-5"></div>

    <!-- ====================================== -->
    <!-- HABITS LISTE (mit Icon, Kategorie-Tag, Buttons) -->
    <!-- ====================================== -->
    <ul class="space-y-4" style="font-family: Arial, sans-serif;">
      <li
        v-for="habit in habitsForDay"
        :key="habit.id"
        class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-neutral-200 dark:border-slate-700 hover:shadow-md transition-all flex justify-between items-center"
      >
        <div class="flex items-center gap-3">
          <span v-if="habit.icon" class="text-2xl">{{ habit.icon }}</span>

          <div>
            <div class="text-lg text-neutral-800 dark:text-white" :style="{ color: habit.color }">
              {{ habit.name }}
            </div>

            <div class="flex items-center gap-3 mt-1">

          <span class="text-sm text-green-600 font-medium">
            Streak: {{ habit.streakCount }} 🔥
          </span>
              <span v-if="habit.completedToday" class="text-violet-600 font-bold text-medium"
              >✓
              </span>

              <span
                v-if="habit.category"
                class="px-2.5 py-0.5 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 dark:from-slate-700 dark:to-slate-600 dark:text-violet-200 text-xs rounded-full border border-violet-200 dark:border-slate-500"
              >
            {{ habit.category }}
          </span>
            </div>
          </div>
        </div>

        <!-- Buttons: Bearbeiten / Erledigt / Löschen -->
        <div class="flex gap-2">

          <button
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            :class="!isRealToday
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
              : 'bg-neutral-300 hover:bg-neutral-200 text-neutral-700'"
            @click="isRealToday ? startEdit(habit) : null"
            :disabled="!isRealToday"
          >
            Bearbeiten
          </button>

          <button
            class="px-4 py-2 rounded-xl font-medium text-white"
            :class="habit.completedToday || !isRealToday
              ? 'bg-slate-500 shadow-none opacity-80 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-violet-500/20'"
            @click="toggleHabit(habit.id)"
            :disabled="habit.completedToday || !isRealToday"
          >
            {{ habit.completedToday ? 'Erledigt' : (!isRealToday ? 'Gesperrt' : 'Erledigen') }}
          </button>

          <button
            class="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-rose-500/20"
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


