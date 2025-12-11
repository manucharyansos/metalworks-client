<template>
  <div class="w-full h-screen bg-gray-100 dark:bg-gray-800 overflow-y-auto">
    <p
      class="text-gray-800 dark:text-white font-bold font-montserrat my-8 text-2xl text-center"
    >
      Ստեղծել նոր օգտատեր
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-12 p-4">
      <div id="accordion-collapse" data-accordion="collapse">
        <h2 id="accordion-collapse-heading-1">
          <button
            type="button"
            class="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
            data-accordion-target="#accordion-collapse-body-1"
            aria-expanded="true"
            aria-controls="accordion-collapse-body-1"
            @click="isAccordionType = !isAccordionType"
          >
            <span>Կարգավիճակ</span>
            <svg
              data-accordion-icon
              class="w-3 h-3 rotate-180 shrink-0"
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
                d="M9 5 5 1 1 5"
              />
            </svg>
          </button>
        </h2>
        <div
          v-if="isAccordionType"
          id="accordion-collapse-body-1"
          :class="{ 'transition delay-2000': isAccordionType }"
          aria-labelledby="accordion-collapse-heading-1"
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
        <div class="grid grid-cols-2 gap-4 float-left w-full">
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
          <input-with-labels
            id="address"
            v-model="pysPersonData.email"
            type="email"
            label="Էլ․ փոստ"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="password"
            v-model="pysPersonData.password"
            :type="isPasswordVisible ? 'text' : 'password'"
            label="Գախտնաբառ"
            class="shadow-md rounded-lg p-3"
          >
            <template #label_back>
              <button
                type="button"
                class="text-gray-500"
                @click="togglePasswordVisibility"
              >
                <span v-if="isPasswordVisible">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    width="24"
                    height="24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.984 9.984 0 012.223-3.592M6.07 6.07a10.05 10.05 0 015.93-1.07c4.478 0 8.268 2.943 9.542 7a9.984 9.984 0 01-4.992 5.645M15 12a3 3 0 01-4.242 4.243M17.657 17.657L6.343 6.343"
                    />
                  </svg>
                </span>
                <span v-else>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    width="24"
                    height="24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </span>
              </button>
            </template>
          </input-with-labels>
          <input-with-labels
            id="confirm_password"
            v-model="pysPersonData.confirm_password"
            :type="isConfirmPasswordVisible ? 'text' : 'password'"
            label="Գախտնաբառի կրկնություն"
            class="shadow-md rounded-lg p-3"
          >
            <template #label_back>
              <button
                type="button"
                class="text-gray-500"
                @click="toggleConfirmPasswordVisibility"
              >
                <span v-if="isConfirmPasswordVisible">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    width="24"
                    height="24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.984 9.984 0 012.223-3.592M6.07 6.07a10.05 10.05 0 015.93-1.07c4.478 0 8.268 2.943 9.542 7a9.984 9.984 0 01-4.992 5.645M15 12a3 3 0 01-4.242 4.243M17.657 17.657L6.343 6.343"
                    />
                  </svg>
                </span>
                <span v-else>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    width="24"
                    height="24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </span>
              </button>
            </template>
          </input-with-labels>
        </div>
        <button
          class="mt-10 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="createNewUser"
        >
          Ստեղծել նոր հաճախորդ
        </button>
      </div>
      <div
        v-if="isLegalEntity"
        class="grid grid-cols-2 gap-4 float-left w-full"
      >
        <!-- Additional fields for legal entity -->
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
          label="Հեռախոս"
          type="phone"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="nextPhone"
          v-model="pysPersonData.secondPhone"
          label="Այլ հեռախոս"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="address"
          v-model="pysPersonData.legal_address"
          label="Հասցե"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="userEmail"
          v-model="pysPersonData.email"
          label="Էլ․ փոստ"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="password"
          v-model="pysPersonData.password"
          :type="isPasswordVisible ? 'text' : 'password'"
          label="Գախտնաբառ"
          class="shadow-md rounded-lg p-3"
        >
          <template #label_back>
            <button
              type="button"
              class="text-gray-500"
              @click="togglePasswordVisibility"
            >
              <span v-if="isPasswordVisible">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  width="24"
                  height="24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.984 9.984 0 012.223-3.592M6.07 6.07a10.05 10.05 0 015.93-1.07c4.478 0 8.268 2.943 9.542 7a9.984 9.984 0 01-4.992 5.645M15 12a3 3 0 01-4.242 4.243M17.657 17.657L6.343 6.343"
                  />
                </svg>
              </span>
              <span v-else>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  width="24"
                  height="24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </span>
            </button>
          </template>
        </input-with-labels>
        <input-with-labels
          id="confirm_password"
          v-model="pysPersonData.confirm_password"
          :type="isConfirmPasswordVisible ? 'text' : 'password'"
          label="Գախտնաբառի կրկնություն"
          class="shadow-md rounded-lg p-3"
        >
          <template #label_back>
            <button
              type="button"
              class="text-gray-500"
              @click="toggleConfirmPasswordVisibility"
            >
              <span v-if="isConfirmPasswordVisible">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  width="24"
                  height="24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.984 9.984 0 012.223-3.592M6.07 6.07a10.05 10.05 0 015.93-1.07c4.478 0 8.268 2.943 9.542 7a9.984 9.984 0 01-4.992 5.645M15 12a3 3 0 01-4.242 4.243M17.657 17.657L6.343 6.343"
                  />
                </svg>
              </span>
              <span v-else>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  width="24"
                  height="24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </span>
            </button>
          </template>
        </input-with-labels>
        <input-with-labels
          id="passportNumber"
          v-model="pysPersonData.passportNumber"
          label="Անձնագրի համար"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="companyName"
          v-model="pysPersonData.company_name"
          label="Կազմակերպության հասցե"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="avc"
          v-model="pysPersonData.AVC"
          label="ՀՎՀՀ"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="accountant"
          v-model="pysPersonData.accountant"
          label="Հաշվապահ"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <button
          class="mt-10 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="createNewUser"
        >
          Ստեղծել նոր հաճախորդ
        </button>
      </div>
    </div>
    <notifications />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabels from '~/components/form/InputWithIcon.vue'

