<template>
  <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-black tracking-tight sm:text-3xl">{{ copy.requests }}</h1>
    <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ copy.reviewIntro }}</p>
    <div class="mt-6 flex flex-wrap items-center gap-2" role="group" :aria-label="copy.requests">
      <button v-for="tab in statuses" :key="tab" type="button" class="rounded-xl border px-3 py-2 text-sm font-semibold" :class="status === tab ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'" :aria-pressed="status === tab" @click="changeStatus(tab)">{{ copy[tab] }} <span class="ml-1 opacity-70">{{ counts[tab] }}</span></button>
    </div>
    <div class="mt-4 max-w-xs">
      <label for="request-type" class="sr-only">{{ copy.allTypes }}</label>
      <select id="request-type" v-model="type" class="field-control" @change="page = 1; loadRequests()"><option value="">{{ copy.allTypes }}</option><option value="employee">{{ copy.staff }}</option><option value="client">{{ copy.client }}</option></select>
    </div>
    <p v-if="loading" class="mt-6 text-sm text-slate-500" role="status">{{ copy.loading }}</p>
    <div v-else-if="listError" class="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200" role="alert">{{ listError }} <button type="button" class="ml-2 font-bold underline" @click="loadRequests">{{ copy.retry }}</button></div>
    <p v-else-if="!requests.length" class="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">{{ copy.empty }}</p>
    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2">
      <article v-for="request in requests" :key="request.id" class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" :data-request-id="request.id">
        <div class="flex flex-wrap items-start justify-between gap-2"><h2 class="min-w-0 break-words text-base font-bold">{{ fullName(request) }}</h2><span class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold dark:bg-slate-800">{{ request.type === 'employee' ? copy.staff : copy.client }}</span></div>
        <p class="mt-2 break-all text-sm text-slate-500 dark:text-slate-400">{{ request.email }}</p>
        <p v-if="request.job_title" class="mt-3 break-words text-sm"><span class="text-slate-500">{{ copy.applicantJob }}:</span> {{ request.job_title }}</p>
        <p class="mt-3 text-xs text-slate-400">{{ formatDate(request.created_at) }}</p>
        <div v-if="request.status === 'pending'" class="mt-5 flex flex-wrap gap-2"><button type="button" class="app-button-primary" @click="openReview(request, 'approve')">{{ copy.approve }}</button><button type="button" class="app-button-secondary text-rose-600 dark:text-rose-300" @click="openReview(request, 'reject')">{{ copy.reject }}</button></div>
        <p v-else class="mt-4 text-sm font-semibold" :class="request.status === 'approved' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'">{{ copy[request.status] }}</p>
      </article>
    </div>
    <div v-if="!loading && !listError && lastPage > 1" class="mt-6 flex flex-wrap items-center gap-3 text-sm"><button type="button" class="app-button-secondary" :disabled="page <= 1" @click="page--; loadRequests()">{{ copy.previous }}</button><span>{{ copy.page }} {{ page }} / {{ lastPage }}</span><button type="button" class="app-button-secondary" :disabled="page >= lastPage" @click="page++; loadRequests()">{{ copy.next }}</button></div>

    <div v-if="selected" class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4" @click.self="closeReview" @keydown.esc="closeReview">
      <section ref="dialog" role="dialog" aria-modal="true" aria-labelledby="request-review-title" tabindex="-1" class="mx-auto my-6 w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:my-12 sm:p-8" @keydown.tab="trapFocus">
        <h2 id="request-review-title" class="text-xl font-black">{{ action === 'approve' ? copy.approve : copy.reject }}</h2>
        <p class="mt-3 break-words font-bold">{{ fullName(selected) }}</p><p class="mt-1 break-all text-sm text-slate-500">{{ selected.email }}</p>
        <p v-if="selected.job_title" class="mt-3 break-words text-sm"><span class="text-slate-500">{{ copy.applicantJob }}:</span> {{ selected.job_title }}</p>
        <form class="mt-5 space-y-4" novalidate @submit.prevent="submitReview">
          <template v-if="action === 'approve' && selected.type === 'employee'">
            <p class="text-sm leading-6 text-slate-500">{{ copy.employeeReview }}</p>
            <p v-if="optionsLoading" role="status" class="text-sm text-slate-500">{{ copy.loading }}</p>
            <div v-else-if="optionsError" role="alert" class="text-sm text-rose-600">{{ optionsError }} <button type="button" class="font-bold underline" @click="loadOptions">{{ copy.retry }}</button></div>
            <template v-else>
              <div><label for="request-role" class="field-label">{{ copy.position }}</label><select id="request-role" v-model="roleId" class="field-control" :disabled="busy" :aria-invalid="Boolean(errors.role_id)"><option value="">{{ copy.selectRole }}</option><option v-for="role in roles" :key="role.id" :value="role.id">{{ copy.roles[role.name] || role.value || role.name }}</option></select><p v-if="errors.role_id" class="field-error">{{ errors.role_id }}</p></div>
              <div v-if="needsWorkshop"><label for="request-factory" class="field-label">{{ copy.workshop }}</label><select id="request-factory" v-model="factoryId" class="field-control" :disabled="busy" :aria-invalid="Boolean(errors.factory_id)"><option value="">{{ copy.selectFactory }}</option><option v-for="factory in factories" :key="factory.id" :value="factory.id">{{ factory.name }}</option></select><p v-if="errors.factory_id" class="field-error">{{ errors.factory_id }}</p></div>
              <p class="text-xs leading-5 text-slate-500">{{ copy.permissionsHint }}</p>
            </template>
          </template>
          <p v-else class="text-sm leading-6 text-slate-500">{{ action === 'approve' ? copy.clientReview : copy.rejectHint }}</p>
          <div v-if="reviewError" class="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200" role="alert">{{ reviewError }}</div>
          <div class="flex flex-wrap gap-2 pt-2"><button type="submit" class="app-button-primary" :disabled="busy || (action === 'approve' && selected.type === 'employee' && (optionsLoading || Boolean(optionsError)))">{{ busy ? copy.loading : action === 'approve' ? copy.approve : copy.reject }}</button><button type="button" class="app-button-secondary" :disabled="busy" @click="closeReview">{{ copy.cancel }}</button></div>
        </form>
      </section>
    </div>
  </main>
