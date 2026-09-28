<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4"
    @click.self="$emit('close')"
  >
    <div class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
      <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
          {{ isEdit ? t.editTitle : t.createTitle }}
        </h3>
        <button class="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" @click="$emit('close')">✕</button>
      </div>

      <div class="overflow-y-auto px-5 py-4">
        <form class="space-y-4" @submit.prevent="submit">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm">{{ t.name }}</label>
              <input v-model.trim="form.name" type="text" class="field" />
            </div>

            <div>
              <label class="mb-1 block text-sm">{{ t.lastName }}</label>
              <input v-model.trim="form.last_name" type="text" class="field" />
            </div>

            <div>
              <label class="mb-1 block text-sm">{{ t.email }}</label>
              <input v-model.trim="form.email" type="email" class="field" />
            </div>

            <div>
              <label class="mb-1 block text-sm">{{ t.position }}</label>
              <select v-model="form.role_id" class="field">
                <option disabled value="">{{ t.choosePosition }}</option>
                <option v-for="r in allowedRoles" :key="r.id" :value="r.id">
                  {{ roleLabel(r) }}
                </option>
              </select>
            </div>

            <div>
              <div class="mb-1 flex items-center justify-between gap-2">
                <label class="block text-sm">{{ t.factory }}</label>
                <span v-if="requiresFactory" class="text-[10px] font-bold text-rose-500">{{ t.required }}</span>
              </div>
              <select
                v-model="form.factory_id"
                class="field"
                :disabled="!requiresFactory"
                :class="!requiresFactory ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800' : ''"
              >
                <option :value="null">{{ requiresFactory ? t.chooseFactory : t.factoryNotNeeded }}</option>
                <option v-for="f in factories" :key="f.id" :value="f.id">
                  {{ f.name }}
                </option>
              </select>
              <p v-if="requiresFactory && !factories.length" class="mt-1 text-xs text-rose-500">{{ t.noFactories }}</p>
              <p v-else class="mt-1 text-xs text-slate-400">{{ requiresFactory ? t.factoryHint : t.factoryDisabledHint }}</p>
            </div>

            <div>
              <label class="mb-1 block text-sm">{{ t.phone }}</label>
              <input v-model.trim="form.phone" type="text" class="field" />
            </div>

            <div>
              <label class="mb-1 block text-sm">{{ t.secondPhone }}</label>
              <input v-model.trim="form.second_phone" type="text" class="field" />
            </div>

            <div class="sm:col-span-2">
              <label class="mb-1 block text-sm">{{ t.address }}</label>
              <input v-model.trim="form.address" type="text" class="field" />
            </div>
          </div>

          <div v-if="!isEdit" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm">{{ t.password }}</label>
              <input v-model="form.password" type="password" minlength="8" autocomplete="new-password" class="field" />
            </div>
            <div>
              <label class="mb-1 block text-sm">{{ t.passwordConfirm }}</label>
              <input v-model="form.password_confirmation" type="password" minlength="8" autocomplete="new-password" class="field" />
            </div>
            <p class="text-xs text-slate-500 sm:col-span-2">{{ t.passwordHint }}</p>
          </div>
        </form>
      </div>

      <div class="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
        <button class="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 dark:border-slate-700 dark:text-slate-300" @click="$emit('close')">{{ t.close }}</button>
        <button
          class="rounded-lg bg-slate-950 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? t.saving : isEdit ? t.save : t.create }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const ALLOWED_ROLE_NAMES = ['manager', 'bend', 'laser', 'powder_catting', 'engineer']
const FACTORY_ROLE_NAMES = ['bend', 'laser', 'powder_catting']

