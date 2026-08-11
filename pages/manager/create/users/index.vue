<template>
  <div class="min-h-[40vh]"></div>
</template>

<script>
export default {
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
  mounted() {
    this.$router.replace(this.localePath('/manager/clients') + '?create=1')
  },
}
</script>
