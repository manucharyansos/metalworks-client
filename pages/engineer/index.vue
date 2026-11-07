<template>
  <main
    class="min-h-screen min-w-0 px-4 py-6 sm:px-6 lg:px-8"
    data-engineer-tasks
  >
    <section v-if="$can('orders.view')" class="mx-auto space-y-5">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div class="min-w-0">
          <h1
            class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl"
          >
            {{ c.title }}
          </h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ c.subtitle }}
          </p>
        </div>
        <nuxt-link
          v-if="$can('orders.create')"
          :to="localePath('/engineer/orders/create')"
          class="app-button-primary gap-2 !py-2.5"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-width="2"
              d="M12 5v14M5 12h14"
            />
          </svg>
          {{ c.create }}
        </nuxt-link>
      </header>

      <nav
        class="chip-row -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5"
        :aria-label="c.status"
      >
        <button
          v-for="stage in ['', ...stages]"
          :key="stage || 'all'"
          type="button"
          class="stage-chip"
          :data-stage="stage || 'all'"
          :aria-pressed="String(filters.stage === stage)"
          @click="filters.stage = stage"
        >
          <span class="whitespace-nowrap">{{
            stage ? stageLabel(stage) : c.all
          }}</span>
          <span class="stage-chip__count">{{
            stage ? stageCounts[stage] || 0 : stageTotal
          }}</span>
        </button>
      </nav>

      <section class="app-surface rounded-3xl p-4 sm:p-5">
        <div class="flex gap-3">
          <label class="min-w-0 flex-1">
            <span class="sr-only">{{ c.search }}</span>
            <span class="relative block">
              <svg
                class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" stroke-width="1.8" />
                <path
                  stroke-linecap="round"
                  stroke-width="1.8"
                  d="m20 20-3.5-3.5"
                />
              </svg>
              <input
                v-model.trim="filters.search"
                type="search"
                maxlength="120"
                class="app-control !pl-11"
                :placeholder="c.search"
                data-filter="search"
              />
            </span>
          </label>
          <button
            type="button"
            class="app-button-secondary shrink-0 gap-2 lg:hidden"
            :aria-expanded="String(showFilters)"
            aria-controls="engineer-task-filters"
            @click="showFilters = !showFilters"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-width="1.8"
                d="M4 6h16M7 12h10M10 18h4"
              />
            </svg>
            <span>{{ c.filters }}</span>
            <span
              v-if="advancedFilterCount"
              class="rounded-full bg-slate-950 px-1.5 text-[11px] font-bold text-white dark:bg-white dark:text-slate-950"
              >{{ advancedFilterCount }}</span
            >
          </button>
        </div>

        <div
          id="engineer-task-filters"
          class="mt-4 gap-3 sm:grid-cols-2 lg:grid lg:grid-cols-3 xl:grid-cols-5"
          :class="showFilters ? 'grid' : 'hidden'"
        >
          <label class="filter-field">
            <span class="filter-label">{{ c.workshop }}</span>
            <select v-model="filters.factory_id" class="app-control">
              <option value="">{{ c.all }}</option>
              <option v-for="f in options.factories" :key="f.id" :value="f.id">
                {{ f.name }}
              </option>
            </select>
          </label>
          <label class="filter-field">
            <span class="filter-label">{{ c.operator }}</span>
            <select v-model="filters.operator_id" class="app-control">
              <option value="">{{ c.all }}</option>
              <option v-for="o in options.operators" :key="o.id" :value="o.id">
                {{ o.name }}
              </option>
            </select>
          </label>
          <label class="filter-field">
            <span class="filter-label">{{ c.from }}</span>
            <input
              v-model="filters.due_from"
              type="date"
              class="app-control"
              :aria-invalid="String(rangeInvalid)"
            />
          </label>
          <label class="filter-field">
            <span class="filter-label">{{ c.to }}</span>
            <input
              v-model="filters.due_to"
              type="date"
              class="app-control"
              :min="filters.due_from || null"
              :aria-invalid="String(rangeInvalid)"
            />
          </label>
          <label class="filter-field">
            <span class="filter-label">{{ c.sort }}</span>
            <select v-model="filters.sort" class="app-control">
              <option value="priority">{{ c.byPriority }}</option>
              <option value="newest">{{ c.newest }}</option>
            </select>
          </label>
        </div>

        <p
          v-if="rangeInvalid"
          role="alert"
          class="mt-3 text-xs font-semibold text-rose-600 dark:text-rose-300"
        >
          {{ c.invalid }}
        </p>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label
            class="inline-flex cursor-pointer select-none items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <input
              v-model="waiting"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800"
            />
            {{ t.pending }}
          </label>
          <button
            v-if="hasFilters"
            type="button"
            class="text-sm font-bold text-slate-600 underline-offset-4 transition hover:text-slate-950 hover:underline dark:text-slate-300 dark:hover:text-white"
            @click="resetFilters"
          >
            {{ c.clear }}
          </button>
        </div>
      </section>

      <section
        class="app-surface relative overflow-hidden rounded-3xl"
        :aria-busy="String(loading)"
      >
        <div
          v-if="loading && orders.length"
          class="progress-bar absolute inset-x-0 top-0 h-0.5"
          role="status"
          :aria-label="boardText.loading"
        ></div>

        <div
          v-if="error"
          role="alert"
          class="flex flex-col items-center gap-3 px-6 py-12 text-center"
        >
          <p class="text-sm font-semibold text-rose-600 dark:text-rose-300">
            {{ error }}
          </p>
          <button
            type="button"
            class="app-button-secondary !py-2"
            @click="fetchRows"
          >
            {{ boardText.retry }}
          </button>
        </div>

        <div
          v-else-if="loading && !orders.length"
          class="divide-y divide-slate-100 dark:divide-slate-800"
          role="status"
        >
          <span class="sr-only">{{ boardText.loading }}</span>
          <div
            v-for="n in 4"
            :key="n"
            class="flex animate-pulse items-center gap-4 px-5 py-4"
          >
            <div
              class="h-10 w-1 rounded-full bg-slate-200 dark:bg-slate-700"
            ></div>
            <div class="flex-1 space-y-2">
              <div
                class="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700"
              ></div>
              <div
                class="h-3 w-64 max-w-full rounded bg-slate-100 dark:bg-slate-800"
              ></div>
            </div>
            <div
              class="hidden h-6 w-24 rounded-full bg-slate-100 dark:bg-slate-800 sm:block"
            ></div>
          </div>
        </div>

        <div
          v-else-if="!orders.length"
          class="flex flex-col items-center gap-3 px-6 py-14 text-center"
          data-tasks-empty
        >
          <span
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.7"
                d="M7 4h10a2 2 0 012 2v14H5V6a2 2 0 012-2Zm2 4h6M9 12h6M9 16h4"
              />
            </svg>
          </span>
          <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {{ hasFilters ? c.noResults : c.noTasks }}
          </p>
          <button
            v-if="hasFilters"
            type="button"
            class="app-button-secondary !py-2"
            @click="resetFilters"
          >
            {{ c.clear }}
          </button>
          <nuxt-link
            v-else-if="$can('orders.create')"
            :to="localePath('/engineer/orders/create')"
            class="app-button-primary !py-2"
          >
            {{ c.create }}
          </nuxt-link>
        </div>

        <template v-else>
          <div class="hidden overflow-x-auto md:block">
            <table class="w-full text-left text-sm">
              <thead
                class="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400"
              >
                <tr>
                  <th
                    v-for="key in columns"
                    :key="key"
                    scope="col"
                    class="whitespace-nowrap px-4 py-3 first:pl-6"
                  >
                    {{ c[key] }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr
                  v-for="order in orders"
                  :key="order.id"
                  class="task-row cursor-pointer align-top transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  :data-stage="order.workflow_stage"
                  @click="openOrder(order)"
                >
                  <td class="relative py-4 pl-6 pr-4">
                    <span class="task-row__stripe" aria-hidden="true"></span>
                    <button
                      type="button"
                      class="block max-w-xs text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-700"
                      @click.stop="openOrder(order)"
                    >
                      <span
                        class="block text-xs font-semibold text-slate-500 dark:text-slate-400"
                        >#{{ orderNumber(order)
                        }}<template v-if="taskCode(order)">
                          · {{ taskCode(order) }}</template
                        ></span
                      >
                      <span
                        class="mt-0.5 block break-words font-bold text-slate-950 hover:underline dark:text-white"
                        data-task-title
                        >{{ taskTitle(order) }}</span
                      >
                    </button>
                  </td>
                  <td class="min-w-[14rem] px-4 py-4" data-client-cell>
                    <div class="max-w-md">
                      <span
                        class="block break-words font-semibold text-slate-800 dark:text-slate-100"
                        >{{ customer(order) || '—' }}</span
                      >
                      <span
                        v-if="order.description"
                        class="mt-1 line-clamp-2 break-words text-xs leading-5 text-slate-600 dark:text-slate-300"
                        :title="order.description"
                        >{{ order.description }}</span
                      >
                      <dl
                        class="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs"
                      >
                        <dt class="text-slate-500 dark:text-slate-400">
                          {{ c.createdAt }}
                        </dt>
                        <dd
                          class="font-medium text-slate-700 dark:text-slate-200"
                          data-created-at
                        >
                          {{ createdText(order) }}
                        </dd>
                        <dt class="text-slate-500 dark:text-slate-400">
                          {{ c.finishAt }}
                        </dt>
                        <dd
                          class="font-medium text-slate-700 dark:text-slate-200"
                        >
                          {{ dueText(order) }}
                        </dd>
                        <template v-if="order.completed_at">
                          <dt class="text-slate-500 dark:text-slate-400">
                            {{ c.completedAt }}
                          </dt>
                          <dd
                            class="font-medium text-emerald-700 dark:text-emerald-300"
                            data-completed-at
                          >
                            {{ completedText(order) }}
                          </dd>
                        </template>
                      </dl>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <span class="flex flex-col items-start gap-1.5">
                      <span
                        class="status-badge"
                        :data-stage="order.workflow_stage"
                        >{{
                          stageLabel(order.workflow_stage) || order.status
                        }}</span
                      >
                      <span
                        class="priority-badge"
                        :data-priority="priorityKey(order)"
                        >{{ c[priorityKey(order)] }}</span
                      >
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-4 py-4 pr-6">
                    <span
                      class="font-semibold"
                      :class="
                        isOverdue(order)
                          ? 'text-rose-600 dark:text-rose-300'
                          : 'text-slate-700 dark:text-slate-200'
                      "
                      >{{ dueText(order) }}</span
                    >
                    <span
                      v-if="isOverdue(order)"
                      class="mt-0.5 block text-xs font-semibold text-rose-500"
                      >{{ c.overdue }}</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <ul class="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
            <li v-for="order in orders" :key="'card-' + order.id">
              <button
                type="button"
                class="task-row relative block w-full px-5 py-4 text-left transition active:bg-slate-50 dark:active:bg-slate-800/40"
                :data-stage="order.workflow_stage"
                @click="openOrder(order)"
              >
                <span class="task-row__stripe" aria-hidden="true"></span>
                <span class="flex items-start justify-between gap-3">
                  <span class="min-w-0">
                    <span
                      class="block text-xs font-semibold text-slate-500 dark:text-slate-400"
                      >#{{ orderNumber(order)
                      }}<template v-if="taskCode(order)">
                        · {{ taskCode(order) }}</template
                      ></span
                    >
                    <span
                      class="mt-0.5 block break-words font-bold text-slate-950 dark:text-white"
                      >{{ taskTitle(order) }}</span
                    >
                  </span>
                  <span
                    class="status-badge shrink-0"
                    :data-stage="order.workflow_stage"
                    >{{
                      stageLabel(order.workflow_stage) || order.status
                    }}</span
                  >
                </span>
                <span
                  class="mt-2 block break-words text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >{{ customer(order) || '—' }}</span
                >
                <span
                  v-if="order.description"
                  class="mt-0.5 line-clamp-2 break-words text-xs leading-5 text-slate-500 dark:text-slate-400"
                  >{{ order.description }}</span
                >
                <span
                  class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-slate-400"
                >
                  <span>{{ c.createdAt }}: {{ createdText(order) }}</span>
                  <span
                    class="priority-badge"
                    :data-priority="priorityKey(order)"
                    >{{ c[priorityKey(order)] }}</span
                  >
                  <span
                    class="font-semibold"
                    :class="
                      isOverdue(order)
                        ? 'text-rose-600 dark:text-rose-300'
                        : 'text-slate-700 dark:text-slate-200'
                    "
                    >{{ c.due }}: {{ dueText(order) }}</span
                  >
                </span>
              </button>
            </li>
          </ul>
        </template>

        <footer
          v-if="!error && (orders.length || page > 1)"
          class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-6"
        >
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {{ rangeText }}
          </p>
          <div class="flex items-center gap-2">
            <label
              class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              {{ c.rows }}
              <select
                v-model.number="filters.per_page"
                class="rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option v-for="n in [10, 25, 50, 100]" :key="n" :value="n">
                  {{ n }}
                </option>
              </select>
            </label>
            <button
              class="page-button"
              type="button"
              :disabled="loading || page <= 1"
              :aria-label="boardText.previousPage"
              @click="go(page - 1)"
            >
              ‹
            </button>
            <span
              class="min-w-[3.5rem] text-center text-xs font-bold text-slate-700 dark:text-slate-200"
              >{{ page }} / {{ lastPage }}</span
            >
            <button
              class="page-button"
              type="button"
              :disabled="loading || page >= lastPage"
              :aria-label="boardText.nextPage"
              @click="go(page + 1)"
            >
              ›
            </button>
          </div>
        </footer>
      </section>
    </section>
    <PermissionDenied v-else />
    <OrderDetailsModal
      :visible="isDetailsOpen && $can('orders.view')"
      :order="selectedOrder"
      :focus-target="focusTarget"
      @close="isDetailsOpen = false"
      @updated="onTaskUpdated"
    />
  </main>
