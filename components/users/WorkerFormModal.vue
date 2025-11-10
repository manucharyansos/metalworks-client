<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h3 class="text-lg font-semibold">
          {{ isEdit ? 'Խմբագրել աշխատակցին' : 'Ստեղծել նոր աշխատակից' }}
        </h3>
        <button
          class="rounded-lg p-1 hover:bg-gray-100"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Body (scrollable) -->
      <div class="px-5 py-4 overflow-y-auto">
        <form class="space-y-4" @submit.prevent="submit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm mb-1">Անուն</label>
              <input
                v-model.trim="form.name"
                type="text"
                class="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm mb-1">Ազգանուն</label>
              <input
                v-model.trim="form.last_name"
                type="text"
                class="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm mb-1">Էլ․ փոստ</label>
              <input
                v-model.trim="form.email"
                type="email"
                class="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm mb-1">Դեր</label>
              <select
                v-model="form.role_id"
                class="w-full rounded-lg border px-3 py-2"
              >
                <option disabled value="">Ընտրել դեր</option>
                <option v-for="r in roles" :key="r.id" :value="r.id">
                  {{ r.value || r.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm mb-1">Արտադրամաս</label>
              <select
                v-model="form.factory_id"
                class="w-full rounded-lg border px-3 py-2"
              >
                <option :value="null">— Չկցել —</option>
                <option
                  v-for="f in factories"
                  :key="f.id"
                  :value="f.id"
                >
                  {{ f.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm mb-1">Հեռախոս</label>
              <input
                v-model.trim="form.phone"
                type="text"
                class="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm mb-1">Երկրորդ հեռախոս</label>
              <input
                v-model.trim="form.second_phone"
                type="text"
                class="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm mb-1">Հասցե</label>
              <input
                v-model.trim="form.address"
                type="text"
                class="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          <!-- only on create we require password -->
          <div v-if="!isEdit" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm mb-1">Գաղտնաբառ</label>
              <input
                v-model="form.password"
                type="password"
                class="w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label class="block text-sm mb-1">Գաղտնաբառի կրկնություն</label>
              <input
                v-model="form.password_confirmation"
                type="password"
                class="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="px-5 py-4 border-t flex justify-end gap-3">
        <button class="px-4 py-2 rounded-lg border" @click="$emit('close')">
          Փակել
        </button>
        <button
          class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? 'Պահպանում…' : isEdit ? 'Պահպանել' : 'Ստեղծել' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkerFormModal',
  props: {
    visible: { type: Boolean, default: false },
    worker: { type: Object, default: null }, // edit mode if has id
    roles: { type: Array, default: () => [] },
    factories: { type: Array, default: () => [] },
    submitting: { type: Boolean, default: false },
  },
  data() {
    return {
      form: {
        name: '',
        last_name: '',
        email: '',
        role_id: '',
        factory_id: null,
        phone: '',
        second_phone: '',
        address: '',
        // create-only:
        password: '',
        password_confirmation: '',
      },
    }
  },
  computed: {
    isEdit() {
      return !!(this.worker && this.worker.id)
    },
  },
  watch: {
    visible(v) {
      v ? this.bootstrap() : this.reset()
    },
  },
  methods: {
    bootstrap() {
      if (this.isEdit) {
        const u = this.worker
        this.form = {
          name: u?.name || '',
          last_name: u?.client?.last_name || '',
          email: u?.email || '',
          role_id: u?.role_id || '',
          factory_id: u?.factory_id ?? null,
          phone: u?.client?.phone || '',
          second_phone: u?.client?.second_phone || '',
          address: u?.client?.address || '',
          password: '',
          password_confirmation: '',
        }
      } else {
        this.reset()
      }
    },
    reset() {
      this.form = {
        name: '',
        last_name: '',
        email: '',
        role_id: '',
        factory_id: null,
        phone: '',
        second_phone: '',
        address: '',
        password: '',
        password_confirmation: '',
      }
    },
    validate() {
      if (!this.form.name.trim()) return 'Անունը պարտադիր է'
      if (!this.form.email.trim()) return 'Էլ․ փոստը պարտադիր է'
      if (!this.form.role_id) return 'Ընտրեք դեր'
      // factory_id ոչ պարտադիր, բայց կարող է ընտրվել
      if (!this.form.phone.trim()) return 'Հեռախոսը պարտադիր է'
      if (!this.isEdit) {
        if (!this.form.password) return 'Գաղտնաբառը պարտադիր է'
        if (this.form.password.length < 6)
          return 'Գաղտնաբառը պետք է լինի ≥ 6 սիմվոլ'
        if (this.form.password !== this.form.password_confirmation)
          return 'Գաղտնաբառերը չեն համընկնում'
      }
      return null
    },
    submit() {
      const err = this.validate()
      if (err) return alert(err)

      // payload server-ի պահանջով
      const payload = {
        name: this.form.name,
        last_name: this.form.last_name || null,
        email: this.form.email,
        role_id: this.form.role_id,
        factory_id: this.form.factory_id || null,
        // client fields
        type: 'worker',
        phone: this.form.phone,
        second_phone: this.form.second_phone || null,
        address: this.form.address || null,
      }

      if (!this.isEdit) {
        payload.password = this.form.password
        payload.password_confirmation = this.form.password_confirmation
      }

      this.$emit('submit', {
        payload,
        isEdit: this.isEdit,
        id: this.worker?.id,
      })
    },
  },
}
</script>
