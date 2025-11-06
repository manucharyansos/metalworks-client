<template>
  <div class="min-h-screen w-full bg-gray-50 dark:bg-gray-950">
    <div
      v-if="$can('orders.view')"
      class="container mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Իմ պատվերները
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Փնտրեք, դիտեք և կառավարեք ձեր ստեղծած պատվերները
          </p>
        </div>
      </div>

      <div class="mt-6">
        <OrdersToolbar
          :search="filters.search"
          :per-page="pagination.per_page"
          @update:search="onSetSearch"
          @update:per-page="onSetPerPage"
        />
      </div>
      <div class="mt-6">
        <div
          v-if="error"
          class="p-4 rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200"
        >
          {{ error }}
        </div>

        <!-- skeletons -->
        <div
          v-if="loading"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <div
            v-for="i in 8"
            :key="i"
            class="animate-pulse bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5"
          >
            <div
              class="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-3"
            ></div>
            <div
              class="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-2"
            ></div>
            <div class="h-20 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
            <div class="flex justify-between">
              <div class="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div class="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>

        <!-- empty -->
        <div
          v-else-if="!orders || !orders.length"
          class="rounded-2xl bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center"
        >
          <div
            class="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 grid place-items-center mb-3"
          >
            <svg
              class="w-6 h-6 opacity-60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 7l9 4 9-4-9-4-9 4ZM3 7v10l9 4 9-4V7"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-1">Պատվերներ չկան</h3>
          <p class="text-sm text-gray-500">
            Սկսեք նոր պատվերից կամ փոխեք որոնման դաշտը
          </p>
        </div>

        <!-- grid -->
        <transition-group
          name="card"
          tag="div"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <OrderCard
            v-for="o in orders"
            :key="o.id"
            :order="o"
            @open="openOrder"
          />
        </transition-group>
      </div>

      <div class="mt-6">
        <Pagination :meta="pagination" @change="onGoPage" />
      </div>
    </div>
    <div
      v-else
      class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4"
    >
      <PermissionDenied />
    </div>

    <!-- DETAILS MODAL -->
    <OrderDetailsModal
      :visible="isDetailsOpen || $can('orders.view')"
      :order="selectedOrder"
      @close="isDetailsOpen = false"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import OrdersToolbar from '~/components/engineer/OrdersToolbar.vue'
import OrderCard from '~/components/engineer/OrderCard.vue'
import Pagination from '~/components/ui/Pagination.vue'
import OrderDetailsModal from '~/components/engineer/OrderDetailsModal.vue'
import DxfViewerModal from '~/components/engineer/DxfViewerModal.vue'
import PermissionDenied from '@/components/modals/permission/PermissionDenied.vue'

export default {
  components: {
    PermissionDenied,
    // eslint-disable-next-line vue/no-unused-components
    DxfViewerModal,
    OrdersToolbar,
    OrderCard,
    Pagination,
    OrderDetailsModal,
  },
  layout: 'engineer',
  middleware: ['role-guard'],
  meta: { role: 'engineer' },
  data: () => ({
    isDetailsOpen: false,
    selectedOrder: null,
  }),
  computed: {
    ...mapGetters('engineer', [
      'getOrders',
      'getPagination',
      'getFilters',
      'isLoading',
      'getError',
    ]),
    orders() {
      return this.getOrders
    },
    pagination() {
      return this.getPagination
    },
    filters() {
      return this.getFilters
    },
    loading() {
      return this.isLoading
    },
    error() {
      return this.getError
    },
  },
  created() {
    this.fetchOrders().catch(() => {
      this.$notify?.({ type: 'error', text: 'Չհաջողվեց բեռնել պատվերները' })
    })
  },
  methods: {
    ...mapActions('engineer', [
      'fetchOrders',
      'setSearch',
      'setPerPage',
      'goPage',
    ]),
    onSetSearch(q) {
      this.setSearch(q)
    },
    onSetPerPage(n) {
      this.setPerPage(n)
    },
    onGoPage(p) {
      this.goPage(p)
    },
    openOrder(order) {
      this.selectedOrder = order
      this.isDetailsOpen = true
    },
  },
}
</script>

<style>
.card-enter-active,
.card-leave-active {
  transition: all 0.18s ease;
}
.card-enter,
.card-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
