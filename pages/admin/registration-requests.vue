<template><RegistrationRequests /></template>
<script>
import RegistrationRequests from '~/components/registration/RegistrationRequests.vue'
export default { components: { RegistrationRequests }, layout: 'admin', middleware: ['role-guard'], meta: { role: 'admin' } }
</script>
