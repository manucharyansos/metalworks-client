<template>
  <div>Materials</div>
</template>
<script>
export default {
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
}
</script>
