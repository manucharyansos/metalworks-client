<template>
  <article
    :data-task-id="order.id"
    class="work-card work-task-card"
    :data-tone="cardTone"
    :class="isLocked ? 'cursor-default' : 'cursor-move'"
    :draggable="!isLocked"
    @dragstart="onDragStart"
    @dragend="$emit('drag-end')"
  >
    <header class="work-task-card__header">
      <div class="work-task-card__top">
        <p class="work-task-card__meta">
          #{{ order.order_number?.number || order.id }} ·
          {{ order.prefix_code?.code || '—' }}
        </p>
        <span class="work-status" :data-tone="badgeTone">{{
          statusLabel
        }}</span>
      </div>
      <h3 class="work-task-card__title">
        {{ order.name || `Առաջադրանք #${order.id}` }}
      </h3>
      <p class="work-meta mt-1">
        {{ boardText.engineer || 'Ինժեներ' }}՝ {{ order.creator?.name || '—' }}
      </p>
    </header>
    <p class="work-task-card__description" :title="order.description">
      {{ order.description || 'Առանց նկարագրության' }}
    </p>
    <div class="work-step-summary">
      <PersonAvatar :name="operatorName || ''" />
      <div class="work-step-summary__body">
        <div class="work-step-summary__heading">
          <p class="work-meta">{{ boardText.operator }}</p>
          <span
            v-if="factoryOrder?.priority === 'urgent'"
            class="rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
            >{{ taskText.urgent }}</span
          >
        </div>
        <p
          class="text-sm font-semibold"
          :class="operatorName ? '' : 'text-amber-700 dark:text-amber-300'"
        >
          {{ operatorName || boardText.noOperator }}
        </p>
      </div>
    </div>
    <p class="work-meta" data-workshop-priority>
      {{ taskText.priority }} ·
      {{ taskText[factoryOrder?.priority || 'normal'] }}
    </p>
    <p
      v-if="factoryOrder?.confirmation_required"
      data-required-evidence
      class="work-meta text-indigo-700 dark:text-indigo-300"
    >
      {{ taskText.method }} · {{ evidenceLabel }}
    </p>
    <p
      v-if="factoryOrder?.completed_at"
      data-completed-at
      class="work-meta text-emerald-700 dark:text-emerald-300"
    >
      {{ boardText.approvedAt }} ·
      {{ $formatDate(factoryOrder.completed_at, 'dd.MM.yyyy HH:mm') }}
    </p>
    <p v-if="pendingRequest" data-pending-request class="work-alert">
      {{
        pendingRequest.type === 'reopen'
          ? boardText.reopen
          : pendingRequest.type === 'reject'
          ? taskText.requestReject
          : taskText.requestDeadline
      }}
      · {{ taskText.requestWaiting }}
    </p>
    <p
      v-if="factoryOrder && factoryOrder.return_note && !awaitingEngineer"
      data-return-note
      class="work-alert"
      data-tone="red"
    >
      <span
        ><span class="block font-semibold">{{ taskText.returnedNote }}</span
        >{{ factoryOrder.return_note }}</span
      >
    </p>
    <p v-if="isTakenByOther" class="work-alert" data-tone="red">
      Առաջադրանքը վերցված է այլ օպերատորի կողմից
    </p>
    <p v-else-if="factoryOrder?.is_blocked" class="work-alert">
      {{ routingText.blocked }}
    </p>
    <p v-else-if="awaitingEngineer" data-awaiting-engineer class="work-alert">
      {{ taskText.waiting }}
    </p>
    <p
      v-else-if="isRejected"
      data-rejected-final
      class="work-alert"
      data-tone="red"
    >
      {{ boardText.reopenHelp }}
    </p>
    <p v-else-if="isCompleted" class="work-alert" data-tone="green">
      Առաջադրանքը ավարտված է
    </p>
    <p v-else-if="!$can('factory.order_update')" class="work-meta">
      Փոփոխման իրավունքը տրված չէ
    </p>
    <footer class="work-task-card__footer">
      <div class="min-w-0 w-full">
        <TaskDeadline
          :value="factoryOrder?.deadline || order.dates?.finish_date || ''"
          :completed="isCompleted"
          :rejected="isRejected"
        />
        <p class="work-task-card__meta mt-1">
          {{
            factoryOrder?.deadline || order.dates?.finish_date
              ? $formatDate(
                  factoryOrder?.deadline || order.dates.finish_date,
                  'dd.MM.yyyy'
                )
              : '—'
          }}
          · {{ boardText.files }}: {{ factoryOrder?.files?.length || 0
          }}<span v-if="order.created_at"> · {{ order.created_at }}</span>
        </p>
      </div>
      <div class="work-task-card__actions w-full justify-between">
        <button
          type="button"
          class="text-xs font-semibold text-slate-600 dark:text-slate-300"
          @click.stop="$emit('view-details', order)"
        >
          Մանրամասներ <span aria-hidden="true">→</span></button
        ><button
          v-if="$can('factory.order_update')"
          type="button"
          :disabled="isLocked"
          class="work-button"
          :data-variant="isRejected ? 'answer' : 'primary'"
          @click.stop="!isLocked && $emit('edit', order)"
        >
          {{
            isRejected
              ? boardText.reopen
              : $t('factory_order_actions.change_status')
          }}
        </button>
      </div>
    </footer>
  </article>
