<template><RegistrationRequests /></template>
<script>
import RegistrationRequests from '~/components/registration/RegistrationRequests.vue'
export default { components: { RegistrationRequests }, layout: 'manager', middleware: ['role-guard'], meta: { role: 'manager' } }
</script>
