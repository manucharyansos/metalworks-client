<template>
  <main class="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
    <!-- Orders Board -->
    <template v-if="getOrderByFactories && !isModal">
      <div class="container mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col">
        <!-- Toolbar -->
        <OrdersToolbar
          :search="searchable"
          :status-options="statusOptions"
          :selected-statuses="selectedStatuses"
          @update:search="(v) => (searchable = v)"
          @update:selected-statuses="(v) => (selectedStatuses = v)"
        />

        <!-- Kanban board -->
        <div v-if="boardColumns.length" class="mt-4 flex-1">
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4 h-full">
            <div
              v-for="column in boardColumns"
              :key="column.id"
              class="flex flex-col rounded-2xl bg-gray-50/70 p-3 shadow-sm dark:bg-gray-800/60 h-[calc(100vh-260px)]"
              @dragover.prevent
              @drop="onDrop(column)"
            >
              <!-- Column header -->
              <div class="mb-2 flex items-center justify-between shrink-0">
                <div class="flex items-center gap-2">
                  <span
                    class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                    :style="{ backgroundColor: column.color || '#6B7280' }"
                  >
                    {{ column.icon }}
                  </span>
                  <h3
                    class="text-sm font-semibold text-gray-800 dark:text-gray-100"
                  >
                    {{ column.label }}
                  </h3>
                </div>
                <span
                  class="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                >
                  {{ column.orders.length }}
                </span>
              </div>

              <!-- Scrollable cards area -->
              <div class="mt-1 flex-1 overflow-y-auto pr-1 space-y-3">
                <transition-group
                  name="fade-list"
                  tag="div"
                  class="flex flex-col gap-3"
                >
                  <OrderCard
                    v-for="order in column.orders"
                    :key="order.id"
                    :order="order"
                    :factory-id="currentFactoryId"
                    :current-user-id="currentUserId"
                    @drag-start="onDragStart(order, column)"
                    @view-details="toggleDetails"
                    @edit="updateOrder"
                  />
                </transition-group>

                <!-- empty state -->
                <div
                  v-if="!column.orders.length"
                  class="mt-2 flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white/60 p-3 text-center text-xs text-gray-400 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-500"
                >
                  Քաշեք պատվերներ այստեղ
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Եթե լրիվ պատվերներ չկան -->
        <div
          v-else
          class="mt-10 flex items-center justify-center rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-300"
        >
          Պատվերներ չկան։
        </div>

        <!-- Pagination -->
        <div class="mt-8 flex justify-center">
          <Pagination
            v-if="paginationMeta.total > perPage"
            :pagination="paginationMeta"
            meta=""
            @page-changed="handlePageChange"
          />
        </div>
      </div>
    </template>

    <OrderActionModal
      :is-open="isModal"
      :action-options="actionOptions"
      :cancel-reasons="cancelReasons"
      :today-formatted="todayFormatted"
      :tomorrow-date="tomorrowDate"
      @close="closeModal"
      @confirm="handleModalConfirm"
    />

    <!-- Details Modal -->
    <template v-if="isOpenDetails">
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div
          class="relative w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
        >
          <button
            class="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="isOpenDetails = false"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <LaserOrderDetailsPanel
            :details="details"
            :dxf-url="dxfUrl"
            @view-file="viewFile"
            @download-file="downloadFile"
            @close-dxf="dxfUrl = ''"
          />
        </div>
      </div>
    </template>

    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import OrdersToolbar from '@/components/factory/OrdersToolbar.vue'
import OrderCard from '@/components/factory/OrderCard.vue'
import Pagination from '@/components/ui/Pagination.vue'
import LaserOrderDetailsPanel from '@/components/factory/laser/LaserOrderDetailsPanel.vue'
import OrderActionModal from '@/components/factory/OrderActionModal.vue'

