<template>
  <span
    class="work-avatar"
    :data-assigned="name ? 'true' : 'false'"
    :data-ring="ring ? 'true' : 'false'"
    aria-hidden="true"
    >{{ initials }}</span
  >
</template>
<script>
export default {
  props: { name: { type: String, default: '' }, ring: Boolean },
  computed: {
    initials() {
      return (
        this.name
          .trim()
          .split(/\s+/u)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => Array.from(part)[0])
          .join('')
          .toUpperCase() || '?'
      )
    },
  },
}
</script>
