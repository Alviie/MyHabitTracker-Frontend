<script setup lang="ts">
import { RouterView } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import { ref, onMounted, watch } from 'vue'
import HabitTrackerLogo from '@/views/HabitTrackerLogo.vue'
import { useRouter } from 'vue-router'

// ======================================
// DARK MODE
// ======================================

const darkMode = ref(false)

const applyDarkMode = (value: boolean) => {
  darkMode.value = value
  const html = document.documentElement
  if (value) {
    html.classList.add('dark')
    html.classList.remove('light')
  } else {
    html.classList.add('light')
    html.classList.remove('dark')
  }
}

const toggleDarkMode = () => {
  applyDarkMode(!darkMode.value)
}

onMounted(() => {
  const saved = localStorage.getItem('darkMode')
  if (saved !== null) {
    applyDarkMode(saved === 'true')
  } else {
    applyDarkMode(false)
  }
})

watch(darkMode, (v) => {
  localStorage.setItem('darkMode', String(v))
})

// ======================================
// LOGOUT
// ======================================
const router = useRouter()

const logout = () => {
  localStorage.removeItem('userId')
  router.push('/login')
}

</script>

<template>
  <div class="bg-slate-150 dark:bg-slate-950 pt-0">

    <header class="sticky top-0 z-50 pt-4 px-4 lg:px-11">
      <div
        :class="[
          'flex justify-between items-center px-6 py-4 transition-all',
          $route.path !== '/login'
            ? 'bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-2xl shadow-sm'
            : 'bg-transparent border-none shadow-none'
        ]"
      >

        <div v-if="$route.path !== '/login'" class="flex-shrink-0 -mt-2">
          <HabitTrackerLogo size="lg" />
        </div>

        <div v-else class="flex-1"></div>

        <div class="pt-2 flex items-center gap-2">
          <button
            @click="toggleDarkMode"
            class="p-2 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 shadow-md backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform"
          >
            <svg v-if="!darkMode" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
            </svg>
          </button>

          <button
            v-if="$route.path !== '/login'"
            @click="logout"
            class="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-all font-medium"
          >
            Logout
          </button>
        </div>

      </div>
    </header>

    <main class="w-full">
      <RouterView />
    </main>

    <BottomNav v-if="$route.path !== '/login'" />
  </div>
</template>
