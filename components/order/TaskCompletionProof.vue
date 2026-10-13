<template>
  <div
    class="mt-3 space-y-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
    data-task-proof
  >
    <p class="font-semibold">
      {{
        step.confirmation_required
          ? `${t.method}: ${t[step.confirmation_method] || '—'}`
          : t.optional
      }}
    </p>
    <template
      v-if="
        step.confirmation_required ||
        step.evidence_text ||
        step.has_evidence_photo
      "
    >
      <p
        v-if="step.confirmation_required"
        :class="
          step.awaiting_engineer_confirmation
            ? 'text-amber-700 dark:text-amber-300'
            : 'text-slate-500'
        "
      >
        {{
          step.engineer_confirmation_at
            ? t.approved
            : step.awaiting_engineer_confirmation
            ? t.waiting
            : t.notSubmitted
        }}
      </p>
      <p
        v-if="step.return_note && !step.awaiting_engineer_confirmation"
        class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-200"
        data-return-note
      >
        <span class="block text-xs font-semibold">{{ t.returnedNote }}</span>
        <span class="whitespace-pre-wrap break-words">{{
          step.return_note
        }}</span>
      </p>
      <p
        v-if="step.evidence_text"
        class="whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
      >
        {{ step.evidence_text }}
      </p>
      <a
        v-if="step.has_evidence_photo"
        :href="$getTaskEvidenceUrl(step.id)"
        target="_blank"
        rel="noopener"
      >
        <img
          :src="$getTaskEvidenceUrl(step.id)"
          :alt="t.evidence"
          class="mt-2 max-h-64 w-full rounded-lg object-contain"
        />
      </a>
      <button
        v-if="canConfirm"
        type="button"
        data-engineer-confirm
        :disabled="saving"
        class="w-full rounded-xl bg-emerald-600 p-3 font-bold text-white disabled:opacity-50"
        @click="confirm"
      >
        {{ saving ? t.confirming : t.confirm }}
      </button>
      <div v-if="canConfirm" class="space-y-2">
        <button
          v-if="!returning"
          type="button"
          data-engineer-return-open
          :disabled="saving"
          class="w-full rounded-xl border border-slate-300 p-3 font-bold text-slate-800 disabled:opacity-50 dark:border-slate-600 dark:text-slate-100"
          @click="returning = true"
        >
          {{ t.returnTitle }}
        </button>
        <form v-else class="space-y-2" @submit.prevent="sendBack">
          <label class="block text-xs font-semibold">
            {{ t.returnNote }}
            <textarea
              v-model="returnNote"
              data-engineer-return-note
              rows="3"
              maxlength="1000"
              :disabled="saving"
              class="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="submit"
              data-engineer-return
              :disabled="saving || !returnNote.trim()"
              class="rounded-xl bg-rose-600 p-3 font-bold text-white disabled:opacity-50"
            >
              {{ t.returnSend }}
            </button>
            <button
              type="button"
              :disabled="saving"
              class="rounded-xl border border-slate-300 p-3 font-bold text-slate-800 disabled:opacity-50 dark:border-slate-600 dark:text-slate-100"
              @click="returning = false"
            >
              {{ t.back }}
            </button>
          </div>
        </form>
      </div>
      <p v-if="error" role="alert" class="break-words text-red-600">
        {{ error }}
      </p>
    </template>
  </div>
</template>
<script>
import { apiErrorMessage, taskCopy } from '@/utils/task-workflow'
export default {
  props: {
    step: { type: Object, required: true },
    creatorId: { type: [Number, String], default: null },
  },
  data: () => ({ saving: false, error: '', returning: false, returnNote: '' }),
  computed: {
    t() {
      return taskCopy[this.$i18n?.locale] || taskCopy.hy
    },
    canConfirm() {
      return (
        this.step.awaiting_engineer_confirmation &&
        this.$auth?.user?.role?.name === 'engineer' &&
        String(this.creatorId) === String(this.$auth.user.id)
      )
    },
  },
  methods: {
    async confirm() {
      if (!this.canConfirm || this.saving) return
      this.saving = true
      this.error = ''
      try {
        const { data } = await this.$axios.post(
          `/api/engineers/factory-orders/${this.step.id}/confirm`
        )
        this.$emit('updated', data.order)
        this.$notify?.({ type: 'success', text: this.t.confirmed })
      } catch (error) {
        this.error = apiErrorMessage(error)
      } finally {
        this.saving = false
      }
    },
    // The engineer is not satisfied: the job goes back to the operator with a note.
    async sendBack() {
      const note = this.returnNote.trim()
      if (!this.canConfirm || this.saving || !note) return
      this.saving = true
      this.error = ''
      try {
        const { data } = await this.$axios.post(
          `/api/engineers/factory-orders/${this.step.id}/return`,
          { note }
        )
        this.returning = false
        this.returnNote = ''
        this.$emit('updated', data.order)
        this.$notify?.({ type: 'success', text: this.t.returnedToast })
      } catch (error) {
        this.error = apiErrorMessage(error)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
