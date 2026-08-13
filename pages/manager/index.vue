<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Operations</p>
          <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Պատվերների կառավարում</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Աշխատանքային պատկերը՝ միայն ձեզ տրված ֆունկցիաների սահմաններում։</p>
        </div>
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300" :disabled="loading" @click="refreshDashboard">
          <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 6v5h-5M4 18v-5h5m10.5-2a8 8 0 00-13.8-3M4.5 14a8 8 0 0013.8 3" /></svg>
          Թարմացնել
        </button>
      </section>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="metric-card">
          <div class="metric-icon bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-300">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 4h10a2 2 0 012 2v14H5V6a2 2 0 012-2Zm2 4h6M9 12h6M9 16h4" /></svg>
          </div>
          <div><p class="metric-label">Պատվերներ</p><p class="metric-value">{{ allOrders.length }}</p></div>
        </div>
        <div class="metric-card" :class="!$can('materials.view') ? 'opacity-55' : ''">
          <div class="metric-icon bg-violet-50 text-violet-700 dark:bg-violet-950/35 dark:text-violet-300">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m12 3 8 4-8 4-8-4 8-4Zm-8 9 8 4 8-4M4 17l8 4 8-4" /></svg>
          </div>
          <div><p class="metric-label">Նյութեր</p><p class="metric-value">{{ $can('materials.view') ? materials.length : '—' }}</p></div>
        </div>
        <div class="metric-card" :class="!$can('workers.view') ? 'opacity-55' : ''">
          <div class="metric-icon bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 12a4 4 0 100-8 4 4 0 000 8Zm-7 9a7 7 0 0114 0m2-8v6m-3-3h6" /></svg>
          </div>
          <div><p class="metric-label">Աշխատակիցներ</p><p class="metric-value">{{ $can('workers.view') ? workers.length : '—' }}</p></div>
        </div>
        <div class="metric-card">
          <div class="metric-icon bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-300">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0Z" /></svg>
          </div>
          <div><p class="metric-label">Ընթացիկ</p><p class="metric-value">{{ activeOrders }}</p></div>
        </div>
      </section>

      <section class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Orders</p>
            <h2 class="mt-1 text-lg font-black text-slate-900 dark:text-white">Վերջին պատվերները</h2>
          </div>
          <div class="relative w-full sm:w-80">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0Z" /></svg>
            <input v-model="searchable" type="text" class="control pl-10" placeholder="Համար, անուն, prefix..." />
          </div>
        </div>

        <div v-if="loading" class="flex min-h-[260px] items-center justify-center text-sm font-semibold text-slate-400">
          <span class="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700 dark:border-slate-700 dark:border-t-white"></span>Բեռնվում է...
        </div>

        <div v-else-if="!searchFilter.length" class="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">0</div>
          <p class="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Պատվեր չի գտնվել</p>
          <p class="mt-1 text-xs text-slate-400">Փոխեք որոնումը կամ սպասեք նոր պատվերի։</p>
        </div>

        <template v-else>
          <div class="hidden overflow-x-auto md:block">
            <table class="w-full min-w-[820px] text-left">
              <thead class="bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-950/40">
                <tr><th class="px-6 py-3.5">Պատվեր</th><th class="px-4 py-3.5">Prefix</th><th class="px-4 py-3.5">Անվանում</th><th class="px-4 py-3.5">Ժամկետ</th><th class="px-4 py-3.5">Status</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="order in searchFilter" :key="order.id" class="transition hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                  <td class="px-6 py-4 text-xs font-black text-slate-900 dark:text-white">{{ order.order_number?.number || `#${order.id}` }}</td>
                  <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{{ order.prefix_code?.code || '—' }}</td>
                  <td class="max-w-xs px-4 py-4 text-xs font-semibold text-slate-700 dark:text-slate-200"><span class="block truncate">{{ order.name || '—' }}</span></td>
                  <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{{ formatDate(order.dates?.finish_date) }}</td>
                  <td class="px-4 py-4"><span class="rounded-full px-2.5 py-1 text-[10px] font-bold" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="space-y-3 p-4 md:hidden">
            <article v-for="order in searchFilter" :key="order.id" class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0"><p class="text-xs font-black text-slate-900 dark:text-white">{{ order.order_number?.number || `#${order.id}` }}</p><p class="mt-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{{ order.name || '—' }}</p></div>
                <span class="rounded-full px-2 py-1 text-[9px] font-bold" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400"><span>Prefix՝ {{ order.prefix_code?.code || '—' }}</span><span class="text-right">{{ formatDate(order.dates?.finish_date) }}</span></div>
            </article>
          </div>
        </template>
      </section>
    </div>
    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'ManagerPage',
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
  data() {
    return { searchable: '', loading: false }
  },
  computed: {
    ...mapGetters('orders', ['orders']),
    ...mapGetters('materials', ['getMaterials']),
    ...mapGetters('workers', ['getWorkers']),
    allOrders() {
      return this.orders || []
    },
    materials() {
      return this.getMaterials || []
    },
    workers() {
      return this.getWorkers || []
    },
    activeOrders() {
      return this.allOrders.filter((order) => !['finished', 'completed', 'confirmed', 'canceled', 'cancelled'].includes(String(order.status || '').toLowerCase())).length
    },
    searchFilter() {
      const q = this.searchable.trim().toLowerCase()
      if (!q) return this.allOrders
      return this.allOrders.filter((order) => {
        const values = [order.order_number?.number, order.name, order.prefix_code?.code, order.description]
        return values.some((value) => String(value || '').toLowerCase().includes(q))
      })
    },
  },
  async mounted() {
    await this.refreshDashboard()
  },
  methods: {
    ...mapActions('orders', ['fetchOrders']),
    ...mapActions('materials', ['fetchMaterials']),
    ...mapActions('workers', ['fetchWorkers']),
    async refreshDashboard() {
      this.loading = true
      try {
        const tasks = [this.fetchOrders()]
        if (this.$can('materials.view')) tasks.push(this.fetchMaterials())
        if (this.$can('workers.view')) tasks.push(this.fetchWorkers())
        await Promise.all(tasks)
      } finally {
        this.loading = false
      }
    },
    formatDate(value) {
      if (!value) return '—'
      try {
        return new Intl.DateTimeFormat('hy-AM', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
      } catch (e) {
        return value
      }
    },
    statusLabel(status) {
      const value = String(status || 'pending').toLowerCase()
      const labels = { pending: 'Սպասում է', waiting: 'Սպասում է', in_progress: 'Ընթացքում', finished: 'Ավարտված', completed: 'Ավարտված', confirmed: 'Հաստատված', canceled: 'Չեղարկված', cancelled: 'Չեղարկված' }
      return labels[value] || status || 'Սպասում է'
    },
    statusClass(status) {
      const value = String(status || 'pending').toLowerCase()
      if (['finished', 'completed', 'confirmed'].includes(value)) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300'
      if (['canceled', 'cancelled'].includes(value)) return 'bg-rose-50 text-rose-700 dark:bg-rose-950/35 dark:text-rose-300'
      if (value === 'in_progress') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-300'
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-300'
    },
  },
}
</script>

<style scoped>
.metric-card { @apply flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900; }
.metric-icon { @apply flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl; }
.metric-label { @apply text-[10px] font-black uppercase tracking-[0.12em] text-slate-400; }
.metric-value { @apply mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white; }
.control { @apply w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200; }
</style>
