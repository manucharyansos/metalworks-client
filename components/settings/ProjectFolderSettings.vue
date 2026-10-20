<template>
  <div data-project-folder-settings>
    <WorkshopCatalogManager categories :title="$t('admin_layout.file_types')" />
    <GlobalFileTypes />
  </div>
</template>
<script>
import WorkshopCatalogManager from '@/components/settings/WorkshopCatalogManager.vue'
import GlobalFileTypes from '@/components/settings/GlobalFileTypes.vue'
export default { components: { WorkshopCatalogManager, GlobalFileTypes } }
</script>
