import { createRouter, createWebHistory } from 'vue-router'
import StartView from '../components/startView.vue'
import dashboardView from '../components/dashboardView.vue' //2. path

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: StartView,
    },

    {path: '/dashboard', //view for dashboard
      name: 'dashboard',
      component: dashboardView,
    },
  ],
})

export default router
