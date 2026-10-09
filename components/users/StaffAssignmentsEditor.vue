<template>
  <fieldset class="min-w-0 space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700" :disabled="disabled">
    <legend class="px-1 text-sm font-bold">{{ copy.title }}</legend>
    <p class="text-xs leading-5 text-slate-500">{{ copy.hint }}</p>
    <CheckboxSelect :value="roleIds" :options="roleOptions" :label="copy.roles" :placeholder="copy.chooseRole" :disabled="disabled" :id-prefix="prefix + '-roles'" @input="selectRoles" />
    <div v-for="role in operatorRoles" :key="role.id" class="min-w-0 rounded-xl bg-slate-50 p-3 dark:bg-slate-950" :data-workshop-role="role.name">
      <CheckboxSelect :value="workshopIds(role.id)" :options="workshopOptions" :label="copy.workshopsFor + ' ' + roleLabel(role)" :placeholder="copy.chooseWorkshop" :empty-label="copy.noWorkshops" :disabled="disabled" :id-prefix="prefix + '-workshops-' + role.id" @input="selectWorkshops(role.id, $event)" />
      <p class="mt-2 text-xs leading-5 text-slate-500">{{ copy.workshopHint }}</p>
    </div>
    <fieldset v-if="completeRows.length > 1" class="min-w-0 space-y-2 pt-2">
      <legend class="text-xs font-bold text-emerald-700 dark:text-emerald-300">{{ copy.primary }}</legend>
      <label v-for="row in completeRows" :key="row.index" class="flex min-w-0 items-start gap-2 text-sm"><input type="radio" class="mt-1 shrink-0" :name="prefix + '-primary'" :checked="row.index === 0" @change="makePrimary(row.index)" /><span class="min-w-0 break-words">{{ row.label }}</span></label>
    </fieldset>
  </fieldset>
</template>
<script>
import { OPERATOR_ROLES, assignmentCopy, selectedRoleIds, selectAssignmentRoles, selectAssignmentWorkshops } from '~/utils/staff-assignments'
import { membershipCopy } from '~/utils/membership-copy'
import CheckboxSelect from '~/components/ui/CheckboxSelect.vue'
export default {
  components: { CheckboxSelect },
  props: { value: { type: Array, required: true }, roles: { type: Array, default: () => [] }, factories: { type: Array, default: () => [] }, roleNames: { type: Object, default: () => ({}) }, disabled: { type: Boolean, default: false }, idPrefix: { type: String, default: '' } },
  computed: {
    copy() { return assignmentCopy(this.$i18n?.locale) },
    prefix() { return this.idPrefix || 'assignment-' + this._uid },
    roleIds() { return selectedRoleIds(this.value).filter(id => this.roles.some(role => Number(role.id) === id && role.name !== 'authenticatedUser')) },
    roleOptions() { return this.roles.filter(role => role.name !== 'authenticatedUser').map(role => ({ id: role.id, label: this.roleLabel(role) })) },
    operatorRoles() { return this.roles.filter(role => this.roleIds.includes(Number(role.id)) && OPERATOR_ROLES.includes(role.name)) },
    workshopOptions() { return this.factories.map(factory => ({ id: factory.id, label: factory.name })) },
    completeRows() {
      return this.value.map((row, index) => {
        const role = this.roles.find(role => String(role.id) === String(row.role_id))
        const factory = this.factories.find(factory => String(factory.id) === String(row.factory_id))
        if (!role || (OPERATOR_ROLES.includes(role.name) && !factory)) return null
        return { index, label: this.roleLabel(role) + (factory ? ' — ' + factory.name : '') }
      }).filter(Boolean)
    },
  },
  methods: {
    roleLabel(role) { return this.roleNames[role.name] || membershipCopy(this.$i18n?.locale).roles[role.name] || role.value || role.name },
    workshopIds(id) { return this.value.filter(row => String(row.role_id) === String(id)).map(row => Number(row.factory_id)).filter(Boolean) },
    selectRoles(ids) { this.$emit('input', selectAssignmentRoles(this.value, ids)) },
    selectWorkshops(id, ids) { this.$emit('input', selectAssignmentWorkshops(this.value, id, ids)) },
    makePrimary(index) { this.$emit('input', [this.value[index], ...this.value.filter((_, i) => i !== index)].map(row => ({ ...row }))) },
  },
}
</script>
