<template>
  <main class="px-4 py-6 sm:px-6" data-quote-inbox>
    <section class="mb-5 flex flex-wrap items-end justify-between gap-3">
      <h1
        class="text-2xl font-black tracking-tight text-slate-950 dark:text-white"
      >
        {{ t.title }}
      </h1>
      <input
        v-model.trim="search"
        type="search"
        class="inbox-search"
        :placeholder="t.search"
        :aria-label="t.search"
        data-quote-search
        @input="searchLater"
      />
    </section>

    <nav class="mb-4 flex gap-2 overflow-x-auto pb-1" :aria-label="t.title">
      <button
        v-for="filter in filters"
        :key="filter"
        type="button"
        class="inbox-tab"
        :class="{ 'inbox-tab--on': status === filter }"
        :data-quote-filter="filter"
        @click="setStatus(filter)"
      >
        {{ staffStatuses[filter]
        }}<span
          v-if="count(filter)"
          class="ml-1.5 rounded-full bg-black/10 px-1.5 text-xs dark:bg-white/10"
          >{{ count(filter) }}</span
        >
      </button>
    </nav>

    <div
      v-if="error"
      role="alert"
      class="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200"
    >
      {{ error }}
      <button type="button" class="ml-2 font-bold underline" @click="load(1)">
        {{ c.retry }}
      </button>
    </div>
    <div v-else class="grid gap-5 xl:grid-cols-[24rem_minmax(0,1fr)]">
      <div>
        <p
          v-if="!loading && !quotes.length"
          class="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700"
        >
          {{ t.empty }}
        </p>
        <ul class="space-y-2">
          <li v-for="quote in quotes" :key="quote.id">
            <button
              type="button"
              class="inbox-row"
              :class="{ 'inbox-row--on': selectedId === quote.id }"
              :data-quote-row="quote.id"
              @click="open(quote.id)"
            >
              <span class="flex items-center justify-between gap-2">
                <span class="font-mono text-sm font-black">{{
                  quote.number
                }}</span>
                <span class="status" :class="'status--' + tone(quote.status)">{{
                  staffStatuses[quote.status]
                }}</span>
              </span>
              <span
                class="mt-1 block truncate text-sm font-semibold text-slate-800 dark:text-slate-100"
                >{{ quote.customer ? quote.customer.name : '—' }}</span
              >
              <span
                class="mt-1 flex justify-between gap-2 text-xs text-slate-500 dark:text-slate-400"
              >
                <span
                  >{{ date(quote.submitted_at) }} ·
                  {{ c.parts(quote.items.length) }}</span
                >
                <span class="font-semibold">{{
                  quote.price
                    ? money(quote.price)
                    : quote.estimate && quote.estimate.total
                    ? '≈ ' + money(quote.estimate.total)
                    : ''
                }}</span>
              </span>
            </button>
          </li>
        </ul>
        <button
          v-if="page < lastPage"
          type="button"
          class="mt-3 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          :disabled="loading"
          @click="load(page + 1)"
        >
          {{ t.more }}
        </button>
      </div>

      <section
        v-if="selected"
        class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        data-quote-details
      >
        <header class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-mono text-sm font-black text-slate-500">
              {{ selected.number }} · {{ date(selected.submitted_at) }}
            </p>
            <h2
              class="mt-1 break-words text-xl font-black text-slate-950 dark:text-white"
            >
              {{
                selected.title || (selected.customer && selected.customer.name)
              }}
            </h2>
          </div>
          <span class="status" :class="'status--' + tone(selected.status)">{{
            staffStatuses[selected.status]
          }}</span>
        </header>

        <dl
          class="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-950/40 sm:grid-cols-2"
          data-quote-customer
        >
          <div>
            <dt class="text-xs text-slate-500">{{ t.customer }}</dt>
            <dd class="font-semibold">
              {{ selected.customer ? selected.customer.name : '—' }}
            </dd>
          </div>
          <div v-if="selected.customer">
            <dt class="text-xs text-slate-500">{{ t.email }}</dt>
            <dd class="break-all">
              <a
                :href="'mailto:' + selected.customer.email"
                class="text-blue-600 hover:underline dark:text-blue-300"
                >{{ selected.customer.email }}</a
              >
            </dd>
          </div>
          <div v-if="selected.customer && selected.customer.phone">
            <dt class="text-xs text-slate-500">{{ t.phone }}</dt>
            <dd>
              <a
                :href="'tel:' + selected.customer.phone"
                class="text-blue-600 hover:underline dark:text-blue-300"
                >{{ selected.customer.phone }}</a
              >
            </dd>
          </div>
          <div v-if="selected.desired_date">
            <dt class="text-xs text-slate-500">{{ t.desired }}</dt>
            <dd class="font-semibold">{{ selected.desired_date }}</dd>
          </div>
          <div v-if="selected.note" class="sm:col-span-2">
            <dt class="text-xs text-slate-500">{{ t.comment }}</dt>
            <dd class="whitespace-pre-line">{{ selected.note }}</dd>
          </div>
        </dl>

        <div class="mt-5 overflow-x-auto">
          <table
            class="w-full min-w-[42rem] text-left text-sm"
            data-quote-items
          >
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr
                v-for="item in selected.items"
                :key="item.id"
                class="align-top"
              >
                <td class="py-3 pr-3">
                  <p
                    class="break-words font-bold text-slate-900 dark:text-white"
                  >
                    {{ item.original_name }}
                  </p>
                  <p class="mt-0.5 text-xs text-slate-500">
                    {{
                      [
                        item.material,
                        item.thickness ? item.thickness + ' mm' : '',
                      ]
                        .filter(Boolean)
                        .join(' · ') || '—'
                    }}
                  </p>
                  <p
                    v-if="item.workshops.length"
                    class="mt-0.5 text-xs text-slate-500"
                  >
                    {{ item.workshops.map(service).join(', ')
                    }}<template v-if="item.paint_ral">
                      · {{ item.paint_ral
                      }}{{
                        item.primer_required
                          ? ' + ' + c.primer.toLowerCase()
                          : ''
                      }}</template
                    >
                  </p>
                  <p
                    v-if="item.note"
                    class="mt-1 whitespace-pre-line text-xs text-slate-600 dark:text-slate-300"
                  >
                    {{ item.note }}
                  </p>
                  <p class="mt-1 flex gap-3 text-xs font-semibold">
                    <button
                      type="button"
                      class="text-blue-600 hover:underline dark:text-blue-300"
                      @click="preview = item"
                    >
                      {{ c.view }}
                    </button>
                    <button
                      type="button"
                      class="text-blue-600 hover:underline dark:text-blue-300"
                      @click="download(item)"
                    >
                      {{ t.download }}
                    </button>
                  </p>
                </td>
                <td class="whitespace-nowrap py-3 pr-3 text-xs text-slate-500">
                  <template v-if="item.metrics && item.metrics.status === 'ok'">
                    {{ item.metrics.width_mm }} ×
                    {{ item.metrics.height_mm }} mm<br />
                    {{ c.cut }}:
                    {{ (item.metrics.cut_length_mm / 1000).toFixed(2) }} m<br />
                    {{ c.pierces }}: {{ item.metrics.pierces
                    }}<template
                      v-if="
                        (item.pricing && item.pricing.bends) ||
                        item.metrics.bends
                      "
                    >
                      · {{ c.bends }}:
                      {{
                        (item.pricing && item.pricing.bends) ||
                        item.metrics.bends
                      }}</template
                    >
                  </template>
                </td>
                <td class="whitespace-nowrap py-3 pr-3 text-right font-bold">
                  × {{ item.quantity }}
                </td>
                <td class="whitespace-nowrap py-3 text-right text-xs">
                  <template
                    v-if="item.pricing && item.pricing.status === 'priced'"
                  >
                    <p
                      class="text-sm font-black text-slate-900 dark:text-white"
                    >
                      {{ money(item.pricing.line) }}
                    </p>
                    <p class="text-slate-500">
                      {{ money(item.pricing.unit) }} {{ c.unit
                      }}<template v-if="item.pricing.discount_percent">
                        · −{{ item.pricing.discount_percent }}%</template
                      >
                    </p>
                    <p
                      v-if="item.pricing.breakdown"
                      class="mt-1 text-slate-400"
                    >
                      <span
                        v-for="(value, key) in item.pricing.breakdown"
                        v-show="value"
                        :key="key"
                        class="block"
                        >{{ t.breakdown[key] }}: {{ money(value) }}</span
                      >
                    </p>
                  </template>
                  <span v-else class="text-amber-700 dark:text-amber-300"
                    >{{ c.estimate }} —</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-2 text-right text-sm" data-quote-estimate>
          <template v-if="selected.estimate && selected.estimate.total">
            {{ t.estimate }}:
            <strong class="text-lg">{{
              money(selected.estimate.total)
            }}</strong>
            <span class="text-xs text-slate-500"
              >({{
                selected.estimate.vat_included ? c.vatIncluded : c.vatExcluded
              }}<template v-if="selected.estimate.setup_fee"
                >, {{ c.setupFee.toLowerCase() }}
                {{ money(selected.estimate.setup_fee) }}</template
              >)</span
            >
            <span
              v-if="!selected.estimate.complete"
              class="block text-xs text-amber-700 dark:text-amber-300"
              >{{ c.partial }}</span
            >
          </template>
          <span v-else class="text-slate-500">{{ t.noEstimate }}</span>
        </p>

        <div
          v-if="
            ['quoted', 'accepted', 'declined', 'rejected'].includes(
              selected.status
            ) && selected.responded_at
          "
          class="mt-4 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-950/40"
        >
          <p v-if="selected.price">
            <strong>{{ money(selected.price) }}</strong
            ><template v-if="selected.ready_date">
              · {{ selected.ready_date }}</template
            >
          </p>
          <p
            v-if="selected.response_note"
            class="mt-1 whitespace-pre-line text-slate-600 dark:text-slate-300"
          >
            {{ selected.response_note }}
          </p>
          <p v-if="selected.responder" class="mt-1 text-xs text-slate-400">
            {{ t.responder }}: {{ selected.responder }} ·
            {{ date(selected.responded_at) }}
          </p>
        </div>

        <form
          v-if="answerable"
          class="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
          data-quote-answer
          novalidate
          @submit.prevent="answer"
        >
          <h3 class="text-sm font-black">{{ t.answer }}</h3>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <label
              class="block text-xs font-bold text-slate-600 dark:text-slate-300"
              >{{ t.price }}
              <input
                v-model="form.price"
                type="number"
                min="0"
                step="1"
                inputmode="numeric"
                class="inbox-control"
                data-quote-answer-price
              />
              <button
                v-if="selected.estimate && selected.estimate.total"
                type="button"
                class="mt-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-300"
                @click="form.price = selected.estimate.total"
              >
                {{ t.useEstimate }} ({{ money(selected.estimate.total) }})
              </button>
            </label>
            <label
              class="block text-xs font-bold text-slate-600 dark:text-slate-300"
              >{{ t.readyDate }}
              <input
                v-model="form.ready_date"
                type="date"
                class="inbox-control"
                data-quote-answer-date
              />
            </label>
          </div>
          <label
            class="mt-3 block text-xs font-bold text-slate-600 dark:text-slate-300"
            >{{ t.responseNote }}
            <textarea
              v-model="form.response_note"
              rows="3"
              maxlength="5000"
              class="inbox-control resize-y"
            />
          </label>
          <div class="mt-3 flex flex-wrap justify-between gap-2">
            <button
              type="button"
              class="rounded-xl px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
              :disabled="busy"
              data-quote-reject-open
              @click="rejecting = !rejecting"
            >
              {{ t.reject }}
            </button>
            <button
              type="submit"
              class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              :disabled="busy || form.price === '' || form.price === null"
              data-quote-answer-send
            >
              {{ selected.status === 'quoted' ? t.updateAnswer : t.sendAnswer }}
            </button>
          </div>
          <div
            v-if="rejecting"
            class="mt-3 rounded-xl border border-rose-200 bg-rose-50/60 p-3 dark:border-rose-900/60 dark:bg-rose-950/20"
          >
            <label
              class="block text-xs font-bold text-rose-800 dark:text-rose-200"
              >{{ t.rejectReason }}
              <textarea
                v-model="rejectNote"
                rows="2"
                maxlength="5000"
                class="inbox-control resize-y"
                data-quote-reject-note
              />
            </label>
            <button
              type="button"
              class="mt-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              :disabled="busy || !rejectNote.trim()"
              data-quote-reject
              @click="reject"
            >
              {{ t.confirmReject }}
            </button>
          </div>
          <p
            v-if="formError"
            role="alert"
            class="mt-2 text-sm text-rose-600 dark:text-rose-300"
          >
            {{ formError }}
          </p>
        </form>
      </section>
      <p
        v-else
        class="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700"
      >
        {{ t.choose }}
      </p>
    </div>

    <FilePreviewModal
      v-if="preview && selected"
      :file="preview"
      :source-url="fileUrl(preview)"
      show-download
      @download="download(preview)"
      @close="preview = null"
    />
    <notifications />
  </main>
