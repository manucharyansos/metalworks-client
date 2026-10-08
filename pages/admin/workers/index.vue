<template><Workers /></template>
<script>
import Workers from '~/pages/manager/workers/index.vue'
export default { components: { Workers }, layout: 'admin', middleware: ['role-guard'], meta: { role: 'admin' } }
</script>
