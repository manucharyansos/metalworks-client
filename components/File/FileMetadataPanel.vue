<template>
  <section
    v-if="error || hasContent"
    class="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
    data-file-metadata
    :aria-busy="loading"
  >
    <div
      class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800"
    >
      <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">
        {{ $t('file_details.title') }}
      </h4>
      <span
        v-if="details"
        class="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300"
      >
        {{
          $t(
            details.source === 'task'
              ? 'file_details.task_snapshot'
              : 'file_details.project_values'
          )
        }}
      </span>
    </div>
    <p v-if="loading" role="status" class="px-4 py-5 text-sm text-slate-500">
      {{ $t('file_details.loading') }}
    </p>
    <div
      v-else-if="error"
      class="space-y-2 px-4 py-4"
      role="alert"
      data-file-metadata-error
    >
      <p class="text-sm text-red-600 dark:text-red-300">{{ error }}</p>
      <button
        type="button"
        class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-700"
        data-file-metadata-retry
        @click="load"
      >
        {{ $t('file_upload.retry') }}
      </button>
    </div>
    <template v-else>
      <dl
        v-if="visibleFields.length"
        class="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800"
        :class="gridColumns"
      >
        <div
          v-for="field in visibleFields"
          :key="field.key"
          class="min-w-0 bg-white px-4 py-3 dark:bg-slate-900"
          :data-file-attribute="field.key"
        >
          <dt class="text-xs text-slate-500 dark:text-slate-400">
            {{ $t(field.label) }}
          </dt>
          <dd
            class="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100"
          >
            {{ present(model[field.key]) }}
          </dd>
        </div>
      </dl>
      <div
        v-if="showRoute"
        class="space-y-3 px-4 py-4"
        :class="visibleFields.length ? 'border-t border-slate-100 dark:border-slate-800' : ''"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h5 class="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {{
              $t(
                model.is_reference_file
                  ? 'file_details.reference_workshops'
                  : 'file_plan.title'
              )
            }}
          </h5>
          <span
            v-if="!model.is_reference_file && model.inspection_required"
            class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            :class="
              model.inspection_required
                ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
            "
            data-file-inspection
          >
            <span
              class="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
              aria-hidden="true"
            />
            {{
              $t(
                model.inspection_required
                  ? 'file_plan.inspection_required'
                  : 'file_details.inspection_not_required'
              )
            }}
          </span>
        </div>
        <ul
          v-if="model.workshops.length"
          class="flex flex-wrap gap-2"
          data-file-workshops
        >
          <li
            v-for="workshop in model.workshops"
            :key="workshop.id"
            class="min-w-0 max-w-full rounded-lg border px-3 py-2 text-xs"
            :class="
              workshop.current
                ? 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
                : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200'
            "
            :data-file-workshop="workshop.id"
          >
            <span class="flex min-w-0 items-center gap-2">
              <span class="break-words font-semibold">{{ workshop.name }}</span>
              <span
                v-if="workshop.current"
                class="shrink-0 text-[10px] opacity-70"
                >{{ $t('file_details.current_workshop') }}</span
              >
              <span
                v-else-if="workshop.is_active === false"
                class="text-[10px] opacity-60"
                >{{ $t('file_details.archived') }}</span
              >
            </span>
            <span
              v-if="(workshop.functions || []).length"
              class="mt-1.5 flex flex-wrap gap-1"
              :aria-label="$t('file_plan.functions')"
              :data-file-workshop-functions="workshop.id"
            >
              <span
                v-for="fn in workshop.functions"
                :key="fn.id || fn.name"
                class="rounded-md bg-violet-100 px-1.5 py-0.5 text-[11px] font-semibold text-violet-800 dark:bg-violet-950/60 dark:text-violet-200"
                >✓ {{ fn.name }}</span
              >
            </span>
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<script>
import {
  fileDetailsContext,
  fileDetailsFallback,
  fileDetailsIdentity,
} from '@/utils/file-production-details'

export default {
  props: {
    file: { type: Object, required: true },
    orderId: { type: [Number, String], default: null },
  },
  data: () => ({ details: null, loading: false, error: '', request: 0 }),
  computed: {
    scopeKey() {
      return fileDetailsIdentity(
        this.file,
        this.orderId,
        this.$store?.state?.workspace,
        this.$auth?.user
      )
    },
    model() {
      return this.details || fileDetailsFallback(this.file)
    },
    fields() {
      return [
        { key: 'quantity', label: 'file_details.quantity' },
        { key: 'material_type', label: 'file_details.material' },
        { key: 'thickness', label: 'file_details.thickness' },
        { key: 'dimensions', label: 'file_plan.dimensions' },
      ]
    },
    // Only saved values are shown; 0 is a real value (e.g. thickness 0).
    visibleFields() {
      return this.fields.filter((field) => this.isSet(this.model[field.key]))
    },
    gridColumns() {
      return (
        {
          1: 'sm:grid-cols-1',
          2: 'sm:grid-cols-2',
          3: 'sm:grid-cols-3',
        }[this.visibleFields.length] || 'sm:grid-cols-4'
      )
    },
    showRoute() {
      return (
        (this.model.workshops || []).length > 0 ||
        (!this.model.is_reference_file && !!this.model.inspection_required)
      )
    },
    hasContent() {
      return this.visibleFields.length > 0 || this.showRoute
    },
  },
  watch: { scopeKey: { immediate: true, handler: 'load' } },
  beforeDestroy() {
    ++this.request
  },
  methods: {
    isSet(value) {
      return !(value === null || value === undefined || value === '')
    },
    present(value) {
      return this.isSet(value) ? value : this.$t('file_details.not_set')
    },
    async load() {
      const request = ++this.request
      this.details = null
      this.error = ''
      this.loading = true
      this.$emit('loading')
      try {
        if (!this.file.id) {
          this.details = fileDetailsFallback(this.file)
        } else {
          const data = await this.$axios.$get(
            `/api/secure-files/pmp/${encodeURIComponent(this.file.id)}/details`,
            { params: fileDetailsContext(this.file, this.orderId) }
          )
          if (request !== this.request) return
          if (
            !data?.details ||
            Number(data.details.id) !== Number(this.file.id) ||
            !Array.isArray(data.details.workshops)
          )
            throw new Error('Invalid file details')
          this.details = data.details
        }
        if (request === this.request) this.$emit('loaded', this.details)
      } catch (error) {
        if (request !== this.request) return
        this.error = this.$t(
          [403, 404].includes(error.response?.status)
            ? 'file_details.unavailable'
            : 'file_details.failed'
        )
        this.$emit('error', error)
      } finally {
        if (request === this.request) this.loading = false
      }
    },
  },
}
</script>
