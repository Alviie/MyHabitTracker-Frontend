import { createRouter, createWebHistory } from 'vue-router'
import HabitList from '@/views/HabitList.vue'
import HeatmapOverview from '@/views/HeatmapOverview.vue'
import StatsView from "@/views/StatsView.vue";
import LoginView from "@/views/LoginView.vue";

const routes = [
  { path: '/login', component: LoginView },
  { path: '/', component: HabitList },
  { path: '/heatmap', component: HeatmapOverview },
  { path: '/stats', component: StatsView }
]

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
