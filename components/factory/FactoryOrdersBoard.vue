<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">{{ title }}</h1>
          <InfoTooltip>{{ helpText }}</InfoTooltip>
        </div>
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300" :disabled="loading || !currentFactoryId" @click="reload">
          <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 6v5h-5M4 18v-5h5m10.5-2a8 8 0 00-13.8-3M4.5 14a8 8 0 0013.8 3" /></svg>
          {{ t.refresh }}
        </button>
      </section>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="metric"><p class="metric-label">{{ t.total }}</p><p class="metric-value">{{ allOrders.length }}</p></div>
        <div class="metric"><p class="metric-label">{{ t.unassigned }}</p><p class="metric-value">{{ unassignedCount }}</p></div>
        <div class="metric"><p class="metric-label">{{ t.active }}</p><p class="metric-value">{{ activeCount }}</p></div>
        <div class="metric"><p class="metric-label">{{ t.finished }}</p><p class="metric-value">{{ finishedCount }}</p></div>
      </section>

      <div v-if="!currentFactoryId" class="rounded-[28px] border border-amber-200 bg-amber-50 p-8 text-center text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">{{ t.noFactory }}</div>

      <template v-else>
        <OrdersToolbar :search="searchable" :status-options="localizedStatusOptions" :selected-statuses="selectedStatuses" @update:search="(v) => (searchable = v)" @update:selected-statuses="(v) => (selectedStatuses = v)" />

        <div v-if="loading" class="flex min-h-[300px] items-center justify-center text-sm font-semibold text-slate-400"><span class="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700 dark:border-slate-700 dark:border-t-white"></span>{{ t.loading }}</div>

        <div v-else-if="!filteredBySearch.length" class="rounded-[28px] border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">0</div>
          <p class="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">{{ t.noOrders }}</p>
          <p class="mt-1 text-xs text-slate-400">{{ t.noOrdersHint }}</p>
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <section v-for="column in boardColumns" :key="column.id" class="flex min-h-[440px] flex-col rounded-[24px] border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60" @dragover.prevent @drop="onDrop(column)">
            <div class="mb-3 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2"><span class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" :style="{ backgroundColor: column.color || '#64748b' }">{{ column.icon }}</span><h2 class="text-sm font-black text-slate-800 dark:text-slate-100">{{ column.label }}</h2></div>
              <span class="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">{{ column.orders.length }}</span>
            </div>
            <div class="space-y-3">
              <OrderCard v-for="order in column.orders" :key="order.id" :order="order" :factory-id="currentFactoryId" :current-user-id="currentUserId" @drag-start="onDragStart(order)" @view-details="openDetails" @edit="openEdit" />
              <div v-if="!column.orders.length" class="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-5 text-center text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-950/30">{{ t.dropHere }}</div>
            </div>
          </section>
        </div>
      </template>
    </div>

    <OrderActionModal :is-open="isModal" :action-options="actionOptions" :cancel-reasons="cancelReasons" :today-formatted="todayFormatted" :tomorrow-date="tomorrowDate" @close="closeModal" @confirm="handleModalConfirm" />

    <div v-if="isOpenDetails" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" @click.self="isOpenDetails = false">
      <div class="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-7">
        <button class="absolute right-4 top-4 z-10 rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" @click="isOpenDetails = false">✕</button>
        <component :is="detailsComponent" :details="details" :dxf-url="dxfUrl" @view-file="viewFile" @download-file="downloadFile" @close-dxf="dxfUrl = ''" />
      </div>
    </div>

    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import OrdersToolbar from '@/components/factory/OrdersToolbar.vue'
import OrderCard from '@/components/factory/OrderCard.vue'
import OrderActionModal from '@/components/factory/OrderActionModal.vue'
import FactoryOrderDetailsPanel from '@/components/factory/FactoryOrderDetailsPanel.vue'
import LaserOrderDetailsPanel from '@/components/factory/laser/LaserOrderDetailsPanel.vue'
import BendOrderDetailsPanel from '@/components/factory/bend/BendOrderDetailsPanel.vue'

