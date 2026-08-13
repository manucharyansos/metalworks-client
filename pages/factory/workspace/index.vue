<template>
  <FactoryOrdersBoard />
</template>

<script>
import FactoryOrdersBoard from '@/components/factory/FactoryOrdersBoard.vue'

export default {
  name: 'GenericFactoryWorkspace',
  components: { FactoryOrdersBoard },
  layout: 'factory',
}
</script>
