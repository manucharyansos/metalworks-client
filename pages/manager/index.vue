<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- TOP STATS -->
    <div
      v-if="!isOpenDeleteModal && !openEditModal"
      class="grid gap-4 mt-12 sm:grid-cols-2 lg:grid-cols-3"
    >
      <!-- Materials -->
      <div class="flex items-center gap-4 p-4 rounded-xl shadow bg-white">
        <div
          class="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shrink-0"
          aria-hidden="true"
        >
          <!-- Materials SVG -->
          <svg viewBox="0 0 24 24" class="w-9 h-9" fill="currentColor">
            <rect x="3" y="10" width="14" height="10" rx="2"></rect>
            <rect x="7" y="4" width="14" height="10" rx="2" opacity=".7"></rect>
          </svg>
        </div>
        <div class="min-w-0">
          <h5 class="mb-1 italic font-sans font-bold text-gray-900">Նյութեր</h5>
          <p class="text-gray-600 italic">
            Քանակ․ <span class="font-semibold">{{ materials.length }}</span>
          </p>
        </div>
      </div>

      <!-- Users -->
      <div class="flex items-center gap-4 p-4 rounded-xl shadow bg-white">
        <div
          class="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shrink-0"
          aria-hidden="true"
        >
          <!-- Users SVG -->
          <svg viewBox="0 0 24 24" class="w-9 h-9" fill="currentColor">
            <circle cx="9" cy="8" r="3"></circle>
            <path d="M2 20a6 6 0 0 1 12 0H2z"></path>
            <circle cx="18" cy="9.5" r="2.5" opacity=".8"></circle>
            <path d="M13 20a4.5 4.5 0 0 1 9 0h-9z" opacity=".7"></path>
          </svg>
        </div>
        <div class="min-w-0">
          <h5 class="mb-1 italic font-sans font-bold text-gray-900">
            Գրանցված օգտատերեր
          </h5>
          <p class="text-gray-600 italic">
            Օգտատերեր․
            <span class="font-semibold">{{ users.length }}</span>
          </p>
        </div>
      </div>

      <!-- Orders -->
      <div class="flex items-center gap-4 p-4 rounded-xl shadow bg-white">
        <div
          class="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 text-white shrink-0"
          aria-hidden="true"
        >
          <!-- Orders SVG -->
          <svg viewBox="0 0 24 24" class="w-9 h-9" fill="currentColor">
            <rect x="6" y="3" width="12" height="18" rx="2"></rect>
            <rect
              x="9"
              y="2"
              width="6"
              height="4"
              rx="1"
              class="opacity-80"
            ></rect>
            <rect
              x="8"
              y="9"
              width="8"
              height="1.8"
              rx=".9"
              class="opacity-90"
            ></rect>
            <rect
              x="8"
              y="13"
              width="8"
              height="1.8"
              rx=".9"
              class="opacity-90"
            ></rect>
            <rect
              x="8"
              y="17"
              width="6"
              height="1.8"
              rx=".9"
              class="opacity-90"
            ></rect>
          </svg>
        </div>
        <div class="min-w-0">
          <h5 class="mb-1 italic font-sans font-bold text-gray-900">
            Պատվերներ
          </h5>
          <p class="text-gray-600 italic">
            Պատվերների քանակ․
            <span class="font-semibold">{{ allOrders.length }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Visitors / Devices chart -->
    <DeviceStatsChart
      v-if="!isOpenDeleteModal && !openEditModal"
      class="mt-8"
    />

    <!-- ORDERS TABLE -->
    <div
      v-if="tableRows.length && !isOpenDeleteModal && !openEditModal"
      class="relative overflow-x-auto overflow-y-auto max-h-screen shadow-md sm:rounded-lg p-4 sm:p-6 lg:p-8 mt-8 bg-white"
    >
      <div class="flex items-center justify-between mb-4 gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Բոլոր պատվերները</h3>
        <input
          v-model="searchable"
          type="search"
          placeholder="Փնտրել պատվեր…"
          class="w-60 max-w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <table class="w-full text-sm text-left text-gray-700">
        <thead
          class="sticky top-0 z-10 text-xs uppercase text-gray-700 bg-gray-100"
        >
          <tr>
            <th class="px-3 py-3">Id</th>
            <th class="px-3 py-3">Start Date</th>
            <th class="px-3 py-3">Finish Date</th>
            <th class="px-3 py-3">Order #</th>
            <th class="px-3 py-3">Prefix code</th>
            <th class="px-3 py-3">Status</th>
            <th class="px-3 py-3">Name</th>
            <th class="px-3 py-3">Quantity</th>
            <th class="px-3 py-3">Storage link</th>
            <th class="px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in tableRows"
            :key="row.id"
            class="border-b last:border-0"
          >
            <th scope="row" class="px-3 py-3 font-medium text-gray-900">
              {{ row.id }}
            </th>
            <td class="px-3 py-3">{{ row.created_at }}</td>
            <td class="px-3 py-3">{{ row.finish_date }}</td>
            <td class="px-3 py-3">{{ row.order_number }}</td>
            <td class="px-3 py-3">{{ row.prefix_code }}</td>
            <td class="px-3 py-3">{{ row.status }}</td>
            <td class="px-3 py-3">{{ row.name }}</td>
            <td class="px-3 py-3">{{ row.quantity }}</td>
            <td class="px-3 py-3">
              <a
                v-if="row.store_link_url"
                class="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
                :href="row.store_link_url"
                target="_blank"
                rel="noopener"
                >Link</a
              >
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="px-3 py-3">
              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg border border-indigo-500 text-indigo-600 px-3 py-1.5 hover:bg-indigo-500 hover:text-white transition"
                  @click="editOrder(row._raw)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg border border-red-500 text-red-600 px-3 py-1.5 hover:bg-red-600 hover:text-white transition"
                  @click="openDeleteModal(row._raw)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- DELETE MODAL -->
    <div
      v-if="isOpenDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      @click.self="closeDeleteModal"
    >
      <div class="w-full max-w-md rounded-xl shadow-xl bg-white">
        <div class="p-4 md:p-5 text-center">
          <button
            type="button"
            class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            @click="closeDeleteModal"
            aria-label="Close"
          >
            ✕
          </button>

          <svg
            class="mx-auto mb-4 text-gray-400 w-12 h-12"
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" />
            <path d="M12 7v5" stroke="currentColor" stroke-width="2" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>

          <h3 class="mb-5 text-lg font-medium text-gray-800">
            Վստա՞հ եք, որ ուզում եք ջնջել պատվերը։
          </h3>

          <div class="flex items-center justify-center gap-2">
            <button
              type="button"
              class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
              @click="deleteSelectedOrder"
            >
              Այո, ջնջել
            </button>
            <button
              type="button"
              class="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
              @click="closeDeleteModal"
            >
              Չեղարկել
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <edit-modal
      :data="showOrder"
      :is-open="openEditModal"
      :other-files="showOrder && showOrder.files"
      class="py-20 absolute top-10"
      @closeModal="closeEditeModal"
      @openFile="openFile"
    >
      <template #orderId>
        <input-with-label-icon
          v-model="showOrder.id"
          label="Id"
          type="text"
          label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          :disabled="true"
        />
      </template>

      <template #storageLink>
        <div>
          <a
            class="border-b border-gray-300 pb-1 text-indigo-600 hover:text-indigo-700"
            :href="
              showOrder && showOrder.store_link ? showOrder.store_link.url : ''
            "
            target="_blank"
            rel="noopener"
            >Store link</a
          >
        </div>
      </template>

      <template #orderDate>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input-with-label-icon
            :value="showOrder && showOrder.created_at"
            :disabled="true"
            label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            label="Start date"
          />
          <input-with-label-icon
            :value="
              showOrder && showOrder.dates ? showOrder.dates.finish_date : ''
            "
            label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            :disabled="true"
            label="Finish date"
          />
        </div>
      </template>

      <template #details>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input-with-label-icon
            v-model="showOrder.name"
            type="text"
            label="Order name"
            label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            :disabled="true"
          />
          <input-with-label-icon
            v-model="showOrder.quantity"
            label="Order quantity"
            label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            :disabled="true"
          />
        </div>
        <textarea-with-label
          v-model="showOrder.description"
          label="Order description"
          label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          classes="block my-2 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          :disabled="true"
        />
      </template>

      <template #number>
        <input-with-label-icon
          v-model="showOrder.order_number.number"
          label="Order number"
          label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          :disabled="true"
        />
      </template>

      <template #prefixCode>
        <input-with-label-icon
          v-model="showOrder.prefix_code.code"
          label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          :disabled="true"
          label="code"
        />
      </template>

      <template #orderStatus>
        <input-with-label-icon
          v-model="showOrder.status"
          label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          :disabled="true"
        />
      </template>

      <template v-if="showOrder && showOrder.factories" #factories>
        <div
          v-for="factory in showOrder.factories"
          :key="factory.id"
          class="flex flex-col items-center justify-center"
        >
          <p>Factory: {{ factory.name }}</p>
        </div>
      </template>

      <template
        v-if="showOrder && showOrder.factory_order"
        #orderByFactoryStatus
      >
        <div
          v-for="orderStatus in showOrder.factory_order"
          :key="orderStatus.id"
          class="flex flex-col items-center justify-center"
        >
          <p>Status by factory: {{ orderStatus.status }}</p>
        </div>
      </template>
    </edit-modal>

    <!-- NOTIFICATIONS -->
    <notifications />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
import EditModal from '~/components/pages/manager/EditModal.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'
import DeviceStatsChart from '~/components/device/DeviceStatsChart.vue'

export default {
  name: 'ManagerPage',
  components: {
    DeviceStatsChart,
    TextareaWithLabel,
    EditModal,
    InputWithLabelIcon,
  },
  layout: 'ManagerLayout',
  middleware: ['manager', 'roleRedirect'],
  data() {
    return {
      searchable: '',
      isDetails: false,
      isOpenDeleteModal: false,
      openEditModal: false,
      selectedOrder: null,
      showOrder: null,
    }
  },
  computed: {
    ...mapGetters('orders', ['orders']),
    ...mapGetters('materials', ['getMaterials']),
    ...mapGetters('users', ['getUsers']),
    allOrders() {
      return this.orders || []
    },
    materials() {
      return this.getMaterials || []
    },
    users() {
      return this.getUsers || []
    },
    searchFilter() {
      const q = this.searchable.trim().toLowerCase()
      if (!q) return this.allOrders
      return this.allOrders.filter((order) => {
        const on =
          (order && order.order_number && order.order_number.number) || ''
        const nm =
          (order && order.name) ||
          (order &&
            order.details &&
            order.details[0] &&
            order.details[0].name) ||
          ''
        const pc = (order && order.prefix_code && order.prefix_code.code) || ''
        return (
          String(on).toLowerCase().includes(q) ||
          String(nm).toLowerCase().includes(q) ||
          String(pc).toLowerCase().includes(q)
        )
      })
    },
    tableRows() {
      // normalize to avoid ?. in templates
      return this.searchFilter.map((o) => ({
        _raw: o,
        id: o && o.id ? o.id : '—',
        created_at: (o && o.created_at) || '—',
        finish_date: (o && o.dates && o.dates.finish_date) || '—',
        order_number: (o && o.order_number && o.order_number.number) || '—',
        prefix_code: (o && o.prefix_code && o.prefix_code.code) || '—',
        status: (o && o.status) || '—',
        name:
          (o && o.name) ||
          (o && o.details && o.details[0] && o.details[0].name) ||
          '—',
        quantity: (o && o.quantity) || '—',
        store_link_url: (o && o.store_link && o.store_link.url) || '',
      }))
    },
  },
  created() {
    this.fetchMaterials()
    this.fetchOrders()
    this.fetchUsers()
  },
  methods: {
    ...mapActions('orders', ['fetchOrders', 'orderDelete']),
    ...mapActions('materials', ['fetchMaterials']),
    ...mapActions('users', ['fetchUsers']),
    editOrder(order) {
      this.openEditModal = true
      this.showOrder = order
    },
    openDeleteModal(order) {
      if (order && order.id) {
        this.selectedOrder = order
        this.isOpenDeleteModal = true
      }
    },
    closeDeleteModal() {
      this.isOpenDeleteModal = false
    },
    closeEditeModal() {
      this.openEditModal = false
    },
    async deleteSelectedOrder() {
      if (!this.selectedOrder || !this.selectedOrder.id) return
      const id = this.selectedOrder.id
      try {
        const res = await this.orderDelete(id)
        if (res) {
          this.$notify({
            text: `Order deleted successfully`,
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'success',
          })
          await this.fetchOrders()
          this.isOpenDeleteModal = false
        }
      } catch (err) {
        const error = this.errorMessage || { message: 'An error occurred' }
        this.$notify({
          text: error.message,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
      }
    },
    openFile() {
      // demo
      const fileUrl = '/uploads/example1.step'
      fetch(fileUrl)
        .then((r) => r.blob())
        .then((b) => {
          const url = URL.createObjectURL(b)
          window.open(url)
        })
    },
  },
}
</script>

<style scoped>
/* extra safety on sticky header shadow when scrolling */
thead.sticky {
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.04);
}
</style>
