<template>
  <transition name="fade-zoom">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />

      <div
        class="relative max-h-[90vh] overflow-y-auto w-[95%] max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6"
        role="dialog"
        aria-modal="true"
        @keydown.esc="$emit('close')"
      >
        <div class="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Պատվեր #{{ number || order?.id || '—' }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              <span v-if="code">Կոդ — {{ code }}</span>
            </p>
          </div>
          <button
            class="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
            aria-label="Փակել"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div
            class="p-4 rounded-xl border border-gray-200 dark:border-gray-800"
          >
            <div class="text-xs opacity-60 mb-1">Անուն</div>
            <div class="font-medium">{{ order?.name || '—' }}</div>
          </div>

          <div
            class="p-4 rounded-xl border border-gray-200 dark:border-gray-800"
          >
            <div class="text-xs opacity-60 mb-1">Ստեղծող</div>
            <div class="font-medium">{{ creatorName }}</div>
          </div>

          <div
            class="p-4 rounded-xl border border-gray-200 dark:border-gray-800"
          >
            <div class="text-xs opacity-60 mb-1">Կարգավիճակ</div>
            <span
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
              :class="statusBadge"
            >
              {{ (order?.status || '—').toUpperCase() }}
            </span>
          </div>

          <div
            class="p-4 rounded-xl border border-gray-200 dark:border-gray-800"
          >
            <div class="text-xs opacity-60 mb-1">Ստեղծվել է</div>
            <div class="font-medium">{{ safeDate(order?.created_at) }}</div>
          </div>

          <div
            class="p-4 rounded-xl border border-gray-200 dark:border-gray-800 md:col-span-2"
          >
            <div class="text-xs opacity-60 mb-1">Նկարագրություն</div>
            <div class="whitespace-pre-line">
              {{ order?.description || '—' }}
            </div>
          </div>
        </div>

        <div v-if="finishDate" class="mb-6">
          <h4 class="text-sm font-semibold mb-2">Ժամանակագրություն</h4>
          <ul class="space-y-2">
            <li class="flex items-start gap-3">
              <span
                class="w-2 h-2 rounded-full bg-blue-600 mt-2 animate-ping"
                :class="{
                  'bg-red-500': isOverdue,
                  'bg-blue-600 animate-ping': !isOverdue,
                }"
              ></span>
              <div class="flex-1">
                <div class="text-sm font-medium">Ավարտի պլանային օր</div>
                <div class="text-xs opacity-70">
                  {{ safeDateTime(finishDate) }}
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div class="mb-3 flex flex-wrap items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-300"
            >Ֆայլերի ամփոփում</span
          >
          <span
            class="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
          >
            Ընտրված՝ {{ selectedCount }}
          </span>
          <span
            class="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
          >
            Արտադրամասերից՝ {{ factoryCount }}
          </span>
          <span
            class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Ընդամենը՝ {{ totalCount }}
          </span>
        </div>

        <div v-if="(order?.factory_orders || []).length" class="mb-6">
          <h4 class="text-sm font-semibold mb-2">Արտադրամասեր</h4>
          <div class="space-y-4">
            <div
              v-for="fo in order.factory_orders"
              :key="fo.id"
              class="rounded-xl border border-gray-200 dark:border-gray-800 p-4"
            >
              <div class="flex items-center justify-between mb-3">
                <div>
                  <div class="text-sm font-semibold">
                    {{ fo.factory?.name || 'Արտադրամաս' }}
                  </div>
                  <div class="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    Կատարող՝
                    <span class="font-medium">
                      {{ fo.operator?.name || '—' }}
                    </span>
                  </div>
                </div>
                <div class="text-xs opacity-70">
                  Ֆայլեր՝ {{ countFactoryFiles(fo) }}
                </div>
              </div>

              <FileGallery :items="fo.files || []" />
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            @click="$emit('close')"
          >
            Փակել
          </button>
        </div>
      </div>
    </div>
    <notifications />
  </transition>
</template>

<script>
import FileGallery from '~/components/engineer/FileGallery.vue'

export default {
  name: 'OrderDetailsModal',
  components: { FileGallery },
  props: {
    visible: { type: Boolean, default: false },
    order: { type: Object, default: null },
  },
  computed: {
    number() {
      return this.order?.order_number?.number
    },
    code() {
      return this.order?.prefix_code?.code
    },
    creatorName() {
      return this.order?.creator?.name ?? `ID: ${this.order?.creator_id ?? '—'}`
    },
    finishDate() {
      return this.order?.dates?.finish_date || null
    },
    isOverdue() {
      if (!this.finishDate) return false
      const finish = new Date(this.finishDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      finish.setHours(0, 0, 0, 0)
      return finish <= today
    },
    selectedCount() {
      const arr = this.order?.selected_files || []
      return arr.reduce((a, s) => a + (Number(s.quantity) || 1), 0)
    },
    factoryCount() {
      const fos = this.order?.factory_orders || []
      return fos.reduce((acc, fo) => {
        const sum = (fo.files || []).reduce((b, f) => {
          const q =
            (f.pivot && Number(f.pivot.quantity)) || Number(f.quantity) || 1
          return b + q
        }, 0)
        return acc + sum
      }, 0)
    },
    totalCount() {
      return this.selectedCount + this.factoryCount
    },
    statusBadge() {
      const s = (this.order?.status || '').toLowerCase()
      if (s === 'pending')
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      if (s === 'done' || s === 'completed')
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      if (s === 'canceled')
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    },
  },
  methods: {
    safeDate(d) {
      if (!d) return '—'
      const dt = new Date(d)
      return isNaN(dt) ? d : dt.toLocaleDateString()
    },
    safeDateTime(d) {
      if (!d) return '—'
      const dt = new Date(d)
      return isNaN(dt) ? d : dt.toLocaleString()
    },
    countFactoryFiles(fo) {
      return (fo?.files || []).reduce((b, f) => {
        const q =
          (f.pivot && Number(f.pivot.quantity)) || Number(f.quantity) || 1
        return b + q
      }, 0)
    },
  },
}
</script>

<style scoped>
.fade-zoom-enter-active,
.fade-zoom-leave-active {
  transition: all 0.18s ease;
}
.fade-zoom-enter,
.fade-zoom-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
