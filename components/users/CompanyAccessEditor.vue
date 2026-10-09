<template>
  <fieldset class="min-w-0 space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700" :disabled="disabled">
    <legend class="px-1 text-sm font-bold">{{ t.access }}</legend>
    <p class="text-xs leading-5 text-slate-500">{{ t.accessHint }}</p>
    <CheckboxSelect :value="selectedCompanyIds" :options="companyOptions" :label="t.access" :placeholder="t.access" :disabled="disabled" @input="selectCompanies" />
    <div v-for="company in selectedCompanies" :key="company.id" class="min-w-0 rounded-xl bg-slate-50 p-3 dark:bg-slate-950" :data-company-id="company.id">
      <h3 class="break-words text-sm font-semibold">{{ company.name }}</h3>
      <p v-if="String(company.id) === String(currentCompanyId)" class="mt-1 pl-6 text-xs text-slate-500">{{ t.current }}</p>
      <p v-else-if="row(company.id).read_only" class="mt-2 text-xs text-slate-500">{{ copy.protected }}</p>
      <StaffAssignmentsEditor v-else-if="row(company.id).enabled" class="mt-3" :value="assignmentRows(row(company.id).assignments, row(company.id).role_id, row(company.id).factory_id)" :roles="roles" :factories="company.factories" :role-names="roleNames" :disabled="disabled" :id-prefix="'worker-company-' + company.id" @input="setAssignments(company.id, $event)" />
    </div>
  </fieldset>
</template>
<script>
import { workspaceCopy } from '~/utils/company-copy'
import StaffAssignmentsEditor from '~/components/users/StaffAssignmentsEditor.vue'
import { assignmentRows, newCompanyAssignments } from '~/utils/staff-assignments'
import { membershipCopy } from '~/utils/membership-copy'
import CheckboxSelect from '~/components/ui/CheckboxSelect.vue'
export default {
  components: { StaffAssignmentsEditor, CheckboxSelect },
  props: {
    value: { type: Array, default: () => [] }, companies: { type: Array, default: () => [] }, roles: { type: Array, default: () => [] },
    currentCompanyId: { type: [Number, String], default: null }, roleNames: { type: Object, default: () => ({}) },
    positionLabel: { type: String, default: '' }, workshopLabel: { type: String, default: '' },
    defaultAssignments: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
  },
  computed: {
    t() { return workspaceCopy(this.$i18n?.locale) },
    copy() { return membershipCopy(this.$i18n?.locale) },
    selectedCompanyIds() { return this.value.filter(row => row.enabled).map(row => row.company_id) },
    selectedCompanies() { return this.companies.filter(company => this.row(company.id).enabled) },
    companyOptions() { return this.companies.map(company => ({ id: company.id, label: company.name, disabled: Boolean(this.row(company.id).read_only) || String(company.id) === String(this.currentCompanyId), note: this.row(company.id).read_only ? this.copy.protected : String(company.id) === String(this.currentCompanyId) ? this.t.current : '' })) },
  },
  methods: {
    assignmentRows,
    selectCompanies(ids) {
      this.$emit('input', this.value.map(row => {
        if (row.read_only) return { ...row }
        const enabled = String(row.company_id) === String(this.currentCompanyId) || ids.some(id => String(id) === String(row.company_id))
        const assignments = enabled && !row.role_id ? newCompanyAssignments(this.defaultAssignments, this.roles) : null
        return { ...row, enabled, ...(assignments?.length ? { assignments, ...assignments[0] } : {}) }
      }))
    },
    setAssignments(id, assignments) { this.$emit('input', this.value.map(row => String(row.company_id) === String(id) ? { ...row, assignments, role_id: assignments[0]?.role_id || null, factory_id: assignments[0]?.factory_id || null } : { ...row })) },
    row(id) { return this.value.find((item) => String(item.company_id) === String(id)) || {} },
    needsWorkshop(id) { return ['laser', 'bend', 'powder_catting'].includes(this.roles.find((r) => String(r.id) === String(this.row(id).role_id))?.name) },
    change(id, field, value) {
      const rows = this.value.map((row) => String(row.company_id) === String(id) ? { ...row, [field]: value, ...(field === 'role_id' ? { factory_id: null } : {}) } : { ...row })
      this.$emit('input', rows)
    },
  },
}
</script>
