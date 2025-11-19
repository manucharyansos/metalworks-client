<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
  >
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ title }}
    </h3>
    <slot />
  </div>
</template>

<script setup>
defineProps({ title: String })
</script>
