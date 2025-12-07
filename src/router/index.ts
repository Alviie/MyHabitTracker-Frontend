import { createRouter, createWebHistory } from 'vue-router'
import StartView from '../views/startView.vue'
import dashboardView from '../views/dashboardView.vue' //2. path

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
