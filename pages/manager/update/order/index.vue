<template>
  <div>Orders</div>
</template>
<script>
export default {
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
}
</script>
