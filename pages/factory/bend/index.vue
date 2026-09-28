<template><FactoryOrdersBoard workspace-type="bend" /></template>
<script>
import FactoryOrdersBoard from '@/components/factory/FactoryOrdersBoard.vue'
export default { name: 'BendWorkspace', components: { FactoryOrdersBoard }, layout: 'factory', middleware: ['role-guard'], meta: { role: 'bend' } }
</script>
