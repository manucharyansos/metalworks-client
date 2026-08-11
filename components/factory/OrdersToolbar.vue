<template>
  <div class="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div class="min-w-0">
        <p class="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Production queue</p>
        <h2 class="mt-1 text-lg font-black text-slate-950 dark:text-white">Արտադրական պատվերներ</h2>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Որոնեք պատվերը և ֆիլտրեք ընթացքի կարգավիճակով։</p>
      </div>

      <div class="relative w-full xl:w-[380px]">
        <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0Z" /></svg>
        <input
          v-model="localSearch"
          type="text"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-slate-600"
          placeholder="Համար, անուն կամ prefix..."
          @input="$emit('update:search', localSearch)"
        />
      </div>
    </div>

    <div v-if="statusOptions.length" class="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
      <span class="mr-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Status</span>
      <button
        v-for="(opt, index) in statusOptions"
        :key="opt.value || index"
        type="button"
        class="rounded-full border px-3 py-1.5 text-[10px] font-bold transition"
        :class="isActive(opt)
          ? 'border-slate-950 bg-slate-950 text-white shadow-sm dark:border-white dark:bg-white dark:text-slate-950'
          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'"
        @click="toggleStatus(opt)"
      >
        {{ opt.label }}
      </button>
      <button
        v-if="selectedStatuses.length"
        type="button"
        class="ml-auto rounded-full px-3 py-1.5 text-[10px] font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/20"
        @click="clearFilters"
      >
        Մաքրել ֆիլտրերը
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrdersToolbar',
  props: {
    search: { type: String, default: '' },
    statusOptions: { type: Array, default: () => [] },
    selectedStatuses: { type: Array, default: () => [] },
  },
  data() {
    return { localSearch: this.search }
  },
  watch: {
    search(val) { this.localSearch = val },
  },
  methods: {
    isActive(opt) { return this.selectedStatuses.includes(opt.value) },
    toggleStatus(opt) {
      const value = opt.value
      const exists = this.selectedStatuses.includes(value)
      const updated = exists
        ? this.selectedStatuses.filter((v) => v !== value)
        : [...this.selectedStatuses, value]
      this.$emit('update:selected-statuses', updated)
    },
    clearFilters() { this.$emit('update:selected-statuses', []) },
  },
}
</script>
