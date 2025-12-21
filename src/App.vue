<script setup lang="ts">
import { RouterView } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import { ref, onMounted, watch } from 'vue'
import HabitTrackerLogo from '@/views/HabitTrackerLogo.vue'

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
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 pt-0">

    <header class="sticky top-0 z-50 bg-transparent h-auto">
      <div class="w-full px-11 py-6 flex justify-between items-start pt-6">

        <div class="flex-shrink-0 -mt-2">
          <HabitTrackerLogo size="lg" />
        </div>

        <div class="pt-2">
          <button
            @click="toggleDarkMode"
            class="p-2 rounded-full bg-slate-200/50 text-slate-800 hover:bg-slate-300 transition-all
                   dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-700 backdrop-blur-sm"
          >
            <svg v-if="!darkMode" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
            </svg>
          </button>
        </div>

      </div>
    </header>

    <main class="w-full">
      <RouterView />
    </main>

    <BottomNav />
  </div>
</template>
