<template>
  <div class="flex aspect-square h-full w-full items-center justify-center overflow-hidden" :aria-label="brand.name">
    <img v-if="url && !failed" :src="url" :alt="brand.name" width="224" height="224" class="h-full w-full object-contain" @error="failed = true" />
    <span v-else class="px-2 text-center text-2xl font-black text-slate-600 dark:text-slate-300" role="img" :aria-label="brand.name">{{ initials }}</span>
  </div>
</template>

<script>
import metalworksLogo from '~/static/logo.png'
import { resolveBrandLogo } from '~/utils/brand-logo'

export default {
  name: 'WorkspaceLogo',
  props: { brand: { type: Object, required: true } },
  data() { return { failed: false } },
  computed: {
    url() { return resolveBrandLogo(this.brand, this.$router?.options?.base, this.$axios?.defaults?.baseURL, metalworksLogo) },
    initials() { return String(this.brand.name || '').trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() },
  },
  watch: { url() { this.failed = false } },
}
</script>
