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
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
      >
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Խմբագրել առաջադրանքը
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="closeModal"
          >
            <svg
              class="h-5 w-5"
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
        <div class="space-y-4">
          <select-with-label
            v-model="selectedOption"
            :data-value="status"
            label="Գործողություն"
          />
          <div
            v-if="selectedOption && selectedOption.value === 'canceling'"
            class="my-4"
          >
            <select-with-label
              v-model="additionalOption"
              :data-value="additionalOptions"
              label="Մերժման պատճառ"
            />
          </div>
          <div
            v-if="selectedOption && selectedOption.value === 'finishing'"
            class="my-4"
          >
            <p class="text-gray-700 dark:text-gray-300">
              Ավարտի ամսաթիվ: {{ finishDate }}
            </p>
          </div>
          <div
            v-if="selectedOption && selectedOption.value === 'changeDate'"
            class="my-4"
          >
            <input-with-label-icon
              v-model="changeDate"
              type="date"
              format="dd-mm-yyyy"
              label="Նոր ավարտի ամսաթիվ"
            />
          </div>
          <button
            class="w-full rounded-lg bg-indigo-600 py-2 text-white transition-colors hover:bg-indigo-700"
            @click="doneOrder(selectedOrder.id)"
          >
            Հաստատել
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
import Pagination from '~/components/ui/Pagination.vue'
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
      changeDate: '',
      isModal: false,
      isOpenDetails: false,
      selectedOrder: {},
      selectedOption: null,
      additionalOption: null,
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

      status: [
        { id: 1, name: 'Հաստատել', value: 'confirmation' },
        { id: 2, name: 'Մերժել', value: 'canceling' },
        { id: 3, name: 'Կատարման ժամկետի փոխարինում', value: 'changeDate' },
        { id: 4, name: 'Ավարտել', value: 'finishing' },
      ],
      additionalOptions: [
        { id: 1, name: 'Ոչ հստակ պատվեր', value: 'unclear' },
        { id: 2, name: 'Սխալ տվյալներ', value: 'error' },
        {
          id: 3,
          name: 'Նյութի առկայության բացակայություն',
          value: 'no_material',
        },
      ],
      statusOptions: [
        { id: 'no_status', label: 'Առանց կարգավիճակի', value: 'null' },
        { id: 'confirmed', label: 'Հաստատել', value: 'Հաստատել' },
        { id: 'rejected', label: 'Մերժել', value: 'Մերժել' },
        {
          id: 'changed',
          label: 'Ժամկետի փոփոխություն',
          value: 'Կատարման ժամկետի փոխարինում',
        },
        { id: 'finished', label: 'Ավարտել', value: 'Ավարտել' },
      ],
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
    // Kanban columns
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
          value: 'Հաստাতել',
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
  },
  mounted() {
    const factoryId = this.$auth.user?.factory_id
    const userId = this.$auth.user?.id
    this.currentFactoryId = factoryId
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
    closeModal() {
      this.isModal = false
      this.selectedOption = null
      this.additionalOption = null
      this.changeDate = null
    },
    async doneOrder() {
      if (!this.selectedOption?.name) {
        this.$notify({
          text: 'Խնդրում ենք ընտրել գործողություն։',
          duration: 3000,
          position: 'top',
          type: 'warning',
        })
        return
      }

      const updatedOrder = {
        id: this.selectedOrder.id,
        factory_order: {
          status: this.selectedOption?.name || null,
          canceling: this.additionalOption?.name || null,
          cancel_date: this.changeDate || null,
          operator_finish_date:
            this.selectedOption?.value === 'finishing'
              ? new Date().toISOString().slice(0, 19).replace('T', ' ')
              : null,
        },
        factory_id: this.currentFactoryId,
      }

      const res = await this.doneFinishedOrder(updatedOrder)
      if (res) {
        this.$notify({
          text: 'Առաջադրանքը հաջողությամբ թարմացվել է։',
          duration: 3000,
          position: 'top',
          type: 'success',
        })
        this.closeModal()
        await this.fetchOrdersByFactory(this.currentFactoryId)
      } else {
        this.$notify({
          text: 'Սխալ տեղի ունեցավ առաջադրանքը թարմացնելիս։',
          duration: 3000,
          position: 'top',
          type: 'error',
        })
      }
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
