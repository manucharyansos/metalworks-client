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
              class="p-3 border border-b-0 border-gray-200 dark:border-gray-700 hover:bg-gray-300 cursor-pointer"
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
            <li v-for="option in workerStatusOptions" :key="option.id">
              <div
                class="flex p-2 rounded dark:hover:bg-gray-600 hover:bg-gray-300 cursor-pointer"
              >
                <div class="flex items-center h-5">
                  <input
                    :id="'status-' + option.id"
                    v-model="workerStatus"
                    :value="option.value"
                    name="worker-status"
                    type="radio"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
                <div class="ms-2 text-sm">
                  <label
                    :for="'status-' + option.id"
                    class="font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
                  >
                    {{ option.value }}
                  </label>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex flex-col items-center justify-center">
        <div class="grid grid-cols-2 gap-4 float-left w-full">
          <input-with-labels
            id="name"
            v-model="person.name"
            label="Անուն"
            type="text"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="lastName"
            v-model="personClientData.last_name"
            label="Ազգանուն"
            type="text"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="phone"
            v-model="personClientData.phone"
            type="tel"
            label="Հեռախոս"
            class="shadow-md rounded-lg p-3"
            placeholder="+374 __ ______"
            @input="formatPhoneNumber('phone')"
          ></input-with-labels>
          <input-with-labels
            id="secondPhone"
            v-model="personClientData.second_phone"
            type="tel"
            label="Երկրորդ Հեռախոս"
            class="shadow-md rounded-lg p-3"
            placeholder="+374 __ ______"
            @input="formatPhoneNumber('second_phone')"
          ></input-with-labels>
          <input-with-labels
            id="address"
            v-model="personClientData.address"
            type="text"
            label="Հասցե"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="address"
            v-model="person.email"
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
      workerStatus: null,
      // workerStatusOptions: [
      //   { id: 1, value: 'laser', label: 'Լազերային օպերատոր' }, // Changed to 'laser'
      //   { id: 2, value: 'bend', label: 'Կռման օպերատոր' }, // Changed to 'bend'
      // ],
      openPersonsType: false,
      openUsers: false,
      isAccordionType: false,
      isUserAccordion: false,
      isPasswordVisible: false,
      isConfirmPasswordVisible: false,
      person: {},
      personClientData: {},
    }
  },
  computed: {
    ...mapGetters('users', ['getUsers']),
    ...mapGetters('roles', ['roles']),
    users() {
      return this.getUsers
    },
    workerStatusOptions() {
      return this.roles
    },
  },
  mounted() {
    this.fetchWorkers()
    this.fetchRoles()
  },
  methods: {
    ...mapActions('clients', ['addClient']),
    ...mapActions('workers', ['fetchWorkers', 'createWorkers', 'updateWorker']),
    ...mapActions('roles', ['fetchRoles']),
    formatPhoneNumber(field) {
      let phone = this.personClientData[field]
      phone = phone.replace(/\D/g, '')
      if (phone.length > 0) {
        phone = '+374 ' + phone.substring(3)
      }
      if (phone.length > 13) {
        phone = phone.substring(0, 13)
      }
      this.personClientData[field] = phone
    },
    selectUser(user) {
      this.person.email = user.email
      this.person.name = user.name
      this.person.user_id = user.id
      this.id = user.id
      this.personClientData = { ...user.client }
      this.isUserAccordion = false
    },
    async createOrUpdateUser() {
      if (!this.workerStatus) {
        this.$notify({
          type: 'error',
          text: 'Խնդրում ենք ընտրել աշխատակցի տեսակը',
        })
        return
      }

      const clientData = { ...this.personClientData }
      const userData = {
        ...this.person,
        ...clientData,
        name: this.person.name,
        email: this.person.email,
        type: this.workerStatus,
      }

      try {
        if (this.id) {
          await this.updateWorker({ id: this.id, data: userData })
          this.$notify({
            type: 'success',
            text: 'Աշխատակիցը հաջողությամբ թարմացվեց',
          })
        } else {
          await this.createWorkers(userData)
          this.$notify({
            type: 'success',
            text: 'Աշխատակիցը հաջողությամբ ստեղծվեց',
          })
        }
      } catch (error) {
        this.$notify({
          type: 'error',
          text: 'Սխալ է տեղի ունեցել աշխատակցի ստեղծման/թարմացման ժամանակ',
        })
      }
    },
  },
}
</script>
