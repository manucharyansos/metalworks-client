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
              <input v-model.trim="form.name" :disabled="!canEditAccount" type="text" class="field" />
            </div>

            <div>
              <label class="mb-1 block text-sm">{{ t.lastName }}</label>
              <input v-model.trim="form.last_name" type="text" class="field" />
            </div>

            <div>
              <label class="mb-1 block text-sm">{{ t.email }}</label>
              <input v-model.trim="form.email" :disabled="!canEditAccount" type="email" class="field" />
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

          <StaffAssignmentsEditor :value="assignments" :roles="allowedRoles" :factories="factories" :role-names="t.roles" :disabled="submitting || Boolean(worker && worker.is_platform_admin)" @input="setAssignments" />
          <p v-if="!canEditAccount" class="text-xs text-slate-500">{{ companyText.shared }}</p>
          <CompanyAccessEditor v-if="canManageCompanies && !(worker && worker.is_platform_admin)" v-model="companyAccess" :companies="companies" :roles="allowedRoles" :current-company-id="currentCompanyId" :role-names="t.roles" :position-label="t.position" :workshop-label="t.factory" />
          <label v-if="!isEdit && canManageCompanies" class="flex items-center gap-2 text-sm">
            <input v-model="existingAccount" type="checkbox" /> {{ companyText.accountExists }}
          </label>
          <p v-if="existingAccount" class="text-xs text-slate-500">{{ companyText.accountHint }}</p>
          <div v-if="!isEdit && !existingAccount" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
import CompanyAccessEditor from '~/components/users/CompanyAccessEditor.vue'
import StaffAssignmentsEditor from '~/components/users/StaffAssignmentsEditor.vue'
import { assignmentRows, assignmentError, assignmentCopy } from '~/utils/staff-assignments'
import { workspaceCopy } from '~/utils/company-copy'
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
  components: { CompanyAccessEditor, StaffAssignmentsEditor },
  props: {
    visible: { type: Boolean, default: false },
    worker: { type: Object, default: null },
    roles: { type: Array, default: () => [] },
    factories: { type: Array, default: () => [] },
    submitting: { type: Boolean, default: false },
    companies: { type: Array, default: () => [] },
    canManageCompanies: { type: Boolean, default: false },
  },
  data() {
    return { form: this.emptyForm(), companyAccess: [], assignments: assignmentRows(), existingAccount: false }
  },
  computed: {
    locale() {
      const code = String(this.$i18n?.locale || 'hy').toLowerCase().split('-')[0]
      return ['hy', 'ru', 'en'].includes(code) ? code : 'hy'
    },
    t() { return COPY[this.locale] || COPY.hy },
    companyText() { return workspaceCopy(this.locale) },
    currentCompanyId() { return this.$auth?.user?.company?.id },
    canEditAccount() { return !this.isEdit || this.worker.can_edit_account !== false },
    isEdit() { return !!(this.worker && this.worker.id) },
    allowedRoles() { return (this.roles || []).filter((role) => ALLOWED_ROLE_NAMES.includes(role.name) || (this.canManageCompanies && role.name === 'admin')) },
    selectedRole() { return this.allowedRoles.find((role) => String(role.id) === String(this.form.role_id)) || null },
    requiresFactory() { return FACTORY_ROLE_NAMES.includes(this.selectedRole?.name) },
  },
  watch: {
    visible(v) { v ? this.bootstrap() : this.reset() },
    'form.role_id'() { if (!this.requiresFactory) this.form.factory_id = null },
  },
  methods: {
    setAssignments(rows) { this.assignments = rows; this.form.role_id = rows[0]?.role_id || ''; this.form.factory_id = rows[0]?.factory_id || null },
    roleLabel(role) { return role.name === 'admin' ? this.companyText.admin : this.t.roles?.[role.name] || role.value || role.name },
    accessRows() {
      return this.companies.map((company) => {
        const saved = this.worker?.company_access?.find((row) => String(row.company_id) === String(company.id))
        return saved ? { ...saved } : { company_id: company.id, enabled: String(company.id) === String(this.currentCompanyId), role_id: '', factory_id: null }
      })
    },
    emptyForm() {
      return { name: '', last_name: '', email: '', role_id: '', factory_id: null, phone: '', second_phone: '', address: '', password: '', password_confirmation: '' }
    },
    bootstrap() {
      if (!this.isEdit) return this.reset()
      this.companyAccess = this.accessRows()
      this.existingAccount = false
      const u = this.worker
      this.assignments = assignmentRows(u.assignments, u.role_id, u.factory_id)
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
    reset() { this.form = this.emptyForm(); this.assignments = assignmentRows(); this.companyAccess = this.accessRows(); this.existingAccount = false },
    validate() {
      if (!this.form.name.trim()) return this.t.nameRequired
      if (!this.form.email.trim()) return this.t.emailRequired
      const assignmentIssue = assignmentError(this.assignments, this.allowedRoles, this.factories, assignmentCopy(this.locale))
      if (assignmentIssue) return assignmentIssue
      if (!this.form.phone.trim()) return this.t.phoneRequired
      for (const row of this.canManageCompanies ? this.companyAccess : []) {
        if (!row.enabled || String(row.company_id) === String(this.currentCompanyId)) continue
        const issue = assignmentError(assignmentRows(row.assignments, row.role_id, row.factory_id), this.allowedRoles, this.companies.find(company => String(company.id) === String(row.company_id))?.factories || [], assignmentCopy(this.locale))
        if (issue) return issue
      }
      if (!this.isEdit && !this.existingAccount) {
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
        role_id: this.assignments[0].role_id,
        factory_id: this.assignments[0].factory_id || null,
        assignments: assignmentRows(this.assignments),
        phone: this.form.phone.trim(),
        second_phone: this.form.second_phone || null,
        address: this.form.address || null,
      }
      if (this.canManageCompanies && !this.worker?.is_platform_admin) {
        payload.company_access = this.companyAccess.map((row) => String(row.company_id) === String(this.currentCompanyId) ? { ...row, role_id: payload.role_id, factory_id: payload.factory_id, assignments: payload.assignments } : { ...row })
      }
      if (!this.isEdit && !this.existingAccount) {
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
