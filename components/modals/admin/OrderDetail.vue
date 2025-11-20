<template>
  <div class="p-5 sm:p-6 md:p-7 space-y-6 h-full flex flex-col">
    <!-- Header -->
    <header class="flex items-start justify-between gap-3 border-b pb-4">
      <div v-if="localOrder" class="space-y-1">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Պատվեր #{{ localOrder.id }}
        </h2>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Ստեղծվել է {{ formatDate(localOrder.created_at) }}
        </p>
        <p
          class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"
        >
          Կարգավիճակ՝
          <span class="badge" :class="statusBadge(localOrder.status)">
            {{ localOrder.status || '—' }}
          </span>
        </p>
      </div>
      <button
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        @click="$emit('close')"
      >
        ✕
      </button>
    </header>

    <!-- Scrollable content -->
    <div
      v-if="localOrder"
      class="space-y-6 flex-1 overflow-y-auto pr-1 custom-scroll"
    >
      <!-- Main Info -->
      <div class="grid gap-4 md:grid-cols-2">
        <info-card title="Հիմնական տվյալներ">
          <!-- Անուն (editable) -->
          <div class="mb-2">
            <label
              class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
            >
              Անուն
            </label>
            <input
              v-model="localOrder.name"
              type="text"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <info-row label="Համար" :value="localOrder.order_number?.number" />
          <info-row label="Կոդ" :value="localOrder.prefix_code?.code" />

          <!-- Ավարտի ամսաթիվ (editable) -->
          <div class="mt-2">
            <label
              class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
            >
              Ավարտի ամսաթիվ
            </label>
            <input
              v-model="localOrder.dates.finish_date"
              type="datetime-local"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="deadlineClass"
            />
          </div>

          <!-- Store link -->
          <div class="mt-3">
            <label
              class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
            >
              Արտաքին հղում
            </label>
            <input
              v-model="storeLinkUrl"
              type="url"
              placeholder="https://…"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </info-card>

        <info-card title="Հաճախորդ">
          <info-row label="Անուն" :value="localOrder.user?.name" />
          <info-row label="Հեռախոս" :value="localOrder.user?.phone" />
          <info-row label="Էլ․ փոստ" :value="localOrder.user?.email" />
        </info-card>
      </div>

      <!-- Description -->
      <info-card title="Նկարագրություն">
        <textarea
          v-model="localOrder.description"
          rows="4"
          class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none whitespace-pre-wrap"
        ></textarea>
      </info-card>

      <!-- Factories -->
      <info-card title="Գործարաններ">
        <div
          v-if="localOrder.factory_orders && localOrder.factory_orders.length"
          class="space-y-3"
        >
          <div
            v-for="fo in localOrder.factory_orders"
            :key="fo.id"
            class="border rounded-xl p-4 bg-gray-50/60 dark:bg-gray-800/60 space-y-2"
          >
            <div class="flex justify-between items-center">
              <h4
                class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white"
              >
                {{ fo.factory?.name || 'Անհայտ գործարան' }}
              </h4>
              <span class="badge" :class="statusBadge(fo.status)">
                {{ fo.status || '—' }}
              </span>
            </div>

            <div
              class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1"
            >
              <p>Օպերատոր՝ {{ fo.operator?.name || '—' }}</p>
              <p v-if="fo.finish_date">
                Օպերատորի ավարտ՝ {{ formatDate(fo.finish_date) }}
              </p>
              <p v-if="fo.canceling">Մերժման պատճառ՝ {{ fo.canceling }}</p>

              <p
                v-if="fo.admin_confirmation_date"
                class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium mt-1"
              >
                <span class="text-xs">✅</span>
                Հաստատված ադմինի կողմից
                <span class="text-[11px] text-gray-500 dark:text-gray-400">
                  ({{ formatDate(fo.admin_confirmation_date) }})
                </span>
              </p>
            </div>

            <!-- Files -->
            <div v-if="fo.files && fo.files.length" class="mt-3 space-y-2">
              <p
                class="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200"
              >
                Ֆայլեր
              </p>
              <div
                v-for="file in fo.files"
                :key="file.id"
                class="flex items-center justify-between text-xs bg-white/80 dark:bg-gray-900/60 p-2 rounded-lg"
              >
                <span class="truncate">{{ file.original_name }}</span>
                <span v-if="file.pivot?.quantity" class="text-gray-500"
                  >×{{ file.pivot.quantity }}</span
                >
              </div>
            </div>

            <!-- Admin confirm button -->
            <div
              class="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2"
            >
              <button
                v-if="fo.status === 'Ավարտել' && !fo.admin_confirmation_date"
                class="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="confirmingId === fo.id || saving"
                @click="confirmFactoryFinish(fo)"
              >
                <svg
                  v-if="confirmingId === fo.id"
                  class="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                <span>Հաստատել ավարտը</span>
              </button>
              <p v-else class="text-[11px] text-gray-500 dark:text-gray-400">
                {{
                  fo.status === 'Ավարտել'
                    ? 'Ավարտը արդեն հաստատված է կամ սպասում է լոգերում'
                    : 'Կարգավիճակը «Ավարտել» չէ'
                }}
              </p>
            </div>
          </div>
        </div>
        <p v-else class="text-xs sm:text-sm text-gray-500">
          Կապված գործարաններ չկան։
        </p>
      </info-card>

      <!-- Selected Files -->
      <info-card title="Ընտրված ֆայլեր">
        <div
          v-if="localOrder.selected_files && localOrder.selected_files.length"
          class="space-y-2"
        >
          <div
            v-for="sf in localOrder.selected_files"
            :key="sf.id"
            class="flex items-center justify-between text-xs sm:text-sm bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg"
          >
            <span class="font-medium">
              {{ sf.pmp_file?.original_name || 'Ֆայլ' }}
            </span>
            <span>×{{ sf.quantity }}</span>
          </div>
        </div>
        <p v-else class="text-xs sm:text-sm text-gray-500">
          Ֆայլեր չեն ընտրվել
        </p>
      </info-card>

      <!-- Logs / History -->
      <info-card title="Պատմություն / լոգեր">
        <div
          v-if="localOrder.logs && localOrder.logs.length"
          class="space-y-4 max-h-64 overflow-y-auto custom-scroll pr-1"
        >
          <div
            v-for="log in localOrder.logs"
            :key="log.id"
            class="flex items-start gap-3"
          >
            <div class="flex flex-col items-center">
              <span
                class="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm animate-pulse-soft"
              ></span>
              <span class="flex-1 w-px bg-gray-300 dark:bg-gray-700"></span>
            </div>

            <div
              class="flex-1 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div class="flex items-center justify-between gap-2 mb-1">
                <p
                  class="text-xs font-semibold text-gray-800 dark:text-gray-100"
                >
                  {{ log.user?.name || 'Համակարգ' }}
                </p>
                <p class="text-[11px] text-gray-500 dark:text-gray-400">
                  {{ formatDate(log.created_at) }}
                </p>
              </div>
              <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                {{ log.message }}
              </p>
            </div>
          </div>
        </div>
        <p v-else class="text-xs sm:text-sm text-gray-500 italic">
          Դեռ լոգեր չկան այս պատվերի համար։
        </p>
      </info-card>
    </div>

    <!-- Actions -->
    <footer
      class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <button
        class="px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        @click="$emit('close')"
      >
        Փակել
      </button>
      <button
        :disabled="saving"
        class="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
        @click="save"
      >
        <svg
          v-if="saving"
          class="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
        <span>{{ saving ? 'Պահպանվում է...' : 'Պահպանել' }}</span>
      </button>
    </footer>
  </div>
