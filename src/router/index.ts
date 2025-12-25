// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HabitList from '@/views/HabitList.vue'
import HeatmapOverview from '@/views/HeatmapOverview.vue'
import StatsView from "@/views/StatsView.vue";  // ← FEHLT!
import LoginView from "@/views/LoginView.vue"; //new

const routes = [
  { path: '/login', component: LoginView },
  { path: '/', component: HabitList },
  { path: '/heatmap', component: HeatmapOverview },
  { path: '/stats', component: StatsView }// ← HINZUFÜGEN!
]

//new All
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth-Guard
router.beforeEach((to, from, next) => {
  const publicPages = ['/login']
  const isPublic = publicPages.includes(to.path)
  const hasUser = !!localStorage.getItem('userId')

  if (!isPublic && !hasUser) {
    return next('/login')
  }

  next()
})

export default router
