<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white p-6 rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto"
    >
      <h2 class="text-lg font-semibold mb-4">
        {{ isEdit ? 'Խմբագրել հաճախորդին' : 'Նոր հաճախորդ' }}
      </h2>

      <div
        v-if="globalError"
        class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
      >
        {{ globalError }}
      </div>

      <div class="grid grid-cols-2 gap-4">
        <!-- Հիմնական դաշտեր -->
        <div>
          <label class="block mb-1"
            >Անուն / Առաջնային անվանում
            <span class="text-red-600">*</span></label
          >
          <input
            v-model="form.name"
            type="text"
            class="border rounded w-full p-2"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-red-600">
            {{ errors.name[0] }}
          </p>
        </div>

        <div>
          <label class="block mb-1"
            >Հեռախոս <span class="text-red-600">*</span></label
          >
          <input
            v-model="form.phone"
            type="text"
            class="border rounded w-full p-2"
          />
          <p v-if="errors.phone" class="mt-1 text-xs text-red-600">
            {{ errors.phone[0] }}
          </p>
        </div>

        <div>
          <label class="block mb-1">Հասցե</label>
          <input
            v-model="form.address"
            type="text"
            class="border rounded w-full p-2"
          />
          <p v-if="errors.address" class="mt-1 text-xs text-red-600">
            {{ errors.address[0] }}
          </p>
        </div>

        <div>
          <label class="block mb-1"
            >Կարգավիճակ <span class="text-red-600">*</span></label
          >
          <select v-model="form.type" class="border rounded w-full p-2">
            <option disabled value="">Ընտրել...</option>
            <option value="physPerson">Ֆիզիկական անձ</option>
            <option value="legalEntity">Իրավաբանական անձ</option>
          </select>
          <p v-if="errors.type" class="mt-1 text-xs text-red-600">
            {{ errors.type[0] }}
          </p>
        </div>

        <!-- Իրավաբանական անձի դաշտեր -->
        <template v-if="form.type === 'legalEntity'">
          <div class="col-span-2 border-t pt-4 mt-4">
            <h3 class="text-md font-medium mb-3 text-gray-700">
              Իրավաբանական անձի տվյալներ
            </h3>
          </div>

          <div>
            <label class="block mb-1"
              >Ընկերության անվանումը <span class="text-red-600">*</span></label
            >
            <input
              v-model="form.company_name"
              type="text"
              class="border rounded w-full p-2"
            />
            <p v-if="errors.company_name" class="mt-1 text-xs text-red-600">
              {{ errors.company_name[0] }}
            </p>
          </div>

          <div>
            <label class="block mb-1"
              >ՀՎՀՀ (ԱՎՃ) <span class="text-red-600">*</span></label
            >
            <input
              v-model="form.AVC"
              type="text"
              class="border rounded w-full p-2"
            />
            <p v-if="errors.AVC" class="mt-1 text-xs text-red-600">
              {{ errors.AVC[0] }}
            </p>
          </div>

          <div class="col-span-2">
            <label class="block mb-1"
              >Հաշվապահի անունը <span class="text-red-600">*</span></label
            >
            <input
              v-model="form.accountant"
              type="text"
              class="border rounded w-full p-2"
            />
            <p v-if="errors.accountant" class="mt-1 text-xs text-red-600">
              {{ errors.accountant[0] }}
            </p>
          </div>
        </template>

        <!-- Միայն ստեղծման ժամանակ -->
        <template v-if="!isEdit">
          <div class="col-span-2 border-t pt-4 mt-6">
            <h3 class="text-md font-medium mb-3 text-gray-700">
              Մուտքի տվյալներ
            </h3>
          </div>

          <div>
            <label class="block mb-1"
              >Էլ․ փոստ <span class="text-red-600">*</span></label
            >
            <input
              v-model="form.email"
              type="email"
              class="border rounded w-full p-2"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-600">
              {{ errors.email[0] }}
            </p>
          </div>

          <div>
            <label class="block mb-1"
              >Գաղտնաբառ <span class="text-red-600">*</span></label
            >
            <input
              v-model="form.password"
              type="password"
              class="border rounded w-full p-2"
            />
            <p v-if="errors.password" class="mt-1 text-xs text-red-600">
              {{ errors.password[0] }}
            </p>
          </div>

          <div>
            <label class="block mb-1"
              >Գաղտնաբառի կրկնություն <span class="text-red-600">*</span></label
            >
            <input
              v-model="form.password_confirmation"
              type="password"
              class="border rounded w-full p-2"
            />
            <p
              v-if="errors.password_confirmation"
              class="mt-1 text-xs text-red-600"
            >
              {{ errors.password_confirmation[0] }}
            </p>
          </div>
        </template>
      </div>

      <div class="flex justify-end mt-6 gap-3">
        <button class="px-4 py-2 border rounded-lg" @click="$emit('close')">
          Չեղարկել
        </button>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg"
          :disabled="submitting"
          @click="submit"
        >
          {{
            submitting ? 'Պահպանվում է...' : isEdit ? 'Թարմացնել' : 'Ստեղծել'
          }}
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
      form: {
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
      },
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
    resetForm() {
      Object.assign(this.$data.form, {
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
      })
    },

    submit() {
      const data = {
        ...this.form,
        type: this.form.type || 'physPerson',
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
