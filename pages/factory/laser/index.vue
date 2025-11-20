<template>
  <main class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Orders Board -->
    <template v-if="getOrderByFactories && !isModal">
      <div class="container mx-auto px-4 py-10 sm:py-16">
        <!-- Toolbar -->
        <OrdersToolbar
          :search="searchable"
          :status-options="statusOptions"
          :selected-statuses="selectedStatuses"
          @update:search="(v) => (searchable = v)"
          @update:selected-statuses="(v) => (selectedStatuses = v)"
        />

        <!-- Kanban board -->
        <div
          v-if="boardColumns.length"
          class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <div
            v-for="column in boardColumns"
            :key="column.id"
            class="flex flex-col rounded-2xl bg-gray-50/70 p-3 shadow-sm dark:bg-gray-800/60"
            @dragover.prevent
            @drop="onDrop(column)"
          >
            <!-- Column header -->
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                  :class="column.iconBg"
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

            <!-- Cards list -->
            <transition-group
              name="fade-list"
              tag="div"
              class="flex flex-1 flex-col gap-3"
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
              class="mt-2 flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white/60 p-3 text-center text-xs text-gray-400 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-500"
            >
              Քաշեք պատվերներ այստեղ
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
            @page-changed="handlePageChange"
          />
        </div>
      </div>
    </template>

    <!-- Edit Modal -->
    <div
      v-if="isModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
    >
      <div
        class="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800"
      >
        <div class="mb-5 flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            Գործողություն պատվերի վրա
          </h3>
          <button
            @click="closeModal"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
        </div>

        <div class="space-y-5">
          <!-- Գլխավոր գործողությունը -->
          <select-with-label
            v-model="selectedOption"
            :data-value="actionOptions"
            label="Ընտրեք գործողություն"
            placeholder="Ընտրել..."
          />

          <!-- Մերժման պատճառ (միայն canceling-ի դեպքում) -->
          <div
            v-if="selectedOption?.value === 'canceled'"
            class="animate-fade-in"
          >
            <select-with-label
              v-model="additionalOption"
              :data-value="cancelReasons"
              label="Մերժման պատճառ"
              placeholder="Ընտրել պատճառ..."
            />
          </div>

          <!-- Նոր ամսաթիվ (միայն date_changed-ի դեպքում) -->
          <div
            v-if="selectedOption?.value === 'date_changed'"
            class="animate-fade-in"
          >
            <input-with-label-icon
              v-model="changeDate"
              type="date"
              label="Նոր կատարման ամսաթիվ"
              :min="tomorrowDate"
            />
          </div>

          <!-- Ավարտի ամսաթիվ (միայն finishing-ի դեպքում) -->
          <div
            v-if="selectedOption?.value === 'finished'"
            class="p-4 rounded-lg bg-green-50 dark:bg-green-900/20"
          >
            <p class="text-sm text-green-800 dark:text-green-300">
              <strong>Ավարտի ամսաթիվը կլինի:</strong>
              <span class="font-semibold">{{ todayFormatted }}</span>
            </p>
          </div>

          <!-- Հաստատել կոճակ -->
          <button
            @click="doneOrder"
            :disabled="!selectedOption"
            class="w-full py-3 px-4 rounded-lg font-medium text-white transition-all"
            :class="
              selectedOption
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            "
          >
            {{
              selectedOption
                ? 'Հաստատել գործողությունը'
                : 'Ընտրեք գործողություն'
            }}
          </button>
        </div>
      </div>
    </div>

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
          <OrderDetailsPanel
            :details="details"
            :dxf-url="dxfUrl"
            @view-file="viewFile"
            @download-file="downloadFile"
          />
        </div>
      </div>
    </template>

    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SelectWithLabel from '@/components/form/SelectWithLabel.vue'
import InputWithLabelIcon from '@/components/form/InputWithLabelIcon.vue'
import OrdersToolbar from '@/components/factory/OrdersToolbar.vue'
import OrderCard from '@/components/factory/OrderCard.vue'
import Pagination from '@/components/ui/Pagination.vue'
import OrderDetailsPanel from '@/components/factory/OrderDetailsPanel.vue'

