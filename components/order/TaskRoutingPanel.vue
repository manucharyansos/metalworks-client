<template>
  <section
    v-if="canManage"
    class="my-5 rounded-2xl border border-blue-200 bg-blue-50/30 p-4 dark:border-blue-900 dark:bg-blue-950/20"
    data-task-routing
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h4 class="font-bold">{{ t.routing }}</h4>
        <p class="mt-1 text-sm text-slate-500">{{ t.routingHelp }}</p>
      </div>
      <button
        type="button"
        :disabled="loading || saving"
        class="rounded-xl border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
        @click="loadWorkload"
      >
        {{ loading ? t.loading : t.refresh }}
      </button>
    </div>
    <p v-if="error" role="alert" class="mt-3 break-words text-sm text-red-600">
      {{ error }}
    </p>
    <div
      v-for="step in order.factory_orders || []"
      :key="step.id"
      class="mt-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
      :data-assignment-step="step.id"
    >
      <p class="font-semibold">{{ step.factory?.name }}</p>
      <p
        v-if="step.is_blocked"
        class="mt-1 text-xs text-amber-700 dark:text-amber-300"
      >
        {{ t.blocked }} · {{ predecessorName(step) }}
      </p>
      <p v-if="locked(step)" class="mt-2 text-sm text-slate-500">
        {{ step.operator?.name || t.unassigned }} · {{ t.locked }}
      </p>
      <div v-else class="mt-2 flex flex-col gap-2 sm:flex-row">
        <select
          v-model="assignmentDrafts[step.id]"
          :aria-label="`${t.operator} · ${step.factory?.name}`"
          :disabled="loading || saving || !workload"
          class="min-w-0 w-full flex-1 rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          data-assignment-select
        >
          <option value="">{{ t.unassigned }}</option>
          <option
            v-for="operator in operatorsFor(step.factory_id)"
            :key="operator.id"
            :value="String(operator.id)"
          >
            {{ operatorLabel(operator) }}
          </option>
        </select>
        <button
          type="button"
          :disabled="
            saving ||
            !workload ||
            assignmentDrafts[step.id] === currentOperator(step)
          "
          class="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
          data-assignment-save
          @click="assign(step)"
        >
          {{ savingStepId === step.id ? t.saving : t.save }}
        </button>
      </div>
    </div>
    <details
      v-if="availableFactories.length && !isCanceled"
      class="mt-5"
      data-add-work
    >
      <summary class="cursor-pointer font-bold">+ {{ t.addWork }}</summary>
      <form class="mt-4 space-y-4" @submit.prevent="addWork">
        <label class="block text-sm font-semibold"
          >{{ t.factory }}
          <select
            v-model="factoryId"
            :disabled="saving"
            class="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            data-work-factory
          >
            <option value="">{{ t.chooseFactory }}</option>
            <option
              v-for="factory in availableFactories"
              :key="factory.id"
              :value="String(factory.id)"
            >
              {{ factory.name
              }}{{ existingStep(factory.id) ? ` · ${t.addFiles}` : '' }}
            </option>
          </select>
        </label>
        <template v-if="factoryId">
          <label class="block text-sm font-semibold"
            >{{ t.operator }}
            <select
              v-model="newOperatorId"
              :disabled="saving"
              class="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              data-work-operator
            >
              <option value="">{{ t.unassigned }}</option>
              <option
                v-for="operator in operatorsFor(factoryId)"
                :key="operator.id"
                :value="String(operator.id)"
              >
                {{ operatorLabel(operator) }}
              </option>
            </select>
          </label>
          <label class="block text-sm font-semibold"
            >{{ t.after }}
            <select
              v-model="dependsOnId"
              :disabled="saving"
              class="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              data-work-predecessor
            >
              <option value="">{{ t.independent }}</option>
              <option
                v-for="step in predecessors"
                :key="step.id"
                :value="String(step.id)"
              >
                {{ step.factory?.name }} · {{ t.afterSuffix }}
              </option>
            </select>
          </label>
          <fieldset class="space-y-2">
            <legend class="font-semibold">{{ t.files }}</legend>
            <p class="my-2 text-sm text-slate-500">{{ t.filesHelp }}</p>
            <div
              v-for="file in availableFiles"
              :key="file.id"
              class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <label class="flex min-w-0 flex-1 items-center gap-3"
                ><input
                  v-model="selectedFileIds"
                  type="checkbox"
                  :value="file.id"
                  :disabled="saving"
                  :data-work-file="file.id"
                  class="h-5 w-5 shrink-0"
                /><span class="min-w-0 break-all text-sm">{{
                  file.original_name
                }}</span></label
              >
              <input
                v-if="selectedFileIds.includes(file.id)"
                v-model.number="quantities[file.id]"
                type="number"
                min="1"
                max="1000000"
                :aria-label="`${t.quantity} · ${file.original_name}`"
                :disabled="saving"
                class="w-20 shrink-0 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </fieldset>
          <p
            v-if="order.status === 'completed'"
            class="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
          >
            {{ t.reopen }}
          </p>
          <button
            type="submit"
            :disabled="!canAdd"
            class="w-full rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-40"
            data-work-save
          >
            {{ savingWork ? t.saving : t.add }}
          </button>
        </template>
      </form>
    </details>
  </section>
</template>

