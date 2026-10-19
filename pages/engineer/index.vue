<template>
  <div class="min-h-screen w-full bg-gray-50 dark:bg-gray-950">
    <div
      v-if="$can('orders.view')"
      class="container mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Իմ առաջադրանքները
          </h1>
          <InfoTooltip
            >Փնտրեք, դիտեք և կառավարեք ձեր ստեղծած առաջադրանքները։</InfoTooltip
          >
        </div>
      </div>

      <nav class="mt-6" :aria-label="boardText.stage" data-task-stage-filters>
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button
            v-for="stage in stages"
            :key="stage"
            type="button"
            :data-task-stage="stage"
            :aria-pressed="filters.stage === stage ? 'true' : 'false'"
            class="min-w-0 rounded-2xl border p-4 text-left transition"
            :class="
              filters.stage === stage
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-100'
                : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
            "
            @click="selectStage(stage)"
          >
            <span class="block text-2xl font-black">{{
              getStageCounts[stage] || 0
            }}</span>
            <span class="mt-1 block text-xs font-semibold sm:text-sm">{{
              stage === 'created' ? boardText.shortCreated : boardText[stage]
            }}</span>
          </button>
        </div>
        <button
          type="button"
          data-task-stage=""
          :aria-pressed="!filters.stage ? 'true' : 'false'"
          class="mt-3 rounded-xl px-3 py-2 text-sm font-bold"
          :class="
            !filters.stage ? 'bg-slate-200 dark:bg-slate-800' : 'text-slate-500'
          "
          @click="selectStage('')"
        >
          {{ boardText.all }}
        </button>
      </nav>
      <label class="mt-5 block text-sm font-semibold">
        <select
          v-model="confirmationFilter"
          data-engineer-confirmation-filter
          class="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          @change="selectConfirmation"
        >
          <option value="">{{ t.all }}</option>
          <option value="waiting">{{ t.pending }}</option>
        </select>
      </label>
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
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          <div
            v-for="i in 8"
            :key="i"
            class="work-card animate-pulse bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5"
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
          <h3 class="text-lg font-semibold mb-1">Առաջադրանքներ չկան</h3>
          <p class="text-sm text-gray-500">
            Սկսեք նոր առաջադրանքից կամ փոխեք որոնման դաշտը
          </p>
        </div>

        <!-- grid -->
        <transition-group
          v-if="!loading"
          name="card"
          tag="div"
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
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
      :visible="isDetailsOpen && $can('orders.view')"
      :order="selectedOrder"
      @close="isDetailsOpen = false"
      @updated="onTaskUpdated"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { apiErrorMessage, taskCopy } from '@/utils/task-workflow'
import { boardCopy } from '@/utils/task-board'
import OrdersToolbar from '~/components/engineer/OrdersToolbar.vue'
import OrderCard from '~/components/engineer/OrderCard.vue'
import Pagination from '~/components/ui/Pagination.vue'
import OrderDetailsModal from '~/components/engineer/OrderDetailsModal.vue'
import PermissionDenied from '@/components/modals/permission/PermissionDenied.vue'

export default {
  components: {
    PermissionDenied,
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
    confirmationFilter: '',
    refreshTimer: null,
    selectedOrder: null,
    openQueryVersion: 0,
    stages: ['created', 'accepted', 'in_progress', 'completed'],
  }),
  computed: {
    boardText() {
      return boardCopy[this.$i18n?.locale] || boardCopy.hy
    },
    t() {
      return taskCopy[this.$i18n?.locale] || taskCopy.hy
    },
    ...mapGetters('engineer', [
      'getOrders',
      'getPagination',
      'getFilters',
      'getStageCounts',
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
  watch: {
    '$route.query.order'() {
      this.openFromQuery()
    },
    orders(rows) {
      if (this.selectedOrder)
        this.selectedOrder =
          rows.find((row) => row.id === this.selectedOrder.id) ||
          this.selectedOrder
    },
  },
  created() {
    this.confirmationFilter = this.filters.confirmation || ''
    this.fetchOrders().catch(() => {
      this.$notify?.({ type: 'error', text: 'Չհաջողվեց բեռնել առաջադրանքները' })
    })
    this.openFromQuery()
  },
  mounted() {
    this.refreshTimer = setInterval(() => {
      if (!document.hidden && !this.loading) this.refreshOrders()
    }, 30000)
    window.addEventListener('focus', this.refreshOrders)
  },
  beforeDestroy() {
    this.openQueryVersion++
    clearInterval(this.refreshTimer)
    window.removeEventListener('focus', this.refreshOrders)
  },
  methods: {
    selectStage(stage) {
      return this.fetchOrders({
        page: 1,
        stage,
        confirmation: this.confirmationFilter,
      })
    },
    selectConfirmation() {
      return this.fetchOrders({
        page: 1,
        confirmation: this.confirmationFilter,
      })
    },
    // A notification opens its task directly: /engineer?order=<id>
    async openFromQuery() {
      const version = ++this.openQueryVersion
      const id = Number(this.$route.query.order)
      if (!id) return
      const companyId = this.$store?.state?.workspace?.company?.id
      const current = () =>
        version === this.openQueryVersion &&
        !this._isDestroyed &&
        Number(this.$route.query.order) === id &&
        this.$store?.state?.workspace?.company?.id === companyId
      let order = (this.orders || []).find((row) => row.id === id)
      if (!order) {
        try {
          const { data } = await this.$axios.get(
            `/api/engineers/engineer/${id}`
          )
          order = data.order
        } catch (error) {
          if (current())
            this.$notify?.({ type: 'error', text: apiErrorMessage(error) })
        }
      }
      if (!current()) return
      if (order) this.openOrder(order)
      // The link is single-use, so a refresh does not reopen the task.
      const { order: _order, ...query } = this.$route.query
      const result = this.$router.replace({ path: this.$route.path, query })
      if (result && result.catch) result.catch(() => {})
    },
    refreshOrders() {
      return this.fetchOrders({ confirmation: this.confirmationFilter })
    },
    onTaskUpdated(order) {
      this.selectedOrder = order
      this.refreshOrders()
    },
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
