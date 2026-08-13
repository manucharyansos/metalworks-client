<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Workload balancing</p>
          <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Աշխատանքների բաշխում</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Տեսեք աշխատակիցների ընթացիկ ծանրաբեռնվածությունը, գտեք առանց աշխատակցի մնացած factory քայլերը և վերաբաշխեք աշխատանքը նույն արտադրամասի ներսում։
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          :disabled="loading"
          @click="refreshAll"
        >
          <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 6v5h-5M4 18v-5h5m10.5-2a8 8 0 00-13.8-3M4.5 14a8 8 0 0013.8 3" />
          </svg>
          Թարմացնել
        </button>
      </section>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="metric-card">
          <p class="metric-label">Չնշանակված քայլեր</p>
          <p class="metric-value text-amber-600 dark:text-amber-300">{{ summary.unassigned_factory_steps || 0 }}</p>
          <p class="metric-hint">պահանջում են աշխատակից</p>
        </div>
        <div class="metric-card">
          <p class="metric-label">Գերբեռնված</p>
          <p class="metric-value text-rose-600 dark:text-rose-300">{{ overloadedCount }}</p>
          <p class="metric-hint">աշխատակից</p>
        </div>
        <div class="metric-card">
          <p class="metric-label">Ակտիվ աշխատանք</p>
          <p class="metric-value">{{ totalActiveWork }}</p>
          <p class="metric-hint">factory քայլ</p>
        </div>
        <div class="metric-card">
          <p class="metric-label">Ուշացած աշխատանք</p>
          <p class="metric-value text-rose-600 dark:text-rose-300">{{ totalOverdueWork }}</p>
          <p class="metric-hint">operator-ներին նշանակված</p>
        </div>
      </section>

      <section class="grid gap-6 2xl:grid-cols-[1.05fr_1.25fr]">
        <div class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="eyebrow">Team capacity</p>
              <h2 class="section-title">Աշխատակիցների ծանրաբեռնվածություն</h2>
            </div>
            <select v-model="factoryFilter" class="small-control sm:w-56">
              <option value="">Բոլոր արտադրամասերը</option>
              <option v-for="factory in factories" :key="factory.id" :value="String(factory.id)">{{ factory.name }}</option>
            </select>
          </div>

          <div class="mb-4 grid gap-2 sm:grid-cols-2">
            <input v-model="operatorSearch" class="small-control" placeholder="Որոնել աշխատակցին" />
            <select v-model="workloadFilter" class="small-control">
              <option value="">Բոլոր վիճակները</option>
              <option value="overloaded">Գերբեռնված</option>
              <option value="busy">Բարձր ծանրաբեռնվածություն</option>
              <option value="normal">Նորմալ</option>
              <option value="light">Թեթև</option>
              <option value="idle">Ազատ</option>
            </select>
          </div>

          <div class="max-h-[680px] space-y-2 overflow-y-auto pr-1">
            <button
              v-for="operator in filteredOperators"
              :key="operator.id"
              type="button"
              class="w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
              :class="selectedOperatorId === String(operator.id) ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/30'"
              @click="selectOperator(operator)"
            >
              <div class="flex items-start gap-3">
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-black"
                  :class="selectedOperatorId === String(operator.id) ? 'bg-white/10 text-white dark:bg-slate-950/10 dark:text-slate-950' : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'"
                >
                  {{ initials(operator.name) }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="truncate text-sm font-bold">{{ operator.name }}</p>
                    <span class="rounded-full px-2 py-0.5 text-[9px] font-bold" :class="workloadBadge(operator.workload)">{{ workloadLabel(operator.workload) }}</span>
                  </div>
                  <p class="mt-1 truncate text-[11px] opacity-60">{{ operator.factory?.name || '—' }} · {{ operator.role?.value || operator.role?.name || '—' }}</p>
                  <div class="mt-3 grid grid-cols-4 gap-2 text-center">
                    <div><p class="text-[9px] opacity-50">Ակտիվ</p><p class="mt-0.5 text-sm font-black">{{ operator.active_orders }}</p></div>
                    <div><p class="text-[9px] opacity-50">Ուշացած</p><p class="mt-0.5 text-sm font-black" :class="operator.overdue_orders ? 'text-rose-500 dark:text-rose-300' : ''">{{ operator.overdue_orders }}</p></div>
                    <div><p class="text-[9px] opacity-50">Այսօր</p><p class="mt-0.5 text-sm font-black">{{ operator.due_today }}</p></div>
                    <div><p class="text-[9px] opacity-50">30 օր</p><p class="mt-0.5 text-sm font-black">{{ operator.completed_30d }}</p></div>
                  </div>
                </div>
              </div>
            </button>

            <div v-if="!filteredOperators.length" class="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">
              Համապատասխան աշխատակից չի գտնվել։
            </div>
          </div>
        </div>

        <div class="space-y-5">
          <section class="rounded-[28px] border border-amber-200 bg-amber-50/70 p-5 shadow-sm dark:border-amber-950/60 dark:bg-amber-950/15 sm:p-6">
            <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/60 dark:text-amber-300/60">Assignment queue</p>
                <h2 class="mt-1 text-lg font-bold text-slate-950 dark:text-white">Չնշանակված աշխատանքներ</h2>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ unassignedSteps.length }} քայլ այս preview-ում</p>
              </div>
              <select v-model="queueFactoryFilter" class="small-control sm:w-56" @change="loadUnassigned">
                <option value="">Բոլոր արտադրամասերը</option>
                <option v-for="factory in factories" :key="factory.id" :value="String(factory.id)">{{ factory.name }}</option>
              </select>
            </div>

            <div v-if="queueLoading" class="flex min-h-[180px] items-center justify-center"><span class="h-6 w-6 animate-spin rounded-full border-2 border-amber-300 border-t-amber-700"></span></div>
            <div v-else-if="unassignedSteps.length" class="space-y-3">
              <article v-for="step in unassignedSteps" :key="step.id" class="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-sm dark:border-amber-950/60 dark:bg-slate-900">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">#{{ step.order_number || step.order_id }}</span>
                      <span class="rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">{{ step.factory_name }}</span>
                      <span v-if="step.overdue" class="rounded-lg bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">Ուշացած</span>
                    </div>
                    <p class="mt-2 truncate text-sm font-bold text-slate-900 dark:text-white">{{ step.order_name || 'Առանց անվանման' }}</p>
                    <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Վերջնաժամկետ՝ {{ formatDate(step.finish_date) }}</p>
                  </div>

                  <div class="w-full sm:w-64">
                    <label class="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Նշանակել աշխատակցին</label>
                    <div class="mt-1.5 flex gap-2">
                      <select
                        v-model="assignmentDrafts[step.id]"
                        class="small-control min-w-0 flex-1"
                        :disabled="assignmentSavingId === step.id"
                      >
                        <option value="">Ընտրել</option>
                        <option v-for="operator in operatorsForFactory(step.factory_id)" :key="operator.id" :value="String(operator.id)">
                          {{ operator.name }} · {{ operator.active_orders }} ակտիվ
                        </option>
                      </select>
                      <button
                        type="button"
                        class="rounded-xl bg-slate-950 px-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                        :disabled="!assignmentDrafts[step.id] || assignmentSavingId === step.id"
                        @click="assignStep(step)"
                      >
                        <span v-if="assignmentSavingId === step.id" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"></span>
                        <span v-else>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </div>
            <div v-else class="rounded-2xl border border-dashed border-amber-200 p-8 text-center dark:border-amber-950/60">
              <p class="text-sm font-bold text-slate-700 dark:text-slate-200">Չնշանակված աշխատանք չկա 🎉</p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Այս ֆիլտրով բոլոր factory քայլերն ունեն աշխատակից։</p>
            </div>
          </section>

          <section v-if="selectedOperator" class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div class="mb-4 flex items-start justify-between gap-3">
              <div>
                <p class="eyebrow">Selected operator</p>
                <h2 class="section-title">{{ selectedOperator.name }}</h2>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ selectedOperator.factory?.name || '—' }}</p>
              </div>
              <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" @click="clearSelectedOperator">✕</button>
            </div>

            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div class="mini-stat"><p>Ակտիվ</p><strong>{{ selectedOperator.active_orders }}</strong></div>
              <div class="mini-stat"><p>Ուշացած</p><strong :class="selectedOperator.overdue_orders ? 'text-rose-600 dark:text-rose-300' : ''">{{ selectedOperator.overdue_orders }}</strong></div>
              <div class="mini-stat"><p>Այսօր</p><strong>{{ selectedOperator.due_today }}</strong></div>
              <div class="mini-stat"><p>30 օրում</p><strong>{{ selectedOperator.completed_30d }}</strong></div>
            </div>

            <div class="mt-4 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
              Նոր չնշանակված աշխատանք ընտրելիս այս աշխատակիցը առաջարկվում է միայն այն դեպքում, երբ աշխատանքը պատկանում է նույն արտադրամասին։ Backend-ը նույնպես ստուգում է factory համապատասխանությունը։
            </div>
          </section>
        </div>
      </section>
    </div>
  </main>
