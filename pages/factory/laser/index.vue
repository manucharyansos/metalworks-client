<template>
  <main class="min-h-screen min-w-0 px-4 py-6 sm:px-6 lg:px-8" data-laser-board>
    <section v-if="!isModal" class="mx-auto space-y-5">
      <header class="min-w-0">
        <h1
          class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl"
        >
          {{ copy.title }}
        </h1>
        <p
          class="mt-1 text-sm text-slate-500 dark:text-slate-400"
          data-board-retention
        >
          {{ boardText.recentHelp }}
        </p>
      </header>

      <nav
        class="chip-row -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5"
        :aria-label="copy.status"
      >
        <button
          type="button"
          class="stage-chip"
          data-tone="all"
          :aria-pressed="String(!selectedStatuses.length)"
          @click="selectedStatuses = []"
        >
          <span class="whitespace-nowrap">{{ copy.all }}</span>
          <span class="stage-chip__count">{{ searchMatches.length }}</span>
        </button>
        <button
          v-for="column in stageChips"
          :key="column.id"
          type="button"
          class="stage-chip"
          :data-tone="tone(column)"
          :data-stage="column.value"
          :aria-pressed="String(selectedStatuses.includes(column.value))"
          @click="toggleStage(column.value)"
        >
          <span class="stage-chip__dot" aria-hidden="true"></span>
          <span class="whitespace-nowrap">{{ label(column) }}</span>
          <span class="stage-chip__count">{{ column.orders.length }}</span>
        </button>
      </nav>

      <section
        class="app-surface flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center sm:p-5"
      >
        <label class="min-w-0 flex-1">
          <span class="sr-only">{{ copy.search }}</span>
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
              v-model="searchable"
              type="search"
              maxlength="120"
              class="app-control !pl-11"
              :placeholder="copy.search"
              data-board-search
            />
          </span>
        </label>
        <button
          v-if="hasFilters"
          type="button"
          class="shrink-0 text-sm font-bold text-slate-600 underline-offset-4 transition hover:text-slate-950 hover:underline dark:text-slate-300 dark:hover:text-white"
          data-clear-board-filters
          @click="clearFilters"
        >
          {{ copy.clear }}
        </button>
      </section>

      <div
        v-if="!loaded"
        class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        role="status"
        data-board-loading
      >
        <span class="sr-only">{{ copy.loading }}</span>
        <div
          v-for="n in 4"
          :key="n"
          class="animate-pulse space-y-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div class="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div class="h-32 rounded-2xl bg-white dark:bg-slate-800"></div>
          <div class="h-32 rounded-2xl bg-white/70 dark:bg-slate-800/70"></div>
        </div>
      </div>

      <div
        v-else-if="loadFailed && !allOrders.length"
        role="alert"
        class="app-surface flex flex-col items-center gap-3 rounded-3xl px-6 py-12 text-center"
      >
        <p class="text-sm font-semibold text-rose-600 dark:text-rose-300">
          {{ copy.loadFailed }}
        </p>
        <button
          type="button"
          class="app-button-secondary !py-2"
          @click="retryLoad"
        >
          {{ copy.retry }}
        </button>
      </div>

      <div
        v-else-if="!filteredBySearch.length"
        class="app-surface flex flex-col items-center gap-3 rounded-3xl px-6 py-14 text-center"
        data-board-empty
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
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {{ allOrders.length ? copy.noResults : copy.empty }}
        </p>
        <p
          v-if="!allOrders.length"
          class="max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400"
        >
          {{ copy.emptyHelp }}
        </p>
        <button
          v-if="hasFilters"
          type="button"
          class="app-button-secondary !py-2"
          @click="clearFilters"
        >
          {{ copy.clear }}
        </button>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="column in boardColumns"
          :key="column.id"
          :data-board-column="column.value"
          :data-tone="tone(column)"
          class="work-board-column board-column flex h-[calc(100vh-300px)] min-h-[420px] flex-col rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60"
          @dragover.prevent
          @drop.prevent="onDrop(column)"
        >
          <div
            class="mb-3 flex shrink-0 items-center justify-between gap-2 px-1"
          >
            <h2
              class="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100"
            >
              <span class="board-column__dot" aria-hidden="true"></span>
              <span class="truncate">{{ label(column) }}</span>
            </h2>
            <span
              class="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300"
            >
              {{ column.orders.length }}
            </span>
          </div>

          <div class="flex-1 space-y-3 overflow-y-auto pr-1">
            <transition-group
              name="fade-list"
              tag="div"
              class="flex flex-col gap-3"
            >
              <OrderCard
                v-for="order in column.orders"
                :key="order.id"
                compact
                :order="order"
                :factory-id="currentFactoryId"
                :current-user-id="currentUserId"
                :status-options="boardStatusOptions"
                :saving="isSaving"
                @drag-start="onDragStart(order, column)"
                @drag-end="clearDrag"
                @view-details="toggleDetails"
                @edit="updateOrder"
              />
            </transition-group>

            <div
              v-if="!column.orders.length"
              class="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/60 p-3 text-center text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500"
            >
              {{ copy.dropHere }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="paginationMeta.total > perPage" class="flex justify-center">
        <Pagination :meta="paginationMeta" @change="handlePageChange" />
      </div>
    </section>

    <OrderActionModal
      :is-open="isModal"
      :action-options="actionOptions"
      :cancel-reasons="cancelReasons"
      :today-formatted="todayFormatted"
      :tomorrow-date="tomorrowDate"
      :order="selectedOrder"
      :factory-order="selectedFactoryOrder"
      :initial-status="initialStatus"
      :initial-reason="selectedFactoryOrder?.canceling || ''"
      :initial-date="selectedFactoryOrder?.cancel_date || ''"
      :saving="isSaving"
      @close="closeModal"
      @confirm="handleModalConfirm"
    />

    <div
      v-if="isOpenDetails"
      class="work-modal-frame work-modal-backdrop fixed inset-0 z-50"
      @click.self="isOpenDetails = false"
    >
      <section
        ref="detailsDialog"
        data-work-modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="laser-details-title"
        tabindex="-1"
        class="work-modal work-modal--structured w-full max-w-6xl outline-none"
        @keydown.esc="isOpenDetails = false"
      >
        <header
          class="work-modal__header flex items-start justify-between gap-4"
        >
          <div class="min-w-0">
            <p class="work-task-card__meta whitespace-nowrap">
              #{{ details.order_number?.number || details.id }} ·
              {{ details.prefix_code?.code || '—' }}
            </p>
            <h2
              id="laser-details-title"
              class="truncate text-lg font-black text-slate-950 dark:text-white sm:text-xl"
            >
              {{ details.name || copy.title }}
            </h2>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <span
              v-if="detailsStep"
              class="work-status whitespace-nowrap"
              :data-tone="detailsTone"
              >{{ detailsStatus }}</span
            >
            <button
              type="button"
              class="work-modal__close"
              :aria-label="copy.close"
              @click="isOpenDetails = false"
            >
              ✕
            </button>
          </div>
        </header>
        <div class="work-modal__body">
          <LaserOrderDetailsPanel
            :details="details"
            :dxf-url="dxfUrl"
            @view-file="viewFile"
            @download-file="downloadFile"
            @close-dxf="dxfUrl = ''"
            @updated="onRequestChanged"
          />
        </div>
        <footer
          v-if="canUpdateDetails"
          class="work-modal__footer flex justify-end"
        >
          <button
            type="button"
            class="app-button-primary !rounded-xl !py-2.5"
            @click="updateOrder(details)"
          >
            {{ $t('factory_order_actions.change_status') }}
          </button>
        </footer>
      </section>
    </div>

    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import {
  boardColumnForStep,
  factoryBoardColumns,
  boardCopy,
  stepStatusText,
} from '@/utils/task-board'
import {
  columnLabel,
  columnTone,
  factoryBoardCopy,
} from '@/utils/factory-board-copy'
import { sortWorkshopTasks } from '@/utils/task-routing'
import {
  isFactoryOrderFinished,
  normalizeFactoryOrderStatus,
  localFactoryDate,
  localFactoryTimestamp,
} from '@/utils/factory-order-status'
import { isStepRejected, taskCopy } from '@/utils/task-workflow'
import OrderCard from '@/components/factory/OrderCard.vue'
import Pagination from '@/components/ui/Pagination.vue'
import LaserOrderDetailsPanel from '@/components/factory/laser/LaserOrderDetailsPanel.vue'
import OrderActionModal from '@/components/factory/OrderActionModal.vue'

export default {
  components: {
    OrderActionModal,
    LaserOrderDetailsPanel,
    OrderCard,
    Pagination,
  },
  layout: 'factory',
  middleware: ['role-guard'],
  meta: { role: 'laser' },
  data() {
    return {
      searchable: '',
      loaded: false,
      loadFailed: false,
      isModal: false,
      isSaving: false,
      refreshTimer: null,
      initialStatus: null,
      isOpenDetails: false,
      selectedOrder: {},
      dxfUrl: '',
      details: {
        name: '',
        quantity: 0,
        description: '',
        files: [],
      },

      draggingOrder: null,
      draggingFromColumnId: null,

      selectedStatuses: [],
      currentPage: 1,
      perPage: 12,
      currentFactoryId: null,
      currentUserId: null,

      statusOptions: [],
      actionOptions: [],
      cancelReasons: [
        { label: 'Ոչ հստակ առաջադրանք', value: 'unclear' },
        { label: 'Սխալ տվյալներ', value: 'wrong_data' },
        { label: 'Նյութի բացակայություն', value: 'no_material' },
        { label: 'Այլ պատճառ', value: 'other' },
      ],
      selectedOption: null,
      additionalOption: null,
      changeDate: null,
    }
  },
  computed: {
    ...mapGetters('factory', [
      'getOrderByFactories',
      'getActionError',
      'getActionConflictOrder',
    ]),

    boardText() {
      return boardCopy[this.$i18n?.locale] || boardCopy.hy
    },
    taskText() {
      return taskCopy[this.$i18n?.locale] || taskCopy.hy
    },
    copy() {
      return factoryBoardCopy[this.$i18n?.locale] || factoryBoardCopy.hy
    },
    // Tasks matching the search alone: the stage buttons count these.
    searchMatches() {
      const term = this.searchable.trim().toLowerCase()
      if (!term) return this.allOrders
      return this.allOrders.filter((order) => this.matchesSearch(order, term))
    },
    stageChips() {
      return factoryBoardColumns(
        this.searchMatches,
        this.currentFactoryId,
        this.statusOptions,
        this.$i18n?.locale
      )
    },
    hasFilters() {
      return Boolean(this.searchable.trim() || this.selectedStatuses.length)
    },
    detailsStep() {
      return this.details?.id
        ? this.getFactoryOrderForCurrentFactory(this.details)
        : null
    },
    detailsStatus() {
      return stepStatusText(this.detailsStep, this.$i18n?.locale)
    },
    detailsTone() {
      const step = this.detailsStep
      if (!step) return 'neutral'
      if (step.awaiting_engineer_confirmation) return 'amber'
      if (isStepRejected(step)) return 'red'
      if (isFactoryOrderFinished(step.status)) return 'green'
      return ['accepted', 'confirmed', 'in_progress', 'date_changed'].includes(
        step.status
      )
        ? 'blue'
        : 'neutral'
    },

    selectedFactoryOrder() {
      return this.getFactoryOrderForCurrentFactory(this.selectedOrder)
    },

    canUpdateDetails() {
      const fo = this.getFactoryOrderForCurrentFactory(this.details)
      return (
        !this.isSaving &&
        this.$can('factory.order_update') &&
        !!fo &&
        !isFactoryOrderFinished(fo.status) &&
        (!fo.operator_id ||
          String(fo.operator_id) === String(this.currentUserId))
      )
    },

    allOrders() {
      const orders = this.getOrderByFactories?.orders
      return sortWorkshopTasks(
        Array.isArray(orders) ? orders : [],
        this.currentFactoryId
      )
    },

    filteredByStatus() {
      if (!this.selectedStatuses.length) return this.allOrders

      return this.allOrders.filter((order) => {
        const fo = this.getFactoryOrderForCurrentFactory(order)
        if (!fo) return false

        const statusKey = boardColumnForStep(fo)
        return this.selectedStatuses.includes(statusKey)
      })
    },

    filteredBySearch() {
      const searchTerm = this.searchable.trim().toLowerCase()
      if (!searchTerm) return this.filteredByStatus

      return this.filteredByStatus.filter((order) =>
        this.matchesSearch(order, searchTerm)
      )
    },

    paginatedOrders() {
      const list = Array.isArray(this.filteredBySearch)
        ? this.filteredBySearch
        : []
      const start = (this.currentPage - 1) * this.perPage
      return list.slice(start, start + this.perPage)
    },

    paginationMeta() {
      const total = this.filteredBySearch.length || 0
      const lastPage = Math.max(Math.ceil(total / this.perPage), 1)

      return {
        current_page: this.currentPage,
        per_page: this.perPage,
        total,
        last_page: lastPage,
      }
    },
    boardStatusOptions() {
      return factoryBoardColumns(
        [],
        this.currentFactoryId,
        this.statusOptions,
        this.$i18n?.locale
      )
    },
    boardColumns() {
      return factoryBoardColumns(
        this.paginatedOrders || [],
        this.currentFactoryId,
        this.statusOptions,
        this.$i18n?.locale
      )
    },

    finishDate() {
      return this.$formatDate(new Date())
    },

    todayFormatted() {
      return this.$formatDate(new Date(), 'dd.MM.yyyy')
    },

    tomorrowDate() {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      return localFactoryDate(d)
    },
  },
  watch: {
    // A new filter starts from the first page; a later page may be empty.
    searchable() {
      this.currentPage = 1
    },
    selectedStatuses() {
      this.currentPage = 1
    },
    isOpenDetails(open) {
      if (open) this.$nextTick(() => this.$refs.detailsDialog?.focus())
    },
  },
  async mounted() {
    try {
      const [actionsRes, filtersRes] = await Promise.all([
        this.$axios.get('/api/factories/factory-order-actions'),
        this.$axios.get('/api/factories/factory-order-filters'),
      ])

      this.actionOptions = Array.isArray(actionsRes.data) ? actionsRes.data : []
      this.statusOptions = Array.isArray(filtersRes.data) ? filtersRes.data : []
    } catch (err) {
      this.$notify({
        text: 'Չհաջողվեց բեռնել գործողությունները',
        type: 'error',
      })
    }

    const factoryId = this.$auth.user?.factory_id
    const userId = this.$auth.user?.id
    this.currentFactoryId = factoryId || null
    this.currentUserId = userId || null

    if (this.currentFactoryId) {
      await this.loadBoard()
      // The engineer answers requests and returns work at any moment.
      this.refreshTimer = setInterval(this.refreshQuietly, 30000)
    } else {
      this.loaded = true
    }
  },
  beforeDestroy() {
    clearInterval(this.refreshTimer)
  },
  methods: {
    // The first load shows a placeholder; a failure without data offers a retry.
    async loadBoard() {
      const result = await this.fetchOrdersByFactory(this.currentFactoryId)
      this.loadFailed = result === false
      this.loaded = true
    },
    retryLoad() {
      if (!this.currentFactoryId) return
      this.loaded = false
      return this.loadBoard()
    },
    matchesSearch(order, term) {
      return [
        order.order_number?.number,
        order.name,
        order.description,
        order.prefix_code?.code,
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(term)
      )
    },
    tone(column) {
      return columnTone(column)
    },
    label(column) {
      return columnLabel(column, this.boardText)
    },
    toggleStage(value) {
      this.selectedStatuses = this.selectedStatuses.includes(value)
        ? this.selectedStatuses.filter((item) => item !== value)
        : [...this.selectedStatuses, value]
    },
    clearFilters() {
      this.searchable = ''
      this.selectedStatuses = []
    },

    async refreshQuietly() {
      if (
        document.hidden ||
        this.isSaving ||
        this.isModal ||
        !this.currentFactoryId
      )
        return
      try {
        await this.fetchOrdersByFactory(this.currentFactoryId)
        this.rebindDetails()
      } catch (error) {
        // Quiet: the next tick tries again.
      }
    },

    // Keep the open details panel pointing at the freshly loaded order.
    rebindDetails() {
      if (!this.isOpenDetails || !this.details?.id) return
      const rows = this.getOrderByFactories?.orders || []
      const fresh = rows.find((row) => row.id === this.details.id)
      if (fresh) this.details = fresh
    },

    async onRequestChanged() {
      if (!this.currentFactoryId) return
      await this.fetchOrdersByFactory(this.currentFactoryId)
      this.rebindDetails()
    },

    ...mapActions('factory', [
      'fetchOrdersByFactory',
      'doneFinishedOrder',
      'downloadUploadedFile',
    ]),

    mapStatusIcon(iconName) {
      switch (iconName) {
        case 'Check':
        case 'Check Circle':
          return '✓'
        case 'Cross':
          return '✕'
        case 'Refresh':
          return '⟳'
        default:
          return '•'
      }
    },

    getFactoryOrderForCurrentFactory(order) {
      if (order.factory_orders && order.factory_orders.length) {
        const fo = order.factory_orders.find(
          (f) => String(f.factory_id) === String(this.currentFactoryId)
        )

        if (fo) {
          const rawStatus = fo.status
          const normalizedStatus = normalizeFactoryOrderStatus(rawStatus)

          return {
            ...fo,
            status: normalizedStatus,
          }
        }
      }

      if (order.factories && order.factories.length) {
        const belongs = order.factories.some(
          (f) => String(f.id) === String(this.currentFactoryId)
        )
        if (belongs) {
          return {
            factory_id: this.currentFactoryId,
            status: null,
            operator_id: null,
          }
        }
      }

      return null
    },

    handlePageChange(page) {
      this.currentPage = page
    },

    viewFile(filePath) {
      this.dxfUrl = filePath
    },

    async downloadFile(file) {
      await this.downloadUploadedFile(file)
      file.status = 'downloaded'
    },

    loadFile(file) {
      if (!(file instanceof Blob)) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const blob = new Blob([e.target.result], { type: 'application/dxf' })
        this.dxfUrl = URL.createObjectURL(blob)
      }
      reader.readAsArrayBuffer(file)
    },

    updateOrder(order, initialStatus) {
      if (this.isSaving || !this.$can('factory.order_update')) return
      const fo = this.getFactoryOrderForCurrentFactory(order)

      if (isStepRejected(fo) && fo.pending_request) {
        this.$notify({ text: this.taskText.requestWaiting, type: 'info' })
        return
      }

      if (isFactoryOrderFinished(fo?.status)) {
        this.$notify({
          text: fo?.awaiting_engineer_confirmation
            ? this.taskText.waiting
            : 'Այս առաջադրանքն արդեն ավարտված է',
          type: 'info',
        })
        return
      }

      if (
        fo?.operator_id &&
        String(fo.operator_id) !== String(this.currentUserId)
      ) {
        this.$notify({
          text: 'Առաջադրանքը զբաղված է այլ օպերատորի կողմից',
          type: 'warning',
        })
        return
      }

      this.selectedOrder = order
      this.initialStatus =
        initialStatus === undefined ? fo?.status || null : initialStatus
      this.isOpenDetails = false
      this.isModal = true
    },

    closeModal() {
      if (this.isSaving) return
      this.isModal = false
      this.selectedOrder = {}
    },

    async handleModalConfirm(payload) {
      if (
        this.isSaving ||
        !this.selectedOrder.id ||
        !this.currentFactoryId ||
        !this.$can('factory.order_update')
      )
        return
      const finalPayload = {
        id: this.selectedOrder.id,
        factory_id: this.currentFactoryId,
        factory_order: {
          status: payload.status,
          canceling: payload.canceling,
          cancel_date: payload.cancel_date,
          operator_finish_date: payload.operator_finish_date,
        },
      }

      if (payload.status === 'finished') {
        const step = this.getFactoryOrderForCurrentFactory(this.selectedOrder)
        finalPayload.factory_order.expected_file_versions = JSON.stringify(
          Object.fromEntries(
            (step?.files || []).map((file) => [
              file.id,
              Number(file.pivot?.task_file_revision_id || 0),
            ])
          )
        )
        finalPayload.factory_order.expected_confirmation_required =
          step?.confirmation_required ? 1 : 0
        if (step?.confirmation_required)
          finalPayload.factory_order.expected_confirmation_method =
            step.confirmation_method
      }
      if (payload.request_note)
        finalPayload.factory_order.request_note = payload.request_note
      if (payload.evidence_text)
        finalPayload.factory_order.evidence_text = payload.evidence_text
      if (payload.evidence_photo)
        finalPayload.evidence_photo = payload.evidence_photo
      this.isSaving = true
      let success = false
      try {
        success = await this.doneFinishedOrder(finalPayload)
        if (
          !success &&
          this.getActionConflictOrder?.id === this.selectedOrder.id
        )
          this.selectedOrder = this.getActionConflictOrder
        if (success) await this.fetchOrdersByFactory(this.currentFactoryId)
      } catch (error) {
        success = false
      } finally {
        this.isSaving = false
      }
      if (success) {
        this.$notify({
          text: success.changeRequest
            ? this.taskText.requestSent
            : 'Հաջողությամբ թարմացվեց',
          type: 'success',
        })
        this.closeModal()
      } else {
        this.$notify({
          text:
            this.getActionError ||
            'Չհաջողվեց թարմացնել առաջադրանքը։ Փորձեք կրկին։',
          type: 'error',
        })
      }
    },

    async doneOrder() {
      if (!this.selectedOption) return

      const payload = {
        id: this.selectedOrder.id,
        factory_id: this.currentFactoryId,
        factory_order: {
          status: this.selectedOption.value,
          canceling: this.additionalOption?.value || '',
          cancel_date:
            this.selectedOption.value === 'date_changed'
              ? this.changeDate
              : null,
          operator_finish_date:
            this.selectedOption.value === 'finished'
              ? new Date().toISOString().slice(0, 19).replace('T', ' ')
              : null,
        },
      }

      const success = await this.doneFinishedOrder(payload)
      if (success) {
        this.$notify({ text: 'Հաջողությամբ թարմացվեց', type: 'success' })
        this.closeModal()
        await this.fetchOrdersByFactory(this.currentFactoryId)
      }
    },

    toggleDetails(order) {
      this.isOpenDetails = !this.isOpenDetails
      this.details = order
    },

    onDragStart(order, column) {
      if (this.isSaving || !this.$can('factory.order_update')) return
      this.draggingOrder = order
      this.draggingFromColumnId = column.id
    },

    clearDrag() {
      this.draggingOrder = null
      this.draggingFromColumnId = null
    },

    async onDrop(targetColumn) {
      const order = this.draggingOrder
      this.clearDrag()
      if (!order || this.isSaving) return
      const newStatusValue = normalizeFactoryOrderStatus(targetColumn.value)
      await this.updateOrderStatusByDrag(order, newStatusValue)
    },

    async updateOrderStatusByDrag(order, newStatus) {
      if (this.isSaving || !this.$can('factory.order_update')) return
      const fo = this.getFactoryOrderForCurrentFactory(order)
      if (!fo || fo.status === newStatus) return

      if (isStepRejected(fo) && fo.pending_request) {
        this.$notify({ text: this.taskText.requestWaiting, type: 'info' })
        return
      }

      if (isFactoryOrderFinished(fo.status)) {
        this.$notify({
          text: 'Արդեն ավարտված առաջադրանքի կարգավիճակը չի կարող փոխվել։',
          duration: 3000,
          position: 'top',
          type: 'info',
        })
        return
      }

      if (
        fo &&
        fo.operator_id &&
        String(fo.operator_id) !== String(this.currentUserId)
      ) {
        this.$notify({
          text: 'Առաջադրանքը ընդունված է այլ օպերատորի կողմից, դուք չեք կարող փոխել։',
          duration: 3000,
          position: 'top',
          type: 'warning',
        })
        return
      }

      if (isStepRejected(fo)) {
        this.updateOrder(order, newStatus || 'pending')
        return
      }

      // Ask for the action's required data instead of inventing a reason or date.
      if (
        ['canceled', 'date_changed'].includes(newStatus) ||
        (newStatus === 'finished' && fo.confirmation_required)
      ) {
        this.updateOrder(order, newStatus)
        return
      }

      const payload = {
        id: order.id,
        factory_id: this.currentFactoryId,
        factory_order: {
          status: newStatus,
          canceling: '',
          cancel_date: null,
          operator_finish_date:
            newStatus === 'finished' ? localFactoryTimestamp() : null,
        },
      }

      this.isSaving = true
      let res = false
      try {
        res = await this.doneFinishedOrder(payload)
        if (res) await this.fetchOrdersByFactory(this.currentFactoryId)
      } catch (error) {
        res = false
      } finally {
        this.isSaving = false
      }
      if (res) {
        this.$notify({
          text: 'Կարգավիճակը հաջողությամբ թարմացվեց։',
          duration: 2500,
          position: 'top',
          type: 'success',
        })
      } else {
        this.$notify({
          text:
            this.getActionError || 'Սխալ տեղի ունեցավ կարգավիճակը թարմացնելիս։',
          duration: 3000,
          position: 'top',
          type: 'error',
        })
      }
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
/* Stage colours match the engineer task list: grey, blue, amber, red. */
[data-tone='created'] {
  --tone: #94a3b8;
}
[data-tone='accepted'] {
  --tone: #3b82f6;
}
[data-tone='in_progress'] {
  --tone: #f59e0b;
}
[data-tone='rejected'] {
  --tone: #f43f5e;
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
.stage-chip__dot,
.board-column__dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--tone, #94a3b8);
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
.board-column {
  border-top: 3px solid var(--tone, #94a3b8);
}
.dark .stage-chip {
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
.fade-list-enter-active,
.fade-list-leave-active {
  transition: all 0.2s ease;
}
.fade-list-enter-from,
.fade-list-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