const COPY = {
  hy: { refresh: 'Թարմացնել', total: 'Ընդամենը', unassigned: 'Չվերցված', active: 'Ընթացքում', finished: 'Ավարտված', noFactory: 'Ձեր հաշվին արտադրամաս նշանակված չէ։ Դիմեք մենեջերին կամ ադմինիստրատորին։', loading: 'Բեռնվում է...', noOrders: 'Պատվերներ չկան', noOrdersHint: 'Նոր պատվերները այստեղ կհայտնվեն, երբ նշանակվեն այս արտադրամասին։', dropHere: 'Քաշեք պատվերը այստեղ', loadError: 'Չհաջողվեց բեռնել արտադրամասի պատվերները', saved: 'Պատվերը թարմացվեց', saveError: 'Չհաջողվեց թարմացնել պատվերը', taken: 'Պատվերը զբաղված է այլ օպերատորի կողմից', completedLocked: 'Ավարտված պատվերը օպերատորը չի կարող փոխել', titles: { laser: 'Լազերային կտրման աշխատանքներ', bend: 'Կռման աշխատանքներ', powder: 'Փոշեներկման աշխատանքներ', generic: 'Արտադրամասի աշխատանքներ' }, help: { laser: 'Դիտեք լազերային կտրման պատվերները, վերցրեք աշխատանքը և թարմացրեք ընթացքը։', bend: 'Դիտեք կռման պատվերները, վերցրեք աշխատանքը և թարմացրեք ընթացքը։', powder: 'Դիտեք փոշեներկման պատվերները, վերցրեք աշխատանքը և թարմացրեք ընթացքը։', generic: 'Դիտեք ձեր արտադրամասին նշանակված պատվերները և թարմացրեք ընթացքը։' }, status: { none: 'Առանց կարգավիճակի', confirmed: 'Կատարվում է', canceled: 'Մերժված', date_changed: 'Ժամկետը փոխված է', finished: 'Ավարտված', pending: 'Սպասում է', in_progress: 'Ընթացքում' } },
  ru: { refresh: 'Обновить', total: 'Всего', unassigned: 'Не взято', active: 'В работе', finished: 'Завершено', noFactory: 'К вашей учётной записи не привязан цех. Обратитесь к менеджеру или администратору.', loading: 'Загрузка...', noOrders: 'Заказов нет', noOrdersHint: 'Новые заказы появятся здесь после назначения этому цеху.', dropHere: 'Перетащите заказ сюда', loadError: 'Не удалось загрузить заказы цеха', saved: 'Заказ обновлён', saveError: 'Не удалось обновить заказ', taken: 'Заказ занят другим оператором', completedLocked: 'Оператор не может менять завершённый заказ', titles: { laser: 'Лазерная резка', bend: 'Гибка', powder: 'Порошковая покраска', generic: 'Работа цеха' }, help: { laser: 'Просматривайте заказы лазерной резки, принимайте работу и обновляйте её ход.', bend: 'Просматривайте заказы на гибку, принимайте работу и обновляйте её ход.', powder: 'Просматривайте заказы порошковой покраски, принимайте работу и обновляйте её ход.', generic: 'Просматривайте заказы вашего цеха и обновляйте ход работы.' }, status: { none: 'Без статуса', confirmed: 'В работе', canceled: 'Отклонён', date_changed: 'Срок изменён', finished: 'Завершён', pending: 'Ожидает', in_progress: 'В работе' } },
  en: { refresh: 'Refresh', total: 'Total', unassigned: 'Unassigned', active: 'In progress', finished: 'Finished', noFactory: 'No workshop is assigned to your account. Contact a manager or administrator.', loading: 'Loading...', noOrders: 'No orders', noOrdersHint: 'New orders will appear here when they are assigned to this workshop.', dropHere: 'Drop order here', loadError: 'Could not load workshop orders', saved: 'Order updated', saveError: 'Could not update order', taken: 'Order is assigned to another operator', completedLocked: 'Operators cannot edit a finished order', titles: { laser: 'Laser cutting', bend: 'Bending', powder: 'Powder coating', generic: 'Workshop work' }, help: { laser: 'Review laser cutting orders, take work and update progress.', bend: 'Review bending orders, take work and update progress.', powder: 'Review powder coating orders, take work and update progress.', generic: 'Review orders assigned to your workshop and update progress.' }, status: { none: 'No status', confirmed: 'In progress', canceled: 'Rejected', date_changed: 'Date changed', finished: 'Finished', pending: 'Pending', in_progress: 'In progress' } },
}

