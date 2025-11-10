<template>
  <div
    class="group relative flex flex-col rounded-2xl border bg-white p-4 text-sm shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800"
    :class="[
      cardStatusClass,
      isLocked
        ? 'opacity-60 cursor-not-allowed'
        : 'cursor-move hover:-translate-y-1 hover:shadow-xl',
    ]"
    :draggable="!isLocked"
    @dragstart="onDragStart"
  >
    <!-- Top: number + status badge -->
    <div class="mb-2 flex items-start justify-between gap-2">
      <div>
        <p class="text-xs text-gray-400 dark:text-gray-500">Պատվերի համար</p>
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-50">
          {{ order.order_number?.number || `Պատվեր #${order.id}` }}
        </h3>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Կոդ:
          <span class="font-mono">
            {{ order.prefix_code?.code }}
          </span>
        </p>
      </div>

      <span
        class="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
        :class="badgeClass"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- Description -->
    <p
      class="line-clamp-2 text-xs text-gray-600 dark:text-gray-300"
      :title="order.description"
    >
      {{ order.description || 'Առանց նկարագրության' }}
    </p>

    <!-- Meta -->
    <div
      class="mt-3 grid grid-cols-2 gap-2 text-[11px] text-gray-500 dark:text-gray-400"
    >
      <div class="flex flex-col gap-1">
        <span class="text-[10px] uppercase tracking-wide text-gray-400">
          Ստեղծման ամսաթիվ
        </span>
        <span class="font-medium text-gray-700 dark:text-gray-200">
          {{ order.created_at }}
        </span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-[10px] uppercase tracking-wide text-gray-400">
          Ավարտի ժամկետ
        </span>
        <span class="font-medium text-gray-700 dark:text-gray-200">
          {{
            order.dates?.finish_date
              ? $formatDate(order.dates.finish_date)
              : 'Հաշվի առնել'
          }}
        </span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-[10px] uppercase tracking-wide text-gray-400">
          Ստեղծող
        </span>
        <span class="font-medium text-gray-700 dark:text-gray-200">
          {{ order.creator?.name || '—' }}
        </span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-[10px] uppercase tracking-wide text-gray-400">
          Օպերատոր
        </span>
        <span class="font-medium text-gray-700 dark:text-gray-200">
          {{ operatorName || 'Չնշված' }}
        </span>
      </div>
    </div>

    <!-- Info about lock -->
    <p
      v-if="isTakenByOther"
      class="mt-2 text-[10px] font-medium text-red-500 flex items-center gap-1"
    >
      <span class="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
      Պատվերը վերցված է այլ օպերատորի կողմից
    </p>
    <p
      v-else-if="isCompleted"
      class="mt-2 text-[10px] font-medium text-emerald-600 flex items-center gap-1 dark:text-emerald-300"
    >
      <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Առաջադրանքը ավարտված է
    </p>

    <!-- Bottom actions -->
    <div class="mt-4 flex items-center justify-between pt-2">
      <button
        type="button"
        class="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
        @click.stop="$emit('view-details', order)"
      >
        Դիտել մանրամասն
        <svg
          class="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <button
        type="button"
        :disabled="isLocked"
        class="rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition-all"
        :class="
          isLocked
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:shadow-md dark:bg-indigo-600/20 dark:text-indigo-200 dark:hover:bg-indigo-600/30'
        "
        @click.stop="!isLocked && $emit('edit', order)"
      >
        Խմբագրել
      </button>
    </div>

    <!-- subtle drag hint -->
    <div
      v-if="!isLocked"
      class="pointer-events-none absolute -left-1 top-1/2 hidden -translate-y-1/2 text-xs text-gray-300 group-hover:inline"
    >
      ☰
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderCard',
  props: {
    order: {
      type: Object,
      required: true,
    },
    factoryId: {
      type: [Number, String],
      required: true,
    },
    currentUserId: {
      type: [Number, String],
      required: true,
    },
  },
  computed: {
    factoryOrder() {
      if (!this.order.factory_orders) return null
      return this.order.factory_orders.find(
        (o) => String(o.factory_id) === String(this.factoryId)
      )
    },
    status() {
      const s = this.factoryOrder?.status
      if (!s || s === 'pending') return null
      return s
    },
    operatorName() {
      return this.factoryOrder?.operator?.name || null
    },
    statusLabel() {
      return this.status || 'Առանց կարգավիճակի'
    },
    isTakenByOther() {
      const opId = this.factoryOrder?.operator_id
      if (!opId) return false
      return String(opId) !== String(this.currentUserId)
    },
    isCompleted() {
      return this.status === 'Ավարտել'
    },
    isLocked() {
      return this.isTakenByOther || this.isCompleted
    },
    badgeClass() {
      switch (this.status) {
        case 'Հաստատել':
          return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-200'
        case 'Մերժել':
          return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-200'
        case 'Կատարման ժամկետի փոխարինում':
          return 'bg-orange-100 text-orange-700 dark:bg-orange-700/30 dark:text-orange-200'
        case 'Ավարտել':
          return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700/30 dark:text-emerald-200'
        default:
          return 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-200'
      }
    },
    cardStatusClass() {
      if (this.status === 'Ավարտել') {
        return 'border-emerald-200 dark:border-emerald-500/50'
      }
      if (this.status === 'Մերժել') {
        return 'border-red-200 dark:border-red-500/50'
      }
      if (this.status === 'Կատարման ժամկետի փոխարինում') {
        return 'border-orange-200 dark:border-orange-500/50'
      }
      if (this.status === 'Հաստատել') {
        return 'border-green-200 dark:border-green-500/50'
      }
      return ''
    },
  },
  methods: {
    onDragStart(e) {
      if (this.isLocked) {
        e.preventDefault()
        return
      }
      e.dataTransfer.effectAllowed = 'move'
      this.$emit('drag-start', this.order)
    },
  },
}
</script>
