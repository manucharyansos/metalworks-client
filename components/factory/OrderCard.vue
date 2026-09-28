<template>
  <article
    class="group relative flex flex-col rounded-2xl border bg-white p-4 text-sm shadow-sm transition-all dark:bg-slate-900"
    :class="[
      cardStatusClass,
      isLocked ? 'cursor-default opacity-75' : 'cursor-move hover:-translate-y-0.5 hover:shadow-lg',
    ]"
    :draggable="!isLocked"
    @dragstart="onDragStart"
  >
    <div class="mb-3 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">{{ t.orderNumber }}</p>
        <h3 class="mt-1 truncate text-sm font-black text-slate-900 dark:text-white">{{ order.order_number?.number || `${t.order} #${order.id}` }}</h3>
        <p class="mt-1 truncate text-[10px] text-slate-400">{{ t.code }}՝ <span class="font-mono font-bold text-slate-500 dark:text-slate-300">{{ order.prefix_code?.code || '—' }}</span></p>
      </div>
      <span class="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black" :class="badgeClass">{{ statusLabel }}</span>
    </div>

    <p class="line-clamp-2 min-h-[36px] text-xs leading-5 text-slate-500 dark:text-slate-400" :title="order.description">{{ order.description || t.noDescription }}</p>

    <div class="mt-4 grid grid-cols-2 gap-2 text-[10px]">
      <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/50"><p class="text-slate-400">{{ t.created }}</p><p class="mt-1 truncate font-bold text-slate-700 dark:text-slate-200">{{ order.created_at || '—' }}</p></div>
      <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/50"><p class="text-slate-400">{{ t.deadline }}</p><p class="mt-1 truncate font-bold text-slate-700 dark:text-slate-200">{{ order.dates?.finish_date ? $formatDate(order.dates.finish_date) : t.consider }}</p></div>
      <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/50"><p class="text-slate-400">{{ t.creator }}</p><p class="mt-1 truncate font-bold text-slate-700 dark:text-slate-200">{{ order.creator?.name || '—' }}</p></div>
      <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/50"><p class="text-slate-400">{{ t.operator }}</p><p class="mt-1 truncate font-bold text-slate-700 dark:text-slate-200">{{ operatorName || t.unassigned }}</p></div>
    </div>

    <p v-if="isTakenByOther" class="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-rose-500"><span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>{{ t.takenByOther }}</p>
    <p v-else-if="isCompleted" class="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>{{ t.completed }}</p>
    <p v-else-if="!$can('factory.order_update')" class="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><span class="h-1.5 w-1.5 rounded-full bg-slate-300"></span>{{ t.noEditPermission }}</p>

    <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
      <button type="button" class="flex items-center gap-1 text-xs font-bold text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white" @click.stop="$emit('view-details', order)">{{ t.details }} <span aria-hidden="true">→</span></button>
      <button v-if="$can('factory.order_update')" type="button" :disabled="isWorkLocked" class="rounded-xl px-3 py-2 text-xs font-bold transition" :class="isWorkLocked ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800' : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'" @click.stop="!isWorkLocked && $emit('edit', order)">{{ t.edit }}</button>
    </div>

    <div v-if="!isLocked" class="pointer-events-none absolute -left-1 top-1/2 hidden -translate-y-1/2 text-xs text-slate-300 group-hover:inline">☰</div>
  </article>
</template>

<script>
const COPY = {
  hy: { orderNumber: 'Պատվերի համար', order: 'Պատվեր', code: 'Կոդ', noDescription: 'Առանց նկարագրության', created: 'Ստեղծվել է', deadline: 'Ժամկետ', consider: 'Հաշվի առնել', creator: 'Ստեղծող', operator: 'Օպերատոր', unassigned: 'Չնշված', takenByOther: 'Պատվերը վերցված է այլ օպերատորի կողմից', completed: 'Առաջադրանքը ավարտված է', noEditPermission: 'Փոփոխման իրավունքը տրված չէ', details: 'Մանրամասներ', edit: 'Փոփոխել', noStatus: 'Առանց կարգավիճակի', statuses: { confirmed: 'Կատարվում է', canceled: 'Մերժված', date_changed: 'Ժամկետը փոխված է', finished: 'Ավարտված', pending: 'Սպասում է', waiting: 'Սպասում է', in_progress: 'Ընթացքում' } },
  ru: { orderNumber: 'Номер заказа', order: 'Заказ', code: 'Код', noDescription: 'Без описания', created: 'Создан', deadline: 'Срок', consider: 'Уточнить', creator: 'Создатель', operator: 'Оператор', unassigned: 'Не назначен', takenByOther: 'Заказ взят другим оператором', completed: 'Задание завершено', noEditPermission: 'Нет права на изменение', details: 'Подробнее', edit: 'Изменить', noStatus: 'Без статуса', statuses: { confirmed: 'В работе', canceled: 'Отклонён', date_changed: 'Срок изменён', finished: 'Завершён', pending: 'Ожидает', waiting: 'Ожидает', in_progress: 'В работе' } },
  en: { orderNumber: 'Order number', order: 'Order', code: 'Code', noDescription: 'No description', created: 'Created', deadline: 'Deadline', consider: 'Review', creator: 'Creator', operator: 'Operator', unassigned: 'Unassigned', takenByOther: 'Order is assigned to another operator', completed: 'Task completed', noEditPermission: 'Edit permission not granted', details: 'Details', edit: 'Edit', noStatus: 'No status', statuses: { confirmed: 'In progress', canceled: 'Rejected', date_changed: 'Date changed', finished: 'Finished', pending: 'Pending', waiting: 'Pending', in_progress: 'In progress' } },
}

export default {
  name: 'OrderCard',
  props: {
    order: { type: Object, required: true },
    factoryId: { type: [Number, String], required: true },
    currentUserId: { type: [Number, String], required: true },
  },
  computed: {
    locale() { const code = String(this.$i18n?.locale || 'hy').toLowerCase().split('-')[0]; return ['hy','ru','en'].includes(code) ? code : 'hy' },
    t() { return COPY[this.locale] || COPY.hy },
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
    statusLabel() { return this.status ? (this.t.statuses[this.status] || this.status) : this.t.noStatus },
    isTakenByOther() {
      const opId = this.factoryOrder?.operator_id
      return Boolean(opId) && String(opId) !== String(this.currentUserId)
    },
    isCompleted() { return ['finished', 'confirmed_done', 'completed'].includes(String(this.status || '').toLowerCase()) },
    isWorkLocked() { return this.isTakenByOther || this.isCompleted },
    isLocked() { return this.isWorkLocked || !this.$can('factory.order_update') },
    badgeClass() {
      const status = String(this.status || '').toLowerCase()
      if (['finished', 'confirmed_done', 'completed'].includes(status)) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300'
      if (['rejected', 'canceled', 'cancelled'].includes(status)) return 'bg-rose-50 text-rose-700 dark:bg-rose-950/35 dark:text-rose-300'
      if (status === 'date_changed') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-300'
      if (['confirmed', 'accepted', 'in_progress'].includes(status)) return 'bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-300'
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    },
    cardStatusClass() {
      if (this.isCompleted) return 'border-emerald-200 dark:border-emerald-900/70'
      if (['rejected', 'canceled', 'cancelled'].includes(String(this.status || '').toLowerCase())) return 'border-rose-200 dark:border-rose-900/70'
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
