<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {{ t.title }}
          </h1>
          <InfoTooltip>{{ t.help }}</InfoTooltip>
        </div>

        <div class="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <select
            v-model="selectedFactoryId"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            @change="onFactoryChange"
          >
            <option disabled value="">{{ t.chooseFactory }}</option>
            <option v-for="factory in laserFactories" :key="factory.id" :value="String(factory.id)">
              {{ factory.name }}
            </option>
          </select>

          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            :disabled="loading || !selectedFactoryId"
            @click="loadOrders"
          >
            <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 6v5h-5M4 18v-5h5m10.5-2a8 8 0 00-13.8-3M4.5 14a8 8 0 0013.8 3" />
            </svg>
            {{ t.refresh }}
          </button>
        </div>
      </section>

      <section class="grid gap-3 sm:grid-cols-3">
        <div class="metric-card"><p class="metric-label">{{ t.factory }}</p><p class="metric-value text-base">{{ selectedFactoryName }}</p></div>
        <div class="metric-card"><p class="metric-label">{{ t.orders }}</p><p class="metric-value">{{ filteredOrders.length }}</p></div>
        <div class="metric-card"><p class="metric-label">{{ t.editing }}</p><p class="metric-value text-base">{{ t.managerFullAccess }}</p></div>
      </section>

      <section class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ t.factoryOrders }}</h2>
          <div class="relative w-full sm:w-80">
            <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0Z" />
            </svg>
            <input v-model="search" type="text" class="control pr-10" :placeholder="t.search" />
          </div>
        </div>

        <div v-if="loading" class="flex min-h-[280px] items-center justify-center text-sm font-semibold text-slate-400">
          <span class="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700 dark:border-slate-700 dark:border-t-white"></span>
          {{ t.loading }}
        </div>

        <div v-else-if="!selectedFactoryId" class="flex min-h-[260px] items-center justify-center px-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {{ t.chooseFactoryFirst }}
        </div>

        <div v-else-if="!filteredOrders.length" class="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">0</div>
          <p class="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">{{ t.noOrders }}</p>
        </div>

        <template v-else>
          <div class="hidden overflow-x-auto md:block">
            <table class="w-full min-w-[980px] text-left">
              <thead class="bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-950/40">
                <tr>
                  <th class="px-6 py-3.5">{{ t.order }}</th>
                  <th class="px-4 py-3.5">{{ t.code }}</th>
                  <th class="px-4 py-3.5">{{ t.name }}</th>
                  <th class="px-4 py-3.5">{{ t.operator }}</th>
                  <th class="px-4 py-3.5">{{ t.status }}</th>
                  <th class="px-6 py-3.5 text-right">{{ t.actions }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="order in filteredOrders" :key="order.id" class="transition hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                  <td class="px-6 py-4 text-xs font-black text-slate-900 dark:text-white">{{ order.order_number?.number || `#${order.id}` }}</td>
                  <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{{ order.prefix_code?.code || '—' }}</td>
                  <td class="max-w-xs px-4 py-4 text-xs font-semibold text-slate-700 dark:text-slate-200"><span class="block truncate">{{ order.name || '—' }}</span></td>
                  <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{{ factoryOrder(order)?.operator?.name || t.unassigned }}</td>
                  <td class="px-4 py-4"><span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ statusLabel(factoryOrder(order)?.status) }}</span></td>
                  <td class="px-6 py-4 text-right whitespace-nowrap">
                    <button class="mr-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="openDetails(order)">{{ t.view }}</button>
                    <button class="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950" @click="openEdit(order)">{{ t.edit }}</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="space-y-3 p-4 md:hidden">
            <article v-for="order in filteredOrders" :key="order.id" class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0"><p class="text-xs font-black text-slate-900 dark:text-white">{{ order.order_number?.number || `#${order.id}` }}</p><p class="mt-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{{ order.name || '—' }}</p></div>
                <span class="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ statusLabel(factoryOrder(order)?.status) }}</span>
              </div>
              <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">{{ t.operator }}՝ {{ factoryOrder(order)?.operator?.name || t.unassigned }}</p>
              <div class="mt-4 flex justify-end gap-2"><button class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300" @click="openDetails(order)">{{ t.view }}</button><button class="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-950" @click="openEdit(order)">{{ t.edit }}</button></div>
            </article>
          </div>
        </template>
      </section>
    </div>

    <OrderActionModal
      :is-open="isEditOpen"
      :action-options="actionOptions"
      :cancel-reasons="cancelReasons"
      :today-formatted="todayFormatted"
      :tomorrow-date="tomorrowDate"
      @close="closeEdit"
      @confirm="saveStatus"
    />

    <div v-if="isDetailsOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" @click.self="isDetailsOpen = false">
      <div class="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-7">
        <button class="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" @click="isDetailsOpen = false">✕</button>
        <LaserOrderDetailsPanel :details="selectedOrder" :dxf-url="dxfUrl" @view-file="viewFile" @download-file="downloadFile" @close-dxf="dxfUrl = ''" />
      </div>
    </div>

    <notifications />
  </main>
