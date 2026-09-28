<template><FactoryOrdersManager kind="bend" /></template>
<script>
import FactoryOrdersManager from '@/components/manager/FactoryOrdersManager.vue'
export default { name: 'ManagerBendFactoryPage', components: { FactoryOrdersManager }, layout: 'manager', middleware: ['role-guard'], meta: { role: 'manager' } }
</script>
