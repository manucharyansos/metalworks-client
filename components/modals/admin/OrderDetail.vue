<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto h-full flex flex-col">
    <!-- Header -->
    <header
      class="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-800"
    >
      <div class="flex-1">
        <h1
          class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
        >
          Պատվեր #{{ localOrder?.id }}
        </h1>
        <div
          class="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400"
        >
          <span>Ստեղծվել է {{ formatDate(localOrder?.created_at) }}</span>
          <span class="hidden sm:inline">•</span>
          <div class="flex items-center gap-2">
            <span>Ընդհանուր կարգավիճակ՝</span>
            <span
              class="px-3 py-1 rounded-full text-xs font-semibold"
              :class="overallStatusClass"
            >
              {{ overallStatusText }}
            </span>
          </div>
        </div>
      </div>
      <button
        class="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110"
        @click="$emit('close')"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </header>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto space-y-8 custom-scroll">
      <!-- Top Grid: Main Info + Customer -->
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Հիմնական տվյալներ -->
        <div
          class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-5"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Հիմնական տվյալներ
          </h3>

          <div class="space-y-4">
            <div>
              <label
                class="text-xs font-medium text-gray-500 dark:text-gray-400"
                >Անվանում</label
              >
              <input
                v-model="localOrder.name"
                type="text"
                class="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-medium text-gray-500">Համար</label>
                <p class="mt-1 font-semibold text-gray-900 dark:text-white">
                  {{ localOrder.order_number?.number || '—' }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500">Prefix</label>
                <p
                  class="mt-1 font-semibold text-indigo-600 dark:text-indigo-400"
                >
                  {{ localOrder.prefix_code?.code || '—' }}
                </p>
              </div>
            </div>

            <div>
              <label
                class="text-xs font-medium text-gray-500 dark:text-gray-400"
                >Ավարտի ամսաթիվ</label
              >
              <input
                v-model="localOrder.dates.finish_date"
                type="datetime-local"
                class="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition"
                :class="{
                  'border-red-500 ring-2 ring-red-500': isOverdue,
                  'border-orange-500 ring-2 ring-orange-500':
                    isNear && !isOverdue,
                }"
              />
              <p v-if="isOverdue" class="mt-2 text-sm font-medium text-red-600">
                Ժամկետն անցել է
              </p>
              <p
                v-else-if="isNear"
                class="mt-2 text-sm font-medium text-orange-600"
              >
                24 ժամից քիչ է մնացել
              </p>
            </div>

            <div>
              <label
                class="text-xs font-medium text-gray-500 dark:text-gray-400"
                >Արտաքին հղում</label
              >
              <input
                v-model="storeLinkUrl"
                type="url"
                placeholder="https://example.com"
                class="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        <!-- Հաճախորդ -->
        <div
          class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text:white mb-5">
            Հաճախորդ
          </h3>
          <div class="space-y-4 text-sm">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold"
              >
                {{
                  localOrder.client?.user?.name?.[0] ||
                  localOrder.user?.name?.[0] ||
                  '?'
                }}
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{
                    localOrder.client?.user?.name ||
                    localOrder.user?.name ||
                    'Անհայտ'
                  }}
                </p>
                <p class="text-xs text-gray-500">
                  {{
                    localOrder.client?.user?.email ||
                    localOrder.user?.email ||
                    '—'
                  }}
                </p>
              </div>
            </div>
            <div class="pt-3 border-t border-indigo-200 dark:border-indigo-800">
              <p class="text-gray-600 dark:text-gray-400">
                {{
                  `Հեռախոս՝ ${
                    localOrder.client?.phone ||
                    localOrder.user?.phone ||
                    '—'
                  }`
                }}
              </p>
              <p class="text-gray-600 dark:text-gray-400">
                {{
                  `Էլ․ փոստ՝ ${
                    localOrder.client?.email ||
                    localOrder.user?.email ||
                    '—'
                  }`
                }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
      >
        <h3 class="text-lg font-semibold mb-4">Նկարագրություն</h3>
        <textarea
          v-model="localOrder.description"
          rows="4"
          class="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-indigo-500 transition"
        ></textarea>
      </div>

      <!-- Գործարաններ -->
      <div class="space-y-5">
        <h3 class="text-xl font-bold">Գործարաններ</h3>
        <div
          v-if="localOrder.factory_orders?.length"
          class="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          <div
            v-for="fo in localOrder.factory_orders"
            :key="fo.id"
            class="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300 group"
          >
            <!-- Status ribbon -->
            <div class="absolute top-0 right-0 m-3">
              <span
                class="px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                :class="factoryStatusClass(fo.status)"
              >
                {{ factoryStatusLabel(fo.status) }}
              </span>
            </div>

            <div class="p-6 pt-10">
              <h4 class="font-bold text-lg text-gray-900 dark:text-white">
                {{ fo.factory?.name || 'Անհայտ' }}
              </h4>
              <p class="text-sm text-gray-500 mt-1">
                Օպերատոր՝ {{ fo.operator?.name || '—' }}
              </p>

              <div class="mt-4 space-y-2 text-sm">
                <p
                  v-if="fo.finish_date"
                  class="text-gray-600 dark:text-gray-400"
                >
                  Ավարտ՝ {{ formatDate(fo.finish_date) }}
                </p>
                <p
                  v-if="fo.canceling"
                  class="text-red-600 dark:text-red-400 font-medium"
                >
                  Մերժված՝ {{ fo.canceling }}
                </p>
                <p
                  v-if="fo.admin_confirmation_date"
                  class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Հաստատված է ադմինի կողմից
                </p>
              </div>

              <!-- Confirm button -->
              <div
                v-if="
                  normalizeStatus(fo.status) === 'finished' &&
                  !fo.admin_confirmation_date
                "
                class="mt-5"
              >
                <button
                  :disabled="confirmingId === fo.id"
                  class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70"
                  @click="confirmFactoryFinish(fo)"
                >
                  <svg
                    v-if="confirmingId === fo.id"
                    class="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Հաստատել ավարտը
                </button>
              </div>
            </div>
          </div>
        </div>

        <p
          v-else
          class="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-2xl"
        >
          Դեռ գործարաններ չեն կապված
        </p>
      </div>

      <!-- Ընտրված ֆայլեր + Լոգեր -->
      <div class="grid lg:grid-cols-2 gap-8">
        <div
          class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
        >
          <h3 class="text-lg font-semibold mb-4">Ընտրված ֆայլեր</h3>
          <div v-if="localOrder.selected_files?.length" class="space-y-3">
            <div
              v-for="sf in localOrder.selected_files"
              :key="sf.id"
              class="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl"
            >
              <span class="font-medium text-sm">{{
                sf.pmp_file?.original_name
              }}</span>
              <span class="text-indigo-600 dark:text-indigo-400 font-bold"
                >×{{ sf.quantity }}</span
              >
            </div>
          </div>
          <p v-else class="text-gray-500 text-center py-8">
            Ֆայլեր չեն ընտրվել
          </p>
        </div>

        <div
          class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
        >
          <h3 class="text-lg font-semibold mb-4">Վերջին գործողությունները</h3>
          <div
            v-if="localOrder.logs?.length"
            class="space-y-4 max-h-64 overflow-y-auto"
          >
            <div
              v-for="log in localOrder.logs.slice(-5)"
              :key="log.id"
              class="flex gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <div class="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
              <div class="flex-1">
                <div class="flex justify-between text-xs">
                  <span class="font-medium">{{
                    log.user?.name || 'Համակարգ'
                  }}</span>
                  <span class="text-gray-500">{{
                    formatDate(log.created_at)
                  }}</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ log.message }}
                </p>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-500 text-center py-8">
            Դեռ գործողություններ չկան
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer
      class="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 mt-8 border-t border-gray-200 dark:border-gray-800"
    >
      <button
        class="w-full sm:w-auto px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        @click="$emit('close')"
      >
        Փակել
      </button>
      <button
        :disabled="saving"
        class="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-3 disabled:opacity-70"
        @click="save"
      >
        <svg
          v-if="saving"
          class="w-5 h-5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        {{ saving ? 'Պահպանվում է...' : 'Պահպանել փոփոխությունները' }}
      </button>
    </footer>
  </div>
