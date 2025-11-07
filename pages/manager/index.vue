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
          <h5 class="mb-1 font-montserrat font-bold text-gray-900">Նյութեր</h5>
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
            <span class="font-semibold">{{ workers.length }}</span>
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

    <!-- NOTIFICATIONS -->
    <notifications />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DeviceStatsChart from '~/components/device/DeviceStatsChart.vue'

export default {
  name: 'ManagerPage',
  components: {
    DeviceStatsChart,
  },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
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
    ...mapGetters('workers', ['getWorkers']),
    allOrders() {
      return this.orders || []
    },
    materials() {
      return this.getMaterials || []
    },
    workers() {
      return this.getWorkers || []
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
    this.fetchWorkers()
  },
  methods: {
    ...mapActions('orders', ['fetchOrders', 'orderDelete']),
    ...mapActions('materials', ['fetchMaterials']),
    ...mapActions('workers', ['fetchWorkers']),
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
