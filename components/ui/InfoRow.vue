<template>
  <div class="flex justify-between items-center py-2 border-b last:border-0">
    <span class="text-sm text-gray-600 dark:text-gray-400">{{ label }}</span>
    <span v-if="badge" class="badge" :class="badge">{{ value }}</span>
    <span v-else class="text-sm font-medium text-gray-900 dark:text-white">{{
      value || '—'
    }}</span>
  </div>
</template>

<script setup>
defineProps({ label: String, value: String, badge: String })
</script>
