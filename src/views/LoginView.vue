<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import HabitTrackerLogo from './HabitTrackerLogo.vue'

const router = useRouter()

const mode = ref<'login' | 'register' | 'reset'>('login')
const email = ref('')
const password = ref('')
const newPassword = ref('')
const error = ref<string | null>(null)

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL

const doLogin = async () => {
  error.value = null
  try {
    const res = await axios.post(`${baseURL}/auth/login`, {
      email: email.value,
      password: password.value,
    })
    localStorage.setItem('userId', String(res.data.userId))
    localStorage.setItem('userEmail', res.data.email)
    router.push('/')        // deine bisherige Startseite
  } catch (e: any) {
    error.value = 'Login fehlgeschlagen'
  }
}

const doRegister = async () => {
  error.value = null
  try {
    const res = await axios.post(`${baseURL}/auth/register`, {
      email: email.value,
      password: password.value,
    })
    localStorage.setItem('userId', String(res.data.userId))
    localStorage.setItem('userEmail', res.data.email)
    router.push('/')
  } catch (e: any) {
    error.value = 'Registrierung fehlgeschlagen'
  }
}

const doReset = async () => {
  error.value = null
  try {
    await axios.post(`${baseURL}/auth/reset-password`, {
      email: email.value,
      newPassword: newPassword.value,
    })
    mode.value = 'login'
  } catch (e: any) {
    error.value = 'Passwort-Reset fehlgeschlagen'
  }
}
</script>

<template>
  <div class="w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">

    <div class="justify-center px-160 py-20">
      <HabitTrackerLogo size="lg" />
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-xl">
      <div class="flex gap-1 mb-8 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
        <button
          class="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
          :class="mode === 'login'
            ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'"
          @click="mode = 'login'"
        >Login</button>

        <button
          class="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
          :class="mode === 'register'
            ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'"
          @click="mode = 'register'"
        >Registrieren</button>

        <button
          class="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
          :class="mode === 'reset'
            ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'"
          @click="mode = 'reset'"
        >Passwort?</button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase ml-1 mb-1">E-Mail Adresse</label>
          <input
            v-model="email"
            type="email"
            placeholder="name@gmail.com"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-violet-500 outline-none transition-all dark:text-white"
          />
        </div>

        <div v-if="mode !== 'reset'">
          <label class="block text-xs font-semibold text-slate-500 uppercase ml-1 mb-1">Passwort</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-violet-500 outline-none transition-all dark:text-white"
          />
        </div>

        <div v-if="mode === 'reset'">
          <label class="block text-xs font-semibold text-slate-500 uppercase ml-1 mb-1">Neues Passwort</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-violet-500 outline-none transition-all dark:text-white"
          />
        </div>

        <p v-if="error" class="text-sm text-center text-red-500 font-medium bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">
          {{ error }}
        </p>

        <button
          @click="mode === 'login' ? doLogin() : mode === 'register' ? doRegister() : doReset()"
          class="w-full mt-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-200 dark:shadow-none transition-all active:scale-[0.98]"
        >
          {{ mode === 'login' ? 'einloggen' : mode === 'register' ? 'Konto erstellen' : 'Passwort zurücksetzen' }}
        </button>
      </div>
    </div>
  </div>
</template>