</template>

<script>
import FilePreviewModal from '@/components/File/FilePreviewModal.vue'
import { apiErrorMessage } from '@/utils/task-workflow'
import {
  formatMoney,
  quoteCopy,
  serviceName,
  statusTone,
} from '@/utils/quote-copy'

const FILTERS = [
  'submitted',
  'quoted',
  'accepted',
  'declined',
  'rejected',
  'cancelled',
  'all',
]

export default {
  name: 'QuoteInbox',
  components: { FilePreviewModal },
  data() {
    return {
      loading: false,
      error: '',
      quotes: [],
      counts: {},
      page: 1,
      lastPage: 1,
      status: 'submitted',
      search: '',
      searchTimer: null,
      selected: null,
      form: { price: '', ready_date: '', response_note: '' },
      rejecting: false,
      rejectNote: '',
      busy: false,
      formError: '',
      preview: null,
      request: 0,
    }
  },
  computed: {
    copy() {
      return quoteCopy(this.$i18n?.locale)
    },
    t() {
      return this.copy.inbox
    },
    c() {
      return this.copy.create
    },
    staffStatuses() {
      return this.copy.staffStatuses
    },
    filters() {
      return FILTERS
    },
    selectedId() {
      return this.selected?.id || null
    },
    answerable() {
      return (
        this.selected && ['submitted', 'quoted'].includes(this.selected.status)
      )
    },
  },
  created() {
    this.load(1).then(() => {
      const id = Number(this.$route.query.quote)
      if (id) this.open(id)
    })
  },
  beforeDestroy() {
    clearTimeout(this.searchTimer)
  },
  methods: {
    count(filter) {
      if (filter === 'all')
        return Object.values(this.counts).reduce(
          (sum, n) => sum + Number(n || 0),
          0
        )
      return Number(this.counts[filter] || 0)
    },
    setStatus(filter) {
      this.status = filter
      this.load(1)
    },
    searchLater() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.load(1), 350)
    },
    async load(page) {
      const request = ++this.request
      this.loading = true
      this.error = ''
      try {
        const data = await this.$axios.$get('/api/quote-requests', {
          params: { status: this.status, q: this.search || undefined, page },
        })
        if (request !== this.request) return
        this.quotes = page === 1 ? data.data : [...this.quotes, ...data.data]
        this.counts = data.counts || {}
        this.page = data.meta.current_page
        this.lastPage = data.meta.last_page
      } catch (error) {
        if (request === this.request)
          this.error = apiErrorMessage(error, this.c.loadFailed)
      } finally {
        if (request === this.request) this.loading = false
      }
    },
    async open(id) {
      this.formError = ''
      this.rejecting = false
      this.rejectNote = ''
      try {
        const data = await this.$axios.$get(`/api/quote-requests/${id}`)
        this.selected = data.quote
        this.fill(data.quote)
        this.$router
          .replace({ query: { ...this.$route.query, quote: String(id) } })
          .catch(() => {})
      } catch (error) {
        this.formError = apiErrorMessage(error, this.c.loadFailed)
      }
    },
    // The last answer, or a full estimate; a partial one is only offered as a button.
    fill(quote) {
      const suggestion =
        quote.price ?? (quote.estimate?.complete ? quote.estimate.total : null)
      this.form = {
        price:
          suggestion === null || suggestion === undefined || suggestion === ''
            ? ''
            : Math.round(Number(suggestion)),
        ready_date: quote.ready_date || '',
        response_note: quote.response_note || '',
      }
    },
    replace(quote) {
      this.selected = quote
      this.quotes = this.quotes.map((row) =>
        row.id === quote.id ? quote : row
      )
      this.fill(quote)
    },
    async answer() {
      await this.send(
        `/api/quote-requests/${this.selected.id}/answer`,
        {
          price: Number(this.form.price),
          ready_date: this.form.ready_date || null,
          response_note: this.form.response_note || null,
        },
        this.t.answered
      )
    },
    async reject() {
      await this.send(
        `/api/quote-requests/${this.selected.id}/reject`,
        { response_note: this.rejectNote.trim() },
        this.t.rejected
      )
      this.rejecting = false
    },
    async send(url, body, message) {
      if (this.busy) return
      this.busy = true
      this.formError = ''
      try {
        const data = await this.$axios.$post(url, body)
        this.replace(data.quote)
        this.$notify({ type: 'success', text: message })
        this.load(1)
      } catch (error) {
        this.formError = apiErrorMessage(error, this.t.failed)
      } finally {
        this.busy = false
      }
    },
    fileUrl(item) {
      return `/api/quote-requests/${this.selected.id}/items/${item.id}/file`
    },
    async download(item) {
      try {
        const response = await this.$axios.get(
          `${this.fileUrl(item)}?download=1`,
          { responseType: 'blob' }
        )
        const url = URL.createObjectURL(response.data)
        const link = document.createElement('a')
        link.href = url
        link.download = item.original_name
        document.body.appendChild(link)
        link.click()
        link.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      } catch (error) {
        this.formError = apiErrorMessage(error, this.t.failed)
      }
    },
    tone(status) {
      return statusTone(status)
    },
    service(workshop) {
      return serviceName(workshop, this.$i18n?.locale)
    },
    money(value) {
      return formatMoney(value)
    },
    date(value) {
      if (!value) return ''
      const parsed = new Date(value)
      return Number.isNaN(parsed.getTime())
        ? ''
        : parsed.toLocaleDateString(
            this.$i18n?.locale === 'hy' ? 'hy-AM' : this.$i18n?.locale
          )
    },
  },
}
</script>

<style scoped>
.inbox-search {
  @apply w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 sm:w-80;
}
.inbox-tab {
  @apply shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800;
}
.inbox-tab--on {
  @apply border-slate-900 bg-slate-900 text-white hover:bg-slate-900 dark:border-white dark:bg-white dark:text-slate-900;
}
.inbox-row {
  @apply block w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900;
}
.inbox-row--on {
  @apply border-blue-500 ring-2 ring-blue-500/20;
}
.inbox-control {
  @apply mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white;
}
.status {
  @apply inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-bold;
}
.status--slate {
  @apply bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300;
}
.status--amber {
  @apply bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200;
}
.status--blue {
  @apply bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200;
}
.status--emerald {
  @apply bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200;
}
.status--rose {
  @apply bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200;
}
</style>
