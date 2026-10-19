<template><WorkshopCatalogManager /></template>
<script>
import WorkshopCatalogManager from '@/components/settings/WorkshopCatalogManager.vue'
export default {
  components: { WorkshopCatalogManager },
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
}
</script>
