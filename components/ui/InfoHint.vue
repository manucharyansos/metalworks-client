<template>
  <span class="group relative inline-flex align-middle">
    <button
      type="button"
      class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-black text-slate-500 transition hover:border-slate-300 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
      :aria-label="label"
    >
      i
    </button>
    <span
      class="pointer-events-none absolute left-0 top-9 z-50 w-[min(440px,82vw)] -translate-y-1 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-medium leading-5 text-white opacity-0 shadow-2xl transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:bg-white dark:text-slate-950"
      role="tooltip"
    >
      {{ text }}
    </span>
  </span>
</template>

<script>
export default {
  name: 'InfoHint',
  props: {
    text: { type: String, required: true },
  },
  computed: {
    label() {
      const locale = String(this.$i18n?.locale || 'hy').toLowerCase().split('-')[0]
      return {
        hy: 'Տեղեկություն',
        ru: 'Информация',
        en: 'Information',
      }[locale] || 'Տեղեկություն'
    },
  },
}
</script>
