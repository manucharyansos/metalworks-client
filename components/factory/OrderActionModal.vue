<template>
  <transition name="modal-backdrop">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/30 px-4 py-8 backdrop-blur-sm" @click="$emit('close')">
      <div class="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900" @click.stop>
        <div class="border-b border-gray-100 px-6 pb-4 pt-6 dark:border-gray-800">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ t.title }}</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t.subtitle }}</p>
            </div>
            <button class="ml-4 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300" @click="$emit('close')">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div class="space-y-6 p-6">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ t.action }}</label>
            <SelectWithLabel v-model="localSelectedOption" :data-value="localizedActions" :placeholder="t.chooseAction" />
          </div>

          <transition name="slide-fade">
            <div v-if="localSelectedOption?.value === 'canceled'">
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ t.rejectReason }}</label>
              <SelectWithLabel v-model="localAdditionalOption" :data-value="localizedReasons" :placeholder="t.chooseReason" />
            </div>
          </transition>

          <transition name="slide-fade">
            <div v-if="localSelectedOption?.value === 'date_changed'">
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ t.newDate }}</label>
              <input-with-label-icon v-model="localChangeDate" type="date" :min="tomorrowDate" class="w-full" />
            </div>
          </transition>

          <transition name="slide-fade">
            <div v-if="localSelectedOption?.value === 'finished'" class="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-5 dark:border-emerald-800 dark:from-emerald-900/30 dark:to-green-900/30">
              <p class="text-center"><span class="text-sm font-medium text-emerald-700 dark:text-emerald-300">{{ t.finishDate }}</span><span class="mt-1 block text-2xl font-bold text-emerald-800 dark:text-emerald-400">{{ todayFormatted }}</span></p>
            </div>
          </transition>

          <button :disabled="!localSelectedOption" class="w-full rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-all duration-200" :class="localSelectedOption ? 'bg-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-950' : 'cursor-not-allowed bg-gray-400 shadow-none'" @click="confirm">
            {{ localSelectedOption ? t.confirm : t.chooseAction }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import SelectWithLabel from '@/components/factory/SelectWithLabel.vue'
import InputWithLabelIcon from '@/components/form/InputWithLabelIcon.vue'

const COPY = {
  hy: { title: 'Պատվերի գործողություն', subtitle: 'Ընտրեք կարգավիճակը և լրացրեք անհրաժեշտ տվյալները։', action: 'Գործողություն', chooseAction: 'Ընտրել գործողություն...', rejectReason: 'Մերժման պատճառ', chooseReason: 'Ընտրել պատճառ...', newDate: 'Նոր կատարման ամսաթիվ', finishDate: 'Ավարտի ամսաթիվը կլինի՝', confirm: 'Հաստատել գործողությունը', actions: { confirmed: 'Կատարել', canceled: 'Մերժել', date_changed: 'Փոխել ժամկետը', finished: 'Ավարտել' }, reasons: { unclear: 'Ոչ հստակ պատվեր', wrong_data: 'Սխալ տվյալներ', no_material: 'Նյութի բացակայություն', other: 'Այլ պատճառ' } },
  ru: { title: 'Действие с заказом', subtitle: 'Выберите статус и заполните необходимые данные.', action: 'Действие', chooseAction: 'Выберите действие...', rejectReason: 'Причина отклонения', chooseReason: 'Выберите причину...', newDate: 'Новая дата выполнения', finishDate: 'Дата завершения:', confirm: 'Подтвердить действие', actions: { confirmed: 'Принять в работу', canceled: 'Отклонить', date_changed: 'Изменить срок', finished: 'Завершить' }, reasons: { unclear: 'Неясный заказ', wrong_data: 'Неверные данные', no_material: 'Нет материала', other: 'Другая причина' } },
  en: { title: 'Order action', subtitle: 'Choose a status and fill in the required details.', action: 'Action', chooseAction: 'Choose action...', rejectReason: 'Rejection reason', chooseReason: 'Choose reason...', newDate: 'New completion date', finishDate: 'Completion date:', confirm: 'Confirm action', actions: { confirmed: 'Start work', canceled: 'Reject', date_changed: 'Change deadline', finished: 'Finish' }, reasons: { unclear: 'Unclear order', wrong_data: 'Incorrect data', no_material: 'Material unavailable', other: 'Other reason' } },
}

export default {
  components: { SelectWithLabel, InputWithLabelIcon },
  props: { isOpen: Boolean, actionOptions: { type: Array, required: true }, cancelReasons: { type: Array, required: true }, todayFormatted: String, tomorrowDate: String },
  emits: ['close', 'confirm'],
  data() { return { localSelectedOption: null, localAdditionalOption: null, localChangeDate: null } },
  computed: {
    locale() { const code = String(this.$i18n?.locale || 'hy').toLowerCase().split('-')[0]; return ['hy','ru','en'].includes(code) ? code : 'hy' },
    t() { return COPY[this.locale] || COPY.hy },
    localizedActions() { return (this.actionOptions || []).map((item) => ({ ...item, label: this.t.actions[item.value] || item.label })) },
    localizedReasons() { return (this.cancelReasons || []).map((item) => ({ ...item, label: this.t.reasons[item.value] || item.label })) },
  },
  watch: { isOpen(val) { if (!val) this.reset() } },
  methods: {
    reset() { this.localSelectedOption = null; this.localAdditionalOption = null; this.localChangeDate = null },
    confirm() {
      if (!this.localSelectedOption) return
      this.$emit('confirm', {
        status: this.localSelectedOption.value,
        canceling: this.localAdditionalOption?.value || '',
        cancel_date: this.localSelectedOption.value === 'date_changed' ? this.localChangeDate : null,
        operator_finish_date: this.localSelectedOption.value === 'finished' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
      })
      this.$emit('close')
    },
  },
}
</script>

<style scoped>
.modal-backdrop-enter-active,.modal-backdrop-leave-active{transition:opacity .3s ease}.modal-backdrop-enter-from,.modal-backdrop-leave-to{opacity:0}.slide-fade-enter-active,.slide-fade-leave-active{transition:all .25s ease}.slide-fade-enter-from,.slide-fade-leave-to{opacity:0;transform:translateY(-10px)}
</style>
