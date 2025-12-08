<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import HabitTrackerLogo from '@/components/HabitTrackerLogo.vue'
import AddHabitForm from '@/components/addHabitForm.vue'
import FilterBar from '@/components/FilterBar.vue'
import HabitList from '@/components/HabitList.vue'
import CalendarWidget from '@/components/CalenderWidget.vue'

/* TYPES*/
type FilterType = 'all' | 'active' | 'completed'

interface Habit {
  id: number
  name: string
  completed: boolean
  streak: number
  lastCompletedDate: string | null
  createdDate: string
}

/*ROUTER*/
const router = useRouter()
const goBack = () => router.push('/') // Ini akan kembali ke StartView

/*STATE*/
const habits = ref<Habit[]>([])
const filter = ref<FilterType>('all')

/*BACKEND CONFIG*/
const baseURL = import.meta.env.VITE_BACKEND_BASE_URL
const endpoint = baseURL + '/habits'

/*BACKEND: GET all habits*/
onMounted(async () => {
  try {
    const res = await axios.get(endpoint)
    habits.value = res.data
  } catch (err) {
    console.error("Fehler beim Laden:", err)
  }
})

/*ADD HABIT*/
const addHabit = async (name: string) => {
  try {
    const res = await axios.post(endpoint, { name })
    habits.value.push(res.data)
  } catch (err) {
    console.error("Fehler beim Hinzufügen:", err)
  }
}

/* TOGGLE HABIT*/
const toggleHabit = async (id: number) => {
  const h = habits.value.find(x => x.id === id)
  if (!h) return

  h.completed = !h.completed

  try {
    await axios.patch(`${endpoint}/${id}/toggle`)
  } catch (err) {
    console.error("Fehler beim Toggle:", err)
  }
}

/*DELETE HABIT*/
const deleteHabit = async (id: number) => {
  habits.value = habits.value.filter(h => h.id !== id)

  try {
    await axios.delete(`${endpoint}/${id}`)
  } catch (err) {
    console.error("Fehler beim Löschen:", err)
  }
}

/* FILTERED HABITS */
const filteredHabits = computed(() => {
  if (filter.value === 'active') return habits.value.filter(h => !h.completed)
  if (filter.value === 'completed') return habits.value.filter(h => h.completed)
  return habits.value
})

/* Today Progress */
const completedCount = computed(
  () => habits.value.filter(h => h.completed).length
)

const totalCount = computed(() => habits.value.length)

const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return (completedCount.value / totalCount.value) * 100
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 app-font">

    <header class="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div class=" lg:px-4 flex items-center gap-6">

        <button
          @click="goBack"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-50"
        >
          <span class="text-gray-600 text-3xl"> ← </span>
        </button>

        <HabitTrackerLogo size="md" />
      </div>
    </header>

    <main
      class="max-w-3xl mx-auto px-4 py-8 space-y-8
         lg:max-w-full lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0 lg:px-8 lg:w-full"
    >

      <div class="lg:col-span-2 space-y-8">

        <AddHabitForm @add="addHabit" />

        <div
          v-if="totalCount > 0"
          class="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 mb-1">Today's Progress</p>
              <p class="text-gray-900">
                {{ completedCount }} von {{ totalCount }} erledigt
              </p>
            </div>
            <div class="text-3xl">
              {{ completedCount === totalCount && totalCount > 0 ? '🎉' : '💪' }}
            </div>
          </div>

          <div class="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              class="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-500"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <FilterBar
            :currentFilter="filter"
            @change="filter = $event"
          />

          <HabitList
            :habits="filteredHabits"
            @toggle="toggleHabit"
            @delete="deleteHabit"
          />
        </div>
      </div>

      <div class="lg:col-span-1">
        <CalendarWidget
          v-if="habits.length > 0"
          :habits="habits"
        />
      </div>

    </main>
  </div>
</template>
