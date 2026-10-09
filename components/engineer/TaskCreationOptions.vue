<template>
  <section
    class="mt-5 space-y-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
    data-task-options
  >
    <div>
      <label class="flex items-start gap-3 font-semibold">
        <input
          type="checkbox"
          class="mt-1 h-5 w-5 shrink-0"
          :checked="confirmationRequired"
          data-confirmation-required
          @change="$emit('update:confirmationRequired', $event.target.checked)"
        />
        <span>{{ t.required }}</span>
      </label>
      <p class="mt-2 text-sm text-slate-500">
        {{ confirmationRequired ? t.requiredHelp : t.optional }}
      </p>
      <label
        v-if="confirmationRequired"
        class="mt-4 block text-sm font-semibold"
      >
        {{ t.method }}
        <select
          :value="confirmationMethod"
          data-confirmation-method
          class="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          @change="$emit('update:confirmationMethod', $event.target.value)"
        >
          <option value="" disabled>{{ t.choose }}</option>
          <option value="photo">{{ t.photo }}</option>
          <option value="text">{{ t.text }}</option>
        </select>
      </label>
    </div>
    <div v-if="referenceFiles.length && workshops.length" class="space-y-3">
      <h3 class="font-semibold">{{ t.references }}</h3>
      <p class="text-sm text-slate-500">{{ t.referencesHelp }}</p>
      <details
        v-for="file in referenceFiles"
        :key="file.id"
        class="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
        :data-reference-file="file.id"
      >
        <summary class="cursor-pointer break-words text-sm font-semibold">
          {{ file.original_name }}
        </summary>
        <div class="mt-3 space-y-2">
          <label
            v-for="factory in workshops"
            :key="factory.id"
            class="flex items-center gap-3 rounded-lg p-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <input
              type="checkbox"
              class="h-5 w-5"
              :checked="
                (referenceVisibility[file.id] || []).includes(
                  Number(factory.id)
                )
              "
              :data-reference-workshop="factory.id"
              @change="
                selectWorkshop(file.id, factory.id, $event.target.checked)
              "
            />
            {{ factory.name }}
          </label>
        </div>
      </details>
    </div>
  </section>
</template>
<script>
import { isReferenceFactory, taskCopy } from '@/utils/task-workflow'
export default {
  props: {
    confirmationRequired: Boolean,
    confirmationMethod: { type: String, default: '' },
    referenceVisibility: { type: Object, default: () => ({}) },
    files: { type: Array, default: () => [] },
    factories: { type: Array, default: () => [] },
  },
  computed: {
    t() {
      return taskCopy[this.$i18n?.locale] || taskCopy.hy
    },
    referenceFiles() {
      return this.files.filter((file) =>
        isReferenceFactory(
          this.factories.find(
            (factory) => Number(factory.id) === Number(file.factory_id)
          )
        )
      )
    },
    workshops() {
      const ids = new Set(this.files.map((file) => Number(file.factory_id)))
      return this.factories.filter(
        (factory) => ids.has(Number(factory.id)) && !isReferenceFactory(factory)
      )
    },
  },
  methods: {
    selectWorkshop(fileId, factoryId, checked) {
      const ids = new Set(this.referenceVisibility[fileId] || [])
      if (checked) ids.add(Number(factoryId))
      else ids.delete(Number(factoryId))
      this.$emit('update:referenceVisibility', {
        ...this.referenceVisibility,
        [fileId]: [...ids],
      })
    },
  },
}
</script>
