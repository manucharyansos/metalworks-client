<template>
  <div class="w-full h-screen bg-gray-100 dark:bg-gray-800 overflow-y-auto">
    <p
      class="text-gray-800 dark:text-white font-bold font-sans italic my-8 text-2xl text-center"
    >
      Հաճախորդ տվյալնեիր թարմացում
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-12 p-4">
      <div id="accordion-collapse" data-accordion="collapse">
        <h2 id="accordion-collapse-heading-2">
          <button
            type="button"
            class="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 rounded-t-xl border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
            data-accordion-target="#accordion-collapse-body-2"
            aria-expanded="false"
            aria-controls="accordion-collapse-body-2"
            @click="isUserAccordion = !isUserAccordion"
          >
            <span>Օգտատեր</span>
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
          v-if="isUserAccordion"
          id="accordion-collapse-body-2"
          aria-labelledby="accordion-collapse-heading-2"
        >
          <template v-if="getUsers">
            <div
              v-for="(user, index) in users"
              :key="index"
              class="p-3 border border-b-0 border-gray-200 dark:border-gray-700 hover:bg-neutral-300 cursor-pointer"
              @click="selectUser(user)"
            >
              <p class="text-base italic font-sans leading-3 my-2">
                <span class="font-bold">Անուն։</span> {{ user.name }},
              </p>
              <p class="text-base italic font-sans leading-3 my-2">
                <span class="font-bold">էլ․ փոստ։ </span> {{ user.email }}
              </p>
            </div>
          </template>
        </div>
        <h2 id="accordion-collapse-heading-1">
          <button
            type="button"
            class="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
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
            v-model="pysPersonClientData.last_name"
            label="Ազգանուն"
            type="text"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="phone"
            v-model="pysPersonClientData.phone"
            type="phone"
            label="Հեռախոս"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="secondPhone"
            v-model="pysPersonClientData.second_phone"
            type="phone"
            label="Երկրորդ Հեռախոս"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="address"
            v-model="pysPersonClientData.address"
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
        </div>
        <button
          class="mt-10 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="createOrUpdateUser"
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
          v-model="pysPersonClientData.last_name"
          label="Ազգանուն"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="phone"
          v-model="pysPersonClientData.phone"
          label="Հեռախոս"
          type="phone"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="nextPhone"
          v-model="pysPersonClientData.second_phone"
          label="Այլ հեռախոս"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="address"
          v-model="pysPersonClientData.legal_address"
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
          id="passportNumber"
          v-model="pysPersonClientData.passportNumber"
          label="Անձնագրի համար"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="companyName"
          v-model="pysPersonClientData.company_name"
          label="Կազմակերպության հասցե"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="avc"
          v-model="pysPersonClientData.AVC"
          label="ՀՎՀՀ"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="accountant"
          v-model="pysPersonClientData.accountant"
          label="Հաշվապահ"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <button
          class="mt-10 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="createOrUpdateUser"
        >
          Փոխել
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
  layout: 'creatorLayout',
  middleware: ['creator', 'roleRedirect'],
  data() {
    return {
      personType: '',
      openPersonsType: false,
      openUsers: false,
      isAccordionType: false,
      isUserAccordion: false,
      isPasswordVisible: false,
      isConfirmPasswordVisible: false,
      pysPersonData: {},
      pysPersonClientData: {},
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
    users() {
      return this.getUsers
    },
  },
  mounted() {
    this.fetchUsers()
  },
  methods: {
    ...mapActions('clients', ['addClient']),
    ...mapActions('users', ['fetchUsers', 'createUser', 'updateUser']),
    selectUser(user) {
      this.pysPersonData.email = user.email
      this.pysPersonData.name = user.name
      this.pysPersonData.user_id = user.id
      this.id = user.id
      this.pysPersonClientData = { ...user.client }
      this.isUserAccordion = false
    },
    async createOrUpdateUser() {
      const clientData = { ...this.pysPersonClientData }
      const userData = {
        ...this.pysPersonData,
        ...clientData,
        type: this.personType,
      }

      try {
        if (this.id) {
          await this.updateUser({ id: this.id, data: userData })
          this.$notify({
            type: 'success',
            text: 'Հաճախորդը հաջողությամբ թարմացվեց',
          })
        } else {
          await this.createUser(userData)
          this.$notify({
            type: 'success',
            text: 'Հաճախորդը հաջողությամբ ստեղծվեց',
          })
        }
      } catch (error) {
        this.$notify({
          type: 'error',
          text: 'Սխալ է տեղի ունեցել հաճախորդի ստեղծման/թարմացման ժամանակ',
        })
      }
    },
  },
}
</script>