</template>

<script>
import InfoCard from '@/components/ui/InfoCard.vue'
import InfoRow from '@/components/ui/InfoRow.vue'

export default {
  components: { InfoCard, InfoRow },
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
    finishDate() {
      if (!this.localOrder?.dates?.finish_date) return null
      return new Date(this.localOrder.dates.finish_date)
    },
    isOverdue() {
      return (
        this.finishDate &&
        this.finishDate < new Date() &&
        this.localOrder?.status !== 'completed'
      )
    },
    isNear() {
      if (!this.finishDate) return false
      const diffHours = (this.finishDate - Date.now()) / 36e5
      return diffHours > 0 && diffHours <= 24
    },
    deadlineClass() {
      if (this.isOverdue) return 'text-red-600 dark:text-red-400 font-semibold'
      if (this.isNear)
        return 'text-orange-600 dark:text-orange-400 font-semibold'
      return ''
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

    statusBadge(status) {
      const map = {
        pending: 'badge-pending',
        completed: 'badge-completed',
        canceled: 'badge-canceled',
        confirmed: 'badge-completed',
        Հաստատել: 'badge-completed',
        Մերժել: 'badge-canceled',
        'Կատարման ժամկետի փոխարինում': 'badge-pending',
        Ավարտել: 'badge-completed',
      }
      return map[status] || 'bg-gray-100 text-gray-700'
    },

    formatDate(date) {
      if (!date) return '—'
      const m = this.$moment(date)
      if (!m.isValid()) {
        console.warn('Invalid date format:', date)
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
          status: fo.status || 'pending',
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
