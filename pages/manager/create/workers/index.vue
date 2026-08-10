<template>
  <div class="w-full min-h-screen bg-gray-100 dark:bg-gray-800 overflow-y-auto p-4 md:p-8">
    <div class="max-w-5xl mx-auto">
      <p class="text-gray-800 dark:text-white font-bold font-montserrat mb-8 text-2xl text-center">
        Ստեղծել նոր աշխատակից
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-8 shadow-sm">
        <select-with-label
          v-model="selectedRole"
          :data-value="allowedRoles"
          display-field="value"
          label="Դեր"
          placeholder="Ընտրեք աշխատակցի դերը"
        />

        <select-with-label
          v-if="requiresFactory"
          v-model="selectedFactory"
          :data-value="factories"
          label="Արտադրամաս"
          placeholder="Ընտրեք արտադրամասը"
        />

        <input-with-labels
          id="name"
          v-model="personData.name"
          label="Անուն"
          type="text"
          class="shadow-md rounded-lg p-3"
        />
        <input-with-labels
          id="lastName"
          v-model="personData.lastName"
          label="Ազգանուն"
          type="text"
          class="shadow-md rounded-lg p-3"
        />
        <input-with-labels
          id="phone"
          v-model="personData.phone"
          type="tel"
          label="Հեռախոս"
          class="shadow-md rounded-lg p-3"
        />
        <input-with-labels
          id="secondPhone"
          v-model="personData.secondPhone"
          type="tel"
          label="Երկրորդ հեռախոս"
          class="shadow-md rounded-lg p-3"
        />
        <input-with-labels
          id="address"
          v-model="personData.address"
          type="text"
          label="Հասցե"
          class="shadow-md rounded-lg p-3"
        />
        <input-with-labels
          id="email"
          v-model="personData.email"
          type="email"
          label="Էլ․ փոստ"
          class="shadow-md rounded-lg p-3"
        />

        <input-with-labels
          id="password"
          v-model="personData.password"
          :type="isPasswordVisible ? 'text' : 'password'"
          label="Գաղտնաբառ"
          class="shadow-md rounded-lg p-3"
        >
          <template #label_back>
            <button type="button" class="text-sm text-gray-500" @click="togglePasswordVisibility">
              {{ isPasswordVisible ? 'Թաքցնել' : 'Ցույց տալ' }}
            </button>
          </template>
        </input-with-labels>

        <input-with-labels
          id="confirm_password"
          v-model="personData.confirm_password"
          :type="isConfirmPasswordVisible ? 'text' : 'password'"
          label="Գաղտնաբառի կրկնություն"
          class="shadow-md rounded-lg p-3"
        >
          <template #label_back>
            <button type="button" class="text-sm text-gray-500" @click="toggleConfirmPasswordVisibility">
              {{ isConfirmPasswordVisible ? 'Թաքցնել' : 'Ցույց տալ' }}
            </button>
          </template>
        </input-with-labels>

        <p class="md:col-span-2 text-xs text-gray-500">
          Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։
        </p>

        <div class="md:col-span-2 flex justify-end">
          <button
            :disabled="saving"
            class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            @click="createNewUser"
          >
            {{ saving ? 'Ստեղծվում է...' : 'Ստեղծել նոր աշխատակից' }}
          </button>
        </div>
      </div>
    </div>
    <notifications />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'

const ALLOWED_ROLE_NAMES = ['manager', 'bend', 'laser', 'powder_catting', 'engineer']
const FACTORY_ROLE_NAMES = ['bend', 'laser', 'powder_catting']

export default {
  components: { SelectWithLabel, InputWithLabels },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
  data() {
    return {
      selectedRole: null,
      selectedFactory: null,
      isPasswordVisible: false,
      isConfirmPasswordVisible: false,
      saving: false,
      personData: {
        name: '',
        lastName: '',
        phone: '',
        secondPhone: '',
        address: '',
        email: '',
        password: '',
        confirm_password: '',
      },
    }
  },
  computed: {
    ...mapGetters('roles', ['roles']),
    ...mapGetters('factory', ['getFactory']),
    allowedRoles() {
      return (this.roles || []).filter((role) => ALLOWED_ROLE_NAMES.includes(role.name))
    },
    factories() {
      return Array.isArray(this.getFactory) ? this.getFactory : []
    },
    requiresFactory() {
      return FACTORY_ROLE_NAMES.includes(this.selectedRole?.name)
    },
  },
  watch: {
    selectedRole() {
      if (!this.requiresFactory) this.selectedFactory = null
    },
  },
  async mounted() {
    await Promise.all([this.fetchRoles(), this.fetchFactory()])
  },
  methods: {
    ...mapActions('workers', ['createWorker']),
    ...mapActions('roles', ['fetchRoles']),
    ...mapActions('factory', ['fetchFactory']),
    togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible
    },
    toggleConfirmPasswordVisibility() {
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible
    },
    validateForm() {
      if (!this.selectedRole) return 'Խնդրում ենք ընտրել աշխատակցի դերը'
      if (this.requiresFactory && !this.selectedFactory) return 'Խնդրում ենք ընտրել արտադրամասը'
      if (!this.personData.name.trim()) return 'Խնդրում ենք լրացնել անունը'
      if (!this.personData.email.trim()) return 'Խնդրում ենք լրացնել էլ․ փոստը'
      if (!this.personData.phone.trim()) return 'Խնդրում ենք լրացնել հեռախոսը'
      if (this.personData.password.length < 8) return 'Գաղտնաբառը պետք է լինի առնվազն 8 նիշ'
      if (this.personData.password !== this.personData.confirm_password) return 'Գաղտնաբառերը չեն համընկնում'
      return null
    },
    async createNewUser() {
      const validationError = this.validateForm()
      if (validationError) {
        this.$notify({ type: 'error', text: validationError })
        return
      }

      const userData = {
        name: this.personData.name.trim(),
        last_name: this.personData.lastName.trim() || null,
        phone: this.personData.phone.trim(),
        second_phone: this.personData.secondPhone.trim() || null,
        address: this.personData.address.trim() || null,
        email: this.personData.email.trim().toLowerCase(),
        password: this.personData.password,
        password_confirmation: this.personData.confirm_password,
        role_id: this.selectedRole.id,
        factory_id: this.requiresFactory ? this.selectedFactory.id : null,
      }

      this.saving = true
      try {
        await this.createWorker(userData)
        this.$notify({ type: 'success', text: 'Աշխատակիցը հաջողությամբ ստեղծվել է' })
        this.$router.push('/manager/workers')
      } catch (error) {
        const message = error?.response?.data?.message || 'Սխալ է տեղի ունեցել աշխատակցի ստեղծման ժամանակ'
        this.$notify({ type: 'error', text: message })
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
