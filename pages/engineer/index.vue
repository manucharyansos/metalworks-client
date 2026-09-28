<template>
  <div class="min-h-screen w-full bg-gray-50 dark:bg-gray-950">
    <div v-if="$can('orders.view')" class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ t.title }}</h1>
          <InfoTooltip>{{ t.help }}</InfoTooltip>
        </div>
        <nuxt-link v-if="$can('orders.create')" :to="localePath('/engineer/orders/create')" class="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950">+ {{ t.newOrder }}</nuxt-link>
      </div>

      <div class="mt-6"><OrdersToolbar :search="filters.search" :per-page="pagination.per_page" @update:search="onSetSearch" @update:per-page="onSetPerPage" /></div>

      <div class="mt-6">
        <div v-if="error" class="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-200">{{ error }}</div>

        <div v-if="loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div v-for="i in 8" :key="i" class="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div class="mb-3 h-4 w-24 rounded bg-gray-200 dark:bg-gray-800"></div><div class="mb-2 h-5 w-40 rounded bg-gray-200 dark:bg-gray-800"></div><div class="mb-4 h-20 rounded bg-gray-200 dark:bg-gray-800"></div><div class="flex justify-between"><div class="h-8 w-24 rounded bg-gray-200 dark:bg-gray-800"></div><div class="h-8 w-20 rounded bg-gray-200 dark:bg-gray-800"></div></div>
          </div>
        </div>

        <div v-else-if="!orders || !orders.length" class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          <div class="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gray-100 dark:bg-gray-800"><svg class="h-6 w-6 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7l9 4 9-4-9-4-9 4ZM3 7v10l9 4 9-4V7" /></svg></div>
          <h3 class="mb-1 text-lg font-semibold">{{ t.emptyTitle }}</h3><p class="text-sm text-gray-500">{{ t.emptyText }}</p>
        </div>

        <transition-group name="card" tag="div" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <OrderCard v-for="o in orders" :key="o.id" :order="o" @open="openOrder" />
        </transition-group>
      </div>

      <div class="mt-6"><Pagination :meta="pagination" @change="onGoPage" /></div>
    </div>
    <div v-else class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4"><PermissionDenied /></div>

    <OrderDetailsModal :visible="isDetailsOpen && $can('orders.view')" :order="selectedOrder" @close="isDetailsOpen = false" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import OrdersToolbar from '~/components/engineer/OrdersToolbar.vue'
import OrderCard from '~/components/engineer/OrderCard.vue'
import Pagination from '~/components/ui/Pagination.vue'
import OrderDetailsModal from '~/components/engineer/OrderDetailsModal.vue'
import PermissionDenied from '@/components/modals/permission/PermissionDenied.vue'

const COPY = {
  hy: { title: 'Իմ պատվերները', help: 'Փնտրեք, դիտեք և կառավարեք ձեր ստեղծած պատվերները։', newOrder: 'Նոր պատվեր', emptyTitle: 'Պատվերներ չկան', emptyText: 'Սկսեք նոր պատվերից կամ փոխեք որոնման դաշտը։', loadError: 'Չհաջողվեց բեռնել պատվերները' },
  ru: { title: 'Мои заказы', help: 'Ищите, просматривайте и управляйте созданными вами заказами.', newOrder: 'Новый заказ', emptyTitle: 'Заказов нет', emptyText: 'Создайте новый заказ или измените поисковый запрос.', loadError: 'Не удалось загрузить заказы' },
  en: { title: 'My orders', help: 'Search, review and manage the orders you created.', newOrder: 'New order', emptyTitle: 'No orders', emptyText: 'Create a new order or change the search query.', loadError: 'Could not load orders' },
}

export default {
  components: { PermissionDenied, OrdersToolbar, OrderCard, Pagination, OrderDetailsModal },
  layout: 'engineer',
  middleware: ['role-guard'],
  meta: { role: 'engineer' },
  data: () => ({ isDetailsOpen: false, selectedOrder: null }),
  computed: {
    ...mapGetters('engineer', ['getOrders','getPagination','getFilters','isLoading','getError']),
    locale() { const code = String(this.$i18n?.locale || 'hy').toLowerCase().split('-')[0]; return ['hy','ru','en'].includes(code) ? code : 'hy' },
    t() { return COPY[this.locale] || COPY.hy },
    orders() { return this.getOrders }, pagination() { return this.getPagination }, filters() { return this.getFilters }, loading() { return this.isLoading }, error() { return this.getError },
  },
  created() { this.fetchOrders().catch(() => this.$notify?.({ type: 'error', text: this.t.loadError })) },
  methods: {
    ...mapActions('engineer', ['fetchOrders','setSearch','setPerPage','goPage']),
    onSetSearch(q) { this.setSearch(q) }, onSetPerPage(n) { this.setPerPage(n) }, onGoPage(p) { this.goPage(p) },
    openOrder(order) { this.selectedOrder = order; this.isDetailsOpen = true },
  },
}
</script>

<style>
.card-enter-active,.card-leave-active{transition:all .18s ease}.card-enter,.card-leave-to{opacity:0;transform:translateY(6px)}
</style>
