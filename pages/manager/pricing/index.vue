<template><PricingSettings /></template>
<script>
import PricingSettings from '@/components/quotes/PricingSettings.vue'
export default {
  components: { PricingSettings },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
}
</script>
