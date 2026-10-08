<template>
  <main class="min-h-screen bg-slate-100 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
    <div class="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
      <section class="grid w-full overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1.02fr_0.98fr]">
        <WorkspaceBranding class="order-first lg:order-last" />
        <div class="order-last px-6 py-8 sm:px-10 sm:py-12 lg:order-first lg:px-14 lg:py-16">
          <div v-if="accepted" class="max-w-md" role="status" aria-live="polite">
            <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-700">✓</div>
            <h1 class="text-2xl font-black text-slate-950 dark:text-white">{{ copy.accepted }}</h1>
            <p class="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ copy.acceptedHint }}</p>
            <nuxt-link :to="localePath('/login')" class="app-button-primary mt-6 inline-flex">{{ copy.login }}</nuxt-link>
          </div>
          <template v-else>
            <h1 class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">{{ copy.title }}</h1>
            <p class="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{{ copy.intro }}</p>
            <form class="mt-7 max-w-md space-y-5" novalidate @submit.prevent="sendRegister">
              <label class="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
                <input v-model="isEmployee" name="is_employee" type="checkbox" class="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300" :disabled="loading" />
                <span class="min-w-0 text-sm font-bold text-slate-700 dark:text-slate-200">{{ copy.employee }}</span>
              </label>
              <div v-if="companiesLoading" class="text-sm text-slate-500" role="status">{{ copy.loading }}</div>
              <div v-else-if="companiesError" class="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200" role="alert">
                <p>{{ companiesError }}</p><button type="button" class="mt-2 font-bold underline" @click="loadCompanies">{{ copy.retry }}</button>
              </div>
              <div v-else-if="companies.length > 1">
                <label for="registration-company" class="field-label">{{ copy.company }}</label>
                <select id="registration-company" v-model="companyId" name="company_id" class="field-control" :disabled="loading" :aria-invalid="Boolean(fieldError('company_id'))" @change="clearFieldError('company_id')">
                  <option value="">{{ copy.selectCompany }}</option><option v-for="company in companies" :key="company.id" :value="company.id">{{ company.name }}</option>
                </select>
                <p v-if="fieldError('company_id')" class="field-error">{{ fieldError('company_id') }}</p>
              </div>
              <p v-else-if="companies.length === 1" class="text-sm text-slate-500 dark:text-slate-400">{{ copy.company }}: <strong class="text-slate-900 dark:text-white">{{ companies[0].name }}</strong></p>
              <div class="space-y-4">
                <div v-for="field in fields" :key="field.key">
                  <InputWithLabelIcon v-model="form[field.key]" :type="field.type" :name="field.key" :label="field.label" :label_-id="'registration-' + field.key" :for_-l-abel="'registration-' + field.key" :autocomplete="field.autocomplete" :placeholder="field.placeholder || ''" :maxlength="255" :disabled="loading" :required="field.required" :aria-invalid="Boolean(fieldError(field.key))" :classes="fieldError(field.key) ? '!border-rose-400' : ''" @input="clearFieldError(field.key)" />
                  <p v-if="field.key === 'job_title'" class="mt-2 text-xs leading-5 text-slate-500">{{ copy.jobHint }}</p>
                  <p v-if="fieldError(field.key)" class="field-error">{{ fieldError(field.key) }}</p>
                </div>
              </div>
              <p class="text-xs leading-5 text-slate-500 dark:text-slate-400">{{ copy.sharedHint }}</p>
              <div v-if="submitError" class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200" role="alert">{{ submitError }}</div>
              <button type="submit" :disabled="loading || companiesLoading || Boolean(companiesError)" class="app-button-primary w-full">{{ loading ? copy.sending : copy.send }}</button>
            </form>
            <p class="mt-7 max-w-md border-t border-slate-100 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              {{ copy.existing }} <nuxt-link :to="localePath('/login')" class="font-black text-slate-900 hover:underline dark:text-white">{{ copy.login }}</nuxt-link>
            </p>
          </template>
        </div>
      </section>
    </div>
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
import WorkspaceBranding from '~/components/auth/WorkspaceBranding.vue'
import { registrationCopy } from '~/utils/registration-copy'

