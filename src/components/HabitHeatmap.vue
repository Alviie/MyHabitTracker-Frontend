
<script setup lang="ts">

import type {Habit} from "@/types/habit.ts";
import {computed} from "vue";

interface Props {
  habit: Habit  // ← Vollständiges Habit-Interface!
}
const props = defineProps<Props>()

const DAYS_BACK = 90

const heatmapData = computed(() => {
  const data: any[] = []
  const today = new Date()

  for (let i = DAYS_BACK - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    // 🔥 ECHTE Backend-Daten!
    const completion = props.habit.completions?.find(c => c.date === dateStr)

    data.push({
      date: dateStr,
      completed: completion?.completed ?? false,
      intensity: completion?.completed ? 1 : 0.3
    })
  }
  return data
})

console.log('completions for habit', props.habit.name, props.habit.completions)

console.log('heatmap full', heatmapData.value)


const completedDays = computed(() =>
  heatmapData.value.filter(d => d.completed).length
)
</script>


<template>
  <!-- REST BLEIBT GLEICH wie vorher -->
  <div class="p-6 bg-white rounded-2xl shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:shadow-2xl transition-all">
    <div class="flex items-center justify-between mb-9">
      <div class="flex items-center gap-4">
        <div v-if="props.habit.icon" class="text-2xl p-4 bg-slate-100 rounded-xl dark:bg-slate-900">
          {{ props.habit.icon }}
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ props.habit.name }}</h3>
          <div class="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span>🟣 {{ completedDays }} / {{ DAYS_BACK }} Tage</span>
            <span>{{ Math.round((completedDays / DAYS_BACK) * 100) }}% Konsistenz</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Heatmap (identisch) -->
    <div class="bg-slate-50 dark:bg-slate-900/30 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
      <div class="grid grid-cols-7 gap-0.5 max-h-80 overflow-y-auto">
        <div
          v-for="day in heatmapData"
          :key="day.date"
          class="relative w-4 h-4 rounded cursor-pointer hover:scale-125 transition-all duration-200 group border border-slate-200/30 dark:border-slate-700/50 shadow-sm"
          :class="day.completed
            ? 'bg-violet-600 shadow-sm shadow-violet-500/20'
            : 'bg-neutral-200 dark:bg-slate-900'"
          :title="`${day.date}: ${day.completed ? '✅ Erledigt' : '❌ Verpasst'}`"
        />
      </div>
    </div>
  </div>
</template>

