<template><WorkshopCatalogManager categories /></template>
<script>
import WorkshopCatalogManager from '@/components/settings/WorkshopCatalogManager.vue'
export default {
  components: { WorkshopCatalogManager },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
}
</script>