export default {
  components: {
    OrderDetailsPanel,
    InputWithLabelIcon,
    SelectWithLabel,
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

      // drag & drop
      draggingOrder: null,
      draggingFromColumnId: null,

      // filters & pagination
      selectedStatuses: [],
      currentPage: 1,
      perPage: 12,
      currentFactoryId: null,
      currentUserId: null,

      status: [],
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
      return this.getOrderByFactories?.orders || []
    },
    // filter by status
    filteredByStatus() {
      if (!this.selectedStatuses.length) return this.allOrders

      return this.allOrders.filter((order) => {
        const fo = this.getFactoryOrderForCurrentFactory(order)
        // եթե ընդհանրապես չի վերաբերվում գործարանին՝ skip
        if (!fo) return false

        const status = fo.status || null
        const statusKey = status ?? 'null'
        return this.selectedStatuses.includes(statusKey)
      })
    },

    // filter by search
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
    // local pagination
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredBySearch.slice(start, start + this.perPage)
    },
    paginationMeta() {
      const total = this.filteredBySearch.length
      const lastPage = Math.max(Math.ceil(total / this.perPage), 1)

      return {
        current_page: this.currentPage,
        per_page: this.perPage,
        total,
        last_page: lastPage,
      }
    },
    boardColumns() {
      const columnsConfig = [
        {
          id: 'no_status',
          label: 'Առանց կարգավիճակի',
          value: 'null',
          icon: '•',
          iconBg: 'bg-gray-400',
        },
        {
          id: 'confirmed',
          label: 'Հաստատել',
          value: 'Հաստատել',
          icon: '✓',
          iconBg: 'bg-green-500',
        },
        {
          id: 'changed',
          label: 'Ժամկետի փոփոխություն',
          value: 'Կատարման ժամկետի փոխարինում',
          icon: '⟳',
          iconBg: 'bg-orange-500',
        },
        {
          id: 'rejected',
          label: 'Մերժել',
          value: 'Մերժել',
          icon: '✕',
          iconBg: 'bg-red-500',
        },
        {
          id: 'finished',
          label: 'Ավարտել',
          value: 'Ավարտել',
          icon: '✔',
          iconBg: 'bg-եմերալդ-500',
        },
      ]

      return columnsConfig.map((col) => {
        const orders = this.paginatedOrders.filter((order) => {
          const fo = this.getFactoryOrderForCurrentFactory(order)
          if (!fo) return false // ընդհանրապես չի մտնում այս գործարանի մեջ

          const status = fo.status || null
          const statusKey = status ?? 'null'
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

      this.actionOptions = actionsRes.data

      this.statusOptions = filtersRes.data
    } catch (err) {
      this.$notify({
        text: 'Չհաջողվեց բեռնել գործողությունները',
        type: 'error',
      })
    }
    const factoryId = this.$auth.user?.factory_id
    const userId = this.$auth.user?.id
    this.currentFactoryId = this.$auth.user?.factory_id
    this.currentUserId = this.$auth.user?.id

    if (this.currentFactoryId) {
      await this.fetchOrdersByFactory(this.currentFactoryId)
    }
    this.currentUserId = userId

    if (factoryId) {
      this.fetchOrdersByFactory(factoryId)
    }
  },
  methods: {
    ...mapActions('factory', [
      'fetchOrdersByFactory',
      'doneFinishedOrder',
      'downloadUploadedFile',
    ]),
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

      if (fo && fo.status === 'Ավարտել') {
        this.$notify({
          text: 'Այս առաջադրանքը արդեն ավարտված է, հնարավոր չէ փոխել կարգավիճակը։',
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
          text: 'Պատվերը ընդունված է այլ օպերատորի կողմից, դուք չեք կարող փոփոխել։',
          duration: 3000,
          position: 'top',
          type: 'warning',
        })
        return
      }

      this.isModal = true
      this.selectedOrder = {
        ...order,
        factory_order: fo
          ? {
              ...fo,
              cancel_date: fo.cancel_date || null,
              canceling: fo.canceling || '',
              finish_date: fo.finish_date || null,
            }
          : { status: '', cancel_date: null, canceling: '', finish_date: null },
      }
    },
    async doneOrder() {
      if (!this.selectedOption) return

      const payload = {
        id: this.selectedOrder.id,
        factory_id: this.currentFactoryId,
        factory_order: {
          status: this.selectedOption.value, // confirmed | canceled | date_changed | finished

          // ԿԱՐԵՎՈՐ — միշտ ուղարկիր canceling, նույնիսկ դատարկ տեքստ
          canceling: this.additionalOption?.value || '', // ← դատարկ string, ոչ null

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
    closeModal() {
      this.isModal = false
      this.selectedOption = null
      this.additionalOption = null
      this.changeDate = null
    },
    toggleDetails(order) {
      this.isOpenDetails = !this.isOpenDetails
      this.details = order
    },

    // drag & drop
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

      if (fo && fo.status === 'Ավարտել') {
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
      if (newStatus === 'Կատարման ժամկետի փոխարինում') {
        const dt = new Date()
        dt.setDate(dt.getDate() + 1)
        cancelDate = dt.toISOString().slice(0, 19).replace('T', ' ')
      }

      const payload = {
        id: order.id,
        factory_id: this.currentFactoryId,
        factory_order: {
          status: newStatus,
          canceling: null,
          cancel_date: cancelDate,
          operator_finish_date:
            newStatus === 'Ավարտել'
              ? new Date().toISOString().slice(0, 19).replace('T', ' ')
              : null,
        },
      }

      const res = await this.doneFinishedOrder(payload)
      if (res) {
        this.$notify({
          text: 'Կարգավիճակը հաջողությամբ թարմացվել է։',
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
