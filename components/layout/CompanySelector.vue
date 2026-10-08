<template>
  <div v-if="companies.length > 1 || assignments.length > 1 || $auth.user && $auth.user.is_platform_admin" class="space-y-3 border-b border-slate-100 px-5 py-3 dark:border-slate-800" data-workspace-control>
    <label v-if="companies.length > 1" class="block">
      <span class="mb-1 block text-xs font-medium text-slate-500">{{ t.select }}</span>
      <select data-company-select :value="companyId" :disabled="switching" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white" @change="select">
        <option v-for="company in companies" :key="company.id" :value="company.id">{{ company.name }}</option>
      </select>
    </label>
    <label v-if="assignments.length > 1" class="block">
      <span class="mb-1 block text-xs font-medium text-slate-500">{{ assignmentText.select }}</span>
      <select data-assignment-select :value="assignmentId" :disabled="switching" class="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white" @change="selectAssignment"><option v-for="assignment in assignments" :key="assignment.id" :value="assignment.id">{{ assignmentLabel(assignment) }}</option></select>
    </label>
    <nuxt-link v-if="$auth.user && $auth.user.is_platform_admin" :to="localePath('/admin/companies')" class="mt-2 block text-xs font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-300">{{ t.companies }} →</nuxt-link>
  </div>
</template>
<script>
import { workspaceCopy } from '~/utils/company-copy'
import { assignmentCopy } from '~/utils/staff-assignments'
import { membershipCopy } from '~/utils/membership-copy'
export default {
  computed: {
    t() { return workspaceCopy(this.$i18n?.locale) },
    companies() { return this.$store.state.workspace?.companies || [] },
    companyId() { return this.$store.state.workspace?.company?.id || '' },
    assignments() { return this.$store.state.workspace?.assignments || [] },
    assignmentId() { return this.$store.state.workspace?.assignmentId || '' },
    assignmentText() { return assignmentCopy(this.$i18n?.locale) },
    switching() { return this.$store.state.workspace?.switching || false },
  },
  methods: {
    assignmentLabel(row) { return [membershipCopy(this.$i18n?.locale).roles[row.role?.name] || row.role?.value || row.role?.name, row.factory?.name].filter(Boolean).join(' · ') },
    async selectAssignment(event) { await this.$workspace.switchAssignment(event.target.value); event.target.value = this.assignmentId },
    async select(event) {
      await this.$workspace.switchCompany(event.target.value)
      event.target.value = this.companyId
    },
  },
}
</script>
