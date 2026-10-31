<template>
  <section
    v-if="factories.length"
    class="mt-5 min-w-0 space-y-4 rounded-2xl border border-blue-200 bg-blue-50/30 p-3 sm:p-4 dark:border-blue-900"
    data-production-route
  >
    <div>
      <h3 class="font-bold">{{ t.title }}</h3>
      <p class="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
        {{ t.help }}
      </p>
    </div>
    <div>
      <div class="route-modes" role="group" :aria-label="t.title">
        <button
          v-for="mode in modes"
          :key="mode"
          type="button"
          :data-route-mode="mode"
          :aria-pressed="String(plan.mode === mode)"
          :disabled="disabled || (hasStarted && mode !== 'custom')"
          class="route-mode"
          :class="{ 'route-mode--active': plan.mode === mode }"
          @click="changeMode(mode)"
        >
          <svg
            class="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path v-if="mode === 'sequential'" d="M3 12h5m0 0-2-2m2 2-2 2M10 12h5m0 0-2-2m2 2-2 2M17 12h4" />
            <path v-else-if="mode === 'parallel'" d="M4 6h12m0 0-2-2m2 2-2 2M4 12h12m0 0-2-2m2 2-2 2M4 18h12m0 0-2-2m2 2-2 2" />
            <path v-else d="M4 6h4l8 12h4M4 18h4l3-4.5M15 6h5" />
          </svg>
          <span>{{ t[mode] }}</span>
        </button>
      </div>
    </div>
    <p class="text-sm text-slate-600 dark:text-slate-300" data-route-mode-help>
      {{ t[`${plan.mode}Help`] }}
    </p>
    <p v-if="hasStarted" class="text-xs text-slate-500">{{ t.locked }}</p>

    <ol class="route-stages" :data-route-layout="plan.mode">
      <li
        v-for="(stage, index) in plan.stages"
        :key="stage.factory_id"
        :data-route-stage="stage.factory_id"
        class="route-stage"
        :class="{ 'route-stage--last': index === plan.stages.length - 1 }"
      >
        <span class="route-stage__marker" aria-hidden="true">{{
          index + 1
        }}</span>
        <div class="route-stage__card">
          <div class="flex min-w-0 items-start gap-2">
            <div class="min-w-0 flex-1">
              <h4 class="break-words text-sm font-bold">
                {{ factoryName(stage.factory_id) }}
              </h4>
              <p
                class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400"
              >
                <span
                  v-if="fileWorkshopIds"
                  class="route-badge"
                  :class="
                    hasFiles(stage.factory_id)
                      ? 'route-badge--files'
                      : 'route-badge--extra'
                  "
                  :data-route-badge="hasFiles(stage.factory_id) ? 'files' : 'extra'"
                  >{{
                    hasFiles(stage.factory_id) ? t.withFiles : t.withoutFiles
                  }}</span
                >
                <span>{{ waitsText(stage) }}</span>
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-1">
              <template v-if="plan.mode !== 'parallel'">
                <button
                  type="button"
                  :disabled="disabled || hasStarted || !index"
                  :aria-label="`${t.up} · ${factoryName(stage.factory_id)}`"
                  :title="t.up"
                  data-route-up
                  class="route-icon-button"
                  @click="move(index, -1)"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19V5m0 0-6 6m6-6 6 6" /></svg>
                </button>
                <button
                  type="button"
                  :disabled="
                    disabled || hasStarted || index === plan.stages.length - 1
                  "
                  :aria-label="`${t.down} · ${factoryName(stage.factory_id)}`"
                  :title="t.down"
                  data-route-down
                  class="route-icon-button"
                  @click="move(index, 1)"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m0 0 6-6m-6 6-6-6" /></svg>
                </button>
              </template>
              <button
                v-if="removable(stage.factory_id)"
                type="button"
                :disabled="disabled"
                :aria-label="`${t.remove} · ${factoryName(stage.factory_id)}`"
                :title="t.remove"
                data-route-remove
                class="route-icon-button route-icon-button--danger"
                @click="$emit('remove', stage.factory_id)"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
          </div>

          <fieldset
            v-if="plan.mode === 'custom' && plan.stages.length > 1"
            class="mt-3"
          >
            <legend class="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {{ t.after }}
            </legend>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="other in otherStages(stage)"
                :key="other.factory_id"
                class="route-chip"
                :class="{
                  'route-chip--on': stage.predecessor_factory_ids.includes(
                    other.factory_id
                  ),
                }"
              >
                <input
                  type="checkbox"
                  :checked="stage.predecessor_factory_ids.includes(other.factory_id)"
                  :disabled="disabled || started(stage.factory_id)"
                  :data-route-predecessor="other.factory_id"
                  class="h-4 w-4 shrink-0 rounded"
                  @change="
                    toggle(stage.factory_id, other.factory_id, $event.target.checked)
                  "
                />
                <span class="min-w-0 break-words">{{
                  factoryName(other.factory_id)
                }}</span>
              </label>
            </div>
          </fieldset>

          <div class="mt-3 flex flex-wrap items-end gap-2">
            <label class="route-deadline">
              <span class="block text-xs font-semibold text-slate-600 dark:text-slate-300">{{
                t.deadline
              }}</span>
              <input
                type="date"
                :value="stage.deadline"
                :max="overallDate || null"
                :disabled="disabled || closed(stage.factory_id)"
                data-route-deadline
                class="route-deadline__input"
                @input="setDeadline(stage.factory_id, $event.target.value)"
              />
            </label>
            <button
              v-if="stage.deadline && !disabled && !closed(stage.factory_id)"
              type="button"
              class="mb-2 text-xs font-semibold text-slate-500 underline hover:text-slate-800 dark:hover:text-white"
              data-route-clear-deadline
              @click="setDeadline(stage.factory_id, '')"
            >
              {{ t.clearDeadline }}
            </button>
          </div>
          <p
            v-if="warnings.includes(stage.factory_id)"
            class="mt-2 text-sm text-amber-700 dark:text-amber-300"
            data-route-warning
          >
            {{ t.warning }}
          </p>
        </div>
      </li>
    </ol>

    <div v-if="addable.length" class="route-add" data-route-add>
      <p class="text-sm font-semibold">{{ t.addTitle }}</p>
      <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {{ t.addHelp }}
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="factory in addable"
          :key="factory.id"
          type="button"
          :disabled="disabled"
          :data-route-add-workshop="factory.id"
          class="route-add-button"
          @click="$emit('add', factory.id)"
        >
          <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" d="M12 5v14M5 12h14" /></svg>
          <span class="break-words">{{ factory.name }}</span>
        </button>
      </div>
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
    // Workshops that can still be added as stages (task creation only).
    available: { type: Array, default: () => [] },
    // Workshops that receive files; the others were added to the route and
    // can be removed again. Null when the route belongs to a saved task.
    fileWorkshopIds: { type: Array, default: null },
  },
  data: () => ({ modes: ['sequential', 'parallel', 'custom'] }),
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
    overallDate() {
      return String(this.overallDeadline || '').slice(0, 10)
    },
    addable() {
      const inRoute = new Set(this.plan.stages.map((stage) => stage.factory_id))
      return this.available.filter((factory) => !inRoute.has(Number(factory.id)))
    },
  },
  methods: {
    factoryName(id) {
      return (
        this.factories.find((row) => Number(row.id) === Number(id))?.name || '—'
      )
    },
    hasFiles(id) {
      return (this.fileWorkshopIds || []).map(Number).includes(Number(id))
    },
    removable(id) {
      return (
        this.fileWorkshopIds !== null && !this.hasFiles(id) && !this.started(id)
      )
    },
    otherStages(stage) {
      return this.plan.stages.filter((row) => row.factory_id !== stage.factory_id)
    },
    waitsText(stage) {
      return stage.predecessor_factory_ids.length
        ? `${this.t.after}: ${stage.predecessor_factory_ids
            .map(this.factoryName)
            .join(', ')}`
        : this.t.start
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

<style scoped>
.route-modes {
  @apply inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900;
}
.route-mode {
  @apply inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800;
}
.route-mode--active {
  @apply bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-600;
}
.route-stages {
  @apply space-y-3;
}
.route-stage {
  @apply relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3;
}
/* The line joining one stage to the next. */
.route-stage:not(.route-stage--last)::before {
  @apply absolute bg-blue-200 dark:bg-blue-900;
  content: '';
  left: calc(1rem - 1px);
  top: 2.25rem;
  bottom: -0.75rem;
  width: 2px;
}
[data-route-layout='parallel'] .route-stage::before {
  display: none;
}
.route-stage__marker {
  @apply relative z-10 mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm;
}
[data-route-layout='parallel'] .route-stage__marker {
  @apply border-2 border-blue-500 bg-white text-blue-700 dark:bg-slate-900 dark:text-blue-200;
}
.route-stage__card {
  @apply min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900;
}
.route-badge {
  @apply inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold;
}
.route-badge--files {
  @apply bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300;
}
.route-badge--extra {
  @apply bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300;
}
.route-icon-button {
  @apply inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800;
}
.route-icon-button--danger {
  @apply text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40;
}
.route-chip {
  @apply inline-flex max-w-full cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium transition hover:border-blue-300 dark:border-slate-700;
}
.route-chip--on {
  @apply border-blue-400 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-100;
}
.route-deadline {
  @apply min-w-0 flex-1 basis-48;
}
.route-deadline__input {
  @apply mt-1 block w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:max-w-xs;
}
.route-add {
  @apply rounded-xl border border-dashed border-slate-300 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/50;
}
.route-add-button {
  @apply inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800;
}
</style>
