<template>
  <section
    v-if="req"
    class="mt-3 space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-slate-900 dark:border-amber-700 dark:bg-amber-950/20 dark:text-slate-100"
    data-change-request
  >
    <header>
      <p class="font-bold">{{ title }}</p>
      <p class="mt-1 text-xs text-amber-800 dark:text-amber-300">
        {{ t.requestWaiting }}
      </p>
    </header>

    <dl class="space-y-1 text-xs">
      <div v-if="req.requester" class="flex gap-2">
        <dt class="shrink-0 text-slate-500 dark:text-slate-400">
          {{ t.requestBy }}
        </dt>
        <dd class="font-semibold">{{ req.requester.name }}</dd>
      </div>
      <div v-if="req.type === 'reject'" class="flex gap-2">
        <dt class="shrink-0 text-slate-500 dark:text-slate-400">
          {{ t.requestReason }}
        </dt>
        <dd class="font-semibold">{{ reasonLabel }}</dd>
      </div>
      <template v-else>
        <div v-if="req.previous_deadline" class="flex gap-2">
          <dt class="shrink-0 text-slate-500 dark:text-slate-400">
            {{ t.requestCurrentDeadline }}
          </dt>
          <dd class="font-semibold">{{ day(req.previous_deadline) }}</dd>
        </div>
        <div class="flex gap-2">
          <dt class="shrink-0 text-slate-500 dark:text-slate-400">
            {{ t.requestNewDeadline }}
          </dt>
          <dd class="font-semibold">{{ day(req.proposed_date) }}</dd>
        </div>
      </template>
    </dl>
    <p
      v-if="req.operator_note"
      class="whitespace-pre-wrap break-words rounded-lg bg-white/70 p-2 text-xs dark:bg-slate-900/60"
    >
      {{ req.operator_note }}
    </p>

    <!-- The creating engineer decides. -->
    <form v-if="isCreator" class="space-y-3" @submit.prevent>
      <fieldset
        v-if="req.type === 'reject'"
        class="space-y-2"
        :disabled="saving"
      >
        <legend class="text-xs font-semibold">{{ t.resolution }}</legend>
        <label
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-amber-200 bg-white p-2 dark:border-amber-900 dark:bg-slate-900"
        >
          <input
            v-model="resolution"
            type="radio"
            value="canceled"
            data-resolution="canceled"
          />
          <span>{{ t.resolutionCancel }}</span>
        </label>
        <label
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-amber-200 bg-white p-2 dark:border-amber-900 dark:bg-slate-900"
        >
          <input
            v-model="resolution"
            type="radio"
            value="reassigned"
            data-resolution="reassigned"
            @change="loadOperators"
          />
          <span>{{ t.resolutionReassign }}</span>
        </label>
        <template v-if="resolution === 'reassigned'">
          <select
            v-model="operatorId"
            data-reassign-operator
            :aria-label="t.chooseOperator"
            class="block w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">{{ t.chooseOperator }}</option>
            <option
              v-for="operator in operators"
              :key="operator.id"
              :value="String(operator.id)"
            >
              {{ operatorLabel(operator) }}
            </option>
          </select>
          <p
            v-if="operatorsLoaded && !operators.length"
            class="text-xs text-slate-500"
          >
            {{ t.noOtherOperators }}
          </p>
        </template>
      </fieldset>

      <label class="block text-xs font-semibold">
        {{ t.decisionNote }}
        <textarea
          v-model="decisionNote"
          rows="2"
          maxlength="1000"
          :disabled="saving"
          class="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>

      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          data-approve-request
          :disabled="saving || !canApprove"
          class="rounded-xl bg-emerald-600 p-3 font-bold text-white disabled:opacity-50"
          @click="decide('approve')"
        >
          {{ t.approve }}
        </button>
        <button
          type="button"
          data-decline-request
          :disabled="saving"
          class="rounded-xl border border-slate-300 bg-white p-3 font-bold text-slate-800 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          @click="decide('decline')"
        >
          {{ t.decline }}
        </button>
      </div>
    </form>

    <!-- The operator who asked (or management) can take the request back. -->
    <button
      v-else-if="canWithdraw"
      type="button"
      data-withdraw-request
      :disabled="saving"
      class="w-full rounded-xl border border-amber-400 bg-white p-3 font-bold text-amber-900 disabled:opacity-50 dark:bg-slate-900 dark:text-amber-200"
      @click="withdraw"
    >
      {{ t.withdraw }}
    </button>

    <p v-if="error" role="alert" class="break-words text-xs text-red-600">
      {{ error }}
    </p>
  </section>
