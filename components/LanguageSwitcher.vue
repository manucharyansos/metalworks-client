<template>
  <div class="inline-flex gap-2">
    <NuxtLink
      v-for="l in locales"
      :key="l.code"
      :to="toLocale(l.code)"
      class="px-3 py-1 rounded hover:bg-neutral-100"
    >
      {{ l.name }}
    </NuxtLink>
  </div>
</template>

<script>
export default {
  computed: {
    locales() {
      return [
        { code: 'hy', name: 'Հայ' },
        { code: 'ru', name: 'Рус' },
        { code: 'en', name: 'EN' },
      ]
    },
  },
  methods: {
    toLocale(code) {
      const routeLike = {
        name: this.$route.name,
        params: this.$route.params,
        query: this.$route.query,
      }
      return this.$i18n.localePath(routeLike, code)
    },
  },
}
</script>
