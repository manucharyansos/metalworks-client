<template>
  <div>
    <transition name="fade-zoom">
      <div
        v-if="visible"
        class="work-modal-frame work-modal-backdrop fixed inset-0 z-[1200] flex items-center justify-center"
        @click.self="$emit('close')"
      >
        <section
          data-work-modal
          class="work-modal work-modal--structured relative flex w-full max-w-5xl flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="engineer-task-title"
          @keydown.esc="$emit('close')"
        >
          <header class="work-modal__header">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <p class="work-task-card__meta">
                  Առաջադրանք #{{ number || order?.id || '—'
                  }}<span v-if="code"> · {{ code }}</span
                  ><span v-if="order?.created_at">
                    · {{ safeDate(order.created_at) }}</span
                  >
                </p>
                <h3 id="engineer-task-title" class="work-task-card__title">
                  {{ order?.name || 'Առաջադրանք' }}
                </h3>
                <p v-if="customerName" class="work-task-card__customer">
                  {{ customerName }}
                </p>
              </div>
              <div class="flex shrink-0 items-start gap-3">
                <span
                  class="work-status"
                  :data-tone="
                    needsAnswer
                      ? 'amber'
                      : allRejected
                      ? 'red'
                      : workflowStage === 'completed'
                      ? 'green'
                      : 'blue'
                  "
                  >{{ statusLabel }}</span
                ><button
                  type="button"
                  class="work-modal__close"
                  aria-label="Փակել"
                  @click="$emit('close')"
                >
                  ✕
                </button>
              </div>
            </div>
            <div v-if="needsAnswer" class="work-alert mt-4">
              <span aria-hidden="true">⚠</span
              ><strong>{{ t.requestAnswerNeeded }}</strong
              ><span class="work-alert__count">{{ answerCount }}</span>
            </div>
          </header>
          <div
            ref="body"
            class="work-modal__body space-y-5 bg-slate-50/60 dark:bg-slate-950/30"
          >
            <section class="work-card work-section">
              <div class="grid gap-3 sm:grid-cols-3">
                <div class="work-info">
                  <p class="work-info__label">{{ boardText.deadline }}</p>
                  <div class="work-info__value">
                    <TaskDeadline
                      :value="finishDate || ''"
                      :completed="workflowStage === 'completed'"
                      :rejected="allRejected"
                    />
                  </div>
                  <p class="work-task-card__meta mt-1">
                    {{ safeDateTime(finishDate) }}
                  </p>
                </div>
                <div class="work-info">
                  <p class="work-info__label">Ստեղծող</p>
                  <p class="work-info__value">{{ creatorName }}</p>
                </div>
                <div class="work-info">
                  <p class="work-info__label">{{ boardText.files }}</p>
                  <p class="work-info__value">{{ fileCount }}</p>
                </div>
              </div>
              <div class="work-info mt-4">
                <p class="work-info__label">Նկարագրություն</p>
                <p
                  class="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300"
                >
                  {{ order?.description || '—' }}
                </p>
              </div>
            </section>
            <section v-if="steps.length" class="space-y-3">
              <h4 class="work-section__title">Արտադրամասեր</h4>
              <article
                v-for="fo in steps"
                :key="fo.id"
                :data-task-step="fo.id"
                class="work-card work-section"
              >
                <div class="work-step-summary">
                  <PersonAvatar :name="fo.operator?.name || ''" ring />
                  <div class="work-step-summary__body">
                    <div class="work-step-summary__heading">
                      <h4>{{ fo.factory?.name || 'Արտադրամաս' }}</h4>
                      <span
                        class="work-status"
                        :data-tone="
                          fo.awaiting_engineer_confirmation ||
                          fo.pending_request
                            ? 'amber'
                            : 'neutral'
                        "
                        >{{ stepLabel(fo) }}</span
                      >
                    </div>
                    <p class="work-meta">
                      {{ fo.operator?.name || boardText.noOperator }} ·
                      {{ boardText.files }}: {{ countFactoryFiles(fo) }}
                    </p>
                  </div>
                </div>
                <TaskChangeRequestPanel
                  :step="fo"
                  :creator-id="order.creator_id"
                  @updated="$emit('updated', $event)"
                />
                <TaskCompletionProof
                  :step="fo"
                  :creator-id="order.creator_id"
                  @updated="$emit('updated', $event)"
                />
                <FileGallery :items="fo.files || []" :order-id="order.id" />
              </article>
            </section>
            <section
              v-if="unroutedFiles.length"
              class="work-card work-section"
              data-task-attachments
            >
              <h4 class="work-section__title">Կցված ֆայլեր</h4>
              <FileGallery :items="unroutedFiles" :order-id="order.id" />
            </section>
            <TaskRoutingPanel
              :order="order"
              @updated="$emit('updated', $event)"
            />
            <section
              v-if="order?.logs?.length"
              class="work-card work-section space-y-3"
              data-task-history
            >
              <h4 class="work-section__title">Գործողությունների պատմություն</h4>
              <p
                v-for="log in order.logs"
                :key="log.id"
                class="work-file-row break-words text-sm leading-6"
              >
                {{ log.user?.name }} · {{ log.message
                }}<span class="work-meta mt-1 block">{{
                  safeDateTime(log.created_at)
                }}</span>
              </p>
            </section>
          </div>
          <footer class="work-modal__footer flex justify-end">
            <button type="button" class="work-button" @click="$emit('close')">
              Փակել
            </button>
          </footer>
        </section>
      </div>
    </transition>
    <notifications />
  </div>
