<template>
  <section
    class="min-w-0 rounded-xl border border-slate-200 dark:border-slate-700"
    data-file-production-plan
  >
    <button
      type="button"
      :disabled="disabled"
      :aria-expanded="open"
      class="flex w-full items-center justify-between gap-3 p-3 text-left text-sm font-semibold disabled:opacity-50"
      data-file-production-plan-toggle
      @click="open = !open"
    >
      <span class="min-w-0">
        <span class="block">{{ $t('file_plan.title') }}</span>
        <span
          v-if="!open && summary"
          class="mt-0.5 block truncate text-xs font-normal text-slate-500 dark:text-slate-400"
          data-file-plan-summary
          >{{ summary }}</span
        >
      </span>
      <span class="shrink-0" aria-hidden="true">{{ open ? '−' : '+' }}</span>
    </button>
    <div
      v-show="open"
      class="space-y-3 border-t border-slate-200 p-3 dark:border-slate-700"
      data-file-production-plan-options
    >
      <p class="text-xs leading-5 text-slate-500 dark:text-slate-400">
        {{ $t('file_plan.help') }}
      </p>
      <p v-if="loading" role="status" class="text-sm">
        {{ $t('order_configuration.workshops_loading') }}
      </p>
      <div
        v-else-if="error"
        role="alert"
        class="text-sm text-red-600 dark:text-red-300"
      >
        <p>{{ error }}</p>
        <button
          type="button"
          class="mt-2 font-semibold underline"
          @click="$emit('retry')"
        >
          {{ $t('file_upload.retry') }}
        </button>
      </div>
      <div v-else class="grid gap-2 sm:grid-cols-2">
        <div
          v-for="factory in workshops"
          :key="factory.id"
          class="min-w-0 rounded-lg border p-3 text-sm"
          :class="
            ids.includes(Number(factory.id))
              ? 'border-blue-300 bg-blue-50/40 dark:border-blue-800 dark:bg-blue-950/20'
              : 'border-slate-200 dark:border-slate-700'
          "
        >
          <label class="flex min-w-0 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              :checked="ids.includes(Number(factory.id))"
              :disabled="disabled"
              :data-file-plan-workshop="factory.id"
              class="mt-0.5 h-5 w-5 shrink-0"
              @change="select(factory.id, $event.target.checked)"
            />
            <span class="min-w-0 break-words"
              ><span
                v-if="factory.operation !== 'other'"
                class="block font-semibold"
                >{{ $t('file_plan.' + factory.operation) }}</span
              ><span>{{ factory.name }}</span></span
            >
          </label>
          <div
            v-if="ids.includes(Number(factory.id)) && activeFunctions(factory).length"
            class="mt-2 flex flex-wrap gap-1.5 pl-8"
            role="group"
            :aria-label="`${$t('file_plan.functions')} · ${factory.name}`"
            :data-file-plan-functions="factory.id"
          >
            <label
              v-for="fn in activeFunctions(factory)"
              :key="fn.id"
              class="inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition"
              :class="
                functionIds.includes(Number(fn.id))
                  ? 'border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              "
            >
              <input
                type="checkbox"
                :checked="functionIds.includes(Number(fn.id))"
                :disabled="disabled"
                :data-file-plan-function="fn.id"
                class="h-3.5 w-3.5 shrink-0"
                @change="toggleFunction(fn.id, $event.target.checked)"
              />
              <span class="min-w-0 break-words">{{ fn.name }}</span>
            </label>
          </div>
        </div>
      </div>
      <p
        v-if="!loading && !error && hasFunctions"
        class="text-xs leading-5 text-slate-500 dark:text-slate-400"
      >
        {{ $t('file_plan.functions_help') }}
      </p>
      <label
        class="flex items-start gap-3 rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-950/30"
      >
        <input
          type="checkbox"
          :checked="value.inspection_required"
          :disabled="disabled || loading || !!error"
          class="mt-0.5 h-5 w-5 shrink-0"
          data-file-plan-inspection
          @change="emit(ids, $event.target.checked)"
        />
        <span
          ><span class="block font-semibold">{{
            $t('file_plan.inspection')
          }}</span
          ><span
            class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
            >{{ $t('file_plan.inspection_help') }}</span
          ></span
        >
      </label>
    </div>
  </section>
</template>
<script>
import { productionWorkshopOptions } from '@/utils/workshop-catalog'
export default {
  props: {
    value: {
      type: Object,
      default: () => ({
        production_factory_ids: null,
        production_function_ids: null,
        inspection_required: false,
      }),
    },
    factories: { type: Array, default: () => [] },
    defaultFactoryId: { type: [Number, String], default: null },
    disabled: Boolean,
    loading: Boolean,
    error: { type: String, default: '' },
  },
  data: () => ({ open: false }),
  computed: {
    workshops() {
      return productionWorkshopOptions(this.factories)
    },
    ids() {
      const ids =
        this.value.production_factory_ids ??
        (this.defaultFactoryId ? [Number(this.defaultFactoryId)] : [])
      return ids
        .map(Number)
        .filter((id) =>
          this.workshops.some((factory) => Number(factory.id) === id)
        )
    },
    functionIds() {
      return (this.value.production_function_ids || []).map(Number)
    },
    hasFunctions() {
      return this.workshops.some(
        (factory) =>
          this.ids.includes(Number(factory.id)) &&
          this.activeFunctions(factory).length
      )
    },
    // Collapsed header: the chosen workshops and how many functions.
    summary() {
      const names = this.workshops
        .filter((factory) => this.ids.includes(Number(factory.id)))
        .map((factory) => factory.name)
      if (!names.length) return ''
      const count = this.functionIds.length
      return count
        ? `${names.join(' → ')} · ${this.$t('file_plan.functions_count', {
            count,
          })}`
        : names.join(' → ')
    },
  },
  methods: {
    activeFunctions(factory) {
      return (factory.functions || []).filter((fn) => fn.is_active !== false)
    },
    select(id, checked) {
      const ids = new Set(this.ids)
      if (checked) ids.add(Number(id))
      else ids.delete(Number(id))
      this.emit([...ids], this.value.inspection_required)
    },
    toggleFunction(id, checked) {
      const ids = new Set(this.functionIds)
      if (checked) ids.add(Number(id))
      else ids.delete(Number(id))
      this.emit(this.ids, this.value.inspection_required, [...ids])
    },
    // Functions of workshops that are no longer on the path are dropped.
    emit(ids, inspection, functions = this.functionIds) {
      if (this.disabled) return
      const chosen = this.workshops.filter((factory) =>
        ids.includes(Number(factory.id))
      )
      const allowed = new Set(
        chosen.flatMap((factory) =>
          this.activeFunctions(factory).map((fn) => Number(fn.id))
        )
      )
      this.$emit('input', {
        production_factory_ids: chosen.map((factory) => Number(factory.id)),
        production_function_ids: functions
          .map(Number)
          .filter((id) => allowed.has(id)),
        inspection_required: Boolean(inspection),
      })
    },
  },
}
</script>
