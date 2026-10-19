<template>
  <article
    data-engineer-task-card
    class="group flex h-full min-w-0 flex-col rounded-2xl border bg-white p-4 text-sm shadow-sm transition hover:shadow-lg dark:bg-slate-900"
    :class="cardBorderClass"
  >
    <header class="min-w-0">
      <p
        class="break-words text-[10px] font-bold uppercase tracking-wide text-slate-400"
      >
        {{ order.order_number?.number || `#${order.id}` }} ·
        {{ order.prefix_code?.code || '—' }}
      </p>
      <h3
        class="mt-1 break-words text-base font-black text-slate-900 dark:text-white"
      >
        {{ order.name || 'Առաջադրանք' }}
      </h3>
      <span
        class="mt-2 inline-block max-w-full rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
        :class="overallStatusClass"
        data-task-stage-label
        >{{ overallStatusText }}</span
      >
    </header>
    <p
      class="mt-3 min-h-[40px] break-words text-xs leading-5 text-slate-500 line-clamp-2 dark:text-slate-400"
      :title="order.description"
    >
      {{ order.description || '—' }}
    </p>

    <div class="mt-4 space-y-2" data-workshop-summaries>
      <section
        v-for="step in steps"
        :key="step.id || step.factory_id"
        class="min-w-0 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h4
            class="min-w-0 break-words text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            {{ step.factory?.name || '—' }}
          </h4>
          <span
            class="rounded-full px-2 py-1 text-[10px] font-semibold"
            :class="stepClass(step)"
            >{{ statusText(step) }}</span
          >
        </div>
        <p
          class="mt-2 break-words text-[11px] text-slate-500 dark:text-slate-400"
        >
          {{ boardText.operator }} ·
          <span class="font-semibold text-slate-700 dark:text-slate-200">{{
            step.operator?.name || boardText.noOperator
          }}</span>
        </p>
        <p
          class="mt-1 break-words text-[11px] text-slate-500 dark:text-slate-400"
        >
          {{ boardText.deadline }} ·
          {{ date(step.deadline || order.dates?.finish_date) }}
          <span
            class="font-bold"
            :class="step.priority === 'urgent' ? 'text-rose-600' : ''"
          >
            · {{ t[step.priority || 'normal'] }}</span
          >
        </p>
        <p
          v-if="step.confirmation_required"
          class="mt-1 text-[11px] text-indigo-700 dark:text-indigo-300"
          data-required-evidence
        >
          {{ t.method }} · {{ methods(step) }}
        </p>
        <p
          v-if="step.pending_request"
          class="mt-2 rounded-lg bg-amber-100 p-2 text-[11px] font-bold text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
          data-pending-request
        >
          {{ requestText(step) }} · {{ t.requestAnswerNeeded }}
        </p>
        <p
          v-else-if="step.is_blocked"
          class="mt-2 text-[11px] text-amber-700 dark:text-amber-300"
        >
          {{ routingText.blocked }}
        </p>
      </section>
    </div>

    <div
      class="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400"
    >
      <p>
        {{ boardText.files }} · <span class="font-bold">{{ filesCount }}</span>
      </p>
      <p>
        {{ boardText.completed }} ·
        <span class="font-bold">{{ completedSteps }}/{{ steps.length }}</span>
      </p>
      <p class="col-span-2 break-words">
        {{ boardText.deadline }} ·
        <span :class="deadlineClass">{{ date(order.dates?.finish_date) }}</span>
      </p>
    </div>
    <footer
      class="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800"
    >
      <span
        class="min-w-0 truncate text-[11px] text-slate-500"
        :title="order.creator?.name"
        >{{ order.creator?.name || '—' }}</span
      >
      <button
        type="button"
        class="shrink-0 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
        @click="$emit('open', order)"
      >
        Բացել
      </button>
    </footer>
  </article>
</template>

<script>
import {
  confirmationMethods,
  isStepCompleted,
  isStepRejected,
  taskCopy,
} from '@/utils/task-workflow'
import { boardCopy, stepStatusText, taskStage } from '@/utils/task-board'
import { routingCopy } from '@/utils/task-routing'

export default {
  props: { order: { type: Object, required: true } },
  computed: {
    t() {
      return taskCopy[this.$i18n?.locale] || taskCopy.hy
    },
    boardText() {
      return boardCopy[this.$i18n?.locale] || boardCopy.hy
    },
    routingText() {
      return routingCopy[this.$i18n?.locale] || routingCopy.hy
    },
    steps() {
      return (this.order.factory_orders || []).filter(
        (step) =>
          !step.factory?.is_reference && step.factory?.is_workshop !== false
      )
    },
    stage() {
      return taskStage(this.order)
    },
    completedSteps() {
      return this.steps.filter(isStepCompleted).length
    },
    needsAnswer() {
      return this.steps.some(
        (step) => step.pending_request || step.awaiting_engineer_confirmation
      )
    },
    allRejected() {
      return this.steps.length > 0 && this.steps.every(isStepRejected)
    },
    overallStatusText() {
      if (this.steps.some((step) => step.pending_request))
        return this.t.requestAnswerNeeded
      if (this.steps.some((step) => step.awaiting_engineer_confirmation))
        return this.boardText.review
      if (this.allRejected) return this.boardText.rejected
      return this.boardText[this.stage]
    },
    overallStatusClass() {
      if (this.needsAnswer) return 'bg-amber-600'
      if (this.allRejected) return 'bg-rose-600'
      return {
        created: 'bg-slate-600',
        accepted: 'bg-indigo-600',
        in_progress: 'bg-blue-600',
        completed: 'bg-emerald-600',
      }[this.stage]
    },
    cardBorderClass() {
      if (this.needsAnswer) return 'border-amber-300 dark:border-amber-800'
      if (this.stage === 'completed')
        return 'border-emerald-200 dark:border-emerald-900'
      if (this.allRejected) return 'border-rose-200 dark:border-rose-900'
      if (this.isOverdue) return 'border-rose-300 dark:border-rose-800'
      return 'border-slate-200 dark:border-slate-800'
    },
    isOverdue() {
      const deadline = this.order.dates?.finish_date
      return (
        this.stage !== 'completed' &&
        !this.allRejected &&
        deadline &&
        new Date(deadline) < new Date()
      )
    },
    deadlineClass() {
      return this.isOverdue ? 'font-bold text-rose-600' : ''
    },
    filesCount() {
      const ids = new Set()
      for (const step of this.steps)
        for (const file of step.files || []) ids.add(file.id)
      for (const file of this.order.selected_files || [])
        ids.add(file.pmp_file_id || file.pmp_file?.id || file.id)
      return ids.size
    },
  },
  methods: {
    date(value) {
      return value ? this.$formatDate(value, 'dd.MM.yyyy') : '—'
    },
    statusText(step) {
      return stepStatusText(step, this.$i18n?.locale)
    },
    methods(step) {
      return confirmationMethods(step.confirmation_method)
        .map((method) => this.t[method])
        .join(' + ')
    },
    requestText(step) {
      return step.pending_request?.type === 'reopen'
        ? this.boardText.reopen
        : step.pending_request?.type === 'reject'
        ? this.t.requestReject
        : this.t.requestDeadline
    },
    stepClass(step) {
      if (step.awaiting_engineer_confirmation)
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
      if (isStepCompleted(step))
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
      if (isStepRejected(step))
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
      return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
    },
  },
}
</script>
