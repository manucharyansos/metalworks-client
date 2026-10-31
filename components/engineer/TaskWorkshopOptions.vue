<template>
  <section v-if="factories.length" class="mt-5 space-y-3" data-workshop-options>
    <h3 class="font-bold">{{ t.workshopSettings }}</h3>
    <div
      v-for="factory in factories"
      :key="factory.id"
      class="rounded-xl border border-slate-200 p-3 dark:border-slate-700 sm:p-4"
      :data-create-workshop="factory.id"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h4 class="min-w-0 flex-1 basis-40 break-words text-sm font-semibold">
          {{ factory.name }}
        </h4>
        <div
          class="priority-group"
          role="radiogroup"
          :aria-label="`${t.priority} · ${factory.name}`"
          data-create-priority
        >
          <button
            v-for="priority in priorities"
            :key="priority"
            type="button"
            role="radio"
            :aria-checked="String(row(factory.id).priority === priority)"
            :disabled="disabled"
            :data-priority="priority"
            class="priority-option"
            :class="
              row(factory.id).priority === priority
                ? `priority-option--${priority}`
                : ''
            "
            @click="set(factory.id, 'priority', priority)"
          >
            {{ t[priority] }}
          </button>
        </div>
      </div>
      <label v-if="!hideDeadline" class="mt-3 block text-sm font-semibold"
        >{{ t.deadline }}
        <input
          :value="row(factory.id).deadline"
          type="date"
          :disabled="disabled"
          data-create-deadline
          class="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:max-w-xs"
          @input="set(factory.id, 'deadline', $event.target.value)"
        />
        <span class="mt-1 block text-xs font-normal text-slate-500">{{
          t.deadlineHelp
        }}</span>
      </label>
      <label class="mt-3 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          :checked="row(factory.id).inherit"
          :disabled="disabled"
          data-inherit-evidence
          class="mt-0.5 h-5 w-5 shrink-0"
          @change="set(factory.id, 'inherit', $event.target.checked)"
        /><span>{{ t.inheritEvidence }}</span>
      </label>
      <TaskCreationOptions
        v-if="!row(factory.id).inherit"
        :confirmation-required="row(factory.id).confirmation_required"
        :confirmation-method="row(factory.id).confirmation_method"
        :disabled="disabled"
        class="!mt-3"
        @update:confirmationRequired="
          set(factory.id, 'confirmation_required', $event)
        "
        @update:confirmationMethod="
          set(factory.id, 'confirmation_method', $event)
        "
      />
    </div>
  </section>
</template>
<script>
import TaskCreationOptions from '@/components/engineer/TaskCreationOptions.vue'
import { taskCopy } from '@/utils/task-workflow'
export default {
  components: { TaskCreationOptions },
  props: {
    hideDeadline: { type: Boolean, default: false },
    factories: { type: Array, default: () => [] },
    value: { type: Object, default: () => ({}) },
    disabled: Boolean,
  },
  data: () => ({ priorities: ['normal', 'high', 'urgent'] }),
  computed: {
    t() {
      return taskCopy[this.$i18n?.locale] || taskCopy.hy
    },
  },
  methods: {
    row(id) {
      return (
        this.value[id] || {
          inherit: true,
          deadline: '',
          priority: 'normal',
          confirmation_required: false,
          confirmation_method: '',
        }
      )
    },
    set(id, field, value) {
      if (this.disabled) return
      this.$emit('input', {
        ...this.value,
        [id]: { ...this.row(id), [field]: value },
      })
    },
  },
}
</script>

<style scoped>
.priority-group {
  @apply inline-flex shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950/40;
}
.priority-option {
  @apply rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800;
}
.priority-option--normal {
  @apply bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white;
}
.priority-option--high {
  @apply bg-amber-500 text-white shadow-sm hover:bg-amber-500;
}
.priority-option--urgent {
  @apply bg-rose-600 text-white shadow-sm hover:bg-rose-600;
}
</style>
