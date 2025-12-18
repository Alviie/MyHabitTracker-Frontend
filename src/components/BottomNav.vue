<script setup lang="ts">

</script>

<template>
  <nav class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40
              bg-white/90 backdrop-blur-md dark:bg-slate-800/90
              border border-slate-200/50 dark:border-slate-700/50
              rounded-2xl shadow-2xl px-4 py-3 w-[min(90vw,400px)]">
    <div class="flex justify-around items-center">
      <!-- Home Tab -->
      <router-link to="/" class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all group"
                   :class="{ 'text-emerald-600 dark:text-emerald-400 scale-110': $route.path === '/' }">
        <div class="text-xl group-hover:scale-110 transition-transform">
          📋
        </div>
        <span class="text-xs font-medium">Liste</span>
      </router-link>

      <!-- Heatmap Tab -->
      <router-link to="/heatmap" class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all group"
                   :class="{ 'text-purple-600 dark:text-purple-400 scale-110': $route.path === '/heatmap' }">
        <div class="text-xl group-hover:scale-110 transition-transform">
          🔥
        </div>
        <span class="text-xs font-medium">Heatmap</span>
      </router-link>

      <!-- Stats Tab (zukünftig) -->
      <router-link to="/stats" class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all group opacity-50"
                   :class="{ 'text-blue-600 dark:text-blue-400 scale-110 opacity-100': $route.path === '/stats' }">
        <div class="text-xl group-hover:scale-110 transition-transform">
          📊
        </div>
        <span class="text-xs font-medium">Stats</span>
      </router-link>
    </div>
  </nav>
</template>

