<!-- components/engineer/OrderCard.vue -->
<template>
  <div
    class="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm border-2 transition-all duration-300 p-5 hover:shadow-xl"
    :class="cardBorderClass"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <div class="text-xs uppercase tracking-wider text-gray-400 mb-1">
          #{{ order.order_number?.number || '—' }} ·
          {{ order.prefix_code?.code || '—' }}
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ order.name || 'Անանուն պատվեր' }}
        </h3>
      </div>

      <!-- Ընդհանուր կարգավիճակ + Ստեղծող -->
      <div class="flex flex-col items-end gap-2">
        <span
          class="px-3 py-1 rounded-full text-xs font-medium text-white"
          :class="overallStatusClass"
        >
          {{ overallStatusText }}
        </span>

        <span
          class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
          title="Ստեղծող"
        >
          {{ order.creator?.name ?? `ID: ${order.creator_id ?? '—'}` }}
        </span>
      </div>
    </div>

    <p class="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
      {{ order.description || '—' }}
    </p>

    <!-- Գործարաններ և նրանց կարգավիճակները -->
    <div class="mt-4 space-y-2">
      <div
        v-for="(fo, idx) in order.factory_orders"
        :key="idx"
        class="flex items-center justify-between text-xs"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-E rounded-full ring-2 ring-white dark:ring-gray-900 flex items-center justify-center text-white text-[10px] font-bold"
            :class="factoryColorClass(fo.factory?.value)"
            :title="fo.factory?.name"
          >
            {{ (fo.factory?.name || 'F')[0] }}
          </div>
          <span class="text-gray-600 dark:text-gray-400">{{
            fo.factory?.name
          }}</span>
        </div>

        <span
          class="px-3 py-1 rounded-full text-xs font-medium text-white"
          :class="factoryStatusClass(fo.status)"
        >
          {{ formatStatus(fo.status) }}
        </span>
      </div>
    </div>

    <!-- Տեղեկատվություն -->
    <div
      class="mt-5 grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400"
    >
      <div class="flex items-center gap-2">
        <svg
          class="w-4 h-4 opacity-80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 0 0 2-2v-6H3v6a2 2 0 0 0 2 2Z"
          />
        </svg>
        <span>Ստեղծվել՝ {{ order.created_at }}</span>
      </div>

      <div class="flex items-center gap-2">
        <svg
          class="w-4 h-4 opacity-80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 7l9 6 9-6-9-4-9 4Zm0 0v10l9 4 9-4V7"
          />
        </svg>
        <span>Ֆայլեր՝ {{ filesCount }}</span>
      </div>

      <!-- Ժամկետ -->
      <div class="flex items-center gap-2 col-span-2">
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span :class="deadlineClass">
          Ավարտ՝ {{ formatDeadline(order.dates?.finish_date) }}
        </span>
      </div>
    </div>

    <div class="mt-5 flex items-center justify-between">
      <div class="flex -space-x-2">
        <div
          v-for="(fo, idx) in (order.factory_orders || []).slice(0, 3)"
          :key="idx"
          class="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-900 flex items-center justify-center text-white text-xs font-bold"
          :class="factoryColorClass(fo.factory?.value)"
          :title="fo.factory?.name"
        >
          {{ (fo.factory?.name || 'F')[0] }}
        </div>
      </div>

      <button
        class="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-95 transition"
        @click="$emit('open', order)"
      >
        Բացել
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    order: { type: Object, required: true },
  },

  computed: {
    filesCount() {
      const selected = (this.order.selected_files || []).reduce(
        (a, s) => a + (Number(s.quantity) || 1),
        0
      )
      if (selected > 0) return selected

      return (this.order.factory_orders || []).reduce((acc, fo) => {
        return (
          acc +
          (fo.files || []).reduce((b, f) => {
            const q = f.pivot?.quantity || f.quantity || 1
            return b + Number(q)
          }, 0)
        )
      }, 0)
    },

    // Ընդհանուր կարգավիճակ
    overallStatusText() {
      const statuses = (this.order.factory_orders || []).map((fo) =>
        fo.status?.toLowerCase().trim()
      )
      if (statuses.length === 0) return 'Չկա'

      if (statuses.includes('canceled')) return 'Չեղարկված'
      if (
        statuses.every(
          (s) => s === 'done' || s === 'completed' || s === 'confirmed'
        )
      )
        return 'Ավարտված'
      if (statuses.some((s) => s === 'pending' || s === 'in_progress'))
        return 'Ընթացքում'
      return 'Այլ'
    },

    overallStatusClass() {
      const statuses = (this.order.factory_orders || []).map((fo) =>
        fo.status?.toLowerCase().trim()
      )

      if (statuses.includes('canceled')) return 'bg-rose-600'
      if (statuses.every((s) => ['done', 'completed', 'confirmed'].includes(s)))
        return 'bg-emerald-600'
      if (statuses.some((s) => ['pending', 'in_progress'].includes(s)))
        return 'bg-amber-600'
      return 'bg-blue-600'
    },

    // Ժամկետի գույնը
    deadlineClass() {
      const finishDate = this.order.dates?.finish_date
      if (!finishDate) return 'text-gray-500'

      const diff = this.hoursUntil(finishDate)
      if (diff < 0) return 'text-rose-600 font-bold animate-pulse'
      if (diff <= 24) return 'text-orange-600 font-bold'
      return 'text-gray-500'
    },

    // Քարտի եզրագիծը՝ կախված ժाभկետից
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
    formatDate(date) {
      if (!date) return '—'
      const d = new Date(date)
      return d.toLocaleDateString('hy-AM')
    },

    formatDeadline(date) {
      if (!date) return '—'
      const d = new Date(date)
      const now = new Date()
      const diff = d - now
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )

      if (diff < 0) return 'Անցել է ժամկետը'
      if (days === 0)
        return `Այսօր ${d.toLocaleTimeString('hy-AM', {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      if (days === 1) return 'Վաղը'
      return `${days} օր ${hours} ժամ`
    },

    hoursUntil(dateStr) {
      if (!dateStr) return Infinity
      const target = new Date(dateStr)
      const now = new Date()
      return (target - now) / (1000 * 60 * 60)
    },

    formatStatus(status) {
      if (!status) return '—'
      const map = {
        pending: 'Սպասում',
        in_progress: 'Ընթացքում',
        done: 'Ավարտված',
        completed: 'Ավարտված',
        confirmed: 'Հաստատված',
        canceled: 'Չեղարկված',
        Ավարտել: 'Ավարտված',
      }
      return map[status.toLowerCase().trim()] || status
    },

    factoryStatusClass(status) {
      if (!status) return 'bg-gray-500'
      const s = status.toLowerCase().trim()
      if (s.includes('canceled')) return 'bg-rose-600'
      if (
        ['done', 'completed', 'confirmed', 'Ավարտել'].some((x) => s.includes(x))
      )
        return 'bg-emerald-600'
      if (['pending', 'in_progress'].some((x) => s.includes(x)))
        return 'bg-amber-600'
      return 'bg-blue-600'
    },

    factoryColorClass(value) {
      const colors = {
        DXF: 'bg-purple-600',
        DLD: 'bg-indigo-600',
        CNC: 'bg-pink-600',
        Bend: 'bg-indigo-600',
        'Laser cutting': 'bg-purple-600',
      }
      return colors[value] || 'bg-gray-600'
    },
  },
}
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
