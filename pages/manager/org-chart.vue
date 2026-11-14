<template><OrgChart /></template>
<script>
import OrgChart from '~/components/staff/OrgChart.vue'
export default {
  components: { OrgChart },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
}
</script>
