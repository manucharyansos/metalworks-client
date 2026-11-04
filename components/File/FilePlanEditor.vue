<template>
  <div class="space-y-3 px-4 py-4" data-file-plan-editor>
    <FileProductionPlan
      v-model="plan"
      :factories="workshops"
      :disabled="busy"
      :loading="loading"
      :error="loadError"
    />
    <button
      v-if="loadError"
      type="button"
      class="text-sm underline"
      @click="load"
    >
      {{ $t('file_upload.retry') }}
    </button>
    <p class="text-xs text-slate-500">{{ labels.history }}</p>
    <p v-if="details.is_reference_file" class="text-xs text-amber-700">
      {{ labels.reference }}
    </p>
    <details v-if="selected.length" class="text-sm">
      <summary class="cursor-pointer py-2">{{ labels.create }}</summary>
      <p class="mb-2 text-xs text-slate-500">{{ labels.catalog }}</p>
      <form class="flex flex-wrap gap-2" @submit.prevent="createFunction">
        <select
          v-model="factoryId"
          :disabled="busy"
          :aria-label="labels.workshop"
          required
          class="min-w-0 max-w-full rounded-lg border p-2 dark:bg-slate-900"
        >
          <option value="" disabled>{{ labels.workshop }}</option>
          <option
            v-for="workshop in selected"
            :key="workshop.id"
            :value="workshop.id"
          >
            {{ workshop.name }}
          </option>
        </select>
        <input
          v-model.trim="functionName"
          :disabled="busy"
          :aria-label="labels.name"
          :placeholder="labels.name"
          required
          maxlength="150"
          class="min-w-0 flex-1 rounded-lg border p-2 dark:bg-slate-900"
        />
        <button
          type="submit"
          :disabled="busy || !factoryId || !functionName"
          class="rounded-lg border px-3 py-2 disabled:opacity-50"
        >
          {{ labels.create }}
        </button>
      </form>
    </details>
    <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
    <p v-if="success" role="status" class="text-sm text-green-700">
      {{ labels.saved }}
    </p>
    <button
      type="button"
      :disabled="busy || loading || !!loadError"
      class="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      data-save-file-plan
      @click="save"
    >
      {{ busy ? $t('file_details.loading') : labels.save }}
    </button>
  </div>
</template>
<script>
import FileProductionPlan from '@/components/engineer/FileProductionPlan.vue'
const copy = {
  hy: {
    save: 'Պահպանել արտադրական ուղին',
    saved: 'Արտադրական ուղին պահպանված է։',
    history:
      'Փոփոխությունները կկիրառվեն նոր առաջադրանքներում։ Արդեն ստեղծված առաջադրանքների ուղին ու գործառույթները կպահպանվեն։',
    reference:
      'Արտադրական ուղի նշանակելիս այս տեղեկատու ֆայլը նոր առաջադրանքներում կօգտագործվի որպես արտադրական ֆայլ։',
    create: 'Ավելացնել գործառույթ',
    catalog:
      'Նոր գործառույթը կավելացվի արտադրամասի ընդհանուր ցանկում և կընտրվի այս ֆայլի համար։ Ֆայլի ընտրությունը պահպանելու համար սեղմեք ներքևի կոճակը։',
    workshop: 'Ընտրեք արտադրամասը',
    name: 'Գործառույթի անունը',
  },
  ru: {
    save: 'Сохранить маршрут',
    saved: 'Маршрут сохранён.',
    history:
      'Изменения применяются к новым заданиям. Маршруты и функции существующих заданий сохраняются.',
    reference:
      'После назначения маршрута этот справочный файл будет производственным в новых заданиях.',
    create: 'Добавить функцию',
    catalog:
      'Функция добавится в общий каталог цеха и будет выбрана для файла. Сохраните выбор кнопкой ниже.',
    workshop: 'Выберите цех',
    name: 'Название функции',
  },
  en: {
    save: 'Save production route',
    saved: 'Route saved.',
    history:
      'Changes apply to new tasks. Existing task routes and functions are preserved.',
    reference:
      'Assigning a route makes this reference file a production file for new tasks.',
    create: 'Add function',
    catalog:
      'The function is added to the workshop catalog and selected for this file. Save the selection using the button below.',
    workshop: 'Select workshop',
    name: 'Function name',
  },
}
export default {
  components: { FileProductionPlan },
  props: { details: { type: Object, required: true } },
  data: () => ({
    plan: {},
    workshops: [],
    loading: false,
    loadError: '',
    busy: false,
    error: '',
    success: false,
    factoryId: '',
    functionName: '',
  }),
  computed: {
    labels() {
      return copy[this.$i18n?.locale] || copy.hy
    },
    selected() {
      return this.workshops.filter((w) =>
        (this.plan.production_factory_ids || []).includes(Number(w.id))
      )
    },
  },
  watch: {
    details: {
      immediate: true,
      handler() {
        this.plan = JSON.parse(JSON.stringify(this.details.production_plan))
        this.factoryId = ''
      },
    },
    selected(rows) {
      if (!rows.some((w) => Number(w.id) === Number(this.factoryId)))
        this.factoryId = ''
    },
  },
  mounted() {
    this.load()
  },
  methods: {
    message(e) {
      return (
        Object.values(e.response?.data?.errors || {}).flat()[0] ||
        e.response?.data?.message ||
        this.$t('file_plan.instruction_failed')
      )
    },
    async load() {
      this.loading = true
      this.loadError = ''
      try {
        const data = await this.$axios.$get('/api/engineers/pmp-file-options')
        if (!Array.isArray(data.workshops)) throw new Error('Invalid catalog')
        if (!this._isDestroyed) this.workshops = data.workshops
      } catch (e) {
        if (!this._isDestroyed) this.loadError = this.message(e)
      } finally {
        if (!this._isDestroyed) this.loading = false
      }
    },
    async createFunction() {
      if (
        this.busy ||
        !this.selected.some((w) => Number(w.id) === Number(this.factoryId)) ||
        !this.functionName
      )
        return
      this.busy = true
      this.error = ''
      this.success = false
      const id = Number(this.factoryId)
      try {
        const data = await this.$axios.$post(`/api/workshops/${id}/functions`, {
          name: this.functionName,
        })
        if (this._isDestroyed) return
        const workshop = this.workshops.find((w) => Number(w.id) === id)
        this.$set(workshop, 'functions', [
          ...(workshop.functions || []),
          data.function,
        ])
        this.plan = {
          ...this.plan,
          production_function_ids: [
            ...(this.plan.production_function_ids || []),
            Number(data.function.id),
          ],
        }
        this.functionName = ''
      } catch (e) {
        if (!this._isDestroyed) this.error = this.message(e)
      } finally {
        if (!this._isDestroyed) this.busy = false
      }
    },
    async save() {
      if (this.busy || this.loading || this.loadError) return
      this.busy = true
      this.error = ''
      this.success = false
      try {
        const data = await this.$axios.$put(
          `/api/project-files/${this.details.id}/production-plan`,
          { ...this.plan, plan_version: this.details.plan_version }
        )
        if (this._isDestroyed) return
        this.$emit('saved', data.details)
        this.success = true
      } catch (e) {
        if (!this._isDestroyed) this.error = this.message(e)
      } finally {
        if (!this._isDestroyed) this.busy = false
      }
    },
  },
}
</script>
