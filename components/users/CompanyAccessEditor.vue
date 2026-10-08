<template>
  <fieldset class="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
    <legend class="px-1 text-sm font-bold">{{ t.access }}</legend>
    <p class="text-xs leading-5 text-slate-500">{{ t.accessHint }}</p>
    <div v-for="company in companies" :key="company.id" class="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <label class="flex items-center gap-3 text-sm font-semibold">
        <input type="checkbox" :checked="row(company.id).enabled" @change="change(company.id, 'enabled', $event.target.checked)" />
        {{ company.name }}
      </label>
      <p v-if="String(company.id) === String(currentCompanyId)" class="mt-1 pl-6 text-xs text-slate-500">{{ t.current }}</p>
      <StaffAssignmentsEditor v-else-if="row(company.id).enabled" class="mt-3" :value="assignmentRows(row(company.id).assignments, row(company.id).role_id, row(company.id).factory_id)" :roles="roles" :factories="company.factories" :role-names="roleNames" @input="setAssignments(company.id, $event)" />
    </div>
  </fieldset>
</template>
<script>
import { workspaceCopy } from '~/utils/company-copy'
import StaffAssignmentsEditor from '~/components/users/StaffAssignmentsEditor.vue'
import { assignmentRows } from '~/utils/staff-assignments'
export default {
  components: { StaffAssignmentsEditor },
  props: {
    value: { type: Array, default: () => [] }, companies: { type: Array, default: () => [] }, roles: { type: Array, default: () => [] },
    currentCompanyId: { type: [Number, String], default: null }, roleNames: { type: Object, default: () => ({}) },
    positionLabel: { type: String, default: '' }, workshopLabel: { type: String, default: '' },
  },
  computed: { t() { return workspaceCopy(this.$i18n?.locale) } },
  methods: {
    assignmentRows,
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