</template>

<script>
import { operatorWorkloadLabel } from '@/utils/task-routing'
import { apiErrorMessage, taskCopy } from '@/utils/task-workflow'

const KNOWN_REASONS = ['unclear', 'wrong_data', 'no_material', 'other']

export default {
  name: 'TaskChangeRequestPanel',
  props: {
    step: { type: Object, required: true },
    creatorId: { type: [Number, String], default: null },
  },
  data: () => ({
    saving: false,
    error: '',
    decisionNote: '',
    resolution: 'canceled',
    operatorId: '',
    operators: [],
    operatorsLoaded: false,
  }),
  computed: {
    t() {
      return taskCopy[this.$i18n?.locale] || taskCopy.hy
    },
    req() {
      return this.step?.pending_request || null
    },
    user() {
      return this.$auth?.user || {}
    },
    role() {
      return this.user?.role?.name
    },
    isCreator() {
      return (
        this.role === 'engineer' &&
        this.creatorId != null &&
        String(this.creatorId) === String(this.user.id)
      )
    },
    canWithdraw() {
      return (
        ['admin', 'manager'].includes(this.role) ||
        String(this.req?.requested_by) === String(this.user.id)
      )
    },
    canApprove() {
      if (this.req?.type !== 'reject' || this.resolution !== 'reassigned')
        return true
      return Boolean(this.operatorId)
    },
    title() {
      return this.req?.type === 'reject'
        ? this.t.requestReject
        : this.t.requestDeadline
    },
    reasonLabel() {
      const code = this.req?.reason
      return KNOWN_REASONS.includes(code)
        ? this.$t(`factory_order_actions.reasons.${code}`)
        : code || '—'
    },
  },
  methods: {
    day(value) {
      if (!value) return '—'
      const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)
      return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleDateString()
    },
    operatorLabel(operator) {
      return operatorWorkloadLabel(operator, this.$i18n?.locale || 'hy')
    },
    // Operators of this workshop with their open-job counts, so the engineer
    // can hand the job to the least busy one.
    async loadOperators() {
      if (this.operatorsLoaded) return
      try {
        const { data } = await this.$axios.get('/api/task-workload')
        const factory = (data?.factories || []).find(
          (row) => String(row.id) === String(this.step.factory_id)
        )
        this.operators = (factory?.operators || []).filter(
          (operator) => String(operator.id) !== String(this.req?.requested_by)
        )
        this.operatorsLoaded = true
      } catch (error) {
        this.error = apiErrorMessage(error)
      }
    },
    async decide(decision) {
      if (this.saving || !this.isCreator) return
      this.saving = true
      this.error = ''
      try {
        const body = { decision, note: this.decisionNote.trim() || null }
        if (decision === 'approve' && this.req.type === 'reject') {
          body.resolution = this.resolution
          if (this.resolution === 'reassigned')
            body.operator_id = Number(this.operatorId)
        }
        const { data } = await this.$axios.post(
          `/api/engineers/task-requests/${this.req.id}/decision`,
          body
        )
        this.$emit('updated', data.order)
        this.$notify?.({
          type: 'success',
          text:
            decision === 'approve'
              ? this.t.approvedToast
              : this.t.declinedToast,
        })
      } catch (error) {
        this.error = apiErrorMessage(error)
      } finally {
        this.saving = false
      }
    },
    async withdraw() {
      if (this.saving || !this.canWithdraw) return
      this.saving = true
      this.error = ''
      try {
        const { data } = await this.$axios.post(
          `/api/task-requests/${this.req.id}/withdraw`
        )
        this.$emit('updated', data)
        this.$notify?.({ type: 'success', text: this.t.withdrawn })
      } catch (error) {
        this.error = apiErrorMessage(error)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
