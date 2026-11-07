<template>
  <main class="min-h-screen min-w-0 px-4 py-6 sm:px-6 lg:px-8" data-laser-board>
    <FactoryTaskBoard
      v-if="!isModal"
      :subtitle="boardText.recentHelp"
      :chips="stageChips"
      :total="searchMatches.length"
      :selected.sync="selectedStatuses"
      :search.sync="searchable"
      :columns="boardColumns"
      :loaded="loaded"
      :load-failed="loadFailed"
      :has-tasks="allOrders.length > 0"
      :has-results="filteredBySearch.length > 0"
      :factory-id="currentFactoryId"
      :current-user-id="currentUserId"
      :status-options="boardStatusOptions"
      :saving="isSaving"
      :pagination="paginationMeta"
      :per-page="perPage"
      @retry="retryLoad"
      @drag-start="onDragStart"
      @drag-end="clearDrag"
      @drop="onDrop"
      @view-details="toggleDetails"
      @edit="updateOrder"
      @page="handlePageChange"
    />

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

    <TaskDetailsDialog
      v-if="isOpenDetails"
      :details="details"
      :step="detailsStep"
      :can-update="canUpdateDetails"
      @close="isOpenDetails = false"
      @change-status="updateOrder(details)"
    >
      <LaserOrderDetailsPanel
        :details="details"
        :dxf-url="dxfUrl"
        @view-file="viewFile"
        @download-file="downloadFile"
        @close-dxf="dxfUrl = ''"
        @updated="onRequestChanged"
      />
    </TaskDetailsDialog>

    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import {
  boardColumnForStep,
  factoryBoardColumns,
  boardCopy,
} from '@/utils/task-board'
import { sortWorkshopTasks } from '@/utils/task-routing'
import {
  isFactoryOrderFinished,
  normalizeFactoryOrderStatus,
  localFactoryDate,
  localFactoryTimestamp,
} from '@/utils/factory-order-status'
import { isStepRejected, isStepWaiting, taskCopy } from '@/utils/task-workflow'
import FactoryTaskBoard from '@/components/factory/FactoryTaskBoard.vue'
import TaskDetailsDialog from '@/components/factory/TaskDetailsDialog.vue'
import LaserOrderDetailsPanel from '@/components/factory/laser/LaserOrderDetailsPanel.vue'
import OrderActionModal from '@/components/factory/OrderActionModal.vue'

export default {
  components: {
    OrderActionModal,
    LaserOrderDetailsPanel,
    FactoryTaskBoard,
    TaskDetailsDialog,
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
    detailsStep() {
      return this.details?.id
        ? this.getFactoryOrderForCurrentFactory(this.details)
        : null
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
        !isStepWaiting(fo) &&
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
