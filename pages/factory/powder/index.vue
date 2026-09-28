<template><FactoryOrdersBoard workspace-type="powder" /></template>
<script>
import FactoryOrdersBoard from '@/components/factory/FactoryOrdersBoard.vue'
export default { name: 'PowderWorkspace', components: { FactoryOrdersBoard }, layout: 'factory', middleware: ['role-guard'], meta: { role: 'powder_catting' } }
</script>
