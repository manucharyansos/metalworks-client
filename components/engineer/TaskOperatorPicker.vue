<template>
  <section
    v-if="factories.length"
    class="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800"
    data-operator-picker
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="text-sm font-semibold">
          {{ $t('order_create.factory_operators') }}
        </h3>
        <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {{ t.creationHelp }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          data-auto-balance
          :disabled="disabled || !workload"
          :title="t.balanceHelp"
          class="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          @click="balance"
        >
          {{ t.autoBalance }}
        </button>
        <button
          type="button"
          data-clear-operators
          :disabled="disabled || !hasChoice"
          class="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
          @click="clear"
        >
          {{ t.clearChoices }}
        </button>
        <button
          type="button"
          data-refresh-workload
          :disabled="disabled || loading"
          class="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
          @click="$emit('refresh')"
        >
          {{ loading ? t.loading : t.refresh }}
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-3 text-sm text-red-600" role="alert">
      {{ error }}
    </p>

    <div
      v-for="factory in factories"
      :key="factory.id"
      class="mt-3 grid items-start gap-2 sm:grid-cols-[180px_1fr]"
      :data-operator-row="factory.id"
    >
      <label
        :for="'factory-operator-' + factory.id"
        class="pt-2.5 text-sm text-slate-600 dark:text-slate-300"
        >{{ factory.name }}</label
      >
      <div class="min-w-0">
        <select
          :id="'factory-operator-' + factory.id"
          :disabled="disabled"
          class="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-800"
          @change="choose(factory.id, $event.target.value)"
        >
          <option value="" :selected="selected(factory.id) === ''">
            {{ t.unassigned }}
          </option>
          <option
            v-for="operator in operatorsFor(factory)"
            :key="operator.id"
            :value="String(operator.id)"
            :selected="selected(factory.id) === String(operator.id)"
          >
            {{ label(operator)
            }}{{ isRecommended(factory, operator) ? ` ★ ${t.recommended}` : '' }}
          </option>
        </select>
        <p
          v-if="workload && !operatorsFor(factory).length"
          class="mt-1 text-xs text-amber-700 dark:text-amber-300"
          data-no-operators
        >
          {{ t.noOperatorsHere }}
        </p>
        <p
          v-else-if="poolJobs(factory)"
          class="mt-1 text-xs text-slate-500 dark:text-slate-400"
          data-pool-jobs
        >
          {{ t.poolJobs }}: {{ poolJobs(factory) }}
        </p>
      </div>
    </div>
  </section>
</template>

<script>
import {
  balancedAssignments,
  leastBusyOperator,
  operatorWorkloadLabel,
  routingCopy,
  workshopOperators,
} from '@/utils/task-routing'

// One operator per workshop. `value` maps a workshop id to an operator id (or
// null for "leave unassigned"); the parent keeps it and sends it on creation.
export default {
  name: 'TaskOperatorPicker',
  props: {
    factories: { type: Array, default: () => [] },
    workload: { type: Object, default: null },
    value: { type: Object, default: () => ({}) },
    error: { type: String, default: '' },
    loading: Boolean,
    disabled: Boolean,
  },
  computed: {
    t() {
      return routingCopy[this.$i18n?.locale] || routingCopy.hy
    },
    hasChoice() {
      return this.factories.some((factory) => this.selected(factory.id) !== '')
    },
  },
  methods: {
    operatorsFor(factory) {
      return workshopOperators(factory, this.workload)
    },
    label(operator) {
      return operatorWorkloadLabel(operator, this.$i18n?.locale || 'hy')
    },
    selected(factoryId) {
      const id = this.value?.[factoryId]
      return id == null || id === '' ? '' : String(id)
    },
    // Pointing at the lightest load only helps when there is a real choice.
    isRecommended(factory, operator) {
      const operators = this.operatorsFor(factory)
      return (
        operators.length > 1 &&
        Number(leastBusyOperator(operators)?.id) === Number(operator.id)
      )
    },
    poolJobs(factory) {
      return Number(
        this.workload?.factories?.find(
          (item) => Number(item.id) === Number(factory.id)
        )?.unassigned_tasks || 0
      )
    },
    choose(factoryId, raw) {
      if (this.disabled) return
      this.$emit('input', {
        ...this.value,
        [factoryId]: raw === '' ? null : Number(raw),
      })
    },
    balance() {
      if (this.disabled || !this.workload) return
      this.$emit('input', {
        ...this.value,
        ...balancedAssignments(this.factories, this.workload),
      })
    },
    clear() {
      if (this.disabled) return
      const cleared = { ...this.value }
      for (const factory of this.factories) cleared[factory.id] = null
      this.$emit('input', cleared)
    },
  },
}
</script>
