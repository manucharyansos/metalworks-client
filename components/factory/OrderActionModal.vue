<!-- components/factory/OrderActionModal.vue -->
<template>
  <transition name="modal-backdrop">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8 overflow-y-auto bg-black/30 backdrop-blur-sm"
      @click.self="close"
      @keydown.esc.stop.prevent="close"
    >
      <div
        class="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`factory-order-action-title-${_uid}`"
        :aria-busy="saving ? 'true' : 'false'"
        @click.stop
      >
        <!-- Header -->
        <div
          class="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800"
        >
          <div class="flex items-start justify-between">
            <div>
              <h3
                :id="`factory-order-action-title-${_uid}`"
                class="text-xl font-bold text-gray-900 dark:text-white"
              >
                {{ $t('factory_order_actions.title') }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ $t('factory_order_actions.help') }}
              </p>
              <p
                v-if="order.id"
                class="mt-2 text-xs font-bold text-gray-700 dark:text-gray-300"
              >
                {{ order.order_number?.number || `#${order.id}` }}
                <span v-if="order.prefix_code?.code"
                  >· {{ order.prefix_code.code }}</span
                >
              </p>
            </div>
            <button
              type="button"
              :disabled="saving"
              :aria-label="$t('factory_order_actions.close')"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-4"
              @click="close"
            >
              <svg
                class="w-6 h-6"
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
          </div>
        </div>

        <!-- Body -->
        <form class="p-6 space-y-6" @submit.prevent="confirm">
          <!-- Գլխավոր գործողություն -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {{ $t('factory_order_actions.action') }}
            </label>
            <SelectWithLabel
              ref="actionSelect"
              v-model="localSelectedOption"
              :name="`factory-order-action-${_uid}`"
              :data-value="actionOptions"
              :disabled="saving || !actionOptions.length"
              :placeholder="$t('factory_order_actions.choose_action')"
            />
          </div>

          <!-- Մերժման պատճառ -->
          <transition name="slide-fade">
            <div
              v-if="localSelectedOption?.value === 'canceled'"
              class="animate-in fade-in slide-in-from-top duration-300"
            >
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {{ $t('factory_order_actions.reason') }}
              </label>
              <SelectWithLabel
                v-model="localAdditionalOption"
                :name="`factory-order-reason-${_uid}`"
                :data-value="reasonOptions"
                :disabled="saving"
                :placeholder="$t('factory_order_actions.choose_reason')"
              />
            </div>
          </transition>

          <!-- Նոր ամսաթիվ -->
          <transition name="slide-fade">
            <div
              v-if="localSelectedOption?.value === 'date_changed'"
              class="animate-in fade-in slide-in-from-top duration-300"
            >
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {{ $t('factory_order_actions.new_date') }}
              </label>
              <input-with-label-icon
                v-model="localChangeDate"
                type="date"
                :min="tomorrowDate"
                :disabled="saving"
                :label_-id="`factory-order-date-${_uid}`"
                class="w-full"
              />
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {{ $t('factory_order_actions.date_help') }}
              </p>
            </div>
          </transition>

          <!-- Ավարտված է -->
          <transition name="slide-fade">
            <div
              v-if="localSelectedOption?.value === 'finished'"
              class="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200 dark:border-emerald-800 animate-in fade-in zoom-in duration-300"
            >
              <p class="text-center">
                <span
                  class="text-sm text-emerald-700 dark:text-emerald-300 font-medium"
                  >{{ $t('factory_order_actions.finish_date') }}</span
                >
                <span
                  class="block text-2xl font-bold text-emerald-800 dark:text-emerald-400 mt-1"
                >
                  {{ todayFormatted }}
                </span>
              </p>
            </div>
          </transition>

          <!-- Հաստատել կոճակ -->
          <button
            type="submit"
            :disabled="!canConfirm"
            class="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all duration-200 transform active:scale-98 shadow-lg"
            :class="
              canConfirm
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30'
                : 'bg-gray-400 cursor-not-allowed shadow-none'
            "
          >
            {{
              saving
                ? $t('factory_order_actions.saving')
                : $t('factory_order_actions.confirm')
            }}
          </button>
        </form>
      </div>
    </div>
  </transition>
</template>

<script>
import SelectWithLabel from '@/components/factory/SelectWithLabel.vue'
import InputWithLabelIcon from '@/components/form/InputWithLabelIcon.vue'
import { localFactoryTimestamp } from '@/utils/factory-order-status'

export default {
  components: { SelectWithLabel, InputWithLabelIcon },
  props: {
    isOpen: Boolean,
    actionOptions: { type: Array, required: true },
    cancelReasons: { type: Array, required: true },
    todayFormatted: { type: String, default: '' },
    tomorrowDate: { type: String, default: '' },
    order: { type: Object, default: () => ({}) },
    initialStatus: { type: String, default: null },
    initialReason: { type: String, default: '' },
    initialDate: { type: String, default: '' },
    saving: { type: Boolean, default: false },
  },
  emits: ['close', 'confirm'],
  data() {
    return {
      localSelectedOption: null,
      localAdditionalOption: null,
      localChangeDate: null,
    }
  },
  computed: {
    reasonOptions() {
      return this.cancelReasons.map((reason) => ({
        ...reason,
        label: ['unclear', 'wrong_data', 'no_material', 'other'].includes(
          reason.value
        )
          ? this.$t(`factory_order_actions.reasons.${reason.value}`)
          : reason.label || reason.value,
      }))
    },
    canConfirm() {
      const status = this.localSelectedOption?.value
      if (
        this.saving ||
        !this.actionOptions.some((option) => option.value === status)
      )
        return false
      if (status === 'canceled') return !!this.localAdditionalOption?.value
      if (status === 'date_changed')
        return (
          /^\d{4}-\d{2}-\d{2}$/.test(this.localChangeDate || '') &&
          this.localChangeDate >= this.tomorrowDate
        )
      return true
    },
  },
  watch: {
    isOpen(val) {
      this.reset()
      if (val) {
        this.localSelectedOption =
          this.actionOptions.find(
            (option) => option.value === this.initialStatus
          ) || null
        this.localAdditionalOption =
          this.reasonOptions.find(
            (option) => option.value === this.initialReason
          ) || null
        this.localChangeDate = this.initialDate
          ? this.initialDate.slice(0, 10)
          : null
        this.$nextTick(() =>
          this.$refs.actionSelect?.$el?.querySelector('select')?.focus()
        )
      }
    },
  },
  methods: {
    close() {
      if (!this.saving) this.$emit('close')
    },
    reset() {
      this.localSelectedOption = null
      this.localAdditionalOption = null
      this.localChangeDate = null
    },
    confirm() {
      if (!this.canConfirm) return

      this.$emit('confirm', {
        status: this.localSelectedOption.value,
        canceling:
          this.localSelectedOption.value === 'canceled'
            ? this.localAdditionalOption.value
            : '',
        cancel_date:
          this.localSelectedOption.value === 'date_changed'
            ? this.localChangeDate
            : null,
        operator_finish_date:
          this.localSelectedOption.value === 'finished'
            ? localFactoryTimestamp()
            : null,
      })
    },
  },
}
</script>

<style scoped>
/* Backdrop + Modal animation */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-backdrop-enter-active .relative,
.modal-backdrop-leave-active .relative {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}
.modal-backdrop-enter-from .relative {
  opacity: 0;
  transform: translateY(40px) scale(0.92);
}
.modal-backdrop-leave-to .relative {
  opacity: 0;
  transform: translateY(-30px) scale(0.92);
}

/* Slide + Fade for inner fields */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.35s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
