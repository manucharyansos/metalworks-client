<template>
  <span
    class="inline-flex items-start gap-2 text-xs font-semibold leading-5"
    :class="toneClass"
    data-task-deadline
  >
    <svg
      class="mt-0.5 h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke-width="1.7" />
      <path d="M12 7v5l3 2" stroke-width="1.7" stroke-linecap="round" />
    </svg>
    <span>{{ presentation.label }}</span>
  </span>
</template>
<script>
import { taskDeadline } from '@/utils/task-deadline'
export default {
  props: {
    value: { type: String, default: '' },
    completed: Boolean,
    rejected: Boolean,
  },
  computed: {
    presentation() {
      return taskDeadline(this.value, {
        completed: this.completed,
        rejected: this.rejected,
        locale: this.$i18n?.locale,
      })
    },
    toneClass() {
      return {
        red: 'text-rose-600 dark:text-rose-300',
        amber: 'text-amber-600 dark:text-amber-300',
        green: 'text-emerald-600 dark:text-emerald-300',
        neutral: 'text-slate-600 dark:text-slate-300',
      }[this.presentation.tone]
    },
  },
}
</script>
