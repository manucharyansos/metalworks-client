<template>
  <div class="w-full h-screen bg-gray-100 dark:bg-gray-800 overflow-y-auto">
    <header-component class="ml-auto bg-transparent mb-8" />
    <div class="flex flex-col items-center py-12 mt-24">
      <p class="text-gray-800 dark:text-white font-bold italic mb-8 text-2xl">
        Ստեղծել նոր հաճախորդ
      </p>
      <div
        class="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <input-with-labels
          id="name"
          v-model="client.name"
          label="Անուն"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="number"
          v-model="client.number"
          label="Հեռախոսահամար"
          type="phone"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="AVC"
          v-model="client.AVC"
          label="ԱՎՃ"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="group"
          v-model="client.group"
          label="Խումբ"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="legal_address"
          v-model="client.legal_address"
          label="Իրավաբանական հասցե"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="valid_address"
          v-model="client.valid_address"
          label="Վավեր հասցե"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="VAT_of_the_manager"
          v-model="client.VAT_of_the_manager"
          label="Կառավարչի ՀՎՀ"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="leadership_position"
          v-model="client.leadership_position"
          label="Կառավարչի պաշտոն"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="accountants_VAT"
          v-model="client.accountants_VAT"
          label="Հաշվապահի ՀՎՀ"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="accountant_position"
          v-model="client.accountant_position"
          label="Հաշվապահի պաշտոն"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="registration_of_the_individual"
          v-model="client.registration_of_the_individual"
          label="Ա/Ձ գրանցման վկայական"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="type_of_ID_card"
          v-model="client.type_of_ID_card"
          label="Նույնականացման քարտի տեսակ"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="passport_number"
          v-model="client.passport_number"
          label="Անձնագրի համարը"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="contract"
          v-model="client.contract"
          label="Պայմանագիր"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="contract_date"
          v-model="client.contract_date"
          label="Պայմանագրի ամսաթիվը"
          type="date"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="sales_discount_percentage"
          v-model="client.sales_discount_percentage"
          label="Վաճառքի զեղչի տոկոս"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <input-with-labels
          id="email_address"
          v-model="client.email_address"
          label="Էլ․ փոստ"
          type="email"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>

        <div class="flex items-center space-x-4">
          <label for="VAT_payer" class="text-gray-800 dark:text-white">
            Ավելացված արժեքի հարկ վճարող
          </label>
          <input
            type="checkbox"
            id="VAT_payer"
            v-model="client.VAT_payer"
            class="shadow-md rounded-lg"
          />
        </div>
      </div>

      <button
        @click="addNewClient"
        class="mt-10 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Ստեղծել նոր հաճախորդ
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import HeaderComponent from '~/components/header/HeaderComponent.vue'

export default {
  components: { HeaderComponent, InputWithLabels },
  layout: 'creatorLayout',
  middleware: 'creator',
  data() {
    return {
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
  methods: {
    ...mapActions('clients', ['addClient']),
    async addNewClient() {
      const clientData = { ...this.client }
      try {
        await this.addClient(clientData)
        alert('Հաճախորդը հաջողությամբ ստեղծվեց')
      } catch (error) {
        console.error('Սխալ հաճախորդի ստեղծման ժամանակ:', error)
        alert('Սխալ հաճախորդի ստեղծման ժամանակ')
      }
    },
  },
}
</script>
