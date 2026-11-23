<template><QuoteInbox /></template>
<script>
import QuoteInbox from '@/components/quotes/QuoteInbox.vue'
export default {
  components: { QuoteInbox },
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
}
</script>