</template>

<script>
import { mapActions } from 'vuex'
import OrderActionModal from '@/components/factory/OrderActionModal.vue'
import LaserOrderDetailsPanel from '@/components/factory/laser/LaserOrderDetailsPanel.vue'

const COPY = {
  hy: { title: 'Լազերային կտրման կառավարում', help: 'Մենեջերը կարող է ընտրել լազերային արտադրամասը, դիտել բոլոր բաց պատվերները և փոխել դրանց կարգավիճակը՝ անկախ նշանակված օպերատորից։', chooseFactory: 'Ընտրել արտադրամաս', refresh: 'Թարմացնել', factory: 'Արտադրամաս', orders: 'Պատվերներ', editing: 'Փոփոխում', managerFullAccess: 'Մենեջերի հասանելիություն', factoryOrders: 'Արտադրամասի պատվերներ', search: 'Համար, անուն, կոդ...', loading: 'Բեռնվում է...', chooseFactoryFirst: 'Ընտրեք արտադրամասը։', noOrders: 'Պատվեր չի գտնվել', order: 'Պատվեր', code: 'Կոդ', name: 'Անվանում', operator: 'Օպերատոր', status: 'Կարգավիճակ', actions: 'Գործողություններ', unassigned: 'Չնշված', view: 'Դիտել', edit: 'Փոխել', saved: 'Պատվերը թարմացվեց', saveError: 'Չհաջողվեց թարմացնել պատվերը' },
  ru: { title: 'Управление лазерной резкой', help: 'Менеджер может выбрать лазерный цех, просматривать все открытые заказы и менять их статус независимо от назначенного оператора.', chooseFactory: 'Выбрать цех', refresh: 'Обновить', factory: 'Цех', orders: 'Заказы', editing: 'Изменение', managerFullAccess: 'Доступ менеджера', factoryOrders: 'Заказы цеха', search: 'Номер, название, код...', loading: 'Загрузка...', chooseFactoryFirst: 'Выберите цех.', noOrders: 'Заказы не найдены', order: 'Заказ', code: 'Код', name: 'Название', operator: 'Оператор', status: 'Статус', actions: 'Действия', unassigned: 'Не назначен', view: 'Просмотр', edit: 'Изменить', saved: 'Заказ обновлён', saveError: 'Не удалось обновить заказ' },
  en: { title: 'Laser cutting management', help: 'Managers can select a laser workshop, view all open orders and change their status regardless of the assigned operator.', chooseFactory: 'Choose workshop', refresh: 'Refresh', factory: 'Workshop', orders: 'Orders', editing: 'Editing', managerFullAccess: 'Manager access', factoryOrders: 'Workshop orders', search: 'Number, name, code...', loading: 'Loading...', chooseFactoryFirst: 'Choose a workshop.', noOrders: 'No orders found', order: 'Order', code: 'Code', name: 'Name', operator: 'Operator', status: 'Status', actions: 'Actions', unassigned: 'Unassigned', view: 'View', edit: 'Edit', saved: 'Order updated', saveError: 'Could not update order' },
}

