<template>
  <div class="w-full h-screen bg-gray-100 dark:bg-gray-800 overflow-y-auto">
    <!--    <header-component class="ml-auto bg-transparent mb-8" />-->
    <div class="flex flex-col items-center py-12 mt-12">
      <p class="text-gray-800 dark:text-white font-bold italic mb-8 text-2xl">
        Ստեղծել նոր հաճախորդ
      </p>
      <div
        class="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-12"
      >
        <label for="fiz">Ֆիզ․ անձ</label>
        <input id="fiz" v-model="physPerson" type="checkbox" />
      </div>

      <div v-if="isPysPerson">
        <input-with-label-icon label_class="Անուն" />
      </div>
      <button
        class="mt-10 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        @click="addNewClient"
      >
        Ստեղծել նոր հաճախորդ
      </button>
    </div>
    <notifications />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'

export default {
  components: { InputWithLabelIcon },
  layout: 'creatorLayout',
  middleware: 'creator',
  data() {
    return {
      physPerson: '',
      isPysPerson: false,
      client: {
        name: '',
        number: '',
        AVC: '',
        group: '',
        VAT_payer: false,
        legal_address: '',
        valid_address: '',
        VAT_of_the_manager: '',
        leadership_position: '',
        accountants_VAT: '',
        accountant_position: '',
        registration_of_the_individual: '',
        type_of_ID_card: '',
        passport_number: '',
        contract: '',
        contract_date: '',
        sales_discount_percentage: '',
        email_address: '',
      },
    }
  },
  watch: {
    physPerson(val) {
      this.isPysPerson = !!val
    },
  },
  methods: {
    ...mapActions('clients', ['addClient']),
    addNewClient() {
      console.log(this.physPerson, 'person')
    },
  },
}
</script>
