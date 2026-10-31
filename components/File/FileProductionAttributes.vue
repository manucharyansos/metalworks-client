<template>
  <div
    v-if="dimensions || inspection || functions.length"
    class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs"
    data-file-production-attributes
  >
    <span
      v-if="dimensions"
      class="break-words text-slate-600 dark:text-slate-300"
      >{{ $t('file_plan.dimensions') }}: {{ dimensions }}</span
    >
    <span
      v-if="inspection"
      class="rounded-md bg-amber-50 px-2 py-1 font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
      >{{ $t('file_plan.inspection_required') }}</span
    >
    <span
      v-if="functions.length"
      class="flex flex-wrap items-center gap-1"
      :aria-label="$t('file_plan.functions')"
      data-file-functions
    >
      <span
        v-for="name in functions"
        :key="name"
        class="rounded-md bg-violet-50 px-2 py-1 font-semibold text-violet-800 dark:bg-violet-950/40 dark:text-violet-200"
        >✓ {{ name }}</span
      >
    </span>
  </div>
</template>
<script>
export default {
  props: { file: { type: Object, required: true } },
  computed: {
    dimensions() {
      return Object.prototype.hasOwnProperty.call(
        this.file.pivot || {},
        'dimensions'
      )
        ? this.file.pivot.dimensions
        : this.file.dimensions
    },
    inspection() {
      return Boolean(
        Number(
          this.file.pivot?.inspection_required ??
            this.file.inspection_required ??
            0
        )
      )
    },
    // Workshop functions this task job was given for the file.
    functions() {
      let rows = this.file.pivot?.production_functions
      if (typeof rows === 'string') {
        try {
          rows = JSON.parse(rows)
        } catch (_) {
          rows = []
        }
      }
      return Array.isArray(rows)
        ? [...new Set(rows.map((row) => String(row?.name || '').trim()))].filter(
            Boolean
          )
        : []
    },
  },
}
</script>