export default {
  components: {
    OrderActionModal,
    LaserOrderDetailsPanel,
    OrdersToolbar,
    OrderCard,
    Pagination,
  },
  layout: 'factory',
  middleware: ['role-guard'],
  meta: { role: 'laser' },
  data() {
    return {
      searchable: '',
      isModal: false,
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
        { label: 'Ոչ հստակ պատվեր', value: 'unclear' },
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
    ...mapGetters('factory', ['getOrderByFactories']),

    allOrders() {
      const orders = this.getOrderByFactories?.orders
      return Array.isArray(orders) ? orders : []
    },

    filteredByStatus() {
      if (!this.selectedStatuses.length) return this.allOrders

      return this.allOrders.filter((order) => {
        const fo = this.getFactoryOrderForCurrentFactory(order)
        if (!fo) return false

        const statusKey = fo.status ?? 'null'
        return this.selectedStatuses.includes(statusKey)
      })
    },

    filteredBySearch() {
      const searchTerm = this.searchable.trim().toLowerCase()
      if (!searchTerm) return this.filteredByStatus

      return this.filteredByStatus.filter((order) => {
        const orderNumber = order.order_number?.number?.toLowerCase() || ''
        const name = order.name?.toLowerCase() || ''
        const description = order.description?.toLowerCase() || ''
        const prefixCode = order.prefix_code?.code?.toLowerCase() || ''
        return (
          orderNumber.includes(searchTerm) ||
          description.includes(searchTerm) ||
          name.includes(searchTerm) ||
          prefixCode.includes(searchTerm)
        )
      })
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
    boardColumns() {
      const ordersSource = Array.isArray(this.paginatedOrders)
        ? this.paginatedOrders
        : []

      const baseColumns = [
        {
          id: 'no_status',
          label: 'Առանց կարգավիճակի',
          value: 'null',
          icon: '•',
          color: '#9CA3AF',
        },
      ]

      const statusOptions = Array.isArray(this.statusOptions)
        ? this.statusOptions
        : []

      const dynamicColumns = statusOptions.map((s) => ({
        id: s.value,
        label: s.label,
        value: s.value,
        icon: this.mapStatusIcon(s.icon),
        color: s.color || '#6B7280',
      }))

      const columnsConfig = [...baseColumns, ...dynamicColumns]

      return columnsConfig.map((col) => {
        const orders = ordersSource.filter((order) => {
          const fo = this.getFactoryOrderForCurrentFactory(order)
          if (!fo) return false

          const statusKey = fo.status ?? 'null'
          return statusKey === col.value
        })
        return { ...col, orders }
      })
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
      return d.toISOString().split('T')[0]
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
      await this.fetchOrdersByFactory(this.currentFactoryId)
    }
  },
  methods: {
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
          const normalizedStatus =
            !rawStatus || rawStatus === 'pending' ? null : rawStatus

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

    updateOrder(order) {
      const fo = this.getFactoryOrderForCurrentFactory(order)

      if (fo?.status === 'finished') {
        this.$notify({ text: 'Այս առաջադրանքն արդեն ավարտված է', type: 'info' })
        return
      }

      if (
        fo?.operator_id &&
        String(fo.operator_id) !== String(this.currentUserId)
      ) {
        this.$notify({
          text: 'Պատվերը զբաղված է այլ օպերատորի կողմից',
          type: 'warning',
        })
        return
      }

      this.selectedOrder = order
      this.isModal = true
    },

    closeModal() {
      this.isModal = false
      this.selectedOrder = {}
    },

    async handleModalConfirm(payload) {
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

      const success = await this.doneFinishedOrder(finalPayload)
      if (success) {
        this.$notify({ text: 'Հաջողությամբ թարմացվեց', type: 'success' })
        this.closeModal()
        await this.fetchOrdersByFactory(this.currentFactoryId)
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
      this.draggingOrder = order
      this.draggingFromColumnId = column.id
    },

    async onDrop(targetColumn) {
      if (!this.draggingOrder) return

      const newStatusValue =
        targetColumn.value === 'null' ? null : targetColumn.value

      await this.updateOrderStatusByDrag(this.draggingOrder, newStatusValue)

      this.draggingOrder = null
      this.draggingFromColumnId = null
    },

    async updateOrderStatusByDrag(order, newStatus) {
      const fo = this.getFactoryOrderForCurrentFactory(order)

      if (fo && fo.status === 'finished') {
        this.$notify({
          text: 'Արդեն ավարտված պատվերի կարգավիճակը չի կարող փոխվել։',
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
          text: 'Պատվերը ընդունված է այլ օպերատորի կողմից, դուք չեք կարող փոխել։',
          duration: 3000,
          position: 'top',
          type: 'warning',
        })
        return
      }

      let cancelDate = null

      if (newStatus === 'date_changed') {
        const dt = new Date()
        dt.setDate(dt.getDate() + 1)
        cancelDate = dt.toISOString().slice(0, 19).replace('T', ' ')
      }

      const payload = {
        id: order.id,
        factory_id: this.currentFactoryId,
        factory_order: {
          status: newStatus,
          canceling: '',
          cancel_date: cancelDate,
          operator_finish_date:
            newStatus === 'finished'
              ? new Date().toISOString().slice(0, 19).replace('T', ' ')
              : null,
        },
      }

      const res = await this.doneFinishedOrder(payload)
      if (res) {
        this.$notify({
          text: 'Կարգավիճակը հաջողությամբ թարմացվեց։',
          duration: 2500,
          position: 'top',
          type: 'success',
        })
        await this.fetchOrdersByFactory(this.currentFactoryId)
      } else {
        this.$notify({
          text: 'Սխալ տեղի ունեցավ կարգավիճակը թարմացնելիս։',
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
