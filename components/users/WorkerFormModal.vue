<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h3 class="text-lg font-semibold">
          {{ isEdit ? 'Խմբագրել աշխատակցին' : 'Ստեղծել նոր աշխատակից' }}
        </h3>
        <button class="rounded-lg p-1 hover:bg-gray-100" @click="$emit('close')">✕</button>
      </div>

      <div class="px-5 py-4 overflow-y-auto">
        <form class="space-y-4" @submit.prevent="submit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm mb-1">Անուն</label>
              <input v-model.trim="form.name" type="text" class="w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label class="block text-sm mb-1">Ազգանուն</label>
              <input v-model.trim="form.last_name" type="text" class="w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label class="block text-sm mb-1">Էլ․ փոստ</label>
              <input v-model.trim="form.email" type="email" class="w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label class="block text-sm mb-1">Դեր</label>
              <select v-model="form.role_id" class="w-full rounded-lg border px-3 py-2">
                <option disabled value="">Ընտրել դեր</option>
                <option v-for="r in allowedRoles" :key="r.id" :value="r.id">
                  {{ r.value || r.name }}
                </option>
              </select>
            </div>

            <div v-if="requiresFactory">
              <label class="block text-sm mb-1">Արտադրամաս</label>
              <select v-model="form.factory_id" class="w-full rounded-lg border px-3 py-2">
                <option disabled :value="null">Ընտրել արտադրամաս</option>
                <option v-for="f in factories" :key="f.id" :value="f.id">
                  {{ f.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm mb-1">Հեռախոս</label>
              <input v-model.trim="form.phone" type="text" class="w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label class="block text-sm mb-1">Երկրորդ հեռախոս</label>
              <input v-model.trim="form.second_phone" type="text" class="w-full rounded-lg border px-3 py-2" />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm mb-1">Հասցե</label>
              <input v-model.trim="form.address" type="text" class="w-full rounded-lg border px-3 py-2" />
            </div>
          </div>

          <div v-if="!isEdit" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm mb-1">Գաղտնաբառ</label>
              <input v-model="form.password" type="password" minlength="8" autocomplete="new-password" class="w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm mb-1">Գաղտնաբառի կրկնություն</label>
              <input v-model="form.password_confirmation" type="password" minlength="8" autocomplete="new-password" class="w-full rounded-lg border px-3 py-2" />
            </div>
            <p class="sm:col-span-2 text-xs text-gray-500">Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։</p>
          </div>
        </form>
      </div>

      <div class="px-5 py-4 border-t flex justify-end gap-3">
        <button class="px-4 py-2 rounded-lg border" @click="$emit('close')">Փակել</button>
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
const ALLOWED_ROLE_NAMES = ['manager', 'bend', 'laser', 'powder_catting', 'engineer']
const FACTORY_ROLE_NAMES = ['bend', 'laser', 'powder_catting']

export default {
  name: 'WorkerFormModal',
  props: {
    visible: { type: Boolean, default: false },
    worker: { type: Object, default: null },
    roles: { type: Array, default: () => [] },
    factories: { type: Array, default: () => [] },
    submitting: { type: Boolean, default: false },
  },
  data() {
    return {
      form: this.emptyForm(),
    }
  },
  computed: {
    isEdit() {
      return !!(this.worker && this.worker.id)
    },
    allowedRoles() {
      return (this.roles || []).filter((role) => ALLOWED_ROLE_NAMES.includes(role.name))
    },
    selectedRole() {
      return this.allowedRoles.find((role) => String(role.id) === String(this.form.role_id)) || null
    },
    requiresFactory() {
      return FACTORY_ROLE_NAMES.includes(this.selectedRole?.name)
    },
  },
  watch: {
    visible(v) {
      v ? this.bootstrap() : this.reset()
    },
    'form.role_id'() {
      if (!this.requiresFactory) this.form.factory_id = null
    },
  },
  methods: {
    emptyForm() {
      return {
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
    bootstrap() {
      if (this.isEdit) {
        const u = this.worker
        this.form = {
          name: u?.name || '',
          last_name: u?.worker?.last_name || '',
          email: u?.email || '',
          role_id: u?.role_id || '',
          factory_id: u?.factory_id ?? null,
          phone: u?.worker?.phone || '',
          second_phone: u?.worker?.second_phone || '',
          address: u?.worker?.address || '',
          password: '',
          password_confirmation: '',
        }
      } else {
        this.reset()
      }
    },
    reset() {
      this.form = this.emptyForm()
    },
    validate() {
      if (!this.form.name.trim()) return 'Անունը պարտադիր է'
      if (!this.form.email.trim()) return 'Էլ․ փոստը պարտադիր է'
      if (!this.form.role_id || !this.selectedRole) return 'Ընտրեք թույլատրելի դեր'
      if (this.requiresFactory && !this.form.factory_id) return 'Ընտրեք արտադրամաս'
      if (!this.form.phone.trim()) return 'Հեռախոսը պարտադիր է'
      if (!this.isEdit) {
        if (!this.form.password) return 'Գաղտնաբառը պարտադիր է'
        if (this.form.password.length < 8) return 'Գաղտնաբառը պետք է լինի առնվազն 8 նիշ'
        if (this.form.password !== this.form.password_confirmation) return 'Գաղտնաբառերը չեն համընկնում'
      }
      return null
    },
    submit() {
      const err = this.validate()
      if (err) return alert(err)

      const payload = {
        name: this.form.name.trim(),
        last_name: this.form.last_name || null,
        email: this.form.email.trim().toLowerCase(),
        role_id: this.form.role_id,
        factory_id: this.requiresFactory ? this.form.factory_id : null,
        phone: this.form.phone.trim(),
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
