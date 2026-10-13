<template>
  <ProductionOrderDetailsPanel
    :details="details"
    :preview-url="dxfUrl"
    mode="factory"
    @view-file="handleViewFile"
    @download-file="handleDownloadFile"
    @close-preview="handleClosePreview"
    @updated="$emit('updated', $event)"
  />
</template>

<script>
import ProductionOrderDetailsPanel from '@/components/factory/ProductionOrderDetailsPanel.vue'

export default {
  name: 'FactoryOrderDetailsPanel',
  components: { ProductionOrderDetailsPanel },
  props: {
    details: { type: Object, required: true },
    dxfUrl: { type: String, default: '' },
  },
  methods: {
    handleViewFile(file) {
      const revision =
        file?.task_file_revision_id || file?.pivot?.task_file_revision_id
      const url =
        revision && this.$getPmpFileUrl ? this.$getPmpFileUrl(file) : null
      this.$emit(
        'view-file',
        url
          ? `${url}${
              url.includes('?') ? '&' : '?'
            }filename=${encodeURIComponent(file.original_name)}`
          : file && file.path
          ? file.path
          : file
      )
    },
    handleDownloadFile(file) {
      this.$emit('download-file', file)
    },
    handleClosePreview() {
      this.$emit('close-dxf')
    },
  },
}
</script>
