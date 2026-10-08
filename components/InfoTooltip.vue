<template>
  <span ref="anchor" class="group relative inline-flex shrink-0 align-middle" @mouseenter="updatePosition" @focusin="updatePosition">
    <button
      type="button"
      class="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-black text-slate-500 transition hover:border-slate-300 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white dark:focus:ring-slate-700"
      :aria-label="label || $t('common.info')"
    >
      i
    </button>

    <span
      class="pointer-events-none fixed left-4 top-0 z-50 w-[min(440px,82vw)] -translate-y-1 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-medium leading-5 text-white opacity-0 shadow-2xl transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:bg-white dark:text-slate-950"
      :style="position"
      role="tooltip"
    >
      <slot />
    </span>
  </span>
</template>

<script>
export default {
  name: 'InfoTooltip',
  props: {
    align: { type: String, default: 'left' },
    label: {
      type: String,
      default: '',
    },
  },
  data() { return { position: {} } },
  mounted() {
    this.updatePosition()
    window.addEventListener('resize', this.updatePosition)
    window.addEventListener('scroll', this.updatePosition, true)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updatePosition)
    window.removeEventListener('scroll', this.updatePosition, true)
  },
  methods: {
    updatePosition() {
      if (!this.$refs.anchor) return
      const rect = this.$refs.anchor.getBoundingClientRect()
      const width = Math.min(440, window.innerWidth * 0.82)
      const preferred = this.align === 'right' ? rect.right - width : rect.left
      const left = Math.max(12, Math.min(preferred, window.innerWidth - width - 12))
      this.position = { left: `${left}px`, top: `${rect.bottom + 8}px`, width: `${width}px` }
    },
  },
}
</script>
