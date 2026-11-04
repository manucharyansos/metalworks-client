<template>
  <main class="mx-auto max-w-[1500px] px-4 py-6"><OperatorCalendar /></main>
</template>
<script>
import OperatorCalendar from '@/components/engineer/OperatorCalendar.vue'
export default {
  components: { OperatorCalendar },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
}
</script>
