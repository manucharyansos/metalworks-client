<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Reports & export</p>
          <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Հաշվետվություններ</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Ստեղծեք պատվերների հաշվետվություն ըստ արտադրամասի, աշխատակցի, կարգավիճակի և ժամկետի, նախադիտեք արդյունքը և արտահանեք ամբողջ ֆիլտրված տվյալները CSV։
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          :disabled="exporting"
          @click="exportCsv"
        >
          <svg v-if="!exporting" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v12m0 0 4-4m-4 4-4-4M5 19.5h14" />
          </svg>
          <span v-else class="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"></span>
          {{ exporting ? 'Պատրաստվում է...' : 'Արտահանել CSV' }}
        </button>
      </section>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <button v-for="preset in presets" :key="preset.key" type="button" class="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md" :class="presetClass(preset.key)" @click="applyPreset(preset.key)">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ preset.label }}</p>
            <span class="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/70 dark:text-slate-300 dark:ring-slate-700">{{ preset.value }}</span>
          </div>
          <p class="mt-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{{ preset.hint }}</p>
        </button>
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Report builder</p>
              <h2 class="mt-1 text-lg font-bold text-slate-950 dark:text-white">Ֆիլտրեր</h2>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ activeFilterCount }} ակտիվ ֆիլտր</p>
            </div>
            <button v-if="activeFilterCount" type="button" class="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-300" @click="resetFilters">Մաքրել բոլորը</button>
          </div>

          <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div class="relative md:col-span-2">
              <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input v-model="filters.search" class="control pl-10" placeholder="Համար, անուն, նկարագրություն, հաճախորդ..." />
            </div>
            <select v-model="filters.factory_id" class="control" @change="onFactoryChange">
              <option value="">Բոլոր արտադրամասերը</option>
              <option v-for="factory in options.factories || []" :key="factory.id" :value="String(factory.id)">{{ factory.name }}</option>
            </select>
            <select v-model="filters.operator_id" class="control">
              <option value="">Բոլոր աշխատակիցները</option>
              <option v-for="operator in operatorOptions" :key="operator.id" :value="String(operator.id)">{{ operator.name }}</option>
            </select>

            <select v-model="filters.order_status" class="control">
              <option value="">Պատվերի բոլոր status-ները</option>
              <option v-for="status in options.order_statuses || []" :key="status" :value="status">{{ status }}</option>
            </select>
            <select v-model="filters.factory_status" class="control">
              <option value="">Factory բոլոր status-ները</option>
              <option v-for="status in options.factory_statuses || []" :key="status.value" :value="status.value">{{ status.status_label || status.name || status.value }}</option>
            </select>
            <select v-model="filters.time_range" class="control">
              <option value="">Բոլոր ժամկետները</option>
              <option value="overdue">Ուշացած</option>
              <option value="today">Այսօր</option>
              <option value="tomorrow">Վաղը</option>
              <option value="this_week">Այս շաբաթ</option>
              <option value="next_7_days">Հաջորդ 7 օրը</option>
              <option value="no_deadline">Առանց վերջնաժամկետի</option>
            </select>
            <select v-model="filters.creator_id" class="control">
              <option value="">Բոլոր ստեղծողները</option>
              <option v-for="creator in options.creators || []" :key="creator.id" :value="String(creator.id)">{{ creator.name }}</option>
            </select>

            <select v-model="filters.assignment" class="control">
              <option value="">Նշանակման բոլոր վիճակները</option>
              <option value="assigned">Նշանակված է</option>
              <option value="unassigned">Չի նշանակված</option>
            </select>
            <select v-model="filters.confirmation" class="control">
              <option value="">Admin հաստատման բոլոր վիճակները</option>
              <option value="waiting">Սպասում է հաստատման</option>
              <option value="confirmed">Հաստատված է</option>
            </select>
            <label class="date-control"><span>Ստեղծվել է՝ սկսած</span><input v-model="filters.created_from" type="date" /></label>
            <label class="date-control"><span>Ստեղծվել է՝ մինչև</span><input v-model="filters.created_to" type="date" /></label>
            <label class="date-control"><span>Ավարտ՝ սկսած</span><input v-model="filters.finish_from" type="date" /></label>
            <label class="date-control"><span>Ավարտ՝ մինչև</span><input v-model="filters.finish_to" type="date" /></label>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" class="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" :disabled="loading" @click="loadPreview(1)">Կիրառել ֆիլտրերը</button>
            <button type="button" class="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="resetFilters">Վերակայել</button>
          </div>
        </div>

        <div class="grid gap-4 border-b border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/30 sm:grid-cols-4 sm:p-6">
          <div><p class="stat-label">Արդյունքներ</p><p class="stat-value">{{ pagination.total || 0 }}</p></div>
          <div><p class="stat-label">Այս էջում</p><p class="stat-value">{{ orders.length }}</p></div>
          <div><p class="stat-label">Ուշացած preview-ում</p><p class="stat-value text-rose-600 dark:text-rose-300">{{ previewOverdueCount }}</p></div>
          <div><p class="stat-label">Չնշանակված քայլերով</p><p class="stat-value text-amber-600 dark:text-amber-300">{{ previewUnassignedCount }}</p></div>
        </div>

        <div class="relative min-h-[260px]">
          <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-sm dark:bg-slate-900/75"><span class="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950 dark:border-slate-700 dark:border-t-white"></span></div>

          <div v-if="orders.length" class="hidden overflow-x-auto lg:block">
            <table class="w-full min-w-[980px] text-left">
              <thead class="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-950/40">
                <tr><th class="px-6 py-3.5">Պատվեր</th><th class="px-4 py-3.5">Հաճախորդ</th><th class="px-4 py-3.5">Արտադրամաս / աշխատակից</th><th class="px-4 py-3.5">Վերջնաժամկետ</th><th class="px-6 py-3.5">Status</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="order in orders" :key="order.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                  <td class="px-6 py-4"><p class="text-xs font-bold text-slate-900 dark:text-white">#{{ order.order_number?.number || order.id }}</p><p class="mt-1 max-w-[240px] truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{{ order.name || '—' }}</p></td>
                  <td class="px-4 py-4"><p class="max-w-[180px] truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{{ clientName(order) }}</p><p class="mt-1 max-w-[180px] truncate text-[10px] text-slate-400">{{ clientEmail(order) }}</p></td>
                  <td class="px-4 py-4"><div class="flex max-w-[310px] flex-wrap gap-1.5"><span v-for="fo in order.factory_orders || []" :key="fo.id" class="rounded-lg bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ fo.factory?.name || '—' }} · {{ fo.operator?.name || 'չնշանակված' }}</span></div></td>
                  <td class="px-4 py-4"><span class="rounded-full px-2.5 py-1 text-[10px] font-bold" :class="deadlineClass(order)">{{ deadlineLabel(order) }}</span></td>
                  <td class="px-6 py-4"><span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ order.status || 'pending' }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="orders.length" class="space-y-3 p-4 lg:hidden">
            <article v-for="order in orders" :key="order.id" class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div class="flex items-start justify-between gap-3"><div class="min-w-0"><p class="text-[10px] font-bold text-slate-400">#{{ order.order_number?.number || order.id }}</p><p class="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">{{ order.name || '—' }}</p><p class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{{ clientName(order) }}</p></div><span class="shrink-0 rounded-full px-2 py-1 text-[9px] font-bold" :class="deadlineClass(order)">{{ deadlineLabel(order) }}</span></div>
              <div class="mt-3 flex flex-wrap gap-1.5"><span v-for="fo in order.factory_orders || []" :key="fo.id" class="rounded-lg bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ fo.factory?.name || '—' }} · {{ fo.operator?.name || 'չնշ.' }}</span></div>
            </article>
          </div>

          <div v-if="!loading && !orders.length" class="flex min-h-[260px] flex-col items-center justify-center px-6 text-center"><div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg font-black text-slate-400 dark:bg-slate-800">0</div><p class="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">Արդյունք չկա</p><p class="mt-1 text-xs text-slate-400">Փոխեք հաշվետվության ֆիլտրերը։</p></div>
        </div>

        <div v-if="pagination.last_page > 1" class="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-xs dark:border-slate-800 sm:px-6">
          <span class="text-slate-500 dark:text-slate-400">{{ pagination.from || 0 }}–{{ pagination.to || 0 }} / {{ pagination.total || 0 }}</span>
          <div class="flex gap-1"><button class="page-btn" :disabled="pagination.current_page <= 1" @click="loadPreview(pagination.current_page - 1)">‹</button><button class="page-btn" :disabled="pagination.current_page >= pagination.last_page" @click="loadPreview(pagination.current_page + 1)">›</button></div>
        </div>
      </section>

      <section class="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-800 dark:border-blue-950/60 dark:bg-blue-950/20 dark:text-blue-200">
        CSV export-ը ներառում է ամբողջ ֆիլտրված արդյունքը, ոչ միայն preview-ի ընթացիկ էջը։ Armenian տեքստը Excel-ում ճիշտ բացվելու համար export-ը UTF‑8 BOM-ով է։
      </section>
    </div>
  </main>
