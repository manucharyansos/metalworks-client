<template><QuoteInbox /></template>
<script>
import QuoteInbox from '@/components/quotes/QuoteInbox.vue'
export default {
  components: { QuoteInbox },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
}
</script>
