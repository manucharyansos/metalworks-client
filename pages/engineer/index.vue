<template>
  <main class="min-h-screen w-full bg-slate-50 dark:bg-slate-950">
    <div v-if="$can('orders.view')" class="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Իմ առաջադրանքները
        </h1>
        <InfoTooltip
          >Ձեր ստեղծած առաջադրանքները՝ ըստ աշխատանքի ընթացքի։</InfoTooltip
        >
      </div>
      <div class="mt-5 flex flex-wrap items-end gap-4">
        <div class="min-w-0 flex-1">
          <OrdersToolbar
            data-engineer-toolbar
            :search="filters.search"
            :per-page="getBoardPerPage"
            :per-page-label="boardText.perColumn"
            @update:search="onSetSearch"
            @update:per-page="onSetPerPage"
          />
        </div>
        <select
          v-model="confirmationFilter"
          data-engineer-confirmation-filter
          :aria-label="t.pending"
          class="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:w-auto sm:max-w-xs"
          @change="selectConfirmation"
        >
          <option value="">{{ t.all }}</option>
          <option value="waiting">{{ t.pending }}</option>
        </select>
      </div>
      <div
        class="mt-6 grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4"
        data-engineer-board
      >
        <section
          v-for="stage in stages"
          :key="stage"
          :data-engineer-board-stage="stage"
          class="work-card engineer-board-column flex min-w-0 flex-col overflow-hidden"
          :aria-label="boardText[stage]"
          :aria-busy="columns[stage].loading ? 'true' : 'false'"
        >
          <header
            class="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-4 py-4 dark:border-slate-800"
          >
            <h2 class="min-w-0 text-sm font-bold">{{ boardText[stage] }}</h2>
            <span
              class="work-status shrink-0"
              :data-tone="stageTone(stage)"
              data-stage-count
              >{{ columns[stage].pagination.total }}</span
            >
          </header>
          <div
            class="engineer-board-column__body min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-3 dark:bg-slate-950/20"
          >
            <p
              v-if="columns[stage].loading && !columns[stage].loaded"
              role="status"
              class="py-8 text-center text-sm text-slate-500"
            >
              {{ boardText.loading }}
            </p>
            <div
              v-if="columns[stage].error"
              role="alert"
              class="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
            >
              <p>{{ boardText.loadFailed }}</p>
              <button
                type="button"
                class="mt-2 font-bold underline"
                :disabled="columns[stage].loading"
                @click="
                  changePage(stage, columns[stage].pagination.current_page)
                "
              >
                {{ boardText.retry }}
              </button>
            </div>
            <p
              v-else-if="columns[stage].loaded && !columns[stage].orders.length"
              class="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center text-sm text-slate-500 dark:border-slate-700"
            >
              {{ boardText.empty }}
            </p>
            <OrderCard
              v-for="order in columns[stage].orders"
              :key="order.id"
              :order="order"
              @open="openOrder"
            />
          </div>
          <footer
            class="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 p-3 text-xs dark:border-slate-800"
          >
            <button
              type="button"
              class="work-button"
              :aria-label="boardText.previousPage"
              :disabled="
                columns[stage].loading ||
                columns[stage].pagination.current_page <= 1
              "
              data-column-previous
              @click="
                changePage(stage, columns[stage].pagination.current_page - 1)
              "
            >
              ‹
            </button>
            <span class="text-slate-500 dark:text-slate-400"
              >{{ columns[stage].pagination.current_page }} /
              {{ columns[stage].pagination.last_page }}</span
            >
            <button
              type="button"
              class="work-button"
              :aria-label="boardText.nextPage"
              :disabled="
                columns[stage].loading ||
                columns[stage].pagination.current_page >=
                  columns[stage].pagination.last_page
              "
              data-column-next
              @click="
                changePage(stage, columns[stage].pagination.current_page + 1)
              "
            >
              ›
            </button>
          </footer>
        </section>
      </div>
    </div>
    <PermissionDenied v-else />
    <OrderDetailsModal
      :visible="isDetailsOpen && $can('orders.view')"
      :order="selectedOrder"
      :focus-target="focusTarget"
      @close="isDetailsOpen = false"
      @updated="onTaskUpdated"
    />
  </main>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { apiErrorMessage, taskCopy } from '@/utils/task-workflow'
