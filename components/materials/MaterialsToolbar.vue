<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Materials</p>
      <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Նյութեր</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Նյութերի ցանկ, չափեր և կատեգորիաներ։</p>
    </div>

    <div class="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
      <div v-if="categories && categories.length" class="relative">
        <button type="button" class="flex w-full min-w-[180px] items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" @click="open = !open">
          <span class="truncate">{{ selectedCategory?.name || 'Բոլոր կատեգորիաները' }}</span>
          <svg class="ml-2 h-3 w-3 shrink-0" viewBox="0 0 10 6"><path stroke="currentColor" stroke-width="2" d="m1 1 4 4 4-4" /></svg>
        </button>
        <div v-if="open" class="absolute right-0 z-20 mt-2 max-h-72 w-full min-w-[220px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <button type="button" class="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" @click="pick(null)">Բոլորը</button>
          <button v-for="c in categories" :key="c.id" type="button" class="mt-1 w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" @click="pick(c)">{{ c.name }}</button>
        </div>
      </div>

      <div class="relative min-w-[260px] flex-1 lg:w-80">
        <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0Z" /></svg>
        <input :value="search" class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" placeholder="Որոնել նյութ..." @input="$emit('update:search', $event.target.value)" />
      </div>

      <button v-if="$can('materials.create')" type="button" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" @click="$emit('create')"><span class="text-lg leading-none">+</span> Նոր նյութ</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    categories: { type: Array, default: () => [] },
    selectedCategory: { type: Object, default: null },
    search: { type: String, default: '' },
  },
  data: () => ({ open: false }),
  methods: {
    pick(c) {
      this.$emit('pick-category', c)
      this.open = false
    },
  },
}
</script>