export default {
  name: 'ManagerLaserFactoryPage',
  components: { OrderActionModal, LaserOrderDetailsPanel },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
  data() {
    return {
      factories: [], selectedFactoryId: '', orders: [], search: '', loading: false,
      isEditOpen: false, isDetailsOpen: false, selectedOrder: {}, dxfUrl: '',
      actionOptions: [], statusOptions: [],
      cancelReasons: [
        { label: 'Ոչ հստակ պատվեր', value: 'unclear' },
        { label: 'Սխալ տվյալներ', value: 'wrong_data' },
        { label: 'Նյութի բացակայություն', value: 'no_material' },
        { label: 'Այլ պատճառ', value: 'other' },
      ],
    }
  },
  computed: {
    locale() { const l = String(this.$i18n?.locale || 'hy').split('-')[0]; return ['hy','ru','en'].includes(l) ? l : 'hy' },
    t() { return COPY[this.locale] || COPY.hy },
    laserFactories() {
      return this.factories
        .filter((f) => ['DXF', 'IQS'].includes(String(f.value || '').toUpperCase()) || String(f.name || '').toLowerCase().includes('laser'))
        .sort((a, b) => (String(a.value).toUpperCase() === 'DXF' ? -1 : 0) - (String(b.value).toUpperCase() === 'DXF' ? -1 : 0))
    },
    selectedFactoryName() { return this.laserFactories.find((f) => String(f.id) === String(this.selectedFactoryId))?.name || '—' },
    filteredOrders() {
      const q = this.search.trim().toLowerCase()
      if (!q) return this.orders
      return this.orders.filter((order) => [order.order_number?.number, order.name, order.prefix_code?.code, order.description].some((v) => String(v || '').toLowerCase().includes(q)))
    },
    todayFormatted() { return this.$formatDate(new Date(), 'dd.MM.yyyy') },
    tomorrowDate() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] },
  },
  async mounted() {
    await Promise.all([this.loadFactories(), this.loadActionOptions()])
  },
  methods: {
    ...mapActions('factory', ['downloadUploadedFile']),
    async loadFactories() {
      try {
        const { data } = await this.$axios.get('/api/factories/factory')
        this.factories = Array.isArray(data) ? data : []
        const queryId = String(this.$route.query.factory_id || '')
        const validQuery = this.laserFactories.some((f) => String(f.id) === queryId)
        this.selectedFactoryId = validQuery ? queryId : String(this.laserFactories[0]?.id || '')
        if (this.selectedFactoryId) await this.loadOrders()
      } catch (e) {
        this.factories = []
      }
    },
    async loadActionOptions() {
      try {
        const [actions, filters] = await Promise.all([
          this.$axios.get('/api/factories/factory-order-actions'),
          this.$axios.get('/api/factories/factory-order-filters'),
        ])
        this.actionOptions = Array.isArray(actions.data) ? actions.data : []
        this.statusOptions = Array.isArray(filters.data) ? filters.data : []
      } catch (e) {}
    },
    async onFactoryChange() {
      this.$router.replace({ path: this.$route.path, query: { ...this.$route.query, factory_id: this.selectedFactoryId } }).catch(() => {})
      await this.loadOrders()
    },
    async loadOrders() {
      if (!this.selectedFactoryId) return
      this.loading = true
      try {
        const { data } = await this.$axios.get(`/api/factories/factory/${this.selectedFactoryId}`)
        this.orders = Array.isArray(data?.orders) ? data.orders : []
      } catch (e) {
        this.orders = []
      } finally { this.loading = false }
    },
    factoryOrder(order) {
      return (order?.factory_orders || []).find((item) => String(item.factory_id) === String(this.selectedFactoryId)) || null
    },
    statusLabel(status) {
      const value = String(status || 'pending').toLowerCase()
      const option = this.statusOptions.find((item) => String(item.value || '').toLowerCase() === value)
      return option?.label || status || (this.locale === 'ru' ? 'Без статуса' : this.locale === 'en' ? 'No status' : 'Առանց կարգավիճակի')
    },
    openDetails(order) { this.selectedOrder = order; this.isDetailsOpen = true; this.dxfUrl = '' },
    openEdit(order) { this.selectedOrder = order; this.isEditOpen = true },
    closeEdit() { this.isEditOpen = false; this.selectedOrder = {} },
    async saveStatus(payload) {
      if (!this.selectedOrder?.id || !this.selectedFactoryId) return
      try {
        await this.$axios.put(`/api/factories/updateOrder/${this.selectedOrder.id}`, {
          factory_id: this.selectedFactoryId,
          factory_order: {
            status: payload.status,
            canceling: payload.canceling,
            cancel_date: payload.cancel_date,
            operator_finish_date: payload.operator_finish_date,
          },
        })
        this.$notify?.({ type: 'success', text: this.t.saved })
        this.closeEdit()
        await this.loadOrders()
      } catch (e) {
        this.$notify?.({ type: 'error', text: e.response?.data?.message || this.t.saveError })
      }
    },
    viewFile(path) { this.dxfUrl = path },
    async downloadFile(file) { await this.downloadUploadedFile(file) },
  },
}
</script>

<style scoped>
.metric-card { @apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900; }
.metric-label { @apply text-[10px] font-black uppercase tracking-[0.12em] text-slate-400; }
.metric-value { @apply mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white; }
.control { @apply w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200; }
</style>
