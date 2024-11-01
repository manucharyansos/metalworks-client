<template>
  <div class="w-full h-screen bg-gray-100 dark:bg-gray-800 overflow-y-auto">
    <div class="flex flex-col items-center py-12 mt-12">
      <p class="text-gray-800 dark:text-white font-bold italic mb-8 text-2xl">
        Ստեղծել նոր հաճախորդ
      </p>
      <div class="container relative px-12">
        <button
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          type="button"
          @click="openPersonsType = !openPersonsType"
        >
          Կարգավիճակ
          <svg
            class="w-2.5 h-2.5 ms-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>

        <!-- Dropdown menu -->
        <div
          v-if="openPersonsType"
          class="z-10 absolute top-30 left-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-60 dark:bg-gray-700 dark:divide-gray-600"
        >
          <ul class="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200">
            <li>
              <div
                class="flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <div class="flex items-center h-5">
                  <input
                    id="fiz"
                    v-model="personType"
                    value="physPerson"
                    name="helper-radio"
                    type="radio"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
                <div class="ms-2 text-sm">
                  <label
                    for="fiz"
                    class="font-medium text-gray-900 dark:text-gray-300"
                  >
                    Ֆիզ․ անձ
                  </label>
                </div>
              </div>
            </li>
            <li>
              <div
                class="flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <div class="flex items-center h-5">
                  <input
                    id="legalEntity"
                    v-model="personType"
                    value="legalEntity"
                    name="helper-radio"
                    type="radio"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
                <div class="ms-2 text-sm">
                  <label
                    for="legalEntity"
                    class="font-medium text-gray-900 dark:text-gray-300"
                  >
                    Իրավաբանական անձ
                  </label>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div
        v-if="isPhysPerson"
        class="flex flex-col items-center justify-center"
      >
        <div class="grid grid-cols-2 gap-4 float-left">
          <input-with-labels
            id="name"
            v-model="pysPersonData.name"
            label="Անուն"
            type="text"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="lastName"
            v-model="pysPersonData.lastName"
            label="Ազգանուն"
            type="text"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="phone"
            v-model="pysPersonData.phone"
            type="phone"
            label="Հեռախոս"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="secondPhone"
            v-model="pysPersonData.secondPhone"
            type="phone"
            label="Երկրորդ Հեռախոս"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="address"
            v-model="pysPersonData.address"
            type="text"
            label="Հասցե"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
        </div>
        <button
          class="mt-10 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="addNewClient"
        >
          Ստեղծել նոր հաճախորդ
        </button>
      </div>

      <div v-if="isLegalEntity" class="grid grid-cols-2 gap-4 float-left">
        <!-- Additional fields for legal entity -->
        <button
          class="mt-10 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="addNewClient"
        >
          Ստեղծել նոր հաճախորդ
        </button>
      </div>
    </div>
    <notifications />
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
      personType: '',
      openPersonsType: false,
      pysPersonData: {
        name: '',
        lastName: '',
        phone: '',
        secondPhone: '',
        address: '',
      },
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
  computed: {
    isPhysPerson() {
      return this.personType === 'physPerson'
    },
    isLegalEntity() {
      return this.personType === 'legalEntity'
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
