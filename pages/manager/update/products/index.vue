<template>
  <div>
    products
  </div>
</template>
<script>
export default {
  layout: 'ManagerLayout',
  middleware: ['manager', 'roleRedirect'],
}
</script>