</template>
<script>
import { apiErrorMessage, taskCopy } from '@/utils/task-workflow'
import { boardCopy } from '@/utils/task-board'
import { planningCopy } from '@/utils/planning-copy'
import { formatWallDateTime, parseWallTime } from '@/utils/wall-time'
import OrderDetailsModal from '~/components/engineer/OrderDetailsModal.vue'
import PermissionDenied from '@/components/modals/permission/PermissionDenied.vue'
const defaults = () => ({
  search: '',
  sort: 'priority',
  factory_id: '',
  operator_id: '',
  stage: '',
  due_from: '',
  due_to: '',
  confirmation: '',
  per_page: 25,
})
const PRIORITIES = ['normal', 'high', 'urgent']
const CLOSED = ['canceled', 'cancelled']
export default {
  components: { OrderDetailsModal, PermissionDenied },
  layout: 'engineer',
  middleware: ['role-guard'],
  meta: { role: 'engineer' },
  data: () => ({
    orders: [],
    options: { factories: [], operators: [] },
    filters: defaults(),
    page: 1,
    lastPage: 1,
    total: 0,
    from: null,
    to: null,
    stageCounts: {},
    loading: false,
    error: '',
    serial: 0,
    timer: null,
    refreshTimer: null,
    showFilters: false,
    isDetailsOpen: false,
    selectedOrder: null,
    focusTarget: null,
    openQueryVersion: 0,
    stages: ['created', 'accepted', 'in_progress', 'completed'],
    columns: ['task', 'client', 'status', 'due'],
  }),
  computed: {
    boardText() {
      return boardCopy[this.$i18n?.locale] || boardCopy.hy
    },
    t() {
      return taskCopy[this.$i18n?.locale] || taskCopy.hy
    },
    c() {
      return planningCopy[this.$i18n?.locale] || planningCopy.hy
    },
    scope() {
      return this.$store?.state?.workspace?.company?.id
    },
    waiting: {
      get() {
        return this.filters.confirmation === 'waiting'
      },
      set(v) {
        this.filters.confirmation = v ? 'waiting' : ''
      },
    },
    rangeInvalid() {
      const { due_from: from, due_to: to } = this.filters
      return Boolean(from && to && from > to)
    },
    // Filters hidden behind the mobile "Filters" button.
    advancedFilterCount() {
      const f = this.filters
      return [f.factory_id, f.operator_id, f.due_from, f.due_to].filter(
        (value) => value !== ''
      ).length
    },
    hasFilters() {
      const f = this.filters
      return Boolean(
        f.search || f.stage || f.confirmation || this.advancedFilterCount
      )
    },
    // Stage counts follow every filter except the stage itself.
    stageTotal() {
      return this.stages.reduce(
        (sum, stage) => sum + (Number(this.stageCounts[stage]) || 0),
        0
      )
    },
    rangeText() {
      if (!this.total || !this.from) return `${this.c.total}: ${this.total}`
      return `${this.from}–${this.to} / ${this.total}`
    },
  },
  watch: {
    '$route.query'() {
      this.openFromQuery()
    },
    filters: {
      deep: true,
      handler() {
        ++this.serial
        this.page = 1
        this.loading = true
        clearTimeout(this.timer)
        this.timer = setTimeout(() => this.fetchRows(), 250)
      },
    },
    scope() {
      ++this.openQueryVersion
      this.selectedOrder = null
      this.isDetailsOpen = false
      this.options = { factories: [], operators: [] }
      this.orders = []
      this.stageCounts = {}
      this.total = 0
      this.resetFilters()
    },
  },
  created() {
    if (this.$can('orders.view')) {
      this.fetchRows()
      this.openFromQuery()
    }
  },
  mounted() {
    this.refreshTimer = setInterval(() => {
      if (!document.hidden && !this.loading) this.fetchRows()
    }, 30000)
  },
  beforeDestroy() {
    ++this.serial
    ++this.openQueryVersion
    clearTimeout(this.timer)
    clearInterval(this.refreshTimer)
  },
  methods: {
    resetFilters() {
      this.filters = defaults()
    },
    go(page) {
      this.page = page
      this.fetchRows()
    },
    stageLabel(stage) {
      const short = {
        created: 'shortCreated',
        accepted: 'shortAccepted',
        completed: 'shortCompleted',
      }[stage]
      return (short && this.boardText[short]) || this.boardText[stage] || ''
    },
    priorityKey(order) {
      return PRIORITIES[Number(order.priority_rank) || 0] || 'normal'
    },
    orderNumber(order) {
      return order.order_number?.number || order.id
    },
    // The project and item names that the order code (990.01) stands for.
    taskTitle(order) {
      const item = order.remote_number
      const names = [item?.pmp?.group_name, item?.remote_number_name]
        .map((name) => String(name || '').trim())
        .filter(Boolean)
      return [...new Set(names)].join(' · ') || order.name || '—'
    },
    // Once a name takes its place, the code is shown next to the number.
    taskCode(order) {
      return order.name && this.taskTitle(order) !== order.name
        ? order.name
        : ''
    },
    // A company by its name, a person by first and last name.
    customer(order) {
      const client = order.client
      if (!client) return ''
      const person = [client.name, client.last_name].filter(Boolean).join(' ')
      return client.company_name || person || client.user?.name || ''
    },
    // created_time carries the hour and zone; created_at alone is a d/m/Y day.
    createdText(order) {
      if (order.created_time) return formatWallDateTime(order.created_time)
      return String(order.created_at || '').replace(/\//g, '.') || '—'
    },
    completedText(order) {
      return formatWallDateTime(order.completed_at)
    },
    dueText(order) {
      return formatWallDateTime(order.dates?.finish_date)
    },
    isOverdue(order) {
      if (order.workflow_stage === 'completed' || CLOSED.includes(order.status))
        return false
      const due = parseWallTime(order.dates?.finish_date)
      return Number.isFinite(due) && due < Date.now()
    },
    async fetchRows() {
      if (!this.$can('orders.view')) return
      const id = ++this.serial
      this.error = ''
      // An impossible range is explained next to the dates; the last valid
      // results stay visible instead of being replaced by an error.
      if (this.rangeInvalid) {
        this.loading = false
        return
      }
      this.loading = true
      try {
        const { data } = await this.$axios.get('/api/engineers/engineer', {
          params: {
            ...Object.fromEntries(
              Object.entries(this.filters).filter(([, v]) => v !== '')
            ),
            page: this.page,
            filter_options: 1,
          },
        })
        if (id !== this.serial) return
        const pagination = data.pagination || {}
        this.lastPage = Math.max(1, Number(pagination.last_page) || 1)
        if (this.page > this.lastPage) {
          this.go(this.lastPage)
          return
        }
        this.orders = Array.isArray(data.orders) ? data.orders : []
        this.total = Number(pagination.total) || 0
        this.from = pagination.from || null
        this.to = pagination.to || null
        this.stageCounts = data.stage_counts || {}
        this.options = data.filter_options || { factories: [], operators: [] }
      } catch (e) {
        if (id === this.serial)
          this.error = apiErrorMessage(e, this.c.loadFailed)
      } finally {
        if (id === this.serial) this.loading = false
      }
    },
    async openFromQuery() {
      if (!this.$can('orders.view')) return
      const version = ++this.openQueryVersion
      const id = Number(this.$route.query.order)
      if (!Number.isSafeInteger(id) || id <= 0) return
      const companyId = this.$store?.state?.workspace?.company?.id
      const current = () =>
        version === this.openQueryVersion &&
        !this._isDestroyed &&
        Number(this.$route.query.order) === id &&
        this.$store?.state?.workspace?.company?.id === companyId
      // A notification always resolves fresh state, including a task outside the
      // currently visible column page or a decision already handled elsewhere.
      let order
      try {
        const { data } = await this.$axios.get(`/api/engineers/engineer/${id}`)
        order = data.order
      } catch (error) {
        if (current())
          this.$notify?.({ type: 'error', text: apiErrorMessage(error) })
      }
      if (!current()) return
      const target = {
        stepId: Number(this.$route.query.step) || null,
        action: this.$route.query.action,
        enabled: true,
      }
      if (order) this.openOrder(order, target)
      const query = { ...this.$route.query }
      for (const key of ['order', 'step', 'action']) delete query[key]
      const result = this.$router.replace({ path: this.$route.path, query })
      if (result && result.catch) result.catch(() => {})
    },
    openOrder(order, target = null) {
      this.selectedOrder = order
      this.focusTarget = target
      this.isDetailsOpen = true
    },
    onTaskUpdated(order) {
      this.selectedOrder = order
      this.fetchRows()
    },
  },
}
</script>
<style scoped>
.chip-row {
  scrollbar-width: none;
}
.chip-row::-webkit-scrollbar {
  display: none;
}
.filter-field {
  display: block;
  min-width: 0;
}
.filter-label {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.stage-chip {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 8px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
  transition: background 150ms ease, border-color 150ms ease;
}
.stage-chip:hover {
  border-color: #cbd5e1;
}
.stage-chip:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}
.stage-chip__count {
  min-width: 22px;
  padding: 1px 7px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  text-align: center;
}
.stage-chip[aria-pressed='true'] {
  border-color: #020617;
  background: #020617;
  color: #fff;
}
.stage-chip[aria-pressed='true'] .stage-chip__count {
  background: rgb(255 255 255 / 18%);
  color: #fff;
}
.status-badge,
.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
  white-space: nowrap;
}
.status-badge::before {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  content: '';
}
.status-badge,
.status-badge[data-stage='created'] {
  background: #f1f5f9;
  color: #475569;
}
.status-badge[data-stage='accepted'] {
  background: #e8f1ff;
  color: #2563b9;
}
.status-badge[data-stage='in_progress'] {
  background: #fff5cc;
  color: #a86108;
}
.status-badge[data-stage='completed'] {
  background: #d9f9ec;
  color: #16785e;
}
.priority-badge[data-priority='normal'] {
  padding: 0;
  color: #64748b;
  font-weight: 600;
}
.priority-badge[data-priority='high'] {
  background: #fff7ed;
  color: #c2410c;
}
.priority-badge[data-priority='urgent'] {
  background: #ffe4e6;
  color: #be123c;
}
.task-row__stripe {
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: 0;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: #cbd5e1;
}
.task-row[data-stage='accepted'] .task-row__stripe {
  background: #3b82f6;
}
.task-row[data-stage='in_progress'] .task-row__stripe {
  background: #f59e0b;
}
.task-row[data-stage='completed'] .task-row__stripe {
  background: #10b981;
}
.page-button {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  color: #334155;
  font-size: 18px;
  line-height: 1;
}
.page-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
.progress-bar {
  overflow: hidden;
  background: #e2e8f0;
}
.progress-bar::after {
  position: absolute;
  inset: 0;
  width: 40%;
  background: #0f172a;
  animation: task-progress 1.1s ease-in-out infinite;
  content: '';
}
@keyframes task-progress {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(250%);
  }
}
/* The app switches themes with a .dark class, like assets/css/main.css. */
.dark .filter-label {
  color: #94a3b8;
}
.dark .stage-chip,
.dark .page-button {
  border-color: #334155;
  background: #0f172a;
  color: #e2e8f0;
}
.dark .stage-chip__count {
  background: #1e293b;
  color: #cbd5e1;
}
.dark .stage-chip[aria-pressed='true'] {
  border-color: #f8fafc;
  background: #f8fafc;
  color: #020617;
}
.dark .stage-chip[aria-pressed='true'] .stage-chip__count {
  background: #e2e8f0;
  color: #020617;
}
.dark .status-badge,
.dark .status-badge[data-stage='created'] {
  background: #253145;
  color: #bdc9dc;
}
.dark .status-badge[data-stage='accepted'] {
  background: #172e51;
  color: #9cc2ff;
}
.dark .status-badge[data-stage='in_progress'] {
  background: #423313;
  color: #f3d68c;
}
.dark .status-badge[data-stage='completed'] {
  background: #0d3d32;
  color: #86e3bd;
}
.dark .priority-badge[data-priority='high'] {
  background: #431407;
  color: #fdba74;
}
.dark .priority-badge[data-priority='urgent'] {
  background: #4c0519;
  color: #fda4af;
}
.dark .task-row__stripe {
  background: #475569;
}
.dark .progress-bar {
  background: #1e293b;
}
.dark .progress-bar::after {
  background: #f8fafc;
}
@media (prefers-reduced-motion: reduce) {
  .progress-bar::after {
    animation: none;
    width: 100%;
    opacity: 0.4;
  }
}
</style>
