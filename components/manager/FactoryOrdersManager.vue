<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section
        class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div class="flex items-center gap-2">
          <h1
            class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl"
          >
            {{ title }}
          </h1>
          <InfoTooltip>{{ helpText }}</InfoTooltip>
        </div>
        <div class="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <select
            v-model="selectedFactoryId"
            :disabled="isSaving"
            class="control min-w-[220px]"
            @change="onFactoryChange"
          >
            <option disabled value="">{{ t.chooseFactory }}</option>
            <option
              v-for="factory in matchingFactories"
              :key="factory.id"
              :value="String(factory.id)"
            >
              {{ factory.name }}
            </option>
          </select>
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            :disabled="loading || !selectedFactoryId"
            @click="loadOrders"
          >
            {{ t.refresh }}
          </button>
        </div>
      </section>

      <section class="grid gap-3 sm:grid-cols-3">
        <div class="metric">
          <p class="metric-label">{{ t.factory }}</p>
          <p
            class="mt-2 truncate text-sm font-black text-slate-950 dark:text-white"
          >
            {{ selectedFactoryName }}
          </p>
        </div>
        <div class="metric">
          <p class="metric-label">{{ t.orders }}</p>
          <p class="metric-value">{{ filteredOrders.length }}</p>
        </div>
        <div class="metric">
          <p class="metric-label">{{ t.access }}</p>
          <p
            class="mt-2 text-sm font-black text-emerald-600 dark:text-emerald-300"
          >
            {{ t.fullAccess }}
          </p>
        </div>
      </section>

      <section
        class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div
          class="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <h2 class="text-lg font-black text-slate-900 dark:text-white">
            {{ t.factoryOrders }}
          </h2>
          <div class="relative w-full sm:w-80">
            <svg
              class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
                d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0Z"
              /></svg
            ><input
              v-model="search"
              type="text"
              class="control pr-10"
              :placeholder="t.search"
            />
          </div>
        </div>

        <div
          v-if="loading"
          class="flex min-h-[280px] items-center justify-center text-sm font-semibold text-slate-400"
        >
          {{ t.loading }}
        </div>
        <div
          v-else-if="!matchingFactories.length"
          class="flex min-h-[260px] items-center justify-center px-6 text-center text-sm text-slate-500 dark:text-slate-400"
        >
          {{ t.noFactory }}
        </div>
        <div
          v-else-if="!filteredOrders.length"
          class="flex min-h-[260px] flex-col items-center justify-center px-6 text-center"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800"
          >
            0
          </div>
          <p class="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
            {{ t.noOrders }}
          </p>
        </div>

        <template v-else>
          <div class="hidden overflow-x-auto md:block">
            <table class="w-full min-w-[980px] text-left">
              <thead
                class="bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-950/40"
              >
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
                <tr
                  v-for="order in filteredOrders"
                  :key="order.id"
                  class="transition hover:bg-slate-50/70 dark:hover:bg-slate-950/30"
                >
                  <td
                    class="px-6 py-4 text-xs font-black text-slate-900 dark:text-white"
                  >
                    {{ order.order_number?.number || `#${order.id}` }}
                  </td>
                  <td
                    class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400"
                  >
                    {{ order.prefix_code?.code || '—' }}
                  </td>
                  <td
                    class="max-w-xs px-4 py-4 text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <span class="block truncate">{{ order.name || '—' }}</span>
                  </td>
                  <td
                    class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400"
                  >
                    {{ factoryOrder(order)?.operator?.name || t.unassigned }}
                  </td>
                  <td class="px-4 py-4">
                    <span
                      class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >{{ statusLabel(factoryOrder(order)?.status) }}</span
                    >
                  </td>
                  <td class="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      class="mr-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                      :disabled="detailsLoading"
                      @click="openDetails(order)"
                    >
                      {{ t.view }}</button
                    ><button
                      class="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                      @click="openEdit(order)"
                    >
                      {{ t.edit }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="space-y-3 p-4 md:hidden">
            <article
              v-for="order in filteredOrders"
              :key="order.id"
              class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-xs font-black text-slate-900 dark:text-white">
                    {{ order.order_number?.number || `#${order.id}` }}
                  </p>
                  <p
                    class="mt-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    {{ order.name || '—' }}
                  </p>
                </div>
                <span
                  class="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >{{ statusLabel(factoryOrder(order)?.status) }}</span
                >
              </div>
              <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {{ t.operator }}՝
                {{ factoryOrder(order)?.operator?.name || t.unassigned }}
              </p>
              <div class="mt-4 flex justify-end gap-2">
                <button
                  class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  :disabled="detailsLoading"
                  @click="openDetails(order)"
                >
                  {{ t.view }}</button
                ><button
                  class="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-950"
                  @click="openEdit(order)"
                >
                  {{ t.edit }}
                </button>
              </div>
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
      :order="selectedOrder"
      :factory-order="factoryOrder(selectedOrder)"
      :initial-status="factoryOrder(selectedOrder)?.status || null"
      :initial-reason="factoryOrder(selectedOrder)?.canceling || ''"
      :initial-date="factoryOrder(selectedOrder)?.cancel_date || ''"
      :saving="isSaving"
      @close="closeEdit"
      @confirm="saveStatus"
    />

    <div
      v-if="isDetailsOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      @click.self="isDetailsOpen = false"
    >
      <div
        class="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-7"
      >
        <button
          class="absolute right-4 top-4 z-10 rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          @click="isDetailsOpen = false"
        >
          ✕
        </button>
        <TaskRoutingPanel
          :order="selectedOrder"
          class="mb-5"
          @updated="handleRoutingUpdated"
        />
        <component
          :is="detailsComponent"
          :details="selectedOrder"
          :dxf-url="dxfUrl"
          @view-file="viewFile"
          @download-file="downloadFile"
          @close-dxf="dxfUrl = ''"
        />
      </div>
    </div>
    <notifications />
  </main>
</template>

<script>
import { taskActionBody } from '@/utils/task-workflow'
import { mapActions } from 'vuex'
import OrderActionModal from '@/components/factory/OrderActionModal.vue'
import { localFactoryDate } from '@/utils/factory-order-status'
import LaserOrderDetailsPanel from '@/components/factory/laser/LaserOrderDetailsPanel.vue'
import BendOrderDetailsPanel from '@/components/factory/bend/BendOrderDetailsPanel.vue'
import FactoryOrderDetailsPanel from '@/components/factory/FactoryOrderDetailsPanel.vue'
import TaskRoutingPanel from '@/components/order/TaskRoutingPanel.vue'

const COPY = {
  hy: {
    chooseFactory: 'Ընտրել արտադրամաս',
    refresh: 'Թարմացնել',
    factory: 'Արտադրամաս',
    orders: 'Առաջադրանքներ',
    access: 'Հասանելիություն',
    fullAccess: 'Մենեջերի լիարժեք հասանելիություն',
    factoryOrders: 'Արտադրամասի առաջադրանքներ',
    search: 'Համար, անուն, կոդ...',
    loading: 'Բեռնվում է...',
    noFactory: 'Այս բաժնի համար համապատասխան արտադրամաս չի գտնվել։',
    noOrders: 'Առաջադրանք չի գտնվել',
    order: 'Առաջադրանք',
    code: 'Կոդ',
    name: 'Անվանում',
    operator: 'Օպերատոր',
    status: 'Կարգավիճակ',
    actions: 'Գործողություններ',
    unassigned: 'Չնշված',
    view: 'Դիտել',
    edit: 'Փոխել',
    saved: 'Առաջադրանքը թարմացվեց',
    saveError: 'Չհաջողվեց թարմացնել առաջադրանքը',
    detailsError: 'Չհաջողվեց բեռնել առաջադրանքի մանրամասները',
    titles: {
      laser: 'Լազերային կտրման կառավարում',
      bend: 'Կռման կառավարում',
      powder: 'Փոշեներկման կառավարում',
    },
    help: {
      laser: 'Դիտեք և կառավարեք լազերային կտրման բոլոր բաց առաջադրանքները։',
      bend: 'Դիտեք և կառավարեք կռման բոլոր բաց առաջադրանքները։',
      powder: 'Դիտեք և կառավարեք փոշեներկման բոլոր բաց առաջադրանքները։',
    },
    statuses: {
      confirmed: 'Կատարվում է',
      canceled: 'Մերժված',
      date_changed: 'Ժամկետը փոխված է',
      finished: 'Ավարտված',
      pending: 'Սպասում է',
      in_progress: 'Ընթացքում',
      none: 'Առանց կարգավիճակի',
    },
  },
  ru: {
    chooseFactory: 'Выбрать цех',
    refresh: 'Обновить',
    factory: 'Цех',
    orders: 'Заказы',
    access: 'Доступ',
    fullAccess: 'Полный доступ менеджера',
    factoryOrders: 'Заказы цеха',
    search: 'Номер, название, код...',
    loading: 'Загрузка...',
    noFactory: 'Для этого раздела подходящий цех не найден.',
    noOrders: 'Заказы не найдены',
    order: 'Заказ',
    code: 'Код',
    name: 'Название',
    operator: 'Оператор',
    status: 'Статус',
    actions: 'Действия',
    unassigned: 'Не назначен',
    view: 'Просмотр',
    edit: 'Изменить',
    saved: 'Заказ обновлён',
    saveError: 'Не удалось обновить заказ',
    detailsError: 'Не удалось загрузить детали задания',
    titles: {
      laser: 'Управление лазерной резкой',
      bend: 'Управление гибкой',
      powder: 'Управление порошковой покраской',
    },
    help: {
      laser:
        'Просматривайте и управляйте всеми открытыми заказами лазерной резки.',
      bend: 'Просматривайте и управляйте всеми открытыми заказами на гибку.',
      powder:
        'Просматривайте и управляйте всеми открытыми заказами порошковой покраски.',
    },
    statuses: {
      confirmed: 'В работе',
      canceled: 'Отклонён',
      date_changed: 'Срок изменён',
      finished: 'Завершён',
      pending: 'Ожидает',
      in_progress: 'В работе',
      none: 'Без статуса',
    },
  },
  en: {
    chooseFactory: 'Choose workshop',
    refresh: 'Refresh',
    factory: 'Workshop',
    orders: 'Orders',
    access: 'Access',
    fullAccess: 'Full manager access',
    factoryOrders: 'Workshop orders',
    search: 'Number, name, code...',
    loading: 'Loading...',
    noFactory: 'No matching workshop was found for this section.',
    noOrders: 'No orders found',
    order: 'Order',
    code: 'Code',
    name: 'Name',
    operator: 'Operator',
    status: 'Status',
    actions: 'Actions',
    unassigned: 'Unassigned',
    view: 'View',
    edit: 'Edit',
    saved: 'Order updated',
    saveError: 'Could not update order',
    detailsError: 'Could not load task details',
    titles: {
      laser: 'Laser cutting management',
      bend: 'Bending management',
      powder: 'Powder coating management',
    },
    help: {
      laser: 'Review and manage all open laser cutting orders.',
      bend: 'Review and manage all open bending orders.',
      powder: 'Review and manage all open powder coating orders.',
    },
    statuses: {
      confirmed: 'In progress',
      canceled: 'Rejected',
      date_changed: 'Date changed',
      finished: 'Finished',
      pending: 'Pending',
      in_progress: 'In progress',
      none: 'No status',
    },
  },
}

export default {
  name: 'FactoryOrdersManager',
  components: {
    TaskRoutingPanel,
    OrderActionModal,
    LaserOrderDetailsPanel,
    BendOrderDetailsPanel,
    FactoryOrderDetailsPanel,
  },
  props: { kind: { type: String, required: true } },
  data() {
    return {
      factories: [],
      selectedFactoryId: '',
      orders: [],
      search: '',
      loading: false,
      isSaving: false,
      isEditOpen: false,
      isDetailsOpen: false,
      detailsLoading: false,
      selectedOrder: {},
      dxfUrl: '',
      actionOptions: [],
      statusOptions: [],
      cancelReasons: [
        { value: 'unclear' },
        { value: 'wrong_data' },
        { value: 'no_material' },
        { value: 'other' },
      ],
    }
  },
  computed: {
    locale() {
      const code = String(this.$i18n?.locale || 'hy')
        .toLowerCase()
        .split('-')[0]
      return ['hy', 'ru', 'en'].includes(code) ? code : 'hy'
    },
    t() {
      return COPY[this.locale] || COPY.hy
    },
    title() {
      return this.t.titles[this.kind] || this.t.titles.laser
    },
    helpText() {
      return this.t.help[this.kind] || ''
    },
    detailsComponent() {
      return this.kind === 'laser'
        ? 'LaserOrderDetailsPanel'
        : this.kind === 'bend'
        ? 'BendOrderDetailsPanel'
        : 'FactoryOrderDetailsPanel'
    },
    matchingFactories() {
      return this.factories.filter((f) => this.matchesKind(f))
    },
    selectedFactoryName() {
      return (
        this.matchingFactories.find(
          (f) => String(f.id) === String(this.selectedFactoryId)
        )?.name || '—'
      )
    },
    filteredOrders() {
      const q = this.search.trim().toLowerCase()
      if (!q) return this.orders
      return this.orders.filter((o) =>
        [
          o.order_number?.number,
          o.name,
          o.prefix_code?.code,
          o.description,
        ].some((v) =>
          String(v || '')
            .toLowerCase()
            .includes(q)
        )
      )
    },
    todayFormatted() {
      return this.$formatDate(new Date(), 'dd.MM.yyyy')
    },
    tomorrowDate() {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      return localFactoryDate(d)
    },
  },
  async mounted() {
    await Promise.all([this.loadFactories(), this.loadOptions()])
  },
  methods: {
    async handleRoutingUpdated(order) {
      this.selectedOrder = order
      await this.loadOrders()
    },
    ...mapActions('factory', ['downloadUploadedFile']),
    matchesKind(factory) {
      const value = String(factory?.value || '').toUpperCase()
      const name = String(factory?.name || '').toLowerCase()
      if (this.kind === 'laser')
        return (
          ['DXF', 'IQS', 'LASER'].includes(value) ||
          name.includes('laser') ||
          name.includes('լազեր')
        )
      if (this.kind === 'bend')
        return (
          ['DLD', 'BEND'].includes(value) ||
          name.includes('bend') ||
          name.includes('կռ')
        )
      if (this.kind === 'powder')
        return (
          ['POWDER', 'PAINT'].includes(value) ||
          name.includes('powder') ||
          name.includes('paint') ||
          name.includes('փոշ')
        )
      return false
    },
    async loadFactories() {
      try {
        const { data } = await this.$axios.get('/api/factories/factory')
        this.factories = Array.isArray(data) ? data : []
        const q = String(this.$route.query.factory_id || '')
        this.selectedFactoryId = this.matchingFactories.some(
          (f) => String(f.id) === q
        )
          ? q
          : String(this.matchingFactories[0]?.id || '')
        if (this.selectedFactoryId) await this.loadOrders()
      } catch (e) {
        this.factories = []
      }
    },
    async loadOptions() {
      try {
        const [a, f] = await Promise.all([
          this.$axios.get('/api/factories/factory-order-actions'),
          this.$axios.get('/api/factories/factory-order-filters'),
        ])
        this.actionOptions = Array.isArray(a.data) ? a.data : []
        this.statusOptions = Array.isArray(f.data) ? f.data : []
      } catch (e) {}
    },
    async onFactoryChange() {
      this.$router
        .replace({
          path: this.$route.path,
          query: { ...this.$route.query, factory_id: this.selectedFactoryId },
        })
        .catch(() => {})
      await this.loadOrders()
    },
    async loadOrders() {
      if (!this.selectedFactoryId) return
      this.loading = true
      try {
        const { data } = await this.$axios.get(
          `/api/factories/factory/${this.selectedFactoryId}`
        )
        this.orders = Array.isArray(data?.orders) ? data.orders : []
      } catch (e) {
        this.orders = []
      } finally {
        this.loading = false
      }
    },
    factoryOrder(order) {
      return (
        (order?.factory_orders || []).find(
          (fo) => String(fo.factory_id) === String(this.selectedFactoryId)
        ) || null
      )
    },
    statusLabel(status) {
      const key = String(status || 'none').toLowerCase()
      return this.t.statuses[key] || status || this.t.statuses.none
    },
    async openDetails(order) {
      if (this.detailsLoading) return
      this.detailsLoading = true
      try {
        const { data } = await this.$axios.get(`/api/orders/${order.id}`)
        this.selectedOrder = data
        this.isDetailsOpen = true
        this.dxfUrl = ''
      } catch (error) {
        this.$notify({
          type: 'error',
          text: error.response?.data?.message || this.t.detailsError,
        })
      } finally {
        this.detailsLoading = false
      }
    },
    openEdit(order) {
      if (this.isSaving) return
      this.selectedOrder = order
      this.isDetailsOpen = false
      this.isEditOpen = true
    },
    closeEdit() {
      if (this.isSaving) return
      this.isEditOpen = false
      this.selectedOrder = {}
    },
    async saveStatus(payload) {
      if (this.isSaving || !this.selectedOrder?.id || !this.selectedFactoryId)
        return
      this.isSaving = true
      let success = false
      try {
        const order = {
          factory_id: this.selectedFactoryId,
          factory_order: {
            status: payload.status,
            canceling: payload.canceling,
            cancel_date: payload.cancel_date,
            operator_finish_date: payload.operator_finish_date,
          },
        }
        if (payload.evidence_text)
          order.factory_order.evidence_text = payload.evidence_text
        if (payload.evidence_photo)
          order.evidence_photo = payload.evidence_photo
        const { method, body } = taskActionBody(order)
        await this.$axios[method](
          `/api/factories/updateOrder/${this.selectedOrder.id}`,
          body
        )
        success = true
        await this.loadOrders()
      } catch (e) {
        this.$notify?.({
          type: 'error',
          text: e.response?.data?.message || this.t.saveError,
        })
      } finally {
        this.isSaving = false
      }
      if (success) {
        this.$notify?.({ type: 'success', text: this.t.saved })
        this.closeEdit()
      }
    },
    viewFile(path) {
      this.dxfUrl = path
    },
    async downloadFile(file) {
      await this.downloadUploadedFile(file)
    },
  },
}
</script>

<style scoped>
.metric {
  @apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900;
}
.metric-label {
  @apply text-[10px] font-black uppercase tracking-[0.12em] text-slate-400;
}
.metric-value {
  @apply mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white;
}
.control {
  @apply w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200;
}
</style>
