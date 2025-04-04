<template>
  <div class="w-full h-screen bg-gray-100 dark:bg-gray-800 overflow-y-auto">
    <p
      class="text-gray-800 dark:text-white font-bold font-sans italic my-8 text-2xl text-center"
    >
      Ստեղծել նոր հաճախորդ
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-12 p-4">
      <!--      for role-->
      <select-with-label v-model="selectedRole" :data-value="roles" />

      <div class="flex flex-col items-center justify-center">
        <div class="grid grid-cols-2 gap-4 float-left w-full">
          <input-with-labels
            id="name"
            v-model="personData.name"
            label="Անուն"
            type="text"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="lastName"
            v-model="personData.lastName"
            label="Ազգանուն"
            type="text"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="phone"
            v-model="personData.phone"
            type="phone"
            label="Հեռախոս"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="secondPhone"
            v-model="personData.secondPhone"
            type="phone"
            label="Երկրորդ Հեռախոս"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="address"
            v-model="personData.address"
            type="text"
            label="Հասցե"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="address"
            v-model="personData.email"
            type="email"
            label="Էլ․ փոստ"
            class="shadow-md rounded-lg p-3"
          ></input-with-labels>
          <input-with-labels
            id="password"
            v-model="personData.password"
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
            v-model="personData.confirm_password"
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
          Ստեղծել նոր աշխատակից
        </button>
      </div>
    </div>
    <notifications />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'

export default {
  components: { SelectWithLabel, InputWithLabels },
  layout: 'ManagerLayout',
  middleware: ['manager', 'roleRedirect'],
  data() {
    return {
      personType: '',
      selectedRole: null,
      openPersonsType: false,
      openUsers: false,
      isAccordionType: false,
      isPasswordVisible: false,
      isConfirmPasswordVisible: false,
      personData: {
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
    ...mapGetters('roles', ['roles']),
  },
  mounted() {
    this.fetchRoles()
  },
  methods: {
    ...mapActions('users', ['createWorkers']),
    ...mapActions('roles', ['fetchRoles']),
    togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible
    },
    toggleConfirmPasswordVisibility() {
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible
    },
    async createNewUser() {
      const userData = {
        type: this.selectedRole.value,
        name: this.personData.name,
        last_name: this.personData.lastName,
        phone: this.personData.phone,
        second_phone: this.personData.secondPhone,
        address: this.personData.address,
        email: this.personData.email,
        password: this.personData.password,
        password_confirmation: this.personData.confirm_password,
        role_id: this.selectedRole.id,
      }
      try {
        await this.createWorkers(userData)
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