export default {
  components: { InputWithLabels },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
  data() {
    return {
      personType: '',
      openPersonsType: false,
      openUsers: false,
      isAccordionType: false,
      isPasswordVisible: false,
      isConfirmPasswordVisible: false,
      pysPersonData: {
        name: '',
        lastName: '',
        phone: '',
        secondPhone: '',
        address: '',
        email: '',
        password: '',
        confirm_password: '',
        company_name: '',
        AVC: '',
        accountant: '',
        legal_address: '',
        passportNumber: '',
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
    ...mapGetters('users', ['getUsers']),
  },
  mounted() {
    this.fetchUsers()
  },
  methods: {
    ...mapActions('users', ['fetchUsers', 'createUser', 'updateUser']),
    togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible
    },
    toggleConfirmPasswordVisibility() {
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible
    },
    async createNewUser() {
      let userData
      if (this.isPhysPerson) {
        userData = {
          type: 'physPerson',
          name: this.pysPersonData.name,
          last_name: this.pysPersonData.lastName,
          phone: this.pysPersonData.phone,
          second_phone: this.pysPersonData.secondPhone,
          address: this.pysPersonData.address,
          email: this.pysPersonData.email,
          password: this.pysPersonData.password,
          password_confirmation: this.pysPersonData.confirm_password,
        }
      } else if (this.isLegalEntity) {
        userData = {
          type: 'legalEntity',
          name: this.pysPersonData.name,
          last_name: this.pysPersonData.lastName,
          phone: this.pysPersonData.phone,
          secondPhone: this.pysPersonData.secondPhone,
          address: this.pysPersonData.legal_address,
          email: this.pysPersonData.email,
          password: this.pysPersonData.password,
          password_confirmation: this.pysPersonData.confirm_password,
          passport_number: this.pysPersonData.passportNumber,
          company_name: this.pysPersonData.company_name,
          AVC: this.pysPersonData.AVC,
          accountant: this.pysPersonData.accountant,
        }
      }
      try {
        await this.createUser(userData)
        this.$notify({
          type: 'success',
          text: 'Հաճախորդը հաջողությամբ ստեղծվել է',
        })
      } catch (error) {
        this.$notify({
          type: 'error',
          text: 'Սխալ է տեղի ունեցել հաճախորդի ստեղծման ժամանակ',
        })
      }
    },
  },
}
</script>
