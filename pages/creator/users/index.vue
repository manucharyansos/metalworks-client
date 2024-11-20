<template>
  <div>Users</div>
</template>
<script>
export default {
  layout: 'creatorLayout',
  middleware: ['creator', 'roleRedirect'],
}
</script>
