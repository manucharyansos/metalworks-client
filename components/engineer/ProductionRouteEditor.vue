<template>
  <section
    v-if="factories.length"
    class="mt-5 min-w-0 space-y-3 rounded-2xl border border-blue-200 bg-blue-50/30 p-3 sm:p-4 dark:border-blue-900"
    data-production-route
  >
    <h3 class="font-bold">{{ t.title }}</h3>
    <p class="text-sm text-slate-500">{{ t.help }}</p>
    <div class="flex flex-wrap gap-2" role="group" :aria-label="t.title">
      <button
        v-for="mode in ['sequential', 'parallel', 'custom']"
        :key="mode"
        type="button"
        :data-route-mode="mode"
        :aria-pressed="plan.mode === mode"
        :disabled="disabled || (hasStarted && mode !== 'custom')"
        class="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50"
        :class="
          plan.mode === mode
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-slate-300 bg-white text-slate-900 dark:bg-slate-900 dark:text-white'
        "
        @click="changeMode(mode)"
      >
        {{ t[mode] }}
      </button>
    </div>
    <p class="text-sm text-slate-500">{{ t[`${plan.mode}Help`] }}</p>
    <p v-if="hasStarted" class="text-xs text-slate-500">{{ t.locked }}</p>
    <div
      v-for="(stage, index) in plan.stages"
      :key="stage.factory_id"
      :data-route-stage="stage.factory_id"
      class="min-w-0 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
    >
      <div class="flex items-center justify-between gap-2">
        <h4 class="min-w-0 break-words font-bold">
          {{ index + 1 }}. {{ factoryName(stage.factory_id) }}
        </h4>
        <div v-if="plan.mode !== 'parallel'" class="flex shrink-0 gap-1">
          <button
            type="button"
            :disabled="disabled || hasStarted || !index"
            :aria-label="`${t.up} · ${factoryName(stage.factory_id)}`"
            data-route-up
            class="rounded-lg border px-3 py-1 disabled:opacity-30"
            @click="move(index, -1)"
          >
            ↑
          </button>
          <button
            type="button"
            :disabled="
              disabled || hasStarted || index === plan.stages.length - 1
            "
            :aria-label="`${t.down} · ${factoryName(stage.factory_id)}`"
            data-route-down
            class="rounded-lg border px-3 py-1 disabled:opacity-30"
            @click="move(index, 1)"
          >
            ↓
          </button>
        </div>
      </div>
      <fieldset v-if="plan.mode === 'custom'" class="mt-3 space-y-2">
        <legend class="mb-2 text-sm font-semibold">{{ t.after }}</legend>
        <label
          v-for="other in plan.stages.filter(
            (row) => row.factory_id !== stage.factory_id
          )"
          :key="other.factory_id"
          class="flex items-start gap-2 text-sm"
        >
          <input
            type="checkbox"
            :checked="stage.predecessor_factory_ids.includes(other.factory_id)"
            :disabled="disabled || started(stage.factory_id)"
            :data-route-predecessor="other.factory_id"
            class="mt-0.5 h-4 w-4 shrink-0"
            @change="
              toggle(stage.factory_id, other.factory_id, $event.target.checked)
            "
          />
          <span class="min-w-0 break-words">{{
            factoryName(other.factory_id)
          }}</span>
        </label>
        <p class="text-xs text-slate-500">
          {{ stage.predecessor_factory_ids.length ? t.all : t.start }}
        </p>
      </fieldset>
      <p v-else class="mt-2 text-sm text-slate-500">
        {{
          stage.predecessor_factory_ids.length
            ? `${t.after}: ${stage.predecessor_factory_ids
                .map(factoryName)
                .join(', ')}`
            : t.start
        }}
      </p>
      <label class="mt-3 block text-sm font-semibold"
        >{{ t.deadline }}
        <input
          type="date"
          :value="stage.deadline"
          :disabled="disabled || closed(stage.factory_id)"
          data-route-deadline
          class="mt-2 block min-w-0 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          @input="setDeadline(stage.factory_id, $event.target.value)"
        />
      </label>
      <p
        v-if="warnings.includes(stage.factory_id)"
        class="mt-2 text-sm text-amber-700 dark:text-amber-300"
        data-route-warning
      >
        {{ t.warning }}
      </p>
    </div>
    <p class="text-xs text-slate-500">{{ t.deadlineHelp }}</p>
    <p v-if="cycle" role="alert" class="text-sm text-red-600">{{ t.cycle }}</p>
  </section>
</template>

<script>
import {
  normalizeRoute,
  routeCopy,
  routeHasCycle,
  routeWarnings,
} from '@/utils/production-route'
export default {
  props: {
    value: { type: Object, default: () => ({}) },
    factories: { type: Array, default: () => [] },
    steps: { type: Array, default: () => [] },
    overallDeadline: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },
  computed: {
    t() {
      return routeCopy[this.$i18n?.locale] || routeCopy.hy
    },
    plan() {
      return normalizeRoute(this.value, this.factories)
    },
    cycle() {
      return routeHasCycle(this.plan)
    },
    warnings() {
      return routeWarnings(this.plan, this.overallDeadline)
    },
    hasStarted() {
      return this.steps.some((step) => this.started(step.factory_id))
    },
  },
  methods: {
    factoryName(id) {
      return (
        this.factories.find((row) => Number(row.id) === Number(id))?.name || '—'
      )
    },
    started(id) {
      const step = this.steps.find(
        (row) => Number(row.factory_id) === Number(id)
      )
      return Boolean(
        step && ![null, '', 'pending', 'waiting'].includes(step.status)
      )
    },
    closed(id) {
      const step = this.steps.find(
        (row) => Number(row.factory_id) === Number(id)
      )
      return Boolean(
        step &&
          (step.completed_at ||
            step.awaiting_engineer_confirmation ||
            ['finished', 'completed', 'done', 'canceled', 'cancelled'].includes(
              step.status
            ))
      )
    },
    emit(plan) {
      if (!this.disabled)
        this.$emit('input', normalizeRoute(plan, this.factories))
    },
    changeMode(mode) {
      if (!this.hasStarted || mode === 'custom')
        this.emit({ ...this.plan, mode })
    },
    move(index, direction) {
      if (this.hasStarted) return
      const stages = [...this.plan.stages]
      const next = index + direction
      if (next < 0 || next >= stages.length) return
      ;[stages[index], stages[next]] = [stages[next], stages[index]]
      this.emit({ ...this.plan, stages })
    },
    toggle(id, predecessor, checked) {
      if (this.started(id)) return
      this.emit({
        ...this.plan,
        stages: this.plan.stages.map((row) =>
          row.factory_id === id
            ? {
                ...row,
                predecessor_factory_ids: checked
                  ? [...row.predecessor_factory_ids, predecessor]
                  : row.predecessor_factory_ids.filter(
                      (value) => value !== predecessor
                    ),
              }
            : row
        ),
      })
    },
    setDeadline(id, deadline) {
      if (!this.closed(id))
        this.emit({
          ...this.plan,
          stages: this.plan.stages.map((row) =>
            row.factory_id === id ? { ...row, deadline: deadline || null } : row
          ),
        })
    },
  },
}
</script>
