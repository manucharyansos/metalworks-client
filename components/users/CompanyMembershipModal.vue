<template>
  <div class="fixed inset-0 z-[1000] overflow-y-auto bg-slate-950/50 p-4" @click.self="close" @keydown.esc="close">
    <section ref="dialog" role="dialog" aria-modal="true" aria-labelledby="company-membership-title" tabindex="-1" class="mx-auto my-6 max-w-xl rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-8" @keydown.tab="trapFocus">
      <h2 id="company-membership-title" class="text-xl font-black">{{ copy.title }}</h2>
      <p class="mt-2 break-words font-semibold">{{ user.name || user.display_name }}</p>
      <p class="mt-1 break-all text-sm text-slate-500">{{ user.email || user.user?.email }}</p>
      <p class="mt-4 text-sm text-slate-500">{{ copy.intro }}</p><p class="mt-1 text-xs leading-5 text-slate-400">{{ copy.rights }}</p>
      <p v-if="loading" class="mt-6 text-sm" role="status">{{ copy.loading }}</p>
      <div v-else-if="loadError" class="mt-6 text-sm text-rose-600" role="alert">{{ loadError }} <button type="button" class="font-bold underline" @click="load">{{ copy.retry }}</button></div>
      <form v-else data-workspace-form class="mt-6 space-y-3" novalidate @submit.prevent="save">
        <fieldset v-for="company in companies" :key="company.id" class="min-w-0 rounded-2xl border border-slate-200 p-4 dark:border-slate-700" :disabled="busy || company.read_only" :data-company-id="company.id">
          <label class="flex items-center gap-3 break-words text-sm font-bold"><input type="checkbox" :checked="row(company.id).enabled" :aria-label="company.name" @change="change(company.id, 'enabled', $event.target.checked)" />{{ company.name }}</label>
          <p v-if="company.read_only" class="mt-2 text-xs leading-5 text-slate-500">{{ String(company.id) === String(currentCompanyId) ? copy.current : copy.protected }}</p>
          <StaffAssignmentsEditor v-else-if="row(company.id).enabled" class="mt-4" :value="assignmentRows(row(company.id).assignments, row(company.id).role_id, row(company.id).factory_id)" :roles="roles" :factories="company.factories" :role-names="copy.roles" :id-prefix="'company-' + company.id" @input="setAssignments(company.id, $event)" />
          <p v-if="errors[company.id]" class="mt-2 text-xs text-rose-600" role="alert">{{ errors[company.id] }}</p>
        </fieldset>
        <p v-if="saveError" class="text-sm text-rose-600" role="alert">{{ saveError }}</p>
        <div class="flex flex-wrap justify-end gap-2 pt-3"><button type="button" class="app-button-secondary" :disabled="busy" @click="close">{{ copy.cancel }}</button><button type="submit" class="app-button-primary" :disabled="busy || !changes.length">{{ busy ? copy.saving : copy.save }}</button></div>
      </form>
      <button v-if="loading || loadError" type="button" class="app-button-secondary mt-6" @click="close">{{ copy.cancel }}</button>
    </section>
  </div>
</template>

<script>
import { membershipCopy, changedCompanyAccess } from '~/utils/membership-copy'
import StaffAssignmentsEditor from '~/components/users/StaffAssignmentsEditor.vue'
import { assignmentRows, assignmentError, assignmentCopy } from '~/utils/staff-assignments'

export default {
  components: { StaffAssignmentsEditor },
  props: { user: { type: Object, required: true } },
  data() { return { companies: [], roles: [], rows: [], originals: [], currentCompanyId: null, loading: true, loadError: '', saveError: '', errors: {}, busy: false, sequence: 0, returnFocus: null, previousOverflow: '' } },
  computed: {
    copy() { return membershipCopy(this.$i18n?.locale) },
    userId() { return this.user.user_id || this.user.user?.id || this.user.id },
    changes() { return changedCompanyAccess(this.rows, this.originals) },
  },
  mounted() {
    this.returnFocus = document.activeElement; this.previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'; this.$refs.dialog.focus(); this.load()
  },
  beforeDestroy() { this.sequence++; document.body.style.overflow = this.previousOverflow; this.returnFocus?.focus() },
  methods: {
    assignmentRows,
    setAssignments(id, rows) { const row = this.row(id); this.$set(row, 'assignments', rows); this.change(id, 'role_id', rows[0]?.role_id || null); this.change(id, 'factory_id', rows[0]?.factory_id || null) },
    row(id) { return this.rows.find(row => String(row.company_id) === String(id)) || {} },
    needsWorkshop(id) { return ['laser', 'bend', 'powder_catting'].includes(this.roles.find(role => String(role.id) === String(this.row(id).role_id))?.name) },
    change(id, field, value) { const row = this.row(id); this.$set(row, field, value); if (field === 'role_id') row.factory_id = null; this.$delete(this.errors, id); this.saveError = '' },
    close() { if (!this.busy) this.$emit('close') },
    trapFocus(event) {
      const controls = Array.from(this.$refs.dialog.querySelectorAll('button:not([disabled]), select:not(:disabled), input:not(:disabled)'))
      const first = controls[0], last = controls[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === this.$refs.dialog)) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === this.$refs.dialog)) { event.preventDefault(); first?.focus() }
    },
    async load() {
      const sequence = ++this.sequence; this.loading = true; this.loadError = ''
      try {
        const data = await this.$axios.$get(`/api/company-access/${this.userId}`, { timeout: 15000 })
        if (sequence !== this.sequence) return
        this.companies = data.companies || []; this.roles = data.roles || []; this.currentCompanyId = data.current_company_id
        this.rows = this.companies.map(company => ({ ...company.access })); this.originals = this.rows.map(row => ({ ...row }))
      } catch (_) { if (sequence === this.sequence) this.loadError = this.copy.failed }
      finally { if (sequence === this.sequence) this.loading = false }
    },
    async save() {
      if (this.busy || !this.changes.length) return
      this.errors = {}; this.saveError = ''
      for (const row of this.changes) {
        if (!row.enabled) continue
        if (row.assignments) {
          const issue = assignmentError(row.assignments, this.roles, this.companies.find(company => String(company.id) === String(row.company_id))?.factories || [], assignmentCopy(this.$i18n?.locale))
          if (issue) this.$set(this.errors, row.company_id, issue)
          continue
        }
        if (!this.roles.some(role => String(role.id) === String(row.role_id))) this.$set(this.errors, row.company_id, this.copy.chooseRole)
        else if (this.needsWorkshop(row.company_id) && !this.companies.find(company => String(company.id) === String(row.company_id))?.factories?.some(factory => String(factory.id) === String(row.factory_id))) this.$set(this.errors, row.company_id, this.copy.chooseWorkshop)
      }
      if (Object.keys(this.errors).length) return
      this.busy = true
      try { await this.$axios.$put(`/api/company-access/${this.userId}`, { access: this.changes }, { timeout: 15000 }); this.$emit('saved'); this.$emit('close') }
      catch (error) { this.saveError = Object.values(error.response?.data?.errors || {}).flat()[0] || error.response?.data?.message || this.copy.saveFailed }
      finally { this.busy = false }
    },
  },
}
</script>

<style scoped>
.field-label{@apply mb-2 block text-xs font-semibold text-slate-500}
.field-control{@apply w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900}
</style>
