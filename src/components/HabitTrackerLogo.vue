<template>
  <div class="flex items-center gap-3">
    <div class="relative">
      <svg
        :width="currentSize.svg"
        :height="currentSize.svg"
        viewBox="0 0 64 64"
        fill="none"
        class="relative z-10"
      >
        <circle cx="32" cy="34" r="14" fill="#8B4513" />
        <circle cx="22" cy="24" r="6" fill="#8B4513" />
        <circle cx="22" cy="24" r="3.5" fill="#D2691E" />
        <circle cx="42" cy="24" r="6" fill="#8B4513" />
        <circle cx="42" cy="24" r="3.5" fill="#D2691E" />
        <ellipse cx="32" cy="36" rx="8" ry="6" fill="#D2691E" />
        <ellipse cx="32" cy="35" rx="3" ry="2.5" fill="#5D3A1A" />
        <circle cx="27" cy="31" r="2" fill="#2C1810" />
        <circle cx="37" cy="31" r="2" fill="#2C1810" />
        <circle cx="27.5" cy="30.5" r="0.8" fill="white" />
        <circle cx="37.5" cy="30.5" r="0.8" fill="white" />
      </svg>

      <div class="absolute -bottom-1 -right-1 bg-white rounded shadow-md p-1">
        <svg
          :width="currentSize.calendar"
          :height="currentSize.calendar"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8B4513"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="8" y1="14" x2="10" y2="14" />
          <line x1="14" y1="14" x2="16" y2="14" />
          <line x1="8" y1="18" x2="10" y2="18" />
          <line x1="14" y1="18" x2="16" y2="18" />
        </svg>

        <div class="absolute -bottom-0.5 -right-0.5">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path
              d="M 2 8 L 6 12 L 14 3"
              stroke="#22c55e"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <div v-if="showText" class="flex flex-col leading-tight">
      <span :class="currentSize.text + ' tracking-tight'">
        <span class="bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">My</span>
        <span class="bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">
          Habit
        </span>
      </span>
      <span class="bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">Tracker</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  showText: true,
});

const sizes = {
  sm: { text: "text-lg", svg: 40, calendar: 16 },
  md: { text: "text-2xl", svg: 56, calendar: 22 },
  lg: { text: "text-4xl", svg: 80, calendar: 30 },
};

const currentSize = computed(() => sizes[props.size]);
const showText = computed(() => props.showText);
</script>
