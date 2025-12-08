<script setup lang="ts">
import { computed } from 'vue'
import { Calendar } from 'lucide-vue-next'

interface Habit {
  id: number
  name: string
  completed: boolean
  streak: number
  lastCompletedDate: string | null
  createdDate: string
}

const props = defineProps<{
  habits: Habit[]
}>()

const today = new Date().toISOString().split('T')[0]

const days = computed(() => {
  const d = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    d.push(date)
  }
  return d
})

const getCompletionForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]

  if (dateStr === today) {
    const completed = props.habits.filter(h => h.completed).length
    return props.habits.length > 0
      ? (completed / props.habits.length) * 100
      : 0
  }

  const habitsForDate = props.habits.filter(h => {
    const createdDate = new Date(h.createdDate).toISOString().split('T')[0]
    return createdDate <= dateStr
  })

  if (habitsForDate.length === 0) return 0

  const completedOnDate = habitsForDate.filter(
    h => h.lastCompletedDate === dateStr
  ).length

  return (completedOnDate / habitsForDate.length) * 100
}

const getColorClass = (percentage: number) => {
  if (percentage === 0) return 'bg-gray-200'
  if (percentage < 50) return 'bg-red-400'
  if (percentage < 100) return 'bg-yellow-400'
  return 'bg-green-500'
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
    <div class="flex items-center gap-2 mb-4">
      <Calendar class="w-5 h-5 text-orange-600" />
      <h3 class="text-gray-900">7-Tage-Überblick</h3>
    </div>

    <div class="grid grid-cols-7 gap-2">
      <div
        v-for="(date, i) in days"
        :key="i"
        class="text-center"
      >
        <p class="text-xs text-gray-500 mb-2">
          {{ date.toLocaleDateString('de-DE', { weekday: 'short' }) }}
        </p>

        <div
          class="w-full h-12 rounded-lg flex items-center justify-center transition-all"
          :class="[
            getColorClass(getCompletionForDate(date)),
            date.toISOString().split('T')[0] === today
              ? 'ring-2 ring-orange-600 ring-offset-2'
              : ''
          ]"
        >
          <span class="text-xs text-white drop-shadow">
            {{ Math.round(getCompletionForDate(date)) }}%
          </span>
        </div>

        <p class="text-xs text-gray-400 mt-1">
          {{ date.getDate() }}
        </p>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <div class="w-4 h-4 rounded bg-gray-200" />
        <span>0%</span>
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <div class="w-4 h-4 rounded bg-red-400" />
        <span>&lt; 50%</span>
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <div class="w-4 h-4 rounded bg-yellow-400" />
        <span>&lt; 100%</span>
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <div class="w-4 h-4 rounded bg-green-500" />
        <span>100%</span>
      </div>
    </div>
  </div>
</template>
