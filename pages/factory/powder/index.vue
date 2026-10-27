<template><FactoryOrdersBoard workspace-type="powder" /></template>
<script>
import FactoryOrdersBoard from '@/components/factory/FactoryOrdersBoard.vue'
export default {
  name: 'PowderWorkspace',
  components: { FactoryOrdersBoard },
  layout: 'factory',
  middleware: ['workshop-workspace'],
  meta: { workshopKind: 'powder' },
}
</script>