</template>

<script>
import PersonAvatar from '@/components/ui/PersonAvatar.vue'
import TaskDeadline from '@/components/ui/TaskDeadline.vue'
import TaskCompletionProof from '@/components/order/TaskCompletionProof.vue'
import TaskChangeRequestPanel from '@/components/order/TaskChangeRequestPanel.vue'
import TaskRoutingPanel from '@/components/order/TaskRoutingPanel.vue'
import { isStepRejected, taskCopy } from '@/utils/task-workflow'
import {
  boardCopy,
  stepStatusText,
  taskStage,
  taskStageText,
  workshopSteps,
  taskActionTarget,
} from '@/utils/task-board'
import FileGallery from '~/components/engineer/FileGallery.vue'

export default {
  name: 'OrderDetailsModal',
  components: {
    FileGallery,
    PersonAvatar,
    TaskDeadline,
    TaskCompletionProof,
    TaskChangeRequestPanel,
    TaskRoutingPanel,
  },
  props: {
    visible: { type: Boolean, default: false },
    order: { type: Object, default: null },
    focusTarget: { type: Object, default: null },
  },
  data: () => ({ focusVersion: 0 }),
  computed: {
    steps() {
      return workshopSteps(this.order)
    },
    unroutedFiles() {
      const routed = new Set(
        this.steps.flatMap((step) =>
          (step.files || []).map((file) => String(file.id))
        )
      )
      return (this.order?.selected_files || [])
        .map((selected) => selected.pmp_file)
        .filter((file) => file?.id && !routed.has(String(file.id)))
    },
    customerName() {
      return (
        this.order?.client?.company_name ||
        this.order?.client?.name ||
        this.order?.user?.name ||
        ''
      )
    },
    answerCount() {
      return this.steps.filter(
        (step) => step.pending_request || step.awaiting_engineer_confirmation
      ).length
    },
    fileCount() {
      return new Set([
        ...this.steps.flatMap((step) =>
          (step.files || []).map((file) => file.id)
        ),
        ...(this.order?.selected_files || []).map(
          (file) => file.pmp_file_id || file.pmp_file?.id || file.id
        ),
      ]).size
    },
    boardText() {
      return boardCopy[this.$i18n?.locale] || boardCopy.hy
    },
    workflowStage() {
      return taskStage(this.order)
    },
    needsAnswer() {
      return this.steps.some(
        (step) => step.pending_request || step.awaiting_engineer_confirmation
      )
    },
    allRejected() {
      const steps = this.steps
      return steps.length > 0 && steps.every(isStepRejected)
    },
    statusLabel() {
      if (this.steps.some((step) => step.pending_request))
        return this.t.requestAnswerNeeded
      if (this.needsAnswer) return this.boardText.review
      return taskStageText(
        this.allRejected ? 'rejected' : this.workflowStage,
        this.$i18n?.locale
      )
    },
    t() {
      return taskCopy[this.$i18n?.locale] || taskCopy.hy
    },
    number() {
      return this.order?.order_number?.number
    },
    code() {
      return this.order?.prefix_code?.code
    },
    creatorName() {
      return this.order?.creator?.name ?? `ID: ${this.order?.creator_id ?? '—'}`
    },
    finishDate() {
      return this.order?.dates?.finish_date || null
    },
    isOverdue() {
      if (!this.finishDate) return false
      const finish = new Date(this.finishDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      finish.setHours(0, 0, 0, 0)
      return finish <= today
    },
    selectedCount() {
      const arr = this.order?.selected_files || []
      return arr.reduce((a, s) => a + (Number(s.quantity) || 1), 0)
    },
    factoryCount() {
      const fos = this.steps
      return fos.reduce((acc, fo) => {
        const sum = (fo.files || []).reduce((b, f) => {
          const q =
            (f.pivot && Number(f.pivot.quantity)) || Number(f.quantity) || 1
          return b + q
        }, 0)
        return acc + sum
      }, 0)
    },
    totalCount() {
      return this.selectedCount + this.factoryCount
    },
    statusBadge() {
      if (this.needsAnswer)
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      if (this.allRejected)
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
      if (this.workflowStage === 'completed')
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
    },
  },
  watch: {
    visible(value) {
      if (value) this.focusAction()
      else this.focusVersion++
    },
    focusTarget() {
      if (this.visible) this.focusAction()
    },
  },
  methods: {
    focusAction() {
      const version = ++this.focusVersion
      this.$nextTick(() => {
        if (!this.visible || version !== this.focusVersion) return
        const body = this.$refs.body
        if (!body) return
        const target = taskActionTarget(this.order, this.focusTarget)
        if (!target) {
          body.scrollTop = 0
          return
        }
        const article = Array.from(
          body.querySelectorAll('[data-task-step]')
        ).find((el) => el.dataset.taskStep === String(target.stepId))
        if (!article) return
        const panel =
          (target.kind === 'request'
            ? article.querySelector('[data-change-request]')
            : target.kind === 'proof'
            ? article.querySelector('[data-task-proof]')
            : null) || article
        panel.setAttribute('data-notification-focus', '')
        panel.tabIndex = -1
        panel.focus({ preventScroll: true })
        body.scrollTop +=
          panel.getBoundingClientRect().top -
          body.getBoundingClientRect().top -
          12
      })
    },
    stepLabel(step) {
      return stepStatusText(step, this.$i18n?.locale)
    },
    safeDate(d) {
      if (!d) return '—'
      const dt = new Date(d)
      return isNaN(dt) ? d : dt.toLocaleDateString()
    },
    safeDateTime(d) {
      if (!d) return '—'
      const dt = new Date(d)
      return isNaN(dt) ? d : dt.toLocaleString()
    },
    countFactoryFiles(fo) {
      return (fo?.files || []).reduce((b, f) => {
        const q =
          (f.pivot && Number(f.pivot.quantity)) || Number(f.quantity) || 1
        return b + q
      }, 0)
    },
  },
}
</script>

<style scoped>
.fade-zoom-enter-active,
.fade-zoom-leave-active {
  transition: all 0.18s ease;
}
.fade-zoom-enter,
.fade-zoom-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
