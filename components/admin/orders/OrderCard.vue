<template>
  <div
    class="card p-5 relative overflow-hidden group transition-all duration-300"
    :class="{
      'ring-4 ring-red-500/30 ring-offset-2 ring-offset-transparent shadow-red-500/10':
        isOverdue,
      'ring-3 ring-orange-500/30': isNearDeadline && !isOverdue,
    }"
  >
    <!-- Overdue gradient -->
    <div
      v-if="isOverdue"
      class="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent"
    ></div>

    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="space-y-1 flex-1">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          #{{ order.order_number?.number ?? order.id }}
        </p>
        <h3
          class="text-base font-semibold text-gray-900 dark:text-white line-clamp-2"
        >
          {{ order.name || 'Անվանում չկա' }}
        </h3>
      </div>

      <!-- Ընդհանուր կարգավիճակ -->
      <span
        class="badge flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
        :class="overallStatusClass"
      >
        <span
          v-if="isOverdue"
          class="w-2 h-2 rounded-full bg-white animate-pulse"
        ></span>
        {{ overallStatusText }}
      </span>
    </div>

    <dl
      class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600 dark:text-gray-300"
    >
      <div>
        <dt class="text-gray-500">Prefix</dt>
        <dd class="font-medium">{{ order.prefix_code?.code ?? '—' }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">Ստեղծվել</dt>
        <dd>{{ order.created_at }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">Ավարտ</dt>
        <dd :class="{ 'text-red-600 font-bold': isOverdue || isNearDeadline }">
          {{ formatDeadline(order.dates?.finish_date) }}
        </dd>
      </div>
      <div v-if="factoryCount" class="col-span-2">
        <dt class="text-gray-500">Գործարաններ</dt>
        <dd class="font-medium">{{ factoryCount }} գործարան</dd>
      </div>
    </dl>

    <div
      class="flex items-center justify-between pt-3 mt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <!--      <p class="text-xs text-gray-500 line-clamp-2 pr-4">{{ shortDesc }}</p>-->
      <button class="btn-view" @click="$emit('edit', order)">Դիտել</button>
    </div>
  </div>
</template>

<script>
export default {
  props: { order: { type: Object, required: true } },

  computed: {
    factoryOrders() {
      return this.order.factory_orders || []
    },
    factoryCount() {
      return this.factoryOrders.length
    },

    finishDate() {
      return this.order.dates?.finish_date
        ? new Date(this.order.dates.finish_date)
        : null
    },

    hasCanceled() {
      return this.factoryOrders.some(
        (fo) => this.normalizeStatus(fo.status) === 'canceled'
      )
    },

    hasDateChanged() {
      return this.factoryOrders.some(
        (fo) => this.normalizeStatus(fo.status) === 'date_changed'
      )
    },

    isAllCompleted() {
      const fos = this.factoryOrders
      if (!fos.length) return false

      return fos.every((fo) => {
        const code = this.normalizeStatus(fo.status)

        if (code === 'canceled') return false

        if (code === 'finished' || code === 'confirmed') {
          return !!fo.admin_confirmation_date
        }

        return false
      })
    },

    isOverdue() {
      return (
        this.finishDate &&
        this.finishDate < new Date() &&
        !this.isAllCompleted &&
        !this.hasCanceled
      )
    },

    isNearDeadline() {
      if (!this.finishDate || this.isAllCompleted) return false
      const hoursLeft = (this.finishDate - Date.now()) / 36e5
      return hoursLeft > 0 && hoursLeft <= 24
    },

    isInProgress() {
      return (
        this.factoryOrders.length > 0 &&
        !this.isAllCompleted &&
        !this.hasCanceled
      )
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
      if (this.hasCanceled) return 'bg-rose-600 text-white'
      if (this.hasDateChanged) return 'bg-orange-500 text-white'
      if (this.isAllCompleted) return 'bg-emerald-600 text-white'
      if (this.isOverdue) return 'bg-red-600 text-white'
      if (this.isInProgress) return 'bg-amber-600 text-white'
      return 'bg-gray-500 text-white'
    },
  },

  methods: {
    normalizeStatus(raw) {
      if (!raw) return 'pending'
      const s = raw.toString().toLowerCase()
      if (s === 'finished' || s.includes('ավարտ')) return 'finished'
      if (s === 'canceled' || s === 'cancelled' || s.includes('մերժ'))
        return 'canceled'
      if (s === 'confirmed' || s.includes('հաստատ')) return 'confirmed'
      if (s === 'date_changed' || s.includes('ժամկետ')) return 'date_changed'
      if (s === 'pending' || s === '0' || s === 'null' || s === '-') {
        return 'pending'
      }
      return s
    },

    formatDeadline(date) {
      if (!date) return '—'
      const d = new Date(date)
      const daysLeft = Math.floor((d - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysLeft < 0) return 'Անցել է'
      if (daysLeft === 0) return 'Այսօր'
      if (daysLeft === 1) return 'Վաղը'
      return `${daysLeft} օր հետո`
    },
  },
}
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg;
}
.btn-view {
  @apply px-4 py-2 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition;
}
.badge {
  @apply rounded-full;
}
</style>
