<template>
  <div class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div v-if="!items || !items.length" class="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">0</div>
      <p class="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Նյութ չի գտնվել</p>
      <p class="mt-1 text-xs text-slate-400">Փոխեք որոնումը կամ ավելացրեք նոր նյութ։</p>
    </div>

    <template v-else>
      <div class="hidden overflow-x-auto md:block">
        <table class="min-w-full text-left">
          <thead class="bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-950/40">
            <tr>
              <th class="px-6 py-3.5">Նկարագրություն</th><th class="px-4 py-3.5">Լայն</th><th class="px-4 py-3.5">Երկար</th><th class="px-4 py-3.5">Բարձր</th><th class="px-4 py-3.5">Հաստ</th><th v-if="$canAny(['materials.update', 'materials.delete'])" class="px-6 py-3.5 text-right">Գործողություններ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="m in items" :key="m.id" class="transition hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
              <td class="max-w-sm px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-100"><span class="block truncate">{{ m.description || '—' }}</span></td>
              <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{{ m.width ?? '—' }}</td>
              <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{{ m.length ?? '—' }}</td>
              <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{{ m.height ?? '—' }}</td>
              <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{{ m.thickness ?? '—' }}</td>
              <td v-if="$canAny(['materials.update', 'materials.delete'])" class="px-6 py-4 text-right whitespace-nowrap">
                <button v-if="$can('materials.update')" type="button" class="mr-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="$emit('edit', m)">Խմբագրել</button>
                <button v-if="$can('materials.delete')" type="button" class="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/20" @click="$emit('remove', m)">Ջնջել</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="space-y-3 p-4 md:hidden">
        <article v-for="m in items" :key="m.id" class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p class="truncate text-sm font-bold text-slate-900 dark:text-white">{{ m.description || '—' }}</p>
          <div class="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Լայն՝ <b>{{ m.width ?? '—' }}</b></span><span>Երկար՝ <b>{{ m.length ?? '—' }}</b></span><span>Բարձր՝ <b>{{ m.height ?? '—' }}</b></span><span>Հաստ՝ <b>{{ m.thickness ?? '—' }}</b></span>
          </div>
          <div v-if="$canAny(['materials.update', 'materials.delete'])" class="mt-4 flex justify-end gap-2">
            <button v-if="$can('materials.update')" class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300" @click="$emit('edit', m)">Խմբագրել</button>
            <button v-if="$can('materials.delete')" class="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 dark:border-rose-900/60 dark:text-rose-300" @click="$emit('remove', m)">Ջնջել</button>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>

<script>
export default { props: { items: { type: Array, default: () => [] } } }
</script>
