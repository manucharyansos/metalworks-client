<template><FactoryOrdersBoard workspace-type="laser" /></template>
<script>
import FactoryOrdersBoard from '@/components/factory/FactoryOrdersBoard.vue'
export default { name: 'LaserWorkspace', components: { FactoryOrdersBoard }, layout: 'factory', middleware: ['role-guard'], meta: { role: 'laser' } }
</script>
