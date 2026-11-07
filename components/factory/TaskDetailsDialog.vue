<template>
  <div
    class="work-modal-frame work-modal-backdrop fixed inset-0 z-50"
    @click.self="$emit('close')"
  >
    <section
      ref="dialog"
      data-work-modal
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
      class="work-modal work-modal--structured w-full max-w-6xl outline-none"
      @keydown.esc="$emit('close')"
    >
      <header class="work-modal__header flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="work-task-card__meta whitespace-nowrap">
            #{{ details.order_number?.number || details.id }} ·
            {{ details.prefix_code?.code || '—' }}
          </p>
          <h2
            :id="titleId"
            class="truncate text-lg font-black text-slate-950 dark:text-white sm:text-xl"
          >
            {{ details.name || copy.title }}
          </h2>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <span
            v-if="step"
            class="work-status whitespace-nowrap"
            :data-tone="tone"
            >{{ status }}</span
          >
          <button
            type="button"
            class="work-modal__close"
            :aria-label="copy.close"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>
      </header>
      <div class="work-modal__body">
        <slot />
      </div>
      <footer
        v-if="canUpdate || waiting"
        class="work-modal__footer flex flex-wrap items-center justify-end gap-3"
      >
        <p
          v-if="waiting"
          class="work-alert m-0 min-w-0 flex-1 flex-col !gap-1"
          role="status"
          data-step-waiting
        >
          <span class="font-semibold">{{ waitingText }}</span>
          <span class="text-xs font-normal">{{ routing.blockedHelp }}</span>
        </p>
        <button
          v-if="canUpdate"
          type="button"
          class="app-button-primary !rounded-xl !py-2.5"
          @click="$emit('change-status')"
        >
          {{ $t('factory_order_actions.change_status') }}
        </button>
      </footer>
    </section>
  </div>
</template>

<script>
import { stepStatusText } from '@/utils/task-board'
import { factoryBoardCopy } from '@/utils/factory-board-copy'
import { routingCopy } from '@/utils/task-routing'
import { isStepRejected, isStepWaiting } from '@/utils/task-workflow'
import { isFactoryOrderFinished } from '@/utils/factory-order-status'

let dialogIds = 0

// Task details over a workshop board: a fixed header (number, name, status)
// and footer (Change status) around a scrolling body.
export default {
  name: 'TaskDetailsDialog',
  props: {
    details: { type: Object, required: true },
    // This workshop's stage of the task, with a normalized status.
    step: { type: Object, default: null },
    canUpdate: { type: Boolean, default: false },
  },
  data: () => ({ uid: ++dialogIds }),
  computed: {
    copy() {
      return factoryBoardCopy[this.$i18n?.locale] || factoryBoardCopy.hy
    },
    routing() {
      return routingCopy[this.$i18n?.locale] || routingCopy.hy
    },
    titleId() {
      return `task-details-title-${this.uid}`
    },
    // The same reason the card shows, with the workshops still to finish.
    waiting() {
      return isStepWaiting(this.step)
    },
    waitingText() {
      const names = (this.step?.waiting_for || []).filter(Boolean)
      return names.length
        ? `${this.routing.blocked} · ${names.join(', ')}`
        : this.routing.blocked
    },
    status() {
      return stepStatusText(this.step, this.$i18n?.locale)
    },
    tone() {
      const step = this.step
      if (!step) return 'neutral'
      if (step.awaiting_engineer_confirmation) return 'amber'
      if (isStepRejected(step)) return 'red'
      if (isFactoryOrderFinished(step.status)) return 'green'
      return ['accepted', 'confirmed', 'in_progress', 'date_changed'].includes(
        step.status
      )
        ? 'blue'
        : 'neutral'
    },
  },
  mounted() {
    this.$nextTick(() => this.$refs.dialog?.focus())
  },
}
</script>
