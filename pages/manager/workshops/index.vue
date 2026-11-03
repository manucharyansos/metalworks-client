<template>
  <div>
    <WorkshopCatalogManager />
    <ProjectFolderSettings />
  </div>
</template>
<script>
import ProjectFolderSettings from '@/components/settings/ProjectFolderSettings.vue'
import WorkshopCatalogManager from '@/components/settings/WorkshopCatalogManager.vue'
export default {
  components: { WorkshopCatalogManager, ProjectFolderSettings },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
}
</script>
