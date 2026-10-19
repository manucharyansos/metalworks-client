<template>
  <article
    data-engineer-task-card
    class="work-card work-task-card"
    :data-tone="cardTone"
  >
    <div v-if="needsAnswer" class="work-alert" data-answer-needed>
      <span aria-hidden="true">⚠</span
      ><span class="font-semibold">{{ decisionText }}</span
      ><span class="work-alert__count">{{ answerCount }}</span>
    </div>
    <header class="work-task-card__header">
      <div class="work-task-card__top">
        <p class="work-task-card__meta">
          #{{ order.order_number?.number || order.id }} ·
          {{ order.prefix_code?.code || '—' }}
        </p>
        <span
          class="work-status"
          :data-tone="badgeTone"
          data-task-stage-label
          >{{ overallStatusText }}</span
        >
      </div>
      <h3 class="work-task-card__title">{{ order.name || 'Առաջադրանք' }}</h3>
      <p v-if="customerName" class="work-task-card__customer">
        <svg
          class="h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <circle cx="12" cy="7" r="4" stroke-width="1.6" />
          <path d="M4 21v-2a8 8 0 0116 0v2" stroke-width="1.6" /></svg
        ><span>{{ customerName }}</span>
      </p>
    </header>
    <p class="work-task-card__description" :title="order.description">
      {{ order.description || '—' }}
    </p>
    <div class="work-task-card__steps" data-workshop-summaries>
      <section
        v-for="step in steps"
        :key="step.id || step.factory_id"
        class="work-step-summary"
      >
        <PersonAvatar :name="step.operator?.name || ''" ring />
        <div class="work-step-summary__body">
          <div class="work-step-summary__heading">
            <h4>{{ step.factory?.name || '—' }}</h4>
            <span class="work-status" :data-tone="stepTone(step)">{{
              statusText(step)
            }}</span>
          </div>
          <p
            class="work-meta"
            :class="!step.operator ? 'text-amber-700 dark:text-amber-300' : ''"
          >
            {{ step.operator?.name || boardText.noOperator }}
          </p>
          <p class="work-meta">
            {{ date(step.deadline || order.dates?.finish_date) }} ·
            <span
              :class="
                step.priority === 'urgent' ? 'font-bold text-rose-600' : ''
              "
              >{{ t[step.priority || 'normal'] }}</span
            >
          </p>
          <p
            v-if="step.confirmation_required"
            class="work-meta text-indigo-700 dark:text-indigo-300"
            data-required-evidence
          >
            {{ t.method }} · {{ methods(step) }}
          </p>
          <p
            v-if="step.pending_request"
            class="work-alert mt-2"
            data-pending-request
          >
            {{ requestText(step) }} · {{ t.requestAnswerNeeded }}
          </p>
          <p v-else-if="step.is_blocked" class="work-alert mt-2">
            {{ routingText.blocked }}
          </p>
        </div>
      </section>
    </div>
    <div
      v-if="steps.length"
      class="work-task-progress"
      :aria-label="
        boardText.completed + ': ' + completedSteps + '/' + steps.length
      "
    >
      <span
        v-for="step in steps"
        :key="step.id || step.factory_id"
        class="work-task-progress__segment"
        :data-tone="progressTone(step)"
      /><span class="work-task-progress__count"
        >{{ completedSteps }}/{{ steps.length }}</span
      >
    </div>
    <footer class="work-task-card__footer">
      <div class="min-w-0 flex-1">
        <TaskDeadline
          :value="order.dates?.finish_date || ''"
          :completed="stage === 'completed'"
          :rejected="allRejected"
        />
        <p class="work-task-card__meta mt-1">
          {{ date(order.dates?.finish_date) }} · {{ boardText.files }}:
          {{ filesCount }}
        </p>
        <p
          v-if="order.creator?.name"
          class="work-task-card__meta"
          :title="order.creator.name"
        >
          {{ order.creator.name }}
        </p>
      </div>
      <button
        v-if="!readOnly"
        type="button"
        class="work-button"
        :data-variant="needsAnswer ? 'answer' : 'open'"
        @click="$emit('open', order)"
      >
        {{ openLabel }}
      </button>
    </footer>
  </article>
</template>

<script>
import PersonAvatar from '@/components/ui/PersonAvatar.vue'
import TaskDeadline from '@/components/ui/TaskDeadline.vue'
import {
  confirmationMethods,
  isStepCompleted,
  isStepRejected,
  taskCopy,
} from '@/utils/task-workflow'
import { boardCopy, stepStatusText, taskStage } from '@/utils/task-board'
import { routingCopy } from '@/utils/task-routing'

export default {
  components: { PersonAvatar, TaskDeadline },
  props: { order: { type: Object, required: true }, readOnly: Boolean },
  computed: {
    isManagement() {
      return ['admin', 'manager'].includes(this.$auth?.user?.role?.name)
    },
    decisionText() {
      return this.isManagement ? this.boardText.review : this.overallStatusText
    },
    openLabel() {
      const labels = {
        hy: ['Բացել', 'Պատասխանել'],
        ru: ['Открыть', 'Ответить'],
        en: ['Open', 'Respond'],
      }
      return (labels[this.$i18n?.locale] || labels.hy)[
        this.needsAnswer && !this.isManagement ? 1 : 0
      ]
    },
    customerName() {
      return (
        this.order.client?.company_name ||
        this.order.client?.name ||
        this.order.user?.name ||
        ''
      )
    },
    answerCount() {
      return this.steps.filter(
        (step) => step.pending_request || step.awaiting_engineer_confirmation
      ).length
    },
    cardTone() {
      return this.needsAnswer
        ? 'amber'
        : this.allRejected
        ? 'neutral'
        : this.stage === 'completed'
        ? 'green'
        : this.isOverdue
        ? 'red'
        : 'blue'
    },
    badgeTone() {
      return this.needsAnswer
        ? 'amber'
        : this.allRejected
        ? 'red'
        : this.stage === 'completed'
        ? 'green'
        : this.stage === 'created'
        ? 'neutral'
        : 'blue'
    },
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
    stepTone(step) {
      return step.pending_request || step.awaiting_engineer_confirmation
        ? 'amber'
        : isStepCompleted(step)
        ? 'green'
        : isStepRejected(step)
        ? 'red'
        : ['accepted', 'confirmed', 'in_progress', 'date_changed'].includes(
            step.status
          )
        ? 'blue'
        : 'neutral'
    },
    progressTone(step) {
      return isStepRejected(step)
        ? 'neutral'
        : isStepCompleted(step)
        ? 'green'
        : step.pending_request || step.awaiting_engineer_confirmation
        ? 'amber'
        : ['accepted', 'confirmed', 'in_progress', 'date_changed'].includes(
            step.status
          )
        ? 'blue'
        : 'neutral'
    },
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
