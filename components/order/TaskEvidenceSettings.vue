<template>
  <form
    v-if="canManage"
    class="mt-4"
    data-task-evidence-settings
    @submit.prevent="save"
  >
    <h5 class="font-bold">{{ step ? t.workshopSettings : t.editEvidence }}</h5>
    <p class="mt-2 text-sm text-slate-500">
      {{ step ? t.workshopHelp : t.editEvidenceHelp }}
    </p>
    <div v-if="step" class="mt-3 grid gap-3 sm:grid-cols-2">
      <label class="block text-sm font-semibold"
        >{{ t.deadline }}
        <input
          v-model="deadline"
          type="date"
          :disabled="disabled || saving"
          data-step-deadline
          class="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <span class="mt-1 block text-xs font-normal text-slate-500">{{
          t.deadlineHelp
        }}</span>
      </label>
      <label class="block text-sm font-semibold"
        >{{ t.priority }}
        <select
          v-model="priority"
          :disabled="disabled || saving"
          data-step-priority
          class="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option
            v-for="value in ['normal', 'high', 'urgent']"
            :key="value"
            :value="value"
          >
            {{ t[value] }}
          </option>
        </select>
      </label>
    </div>
    <TaskCreationOptions
      :confirmation-required.sync="required"
      :confirmation-method.sync="method"
      :disabled="disabled || saving"
    />
    <p v-if="required && !method" class="mt-2 text-sm text-amber-700">
      {{ t.invalidMethod }}
    </p>
    <p v-if="error" role="alert" class="mt-3 break-words text-sm text-red-600">
      {{ error }}
    </p>
    <div class="mt-3 flex flex-wrap gap-2">
      <button
        type="submit"
        data-evidence-settings-save
        :disabled="!canSave"
        class="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
      >
        {{ saving ? t.evidenceSaving : t.evidenceSave }}
      </button>
      <button
        v-if="dirty"
        type="button"
        :disabled="disabled || saving"
        class="rounded-xl border border-slate-300 px-4 py-3 text-sm disabled:opacity-40"
        @click="reset"
      >
        {{ t.evidenceReset }}
      </button>
    </div>
  </form>
</template>

<script>
import TaskCreationOptions from '@/components/engineer/TaskCreationOptions.vue'
import { canManageTask } from '@/utils/task-routing'
import {
  apiErrorMessage,
  confirmationMethods,
  taskCopy,
} from '@/utils/task-workflow'

export default {
  components: { TaskCreationOptions },
  props: {
    order: { type: Object, required: true },
    disabled: Boolean,
    step: { type: Object, default: null },
  },
  data: () => ({
    required: false,
    method: '',
    deadline: '',
    priority: 'normal',
    baseline: null,
    saving: false,
    error: '',
    requestVersion: 0,
  }),
  computed: {
    t() {
      return taskCopy[this.$i18n?.locale] || taskCopy.hy
    },
    canManage() {
      return (
        !['canceled', 'cancelled'].includes(this.order.status) &&
        !this.step?.engineer_confirmation_at &&
        !['canceled', 'cancelled'].includes(this.step?.status) &&
        canManageTask(this.$auth?.user, this.order, this.$can('orders.update'))
      )
    },
    scopeKey() {
      return `${this.$auth?.user?.id || ''}:${
        this.$store?.state?.workspace?.company?.id ||
        this.order.company_id ||
        ''
      }:${this.order.id}:${this.step?.id || ''}`
    },
    dirty() {
      return Boolean(
        this.baseline &&
          (this.required !== this.baseline.required ||
            (this.required && this.method !== this.baseline.method) ||
            (this.step &&
              (this.deadline !== this.baseline.deadline ||
                this.priority !== this.baseline.priority)))
      )
    },
    canSave() {
      return Boolean(
        this.canManage &&
          !this.disabled &&
          !this.saving &&
          this.dirty &&
          (!this.required || confirmationMethods(this.method).length)
      )
    },
  },
  watch: {
    order: {
      immediate: true,
      handler() {
        if (
          !this.baseline ||
          this.baseline.scope !== this.scopeKey ||
          !this.dirty
        )
          this.reset()
      },
    },
    step() {
      if (!this.dirty) this.reset()
    },
    scopeKey() {
      this.requestVersion++
      this.saving = false
      this.$emit('busy', false)
      this.reset()
    },
  },
  beforeDestroy() {
    this.requestVersion++
  },
  methods: {
    reset() {
      const source = this.step || this.order
      this.required = Boolean(source.confirmation_required)
      this.method = source.confirmation_method || ''
      this.deadline = source.deadline || ''
      this.priority = source.priority || 'normal'
      this.baseline = {
        required: this.required,
        method: this.method,
        deadline: this.deadline,
        priority: this.priority,
        scope: this.scopeKey,
      }
      this.error = ''
    },
    async save() {
      if (!this.canSave) return
      const version = ++this.requestVersion
      const scope = this.scopeKey
      const current = () =>
        version === this.requestVersion && scope === this.scopeKey
      this.saving = true
      this.$emit('busy', true)
      this.error = ''
      try {
        const url = this.step
          ? `/api/tasks/${this.order.id}/workshops/${this.step.id}/settings`
          : `/api/tasks/${this.order.id}/evidence-requirements`
        const payload = {
          confirmation_required: this.required,
          confirmation_method: this.required ? this.method : null,
          previous_confirmation_required: this.baseline.required,
          previous_confirmation_method: this.baseline.required
            ? this.baseline.method
            : null,
        }
        if (this.step)
          Object.assign(payload, {
            deadline: this.deadline || null,
            priority: this.priority,
            previous_deadline: this.baseline.deadline || null,
            previous_priority: this.baseline.priority,
          })
        const { data } = await this.$axios.put(url, payload)
        if (!current()) return
        const source = this.step
          ? data.order.factory_orders.find((row) => row.id === this.step.id)
          : data.order
        this.required = Boolean(source.confirmation_required)
        this.method = source.confirmation_method || ''
        this.deadline = source.deadline || ''
        this.priority = source.priority || 'normal'
        this.baseline = {
          required: this.required,
          method: this.method,
          deadline: this.deadline,
          priority: this.priority,
          scope,
        }
        this.$emit('updated', data.order)
        this.$notify?.({ type: 'success', text: this.t.evidenceSaved })
      } catch (error) {
        if (current())
          this.error = apiErrorMessage(error, this.t.evidenceSaveFailed)
      } finally {
        if (current()) {
          this.saving = false
          this.$emit('busy', false)
        }
      }
    },
  },
}
</script>
