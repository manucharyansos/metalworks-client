<template>
  <div
    class="card p-5 relative overflow-hidden group"
    :class="{
      'ring-2 ring-red-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900':
        isOverdue,
    }"
  >
    <!-- subtle gradient when overdue -->
    <div
      v-if="isOverdue"
      class="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/5 via-red-500/0 to-transparent"
    ></div>

    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="space-y-1">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          ID:
          <span class="font-medium text-gray-800 dark:text-gray-100">
            {{ order.id }}
          </span>
        </p>
        <h3
          class="text-base font-semibold text-gray-900 dark:text-white line-clamp-2"
        >
          {{ order.name || 'Անվանում չկա' }}
        </h3>
      </div>

      <span
        class="badge flex items-center gap-1"
        :class="{
          'badge-pending': order.status === 'pending' && !isOverdue,
          'badge-completed': order.status === 'completed',
          'badge-canceled': order.status === 'canceled',
          'badge-overdue': isOverdue,
        }"
      >
        <span
          v-if="isOverdue"
          class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"
        ></span>
        {{ badgeText }}
      </span>
    </div>

    <!-- Fields -->
    <dl
      class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600 dark:text-gray-300"
    >
      <div>
        <dt class="text-gray-500 dark:text-gray-400">Համար</dt>
        <dd class="font-medium">{{ order.order_number?.number ?? '—' }}</dd>
      </div>
      <div>
        <dt class="text-gray-500 dark:text-gray-400">Prefix</dt>
        <dd class="font-medium">{{ order.prefix_code?.code ?? '—' }}</dd>
      </div>
      <div>
        <dt class="text-gray-500 dark:text-gray-400">Ստեղծվել է</dt>
        <dd class="font-medium">
          {{ $formatDate(order.created_at) }}
        </dd>
      </div>
      <div>
        <dt class="text-gray-500 dark:text-gray-400">Ավարտ</dt>
        <dd
          class="font-medium"
          :class="{
            'text-red-600 dark:text-red-400': isNear || isOverdue,
          }"
        >
          {{ $formatDate(order.dates?.finish_date) }}
        </dd>
      </div>
      <div v-if="order.store_link?.url" class="col-span-2">
        <dt class="text-gray-500 dark:text-gray-400">Հղում</dt>
        <dd>
          <a
            :href="order.store_link.url"
            target="_blank"
            class="underline text-indigo-600 dark:text-indigo-400 hover:no-underline"
            >Բացնել</a
          >
        </dd>
      </div>
    </dl>

    <!-- Footer -->
    <div
      class="flex items-center justify-between pt-3 mt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 pr-4">
        {{ shortDesc }}
      </p>
      <button
        class="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800 transition"
        @click="$emit('edit', order)"
      >
        Դիտել
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: { order: { type: Object, required: true } },
  computed: {
    finishDate() {
      return this.order.dates?.finish_date
        ? new Date(this.order.dates.finish_date)
        : null
    },
    isOverdue() {
      return (
        this.finishDate &&
        this.finishDate < new Date() &&
        this.order.status !== 'completed'
      )
    },
    isNear() {
      if (!this.finishDate) return false
      const diffHours = (this.finishDate - Date.now()) / 36e5
      return diffHours > 0 && diffHours <= 24
    },
    badgeText() {
      if (this.isOverdue) return 'Ժամկետը անցել է'
      if (this.isNear && this.order.status !== 'completed')
        return 'Ժամկետը մոտ է'
      return this.order.status ?? '—'
    },
    shortDesc() {
      const d = this.order.description
      return d?.length > 50 ? d.slice(0, 50) + '…' : d ?? '—'
    },
  },
}
</script>
