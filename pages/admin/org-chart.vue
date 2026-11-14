<template><OrgChart /></template>
<script>
import OrgChart from '~/components/staff/OrgChart.vue'
export default {
  components: { OrgChart },
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
}
</script>
