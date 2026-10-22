<template>
  <div data-route-management>
    <ProductionRouteEditor
      v-model="draft"
      :factories="factories"
      :steps="steps"
      :overall-deadline="order.dates?.finish_date || ''"
      :disabled="disabled || saving || isCanceled"
    />
    <p v-if="stale" role="alert" class="mt-3 text-sm text-amber-700">
      {{ t.stale }}
    </p>
    <p v-if="error" role="alert" class="mt-3 break-words text-sm text-red-600">
      {{ error }}
    </p>
    <div class="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        data-route-save
        :disabled="
          disabled || saving || stale || !dirty || invalid || isCanceled
        "
        class="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
        @click="save"
      >
        {{ saving ? t.saving : t.save }}
      </button>
      <button
        type="button"
        :disabled="disabled || saving"
        data-route-reset
        class="rounded-xl border border-slate-300 px-4 py-3 text-sm"
        @click="refresh"
      >
        {{ t.refresh }}
      </button>
    </div>
  </div>
</template>

<script>
import ProductionRouteEditor from '@/components/engineer/ProductionRouteEditor.vue'
import { workshopSteps } from '@/utils/task-board'
import {
  normalizeRoute,
  routeCopy,
  routeFromSteps,
  routeHasCycle,
  routeSnapshot,
} from '@/utils/production-route'
export default {
  components: { ProductionRouteEditor },
  props: {
    order: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
  },
  data: () => ({
    draft: {},
    baseline: null,
    saving: false,
    error: '',
    requestVersion: 0,
  }),
  computed: {
    t() {
      return routeCopy[this.$i18n?.locale] || routeCopy.hy
    },
    steps() {
      return workshopSteps(this.order)
    },
    factories() {
      return this.steps.map((step) => ({
        id: step.factory_id,
        name: step.factory?.name || '',
      }))
    },
    snapshot() {
      return routeSnapshot(this.steps)
    },
    sourceKey() {
      return JSON.stringify(this.snapshot)
    },
    scopeKey() {
      return `${this.$auth?.user?.id || ''}:${
        this.$store?.state?.workspace?.company?.id ||
        this.order.company_id ||
        ''
      }:${this.order.id}`
    },
    plan() {
      return normalizeRoute(this.draft, this.factories)
    },
    dirty() {
      return Boolean(
        this.baseline &&
          JSON.stringify(this.plan.stages) !==
            JSON.stringify(this.baseline.snapshot)
      )
    },
    stale() {
      return Boolean(
        this.baseline &&
          (this.baseline.scope !== this.scopeKey ||
            JSON.stringify(this.baseline.snapshot) !== this.sourceKey)
      )
    },
    invalid() {
      return !this.plan.stages.length || routeHasCycle(this.plan)
    },
    isCanceled() {
      return ['canceled', 'cancelled'].includes(this.order.status)
    },
  },
  watch: {
    scopeKey: {
      immediate: true,
      handler() {
        this.requestVersion++
        this.saving = false
        this.$emit('busy', false)
        this.resetDraft()
      },
    },
    sourceKey() {
      if (!this.dirty && !this.saving) this.resetDraft()
    },
  },
  beforeDestroy() {
    this.requestVersion++
    this.$emit('busy', false)
  },
  methods: {
    resetDraft() {
      this.draft = routeFromSteps(this.steps)
      this.baseline = { scope: this.scopeKey, snapshot: this.snapshot }
      this.error = ''
    },
    async refresh() {
      if (this.disabled || this.saving) return
      const scope = this.scopeKey
      const version = ++this.requestVersion
      const active = () =>
        scope === this.scopeKey && version === this.requestVersion
      this.saving = true
      this.error = ''
      this.$emit('busy', true)
      try {
        const { data } = await this.$axios.get(`/api/orders/${this.order.id}`)
        if (!active()) return
        const order = data.order || data
        this.draft = routeFromSteps(workshopSteps(order))
        this.baseline = { scope, snapshot: routeSnapshot(workshopSteps(order)) }
        this.$emit('updated', order)
      } catch (error) {
        if (active())
          this.error = error.response?.data?.message || this.t.failed
      } finally {
        if (active()) {
          this.saving = false
          this.$emit('busy', false)
        }
      }
    },
    async save() {
      if (
        this.disabled ||
        this.saving ||
        !this.dirty ||
        this.stale ||
        this.invalid ||
        this.isCanceled
      )
        return
      const scope = this.scopeKey
      const version = ++this.requestVersion
      const active = () =>
        scope === this.scopeKey && version === this.requestVersion
      this.saving = true
      this.error = ''
      this.$emit('busy', true)
      try {
        const { data } = await this.$axios.put(
          `/api/tasks/${this.order.id}/production-route`,
          {
            production_route: this.plan,
            previous_route: this.baseline.snapshot,
          }
        )
        if (!active()) return
        this.draft = routeFromSteps(workshopSteps(data.order))
        this.baseline = {
          scope,
          snapshot: routeSnapshot(workshopSteps(data.order)),
        }
        this.$emit('updated', data.order)
        this.$notify?.({ type: 'success', text: this.t.saved })
      } catch (error) {
        if (active())
          this.error =
            Object.values(error.response?.data?.errors || {}).flat()[0] ||
            error.response?.data?.message ||
            this.t.failed
      } finally {
        if (active()) {
          this.saving = false
          this.$emit('busy', false)
        }
      }
    },
  },
}
</script>