</template>

<script>
const emptyFilters = () => ({
  search: '', factory_id: '', operator_id: '', creator_id: '', order_status: '', factory_status: '', time_range: '', assignment: '', confirmation: '', created_from: '', created_to: '', finish_from: '', finish_to: '',
})

export default {
  name: 'AdminReports',
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
  data() {
    return {
      loading: false,
      exporting: false,
      options: { factories: [], operators: [], factory_statuses: [], creators: [], order_statuses: [] },
      summary: {},
      filters: emptyFilters(),
      orders: [],
      pagination: { current_page: 1, total: 0, per_page: 20, last_page: 1, from: 0, to: 0 },
      searchTimer: null,
    }
  },
  computed: {
    presets() {
      return [
        { key: 'overdue', label: 'Ուշացած պատվերներ', value: this.summary.overdue_orders || 0, hint: 'Ակտիվ պատվերներ անցած վերջնաժամկետով' },
        { key: 'today', label: 'Այսօր ավարտվող', value: this.summary.due_today || 0, hint: 'Այսօրվա վերջնաժամկետով աշխատանքներ' },
        { key: 'unassigned', label: 'Չնշանակված', value: this.summary.unassigned_factory_steps || 0, hint: 'Factory քայլեր առանց աշխատակցի' },
        { key: 'confirmation', label: 'Admin հաստատում', value: this.summary.awaiting_admin_confirmation || 0, hint: 'Ավարտված, բայց դեռ չհաստատված քայլեր' },
        { key: 'nodeadline', label: 'Առանց ժամկետի', value: this.summary.without_deadline || 0, hint: 'Ակտիվ պատվերներ առանց վերջնաժամկետի' },
      ]
    },
    operatorOptions() {
      if (!this.filters.factory_id) return this.options.operators || []
      return (this.options.operators || []).filter((row) => String(row.factory_id) === String(this.filters.factory_id))
    },
    activeFilterCount() {
      return Object.values(this.filters).filter((value) => String(value || '').trim() !== '').length
    },
    previewOverdueCount() {
      return this.orders.filter((order) => this.isOverdue(order)).length
    },
    previewUnassignedCount() {
      return this.orders.filter((order) => (order.factory_orders || []).some((fo) => !fo.operator_id)).length
    },
  },
  watch: {
    'filters.search'() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.loadPreview(1), 400)
    },
  },
  async created() {
    await this.loadOptions()
    await this.loadPreview(1)
  },
  beforeDestroy() {
    clearTimeout(this.searchTimer)
  },
  methods: {
    async loadOptions() {
      try {
        const { data } = await this.$axios.get('/api/admin/dashboard')
        this.options = data.filters || this.options
        this.summary = data.summary || {}
      } catch (error) {
        this.$notify?.({ type: 'error', text: 'Չհաջողվեց բեռնել հաշվետվության ընտրանքները' })
      }
    },
    cleanParams(extra = {}) {
      const params = { ...this.filters, ...extra }
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || typeof params[key] === 'undefined') delete params[key]
      })
      return params
    },
    async loadPreview(page = 1) {
      this.loading = true
      try {
        const { data } = await this.$axios.get('/api/admin/dashboard/orders', { params: this.cleanParams({ page, per_page: 20, sort: 'newest' }) })
        this.orders = data.orders || []
        this.pagination = data.pagination || this.pagination
      } catch (error) {
        this.orders = []
        this.$notify?.({ type: 'error', text: error?.response?.data?.message || 'Չհաջողվեց բեռնել հաշվետվությունը' })
      } finally {
        this.loading = false
      }
    },
    async exportCsv() {
      this.exporting = true
      try {
        const response = await this.$axios.get('/api/admin/dashboard/orders/export', {
          params: this.cleanParams(),
          responseType: 'blob',
        })
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        const disposition = response.headers?.['content-disposition'] || ''
        const match = disposition.match(/filename="?([^";]+)"?/i)
        link.href = url
        link.download = match?.[1] || `metalworks-orders-${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        this.$notify?.({ type: 'error', text: 'Չհաջողվեց արտահանել CSV-ը' })
      } finally {
        this.exporting = false
      }
    },
    applyPreset(key) {
      this.filters = emptyFilters()
      if (key === 'overdue') this.filters.time_range = 'overdue'
      if (key === 'today') this.filters.time_range = 'today'
      if (key === 'unassigned') this.filters.assignment = 'unassigned'
      if (key === 'confirmation') this.filters.confirmation = 'waiting'
      if (key === 'nodeadline') this.filters.time_range = 'no_deadline'
      this.loadPreview(1)
    },
    presetClass(key) {
      const active = (key === 'overdue' && this.filters.time_range === 'overdue') || (key === 'today' && this.filters.time_range === 'today') || (key === 'unassigned' && this.filters.assignment === 'unassigned') || (key === 'confirmation' && this.filters.confirmation === 'waiting') || (key === 'nodeadline' && this.filters.time_range === 'no_deadline')
      return active ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
    },
    resetFilters() {
      this.filters = emptyFilters()
      this.loadPreview(1)
    },
    onFactoryChange() {
      if (this.filters.operator_id) {
        const valid = this.operatorOptions.some((row) => String(row.id) === String(this.filters.operator_id))
        if (!valid) this.filters.operator_id = ''
      }
    },
    clientName(order) {
      return order.client?.user?.name || order.user?.name || '—'
    },
    clientEmail(order) {
      return order.client?.user?.email || order.user?.email || ''
    },
    finishDate(order) {
      const value = order.dates?.finish_date
      if (!value) return null
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? null : date
    },
    isOverdue(order) {
      const date = this.finishDate(order)
      if (!date || ['completed', 'canceled', 'cancelled'].includes(order.status)) return false
      return date < new Date()
    },
    deadlineLabel(order) {
      const date = this.finishDate(order)
      if (!date) return 'Ժամկետ չկա'
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const deadline = new Date(date); deadline.setHours(0, 0, 0, 0)
      const diff = Math.round((deadline - today) / 86400000)
      if (diff < 0 && !['completed', 'canceled', 'cancelled'].includes(order.status)) return `${Math.abs(diff)} օր ուշացած`
      if (diff === 0) return 'Այսօր'
      if (diff === 1) return 'Վաղը'
      if (diff > 1) return `${diff} օր մնաց`
      return 'Ավարտված ժամկետ'
    },
    deadlineClass(order) {
      const label = this.deadlineLabel(order)
      if (label.includes('ուշացած')) return 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
      if (label === 'Այսօր') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
      if (label === 'Վաղը') return 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300'
      if (label === 'Ժամկետ չկա') return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
    },
  },
}
</script>

<style scoped>
.control {
  @apply w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-slate-600;
}
.date-control {
  @apply flex min-w-0 flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-950;
}
.date-control input {
  @apply min-w-0 bg-transparent py-0.5 text-xs font-medium text-slate-700 outline-none dark:text-slate-200;
}
.stat-label { @apply text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400; }
.stat-value { @apply mt-1 text-xl font-black text-slate-900 dark:text-white; }
.page-btn { @apply flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800; }
</style>
