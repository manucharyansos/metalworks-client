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
    <template v-if="step.confirmation_required">
      <p
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
      <p v-if="error" role="alert" class="break-words text-red-600">
        {{ error }}
      </p>
    </template>
  </div>
</template>
<script>
import { taskCopy } from '@/utils/task-workflow'
export default {
  props: {
    step: { type: Object, required: true },
    creatorId: { type: [Number, String], default: null },
  },
  data: () => ({ saving: false, error: '' }),
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
        this.error =
          Object.values(error.response?.data?.errors || {}).flat()[0] ||
          error.response?.data?.message ||
          error.message
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
