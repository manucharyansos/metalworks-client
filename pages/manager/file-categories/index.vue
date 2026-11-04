<template><ProjectFolderSettings /></template>
<script>
import ProjectFolderSettings from '@/components/settings/ProjectFolderSettings.vue'
export default {
  components: { ProjectFolderSettings },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
}
</script>
