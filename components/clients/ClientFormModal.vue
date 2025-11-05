<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]"
    @click.self="$emit('close')"
  >
    <div class="bg-white p-6 rounded-lg w-full max-w-2xl">
      <h2 class="text-lg font-semibold mb-4">
        {{ isEdit ? 'Խմբագրել հաճախորդին' : 'Նոր հաճախորդ' }}
      </h2>

      <!-- գլոբալ սխալի բլոկ -->
      <div
        v-if="globalError"
        class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
      >
        {{ globalError }}
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-1">Անուն</label>
          <input
            v-model="form.name"
            type="text"
            class="border rounded w-full p-2"
          />
          <p v-if="errors && errors.name" class="mt-1 text-xs text-red-600">
            {{ errors.name[0] }}
          </p>
        </div>

        <div>
          <label class="block mb-1">Հեռախոս</label>
          <input
            v-model="form.phone"
            type="text"
            class="border rounded w-full p-2"
          />
          <p v-if="errors && errors.phone" class="mt-1 text-xs text-red-600">
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
          <p v-if="errors && errors.address" class="mt-1 text-xs text-red-600">
            {{ errors.address[0] }}
          </p>
        </div>

        <div>
          <label class="block mb-1">Կարգավիճակ</label>
          <select v-model="form.type" class="border rounded w-full p-2">
            <option disabled value="">Ընտրել...</option>
            <option value="physPerson">Ֆիզիկական անձ</option>
            <option value="legalEntity">Իրավաբանական անձ</option>
          </select>
          <p v-if="errors && errors.type" class="mt-1 text-xs text-red-600">
            {{ errors.type[0] }}
          </p>
        </div>

        <!-- միայն create ժամանակ email/password դաշտերը -->
        <template v-if="!isEdit">
          <div>
            <label class="block mb-1">Էլ․ փոստ</label>
            <input
              v-model="form.email"
              type="email"
              class="border rounded w-full p-2"
            />
            <p v-if="errors && errors.email" class="mt-1 text-xs text-red-600">
              {{ errors.email[0] }}
            </p>
          </div>

          <div>
            <label class="block mb-1">Գախտնաբառ</label>
            <input
              v-model="form.password"
              type="password"
              class="border rounded w-full p-2"
            />
            <p
              v-if="errors && errors.password"
              class="mt-1 text-xs text-red-600"
            >
              {{ errors.password[0] }}
            </p>
          </div>

          <div>
            <label class="block mb-1">Գախտնաբառի կրկնություն</label>
            <input
              v-model="form.password_confirmation"
              type="password"
              class="border rounded w-full p-2"
            />
            <p
              v-if="errors && errors.password_confirmation"
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
    // ⬇ errors / globalError նոր props
    errors: {
      type: Object,
      default: () => ({}),
    },
    globalError: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      form: {
        id: null,
        name: '',
        phone: '',
        address: '',
        type: '',
        email: '',
        password: '',
        password_confirmation: '',
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
      handler(val) {
        if (val) {
          this.form = {
            id: val.user_id ?? val.id ?? null,
            name: val.name || '',
            phone: val.phone || '',
            address: val.address || '',
            type: val.type || '',
            email: val.user?.email || '',
            password: '',
            password_confirmation: '',
          }
        } else {
          this.resetForm()
        }
      },
      immediate: true,
    },
    visible(v) {
      if (!v) this.resetForm()
    },
  },
  methods: {
    resetForm() {
      this.form = {
        id: null,
        name: '',
        phone: '',
        address: '',
        type: '',
        email: '',
        password: '',
        password_confirmation: '',
      }
    },
    submit() {
      this.$emit('submit', {
        isEdit: this.isEdit,
        id: this.form.id,
        data: this.form,
      })
    },
  },
}
</script>
