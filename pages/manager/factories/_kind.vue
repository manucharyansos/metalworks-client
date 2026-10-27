<template>
  <FactoryOrdersManager :key="$route.params.kind" :kind="$route.params.kind" />
</template>
<script>
import FactoryOrdersManager from '@/components/manager/FactoryOrdersManager.vue'
import { workshopPageKinds } from '@/utils/workshop-catalog'

export default {
  components: { FactoryOrdersManager },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
  validate: ({ params }) => workshopPageKinds.includes(params.kind),
}
</script>