</template>

<script>
import { registrationCopy } from '~/utils/registration-copy'

export default {
  name: 'RegistrationRequests',
  data() {
    return { statuses: ['pending', 'approved', 'rejected'], status: 'pending', type: '', page: 1, lastPage: 1, requests: [], counts: { pending: 0, approved: 0, rejected: 0 }, loading: true, listError: '', listSequence: 0, roles: [], factories: [], optionsLoading: false, optionsError: '', selected: null, action: '', roleId: '', factoryId: '', errors: {}, reviewError: '', busy: false, returnFocus: null, previousOverflow: '' }
  },
  computed: {
    copy() { return registrationCopy(this.$i18n?.locale) },
    needsWorkshop() { return ['laser', 'bend', 'powder_catting'].includes(this.roles.find(role => String(role.id) === String(this.roleId))?.name) },
  },
  watch: { roleId() { this.factoryId = ''; this.errors = {} }, factoryId() { this.$delete(this.errors, 'factory_id') } },
  mounted() { this.loadRequests() },
  beforeDestroy() { if (this.selected) document.body.style.overflow = this.previousOverflow },
  methods: {
    fullName(request) { return [request.name, request.last_name, request.patronymic].filter(Boolean).join(' ') },
    formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(this.$i18n?.locale || 'hy', { year: 'numeric', month: 'short', day: 'numeric' }) },
    changeStatus(status) { this.status = status; this.page = 1; this.loadRequests() },
    async loadRequests() {
      const sequence = ++this.listSequence
      this.loading = true; this.listError = ''
      try {
        const response = await this.$axios.$get('/api/registration-requests', { params: { status: this.status, page: this.page, ...(this.type ? { type: this.type } : {}) }, timeout: 15000 })
        if (sequence !== this.listSequence) return
        this.requests = response.data || []; this.counts = response.counts; this.lastPage = response.meta.last_page
      } catch (_) { if (sequence === this.listSequence) this.listError = this.copy.listFailed }
      finally { if (sequence === this.listSequence) this.loading = false }
    },
    async loadOptions() {
      this.optionsLoading = true; this.optionsError = ''
      try { const response = await this.$axios.$get('/api/registration-requests/options', { timeout: 15000 }); this.roles = response.roles || []; this.factories = response.factories || [] }
      catch (_) { this.optionsError = this.copy.optionsFailed }
      finally { this.optionsLoading = false }
    },
    openReview(request, action) {
      this.returnFocus = document.activeElement; this.previousOverflow = document.body.style.overflow
      this.selected = request; this.action = action; this.roleId = ''; this.factoryId = ''; this.errors = {}; this.reviewError = ''
      document.body.style.overflow = 'hidden'
      this.$nextTick(() => this.$refs.dialog?.focus())
      if (action === 'approve' && request.type === 'employee') this.loadOptions()
    },
    closeReview() {
      if (this.busy) return
      document.body.style.overflow = this.previousOverflow; this.selected = null
      this.returnFocus?.focus()
    },
    trapFocus(event) {
      const controls = Array.from(this.$refs.dialog.querySelectorAll('button:not([disabled]), select:not([disabled]), [href], input:not([disabled])'))
      const first = controls[0]; const last = controls[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === this.$refs.dialog)) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === this.$refs.dialog)) { event.preventDefault(); first?.focus() }
    },
    async submitReview() {
      if (this.busy || !this.selected) return
      this.errors = {}; this.reviewError = ''
      const employee = this.action === 'approve' && this.selected.type === 'employee'
      if (employee) {
        if (this.optionsLoading || this.optionsError) return
        if (!this.roles.some(role => String(role.id) === String(this.roleId))) this.errors.role_id = this.copy.selectRole
        if (this.needsWorkshop && !this.factories.some(factory => String(factory.id) === String(this.factoryId))) this.errors.factory_id = this.copy.selectFactory
        if (Object.keys(this.errors).length) return
      }
      this.busy = true
      let completed = false
      try {
        await this.$axios.$post(`/api/registration-requests/${this.selected.id}/${this.action}`, employee ? { role_id: Number(this.roleId), factory_id: this.needsWorkshop ? Number(this.factoryId) : null } : {}, { timeout: 15000 })
        completed = true
      } catch (error) {
        const data = error.response?.data
        this.errors = Object.fromEntries(Object.entries(data?.errors || {}).map(([key, values]) => [key, Array.isArray(values) ? values[0] : values]))
        this.reviewError = this.errors.email || data?.message || this.copy.reviewFailed
        if (error.response?.status === 409) this.loadRequests()
      } finally { this.busy = false }
      if (completed) { this.closeReview(); this.loadRequests() }
    },
  },
}
</script>

<style scoped>
.field-label{@apply mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400}
.field-control{@apply block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white}
.field-error{@apply mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300}
</style>
