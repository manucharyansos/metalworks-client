<template>
  <main
    class="mx-auto min-w-0 space-y-4 px-4 py-6 sm:px-6"
    data-engineer-workload
  >
    <OperatorCalendar />
    <notifications />
  </main>
</template>
<script>
import OperatorCalendar from '@/components/engineer/OperatorCalendar.vue'
export default {
  components: { OperatorCalendar },
  layout: 'engineer',
  middleware: ['role-guard'],
  meta: { role: 'engineer' },
}
</script>
