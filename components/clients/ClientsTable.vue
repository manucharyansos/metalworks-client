<template>
  <div class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div v-if="loading" class="flex min-h-[260px] items-center justify-center text-sm font-semibold text-slate-400">
      <span class="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700 dark:border-slate-700 dark:border-t-white"></span>
      Բեռնվում է...
    </div>

    <div v-else-if="!rows.length" class="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">0</div>
      <p class="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Հաճախորդ չի գտնվել</p>
      <p class="mt-1 text-xs text-slate-400">Փոխեք որոնումը կամ ստեղծեք նոր հաճախորդ։</p>
    </div>

    <template v-else>
      <div class="hidden overflow-x-auto md:block">
        <table class="w-full min-w-[850px] text-left">
          <thead class="bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-950/40">
            <tr>
              <th class="px-6 py-3.5">Հաճախորդ</th>
              <th class="px-4 py-3.5">Հեռախոս</th>
              <th class="px-4 py-3.5">Հասցե</th>
              <th class="px-4 py-3.5">Տեսակ</th>
              <th v-if="$canAny(['clients.update', 'clients.delete'])" class="px-6 py-3.5 text-right">Գործողություններ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="c in rows" :key="c.id" class="transition hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ initials(c.name) }}</div>
                  <div class="min-w-0"><p class="truncate text-sm font-bold text-slate-900 dark:text-white">{{ c.name || '—' }}</p><p class="mt-0.5 truncate text-[10px] text-slate-400">{{ c.user?.email || 'Email նշված չէ' }}</p></div>
                </div>
              </td>
              <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{{ c.phone || '—' }}</td>
              <td class="max-w-xs px-4 py-4 text-xs text-slate-500 dark:text-slate-400"><span class="block truncate">{{ c.address || '—' }}</span></td>
              <td class="px-4 py-4">
                <span class="rounded-full px-2.5 py-1 text-[10px] font-bold" :class="c.type === 'legalEntity' ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/35 dark:text-violet-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300'">{{ c.type === 'legalEntity' ? 'Իրավաբանական անձ' : 'Ֆիզ․ անձ' }}</span>
              </td>
              <td v-if="$canAny(['clients.update', 'clients.delete'])" class="px-6 py-4 text-right whitespace-nowrap">
                <button v-if="$can('clients.update')" type="button" class="mr-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="$emit('edit', c)">Խմբագրել</button>
                <button v-if="$can('clients.delete')" type="button" class="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/20" :disabled="submitting" @click="$emit('delete', c)">Ջնջել</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="space-y-3 p-4 md:hidden">
        <article v-for="c in rows" :key="c.id" class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ initials(c.name) }}</div>
            <div class="min-w-0 flex-1"><p class="truncate text-sm font-bold text-slate-900 dark:text-white">{{ c.name || '—' }}</p><p class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{{ c.phone || 'Հեռախոս նշված չէ' }}</p></div>
            <span class="shrink-0 rounded-full px-2 py-1 text-[9px] font-bold" :class="c.type === 'legalEntity' ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-700'">{{ c.type === 'legalEntity' ? 'Իրավ.' : 'Ֆիզ.' }}</span>
          </div>
          <p class="mt-3 truncate text-xs text-slate-400">{{ c.address || 'Հասցե նշված չէ' }}</p>
          <div v-if="$canAny(['clients.update', 'clients.delete'])" class="mt-4 flex justify-end gap-2">
            <button v-if="$can('clients.update')" class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300" @click="$emit('edit', c)">Խմբագրել</button>
            <button v-if="$can('clients.delete')" class="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 dark:border-rose-900/60 dark:text-rose-300" :disabled="submitting" @click="$emit('delete', c)">Ջնջել</button>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    rows: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    submitting: { type: Boolean, default: false },
  },
  methods: {
    initials(name) {
      return String(name || '?').split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')
    },
  },
}
</script>