</template>

<script>
export default {
  name: 'AdminWorkload',
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
  data() {
    return {
      loading: false,
      queueLoading: false,
      assignmentSavingId: null,
      summary: {},
      factories: [],
      operators: [],
      unassignedOrders: [],
      assignmentDrafts: {},
      factoryFilter: '',
      queueFactoryFilter: '',
      workloadFilter: '',
      operatorSearch: '',
      selectedOperatorId: '',
    }
  },
  computed: {
    overloadedCount() {
      return this.operators.filter((row) => row.workload === 'overloaded').length
    },
    totalActiveWork() {
      return this.operators.reduce((sum, row) => sum + Number(row.active_orders || 0), 0)
    },
    totalOverdueWork() {
      return this.operators.reduce((sum, row) => sum + Number(row.overdue_orders || 0), 0)
    },
    filteredOperators() {
      const term = this.operatorSearch.trim().toLowerCase()
      return this.operators.filter((row) => {
        const matchesFactory = !this.factoryFilter || String(row.factory?.id || '') === String(this.factoryFilter)
        const matchesWorkload = !this.workloadFilter || row.workload === this.workloadFilter
        const matchesSearch = !term || [row.name, row.email, row.factory?.name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
        return matchesFactory && matchesWorkload && matchesSearch
      })
    },
    selectedOperator() {
      return this.operators.find((row) => String(row.id) === String(this.selectedOperatorId)) || null
    },
    unassignedSteps() {
      const steps = []
      this.unassignedOrders.forEach((order) => {
        ;(order.factory_orders || []).forEach((fo) => {
          if (fo.operator_id) return
          if (this.queueFactoryFilter && String(fo.factory_id) !== String(this.queueFactoryFilter)) return
          const finishDate = order.dates?.finish_date || null
          steps.push({
            id: fo.id,
            factory_id: fo.factory_id,
            factory_name: fo.factory?.name || 'Factory',
            order_id: order.id,
            order_number: order.order_number?.number || '',
            order_name: order.name || '',
            finish_date: finishDate,
            overdue: this.isOverdue(finishDate, order.status),
          })
        })
      })
      return steps.sort((a, b) => {
        if (a.overdue !== b.overdue) return a.overdue ? -1 : 1
        return String(a.finish_date || '9999').localeCompare(String(b.finish_date || '9999'))
      })
    },
  },
  async created() {
    await this.refreshAll()
  },
  methods: {
    async refreshAll() {
      this.loading = true
      try {
        await Promise.all([this.loadDashboard(), this.loadUnassigned()])
      } finally {
        this.loading = false
      }
    },
    async loadDashboard() {
      const { data } = await this.$axios.get('/api/admin/dashboard')
      this.summary = data.summary || {}
      this.factories = data.factories || []
      this.operators = data.operators || []
    },
    async loadUnassigned() {
      this.queueLoading = true
      try {
        const params = { assignment: 'unassigned', per_page: 100, sort: 'deadline_asc' }
        if (this.queueFactoryFilter) params.factory_id = this.queueFactoryFilter
        const { data } = await this.$axios.get('/api/admin/dashboard/orders', { params })
        this.unassignedOrders = data.orders || []
        this.assignmentDrafts = {}
      } catch (error) {
        this.unassignedOrders = []
        this.$notify?.({ type: 'error', text: error?.response?.data?.message || 'Չհաջողվեց բեռնել չնշանակված աշխատանքները' })
      } finally {
        this.queueLoading = false
      }
    },
    operatorsForFactory(factoryId) {
      return this.operators
        .filter((row) => String(row.factory?.id || '') === String(factoryId))
        .slice()
        .sort((a, b) => {
          const overdueDiff = Number(a.overdue_orders || 0) - Number(b.overdue_orders || 0)
          if (overdueDiff !== 0) return overdueDiff
          return Number(a.active_orders || 0) - Number(b.active_orders || 0)
        })
    },
    async assignStep(step) {
      const operatorId = this.assignmentDrafts[step.id]
      if (!operatorId) return
      this.assignmentSavingId = step.id
      try {
        const { data } = await this.$axios.put(`/api/admin/factory-orders/${step.id}/operator`, { operator_id: Number(operatorId) })
        this.$notify?.({ type: 'success', text: data.message || 'Աշխատակիցը նշանակվեց։' })
        await Promise.all([this.loadDashboard(), this.loadUnassigned()])
      } catch (error) {
        this.$notify?.({ type: 'error', text: error?.response?.data?.message || 'Չհաջողվեց նշանակել աշխատակցին։' })
      } finally {
        this.assignmentSavingId = null
      }
    },
    selectOperator(operator) {
      this.selectedOperatorId = String(operator.id)
      this.factoryFilter = String(operator.factory?.id || '')
    },
    clearSelectedOperator() {
      this.selectedOperatorId = ''
    },
    workloadLabel(value) {
      return { overloaded: 'Գերբեռնված', busy: 'Բարձր', normal: 'Նորմալ', light: 'Թեթև', idle: 'Ազատ' }[value] || value
    },
    workloadBadge(value) {
      return {
        overloaded: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        busy: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        normal: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        light: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        idle: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
      }[value] || 'bg-slate-100 text-slate-500'
    },
    initials(name) {
      return String(name || '?').split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')
    },
    isOverdue(value, status) {
      if (!value || ['completed', 'canceled', 'cancelled'].includes(status)) return false
      const date = new Date(value)
      return !Number.isNaN(date.getTime()) && date < new Date()
    },
    formatDate(value) {
      if (!value) return '—'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return String(value)
      return new Intl.DateTimeFormat('hy-AM', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
    },
  },
}
</script>

<style scoped>
.metric-card { @apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900; }
.metric-label { @apply text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400; }
.metric-value { @apply mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white; }
.metric-hint { @apply mt-1 text-[11px] text-slate-500 dark:text-slate-400; }
.eyebrow { @apply text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400; }
.section-title { @apply mt-1 text-lg font-bold text-slate-950 dark:text-white; }
.small-control { @apply w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200; }
.mini-stat { @apply rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-950/40; }
.mini-stat p { @apply text-[9px] font-bold uppercase tracking-wider text-slate-400; }
.mini-stat strong { @apply mt-1 block text-lg font-black text-slate-900 dark:text-white; }
</style>