<script>
import {
  assignmentLocked,
  canManageTask,
  operatorWorkloadLabel,
  routingCopy,
  taskFiles,
} from '@/utils/task-routing'
export default {
  props: { order: { type: Object, required: true } },
  data: () => ({
    workload: null,
    loading: false,
    error: '',
    assignmentDrafts: {},
    previousOperators: {},
    savingStepId: null,
    savingWork: false,
    factoryId: '',
    newOperatorId: '',
    dependsOnId: '',
    selectedFileIds: [],
    quantities: {},
  }),
  computed: {
    t() {
      return routingCopy[this.$i18n?.locale] || routingCopy.hy
    },
    canManage() {
      return canManageTask(
        this.$auth?.user,
        this.order,
        this.$can('orders.update')
      )
    },
    saving() {
      return this.savingStepId != null || this.savingWork
    },
    isCanceled() {
      return ['canceled', 'cancelled'].includes(this.order.status)
    },
    availableFactories() {
      return (this.workload?.factories || []).filter((factory) => {
        const step = this.existingStep(factory.id)
        return (
          !step ||
          (!this.locked(step) &&
            [null, '', 'pending', 'waiting'].includes(step.status))
        )
      })
    },
    availableFiles() {
      const attached = new Set(
        (this.existingStep(this.factoryId)?.files || []).map((file) => file.id)
      )
      return taskFiles(this.order).filter((file) => !attached.has(file.id))
    },
    predecessors() {
      return (this.order.factory_orders || []).filter(
        (step) =>
          String(step.factory_id) !== this.factoryId &&
          !['canceled', 'cancelled'].includes(step.status)
      )
    },
    canAdd() {
      return Boolean(
        !this.saving &&
          this.workload &&
          this.factoryId &&
          this.selectedFileIds.length &&
          this.selectedFileIds.every(
            (id) =>
              this.availableFiles.some((file) => file.id === id) &&
              Number.isInteger(this.quantities[id]) &&
              this.quantities[id] > 0 &&
              this.quantities[id] <= 1000000
          )
      )
    },
  },
  watch: {
    order: {
      immediate: true,
      handler() {
        this.syncDrafts()
      },
    },
    factoryId() {
      const step = this.existingStep(this.factoryId)
      this.newOperatorId = step?.operator_id ? String(step.operator_id) : ''
      this.dependsOnId = step
        ? step.depends_on_id
          ? String(step.depends_on_id)
          : ''
        : this.predecessors.length === 1
        ? String(this.predecessors[0].id)
        : ''
      this.selectedFileIds = []
      for (const file of this.availableFiles)
        this.$set(this.quantities, file.id, Number(file.quantity) || 1)
    },
  },
  mounted() {
    if (this.canManage) this.loadWorkload()
  },
  methods: {
    locked(step) {
      return this.isCanceled || assignmentLocked(step)
    },
    currentOperator(step) {
      return step.operator_id ? String(step.operator_id) : ''
    },
    existingStep(id) {
      return (this.order.factory_orders || []).find(
        (step) => String(step.factory_id) === String(id)
      )
    },
    operatorsFor(factoryId) {
      return (
        this.workload?.factories.find(
          (factory) => String(factory.id) === String(factoryId)
        )?.operators || []
      )
    },
    operatorLabel(operator) {
      return operatorWorkloadLabel(operator, this.$i18n?.locale)
    },
    predecessorName(step) {
      return (
        (this.order.factory_orders || []).find(
          (row) => row.id === step.depends_on_id
        )?.factory?.name || ''
      )
    },
    syncDrafts() {
      for (const step of this.order.factory_orders || []) {
        if (
          !(step.id in this.assignmentDrafts) ||
          this.assignmentDrafts[step.id] === this.previousOperators[step.id]
        )
          this.$set(this.assignmentDrafts, step.id, this.currentOperator(step))
        this.$set(this.previousOperators, step.id, this.currentOperator(step))
      }
    },
    explain(error) {
      return (
        Object.values(error.response?.data?.errors || {}).flat()[0] ||
        error.response?.data?.message ||
        error.message ||
        this.t.loadFailed
      )
    },
    async loadWorkload() {
      if (this.saving) return
      this.loading = true
      this.error = ''
      try {
        const { data } = await this.$axios.get('/api/task-workload')
        this.workload = data
      } catch (error) {
        this.error = this.explain(error)
      } finally {
        this.loading = false
      }
    },
    async assign(step) {
      if (!this.canManage || this.saving || this.locked(step)) return
      this.savingStepId = step.id
      this.error = ''
      try {
        const { data } = await this.$axios.put(
          `/api/tasks/${this.order.id}/workshops/${step.id}/operator`,
          {
            operator_id: this.assignmentDrafts[step.id]
              ? Number(this.assignmentDrafts[step.id])
              : null,
          }
        )
        this.workload = data.workload
        this.$emit('updated', data.order)
        this.$notify?.({ type: 'success', text: this.t.saved })
      } catch (error) {
        this.error = this.explain(error)
      } finally {
        this.savingStepId = null
      }
    },
    async addWork() {
      if (!this.canManage || !this.canAdd) return
      this.savingWork = true
      this.error = ''
      try {
        const { data } = await this.$axios.post(
          `/api/tasks/${this.order.id}/workshops`,
          {
            factory_id: Number(this.factoryId),
            operator_id: this.newOperatorId ? Number(this.newOperatorId) : null,
            depends_on_id: this.dependsOnId ? Number(this.dependsOnId) : null,
            files: this.selectedFileIds.map((id) => ({
              id,
              quantity: this.quantities[id],
            })),
          }
        )
        this.workload = data.workload
        this.factoryId = ''
        this.selectedFileIds = []
        this.$emit('updated', data.order)
        this.$notify?.({ type: 'success', text: this.t.added })
      } catch (error) {
        this.error = this.explain(error)
      } finally {
        this.savingWork = false
      }
    },
  },
}
</script>
