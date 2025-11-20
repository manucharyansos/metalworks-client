<template>
  <main
    class="min-h-screen bg-gray-50 dark:bg-gray-950 py-6 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Վերեւի Toolbar -->
      <orders-toolbar
        :total="allOrders.length"
        :filtered="searchFilter.length"
        :search-term="searchable"
        :pagination="pagination"
        @update:search="(val) => (searchable = val)"
        @change-page="changePage"
      />

      <!-- Քարտերի ցանց / Բովանդակություն -->
      <div
        v-if="searchFilter && searchFilter.length"
        class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
      >
        <order-card
          v-for="order in searchFilter"
          :key="order.id"
          :order="order"
          @edit="editOrder"
        />
      </div>

      <!-- Դատարկ վիճակ -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-dashed border-gray-300 dark:border-gray-700"
      >
        <p
          class="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200 mb-2"
        >
          Պատվերներ չեն գտնվել
        </p>
        <p
          class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center max-w-md"
        >
          Փորձեք փոխել որոնման արտահայտությունը կամ անցնել այլ էջ։
        </p>
      </div>

      <!-- Modal -->
      <transition name="fade">
        <div
          v-if="selectedOrder"
          class="fixed inset-0 z-50 flex justify-center bg-black/40 backdrop-blur-sm"
          @click.self="closeEditModal"
        >
          <transition name="slide-in-center">
            <div
              v-if="selectedOrder"
              class="w-full sm:w-[520px] lg:w-[720px] max-w-full h-full bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col"
            >
              <order-detail
                :order="selectedOrder"
                @close="closeEditModal"
                @saved="handleSaved"
              />
            </div>
          </transition>
        </div>
      </transition>
    </div>
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import OrderCard from '~/components/admin/orders/OrderCard.vue'
import OrdersToolbar from '~/components/admin/orders/OrdersToolbar.vue'
import OrderDetail from '@/components/modals/admin/OrderDetail.vue'

export default {
  name: 'AdminPage',
  components: {
    OrderDetail,
    OrderCard,
    OrdersToolbar,
  },
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
  data() {
    return {
      searchable: '',
      selectedOrder: null,
    }
  },
  computed: {
    ...mapGetters('orders', ['orders', 'getPagination']),
    allOrders() {
      return this.orders || []
    },
    pagination() {
      return this.getPagination
    },
    searchFilter() {
      const searchTerm = this.searchable.trim().toLowerCase()
      if (searchTerm === '') {
        return this.allOrders
      }

      return this.allOrders.filter((order) => {
        const orderNumber =
          order.order_number && typeof order.order_number.number === 'string'
            ? order.order_number.number.toLowerCase()
            : ''
        const name =
          order.name && typeof order.name === 'string'
            ? order.name.toLowerCase()
            : ''
        const description =
          order.description && typeof order.description === 'string'
            ? order.description.toLowerCase()
            : ''
        const prefixCode =
          order.prefix_code && typeof order.prefix_code.code === 'string'
            ? order.prefix_code.code.toLowerCase()
            : ''

        return (
          orderNumber.includes(searchTerm) ||
          description.includes(searchTerm) ||
          name.includes(searchTerm) ||
          prefixCode.includes(searchTerm)
        )
      })
    },
  },
  created() {
    this.fetchOrders()
  },
  methods: {
    ...mapActions('orders', ['fetchOrders']),

    // ✅ Այստեղ այլևս չենք mutat անում Vuex state–ը
    async handleSaved(updatedOrder) {
      // վերաբեռնում ենք ներկայիս էջը, որ state–ը թարմանա mutation–ներով
      await this.fetchOrders({
        page: this.pagination?.current_page || 1,
        perPage: this.pagination?.per_page || 10,
      })

      this.closeEditModal()
    },

    editOrder(order) {
      this.selectedOrder = { ...order }
    },
    closeEditModal() {
      this.selectedOrder = null
    },
    changePage(page) {
      if (!this.pagination) return
      if (page < 1 || page > this.pagination.last_page) return

      this.fetchOrders({
        page,
        perPage: this.pagination.per_page || 10,
      })
      this.closeEditModal()
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.slide-in-center-enter-active,
.slide-in-center-leave-active {
  transition: transform 0.3s ease;
}
.slide-in-center-enter {
  transform: translateX(100%);
}
.slide-in-center-leave-to {
  transform: translateX(100%);
}
</style>
