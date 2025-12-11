<template>
  <main
    class="min-h-screen bg-gray-50 dark:bg-gray-950 py-6 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Toolbar + Գործարանի ընտրություն -->
      <orders-toolbar
        :total="allOrders.length"
        :filtered="searchFilter.length"
        :pagination="pagination"
        :selected-factory="selectedFactory"
        :operators="operatorOptions"
        @update:filters="updateFilters"
        @update:factory="selectedFactory = $event"
        @change-page="changePage"
      />

      <!-- Քարտեր -->
      <div
        v-if="searchFilter.length"
        class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 animate-fade-in"
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
        <p class="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
          {{
            selectedFactory
              ? `«${selectedFactory.name}» գործարանում պատվերներ չեն գտնվել`
              : 'Պատվերներ չեն գտնվել'
          }}
        </p>
        <p
          class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md"
        >
          Փորձեք փոխել ֆիլտրերը կամ ընտրել այլ գործարան
        </p>
      </div>

      <!-- Modal -->
      <transition name="fade">
        <div
          v-if="selectedOrder"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          @click.self="closeEditModal"
        >
          <transition name="slide-in-center">
            <div
              v-if="selectedOrder"
              class="h-full w-full max-w-5xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden"
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
  name: 'AdminOrdersPage',
  components: { OrderCard, OrdersToolbar, OrderDetail },
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },

  data() {
    return {
      selectedOrder: null,
      selectedFactory: null,
      filters: {
        search: '',
        overallStatus: null,
        operatorId: null,
        timeRange: null,
        factoryStatus: null,
      },
    }
  },

  computed: {
    ...mapGetters('orders', ['orders', 'getPagination']),
    ...mapGetters('factory', ['getFactory']),

    allOrders() {
      return this.orders || []
    },

    pagination() {
      return this.getPagination
    },

    operatorOptions() {
      const opsMap = new Map()

      this.allOrders.forEach((order) => {
        ;(order.factory_orders || []).forEach((fo) => {
          if (!fo.operator_id || !fo.operator) return

          if (
            this.selectedFactory &&
            fo.factory_id !== this.selectedFactory.id
          ) {
            return
          }

          if (!opsMap.has(fo.operator_id)) {
            opsMap.set(fo.operator_id, {
              id: fo.operator_id,
              name: fo.operator.name,
              factory_id: fo.factory_id,
              factory_name: fo.factory?.name || '',
            })
          }
        })
      })

      return Array.from(opsMap.values())
    },

    searchFilter() {
      let list = [...this.allOrders]

      if (this.selectedFactory) {
        list = list.filter((order) =>
          order.factory_orders?.some(
            (fo) => fo.factory_id === this.selectedFactory.id
          )
        )
      }

      if (this.filters.search?.trim()) {
        const term = this.filters.search.toLowerCase().trim()
        list = list.filter((order) => {
          return (
            (order.order_number?.number || '').toLowerCase().includes(term) ||
            (order.name || '').toLowerCase().includes(term) ||
            (order.description || '').toLowerCase().includes(term) ||
            (order.prefix_code?.code || '').toLowerCase().includes(term)
          )
        })
      }

      if (this.filters.timeRange) {
        const now = new Date()
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        list = list.filter((order) => {
          const finishDate = order.dates?.finish_date
            ? new Date(order.dates.finish_date)
            : null

          switch (this.filters.timeRange) {
            case 'no_deadline':
              return !finishDate
            case 'overdue':
              return (
                finishDate && finishDate < now && !this.isOrderCompleted(order)
              )
            case 'today':
              return (
                finishDate &&
                finishDate.toDateString() === new Date().toDateString()
              )
            case 'tomorrow':
              return (
                finishDate &&
                finishDate.getTime() >= tomorrow.setHours(0, 0, 0, 0) &&
                finishDate.getTime() < tomorrow.setHours(24, 0, 0, 0)
              )
            case 'this_week': {
              const weekEnd = new Date(today)
              weekEnd.setDate(weekEnd.getDate() + 7)
              return finishDate && finishDate >= now && finishDate <= weekEnd
            }
            default:
              return true
          }
        })
      }

      if (this.filters.factoryStatus) {
        list = list.filter((order) =>
          order.factory_orders?.some(
            (fo) => fo.status === this.filters.factoryStatus
          )
        )
      }

      if (this.filters.operatorId) {
        const targetId = Number(this.filters.operatorId)
        list = list.filter((order) =>
          order.factory_orders?.some((fo) => fo.operator_id === targetId)
        )
      }

      return list
    },
  },

  async created() {
    await this.fetchFactory()
    await this.fetchOrders({ page: 1, perPage: 30 })
  },

  methods: {
    ...mapActions('orders', ['fetchOrders']),
    ...mapActions('factory', ['fetchFactory']),

    isOrderCompleted(order) {
      const fos = order.factory_orders || []
      if (fos.length === 0) return false

      return fos.every((fo) => {
        const s = (fo.status || '').toString().toLowerCase()

        const isCanceled = ['canceled', 'չեղարկ', 'merjel', 'отмен'].some((w) =>
          s.includes(w)
        )
        if (isCanceled) return true

        const isDoneOrConfirmed = [
          'completed',
          'confirmed',
          'done',
          'готово',
          'завершено',
          'ավարտել',
          'hastatel',
        ].some((w) => s.includes(w))

        return isDoneOrConfirmed && !!fo.admin_confirmation_date
      })
    },

    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
    },

    async handleSaved() {
      await this.fetchOrders({ page: this.pagination?.current_page || 1 })
      this.closeEditModal()
    },

    editOrder(order) {
      this.selectedOrder = { ...order }
    },

    closeEditModal() {
      this.selectedOrder = null
    },

    changePage(page) {
      this.fetchOrders({ page, perPage: this.pagination?.per_page || 30 })
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
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-in-center-enter,
.slide-in-center-leave-to {
  transform: translateX(100%);
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
