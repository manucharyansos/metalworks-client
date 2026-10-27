<template>
  <FactoryOrdersBoard :key="$route.params.kind" />
</template>
<script>
import FactoryOrdersBoard from '@/components/factory/FactoryOrdersBoard.vue'
import { workshopPageKinds } from '@/utils/workshop-catalog'

export default {
  components: { FactoryOrdersBoard },
  layout: 'factory',
  middleware: ['workshop-workspace'],
  validate: ({ params }) => workshopPageKinds.includes(params.kind),
}
</script>
