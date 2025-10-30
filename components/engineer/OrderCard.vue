<!-- components/engineer/OrderCard.vue -->
<template>
  <div
    class="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 hover:shadow-xl hover:border-blue-200 transition duration-300 ease-out"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-xs uppercase tracking-wider text-gray-400 mb-1">
          #{{ order.order_number?.number || '—' }} ·
          {{ order.prefix_code?.code || '—' }}
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ order.name || 'Անանուն պատվեր' }}
        </h3>
      </div>

      <!-- Creator -->
      <div class="flex flex-col items-center justify-center gap-1">
        <span
          class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          title="Ստեղծող"
        >
          {{ order.creator?.name ?? `ID: ${order.creator_id ?? '—'}` }}
        </span>
        <span
          class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          title="Կարգավիճակ"
        >
          {{ order.status }}
        </span>
      </div>
    </div>

    <p class="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
      {{ order.description || '—' }}
    </p>

    <div
      class="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400"
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
        <span>Ստեղծվել է՝ {{ order.created_at || '—' }}</span>
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
            d="m3 7 9 6 9-6-9-4-9 4Zm0 0v10l9 4 9-4V7"
          />
        </svg>
        <span>Ֆայլեր՝ {{ filesCount }}</span>
      </div>
    </div>

    <div class="mt-5 flex items-center justify-between">
      <div class="flex -space-x-2">
        <div
          v-for="(f, idx) in (order.factory_orders || []).slice(0, 3)"
          :key="idx"
          class="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gradient-to-br from-blue-500 to-indigo-500 grid place-items-center text-white text-xs"
          :title="f.factory?.name || 'Factory'"
        >
          {{ (f.factory?.name || 'F')[0] }}
        </div>
      </div>

      <button
        class="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-[.98] transition"
        @click="$emit('open', order)"
      >
        Բացել
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: { order: { type: Object, required: true } },
  computed: {
    filesCount() {
      // 1) Եթե կան ընտրած ֆայլեր՝ գումարում ենք դրանց quantity-ն (default=1)
      const selected = (this.order.selected_files || []).reduce(
        (a, s) => a + (Number(s.quantity) || 1),
        0
      )

      if (selected > 0) return selected

      // 2) Հակառակ դեպքում՝ վերցնում ենք factory_orders.files-ի քանակները
      const fromFactories = (this.order.factory_orders || []).reduce(
        (acc, fo) => {
          const sumFiles = (fo.files || []).reduce((b, f) => {
            // նախ՝ pivot.quantity, հետո՝ ֆայլի quantity, վերջում՝ 1
            const q =
              (f.pivot && Number(f.pivot.quantity)) || Number(f.quantity) || 1
            return b + q
          }, 0)
          return acc + sumFiles
        },
        0
      )

      return fromFactories
    },
  },
}
</script>

<style scoped>
.card-enter-active,
.card-leave-active {
  transition: all 0.35s ease;
}
.card-enter,
.card-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
