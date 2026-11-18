<template>
  <div
    class="mt-3 rounded-xl bg-violet-50 p-3 dark:bg-violet-950/30"
    :data-task-paint="step.id"
  >
    <p class="text-sm">
      <span class="font-semibold">{{ copy.title }}:</span>
      <span data-task-paint-current>
        {{ step.paint_ral || '—' }} ·
        {{ step.primer_required ? copy.primer : copy.noPrimer }}</span
      >
    </p>
    <form
      v-if="canManage"
      class="mt-3 flex flex-wrap items-end gap-3"
      @submit.prevent="save"
    >
      <label class="block text-sm font-semibold"
        >{{ copy.colour }}
        <input
          v-model="ral"
          type="text"
          maxlength="40"
          autocomplete="off"
          :placeholder="copy.placeholder"
          :disabled="disabled || saving"
          data-task-paint-ral
          class="mt-2 block w-48 rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>
      <label class="flex items-center gap-2 pb-2.5 text-sm">
        <input
          v-model="primer"
          type="checkbox"
          :disabled="disabled || saving"
          data-task-paint-primer
          class="h-5 w-5 shrink-0"
        /><span>{{ copy.primer }}</span>
      </label>
      <button
        type="submit"
        :disabled="!dirty || disabled || saving"
        data-task-paint-save
        class="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
      >
        {{ copy.save }}
      </button>
    </form>
    <p v-if="error" role="alert" class="mt-2 break-words text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script>
import { canManageTask } from '@/utils/task-routing'
import { apiErrorMessage } from '@/utils/task-workflow'
import { paintCopy } from '@/utils/task-paint'

export default {
  props: {
    order: { type: Object, required: true },
    step: { type: Object, required: true },
    disabled: Boolean,
  },
  data: () => ({ ral: '', primer: false, saving: false, error: '' }),
  computed: {
    copy() {
      return paintCopy(this.$i18n?.locale)
    },
    canManage() {
      return (
        !['canceled', 'cancelled'].includes(this.order.status) &&
        !['canceled', 'cancelled'].includes(this.step.status) &&
        !this.step.completed_at &&
        !this.step.engineer_confirmation_at &&
        canManageTask(this.$auth?.user, this.order, this.$can('orders.update'))
      )
    },
    dirty() {
      return (
        this.ral.trim() !== (this.step.paint_ral || '') ||
        this.primer !== Boolean(this.step.primer_required)
      )
    },
  },
  watch: {
    step: { immediate: true, handler: 'reset' },
  },
  methods: {
    reset() {
      this.ral = this.step.paint_ral || ''
      this.primer = Boolean(this.step.primer_required)
      this.error = ''
    },
    async save() {
      if (!this.dirty || this.saving) return
      this.saving = true
      this.error = ''
      try {
        const { data } = await this.$axios.put(
          `/api/tasks/${this.order.id}/workshops/${this.step.id}/paint`,
          { paint_ral: this.ral.trim() || null, primer_required: this.primer }
        )
        this.$emit('updated', data.order)
        this.$notify?.({ type: 'success', text: this.copy.saved })
      } catch (error) {
        this.error = apiErrorMessage(error, this.copy.failed)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
