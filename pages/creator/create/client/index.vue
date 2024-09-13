<template>
  <div class="w-full h-full bg-neutral-400 overflow-y-auto">
    <div class="flex flex-col items-center my-12">
      <p class="text-white font-bold font-sans italic mb-6 text-xl">
        Ստեղծել նոր հաճախորդ
      </p>
      <div v-for="client in clients" :key="client.id" class="w-1/4 mx-auto">
        <input-with-labels
          v-model="client.value"
          :type="client.type"
          :placeholder="client.placeholder"
          classes=" my-2 w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        ></input-with-labels>
      </div>
      <div class="flex items-center justify-start">
        <label class="text-white font-sans italic mx-2" for="payer"
          >ԱԱՀ_վճարող</label
        >
        <input
          id="vat-payer"
          v-model="VAT_payer"
          class="rounded-md w-6 h-6"
          type="checkbox"
        />
      </div>
      <button
        class="mt-4 bg-blue-700 text-white rounded-xl w-40 h-10 hover:bg-blue-800"
        @click="addNewClient"
      >
        Add
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import InputWithLabels from '~/components/form/InputWithIcon.vue'

export default {
  components: { InputWithLabels },
  layout: 'creatorLayout',
  middleware: 'creator',
  data() {
    return {
      VAT_payer: false,
      clients: [
        { id: 1, value: 'Test', type: 'text', placeholder: 'Անուն' },
        { id: 2, value: '010 729459', type: 'tel', placeholder: 'Հեռ․ համար' },
        { id: 3, value: 'asd@asd.asd', type: 'email', placeholder: 'Էլ․ փոստ' },
        { id: 4, value: '123456', type: 'text', placeholder: 'ՀՎՀՀ' },
        { id: 5, value: 'B', type: 'text', placeholder: 'Խումբ' },
        // {
        //   id: 6,
        //   value: '',
        //   type: 'checkbox',
        //   placeholder: 'ԱԱՀ_վճարող',
        //   label: 'ԱԱՀ_վճարող',
        // },
        {
          id: 6,
          value: 'Իրավաբանական հասցե',
          type: 'text',
          placeholder: 'Իրավաբանական հասցե',
        },
        {
          id: 7,
          value: 'Վավեր հասցե',
          type: 'text',
          placeholder: 'Վավեր հասցե',
        },
        {
          id: 8,
          value: 'Կառավարիչ',
          type: 'text',
          placeholder: 'Կառավարչի ԱԱՀ',
        },
        {
          id: 9,
          value: 'Ղեկավար',
          type: 'text',
          placeholder: 'Ղեկավար պաշտոն',
        },
        {
          id: 10,
          value: 'ԱԱՀ',
          type: 'text',
          placeholder: 'Հաշվապահներ ԱԱՀ',
        },
        {
          id: 11,
          value: 'Հաշվապահ',
          type: 'text',
          placeholder: 'Հաշվապահների պաշտոն',
        },
        {
          id: 12,
          value: '32565895',
          type: 'text',
          placeholder: 'Ա/Ձ ի գրանցման վկայական',
        },
        {
          id: 13,
          value: 'Նույնականացման քարտի տեսակը',
          type: 'text',
          placeholder: 'Նույնականացման քարտի տեսակը',
        },
        {
          id: 14,
          value: 'ԱՏ0123654',
          type: 'text',
          placeholder: 'Անձնագրի համարը',
        },
        {
          id: 15,
          value: '314',
          type: 'text',
          placeholder: 'Պայմանագիր',
        },
        {
          id: 16,
          value: '12․09․2024',
          type: 'date',
          placeholder: 'Պայմանագրի ամսաթիվը',
        },
        {
          id: 17,
          value: '',
          type: 'text',
          placeholder: 'Վաճառքի զեղչի տոկոս',
        },
      ],
    }
  },
  methods: {
    ...mapActions('clients', ['addClient']),
    async addNewClient() {
      const clientData = {
        name: this.clients[0].value,
        number: this.clients[1].value,
        email_address: this.clients[2].value,
        AVC: this.clients[3].value,
        group: this.clients[4].value,
        legal_address: this.clients[5].value,
        valid_address: this.clients[6].value,
        VAT_of_the_manager: this.clients[7].value,
        leadership_position: this.clients[8].value,
        accountants_VAT: this.clients[9].value,
        accountant_position: this.clients[10].value,
        registration_of_the_individual: this.clients[11].value,
        type_of_ID_card: this.clients[12].value,
        passport_number: this.clients[13].value,
        contract: this.clients[14].value,
        contract_date: this.clients[15].value,
        sales_discount_percentage: this.clients[16].value,
        VAT_payer: this.VAT_payer,
      }
      await this.addClient(clientData)
    },
  },
}
</script>

<style scoped></style>