</template>

<script>
import PersonAvatar from '@/components/ui/PersonAvatar.vue'
import TaskDeadline from '@/components/ui/TaskDeadline.vue'
import { boardCopy, stepStatusText } from '@/utils/task-board'
import { routingCopy } from '@/utils/task-routing'
import {
  confirmationMethods,
  isStepRejected,
  taskCopy,
} from '@/utils/task-workflow'
import {
  isFactoryOrderFinished,
  normalizeFactoryOrderStatus,
} from '@/utils/factory-order-status'

export default {
  name: 'OrderCard',
  components: { PersonAvatar, TaskDeadline },
  props: {
    order: { type: Object, required: true },
    factoryId: { type: [Number, String], required: true },
    currentUserId: { type: [Number, String], required: true },
    statusOptions: { type: Array, default: () => [] },
    saving: { type: Boolean, default: false },
  },
  computed: {
    cardTone() {
      return this.awaitingEngineer || this.pendingRequest
        ? 'amber'
        : this.isRejected
        ? 'neutral'
        : this.isCompleted
        ? 'green'
        : this.factoryOrder?.priority === 'urgent' || this.isPastDeadline
        ? 'red'
        : 'blue'
    },
    badgeTone() {
      return this.awaitingEngineer
        ? 'amber'
        : this.isRejected
        ? 'red'
        : this.isCompleted
        ? 'green'
        : ['accepted', 'confirmed', 'in_progress', 'date_changed'].includes(
            this.status
          )
        ? 'blue'
        : 'neutral'
    },
    isPastDeadline() {
      const value = this.factoryOrder?.deadline || this.order.dates?.finish_date
      return (
        !this.isCompleted &&
        !this.isRejected &&
        value &&
        new Date(value).getTime() < Date.now()
      )
    },
    boardText() {
      return boardCopy[this.$i18n?.locale] || boardCopy.hy
    },
    evidenceLabel() {
      return confirmationMethods(this.factoryOrder?.confirmation_method)
        .map((method) => this.taskText[method])
        .join(' + ')
    },
    routingText() {
      return routingCopy[this.$i18n?.locale] || routingCopy.hy
    },
    taskText() {
      return taskCopy[this.$i18n?.locale] || taskCopy.hy
    },
    pendingRequest() {
      return this.factoryOrder?.pending_request || null
    },
    awaitingEngineer() {
      return Boolean(this.factoryOrder?.awaiting_engineer_confirmation)
    },
    // Reopening is a request, so a rejected card may be moved while no request is waiting.
    isRejected() {
      return isStepRejected(this.factoryOrder)
    },
    factoryOrder() {
      if (!this.order.factory_orders) return null
      return this.order.factory_orders.find(
        (o) => String(o.factory_id) === String(this.factoryId)
      )
    },
    status() {
      return normalizeFactoryOrderStatus(this.factoryOrder?.status)
    },
    operatorName() {
      return this.factoryOrder?.operator?.name || null
    },
    statusLabel() {
      return stepStatusText(this.factoryOrder, this.$i18n?.locale)
    },

    isTakenByOther() {
      const opId = this.factoryOrder?.operator_id
      return Boolean(opId) && String(opId) !== String(this.currentUserId)
    },
    isCompleted() {
      return isFactoryOrderFinished(this.status)
    },
    isWorkLocked() {
      return (
        this.isTakenByOther ||
        this.isCompleted ||
        (this.isRejected && Boolean(this.pendingRequest)) ||
        (Boolean(this.factoryOrder?.is_blocked) && !this.isRejected)
      )
    },
    isLocked() {
      return (
        this.saving || this.isWorkLocked || !this.$can('factory.order_update')
      )
    },
    badgeClass() {
      const status = String(this.status || '').toLowerCase()
      if (this.awaitingEngineer)
        return 'bg-amber-50 text-amber-800 dark:bg-amber-950/35 dark:text-amber-300'
      if (isFactoryOrderFinished(status))
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300'
      if (['մերժել', 'rejected', 'canceled', 'cancelled'].includes(status))
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/35 dark:text-rose-300'
      if (['կատարման ժամկետի փոխարինում', 'date_changed'].includes(status))
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-300'
      if (['հաստատել', 'confirmed', 'accepted', 'in_progress'].includes(status))
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-300'
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    },
    cardStatusClass() {
      if (this.awaitingEngineer) return 'border-amber-300 dark:border-amber-800'
      if (this.isRejected) return 'border-rose-200 dark:border-rose-900/70'
      if (this.isCompleted)
        return 'border-emerald-200 dark:border-emerald-900/70'
      if (
        String(this.status || '')
          .toLowerCase()
          .includes('մերժ')
      )
        return 'border-rose-200 dark:border-rose-900/70'
      return 'border-slate-200 dark:border-slate-800'
    },
  },
  methods: {
    onDragStart(e) {
      if (this.isLocked) {
        e.preventDefault()
        return
      }
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', String(this.order.id))
      this.$emit('drag-start', this.order)
    },
  },
}
</script>
