<template><PricingSettings /></template>
<script>
import PricingSettings from '@/components/quotes/PricingSettings.vue'
export default {
  components: { PricingSettings },
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
}
</script>