export default {
  name: 'FactoryOrdersBoard',
  components: { OrdersToolbar, OrderCard, OrderActionModal, FactoryOrderDetailsPanel, LaserOrderDetailsPanel, BendOrderDetailsPanel },
  props: { workspaceType: { type: String, default: 'generic' } },
  data() { return { searchable: '', selectedStatuses: [], loading: false, isModal: false, isOpenDetails: false, selectedOrder: {}, details: {}, dxfUrl: '', currentFactoryId: null, currentUserId: null, statusOptions: [], actionOptions: [], draggingOrder: null, cancelReasons: [{ value: 'unclear' }, { value: 'wrong_data' }, { value: 'no_material' }, { value: 'other' }] } },
  computed: {
    ...mapGetters('factory', ['getOrderByFactories']),
    locale() { const code = String(this.$i18n?.locale || 'hy').toLowerCase().split('-')[0]; return ['hy','ru','en'].includes(code) ? code : 'hy' },
    t() { return COPY[this.locale] || COPY.hy },
    title() { return this.t.titles[this.workspaceType] || this.t.titles.generic },
    helpText() { return this.t.help[this.workspaceType] || this.t.help.generic },
    detailsComponent() { return this.workspaceType === 'laser' ? 'LaserOrderDetailsPanel' : this.workspaceType === 'bend' ? 'BendOrderDetailsPanel' : 'FactoryOrderDetailsPanel' },
    allOrders() { const orders = this.getOrderByFactories?.orders; return Array.isArray(orders) ? orders : [] },
    localizedStatusOptions() { return (this.statusOptions || []).map((item) => ({ ...item, label: this.t.status[item.value] || item.label })) },
    filteredByStatus() { if (!this.selectedStatuses.length) return this.allOrders; return this.allOrders.filter((order) => this.selectedStatuses.includes(this.factoryOrder(order)?.status || 'null')) },
    filteredBySearch() { const q = this.searchable.trim().toLowerCase(); if (!q) return this.filteredByStatus; return this.filteredByStatus.filter((o) => [o.order_number?.number,o.name,o.description,o.prefix_code?.code].some((v) => String(v || '').toLowerCase().includes(q))) },
    boardColumns() { const base = [{ id: 'no_status', label: this.t.status.none, value: 'null', icon: '•', color: '#94a3b8' }]; const dynamic = this.localizedStatusOptions.map((s) => ({ id: s.value, label: s.label, value: s.value, icon: this.statusIcon(s.icon), color: s.color || '#64748b' })); return [...base, ...dynamic].map((col) => ({ ...col, orders: this.filteredBySearch.filter((order) => (this.factoryOrder(order)?.status || 'null') === col.value) })) },
    unassignedCount() { return this.allOrders.filter((o) => !this.factoryOrder(o)?.operator_id).length },
    activeCount() { return this.allOrders.filter((o) => ['confirmed','in_progress','date_changed'].includes(String(this.factoryOrder(o)?.status || '').toLowerCase())).length },
    finishedCount() { return this.allOrders.filter((o) => ['finished','completed'].includes(String(this.factoryOrder(o)?.status || '').toLowerCase())).length },
    todayFormatted() { return this.$formatDate(new Date(), 'dd.MM.yyyy') },
    tomorrowDate() { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0] },
  },
  async mounted() { this.currentFactoryId = this.$auth.user?.factory_id || null; this.currentUserId = this.$auth.user?.id || null; await this.loadOptions(); if (this.currentFactoryId) await this.reload() },
  methods: {
    ...mapActions('factory', ['fetchOrdersByFactory','doneFinishedOrder','downloadUploadedFile']),
    async loadOptions() { try { const [a,f] = await Promise.all([this.$axios.get('/api/factories/factory-order-actions'),this.$axios.get('/api/factories/factory-order-filters')]); this.actionOptions = Array.isArray(a.data) ? a.data : []; this.statusOptions = Array.isArray(f.data) ? f.data : [] } catch (e) {} },
    async reload() { if (!this.currentFactoryId) return; this.loading = true; try { await this.fetchOrdersByFactory(this.currentFactoryId) } catch (e) { this.$notify?.({ type:'error', text:this.t.loadError }) } finally { this.loading = false } },
    factoryOrder(order) { const list = order?.factory_orders || []; const found = list.find((fo) => String(fo.factory_id) === String(this.currentFactoryId)); if (found) return { ...found, status: !found.status || found.status === 'pending' ? null : found.status }; if ((order?.factories || []).some((f) => String(f.id) === String(this.currentFactoryId))) return { factory_id:this.currentFactoryId,status:null,operator_id:null }; return null },
    statusIcon(icon) { if (['Check','Check Circle'].includes(icon)) return '✓'; if (icon === 'Cross') return '✕'; if (icon === 'Refresh') return '⟳'; return '•' },
    openDetails(order) { this.details = order; this.isOpenDetails = true; this.dxfUrl = '' },
    openEdit(order) { const fo = this.factoryOrder(order); if (['finished','completed'].includes(String(fo?.status || '').toLowerCase())) return this.$notify?.({ type:'info', text:this.t.completedLocked }); if (fo?.operator_id && String(fo.operator_id) !== String(this.currentUserId)) return this.$notify?.({ type:'warning', text:this.t.taken }); this.selectedOrder = order; this.isModal = true },
    closeModal() { this.isModal = false; this.selectedOrder = {} },
    async handleModalConfirm(payload) { const success = await this.saveOrderStatus(this.selectedOrder, payload); if (success) { this.closeModal(); await this.reload() } },
    async saveOrderStatus(order, payload) { if (!order?.id) return false; const result = await this.doneFinishedOrder({ id: order.id, factory_id: this.currentFactoryId, factory_order: { status: payload.status ?? null, canceling: payload.canceling || '', cancel_date: payload.cancel_date || null, operator_finish_date: payload.operator_finish_date || null } }); this.$notify?.({ type: result ? 'success' : 'error', text: result ? this.t.saved : this.t.saveError }); return Boolean(result) },
    onDragStart(order) { this.draggingOrder = order },
    async onDrop(column) { if (!this.draggingOrder) return; const fo = this.factoryOrder(this.draggingOrder); if (['finished','completed'].includes(String(fo?.status || '').toLowerCase())) { this.draggingOrder = null; return }; if (fo?.operator_id && String(fo.operator_id) !== String(this.currentUserId)) { this.$notify?.({ type:'warning', text:this.t.taken }); this.draggingOrder = null; return }; await this.saveOrderStatus(this.draggingOrder, { status: column.value === 'null' ? null : column.value }); this.draggingOrder = null; await this.reload() },
    viewFile(path) { this.dxfUrl = path },
    async downloadFile(file) { await this.downloadUploadedFile(file) },
  },
}
</script>

<style scoped>
.metric { @apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900; }.metric-label { @apply text-[10px] font-black uppercase tracking-[0.12em] text-slate-400; }.metric-value { @apply mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white; }
</style>
