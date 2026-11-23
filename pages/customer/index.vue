<template>
  <main
    class="mx-auto max-w-7xl px-4 py-6 sm:px-6"
    data-workspace-form
    data-customer-quote
  >
    <section class="mb-6">
      <h1
        class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl"
      >
        {{ t.title }}
      </h1>
      <p
        class="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300"
      >
        {{ t.lead }}
      </p>
    </section>

    <div
      v-if="loadError"
      role="alert"
      class="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200"
    >
      {{ loadError }}
      <button type="button" class="ml-2 font-bold underline" @click="load">
        {{ t.retry }}
      </button>
    </div>
    <div
      v-else-if="loading"
      role="status"
      class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900"
    >
      <span
        class="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
        aria-hidden="true"
      />{{ t.uploading }}
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div class="min-w-0 space-y-4">
        <label
          class="drop-zone"
          :class="{ 'drop-zone--over': dragging }"
          data-quote-drop
          @dragenter.prevent="dragging = true"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="dropped"
        >
          <input
            ref="files"
            type="file"
            multiple
            class="sr-only"
            :accept="accept"
            data-quote-files
            @change="picked"
          />
          <svg
            class="mx-auto h-10 w-10 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
            />
          </svg>
          <span
            class="mt-3 block text-lg font-black text-slate-900 dark:text-white"
            >{{ t.drop }}</span
          >
          <span class="mt-1 block text-xs text-slate-500">{{ t.or }}</span>
          <span
            class="mt-3 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm"
            >{{ t.browse }}</span
          >
          <span class="mt-4 block text-xs text-slate-500 dark:text-slate-400">{{
            t.formats(options.max_file_mb, options.max_items)
          }}</span>
          <span class="mt-1 block text-xs text-slate-400">{{ t.privacy }}</span>
        </label>

        <ul v-if="uploads.length" class="space-y-2" aria-live="polite">
          <li
            v-for="row in uploads"
            :key="row.key"
            class="flex items-center gap-3 rounded-xl border px-3 py-2 text-sm"
            :class="
              row.error
                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200'
                : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            "
          >
            <span
              v-if="!row.error"
              class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
              aria-hidden="true"
            />
            <span class="min-w-0 flex-1 break-words">{{
              row.error || `${t.uploading} ${row.name}`
            }}</span>
            <button
              v-if="row.error"
              type="button"
              class="shrink-0 text-xs font-bold underline"
              @click="dismiss(row)"
            >
              {{ t.close }}
            </button>
          </li>
        </ul>

        <p
          v-if="!items.length && !uploads.length"
          class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700"
        >
          {{ t.empty }}
        </p>
        <QuotePartCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :options="options"
          :saving="Boolean(saving[item.id])"
          :error="errors[item.id] || ''"
          @change="change"
          @remove="remove"
          @preview="preview = $event"
        />
      </div>

      <aside class="lg:sticky lg:top-24 lg:self-start" data-quote-summary>
        <section
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 class="text-lg font-black text-slate-950 dark:text-white">
            {{ t.summary }}
          </h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ t.parts(items.length) }} · {{ t.pieces(pieces) }}
          </p>
          <div
            v-if="
              estimate &&
              estimate.total !== null &&
              estimate.total !== undefined
            "
            class="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800"
          >
            <p class="text-xs font-bold uppercase tracking-wide text-slate-500">
              {{ t.estimate }}
            </p>
            <p
              class="mt-1 text-3xl font-black text-slate-950 dark:text-white"
              data-quote-total
            >
              {{ money(estimate.total) }}
            </p>
            <p class="mt-1 text-xs text-slate-500">
              {{ estimate.vat_included ? t.vatIncluded : t.vatExcluded }}
            </p>
            <p v-if="estimate.setup_fee" class="mt-2 text-xs text-slate-500">
              {{ t.setupFee }}: {{ money(estimate.setup_fee) }}
            </p>
            <p
              v-if="estimate.minimum_applied"
              class="mt-1 text-xs text-slate-500"
            >
              {{ t.minimum }}
            </p>
            <p
              v-if="!estimate.complete"
              class="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
              data-quote-partial
            >
              {{ t.partial }}
            </p>
          </div>
          <p
            v-if="options.pricing && options.pricing.customer_note"
            class="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400"
          >
            {{ options.pricing.customer_note }}
          </p>
          <p class="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {{ t.final }}
          </p>
          <button
            type="button"
            class="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            :disabled="!items.length || busy"
            data-quote-send
            @click="openSend"
          >
            {{ t.send }}
          </button>
        </section>
      </aside>
    </div>

    <div
      v-if="sendOpen"
      class="work-modal-backdrop fixed inset-0 z-[1000]"
      @click.self="closeSend"
    >
      <form
        class="work-modal flex w-full max-w-lg flex-col"
        role="dialog"
        aria-modal="true"
        :aria-label="t.sendTitle"
        data-work-modal
        data-quote-send-dialog
        novalidate
        @submit.prevent="send"
        @keydown.esc="closeSend"
      >
        <header
          class="work-modal__header flex items-center justify-between gap-3"
        >
          <h2 class="text-base font-bold">{{ t.sendTitle }}</h2>
          <button
            type="button"
            class="work-modal__close"
            :aria-label="t.close"
            @click="closeSend"
          >
            ×
          </button>
        </header>
        <div class="work-modal__body space-y-4">
          <label class="block text-sm font-semibold"
            >{{ t.projectName }}
            <input
              ref="sendFirst"
              v-model="sendForm.title"
              type="text"
              maxlength="255"
              class="send-control"
            />
          </label>
          <label class="block text-sm font-semibold"
            >{{ t.comment }}
            <textarea
              v-model="sendForm.note"
              rows="3"
              maxlength="5000"
              class="send-control resize-y"
            />
          </label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-sm font-semibold"
              >{{ t.desiredDate }}
              <input
                v-model="sendForm.desired_date"
                type="date"
                :min="today"
                class="send-control"
              />
            </label>
            <label class="block text-sm font-semibold"
              >{{ t.phone }}
              <input
                v-model="sendForm.phone"
                type="tel"
                maxlength="40"
                autocomplete="tel"
                class="send-control"
                placeholder="+374 …"
              />
            </label>
          </div>
          <p
            v-if="sendError"
            role="alert"
            class="break-words text-sm text-rose-600 dark:text-rose-300"
          >
            {{ sendError }}
          </p>
        </div>
        <footer class="work-modal__footer flex flex-wrap justify-end gap-2">
          <button
            type="button"
            class="work-button"
            :disabled="sending"
            @click="closeSend"
          >
            {{ t.cancel }}
          </button>
          <button
            type="submit"
            class="work-button"
            data-variant="primary"
            :disabled="sending"
            data-quote-send-confirm
          >
            {{ sending ? t.sending : t.confirm }}
          </button>
        </footer>
      </form>
    </div>

    <FilePreviewModal
      v-if="preview && draft"
      :file="preview"
      :source-url="fileUrl(preview)"
      @close="preview = null"
    />
  </main>