export default {
  name: 'Register',
  components: { InputWithLabelIcon, WorkspaceBranding },
  layout: 'default',
  data() {
    return { form: { name: '', last_name: '', patronymic: '', job_title: '', email: '', password: '', password_confirmation: '' }, isEmployee: false, companyId: '', companies: [], companiesLoading: true, companiesError: '', loading: false, localErrors: {}, accepted: false, submitError: '' }
  },
  computed: {
    ...mapGetters('authCustom', ['getErrorMessage', 'getRegistrationErrors']),
    copy() { return registrationCopy(this.$i18n?.locale) },
    fields() {
      const field = (key, label, type = 'text', required = true, autocomplete = 'off') => ({ key, label, type, required, autocomplete })
      return [
        field('name', this.copy.name, 'text', true, 'given-name'),
        ...(this.isEmployee ? [field('last_name', this.copy.lastName, 'text', true, 'family-name'), field('patronymic', this.copy.patronymic, 'text', false, 'additional-name'), field('job_title', this.copy.jobTitle)] : []),
        field('email', this.copy.email, 'email', true, 'email'),
        { ...field('password', this.copy.password, 'password', true, 'new-password'), placeholder: this.copy.passwordHint },
        field('password_confirmation', this.copy.confirmPassword, 'password', true, 'new-password'),
      ]
    },
  },
  watch: {
    isEmployee() { this.localErrors = {}; this.submitError = ''; this.$store.commit('authCustom/setRegistrationErrors', {}) },
  },
  mounted() {
    this.$store.commit('authCustom/setError', null)
    this.$store.commit('authCustom/setErrorMessage', null)
    this.$store.commit('authCustom/setRegistrationErrors', {})
    this.loadCompanies()
  },
  methods: {
    ...mapActions('authCustom', ['registerUser']),
    fieldError(key) { return this.localErrors[key] || this.getRegistrationErrors?.[key]?.[0] || '' },
    clearFieldError(key) {
      this.$delete(this.localErrors, key)
      if (this.getRegistrationErrors?.[key]) {
        const errors = { ...this.getRegistrationErrors }; delete errors[key]
        this.$store.commit('authCustom/setRegistrationErrors', errors)
      }
    },
    async loadCompanies() {
      this.companiesLoading = true; this.companiesError = ''
      try {
        const response = await this.$axios.$get('/api/registration/companies', { timeout: 15000 })
        this.companies = Array.isArray(response?.companies) ? response.companies : []
        if (this.companies.length === 1) this.companyId = this.companies[0].id
        else if (!this.companies.some(company => String(company.id) === String(this.companyId))) this.companyId = ''
        if (!this.companies.length) this.companiesError = this.copy.noCompanies
      } catch (_) { this.companiesError = this.copy.unavailable }
      finally { this.companiesLoading = false }
    },
    validateFields() {
      const errors = {}
      if (!this.form.name.trim()) errors.name = this.copy.required
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim())) errors.email = this.copy.invalidEmail
      if (this.isEmployee && !this.form.last_name.trim()) errors.last_name = this.copy.required
      if (this.isEmployee && !this.form.job_title.trim()) errors.job_title = this.copy.required
      if (!this.companies.some(company => String(company.id) === String(this.companyId))) errors.company_id = this.copy.selectCompany
      if (this.form.password.length < 8) errors.password = this.copy.shortPassword
      if (this.form.password !== this.form.password_confirmation) errors.password_confirmation = this.copy.mismatch
      this.localErrors = errors
      return !Object.keys(errors).length
    },
    async sendRegister() {
      if (this.loading) return
      this.submitError = ''
      this.$store.commit('authCustom/setRegistrationErrors', {})
      if (!this.validateFields()) return
      this.loading = true
      try {
        const response = await this.registerUser({
          name: this.form.name.trim(), email: this.form.email.trim().toLowerCase(),
          last_name: this.isEmployee ? this.form.last_name.trim() : null,
          patronymic: this.isEmployee ? this.form.patronymic.trim() || null : null,
          job_title: this.isEmployee ? this.form.job_title.trim() : null,
          is_employee: this.isEmployee, company_id: Number(this.companyId),
          password: this.form.password, password_confirmation: this.form.password_confirmation,
        })
        if (response?.status === 'pending') {
          this.accepted = true
          this.form.password = ''; this.form.password_confirmation = ''
        } else this.submitError = this.getErrorMessage === 'Registration failed' ? this.copy.failed : this.getErrorMessage || this.copy.failed
      } catch (_) { this.submitError = this.copy.failed }
      finally { this.loading = false }
    },
  },
}
</script>

<style scoped>
.field-label{@apply mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400}
.field-control{@apply block w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white}
.field-error{@apply mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300}
</style>
