<template>
  <div class="group rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-gray-900" :class="cardBorderClass">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <div class="mb-1 text-xs uppercase tracking-wider text-gray-400">#{{ order.order_number?.number || '—' }} · {{ order.prefix_code?.code || '—' }}</div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ order.name || t.unnamed }}</h3>
      </div>
      <div class="flex flex-col items-end gap-2">
        <span class="rounded-full px-3 py-1 text-xs font-medium text-white" :class="overallStatusClass">{{ overallStatusText }}</span>
        <span class="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :title="t.creator">{{ order.creator?.name ?? `ID: ${order.creator_id ?? '—'}` }}</span>
      </div>
    </div>

    <p class="mt-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{{ order.description || '—' }}</p>

    <div class="mt-4 space-y-2">
      <div v-for="(fo, idx) in order.factory_orders" :key="idx" class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900" :class="factoryColorClass(fo.factory?.value)" :title="fo.factory?.name">{{ (fo.factory?.name || 'F')[0] }}</div>
          <span class="text-gray-600 dark:text-gray-400">{{ fo.factory?.name }}</span>
        </div>
        <span class="rounded-full px-3 py-1 text-xs font-medium text-white" :class="factoryStatusClass(fo.status)">{{ formatStatus(fo.status) }}</span>
      </div>
    </div>

    <div class="mt-5 grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
      <div>{{ t.created }}՝ {{ order.created_at }}</div>
      <div>{{ t.files }}՝ {{ filesCount }}</div>
      <div class="col-span-2"><span :class="deadlineClass">{{ t.finish }}՝ {{ formatDeadline(order.dates?.finish_date) }}</span></div>
    </div>

    <div class="mt-5 flex items-center justify-between">
      <div class="flex -space-x-2">
        <div v-for="(fo, idx) in (order.factory_orders || []).slice(0, 3)" :key="idx" class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white dark:ring-gray-900" :class="factoryColorClass(fo.factory?.value)" :title="fo.factory?.name">{{ (fo.factory?.name || 'F')[0] }}</div>
      </div>
      <button class="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-95" @click="$emit('open', order)">{{ t.open }}</button>
    </div>
  </div>
</template>

<script>
const COPY = {
  hy: { unnamed: 'Անանուն պատվեր', creator: 'Ստեղծող', created: 'Ստեղծվել', files: 'Ֆայլեր', finish: 'Ավարտ', open: 'Բացել', noStatus: 'Չկա', canceled: 'Չեղարկված', completed: 'Ավարտված', progress: 'Ընթացքում', other: 'Այլ', overdue: 'Անցել է ժամկետը', today: 'Այսօր', tomorrow: 'Վաղը', day: 'օր', hour: 'ժամ', statuses: { pending: 'Սպասում', in_progress: 'Ընթացքում', done: 'Ավարտված', completed: 'Ավարտված', confirmed: 'Հաստատված', canceled: 'Չեղարկված', finished: 'Ավարտված', date_changed: 'Ժամկետը փոխված է' } },
  ru: { unnamed: 'Без названия', creator: 'Создатель', created: 'Создан', files: 'Файлы', finish: 'Срок', open: 'Открыть', noStatus: 'Нет', canceled: 'Отменён', completed: 'Завершён', progress: 'В работе', other: 'Другое', overdue: 'Срок истёк', today: 'Сегодня', tomorrow: 'Завтра', day: 'дн.', hour: 'ч.', statuses: { pending: 'Ожидает', in_progress: 'В работе', done: 'Завершён', completed: 'Завершён', confirmed: 'Подтверждён', canceled: 'Отменён', finished: 'Завершён', date_changed: 'Срок изменён' } },
  en: { unnamed: 'Untitled order', creator: 'Creator', created: 'Created', files: 'Files', finish: 'Deadline', open: 'Open', noStatus: 'None', canceled: 'Canceled', completed: 'Completed', progress: 'In progress', other: 'Other', overdue: 'Overdue', today: 'Today', tomorrow: 'Tomorrow', day: 'd', hour: 'h', statuses: { pending: 'Pending', in_progress: 'In progress', done: 'Completed', completed: 'Completed', confirmed: 'Confirmed', canceled: 'Canceled', finished: 'Finished', date_changed: 'Date changed' } },
}

