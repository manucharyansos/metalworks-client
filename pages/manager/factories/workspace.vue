<template><FactoryOrdersManager kind="all" /></template>
<script>
import FactoryOrdersManager from '@/components/manager/FactoryOrdersManager.vue'
export default {
  components: { FactoryOrdersManager },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
}
</script>