</template>

<script>
export default {
  props: { order: { type: Object, required: true } },
  emits: ['close', 'saved'],
  data() {
    return {
      saving: false,
      confirmingId: null,
      localOrder: null,
      storeLinkUrl: '',
    }
  },
  computed: {
    factoryOrders() {
      return this.localOrder?.factory_orders || []
    },

    finishDate() {
      if (!this.localOrder?.dates?.finish_date) return null
      return new Date(this.localOrder.dates.finish_date)
    },

    hasCanceled() {
      return this.factoryOrders.some(
        (fo) => this.normalizeStatus(fo.status) === 'canceled'
      )
    },

    // ՆՈՐԸ՝ կա՞ factory_order, որի status-ը date_changed է
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

    isNear() {
      if (!this.finishDate) return false
      const hoursLeft = (this.finishDate - Date.now()) / 36e5
      return (
        hoursLeft > 0 &&
        hoursLeft <= 24 &&
        !this.isAllCompleted &&
        !this.hasCanceled
      )
    },

    isInProgress() {
      return (
        this.factoryOrders.length > 0 &&
        !this.isAllCompleted &&
        !this.hasCanceled
      )
    },

    overallStatusText() {
      // 💡 Կարգը՝ նախ մերժված, հետո ժամկետը փոփոխված
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

  watch: {
    order: {
      deep: true,
      handler(newVal) {
        this.resetLocal(newVal)
      },
    },
  },
  created() {
    this.resetLocal(this.order)
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

    factoryStatusLabel(status) {
      const code = this.normalizeStatus(status)
      switch (code) {
        case 'finished':
          return 'Ավարտված'
        case 'canceled':
          return 'Մերժված'
        case 'confirmed':
          return 'Հաստատված'
        case 'date_changed':
          return 'Ժամկետը փոփոխված'
        case 'pending':
        default:
          return 'Սպասում է'
      }
    },

    factoryStatusClass(status) {
      const code = this.normalizeStatus(status)
      if (code === 'finished')
        return 'bg-emerald-600 text-white shadow-lg dark:bg-emerald-500'
      if (code === 'canceled')
        return 'bg-rose-600 text-white shadow-lg dark:bg-rose-500'
      if (code === 'confirmed')
        return 'bg-blue-600 text-white shadow-lg dark:bg-blue-500'
      if (code === 'date_changed')
        return 'bg-orange-500 text-white shadow-lg dark:bg-orange-500'
      return 'bg-amber-500 text-white shadow-lg'
    },

    resetLocal(order) {
      const cloned = JSON.parse(JSON.stringify(order || {}))

      cloned.dates = cloned.dates || { finish_date: null }
      cloned.factory_orders = cloned.factory_orders || []
      cloned.selected_files = cloned.selected_files || []
      cloned.logs = cloned.logs || []
      cloned.store_link = cloned.store_link || {}

      this.localOrder = cloned
      this.storeLinkUrl = cloned.store_link.url || ''
    },

    formatDate(date) {
      if (!date) return '—'
      const m = this.$moment(date)
      if (!m.isValid()) {
        return date
      }
      return m.format('DD/MM/YYYY HH:mm')
    },

    async save() {
      if (!this.localOrder) return
      this.saving = true
      try {
        const factories = (this.localOrder.factory_orders || []).map((fo) => ({
          id: fo.factory_id,
          // status: this.normalizeStatus(fo.status) || 'pending',
        }))

        const payload = {
          name: this.localOrder.name,
          description: this.localOrder.description,
          finish_date: this.localOrder.dates?.finish_date || null,
          status: this.localOrder.status,
          factories,
          store_link: {
            url: this.storeLinkUrl || null,
          },
        }

        const updated = await this.$store.dispatch('orders/updateOrder', {
          id: this.order.id,
          payload,
        })

        this.$emit('saved', updated.order)
        this.$notify({
          type: 'success',
          message: updated.message || 'Պատվերը հաջողությամբ թարմացվեց',
        })
      } catch (e) {
        this.$notify({
          type: 'error',
          message:
            e?.response?.data?.message || e.message || 'Չհաջողվեց պահպանել',
        })
      } finally {
        this.saving = false
      }
    },

    async confirmFactoryFinish(fo) {
      if (!fo || !fo.factory_id) return
      this.confirmingId = fo.id
      try {
        await this.$store.dispatch('factory/adminConfirmFactoryStatus', {
          id: this.order.id,
          factory_id: fo.factory_id,
        })

        const target = this.localOrder.factory_orders.find(
          (x) => x.id === fo.id
        )
        if (target) {
          target.admin_confirmation_date = new Date().toISOString()
        }

        this.$notify({
          type: 'success',
          message: `Գործարան "${
            fo.factory?.name || fo.factory_id
          }"-ի ավարտը հաստատված է`,
        })
      } catch (e) {
        this.$notify({
          type: 'error',
          message:
            e?.response?.data?.message ||
            e.message ||
            'Չհաջողվեց հաստատել ավարտը',
        })
      } finally {
        this.confirmingId = null
      }
    },
  },
}
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.6);
}
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.7);
  border-radius: 999px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(129, 140, 248, 0.9);
}

@keyframes pulseSoft {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}
.animate-pulse-soft {
  animation: pulseSoft 1.5s ease-in-out infinite;
}
</style>
