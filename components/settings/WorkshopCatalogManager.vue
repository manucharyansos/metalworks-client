<template>
  <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6" data-workshop-catalog>
    <header class="mb-6">
      <h1 class="text-2xl font-black text-slate-900 dark:text-white">
        {{ title || (categories ? t.categories : t.workshops) }}
      </h1>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        {{ categories ? t.categoryHelp : t.workshopHelp }}
      </p>
    </header>
    <form
      class="work-card mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
      :aria-busy="saving ? 'true' : 'false'"
      data-catalog-form
      @submit.prevent="save"
    >
      <label class="block text-sm font-semibold"
        >{{ t.name }}
        <input
          v-model.trim="draft.name"
          data-catalog-name
          type="text"
          required
          maxlength="150"
          :disabled="saving"
          class="mt-2 block w-full rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-700"
        />
      </label>
      <template v-if="categories">
        <label class="flex items-center gap-3 text-sm font-semibold"
          ><input
            v-model="draft.is_reference"
            data-catalog-reference
            type="checkbox"
            :disabled="saving"
            class="h-5 w-5"
          />{{ t.reference }}</label
        >
        <label v-if="!draft.is_reference" class="block text-sm font-semibold"
          >{{ t.defaultWorkshop }}
          <select
            v-model="draft.default_factory_id"
            data-catalog-default
            :disabled="saving"
            class="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">{{ t.none }}</option>
            <option
              v-for="workshop in activeWorkshops"
              :key="workshop.id"
              :value="String(workshop.id)"
            >
              {{ workshop.name }}
            </option>
          </select>
        </label>
        <label class="block text-sm font-semibold"
          >{{ t.extensions
          }}<input
            v-model="draft.extensions"
            data-catalog-extensions
            :disabled="saving"
            type="text"
            class="mt-2 block w-full rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-700"
        /></label>
        <p class="text-xs leading-5 text-slate-500">{{ t.extensionHelp }}</p>
      </template>
      <p
        v-if="error"
        role="alert"
        class="break-words rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
      >
        {{ error }}
      </p>
      <div class="flex flex-wrap gap-3">
        <button
          type="submit"
          data-catalog-save
          :disabled="saving || !draft.name"
          class="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
        >
          {{ saving ? t.loading : draft.id ? t.save : t.add }}</button
        ><button
          v-if="draft.id"
          type="button"
          :disabled="saving"
          class="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold dark:border-slate-700"
          @click="reset"
        >
          {{ t.cancel }}
        </button>
      </div>
    </form>
    <p
      v-if="loading"
      role="status"
      class="py-8 text-center text-sm text-slate-500"
    >
      {{ t.loading }}
    </p>
    <div
      v-else-if="loadError"
      role="alert"
      class="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
    >
      {{ loadError }}
      <button type="button" class="ml-3 font-bold underline" @click="load">
        {{ t.retry }}
      </button>
    </div>
    <p
      v-else-if="!items.length"
      class="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500"
    >
      {{ t.empty }}
    </p>
    <div v-else class="grid gap-4 md:grid-cols-2">
      <article
        v-for="item in items"
        :key="item.id"
        :data-catalog-item="item.id"
        class="work-card min-w-0 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5"
      >
        <header class="flex flex-wrap items-start justify-between gap-2">
          <h2 class="break-words font-bold">{{ item.name }}</h2>
          <span
            class="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >{{ item.is_active ? t.active : t.archived }}</span
          >
        </header>
        <template v-if="categories"
          ><p class="mt-3 text-sm text-slate-500">
            {{ item.is_reference ? t.reference : defaultName(item) }}
          </p>
          <p class="mt-2 break-words font-mono text-xs text-slate-500">
            {{
              (item.extensions || []).map((row) => row.extension).join(', ') ||
              '—'
            }}
          </p></template
        >
        <div
          class="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold"
        >
          <button
            type="button"
            :disabled="saving"
            data-catalog-edit
            class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
            @click="edit(item)"
          >
            {{ t.edit }}
          </button>
          <button
            v-if="categories"
            type="button"
            :disabled="saving"
            data-catalog-delete
            class="rounded-lg border border-rose-200 px-3 py-2 text-rose-700 dark:border-rose-900 dark:text-rose-300"
            @click="remove(item)"
          >
            {{ t.delete }}
          </button>
          <button
            v-else
            type="button"
            :disabled="saving"
            data-catalog-archive
            class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
            @click="toggle(item)"
          >
            {{ item.is_active ? t.archive : t.restore }}
          </button>
          <nuxt-link
            v-if="!categories"
            :to="localePath(workshopPage(item, managerRole))"
            class="block rounded-lg px-2 py-2 text-indigo-700 dark:text-indigo-300"
            >{{ t.open }} →</nuxt-link
          >
        </div>
        <p
          v-if="itemError.id === item.id"
          role="alert"
          class="mt-3 break-words text-sm text-rose-700 dark:text-rose-300"
        >
          {{ itemError.message }}
        </p>
        <section
          v-if="!categories && functionDrafts[item.id]"
          class="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800"
          :data-workshop-functions="item.id"
        >
          <h3 class="text-sm font-semibold">{{ t.functions }}</h3>
          <p class="mt-1 text-xs leading-5 text-slate-500">
            {{ t.functionsHelp }}
          </p>
          <ul
            v-if="(item.functions || []).length"
            class="mt-3 flex flex-wrap gap-2"
          >
            <li
              v-for="fn in item.functions"
              :key="fn.id"
              :data-workshop-function="fn.id"
              class="inline-flex max-w-full items-center gap-1 rounded-full border py-1 pl-3 pr-1 text-xs font-semibold"
              :class="
                fn.is_active
                  ? 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200'
                  : 'border-dashed border-slate-300 text-slate-400 line-through dark:border-slate-700'
              "
              :title="fn.is_active ? '' : t.functionArchivedHint"
            >
              <button
                type="button"
                class="min-w-0 break-words text-left hover:underline"
                :disabled="saving"
                :aria-label="`${t.edit} · ${fn.name}`"
                data-function-edit
                @click="editFunction(item, fn)"
              >
                {{ fn.name }}
              </button>
              <button
                type="button"
                class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-white/80 dark:hover:bg-slate-800"
                :disabled="saving"
                :aria-label="`${fn.is_active ? t.archive : t.restore} · ${fn.name}`"
                :title="fn.is_active ? t.archive : t.restore"
                data-function-toggle
                @click="toggleFunction(item, fn)"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                  <path v-if="fn.is_active" stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" d="M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5" />
                </svg>
              </button>
            </li>
          </ul>
          <p v-else class="mt-3 text-xs text-slate-400">
            {{ t.noFunctions }}
          </p>
          <form
            class="mt-3 flex flex-wrap gap-2"
            data-function-form
            @submit.prevent="saveFunction(item)"
          >
            <input
              v-model.trim="functionDrafts[item.id].name"
              type="text"
              maxlength="150"
              :placeholder="t.functionPlaceholder"
              :aria-label="t.functions"
              :disabled="saving || !item.is_active"
              data-function-name
              class="min-w-0 flex-1 basis-40 rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <button
              type="submit"
              :disabled="saving || !item.is_active || !functionDrafts[item.id].name"
              data-function-save
              class="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
            >
              {{ functionDrafts[item.id].id ? t.save : t.add }}
            </button>
            <button
              v-if="functionDrafts[item.id].id"
              type="button"
              :disabled="saving"
              class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold dark:border-slate-700"
              @click="resetFunction(item)"
            >
              {{ t.cancel }}
            </button>
          </form>
          <p
            v-if="functionError.id === item.id"
            role="alert"
            class="mt-2 break-words text-sm text-rose-700 dark:text-rose-300"
          >
            {{ functionError.message }}
          </p>
        </section>
      </article>
    </div>
  </main>
