<template>
  <ProductionOrderDetailsPanel
    :details="details"
    :preview-url="dxfUrl"
    mode="factory"
    @view-file="handleViewFile"
    @download-file="handleDownloadFile"
    @close-preview="handleClosePreview"
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
      this.$emit('view-file', file && file.path ? file.path : file)
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
