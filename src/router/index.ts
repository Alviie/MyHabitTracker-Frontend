// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HabitList from '@/views/HabitList.vue'
import HeatmapOverview from '@/views/HeatmapOverview.vue'  // ← FEHLT!

const routes = [
  { path: '/', component: HabitList },
  { path: '/heatmap', component: HeatmapOverview },      // ← HINZUFÜGEN!
]

export default createRouter({
  history: createWebHistory(),
  routes
})