export default {
  props: { order: { type: Object, required: true } },
  computed: {
    locale() { const code = String(this.$i18n?.locale || 'hy').toLowerCase().split('-')[0]; return ['hy','ru','en'].includes(code) ? code : 'hy' },
    t() { return COPY[this.locale] || COPY.hy },
    filesCount() {
      const selected = (this.order.selected_files || []).reduce((a, s) => a + (Number(s.quantity) || 1), 0)
      if (selected > 0) return selected
      return (this.order.factory_orders || []).reduce((acc, fo) => acc + (fo.files || []).reduce((b, f) => b + Number(f.pivot?.quantity || f.quantity || 1), 0), 0)
    },
    overallStatusText() {
      const statuses = (this.order.factory_orders || []).map((fo) => String(fo.status || '').toLowerCase().trim()).filter(Boolean)
      if (!statuses.length) return this.t.noStatus
      if (statuses.includes('canceled')) return this.t.canceled
      if (statuses.every((s) => ['done','completed','confirmed','finished'].includes(s))) return this.t.completed
      if (statuses.some((s) => ['pending','in_progress','confirmed'].includes(s))) return this.t.progress
      return this.t.other
    },
    overallStatusClass() {
      const statuses = (this.order.factory_orders || []).map((fo) => String(fo.status || '').toLowerCase().trim())
      if (statuses.includes('canceled')) return 'bg-rose-600'
      if (statuses.length && statuses.every((s) => ['done','completed','confirmed','finished'].includes(s))) return 'bg-emerald-600'
      if (statuses.some((s) => ['pending','in_progress','confirmed'].includes(s))) return 'bg-amber-600'
      return 'bg-blue-600'
    },
    deadlineClass() {
      const finishDate = this.order.dates?.finish_date
      if (!finishDate) return 'text-gray-500'
      const diff = this.hoursUntil(finishDate)
      if (diff < 0) return 'text-rose-600 font-bold animate-pulse'
      if (diff <= 24) return 'text-orange-600 font-bold'
      return 'text-gray-500'
    },
    cardBorderClass() {
      const finishDate = this.order.dates?.finish_date
      if (!finishDate) return 'border-gray-200 dark:border-gray-800'
      const diff = this.hoursUntil(finishDate)
      if (diff < 0) return 'border-rose-500 border-4 shadow-rose-500/20'
      if (diff <= 24) return 'border-orange-500 border-3 shadow-orange-500/20'
      return 'border-gray-200 dark:border-gray-800'
    },
  },
  methods: {
    formatDeadline(date) {
      if (!date) return '—'
      const d = new Date(date); const diff = d - new Date(); const days = Math.floor(diff / 86400000); const hours = Math.floor((diff % 86400000) / 3600000)
      if (diff < 0) return this.t.overdue
      if (days === 0) return `${this.t.today} ${d.toLocaleTimeString(this.locale === 'hy' ? 'hy-AM' : this.locale === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`
      if (days === 1) return this.t.tomorrow
      return `${days} ${this.t.day} ${hours} ${this.t.hour}`
    },
    hoursUntil(dateStr) { return dateStr ? (new Date(dateStr) - new Date()) / 3600000 : Infinity },
    formatStatus(status) { if (!status) return '—'; const key = String(status).toLowerCase().trim(); return this.t.statuses[key] || status },
    factoryStatusClass(status) { const s = String(status || '').toLowerCase().trim(); if (s.includes('canceled')) return 'bg-rose-600'; if (['done','completed','confirmed','finished'].some((x) => s.includes(x))) return 'bg-emerald-600'; if (['pending','in_progress'].some((x) => s.includes(x))) return 'bg-amber-600'; return 'bg-blue-600' },
    factoryColorClass(value) { const colors = { DXF: 'bg-purple-600', DLD: 'bg-indigo-600', CNC: 'bg-pink-600', IQS: 'bg-violet-600' }; return colors[value] || 'bg-gray-600' },
  },
}
</script>
