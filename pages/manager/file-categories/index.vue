<template><div /></template>
<script>
export default {
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
  asyncData({ app, redirect }) {
    return redirect(app.localePath('/manager/workshops'))
  },
}
</script>
