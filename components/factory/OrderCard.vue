<template>
  <article
    :data-task-id="order.id"
    class="group relative flex min-w-0 flex-col rounded-2xl border bg-white p-4 text-sm shadow-sm transition-all dark:bg-slate-900"
    :class="[
      cardStatusClass,
      isLocked
        ? 'cursor-default'
        : 'cursor-move hover:-translate-y-0.5 hover:shadow-lg',
    ]"
    :draggable="!isLocked"
    @dragstart="onDragStart"
    @dragend="$emit('drag-end')"
  >
    <div class="mb-3 flex min-w-0 flex-col items-start gap-2">
      <div class="w-full min-w-0">
        <p
          class="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400"
        >
          Առաջադրանքի համար
        </p>
        <h3
          class="mt-1 break-words text-xs font-black text-slate-900 dark:text-white"
        >
          {{ order.order_number?.number || `Առաջադրանք #${order.id}` }}
        </h3>
        <p class="mt-1 truncate text-[10px] text-slate-400">
          Կոդ՝
          <span
            class="font-mono font-bold text-slate-500 dark:text-slate-300"
            >{{ order.prefix_code?.code || '—' }}</span
          >
        </p>
      </div>
      <span
        class="max-w-full rounded-full px-2.5 py-1 text-[10px] font-bold"
        :class="badgeClass"
        >{{ statusLabel }}</span
      >
    </div>

    <p
      class="line-clamp-2 min-h-[36px] break-words text-xs leading-5 text-slate-500 dark:text-slate-400"
      :title="order.description"
    >
      {{ order.description || 'Առանց նկարագրության' }}
    </p>

    <div class="mt-4 grid grid-cols-2 gap-2 text-[10px]">
      <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/50">
        <p class="text-slate-400">Ֆայլեր</p>
        <p class="mt-1 truncate font-bold text-slate-700 dark:text-slate-200">
          {{ factoryOrder?.files?.length || 0 }}
        </p>
      </div>
      <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/50">
        <p class="text-slate-400">Ժամկետ</p>
        <p class="mt-1 truncate font-bold text-slate-700 dark:text-slate-200">
          {{
            factoryOrder?.deadline || order.dates?.finish_date
              ? $formatDate(
                  factoryOrder?.deadline || order.dates.finish_date,
                  'dd.MM.yyyy'
                )
              : '—'
          }}
        </p>
      </div>
      <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/50">
        <p class="text-slate-400">Ստեղծող</p>
        <p
          :title="order.creator?.name"
          class="mt-1 truncate font-bold text-slate-700 dark:text-slate-200"
        >
          {{ order.creator?.name || '—' }}
        </p>
      </div>
      <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/50">
        <p class="text-slate-400">Օպերատոր</p>
        <p
          :title="operatorName"
          class="mt-1 truncate font-bold text-slate-700 dark:text-slate-200"
        >
          {{ operatorName || 'Չնշված' }}
        </p>
      </div>
    </div>

    <p
      class="mt-3 break-words text-xs font-bold"
      :class="
        factoryOrder?.priority === 'urgent' ? 'text-rose-600' : 'text-slate-500'
      "
      data-workshop-priority
    >
      {{ taskText.priority }} ·
      {{ taskText[factoryOrder?.priority || 'normal'] }}
    </p>
    <p
      v-if="factoryOrder?.confirmation_required"
      data-required-evidence
      class="mt-2 rounded-xl bg-indigo-50 p-2 text-[11px] text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-200"
    >
      {{ taskText.method }} · {{ evidenceLabel }}
    </p>
    <p
      v-if="factoryOrder?.completed_at"
      data-completed-at
      class="mt-2 text-[11px] text-emerald-700 dark:text-emerald-300"
    >
      {{ boardText.approvedAt }} ·
      {{ $formatDate(factoryOrder.completed_at, 'dd.MM.yyyy HH:mm') }}
    </p>
    <p
      v-if="pendingRequest"
      data-pending-request
      class="mt-3 rounded-xl bg-amber-50 p-2 text-[11px] font-bold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
    >
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
      class="mt-3 rounded-xl bg-rose-50 p-2 text-[11px] text-rose-800 dark:bg-rose-950/30 dark:text-rose-200"
    >
      <span class="block font-bold">{{ taskText.returnedNote }}</span
      >{{ factoryOrder.return_note }}
    </p>
    <p
      v-if="isTakenByOther"
      class="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-rose-500"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>Առաջադրանքը
      վերցված է այլ օպերատորի կողմից
    </p>
    <p
      v-else-if="factoryOrder?.is_blocked"
      class="mt-3 text-xs font-semibold text-amber-700 dark:text-amber-300"
    >
      {{ routingText.blocked }}
    </p>
    <p
      v-else-if="awaitingEngineer"
      data-awaiting-engineer
      class="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-300"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span
      >{{ taskText.waiting }}
    </p>
    <p
      v-else-if="isRejected"
      data-rejected-final
      class="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-300"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span
      >{{ boardText.reopenHelp }}
    </p>
    <p
      v-else-if="isCompleted"
      class="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Առաջադրանքը
      ավարտված է
    </p>
    <p
      v-else-if="!$can('factory.order_update')"
      class="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-slate-400"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-slate-300"></span>Փոփոխման
      իրավունքը տրված չէ
    </p>

    <div
      class="mt-4 flex flex-col items-stretch gap-2 border-t border-slate-100 pt-3 dark:border-slate-800"
    >
      <button
        type="button"
        class="flex items-center justify-center gap-1 text-xs font-bold text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
        @click.stop="$emit('view-details', order)"
      >
        Մանրամասներ <span aria-hidden="true">→</span>
      </button>
      <button
        v-if="$can('factory.order_update')"
        type="button"
        :disabled="isLocked"
        class="min-w-0 whitespace-normal rounded-xl px-3 py-2 text-[11px] font-bold transition"
        :class="
          isLocked
            ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800'
            : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
        "
        @click.stop="!isLocked && $emit('edit', order)"
      >
        {{
          isRejected
            ? boardText.reopen
            : $t('factory_order_actions.change_status')
        }}
      </button>
    </div>

    <div
      v-if="!isLocked"
      class="pointer-events-none absolute -left-1 top-1/2 hidden -translate-y-1/2 text-xs text-slate-300 group-hover:inline"
    >
      ☰
    </div>
  </article>
</template>

<script>
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
  props: {
    order: { type: Object, required: true },
    factoryId: { type: [Number, String], required: true },
    currentUserId: { type: [Number, String], required: true },
    statusOptions: { type: Array, default: () => [] },
    saving: { type: Boolean, default: false },
  },
  computed: {
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
