<template><div /></template>
<script>
export default {
  layout: 'admin',
  middleware: [
    'role-guard',
    ({ redirect, app }) => redirect(app.localePath('/admin/file-extension')),
  ],
  meta: { role: 'admin' },
}
</script>
