<script setup>
/**
 * Bär-Logo für die App
 *
 */
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'xl',
    validator: (value) => ['xl', 'lg', 'md', 'sm'].includes(value),
  }
});

const logoClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return { logo: 'w-10 h-10', title: 'text-xl', tracker: 'text-sm' };
    case 'md':
      return { logo: 'w-12 h-12', title: 'text-2xl', tracker: 'text-base' };
    case 'lg':
      return { logo: 'w-22 h-22', title: 'text-3xl', tracker: 'text-lg' };
    case 'xl':
    default:
      return { logo: 'w-25 h-25', title: 'text-4xl', tracker: 'text-xl' };
  }
});
</script>

<template>
  <div class="flex items-center gap-3">

    <img
      src="@/assets/bear.svg"
      alt="Bear Logo"
      :class="[logoClasses.logo]"
    />

    <div class="text-left">
      <h1 :class="[logoClasses.title, 'font-semibold hover:text-black leading-tight']">
        My Habit
      </h1>

      <div :class="[logoClasses.tracker, 'flex items-center gap-3 hover:text-black font-medium']">
        <svg
          :class="[logoClasses.tracker, 'w-6 h-6']"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>

        <span>Tracker</span>
      </div>

    </div>
  </div>
</template>