import { boardCopy } from '@/utils/task-board'
import OrdersToolbar from '~/components/engineer/OrdersToolbar.vue'
import OrderCard from '~/components/engineer/OrderCard.vue'
import OrderDetailsModal from '~/components/engineer/OrderDetailsModal.vue'
import PermissionDenied from '@/components/modals/permission/PermissionDenied.vue'

export default {
  components: { PermissionDenied, OrdersToolbar, OrderCard, OrderDetailsModal },
  layout: 'engineer',
  middleware: ['role-guard'],
  meta: { role: 'engineer' },
  data: () => ({
    isDetailsOpen: false,
    confirmationFilter: '',
    refreshTimer: null,
    selectedOrder: null,
    focusTarget: null,
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
      'getBoardColumns',
      'getBoardPerPage',
      'getFilters',
    ]),
    columns() {
      return this.getBoardColumns
    },
    filters() {
      return this.getFilters
    },
    orders() {
      return this.stages.flatMap((stage) => this.columns[stage].orders)
    },
    loading() {
      return this.stages.some((stage) => this.columns[stage].loading)
    },
  },
  watch: {
    '$route.query'() {
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
    this.fetchBoard({ reset: true })
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
    this.$store.commit('engineer/INVALIDATE_BOARD')
    clearInterval(this.refreshTimer)
    window.removeEventListener('focus', this.refreshOrders)
  },
  methods: {
    ...mapActions('engineer', ['fetchBoard', 'fetchBoardColumn']),
    stageTone(stage) {
      return {
        created: 'neutral',
        accepted: 'blue',
        in_progress: 'blue',
        completed: 'green',
      }[stage]
    },
    selectConfirmation() {
      return this.fetchBoard({
        confirmation: this.confirmationFilter,
        reset: true,
      })
    },
    async openFromQuery() {
      const version = ++this.openQueryVersion
      const id = Number(this.$route.query.order)
      if (!Number.isSafeInteger(id) || id <= 0) return
      const companyId = this.$store?.state?.workspace?.company?.id
      const current = () =>
        version === this.openQueryVersion &&
        !this._isDestroyed &&
        Number(this.$route.query.order) === id &&
        this.$store?.state?.workspace?.company?.id === companyId
      // A notification always resolves fresh state, including a task outside the
      // currently visible column page or a decision already handled elsewhere.
      let order
      try {
        const { data } = await this.$axios.get(`/api/engineers/engineer/${id}`)
        order = data.order
      } catch (error) {
        if (current())
          this.$notify?.({ type: 'error', text: apiErrorMessage(error) })
      }
      if (!current()) return
      const target = {
        stepId: Number(this.$route.query.step) || null,
        action: this.$route.query.action,
        enabled: true,
      }
      if (order) this.openOrder(order, target)
      const query = { ...this.$route.query }
      for (const key of ['order', 'step', 'action']) delete query[key]
      const result = this.$router.replace({ path: this.$route.path, query })
      if (result && result.catch) result.catch(() => {})
    },
    refreshOrders() {
      if (!this.loading)
        return this.fetchBoard({ confirmation: this.confirmationFilter })
    },
    onTaskUpdated(order) {
      this.selectedOrder = order
      this.fetchBoard({ confirmation: this.confirmationFilter })
    },
    onSetSearch(search) {
      return this.fetchBoard({ search, reset: true })
    },
    onSetPerPage(perPage) {
      return this.fetchBoard({ perPage, reset: true })
    },
    changePage(stage, page) {
      return this.fetchBoardColumn({ stage, page })
    },
    openOrder(order, target = null) {
      this.selectedOrder = order
      this.focusTarget = target
      this.isDetailsOpen = true
    },
  },
}
</script>
<style scoped>
@media (min-width: 768px) {
  .engineer-board-column {
    height: clamp(440px, calc(100vh - 245px), 1100px);
    height: clamp(440px, calc(100dvh - 245px), 1100px);
  }
}
.engineer-board-column__body > .work-task-card {
  height: auto;
}
</style>
