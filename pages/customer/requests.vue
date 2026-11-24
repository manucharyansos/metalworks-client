<template>
  <main
    class="w-full min-w-0 px-3 py-6 sm:px-6 lg:px-8 lg:py-8"
    data-customer-requests
  >
    <section class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <h1
        class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl"
      >
        {{ t.title }}
      </h1>
      <nuxt-link
        :to="localePath('/customer')"
        class="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
        >+ {{ t.create }}</nuxt-link
      >
    </section>

    <div
      v-if="loadError"
      role="alert"
      class="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200"
    >
      {{ loadError }}
      <button type="button" class="ml-2 font-bold underline" @click="load">
        {{ c.retry }}
      </button>
    </div>
    <p
      v-else-if="!loading && !quotes.length"
      class="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700"
    >
      {{ t.empty }}
    </p>

    <div
      v-else-if="!loading"
      class="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]"
    >
      <ul class="space-y-2" data-quote-list>
        <li v-for="quote in quotes" :key="quote.id">
          <button
            type="button"
            class="request-row"
            :class="{ 'request-row--on': selected && selected.id === quote.id }"
            :data-quote-row="quote.id"
            @click="select(quote.id)"
          >
            <span class="flex items-center justify-between gap-2">
              <span class="font-mono text-sm font-black">{{
                quote.number
              }}</span>
              <span class="status" :class="'status--' + tone(quote.status)">{{
                statuses[quote.status] || quote.status
              }}</span>
            </span>
            <span
              v-if="quote.title"
              class="mt-1 block truncate text-sm text-slate-700 dark:text-slate-200"
              >{{ quote.title }}</span
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

      <section
        v-if="selected"
        class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        data-quote-details
      >
        <header class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-mono text-sm font-black text-slate-500">
              {{ t.number }} {{ selected.number }}
            </p>
            <h2
              class="mt-1 break-words text-xl font-black text-slate-950 dark:text-white"
            >
              {{ selected.title || selected.number }}
            </h2>
            <p class="mt-1 text-xs text-slate-500">
              {{ t.sentAt }}: {{ date(selected.submitted_at)
              }}<template v-if="selected.desired_date">
                · {{ c.desiredDate }}: {{ selected.desired_date }}</template
              >
            </p>
          </div>
          <span class="status" :class="'status--' + tone(selected.status)">{{
            statuses[selected.status]
          }}</span>
        </header>
        <p
          v-if="selected.note"
          class="mt-3 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-950/40 dark:text-slate-200"
        >
          {{ selected.note }}
        </p>

        <div
          v-if="['quoted', 'accepted', 'declined'].includes(selected.status)"
          class="offer"
          data-quote-offer
        >
          <p
            class="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300"
          >
            {{ t.offer }}
          </p>
          <p
            class="mt-1 text-3xl font-black text-slate-950 dark:text-white"
            data-quote-offer-price
          >
            {{ money(selected.price) }}
          </p>
          <p
            v-if="selected.ready_date"
            class="mt-1 text-sm text-slate-600 dark:text-slate-300"
          >
            {{ t.readyDate }}: <strong>{{ selected.ready_date }}</strong>
          </p>
          <p
            v-if="selected.response_note"
            class="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200"
          >
            {{ selected.response_note }}
          </p>
          <div
            v-if="selected.status === 'quoted'"
            class="mt-4 flex flex-wrap gap-2"
          >
            <button
              type="button"
              class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              :disabled="acting"
              data-quote-accept
              @click="decide('accept')"
            >
              {{ t.accept }}
            </button>
            <button
              type="button"
              class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              :disabled="acting"
              data-quote-decline
              @click="decide('decline')"
            >
              {{ t.decline }}
            </button>
          </div>
        </div>
        <div
          v-else-if="selected.status === 'rejected'"
          class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
        >
          <p class="font-bold">{{ statuses.rejected }}</p>
          <p v-if="selected.response_note" class="mt-1 whitespace-pre-line">
            {{ t.reason }}: {{ selected.response_note }}
          </p>
        </div>
        <div
          v-else-if="selected.status === 'submitted'"
          class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <p>{{ t.waiting }}</p>
          <button
            type="button"
            class="font-bold underline disabled:opacity-50"
            :disabled="acting"
            data-quote-cancel
            @click="cancel"
          >
            {{ t.cancelRequest }}
          </button>
        </div>
        <p
          v-if="actionError"
          role="alert"
          class="mt-3 text-sm text-rose-600 dark:text-rose-300"
        >
          {{ actionError }}
        </p>

        <h3 class="mt-6 text-sm font-black text-slate-900 dark:text-white">
          {{ t.parts }}
        </h3>
        <ul
          class="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800"
        >
          <li
            v-for="item in selected.items"
            :key="item.id"
            class="flex flex-wrap items-start gap-3 p-3 text-sm"
          >
            <div class="min-w-0 flex-1">
              <p class="break-words font-bold text-slate-900 dark:text-white">
                {{ item.original_name }}
              </p>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {{
                  [
                    item.material,
                    item.thickness ? item.thickness + ' mm' : '',
                    c.pieces(item.quantity),
                  ]
                    .filter(Boolean)
                    .join(' · ')
                }}
              </p>
              <p
                v-if="item.workshops.length"
                class="mt-0.5 text-xs text-slate-500 dark:text-slate-400"
              >
                {{ item.workshops.map(service).join(', ')
                }}<template v-if="item.paint_ral">
                  · {{ item.paint_ral }}</template
                >
              </p>
            </div>
            <div class="shrink-0 text-right text-xs text-slate-500">
              <p
                v-if="item.pricing && item.pricing.status === 'priced'"
                class="font-bold text-slate-900 dark:text-white"
              >
                ≈ {{ money(item.pricing.line) }}
              </p>
              <button
                type="button"
                class="mt-1 font-semibold text-blue-600 hover:underline dark:text-blue-300"
                @click="preview = item"
              >
                {{ c.view }}
              </button>
            </div>
          </li>
        </ul>
        <p
          v-if="selected.estimate && selected.estimate.total"
          class="mt-3 text-right text-sm text-slate-600 dark:text-slate-300"
        >
          {{ t.estimate }}:
          <strong>≈ {{ money(selected.estimate.total) }}</strong>
          <span
            v-if="!selected.estimate.complete"
            class="block text-xs text-amber-700 dark:text-amber-300"
            >{{ c.partial }}</span
          >
        </p>
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
      :source-url="`/api/customer/quotes/${selected.id}/items/${preview.id}/file`"
      @close="preview = null"
    />
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