</template>
<script>
import { catalogText, workshopPage } from '@/utils/workshop-catalog'
import { apiErrorMessage } from '@/utils/task-workflow'
const blank = () => ({
  id: null,
  name: '',
  is_reference: false,
  default_factory_id: '',
  extensions: '',
  is_active: true,
})
export default {
  props: { categories: Boolean, title: { type: String, default: '' } },
  data: () => ({
    items: [],
    workshops: [],
    draft: blank(),
    loading: false,
    saving: false,
    error: '',
    loadError: '',
    itemError: { id: null, message: '' },
    // Workshop id -> { id, name } of the function being added or renamed.
    functionDrafts: {},
    functionError: { id: null, message: '' },
    requestVersion: 0,
  }),
  computed: {
    t() {
      return catalogText(this.$i18n?.locale)
    },
    endpoint() {
      return this.categories ? '/api/file-categories' : '/api/workshops'
    },
    activeWorkshops() {
      return this.workshops.filter(
        (row) => row.is_active && row.is_workshop !== false
      )
    },
    managerRole() {
      return this.$auth?.user?.role?.name === 'admin' ? 'admin' : 'manager'
    },
    scopeKey() {
      return `${this.$auth?.user?.id || ''}:${
        this.$store?.state?.workspace?.company?.id || ''
      }`
    },
  },
  watch: {
    scopeKey() {
      this.requestVersion++
      this.items = []
      this.workshops = []
      this.saving = false
      this.reset()
      this.itemError = { id: null, message: '' }
      this.load()
    },
  },
  mounted() {
    this.load()
  },
  beforeDestroy() {
    this.requestVersion++
  },
  methods: {
    workshopPage,
    reset() {
      this.draft = blank()
      this.error = ''
    },
    edit(item) {
      if (this.saving) return
      this.draft = {
        ...item,
        default_factory_id: item.default_factory_id
          ? String(item.default_factory_id)
          : '',
        extensions: (item.extensions || [])
          .map((row) => row.extension)
          .join(', '),
      }
      this.error = ''
      this.$el?.querySelector('[data-catalog-name]')?.focus()
    },
    defaultName(item) {
      return (
        this.workshops.find(
          (row) => Number(row.id) === Number(item.default_factory_id)
        )?.name || this.t.none
      )
    },
    body(draft) {
      if (!this.categories)
        return { name: draft.name, is_active: draft.is_active }
      return {
        name: draft.name,
        is_active: draft.is_active,
        is_reference: draft.is_reference,
        default_factory_id:
          draft.is_reference || !draft.default_factory_id
            ? null
            : Number(draft.default_factory_id),
        extensions:
          typeof draft.extensions === 'string'
            ? draft.extensions
                .split(',')
                .map((row) => row.trim().replace(/^\.+/, '').toLowerCase())
                .filter(Boolean)
            : (draft.extensions || []).map((row) => row.extension),
      }
    },
    async load() {
      const version = ++this.requestVersion
      const companyId = this.$store?.state?.workspace?.company?.id
      const current = () =>
        version === this.requestVersion &&
        !this._isDestroyed &&
        companyId === this.$store?.state?.workspace?.company?.id
      this.loading = true
      this.loadError = ''
      try {
        const response = await this.$axios.get(this.endpoint, {
          params: { include_archived: 1 },
        })
        const rows = response.data[this.categories ? 'categories' : 'workshops']
        if (!Array.isArray(rows)) throw new Error(this.t.failed)
        const workshops = this.categories
          ? (await this.$axios.get('/api/workshops')).data.workshops
          : rows
        if (!current()) return
        this.items = rows
        this.workshops = workshops || []
        this.functionDrafts = Object.fromEntries(
          rows.map((row) => [
            row.id,
            this.functionDrafts[row.id] || { id: null, name: '' },
          ])
        )
        this.$store?.commit?.('workshops/SET_ITEMS', this.workshops)
      } catch (error) {
        if (current()) this.loadError = apiErrorMessage(error, this.t.failed)
      } finally {
        if (current()) this.loading = false
      }
    },
    async save() {
      if (this.saving || !this.draft.name) return
      const scope = this.scopeKey
      this.saving = true
      this.error = ''
      try {
        const id = this.draft.id
        await this.$axios[id ? 'put' : 'post'](
          id ? `${this.endpoint}/${id}` : this.endpoint,
          this.body(this.draft)
        )
        if (scope !== this.scopeKey || this._isDestroyed) return
        this.reset()
        await this.load()
        this.$notify?.({ type: 'success', text: this.t.saved })
      } catch (error) {
        if (scope === this.scopeKey && !this._isDestroyed)
          this.error = apiErrorMessage(error)
      } finally {
        if (scope === this.scopeKey && !this._isDestroyed) this.saving = false
      }
    },
    async remove(item) {
      if (this.saving || !this.categories) return
      const scope = this.scopeKey
      const current = () => scope === this.scopeKey && !this._isDestroyed
      this.saving = true
      this.itemError = { id: null, message: '' }
      try {
        await this.$axios.delete(`${this.endpoint}/${item.id}`)
        if (!current()) return
        if (this.draft.id === item.id) this.reset()
        this.items = this.items.filter((row) => row.id !== item.id)
        await this.load()
        if (current()) this.$notify?.({ type: 'success', text: this.t.deleted })
      } catch (error) {
        if (current())
          this.itemError = { id: item.id, message: apiErrorMessage(error) }
      } finally {
        if (current()) this.saving = false
      }
    },
    editFunction(item, fn) {
      if (this.saving) return
      this.$set(this.functionDrafts, item.id, { id: fn.id, name: fn.name })
      this.functionError = { id: null, message: '' }
      this.$nextTick(() =>
        this.$el
          ?.querySelector(`[data-workshop-functions="${item.id}"] [data-function-name]`)
          ?.focus()
      )
    },
    resetFunction(item) {
      this.$set(this.functionDrafts, item.id, { id: null, name: '' })
    },
    // Adds a function to the workshop, or renames the one being edited.
    async saveFunction(item) {
      const draft = this.functionDrafts[item.id]
      if (this.saving || !draft?.name || this.categories) return
      const scope = this.scopeKey
      const current = () => scope === this.scopeKey && !this._isDestroyed
      this.saving = true
      this.functionError = { id: null, message: '' }
      try {
        const base = `${this.endpoint}/${item.id}/functions`
        if (draft.id)
          await this.$axios.put(`${base}/${draft.id}`, { name: draft.name })
        else await this.$axios.post(base, { name: draft.name })
        if (!current()) return
        this.resetFunction(item)
        await this.load()
      } catch (error) {
        if (current())
          this.functionError = { id: item.id, message: apiErrorMessage(error) }
      } finally {
        if (current()) this.saving = false
      }
    },
    async toggleFunction(item, fn) {
      if (this.saving || this.categories) return
      const scope = this.scopeKey
      const current = () => scope === this.scopeKey && !this._isDestroyed
      this.saving = true
      this.functionError = { id: null, message: '' }
      try {
        await this.$axios.put(`${this.endpoint}/${item.id}/functions/${fn.id}`, {
          name: fn.name,
          is_active: !fn.is_active,
        })
        if (current()) await this.load()
      } catch (error) {
        if (current())
          this.functionError = { id: item.id, message: apiErrorMessage(error) }
      } finally {
        if (current()) this.saving = false
      }
    },
    async toggle(item) {
      if (this.saving) return
      this.saving = true
      this.itemError = { id: null, message: '' }
      try {
        await this.$axios.put(
          `${this.endpoint}/${item.id}`,
          this.body({ ...item, is_active: !item.is_active })
        )
        await this.load()
      } catch (error) {
        this.itemError = { id: item.id, message: apiErrorMessage(error) }
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
