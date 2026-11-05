<template>
  <main class="min-h-screen min-w-0 p-4 sm:p-6">
    <section v-if="$can('orders.view')" class="space-y-4">
      <h1 class="text-2xl font-bold">{{ c.title }}</h1>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label
          >{{ c.search
          }}<input v-model.trim="filters.search" type="search" class="control"
        /></label>
        <label
          >{{ c.workshop
          }}<select v-model="filters.factory_id" class="control">
            <option value="">{{ c.all }}</option>
            <option v-for="f in options.factories" :key="f.id" :value="f.id">
              {{ f.name }}
            </option>
          </select></label
        >
        <label
          >{{ c.operator
          }}<select v-model="filters.operator_id" class="control">
            <option value="">{{ c.all }}</option>
            <option v-for="o in options.operators" :key="o.id" :value="o.id">
              {{ o.name }}
            </option>
          </select></label
        >
        <label
          >{{ c.status
          }}<select v-model="filters.stage" class="control">
            <option value="">{{ c.all }}</option>
            <option v-for="stage in stages" :key="stage" :value="stage">
              {{ boardText[stage] }}
            </option>
          </select></label
        >
        <label
          >{{ c.from
          }}<input v-model="filters.due_from" type="date" class="control"
        /></label>
        <label
          >{{ c.to
          }}<input v-model="filters.due_to" type="date" class="control"
        /></label>
        <label
          >{{ c.sort
          }}<select v-model="filters.sort" class="control">
            <option value="priority">{{ c.byPriority }}</option>
            <option value="newest">{{ c.newest }}</option>
          </select></label
        >
        <label class="flex items-center gap-2"
          ><input v-model="waiting" type="checkbox" />{{ t.pending }}</label
        >
        <button type="button" class="work-button" @click="resetFilters">
          {{ c.clear }}
        </button>
      </div>
      <p v-if="error" role="alert">
        {{ error }}
        <button type="button" class="underline" @click="fetchRows">
          {{ boardText.retry }}
        </button>
      </p>
      <p v-else-if="loading" role="status">{{ boardText.loading }}</p>
      <div
        v-else-if="orders.length"
        class="overflow-x-auto rounded-xl border"
        tabindex="0"
      >
        <table class="w-full text-left text-sm">
          <thead>
            <tr>
              <th
                v-for="key in [
                  'task',
                  'workshop',
                  'operator',
                  'status',
                  'priority',
                  'due',
                ]"
                :key="key"
              >
                {{ c[key] }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in orders"
              :key="order.id"
              class="task-row cursor-pointer border-t"
              :data-stage="order.workflow_stage"
              @click="openOrder(order)"
            >
              <td>
                <button
                  type="button"
                  class="text-left font-semibold underline"
                  @click.stop="openOrder(order)"
                >
                  #{{ order.order_number?.number || order.id }} ·
                  {{ order.name }}
                </button>
              </td>
              <td>{{ stepNames(order, 'factory') }}</td>
              <td>{{ stepNames(order, 'operator') }}</td>
              <td>
                <span class="status-badge">{{
                  boardText[order.workflow_stage] || order.status
                }}</span>
              </td>
              <td>
                <strong
                  :class="{
                    'text-rose-700': Number(order.priority_rank) === 2,
                    'text-amber-700': Number(order.priority_rank) === 1,
                  }"
                  >{{
                    c[
                      ['normal', 'high', 'urgent'][
                        Number(order.priority_rank) || 0
                      ]
                    ]
                  }}</strong
                >
              </td>
              <td>{{ (order.dates?.finish_date || '—').slice(0, 10) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else>{{ boardText.empty }}</p>
      <div v-if="!error" class="flex items-center gap-3">
        <button
          class="work-button"
          type="button"
          :disabled="loading || page <= 1"
          :aria-label="boardText.previousPage"
          @click="go(page - 1)"
        >
          ‹
        </button>
        <span>{{ page }} / {{ lastPage }}</span
        ><button
          class="work-button"
          type="button"
          :disabled="loading || page >= lastPage"
          :aria-label="boardText.nextPage"
          @click="go(page + 1)"
        >
          ›
        </button>
        <select
          v-model.number="filters.per_page"
          class="work-button"
          aria-label="Rows"
        >
          <option v-for="n in [10, 25, 50, 100]" :key="n" :value="n">
            {{ n }}
          </option>
        </select>
      </div>
    </section>
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
import { apiErrorMessage, taskCopy } from '@/utils/task-workflow'
import { boardCopy } from '@/utils/task-board'
import { planningCopy } from '@/utils/planning-copy'
import OrderDetailsModal from '~/components/engineer/OrderDetailsModal.vue'
import PermissionDenied from '@/components/modals/permission/PermissionDenied.vue'
const defaults = () => ({
  search: '',
  sort: 'priority',
  factory_id: '',
  operator_id: '',
  stage: '',
  due_from: '',
  due_to: '',
  confirmation: '',
  per_page: 25,
})
export default {
  components: { OrderDetailsModal, PermissionDenied },
  layout: 'engineer',
  middleware: ['role-guard'],
  meta: { role: 'engineer' },
  data: () => ({
    orders: [],
    options: { factories: [], operators: [] },
    filters: defaults(),
    page: 1,
    lastPage: 1,
    loading: false,
    error: '',
    serial: 0,
    timer: null,
    refreshTimer: null,
    isDetailsOpen: false,
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
    c() {
      return planningCopy[this.$i18n?.locale] || planningCopy.hy
    },
    scope() {
      return this.$store?.state?.workspace?.company?.id
    },
    waiting: {
      get() {
        return this.filters.confirmation === 'waiting'
      },
      set(v) {
        this.filters.confirmation = v ? 'waiting' : ''
      },
    },
  },
  watch: {
    '$route.query'() {
      this.openFromQuery()
    },
    filters: {
      deep: true,
      handler() {
        ++this.serial
        this.page = 1
        this.loading = true
        clearTimeout(this.timer)
        this.timer = setTimeout(() => this.fetchRows(), 200)
      },
    },
    scope() {
      ++this.openQueryVersion
      this.selectedOrder = null
      this.isDetailsOpen = false
      this.options = { factories: [], operators: [] }
      this.orders = []
      this.resetFilters()
    },
  },
  created() {
    if (this.$can('orders.view')) {
      this.fetchRows()
      this.openFromQuery()
    }
  },
  mounted() {
    this.refreshTimer = setInterval(() => {
      if (!document.hidden && !this.loading) this.fetchRows()
    }, 30000)
  },
  beforeDestroy() {
    ++this.serial
    ++this.openQueryVersion
    clearTimeout(this.timer)
    clearInterval(this.refreshTimer)
  },
  methods: {
    resetFilters() {
      this.filters = defaults()
    },
    go(page) {
      this.page = page
      this.fetchRows()
    },
    stepNames(order, key) {
      return (
        [
          ...new Set(
            (order.factory_orders || [])
              .filter((s) => s.factory?.is_workshop !== false)
              .map((s) => s[key]?.name)
              .filter(Boolean)
          ),
        ].join(', ') || '—'
      )
    },
    async fetchRows() {
      if (!this.$can('orders.view')) return
      const id = ++this.serial
      this.error = ''
      if (
        this.filters.due_from &&
        this.filters.due_to &&
        this.filters.due_from > this.filters.due_to
      ) {
        this.error = this.c.invalid
        this.loading = false
        return
      }
      this.loading = true
      try {
        const { data } = await this.$axios.get('/api/engineers/engineer', {
          params: {
            ...Object.fromEntries(
              Object.entries(this.filters).filter(([, v]) => v !== '')
            ),
            page: this.page,
            filter_options: 1,
          },
        })
        if (id !== this.serial) return
        this.lastPage = Math.max(1, data.pagination.last_page)
        if (this.page > this.lastPage) {
          this.go(this.lastPage)
          return
        }
        this.orders = data.orders
        this.options = data.filter_options || { factories: [], operators: [] }
      } catch (e) {
        if (id === this.serial)
          this.error = apiErrorMessage(e, this.boardText.loadFailed)
      } finally {
        if (id === this.serial) this.loading = false
      }
    },
    async openFromQuery() {
      if (!this.$can('orders.view')) return
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
    openOrder(order, target = null) {
      this.selectedOrder = order
      this.focusTarget = target
      this.isDetailsOpen = true
    },
    onTaskUpdated(order) {
      this.selectedOrder = order
      this.fetchRows()
    },
  },
}
</script>
<style scoped>
.control {
  display: block;
  width: 100%;
  min-height: 40px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  background: transparent;
  padding: 6px;
}
th,
td {
  padding: 12px;
}
th {
  white-space: nowrap;
}
.task-row[data-stage='created'] {
  background: #f1f5f9;
  color: #334155;
}
.task-row[data-stage='accepted'] {
  background: #eff6ff;
  color: #1e40af;
}
.task-row[data-stage='in_progress'] {
  background: #fffbeb;
  color: #92400e;
}
.task-row[data-stage='completed'] {
  background: #f0fdf4;
  color: #166534;
}
.task-row:hover {
  box-shadow: inset 4px 0 #2563eb;
}
.status-badge {
  display: inline-block;
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: 3px 9px;
  white-space: nowrap;
  font-weight: 600;
}
</style>
