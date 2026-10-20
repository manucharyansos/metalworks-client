<template>
  <div
    class="work-modal-backdrop fixed inset-0 z-[70] flex items-center justify-center"
    @click.self="$emit('close')"
    @keydown.esc.stop.prevent="$emit('close')"
  >
    <section
      data-work-modal
      data-dashboard-tasks-modal
      class="work-modal work-modal--structured flex w-full max-w-6xl flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-tasks-title"
    >
      <header class="work-modal__header flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h2
            id="dashboard-tasks-title"
            class="work-section__title break-words"
          >
            {{ title }}
          </h2>
          <p class="work-meta mt-1" role="status">
            {{
              $t('operations_dashboard.results', { count: pagination.total })
            }}
          </p>
        </div>
        <button
          ref="close"
          type="button"
          class="work-modal__close"
          :aria-label="$t('operations_dashboard.close')"
          @click="$emit('close')"
        >
          ✕
        </button>
      </header>
      <div class="work-modal__body" :aria-busy="loading ? 'true' : 'false'">
        <p
          v-if="loading"
          class="py-8 text-center text-sm text-slate-500"
          role="status"
        >
          {{ $t('operations_dashboard.loading') }}
        </p>
        <div
          v-else-if="error"
          role="alert"
          class="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
        >
          <p>{{ $t('operations_dashboard.load_failed') }}</p>
          <button
            type="button"
            class="work-button mt-3"
            @click="load(pagination.current_page)"
          >
            {{ $t('operations_dashboard.retry') }}
          </button>
        </div>
        <div
          v-else-if="orders.length"
          class="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <AdminOrderCard
            v-for="order in orders"
            :key="order.id"
            :order="order"
            @edit="$emit('open', order)"
          />
        </div>
        <p
          v-else
          class="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-700"
        >
          {{ $t('operations_dashboard.empty') }}
        </p>
      </div>
      <footer
        class="work-modal__footer flex items-center justify-between gap-3"
      >
        <button
          type="button"
          class="work-button"
          :disabled="loading || pagination.current_page <= 1"
          :aria-label="$t('operations_dashboard.previous')"
          data-modal-previous
          @click="load(pagination.current_page - 1)"
        >
          ‹
        </button>
        <span class="work-meta"
          >{{ pagination.current_page }} / {{ pagination.last_page }}</span
        >
        <button
          type="button"
          class="work-button"
          :disabled="loading || pagination.current_page >= pagination.last_page"
          :aria-label="$t('operations_dashboard.next')"
          data-modal-next
          @click="load(pagination.current_page + 1)"
        >
          ›
        </button>
      </footer>
    </section>
  </div>
</template>

<script>
import AdminOrderCard from '@/components/admin/orders/OrderCard.vue'

export default {
  components: { AdminOrderCard },
  props: {
    title: { type: String, required: true },
    filters: { type: Object, default: () => ({}) },
  },
  data: () => ({
    orders: [],
    loading: false,
    error: false,
    requestVersion: 0,
    pagination: { current_page: 1, last_page: 1, total: 0 },
    returnFocus: null,
  }),
  computed: {
    scope() {
      return `${this.$store.state.auth?.user?.id || ''}:${
        this.$store.state.workspace?.company?.id || ''
      }`
    },
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        this.load(1)
      },
    },
    scope() {
      this.requestVersion++
      this.orders = []
      this.$emit('close')
    },
  },
  created() {
    this.load(1)
  },
  mounted() {
    this.returnFocus = document.activeElement
    this.$refs.close.focus({ preventScroll: true })
  },
  beforeDestroy() {
    this.requestVersion++
    if (this.returnFocus?.isConnected)
      this.returnFocus.focus({ preventScroll: true })
  },
  methods: {
    refresh() {
      return this.load(this.pagination.current_page)
    },
    async load(page = 1) {
      const version = ++this.requestVersion
      const scope = this.scope
      this.loading = true
      this.error = false
      try {
        const { data } = await this.$axios.get('/api/admin/dashboard/orders', {
          params: { ...this.filters, page, per_page: 12 },
        })
        if (version !== this.requestVersion || scope !== this.scope) return
        if (
          !data.orders?.length &&
          page > Number(data.pagination?.last_page || 1)
        )
          return this.load(Number(data.pagination?.last_page || 1))
        this.orders = data.orders || []
        this.pagination = data.pagination || {
          current_page: 1,
          last_page: 1,
          total: 0,
        }
      } catch (error) {
        if (version === this.requestVersion && scope === this.scope) {
          this.orders = []
          this.error = true
        }
      } finally {
        if (version === this.requestVersion && scope === this.scope)
          this.loading = false
      }
    },
  },
}
</script>
