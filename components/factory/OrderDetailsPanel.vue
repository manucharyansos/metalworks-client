<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Left: DXF Viewer -->
    <div
      class="flex items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white/80 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/70"
    >
      <div class="w-full h-full max-w-md">
        <div class="mb-4 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white"
            >
              DXF
            </div>
            <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Ֆայլի դիտում
            </h3>
          </div>

          <p class="text-[11px] text-gray-400 dark:text-gray-500">
            Ընտրեք ֆայլ «Դիտել» կոճակով
          </p>
        </div>

        <div
          class="relative flex min-h-[230px] h-[calc(100%-5rem)] items-center justify-center rounded-2xl bg-gray-100 shadow-inner dark:bg-gray-800"
        >
          <div
            v-if="dxfUrl"
            class="h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <DxfViewerModal :key="dxfUrl" :dxf-url="dxfUrl" />
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center px-4 text-center text-xs text-gray-500 dark:text-gray-400"
          >
            <svg
              class="mb-2 h-9 w-9 text-gray-300 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            DXF ֆայլի նախադիտումը կհայտնվի այստեղ
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Order Info + Files -->
    <div class="space-y-5">
      <!-- Order main info -->
      <div
        class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200/80 dark:bg-gray-800 dark:ring-gray-700"
      >
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <h3
              class="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white"
            >
              Առաջադրանքի մանրամասներ
              <span
                v-if="details?.order_number?.number"
                class="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-indigo-700 dark:bg-indigo-600/20 dark:text-indigo-200"
              >
                {{ details.order_number.number }}
              </span>
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Ստեղծող՝
              <span class="font-medium text-gray-800 dark:text-gray-100">
                {{ details?.creator?.name || '—' }}
              </span>
            </p>
          </div>

          <!-- Dates / deadline -->
          <div class="flex flex-col items-end gap-2 text-[11px]">
            <div
              class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
            >
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5A2 2 0 003 7v12a2 2 0 002 2z"
                />
              </svg>
              <span class="font-medium">Ստեղծման ամսաթիվ․</span>
              <span>{{ details?.created_at || '—' }}</span>
            </div>

            <div
              v-if="details?.dates?.finish_date"
              class="inline-flex items-center gap-2 rounded-full px-2 py-1"
              :class="deadlineBadgeClass"
            >
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
                  d="M12 8v4l3 3m5-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="font-semibold">
                Ավարտի ժամկետ․ {{ $formatDate(details.dates.finish_date) }}
              </span>
              <span
                v-if="deadlineInfo"
                class="rounded-full bg-white/40 px-2 py-0.5 text-[10px] font-medium"
              >
                {{ deadlineInfo }}
              </span>
            </div>
            <div
              v-else
              class="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-[11px] font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
            >
              Ժամկետը չի նշված, անհրաժեշտ է հաշվի առնել։
            </div>
          </div>
        </div>

        <!-- Main fields -->
        <dl
          class="grid grid-cols-1 gap-4 text-sm text-gray-700 dark:text-gray-100 sm:grid-cols-2"
        >
          <div>
            <dt class="text-[11px] uppercase tracking-wide text-gray-400">
              Անուն
            </dt>
            <dd class="mt-1 font-medium">
              {{ details.name || '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-[11px] uppercase tracking-wide text-gray-400">
              Քանակ
            </dt>
            <dd class="mt-1 font-medium">
              {{ details.quantity || 0 }}
            </dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-[11px] uppercase tracking-wide text-gray-400">
              Նկարագրություն
            </dt>
            <dd
              class="mt-1 text-sm text-gray-700 dark:text-gray-300 break-words"
            >
              {{ details.description || 'Առանց նկարագրության' }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Files list -->
      <div
        v-if="details.factory_orders?.length"
        class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200/80 dark:bg-gray-800 dark:ring-gray-700"
      >
        <div class="mb-3 flex items-center justify-between gap-2">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
            Ֆայլեր
          </h4>
          <span
            class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200"
          >
            {{ totalFiles }} ֆայլ
          </span>
        </div>

        <div class="max-h-[320px] space-y-3 overflow-y-auto pr-1 custom-scroll">
          <div
            v-for="order in details.factory_orders"
            :key="order.id"
            class="rounded-2xl border border-gray-200 bg-gray-50/80 p-3 text-xs shadow-sm dark:border-gray-700 dark:bg-gray-900/60"
          >
            <!-- Factory + operator + status row -->
            <div
              class="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400"
            >
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-bold text-white"
                >
                  {{ order.factory?.value?.[0] || 'F' }}
                </span>
                <div>
                  <p class="font-medium text-gray-800 dark:text-gray-100">
                    {{ order.factory?.name || 'Գործարան' }}
                  </p>
                  <p class="text-[10px] text-gray-400 dark:text-gray-500">
                    {{ order.factory?.value || '' }}
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <span v-if="order.operator" class="flex items-center gap-1">
                  <span class="text-gray-400">Օպերատոր․</span>
                  <span class="font-medium text-gray-700 dark:text-gray-100">
                    {{ order.operator.name }}
                  </span>
                </span>
                <span
                  v-if="order.status"
                  class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  :class="statusPillClass(order.status)"
                >
                  {{ order.status }}
                </span>
              </div>
            </div>

            <!-- Files inside factory order -->
            <div
              v-for="file in order.files"
              :key="file.id"
              class="mb-2 rounded-xl bg-white p-3 shadow-sm last:mb-0 dark:bg-gray-800"
            >
              <div class="mb-2 flex items-center justify-between gap-4">
                <div class="flex min-w-0 flex-1 flex-col">
                  <p
                    class="truncate text-xs font-semibold text-gray-900 dark:text-gray-50"
                    :title="file.original_name"
                  >
                    {{ file.original_name }}
                  </p>
                  <p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    {{ file.path }}
                  </p>
                </div>
                <div class="flex flex-shrink-0 items-center gap-2">
                  <button
                    class="text-xs font-medium text-blue-500 hover:text-blue-700"
                    @click="$emit('view-file', file.path)"
                  >
                    Դիտել
                  </button>
                  <button
                    class="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:text-emerald-200 dark:hover:bg-emerald-600/30"
                    :class="{ 'text-black': file.status === 'downloaded' }"
                    @click="$emit('download-file', file)"
                  >
                    Ներբեռնել
                    <img class="h-4 w-4" src="/images/img.png" alt="" />
                  </button>
                </div>
              </div>

              <div
                class="grid grid-cols-3 gap-2 text-[11px] text-gray-600 dark:text-gray-300"
              >
                <p>
                  <span class="font-semibold">Քանակ․ </span>
                  <span
                    v-if="details.link_existing_files"
                    class="inline-flex items-center gap-1"
                  >
                    <span class="line-through text-gray-400">
                      {{ file.quantity ?? '—' }}
                    </span>
                    <span class="text-gray-400">→</span>
                    <span class="font-bold text-green-600">
                      {{ file.pivot?.quantity ?? '—' }}
                    </span>
                  </span>
                  <span v-else>
                    {{ file.quantity ?? '—' }}
                  </span>
                </p>
                <p>
                  <span class="font-semibold">Նյութ․ </span>
                  <span>{{ file?.material_type || '—' }}</span>
                </p>
                <p>
                  <span class="font-semibold">Հաստություն․ </span>
                  <span>{{ file?.thickness || '—' }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No files -->
      <div
        v-else
        class="rounded-3xl bg-white p-5 text-sm text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-300"
      >
        Ֆայլեր այս պատվերի համար առկա չեն։
      </div>
    </div>
  </div>
</template>

<script>
import DxfViewerModal from '@/components/File/DxfViewerModal.vue'

export default {
  name: 'OrderDetailsPanel',
  components: { DxfViewerModal },
  props: {
    details: {
      type: Object,
      required: true,
    },
    dxfUrl: {
      type: String,
      default: '',
    },
  },
  computed: {
    totalFiles() {
      if (!this.details?.factory_orders?.length) return 0
      return this.details.factory_orders.reduce(
        (sum, fo) => sum + (fo.files?.length || 0),
        0
      )
    },
    // status pill style per order.status
    // օգտագործում ենք ֆայլերի քարտի վրա
    // օրինակ՝ Հաստատել, Մերժել, Ավարտել...
    deadlineBadgeClass() {
      switch (this.deadlineStatus) {
        case 'overdue':
          return 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-100'
        case 'today':
          return 'bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-100'
        case 'upcoming':
          return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100'
        default:
          return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100'
      }
    },
    deadlineStatus() {
      const dateStr = this.details?.dates?.finish_date
      if (!dateStr) return 'none'

      const dt = this.parseDate(dateStr)
      if (!dt) return 'none'

      const today = new Date()
      // чистим время
      today.setHours(0, 0, 0, 0)
      const deadline = new Date(dt)
      deadline.setHours(0, 0, 0, 0)

      const diffDays = Math.round(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays < 0) return 'overdue'
      if (diffDays === 0) return 'today'
      return 'upcoming'
    },
    deadlineInfo() {
      const dateStr = this.details?.dates?.finish_date
      if (!dateStr) return ''

      const dt = this.parseDate(dateStr)
      if (!dt) return ''

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const deadline = new Date(dt)
      deadline.setHours(0, 0, 0, 0)

      const diffDays = Math.round(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays > 0) return `մնացյալ ${diffDays} օր`
      if (diffDays === 0) return 'վերջնաժամկետը այսօր է'
      return `ավարտվել է ${Math.abs(diffDays)} օր առաջ`
    },
  },
  methods: {
    parseDate(str) {
      // backend-ից գալիս է "2025-11-23 13:06:00" ֆորմատով
      try {
        if (!str) return null
        // եթե T չկա, ավելացնենք, որ Date-ը ճիշտ կարդա
        if (str.includes(' ')) {
          return new Date(str.replace(' ', 'T'))
        }
        return new Date(str)
      } catch (e) {
        return null
      }
    },
    statusPillClass(status) {
      switch (status) {
        case 'Հաստատել':
          return 'bg-green-100 text-green-700 dark:bg-green-700/40 dark:text-green-100'
        case 'Մերժել':
          return 'bg-red-100 text-red-700 dark:bg-red-700/40 dark:text-red-100'
        case 'Կատարման ժամկետի փոխարինում':
          return 'bg-orange-100 text-orange-700 dark:bg-orange-700/40 dark:text-orange-100'
        case 'Ավարտել':
          return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700/40 dark:text-emerald-100'
        default:
          return 'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-100'
      }
    },
  },
}
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.7);
  border-radius: 9999px;
}
</style>
