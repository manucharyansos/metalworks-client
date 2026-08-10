<template>
  <div class="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          {{ label }}
        </p>
        <div class="mt-3 flex items-end gap-2">
          <p class="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            {{ value }}
          </p>
          <span v-if="hint" class="mb-1 text-xs font-medium text-slate-400">{{ hint }}</span>
        </div>
        <p v-if="description" class="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {{ description }}
        </p>
      </div>
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" :class="toneClass">
        <span class="text-xs font-black">{{ icon }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: { type: String, required: true },
    value: { type: [Number, String], default: 0 },
    hint: { type: String, default: '' },
    description: { type: String, default: '' },
    icon: { type: String, default: '•' },
    tone: { type: String, default: 'neutral' },
  },
  computed: {
    toneClass() {
      const map = {
        neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
        red: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
        green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
        violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
      }
      return map[this.tone] || map.neutral
    },
  },
}
</script>
