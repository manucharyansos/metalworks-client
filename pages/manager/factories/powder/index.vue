<template><FactoryOrdersManager kind="powder" /></template>
<script>
import FactoryOrdersManager from '@/components/manager/FactoryOrdersManager.vue'
export default { name: 'ManagerPowderFactoryPage', components: { FactoryOrdersManager }, layout: 'manager', middleware: ['role-guard'], meta: { role: 'manager' } }
</script>
