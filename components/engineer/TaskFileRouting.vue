<template>
  <section
    v-if="workingFiles.length"
    class="mt-5 space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
    data-file-routing
  >
    <h3 v-if="!embedded" class="font-bold">{{ t.routing }}</h3>
    <p class="text-sm text-slate-500">{{ t.routingHelp }}</p>
    <details
      v-for="file in workingFiles"
      :key="file.id"
      class="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
      :data-file-route="file.id"
    >
      <summary class="cursor-pointer break-words text-sm font-semibold">
        {{ file.original_name }}
        <span class="ml-2 text-xs font-normal text-slate-500">{{
          names(file)
        }}</span>
      </summary>
      <div class="mt-3 space-y-2">
        <label
          v-for="factory in workshops"
          :key="factory.id"
          class="flex items-start gap-3 rounded-lg p-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <input
            type="checkbox"
            :data-route-workshop="factory.id"
            :disabled="disabled"
            :checked="destinations(file).includes(Number(factory.id))"
            class="mt-0.5 h-5 w-5 shrink-0"
            @change="select(file, factory.id, $event.target.checked)"
          />
          <span class="break-words"
            ><span
              v-if="factory.operation !== 'other'"
              class="block text-xs font-semibold"
              >{{ $t('file_plan.' + factory.operation) }}</span
            >{{ factory.name }}</span
          >
        </label>
      </div>
    </details>
    <p
      v-if="!hasWork"
      class="text-sm text-amber-700 dark:text-amber-300"
      data-routing-required
    >
      {{ t.noRouting }}
    </p>
  </section>
</template>
<script>
import {
  catalogText,
  productionWorkshopOptions,
  isReferenceFile,
  fileDestinations,
} from '@/utils/workshop-catalog'
export default {
  props: {
    files: { type: Array, default: () => [] },
    factories: { type: Array, default: () => [] },
    value: { type: Object, default: () => ({}) },
    disabled: Boolean,
    embedded: Boolean,
  },
  computed: {
    t() {
      return catalogText(this.$i18n?.locale)
    },
    workshops() {
      return productionWorkshopOptions(this.factories)
    },
    workingFiles() {
      return this.files.filter((file) => !isReferenceFile(file, this.factories))
    },
    hasWork() {
      return this.workingFiles.some((file) => this.destinations(file).length)
    },
  },
  methods: {
    destinations(file) {
      return fileDestinations(file, this.factories, this.value)
    },
    names(file) {
      const ids = this.destinations(file)
      return (
        this.workshops
          .filter((row) => ids.includes(Number(row.id)))
          .map((row) => row.name)
          .join(', ') || this.t.unassignedFile
      )
    },
    select(file, id, checked) {
      if (this.disabled) return
      const ids = new Set(this.destinations(file))
      if (checked) ids.add(Number(id))
      else ids.delete(Number(id))
      this.$emit('input', { ...this.value, [file.id]: [...ids] })
    },
  },
}
</script>
