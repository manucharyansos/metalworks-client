<template>
  <div v-if="localOrder" class="flex h-full min-h-0 flex-col bg-slate-50 dark:bg-slate-950">
    <header class="shrink-0 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Order details</p>
            <span class="rounded-full px-2.5 py-1 text-[10px] font-bold" :class="overallStatusClass">{{ overallStatusText }}</span>
          </div>
          <h2 class="mt-2 truncate text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
            {{ localOrder.name || `Պատվեր #${localOrder.id}` }}
          </h2>
          <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>#{{ localOrder.order_number?.number || localOrder.id }}</span>
            <span v-if="localOrder.prefix_code?.code">Prefix՝ {{ localOrder.prefix_code.code }}</span>
            <span>Ստեղծվել է՝ {{ formatDate(localOrder.created_at) }}</span>
          </div>
        </div>
        <button type="button" class="shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Close order" @click="$emit('close')">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </header>

    <div class="custom-scroll min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
      <div class="mx-auto max-w-6xl space-y-5">
        <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="info-tile">
            <p class="info-label">Պատվերի համար</p>
            <p class="info-value">{{ localOrder.order_number?.number || `#${localOrder.id}` }}</p>
          </div>
          <div class="info-tile">
            <p class="info-label">Prefix</p>
            <p class="info-value">{{ localOrder.prefix_code?.code || '—' }}</p>
          </div>
          <div class="info-tile" :class="isOverdue ? '!border-rose-200 !bg-rose-50/70 dark:!border-rose-950/70 dark:!bg-rose-950/20' : isNear ? '!border-amber-200 !bg-amber-50/70 dark:!border-amber-950/70 dark:!bg-amber-950/20' : ''">
            <p class="info-label">Վերջնաժամկետ</p>
            <p class="info-value" :class="isOverdue ? 'text-rose-600 dark:text-rose-300' : isNear ? 'text-amber-600 dark:text-amber-300' : ''">{{ formatDate(localOrder.dates?.finish_date) }}</p>
          </div>
          <div class="info-tile">
            <p class="info-label">Factory քայլեր</p>
            <p class="info-value">{{ factoryOrders.length }}</p>
          </div>
        </section>

        <section class="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
          <div class="panel-card">
            <div class="panel-heading">
              <div>
                <p class="eyebrow">Main information</p>
                <h3 class="panel-title">Հիմնական տվյալներ</h3>
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="field sm:col-span-2">
                <span>Անվանում</span>
                <input v-model="localOrder.name" type="text" />
              </label>

              <label class="field sm:col-span-2">
                <span>Նկարագրություն</span>
                <textarea v-model="localOrder.description" rows="4"></textarea>
              </label>

              <label class="field">
                <span>Ավարտի ամսաթիվ</span>
                <input v-model="localOrder.dates.finish_date" type="datetime-local" :class="{ '!border-rose-300 !ring-rose-100': isOverdue, '!border-amber-300 !ring-amber-100': isNear && !isOverdue }" />
                <small v-if="isOverdue" class="text-rose-600 dark:text-rose-300">Ժամկետն անցել է</small>
                <small v-else-if="isNear" class="text-amber-600 dark:text-amber-300">24 ժամից քիչ է մնացել</small>
              </label>

              <label class="field">
                <span>Արտաքին հղում</span>
                <input v-model="storeLinkUrl" type="url" placeholder="https://..." />
              </label>
            </div>
          </div>

          <aside class="panel-card">
            <div class="panel-heading">
              <div>
                <p class="eyebrow">Customer</p>
                <h3 class="panel-title">Հաճախորդ</h3>
              </div>
            </div>

            <div class="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/50">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">{{ customerInitials }}</div>
              <div class="min-w-0">
                <p class="truncate text-sm font-bold text-slate-900 dark:text-white">{{ customerName }}</p>
                <p class="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{{ customerEmail }}</p>
              </div>
            </div>

            <dl class="mt-4 space-y-3 text-xs">
              <div class="detail-row"><dt>Հեռախոս</dt><dd>{{ localOrder.client?.phone || localOrder.user?.phone || '—' }}</dd></div>
              <div class="detail-row"><dt>Email</dt><dd class="break-all">{{ customerEmail }}</dd></div>
              <div class="detail-row"><dt>Ստեղծող</dt><dd>{{ localOrder.creator?.name || '—' }}</dd></div>
              <div class="detail-row"><dt>Ընդհանուր status</dt><dd>{{ localOrder.status || 'pending' }}</dd></div>
            </dl>
          </aside>
        </section>

        <section class="panel-card">
          <div class="panel-heading flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="eyebrow">Production flow</p>
              <h3 class="panel-title">Արտադրամասերի ընթացքը</h3>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ factoryOrders.length }} քայլ</p>
          </div>

          <div v-if="factoryOrders.length" class="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            <article v-for="fo in factoryOrders" :key="fo.id" class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/35">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-bold text-slate-900 dark:text-white">{{ fo.factory?.name || 'Անհայտ արտադրամաս' }}</p>
                  <p class="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">Օպերատոր՝ {{ fo.operator?.name || 'չնշանակված' }}</p>
                </div>
                <span class="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold" :class="factoryStatusClass(fo.status)">{{ factoryStatusLabel(fo.status) }}</span>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                <div class="rounded-xl bg-white p-2.5 dark:bg-slate-900">
                  <p class="text-slate-400">Factory ավարտ</p>
                  <p class="mt-1 font-semibold text-slate-700 dark:text-slate-200">{{ formatDate(fo.finish_date) }}</p>
                </div>
                <div class="rounded-xl bg-white p-2.5 dark:bg-slate-900">
                  <p class="text-slate-400">Admin հաստատում</p>
                  <p class="mt-1 font-semibold" :class="fo.admin_confirmation_date ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'">{{ fo.admin_confirmation_date ? formatDate(fo.admin_confirmation_date) : 'Սպասում է' }}</p>
                </div>
              </div>

              <div v-if="fo.canceling" class="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">Մերժման պատճառ՝ {{ fo.canceling }}</div>

              <button
                v-if="normalizeStatus(fo.status) === 'finished' && !fo.admin_confirmation_date"
                type="button"
                class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                :disabled="confirmingId === fo.id"
                @click="confirmFactoryFinish(fo)"
              >
                <span v-if="confirmingId === fo.id" class="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"></span>
                Հաստատել ավարտը
              </button>
            </article>
          </div>
          <div v-else class="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400 dark:border-slate-800">Դեռ արտադրամաս չի կցվել։</div>
        </section>

        <section class="grid gap-5 xl:grid-cols-2">
          <div class="panel-card">
            <div class="panel-heading">
              <div><p class="eyebrow">Files</p><h3 class="panel-title">Ընտրված ֆայլեր</h3></div>
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{{ localOrder.selected_files?.length || 0 }}</span>
            </div>
            <div v-if="localOrder.selected_files?.length" class="space-y-2">
              <div v-for="sf in localOrder.selected_files" :key="sf.id" class="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/35">
                <span class="min-w-0 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{{ sf.pmp_file?.original_name || 'Ֆայլ' }}</span>
                <span class="shrink-0 rounded-lg bg-white px-2 py-1 text-[10px] font-black text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">×{{ sf.quantity }}</span>
              </div>
            </div>
            <p v-else class="py-8 text-center text-xs text-slate-400">Ընտրված ֆայլեր չկան։</p>
          </div>

          <div class="panel-card">
            <div class="panel-heading">
              <div><p class="eyebrow">Audit trail</p><h3 class="panel-title">Վերջին գործողությունները</h3></div>
            </div>
            <div v-if="localOrder.logs?.length" class="max-h-72 space-y-3 overflow-y-auto pr-1">
              <div v-for="log in recentLogs" :key="log.id" class="flex gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-400"></span>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <p class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ log.user?.name || 'Համակարգ' }}</p>
                    <p class="text-[10px] text-slate-400">{{ formatDate(log.created_at) }}</p>
                  </div>
                  <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{{ log.message }}</p>
                </div>
              </div>
            </div>
            <p v-else class="py-8 text-center text-xs text-slate-400">Գործողություններ դեռ չկան։</p>
          </div>
        </section>
      </div>
    </div>

    <footer class="shrink-0 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
      <div class="mx-auto flex max-w-6xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-[10px] text-slate-400">Փոփոխությունները պահպանվելու են պատվերի ընթացիկ տվյալներում։</p>
        <div class="flex gap-2">
          <button type="button" class="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:flex-none" @click="$emit('close')">Փակել</button>
          <button type="button" class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 sm:flex-none" :disabled="saving" @click="save">
            <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"></span>
            {{ saving ? 'Պահպանվում է...' : 'Պահպանել' }}
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  props: { order: { type: Object, required: true } },
  emits: ['close', 'saved'],
  data() {
    return {
      saving: false,
      confirmingId: null,
      localOrder: null,
      storeLinkUrl: '',
    }
  },
  computed: {
    factoryOrders() {
      return this.localOrder?.factory_orders || []
    },
    finishDate() {
      if (!this.localOrder?.dates?.finish_date) return null
      return new Date(this.localOrder.dates.finish_date)
    },
    customerName() {
      return this.localOrder?.client?.user?.name || this.localOrder?.user?.name || 'Անհայտ'
    },
    customerEmail() {
      return this.localOrder?.client?.user?.email || this.localOrder?.user?.email || '—'
    },
    customerInitials() {
      return String(this.customerName || '?').split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')
    },
    recentLogs() {
      const logs = this.localOrder?.logs || []
      return logs.slice(-8).reverse()
    },
    hasCanceled() {
      return this.factoryOrders.some((fo) => this.normalizeStatus(fo.status) === 'canceled')
    },
    hasDateChanged() {
      return this.factoryOrders.some((fo) => this.normalizeStatus(fo.status) === 'date_changed')
    },
    isAllCompleted() {
      const fos = this.factoryOrders
      if (!fos.length) return false
      return fos.every((fo) => {
        const code = this.normalizeStatus(fo.status)
        if (code === 'canceled') return false
        if (code === 'finished' || code === 'confirmed') return !!fo.admin_confirmation_date
        return false
      })
    },
    isOverdue() {
      return this.finishDate && this.finishDate < new Date() && !this.isAllCompleted && !this.hasCanceled
    },
    isNear() {
      if (!this.finishDate) return false
      const hoursLeft = (this.finishDate - Date.now()) / 36e5
      return hoursLeft > 0 && hoursLeft <= 24 && !this.isAllCompleted && !this.hasCanceled
    },
    isInProgress() {
      return this.factoryOrders.length > 0 && !this.isAllCompleted && !this.hasCanceled
    },
    overallStatusText() {
      if (this.hasCanceled) return 'Չեղարկված'
      if (this.hasDateChanged) return 'Ժամկետը փոփոխված'
      if (this.isAllCompleted) return 'Ավարտված'
      if (this.isOverdue) return 'Ժամկետն անցել է'
      if (this.isInProgress || this.factoryOrders.length > 0) return 'Ընթացքում'
      return 'Սպասում է'
    },
    overallStatusClass() {
      if (this.hasCanceled) return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
      if (this.hasDateChanged) return 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
      if (this.isAllCompleted) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
      if (this.isOverdue) return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
      if (this.isInProgress) return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    },
  },
  watch: {
    order: {
      deep: true,
      handler(newVal) {
        this.resetLocal(newVal)
      },
    },
  },
  created() {
    this.resetLocal(this.order)
  },
  methods: {
    normalizeStatus(raw) {
      if (!raw) return 'pending'
      const s = raw.toString().toLowerCase()
      if (s === 'finished' || s.includes('ավարտ')) return 'finished'
      if (s === 'canceled' || s === 'cancelled' || s.includes('մերժ')) return 'canceled'
      if (s === 'confirmed' || s.includes('հաստատ')) return 'confirmed'
      if (s === 'date_changed' || s.includes('ժամկետ')) return 'date_changed'
      if (s === 'pending' || s === '0' || s === 'null' || s === '-') return 'pending'
      return s
    },
    factoryStatusLabel(status) {
      const code = this.normalizeStatus(status)
      switch (code) {
        case 'finished': return 'Ավարտված'
        case 'canceled': return 'Մերժված'
        case 'confirmed': return 'Հաստատված'
        case 'date_changed': return 'Ժամկետը փոփոխված'
        case 'pending':
        default: return 'Սպասում է'
      }
    },
    factoryStatusClass(status) {
      const code = this.normalizeStatus(status)
      if (code === 'finished') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
      if (code === 'canceled') return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
      if (code === 'confirmed') return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
      if (code === 'date_changed') return 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
    },
    resetLocal(order) {
      const cloned = JSON.parse(JSON.stringify(order || {}))
      cloned.dates = cloned.dates || { finish_date: null }
      cloned.factory_orders = cloned.factory_orders || []
      cloned.selected_files = cloned.selected_files || []
      cloned.logs = cloned.logs || []
      cloned.store_link = cloned.store_link || {}
      this.localOrder = cloned
      this.storeLinkUrl = cloned.store_link.url || ''
    },
    formatDate(date) {
      if (!date) return '—'
      const m = this.$moment(date)
      if (!m.isValid()) return date
      return m.format('DD/MM/YYYY HH:mm')
    },
    async save() {
      if (!this.localOrder) return
      this.saving = true
      try {
        const factories = (this.localOrder.factory_orders || []).map((fo) => ({ id: fo.factory_id }))
        const payload = {
          name: this.localOrder.name,
          description: this.localOrder.description,
          finish_date: this.localOrder.dates?.finish_date || null,
          status: this.localOrder.status,
          factories,
          store_link: { url: this.storeLinkUrl || null },
        }
        const updated = await this.$store.dispatch('orders/updateOrder', { id: this.order.id, payload })
        this.$emit('saved', updated.order)
        this.$notify({ type: 'success', message: updated.message || 'Պատվերը հաջողությամբ թարմացվեց' })
      } catch (e) {
        this.$notify({ type: 'error', message: e?.response?.data?.message || e.message || 'Չհաջողվեց պահպանել' })
      } finally {
        this.saving = false
      }
    },
    async confirmFactoryFinish(fo) {
      if (!fo || !fo.factory_id) return
      this.confirmingId = fo.id
      try {
        await this.$store.dispatch('factory/adminConfirmFactoryStatus', { id: this.order.id, factory_id: fo.factory_id })
        const target = this.localOrder.factory_orders.find((x) => x.id === fo.id)
        if (target) target.admin_confirmation_date = new Date().toISOString()
        this.$notify({ type: 'success', message: `Գործարան "${fo.factory?.name || fo.factory_id}"-ի ավարտը հաստատված է` })
      } catch (e) {
        this.$notify({ type: 'error', message: e?.response?.data?.message || e.message || 'Չհաջողվեց հաստատել ավարտը' })
      } finally {
        this.confirmingId = null
      }
    },
  },
}
</script>

<style scoped>
.info-tile {
  @apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900;
}
.info-label {
  @apply text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400;
}
.info-value {
  @apply mt-2 truncate text-sm font-black text-slate-900 dark:text-white;
}
.panel-card {
  @apply rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5;
}
.panel-heading {
  @apply mb-4 flex items-start justify-between gap-3;
}
.eyebrow {
  @apply text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400;
}
.panel-title {
  @apply mt-1 text-base font-bold text-slate-950 dark:text-white;
}
.field {
  @apply flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400;
}
.field input,
.field textarea {
  @apply w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-slate-600 dark:focus:bg-slate-950;
}
.detail-row {
  @apply flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800;
}
.detail-row dt {
  @apply text-slate-400;
}
.detail-row dd {
  @apply min-w-0 text-right font-semibold text-slate-700 dark:text-slate-200;
}
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.55); border-radius: 999px; }
</style>
