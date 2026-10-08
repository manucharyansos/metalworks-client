<template>
  <fieldset class="min-w-0 space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700" :disabled="disabled">
    <legend class="px-1 text-sm font-bold">{{ copy.title }}</legend>
    <p class="text-xs leading-5 text-slate-500">{{ copy.hint }}</p>
    <div v-for="(row, index) in value" :key="index" class="min-w-0 rounded-xl bg-slate-50 p-3 dark:bg-slate-950" :data-assignment-row="index">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span v-if="index === 0" class="font-bold text-emerald-700 dark:text-emerald-300">{{ copy.primary }}</span>
        <button v-else type="button" class="font-semibold underline" @click="makePrimary(index)">{{ copy.makePrimary }}</button>
        <button v-if="value.length > 1" type="button" class="font-semibold text-rose-600" @click="remove(index)">{{ copy.remove }}</button>
      </div>
      <div class="grid min-w-0 gap-3 sm:grid-cols-2">
        <div><label :for="fieldId('role', index)" class="mb-2 block text-xs font-semibold">{{ copy.role }}</label><select :id="fieldId('role', index)" :value="row.role_id || ''" class="field" @change="change(index, 'role_id', Number($event.target.value) || '')"><option value="">{{ copy.chooseRole }}</option><option v-for="role in roles" :key="role.id" :value="role.id">{{ roleLabel(role) }}</option></select></div>
        <div v-if="needsWorkshop(row)"><label :for="fieldId('factory', index)" class="mb-2 block text-xs font-semibold">{{ copy.workshop }}</label><select :id="fieldId('factory', index)" :value="row.factory_id || ''" class="field" @change="change(index, 'factory_id', Number($event.target.value) || null)"><option value="">{{ copy.chooseWorkshop }}</option><option v-for="factory in factories" :key="factory.id" :value="factory.id">{{ factory.name }}</option></select></div>
      </div>
    </div>
    <button v-if="value.length < 50" type="button" class="app-button-secondary" @click="add">+ {{ copy.add }}</button>
  </fieldset>
</template>
<script>
import { OPERATOR_ROLES, assignmentCopy } from '~/utils/staff-assignments'
import { membershipCopy } from '~/utils/membership-copy'
export default {
  props: { value: { type: Array, required: true }, roles: { type: Array, default: () => [] }, factories: { type: Array, default: () => [] }, roleNames: { type: Object, default: () => ({}) }, disabled: { type: Boolean, default: false }, idPrefix: { type: String, default: '' } },
  computed: { copy() { return assignmentCopy(this.$i18n?.locale) } },
  methods: {
    roleLabel(role) { return this.roleNames[role.name] || membershipCopy(this.$i18n?.locale).roles[role.name] || role.value || role.name },
    fieldId(kind, index) { return `${this.idPrefix || 'assignment-' + this._uid}-${kind}${index ? '-' + index : ''}` },
    needsWorkshop(row) { return OPERATOR_ROLES.includes(this.roles.find(role => String(role.id) === String(row.role_id))?.name) },
    change(index, field, value) { this.$emit('input', this.value.map((row, i) => i === index ? { ...row, [field]: value, ...(field === 'role_id' ? { factory_id: null } : {}) } : { ...row })) },
    add() { this.$emit('input', [...this.value.map(row => ({ ...row })), { role_id: '', factory_id: null }]) },
    remove(index) { this.$emit('input', this.value.filter((_, i) => i !== index).map(row => ({ ...row }))) },
    makePrimary(index) { this.$emit('input', [this.value[index], ...this.value.filter((_, i) => i !== index)].map(row => ({ ...row }))) },
  },
}
</script>
<style scoped>
.field{@apply w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900}
</style>