export default {
  name: 'CustomerRequestsPage',
  components: { FilePreviewModal },
  layout: 'customer',
  middleware: ['role-guard'],
  meta: { role: 'authenticatedUser' },
  data() {
    return {
      loading: true,
      loadError: '',
      quotes: [],
      acting: false,
      actionError: '',
      preview: null,
    }
  },
  computed: {
    copy() {
      return quoteCopy(this.$i18n?.locale)
    },
    t() {
      return this.copy.list
    },
    c() {
      return this.copy.create
    },
    statuses() {
      return this.copy.statuses
    },
    selected() {
      const id = Number(this.$route.query.quote)
      return this.quotes.find((quote) => quote.id === id) || null
    },
  },
  watch: {
    '$route.query.quote'() {
      this.actionError = ''
    },
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      this.loadError = ''
      try {
        this.quotes =
          (await this.$axios.$get('/api/customer/quotes')).quotes || []
        if (
          !this.selected &&
          this.quotes.length &&
          window.matchMedia?.('(min-width: 1024px)').matches
        )
          this.select(this.quotes[0].id, true)
      } catch (error) {
        this.loadError = apiErrorMessage(error, this.c.loadFailed)
      } finally {
        this.loading = false
      }
    },
    select(id, replace = false) {
      const route = {
        path: this.$route.path,
        query: { ...this.$route.query, quote: String(id) },
      }
      const go = replace
        ? this.$router.replace(route)
        : this.$router.push(route)
      go?.catch?.(() => {})
    },
    replace(quote) {
      this.quotes = this.quotes.map((row) =>
        row.id === quote.id ? quote : row
      )
    },
    async decide(decision) {
      await this.act(
        `/api/customer/quotes/${this.selected.id}/decision`,
        { decision },
        decision === 'accept' ? this.t.accepted : this.t.declined
      )
    },
    async cancel() {
      await this.act(
        `/api/customer/quotes/${this.selected.id}/cancel`,
        {},
        this.t.cancelled
      )
    },
    async act(url, body, message) {
      if (this.acting) return
      this.acting = true
      this.actionError = ''
      try {
        const data = await this.$axios.$post(url, body)
        this.replace(data.quote)
        this.$notify({ group: 'workspace', type: 'success', text: message })
      } catch (error) {
        this.actionError = apiErrorMessage(error, this.t.actionFailed)
      } finally {
        this.acting = false
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
.request-row {
  @apply block w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700;
}
.request-row--on {
  @apply border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-500;
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
.offer {
  @apply mt-4 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/20;
}
</style>
