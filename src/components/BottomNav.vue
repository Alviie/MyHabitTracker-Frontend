<script setup lang="ts">

/**
 * Mobile Navigation: Tabs für Habits, Heatmap, Stats.
 * Fixed bottom, Vue Router Links.
 */

</script>

<template>
  <nav class="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-40
              bg-white backdrop-blur-md dark:bg-slate-800/90
              border border-slate-200/50 dark:border-slate-700/50
              rounded-4xl shadow-2xl px-4 py-4 w-[min(80vw,250px)]">
    <div class="flex justify-around items-center">

      <!-- Home Tab -->
      <router-link to="/" class="flex flex-col items-center gap-1 p-2 rounded-4xl transition-all group text-white"
          :class="$route.path === '/'
            ? 'text-purple-600 dark:text-purple-600 scale-110'
            : 'hover:text-violet-600'">
        <div class="text-xl transition-transform group-hover:scale-110">
          📋
        </div>
        <span class="text-xs font-medium transition-colors group-hover:text-violet-600">
          Liste
        </span>
      </router-link>


      <!-- Heatmap Tab -->
      <router-link to="/heatmap" class="flex flex-col items-center gap-2 p-2 rounded-xl transition-all group text-white"
        :class="$route.path === '/heatmap'
          ? 'text-purple-600 dark:text-purple-600 scale-110'
          : 'hover:text-purple-600'">
        <div class="text-xl transition-transform group-hover:scale-110">
          🔥
        </div>
        <span class="text-xs font-medium transition-colors group-hover:text-purple-600">
        Heatmap
        </span>
      </router-link>


      <!-- Stats Tab (zukünftig) -->
      <router-link to="/stats" class="flex flex-col items-center gap-2 p-2 rounded-xl transition-all group text-white"
        :class="$route.path === '/stats'
          ? 'text-purple-600 dark:text-purple-600 scale-110'
          : 'hover:text-purple-600'">
        <div class="text-xl transition-transform group-hover:scale-110">
          📊
        </div>
        <span class="text-xs font-medium transition-colors group-hover:text-purple-600">
          Stats
        </span>
      </router-link>
    </div>
  </nav>
</template>

