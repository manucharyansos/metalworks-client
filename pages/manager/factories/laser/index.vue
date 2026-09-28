<template><FactoryOrdersManager kind="laser" /></template>
<script>
import FactoryOrdersManager from '@/components/manager/FactoryOrdersManager.vue'
export default { name: 'ManagerLaserFactoryPage', components: { FactoryOrdersManager }, layout: 'manager', middleware: ['role-guard'], meta: { role: 'manager' } }
</script>
