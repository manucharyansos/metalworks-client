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
      <span>{{ $t('file_plan.title') }}</span>
      <span aria-hidden="true">{{ open ? '−' : '+' }}</span>
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
        <label
          v-for="factory in workshops"
          :key="factory.id"
          class="flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700"
        >
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
      </div>
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
  },
  methods: {
    select(id, checked) {
      const ids = new Set(this.ids)
      if (checked) ids.add(Number(id))
      else ids.delete(Number(id))
      this.emit([...ids], this.value.inspection_required)
    },
    emit(ids, inspection) {
      if (this.disabled) return
      this.$emit('input', {
        production_factory_ids: this.workshops
          .filter((factory) => ids.includes(Number(factory.id)))
          .map((factory) => Number(factory.id)),
        inspection_required: Boolean(inspection),
      })
    },
  },
}
</script>
