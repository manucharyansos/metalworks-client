<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="flex items-center gap-2">
      <h1 class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Հաճախորդներ</h1>
      <InfoTooltip>Որոնեք, դիտեք և կառավարեք հաճախորդների տվյալները։</InfoTooltip>
    </div>
    <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
      <div class="relative w-full sm:w-80">
        <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0Z" /></svg>
        <input
          :value="search"
          type="text"
          placeholder="Որոնել հաճախորդ..."
          class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          @input="$emit('update:search', $event.target.value)"
        />
      </div>
      <button
        v-if="$can('clients.create')"
        type="button"
        class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        @click="$emit('create')"
      >
        <span class="text-lg leading-none">+</span> Նոր հաճախորդ
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: { search: { type: String, default: '' } },
}
</script>
