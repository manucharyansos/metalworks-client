<template>
  <article
    class="group relative flex flex-col rounded-2xl border bg-white p-4 text-sm shadow-sm transition-all dark:bg-slate-900"
    :class="[
      cardStatusClass,
      isLocked
        ? 'cursor-default opacity-75'
        : 'cursor-move hover:-translate-y-0.5 hover:shadow-lg',
    ]"
    :draggable="!isLocked"
    @dragstart="onDragStart"
  >
    <div class="mb-3 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Պատվերի համար</p>
        <h3 class="mt-1 truncate text-sm font-black text-slate-900 dark:text-white">{{ order.order_number?.number || `Պատվեր #${order.id}` }}</h3>
        <p class="mt-1 truncate text-[10px] text-slate-400">Կոդ՝ <span class="font-mono font-bold text-slate-500 dark:text-slate-300">{{ order.prefix_code?.code || '—' }}</span></p>
      </div>
      <span class="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black" :class="badgeClass">{{ statusLabel }}</span>
    </div>

    <p class="line-clamp-2 min-h-[36px] text-xs leading-5 text-slate-500 dark:text-slate-400" :title="order.description">{{ order.description || 'Առանց նկարագրության' }}</p>

    <div class="mt-4 grid grid-cols-2 gap-2 text-[10px]">
      <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/50"><p class="text-slate-400">Ստեղծվել է</p><p class="mt-1 truncate font-bold text-slate-700 dark:text-slate-200">{{ order.created_at || '—' }}</p></div>
      <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/50"><p class="text-slate-400">Ժամկետ</p><p class="mt-1 truncate font-bold text-slate-700 dark:text-slate-200">{{ order.dates?.finish_date ? $formatDate(order.dates.finish_date) : 'Հաշվի առնել' }}</p></div>
      <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/50"><p class="text-slate-400">Ստեղծող</p><p class="mt-1 truncate font-bold text-slate-700 dark:text-slate-200">{{ order.creator?.name || '—' }}</p></div>
      <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/50"><p class="text-slate-400">Օպերատոր</p><p class="mt-1 truncate font-bold text-slate-700 dark:text-slate-200">{{ operatorName || 'Չնշված' }}</p></div>
    </div>

    <p v-if="isTakenByOther" class="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-rose-500"><span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>Պատվերը վերցված է այլ օպերատորի կողմից</p>
    <p v-else-if="isCompleted" class="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Առաջադրանքը ավարտված է</p>
    <p v-else-if="!$can('factory.order_update')" class="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><span class="h-1.5 w-1.5 rounded-full bg-slate-300"></span>Փոփոխման իրավունքը տրված չէ</p>

    <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
      <button type="button" class="flex items-center gap-1 text-xs font-bold text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white" @click.stop="$emit('view-details', order)">Մանրամասներ <span aria-hidden="true">→</span></button>
      <button v-if="$can('factory.order_update')" type="button" :disabled="isWorkLocked" class="rounded-xl px-3 py-2 text-xs font-bold transition" :class="isWorkLocked ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800' : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'" @click.stop="!isWorkLocked && $emit('edit', order)">Փոփոխել</button>
    </div>

    <div v-if="!isLocked" class="pointer-events-none absolute -left-1 top-1/2 hidden -translate-y-1/2 text-xs text-slate-300 group-hover:inline">☰</div>
  </article>
</template>

<script>
export default {
  name: 'OrderCard',
  props: {
    order: { type: Object, required: true },
    factoryId: { type: [Number, String], required: true },
    currentUserId: { type: [Number, String], required: true },
  },
  computed: {
    factoryOrder() {
      if (!this.order.factory_orders) return null
      return this.order.factory_orders.find((o) => String(o.factory_id) === String(this.factoryId))
    },
    status() {
      const s = this.factoryOrder?.status
      if (!s || s === 'pending') return null
      return s
    },
    operatorName() { return this.factoryOrder?.operator?.name || null },
    statusLabel() { return this.status || 'Առանց կարգավիճակի' },
    isTakenByOther() {
      const opId = this.factoryOrder?.operator_id
      return Boolean(opId) && String(opId) !== String(this.currentUserId)
    },
    isCompleted() { return ['Ավարտել', 'finished', 'confirmed'].includes(this.status) },
    isWorkLocked() { return this.isTakenByOther || this.isCompleted },
    isLocked() { return this.isWorkLocked || !this.$can('factory.order_update') },
    badgeClass() {
      const status = String(this.status || '').toLowerCase()
      if (['ավարտել', 'finished', 'confirmed'].includes(status)) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300'
      if (['մերժել', 'rejected', 'canceled', 'cancelled'].includes(status)) return 'bg-rose-50 text-rose-700 dark:bg-rose-950/35 dark:text-rose-300'
      if (['կատարման ժամկետի փոխարինում', 'date_changed'].includes(status)) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-300'
      if (['հաստատել', 'accepted', 'in_progress'].includes(status)) return 'bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-300'
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    },
    cardStatusClass() {
      if (this.isCompleted) return 'border-emerald-200 dark:border-emerald-900/70'
      if (String(this.status || '').toLowerCase().includes('մերժ')) return 'border-rose-200 dark:border-rose-900/70'
      return 'border-slate-200 dark:border-slate-800'
    },
  },
  methods: {
    onDragStart(e) {
      if (this.isLocked) { e.preventDefault(); return }
      e.dataTransfer.effectAllowed = 'move'
      this.$emit('drag-start', this.order)
    },
  },
}
</script>
