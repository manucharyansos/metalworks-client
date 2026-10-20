<template><ProjectFolderSettings /></template>
<script>
import ProjectFolderSettings from '@/components/settings/ProjectFolderSettings.vue'
export default {
  components: { ProjectFolderSettings },
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
}
</script>
