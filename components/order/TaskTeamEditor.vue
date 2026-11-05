<template>
  <div class="my-3 rounded-xl border p-3" data-task-team>
    <p class="mb-2 text-sm text-slate-500">{{ c.teamHelp }}</p>
    <label class="block text-sm"
      >{{ c.primary }}
      <select
        v-model.number="operator"
        :disabled="busy || disabled"
        class="mt-1 block w-full rounded border bg-transparent p-2"
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
    <fieldset class="mt-3" :disabled="busy || disabled">
      <legend class="text-sm font-semibold">{{ c.helpers }}</legend>
      <div class="mt-2 flex max-h-40 flex-wrap gap-3 overflow-y-auto">
        <label
          v-for="worker in workers.filter(
            (w) => Number(w.id) !== Number(operator)
          )"
          :key="worker.id"
          class="flex items-center gap-2 text-sm"
          ><input
            v-model="helpers"
            type="checkbox"
            :value="Number(worker.id)"
          />{{ worker.name }}</label
        >
      </div>
    </fieldset>
    <p v-if="!workers.length" class="mt-2 text-sm text-amber-700">
      {{ c.noWorkers }}
    </p>
    <p v-if="error" role="alert" class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>
    <p v-if="saved" role="status" class="mt-2 text-sm text-green-700">
      {{ c.teamSaved }}
    </p>
    <button
      type="button"
      class="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
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
