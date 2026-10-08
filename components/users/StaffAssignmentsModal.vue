<template>
  <div class="fixed inset-0 z-[1100] overflow-y-auto bg-slate-950/50 p-4" @click.self="close" @keydown.esc="close">
    <section ref="dialog" role="dialog" aria-modal="true" aria-labelledby="staff-assignment-title" tabindex="-1" class="mx-auto my-6 w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-8" @keydown.tab="trapFocus">
      <h2 id="staff-assignment-title" class="text-xl font-black">{{ copy.edit }}</h2>
      <p class="mt-3 break-words font-bold">{{ user.name || user.display_name }}</p><p class="mt-1 break-all text-sm text-slate-500">{{ user.email }}</p>
      <p v-if="loading" class="mt-6 text-sm" role="status">{{ copy.loading }}</p>
      <p v-else-if="loadError" class="mt-6 text-sm text-rose-600" role="alert">{{ loadError }} <button type="button" class="font-bold underline" @click="load">{{ copy.retry }}</button></p>
      <form v-else class="mt-6 space-y-4" novalidate @submit.prevent="save">
        <p v-if="readOnly" class="text-sm text-slate-500">{{ copy.protected }}</p>
        <StaffAssignmentsEditor v-model="assignments" :roles="roles" :factories="factories" :role-names="roleNames" :disabled="busy || readOnly" id-prefix="staff" />
        <p v-if="saveError" class="text-sm text-rose-600" role="alert">{{ saveError }}</p>
        <div class="flex flex-wrap justify-end gap-2"><button type="button" class="app-button-secondary" :disabled="busy" @click="close">{{ copy.cancel }}</button><button v-if="!readOnly" type="submit" class="app-button-primary" :disabled="busy">{{ busy ? copy.loading : copy.save }}</button></div>
      </form>
      <button v-if="loading || loadError" type="button" class="app-button-secondary mt-6" @click="close">{{ copy.cancel }}</button>
    </section>
  </div>
</template>
<script>
import StaffAssignmentsEditor from '~/components/users/StaffAssignmentsEditor.vue'
import { assignmentRows, assignmentError, assignmentCopy, staffAccessCopy } from '~/utils/staff-assignments'
import { membershipCopy } from '~/utils/membership-copy'
export default {
  components: { StaffAssignmentsEditor },
  props: { user: { type: Object, required: true } },
  data() { return { assignments: [], roles: [], factories: [], loading: true, loadError: '', saveError: '', busy: false, readOnly: false, sequence: 0, returnFocus: null, previousOverflow: '' } },
  computed: { copy() { return staffAccessCopy(this.$i18n?.locale) }, roleNames() { return membershipCopy(this.$i18n?.locale).roles } },
  mounted() { this.returnFocus = document.activeElement; this.previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; this.$refs.dialog.focus(); this.load() },
  beforeDestroy() { this.sequence++; document.body.style.overflow = this.previousOverflow; this.returnFocus?.focus() },
  methods: {
    close() { if (!this.busy) this.$emit('close') },
    trapFocus(event) {
      const controls = Array.from(this.$refs.dialog.querySelectorAll('button:not(:disabled), select:not(:disabled), input:not(:disabled)'))
      const first = controls[0], last = controls[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === this.$refs.dialog)) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === this.$refs.dialog)) { event.preventDefault(); first?.focus() }
    },
    async load() {
      const sequence = ++this.sequence; this.loading = true; this.loadError = ''
      try {
        const response = await this.$axios.$get(`/api/staff-assignments/${this.user.id}`, { timeout: 15000 })
        if (sequence !== this.sequence) return
        this.roles = response.roles || []; this.factories = response.factories || []; this.readOnly = Boolean(response.read_only)
        this.assignments = assignmentRows(response.assignments)
      } catch (_) { if (sequence === this.sequence) this.loadError = this.copy.failed }
      finally { if (sequence === this.sequence) this.loading = false }
    },
    async save() {
      if (this.busy || this.readOnly) return
      this.saveError = assignmentError(this.assignments, this.roles, this.factories, assignmentCopy(this.$i18n?.locale)) || ''
      if (this.saveError) return
      this.busy = true
      try {
        await this.$axios.$put(`/api/staff-assignments/${this.user.id}`, { assignments: assignmentRows(this.assignments) }, { timeout: 15000 })
        if (String(this.user.id) === String(this.$auth.user?.id)) { await this.$workspace.refreshAssignments(); return }
        this.$emit('saved'); this.$emit('close')
      } catch (error) { this.saveError = Object.values(error.response?.data?.errors || {}).flat()[0] || error.response?.data?.message || this.copy.saveFailed }
      finally { this.busy = false }
    },
  },
}
</script>