</template>

<script>
import QuotePartCard from '@/components/customer/QuotePartCard.vue'
import FilePreviewModal from '@/components/File/FilePreviewModal.vue'
import { apiErrorMessage } from '@/utils/task-workflow'
import { formatMoney, quoteCopy } from '@/utils/quote-copy'

export default {
  name: 'CustomerQuotePage',
  components: { QuotePartCard, FilePreviewModal },
  layout: 'customer',
  middleware: ['role-guard'],
  meta: { role: 'authenticatedUser' },
  data() {
    return {
      loading: true,
      loadError: '',
      options: {
        workshops: [],
        extensions: [],
        max_items: 20,
        max_file_mb: 50,
        pricing: { materials: [] },
      },
      draft: null,
      uploads: [],
      dragging: false,
      saving: {},
      errors: {},
      timers: {},
      pending: {},
      preview: null,
      sendOpen: false,
      sending: false,
      sendError: '',
      sendForm: { title: '', note: '', desired_date: '', phone: '' },
    }
  },
  computed: {
    t() {
      return quoteCopy(this.$i18n?.locale).create
    },
    items() {
      return this.draft?.items || []
    },
    estimate() {
      return this.draft?.estimate || null
    },
    pieces() {
      return this.items.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
      )
    },
    accept() {
      return (this.options.extensions || []).map((ext) => `.${ext}`).join(',')
    },
    busy() {
      return (
        this.uploads.some((u) => !u.error) ||
        Object.values(this.saving).some(Boolean) ||
        Object.keys(this.timers).length > 0
      )
    },
    today() {
      return new Date().toISOString().slice(0, 10)
    },
  },
  created() {
    this.load()
  },
  beforeDestroy() {
    Object.values(this.timers).forEach(clearTimeout)
  },
  methods: {
    async load() {
      this.loading = true
      this.loadError = ''
      try {
        const [options, quotes] = await Promise.all([
          this.$axios.$get('/api/customer/quotes/options'),
          this.$axios.$get('/api/customer/quotes'),
        ])
        this.options = options
        this.draft = quotes.draft
      } catch (error) {
        this.loadError = apiErrorMessage(error, this.t.loadFailed)
      } finally {
        this.loading = false
      }
    },
    picked(event) {
      this.upload([...(event.target.files || [])])
      event.target.value = ''
    },
    dropped(event) {
      this.dragging = false
      this.upload([...(event.dataTransfer?.files || [])])
    },
    // One file at a time keeps the order and the server's draft consistent.
    async upload(files) {
      const room = Math.max(
        0,
        (this.options.max_items || 20) - this.items.length
      )
      const list = files.slice(0, room)
      if (files.length > room)
        this.uploads.push({
          key: `limit-${Date.now()}`,
          name: '',
          error: this.t.tooMany(this.options.max_items),
        })
      for (const file of list) {
        const upload = {
          key: `${file.name}-${file.size}-${Math.random()}`,
          name: file.name,
          error: '',
        }
        this.uploads.push(upload)
        const body = new FormData()
        body.append('file', file)
        try {
          const data = await this.$axios.$post(
            '/api/customer/quotes/draft/items',
            body
          )
          this.draft = data.draft
          this.uploads = this.uploads.filter((u) => u !== upload)
        } catch (error) {
          upload.error = `${this.t.uploadFailed(file.name)} ${apiErrorMessage(
            error,
            ''
          )}`.trim()
        }
      }
    },
    dismiss(upload) {
      this.uploads = this.uploads.filter((u) => u !== upload)
    },
    change({ id, payload }) {
      this.pending[id] = payload
      clearTimeout(this.timers[id])
      this.$set(
        this.timers,
        id,
        setTimeout(() => this.save(id), 450)
      )
    },
    async save(id) {
      this.$delete(this.timers, id)
      const payload = this.pending[id]
      delete this.pending[id]
      if (!payload) return
      this.$set(this.saving, id, true)
      this.$set(this.errors, id, '')
      try {
        const data = await this.$axios.$patch(
          `/api/customer/quotes/draft/items/${id}`,
          payload
        )
        // A newer edit is already waiting; its answer will bring the latest prices.
        if (!this.pending[id]) this.draft = data.draft
      } catch (error) {
        this.$set(this.errors, id, apiErrorMessage(error, this.t.saveFailed))
      } finally {
        this.$set(this.saving, id, false)
      }
    },
    async remove(item) {
      clearTimeout(this.timers[item.id])
      this.$delete(this.timers, item.id)
      delete this.pending[item.id]
      try {
        const data = await this.$axios.$delete(
          `/api/customer/quotes/draft/items/${item.id}`
        )
        this.draft = data.draft
      } catch (error) {
        this.$set(
          this.errors,
          item.id,
          apiErrorMessage(error, this.t.saveFailed)
        )
      }
    },
    fileUrl(item) {
      return `/api/customer/quotes/${this.draft.id}/items/${item.id}/file`
    },
    openSend() {
      this.sendError = ''
      this.sendOpen = true
      this.$nextTick(() => this.$refs.sendFirst?.focus())
    },
    closeSend() {
      if (!this.sending) this.sendOpen = false
    },
    async send() {
      if (this.sending) return
      this.sending = true
      this.sendError = ''
      try {
        const body = Object.fromEntries(
          Object.entries(this.sendForm).map(([key, value]) => [
            key,
            String(value || '').trim() || null,
          ])
        )
        const data = await this.$axios.$post(
          '/api/customer/quotes/draft/submit',
          body
        )
        this.sendOpen = false
        this.$notify({ group: 'workspace', type: 'success', text: this.t.sent })
        this.$router.push({
          path: this.localePath('/customer/requests'),
          query: { quote: String(data.quote.id) },
        })
      } catch (error) {
        this.sendError = apiErrorMessage(error, this.t.sendFailed)
      } finally {
        this.sending = false
      }
    },
    money(value) {
      return formatMoney(value)
    },
  },
}
</script>

<style scoped>
.drop-zone {
  @apply block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40 focus-within:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-blue-950/20;
}
.drop-zone--over {
  @apply border-blue-500 bg-blue-50 dark:bg-blue-950/30;
}
.send-control {
  @apply mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white;
}
</style>
