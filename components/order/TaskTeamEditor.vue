<template>
  <div
    class="my-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/60"
    data-task-team
  >
    <p class="mb-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
      {{ c.teamHelp }}
    </p>
    <label class="block max-w-md">
      <span
        class="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >{{ c.primary }}</span
      >
      <select
        v-model.number="operator"
        :disabled="busy || disabled"
        class="app-control !py-2.5"
        @change="
          helpers = helpers.filter((id) => Number(id) !== Number(operator))
        "
      >
        <option value="">{{ c.chooseOperator }}</option>
        <option v-for="worker in workers" :key="worker.id" :value="worker.id">
          {{ worker.name }}
        </option>
      </select>
    </label>
    <fieldset class="mt-4" :disabled="busy || disabled">
      <legend
        class="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        {{ c.helpers }}
      </legend>
      <div class="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
        <label
          v-for="worker in workers.filter(
            (w) => Number(w.id) !== Number(operator)
          )"
          :key="worker.id"
          class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          ><input
            v-model="helpers"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300"
            :value="Number(worker.id)"
          />{{ worker.name }}</label
        >
      </div>
    </fieldset>
    <p
      v-if="!workers.length"
      class="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-300"
    >
      {{ c.noWorkers }}
    </p>
    <p
      v-if="error"
      role="alert"
      class="mt-3 text-sm font-semibold text-rose-600 dark:text-rose-300"
    >
      {{ error }}
    </p>
    <p
      v-if="saved"
      role="status"
      class="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
    >
      {{ c.teamSaved }}
    </p>
    <button
      type="button"
      class="app-button-primary mt-4 !rounded-xl !py-2.5"
      :disabled="busy || disabled || !operator || !changed"
      @click="save"
    >
      {{ c.saveTeam }}
    </button>
  </div>
</template>
<script>
import { planningCopy } from '@/utils/planning-copy'
export default {
  props: {
    step: { type: Object, required: true },
    workers: { type: Array, default: () => [] },
    disabled: Boolean,
  },
  data: () => ({
    operator: '',
    helpers: [],
    busy: false,
    error: '',
    saved: false,
    serial: 0,
  }),
  computed: {
    c() {
      return planningCopy[this.$i18n?.locale] || planningCopy.hy
    },
    scope() {
      return `${this.$auth?.user?.id}:${this.$store?.state?.workspace?.company?.id}:${this.step.id}`
    },
    signature() {
      return `${this.scope}:${this.step.team_version}`
    },
    changed() {
      return (
        Number(this.operator) !== Number(this.step.operator_id) ||
        JSON.stringify([...this.helpers].sort()) !==
          JSON.stringify(
            (this.step.helpers || []).map((h) => Number(h.id)).sort()
          )
      )
    },
  },
  watch: {
    changed: {
      immediate: true,
      handler(value) {
        this.$emit('dirty', value)
      },
    },
    signature: {
      immediate: true,
      handler() {
        ++this.serial
        this.operator = this.step.operator_id || ''
        this.helpers = (this.step.helpers || []).map((h) => Number(h.id))
        this.error = ''
        this.saved = false
        this.busy = false
      },
    },
  },
  beforeDestroy() {
    ++this.serial
  },
  methods: {
    async save() {
      if (this.busy || !this.changed) return
      const serial = ++this.serial
      this.busy = true
      this.error = ''
      this.saved = false
      try {
        const result = await this.$axios.$put(
          `/api/tasks/${this.step.order_id}/workshops/${this.step.id}/team`,
          {
            operator_id: Number(this.operator),
            helper_ids: this.helpers,
            team_version: this.step.team_version,
          }
        )
        if (serial !== this.serial) return
        this.saved = true
        this.$emit('saved', result.order)
      } catch (e) {
        if (serial === this.serial)
          this.error =
            Object.values(e.response?.data?.errors || {}).flat()[0] ||
            e.response?.data?.message ||
            this.c.teamFailed
      } finally {
        if (serial === this.serial) this.busy = false
      }
    },
  },
}
</script>