const COPY = {
  hy: {
    createTitle: 'Ստեղծել նոր աշխատակից', editTitle: 'Խմբագրել աշխատակցին', name: 'Անուն', lastName: 'Ազգանուն', email: 'Էլ․ փոստ', position: 'Հաստիք', choosePosition: 'Ընտրել հաստիք', factory: 'Արտադրամաս', required: 'Պարտադիր', chooseFactory: 'Ընտրել արտադրամաս', factoryNotNeeded: 'Այս հաստիքի համար արտադրամաս չի պահանջվում', noFactories: 'Արտադրամասերի ցանկը դատարկ է', factoryHint: 'Laser, Bend և Powder coating հաստիքների համար ընտրեք համապատասխան արտադրամասը։', factoryDisabledHint: 'Արտադրամասը հասանելի է արտադրական հաստիքների համար։', phone: 'Հեռախոս', secondPhone: 'Երկրորդ հեռախոս', address: 'Հասցե', password: 'Գաղտնաբառ', passwordConfirm: 'Գաղտնաբառի կրկնություն', passwordHint: 'Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։', close: 'Փակել', save: 'Պահպանել', create: 'Ստեղծել', saving: 'Պահպանում…', nameRequired: 'Անունը պարտադիր է', emailRequired: 'Էլ․ փոստը պարտադիր է', positionRequired: 'Ընտրեք հաստիք', factoryRequired: 'Ընտրեք արտադրամաս', phoneRequired: 'Հեռախոսը պարտադիր է', passwordRequired: 'Գաղտնաբառը պարտադիր է', passwordMin: 'Գաղտնաբառը պետք է լինի առնվազն 8 նիշ', passwordMismatch: 'Գաղտնաբառերը չեն համընկնում', roles: { manager: 'Մենեջեր', bend: 'Կռում', laser: 'Լազերային կտրում', powder_catting: 'Փոշեներկում', engineer: 'Ինժեներ' },
  },
  ru: {
    createTitle: 'Создать сотрудника', editTitle: 'Редактировать сотрудника', name: 'Имя', lastName: 'Фамилия', email: 'Эл. почта', position: 'Должность', choosePosition: 'Выберите должность', factory: 'Цех', required: 'Обязательно', chooseFactory: 'Выберите цех', factoryNotNeeded: 'Для этой должности цех не требуется', noFactories: 'Список цехов пуст', factoryHint: 'Для Laser, Bend и Powder coating выберите соответствующий цех.', factoryDisabledHint: 'Цех выбирается только для производственных должностей.', phone: 'Телефон', secondPhone: 'Второй телефон', address: 'Адрес', password: 'Пароль', passwordConfirm: 'Повтор пароля', passwordHint: 'Пароль должен содержать не менее 8 символов.', close: 'Закрыть', save: 'Сохранить', create: 'Создать', saving: 'Сохранение…', nameRequired: 'Имя обязательно', emailRequired: 'Эл. почта обязательна', positionRequired: 'Выберите должность', factoryRequired: 'Выберите цех', phoneRequired: 'Телефон обязателен', passwordRequired: 'Пароль обязателен', passwordMin: 'Пароль должен содержать не менее 8 символов', passwordMismatch: 'Пароли не совпадают', roles: { manager: 'Менеджер', bend: 'Гибка', laser: 'Лазерная резка', powder_catting: 'Порошковая покраска', engineer: 'Инженер' },
  },
  en: {
    createTitle: 'Create employee', editTitle: 'Edit employee', name: 'First name', lastName: 'Last name', email: 'Email', position: 'Position', choosePosition: 'Choose position', factory: 'Workshop', required: 'Required', chooseFactory: 'Choose workshop', factoryNotNeeded: 'This position does not require a workshop', noFactories: 'No workshops are available', factoryHint: 'Choose the matching workshop for Laser, Bend and Powder coating positions.', factoryDisabledHint: 'Workshop assignment is available for production positions only.', phone: 'Phone', secondPhone: 'Second phone', address: 'Address', password: 'Password', passwordConfirm: 'Confirm password', passwordHint: 'Password must be at least 8 characters.', close: 'Close', save: 'Save', create: 'Create', saving: 'Saving…', nameRequired: 'Name is required', emailRequired: 'Email is required', positionRequired: 'Choose a position', factoryRequired: 'Choose a workshop', phoneRequired: 'Phone is required', passwordRequired: 'Password is required', passwordMin: 'Password must be at least 8 characters', passwordMismatch: 'Passwords do not match', roles: { manager: 'Manager', bend: 'Bending', laser: 'Laser cutting', powder_catting: 'Powder coating', engineer: 'Engineer' },
  },
}

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
    return { form: this.emptyForm() }
  },
  computed: {
    locale() {
      const code = String(this.$i18n?.locale || 'hy').toLowerCase().split('-')[0]
      return ['hy', 'ru', 'en'].includes(code) ? code : 'hy'
    },
    t() { return COPY[this.locale] || COPY.hy },
    isEdit() { return !!(this.worker && this.worker.id) },
    allowedRoles() { return (this.roles || []).filter((role) => ALLOWED_ROLE_NAMES.includes(role.name)) },
    selectedRole() { return this.allowedRoles.find((role) => String(role.id) === String(this.form.role_id)) || null },
    requiresFactory() { return FACTORY_ROLE_NAMES.includes(this.selectedRole?.name) },
  },
  watch: {
    visible(v) { v ? this.bootstrap() : this.reset() },
    'form.role_id'() { if (!this.requiresFactory) this.form.factory_id = null },
  },
  methods: {
    roleLabel(role) { return this.t.roles?.[role.name] || role.value || role.name },
    emptyForm() {
      return { name: '', last_name: '', email: '', role_id: '', factory_id: null, phone: '', second_phone: '', address: '', password: '', password_confirmation: '' }
    },
    bootstrap() {
      if (!this.isEdit) return this.reset()
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
    },
    reset() { this.form = this.emptyForm() },
    validate() {
      if (!this.form.name.trim()) return this.t.nameRequired
      if (!this.form.email.trim()) return this.t.emailRequired
      if (!this.form.role_id || !this.selectedRole) return this.t.positionRequired
      if (this.requiresFactory && !this.form.factory_id) return this.t.factoryRequired
      if (!this.form.phone.trim()) return this.t.phoneRequired
      if (!this.isEdit) {
        if (!this.form.password) return this.t.passwordRequired
        if (this.form.password.length < 8) return this.t.passwordMin
        if (this.form.password !== this.form.password_confirmation) return this.t.passwordMismatch
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
      this.$emit('submit', { payload, isEdit: this.isEdit, id: this.worker?.id })
    },
  },
}
</script>

<style scoped>
.field { @apply w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100; }
</style>
