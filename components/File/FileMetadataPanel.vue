<template>
  <section
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
        class="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800 sm:grid-cols-4"
      >
        <div
          v-for="field in fields"
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
        class="space-y-3 border-t border-slate-100 px-4 py-4 dark:border-slate-800"
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
            v-if="!model.is_reference_file"
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
            class="flex min-w-0 max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs"
            :class="
              workshop.current
                ? 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
                : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200'
            "
            :data-file-workshop="workshop.id"
          >
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
          </li>
        </ul>
        <p v-else class="text-xs leading-5 text-slate-500 dark:text-slate-400">
          {{
            $t(
              model.source === 'task'
                ? 'file_details.no_workshops'
                : 'file_details.choose_on_task'
            )
          }}
        </p>
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
  },
  watch: { scopeKey: { immediate: true, handler: 'load' } },
  beforeDestroy() {
    ++this.request
  },
  methods: {
    present(value) {
      return value === null || value === undefined || value === ''
        ? this.$t('file_details.not_set')
        : value
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
