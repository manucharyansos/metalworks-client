<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-lg font-semibold mb-4">
        {{ isEdit ? 'Խմբագրել հաճախորդին' : 'Նոր հաճախորդ' }}
      </h2>

      <div v-if="globalError" class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
        {{ globalError }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block mb-1">Անուն / Առաջնային անվանում <span class="text-red-600">*</span></label>
          <input v-model.trim="form.name" type="text" class="border rounded w-full p-2" />
          <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name[0] }}</p>
        </div>

        <div>
          <label class="block mb-1">Հեռախոս <span class="text-red-600">*</span></label>
          <input v-model.trim="form.phone" type="text" class="border rounded w-full p-2" />
          <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone[0] }}</p>
        </div>

        <div>
          <label class="block mb-1">Հասցե</label>
          <input v-model.trim="form.address" type="text" class="border rounded w-full p-2" />
          <p v-if="errors.address" class="mt-1 text-xs text-red-600">{{ errors.address[0] }}</p>
        </div>

        <div>
          <label class="block mb-1">Կարգավիճակ <span class="text-red-600">*</span></label>
          <select v-model="form.type" class="border rounded w-full p-2">
            <option disabled value="">Ընտրել...</option>
            <option value="physPerson">Ֆիզիկական անձ</option>
            <option value="legalEntity">Իրավաբանական անձ</option>
          </select>
          <p v-if="errors.type" class="mt-1 text-xs text-red-600">{{ errors.type[0] }}</p>
        </div>

        <template v-if="form.type === 'legalEntity'">
          <div class="md:col-span-2 border-t pt-4 mt-4">
            <h3 class="text-md font-medium mb-3 text-gray-700">Իրավաբանական անձի տվյալներ</h3>
          </div>

          <div>
            <label class="block mb-1">Ընկերության անվանումը <span class="text-red-600">*</span></label>
            <input v-model.trim="form.company_name" type="text" class="border rounded w-full p-2" />
            <p v-if="errors.company_name" class="mt-1 text-xs text-red-600">{{ errors.company_name[0] }}</p>
          </div>

          <div>
            <label class="block mb-1">ՀՎՀՀ (ԱՎՃ) <span class="text-red-600">*</span></label>
            <input v-model.trim="form.AVC" type="text" class="border rounded w-full p-2" />
            <p v-if="errors.AVC" class="mt-1 text-xs text-red-600">{{ errors.AVC[0] }}</p>
          </div>

          <div class="md:col-span-2">
            <label class="block mb-1">Հաշվապահի անունը <span class="text-red-600">*</span></label>
            <input v-model.trim="form.accountant" type="text" class="border rounded w-full p-2" />
            <p v-if="errors.accountant" class="mt-1 text-xs text-red-600">{{ errors.accountant[0] }}</p>
          </div>
        </template>

        <template v-if="!isEdit">
          <div class="md:col-span-2 border-t pt-4 mt-6">
            <h3 class="text-md font-medium mb-3 text-gray-700">Մուտքի տվյալներ</h3>
          </div>

          <div>
            <label class="block mb-1">Էլ․ փոստ <span class="text-red-600">*</span></label>
            <input v-model.trim="form.email" type="email" autocomplete="email" class="border rounded w-full p-2" />
            <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email[0] }}</p>
          </div>

          <div>
            <label class="block mb-1">Գաղտնաբառ <span class="text-red-600">*</span></label>
            <input v-model="form.password" type="password" minlength="8" autocomplete="new-password" class="border rounded w-full p-2" />
            <p class="mt-1 text-xs text-gray-500">Առնվազն 8 նիշ</p>
            <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password[0] }}</p>
          </div>

          <div>
            <label class="block mb-1">Գաղտնաբառի կրկնություն <span class="text-red-600">*</span></label>
            <input v-model="form.password_confirmation" type="password" minlength="8" autocomplete="new-password" class="border rounded w-full p-2" />
            <p v-if="errors.password_confirmation" class="mt-1 text-xs text-red-600">{{ errors.password_confirmation[0] }}</p>
          </div>
        </template>
      </div>

      <p v-if="localError" class="mt-4 text-sm text-red-600">{{ localError }}</p>

      <div class="flex justify-end mt-6 gap-3">
        <button class="px-4 py-2 border rounded-lg" @click="$emit('close')">Չեղարկել</button>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? 'Պահպանվում է...' : isEdit ? 'Թարմացնել' : 'Ստեղծել' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    client: Object,
    submitting: Boolean,
    errors: { type: Object, default: () => ({}) },
    globalError: { type: String, default: '' },
  },
  data() {
    return {
      localError: '',
      form: this.emptyForm(),
    }
  },
  computed: {
    isEdit() {
      return !!this.client
    },
  },
  watch: {
    client: {
      handler(newVal) {
        this.localError = ''
        if (newVal) {
          this.form = {
            name: newVal.name || '',
            phone: newVal.phone || '',
            address: newVal.address || '',
            type: newVal.type || '',
            company_name: newVal.company_name || '',
            AVC: newVal.AVC || '',
            accountant: newVal.accountant || '',
            email: newVal.user?.email || '',
            password: '',
            password_confirmation: '',
          }
        } else {
          this.resetForm()
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    emptyForm() {
      return {
        name: '',
        phone: '',
        address: '',
        type: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
        AVC: '',
        accountant: '',
      }
    },
    resetForm() {
      this.form = this.emptyForm()
      this.localError = ''
    },
    validate() {
      if (!this.form.name.trim()) return 'Անունը պարտադիր է'
      if (!this.form.phone.trim()) return 'Հեռախոսը պարտադիր է'
      if (!['physPerson', 'legalEntity'].includes(this.form.type)) return 'Ընտրեք հաճախորդի տեսակը'
      if (this.form.type === 'legalEntity') {
        if (!this.form.company_name.trim()) return 'Ընկերության անվանումը պարտադիր է'
        if (!String(this.form.AVC || '').trim()) return 'ՀՎՀՀ-ն պարտադիր է'
        if (!this.form.accountant.trim()) return 'Հաշվապահի անունը պարտադիր է'
      }
      if (!this.isEdit) {
        if (!this.form.email.trim()) return 'Էլ․ փոստը պարտադիր է'
        if (this.form.password.length < 8) return 'Գաղտնաբառը պետք է լինի առնվազն 8 նիշ'
        if (this.form.password !== this.form.password_confirmation) return 'Գաղտնաբառերը չեն համընկնում'
      }
      return null
    },
    submit() {
      this.localError = this.validate() || ''
      if (this.localError) return

      const data = {
        name: this.form.name.trim(),
        phone: this.form.phone.trim(),
        address: this.form.address.trim() || null,
        type: this.form.type,
        company_name: this.form.type === 'legalEntity' ? this.form.company_name.trim() : null,
        AVC: this.form.type === 'legalEntity' ? String(this.form.AVC).trim() : null,
        accountant: this.form.type === 'legalEntity' ? this.form.accountant.trim() : null,
      }

      if (!this.isEdit) {
        data.email = this.form.email.trim().toLowerCase()
        data.password = this.form.password
        data.password_confirmation = this.form.password_confirmation
      }

      this.$emit('submit', {
        isEdit: this.isEdit,
        id: this.client?.user_id || this.client?.user?.id,
        data,
      })
    },
  },
}
</script>
