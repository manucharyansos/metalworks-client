<template>
  <section class="mx-auto max-w-6xl px-4 pb-8 sm:px-6" data-global-file-types>
    <div class="work-card work-section space-y-4">
      <div>
        <h2 class="work-section__title">{{ t.title }}</h2>
        <p class="work-meta mt-2">{{ t.help }}</p>
      </div>
      <p
        v-if="error"
        role="alert"
        class="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
      >
        {{ error }}
        <button
          v-if="loadFailed"
          type="button"
          class="ml-2 underline"
          @click="load"
        >
          {{ t.retry }}
        </button>
      </p>
      <p v-if="loading" role="status" class="work-meta">{{ t.loading }}</p>
      <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <form
          v-for="row in rows"
          :key="row.id"
          class="work-file-row flex flex-wrap items-center gap-2"
          :data-global-extension="row.id"
          @submit.prevent="save(row)"
        >
          <label class="min-w-0 flex-1"
            ><span class="sr-only">{{ t.extension }}</span
            ><input
              v-model.trim="drafts[row.id]"
              class="w-full rounded-lg border border-slate-300 bg-transparent p-2 font-mono text-sm dark:border-slate-700"
              maxlength="20"
              required
              :disabled="busy"
          /></label>
          <button
            type="submit"
            class="work-button"
            :disabled="busy || normalize(drafts[row.id]) === row.extension"
          >
            {{ t.save }}
          </button>
          <button
            type="button"
            class="work-button"
            :disabled="busy"
            @click="remove(row)"
          >
            {{ t.remove }}
          </button>
        </form>
      </div>
      <form class="flex flex-wrap items-center gap-3" @submit.prevent="save()">
        <label class="min-w-0 flex-1"
          ><span class="sr-only">{{ t.extension }}</span
          ><input
            v-model.trim="newExtension"
            data-global-extension-new
            class="w-full rounded-xl border border-slate-300 bg-transparent p-3 font-mono text-sm dark:border-slate-700"
            maxlength="20"
            placeholder="jpg"
            required
            :disabled="busy"
        /></label>
        <button
          type="submit"
          data-global-extension-add
          class="work-button"
          data-variant="dark"
          :disabled="loading || busy || !normalize(newExtension)"
        >
          {{ t.add }}
        </button>
      </form>
    </div>
  </section>
</template>

<script>
const copy = {
  hy: {
    title: 'Ընդհանուր կցորդների ֆայլերի տեսակներ',
    help: 'Նախագծի բաժնից անկախ կցորդների թույլատրելի ձևաչափերը։ Նախագծի ֆայլերի ձևաչափերը նշվում են վերևում՝ իրենց բաժնի կարգավորումներում։',
    extension: 'Ֆայլի տեսակ',
    add: 'Ավելացնել',
    save: 'Պահպանել',
    remove: 'Հեռացնել',
    loading: 'Բեռնվում է…',
    retry: 'Կրկին փորձել',
    failed: 'Չհաջողվեց պահպանել ֆայլերի տեսակները։',
  },
  ru: {
    title: 'Типы общих вложений',
    help: 'Допустимые форматы вложений, не связанных с разделом проекта. Форматы файлов проекта задаются выше в настройках раздела.',
    extension: 'Тип файла',
    add: 'Добавить',
    save: 'Сохранить',
    remove: 'Удалить',
    loading: 'Загрузка…',
    retry: 'Повторить',
    failed: 'Не удалось сохранить типы файлов.',
  },
  en: {
    title: 'General attachment types',
    help: 'Allowed formats for attachments outside a project section. Project file formats are configured in the sections above.',
    extension: 'File type',
    add: 'Add',
    save: 'Save',
    remove: 'Remove',
    loading: 'Loading…',
    retry: 'Retry',
    failed: 'Could not save file types.',
  },
}
export default {
  data: () => ({
    rows: [],
    drafts: {},
    newExtension: '',
    loading: false,
    busy: false,
    error: '',
    loadFailed: false,
    requestVersion: 0,
  }),
  computed: {
    t() {
      return copy[this.$i18n?.locale] || copy.hy
    },
    scope() {
      return `${this.$store.state.auth?.user?.id || ''}:${
        this.$store.state.workspace?.company?.id || ''
      }`
    },
  },
  watch: {
    scope() {
      this.rows = []
      this.drafts = {}
      this.newExtension = ''
      this.error = ''
      this.busy = false
      this.load()
    },
  },
  created() {
    this.load()
  },
  beforeDestroy() {
    this.requestVersion++
  },
  methods: {
    normalize(value) {
      return String(value || '')
        .trim()
        .replace(/^\./, '')
        .toLowerCase()
    },
    message(error) {
      return (
        Object.values(error?.response?.data?.errors || {}).flat()[0] ||
        error?.response?.data?.message ||
        this.t.failed
      )
    },
    async load() {
      const version = ++this.requestVersion
      const scope = this.scope
      this.loading = true
      this.loadFailed = false
      try {
        const { data } = await this.$axios.get('/api/admin/file-extensions')
        if (version !== this.requestVersion || scope !== this.scope) return
        this.rows = Array.isArray(data) ? data : []
        this.drafts = Object.fromEntries(
          this.rows.map((row) => [row.id, row.extension])
        )
        this.error = ''
      } catch (error) {
        if (version === this.requestVersion && scope === this.scope) {
          this.error = this.message(error)
          this.loadFailed = true
        }
      } finally {
        if (version === this.requestVersion && scope === this.scope)
          this.loading = false
      }
    },
    async save(row = null) {
      if (this.busy) return
      const extension = this.normalize(
        row ? this.drafts[row.id] : this.newExtension
      )
      if (!extension) return
      const scope = this.scope
      this.busy = true
      this.error = ''
      try {
        if (row)
          await this.$axios.put(`/api/admin/file-extensions/${row.id}`, {
            extension,
          })
        else await this.$axios.post('/api/admin/file-extensions', { extension })
        if (scope !== this.scope || this._isDestroyed) return
        if (!row) this.newExtension = ''
        await this.load()
      } catch (error) {
        if (scope === this.scope && !this._isDestroyed)
          this.error = this.message(error)
      } finally {
        if (scope === this.scope) this.busy = false
      }
    },
    async remove(row) {
      if (this.busy) return
      const scope = this.scope
      this.busy = true
      this.error = ''
      try {
        await this.$axios.delete(`/api/admin/file-extensions/${row.id}`)
        if (scope === this.scope && !this._isDestroyed) await this.load()
      } catch (error) {
        if (scope === this.scope && !this._isDestroyed)
          this.error = this.message(error)
      } finally {
        if (scope === this.scope) this.busy = false
      }
    },
  },
}
</script>
