<template>
  <section v-if="factories.length" class="mt-5 space-y-3" data-workshop-options>
    <h3 class="font-bold">{{ t.workshopSettings }}</h3>
    <details
      v-for="factory in factories"
      :key="factory.id"
      class="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
      :data-create-workshop="factory.id"
    >
      <summary class="cursor-pointer font-semibold">{{ factory.name }}</summary>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <label v-if="!hideDeadline" class="text-sm font-semibold"
          >{{ t.deadline }}
          <input
            :value="row(factory.id).deadline"
            type="date"
            :disabled="disabled"
            data-create-deadline
            class="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            @input="set(factory.id, 'deadline', $event.target.value)"
          />
          <span class="mt-1 block text-xs font-normal text-slate-500">{{
            t.deadlineHelp
          }}</span>
        </label>
        <label class="text-sm font-semibold"
          >{{ t.priority }}
          <select
            :value="row(factory.id).priority"
            :disabled="disabled"
            data-create-priority
            class="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            @change="set(factory.id, 'priority', $event.target.value)"
          >
            <option
              v-for="priority in ['normal', 'high', 'urgent']"
              :key="priority"
              :value="priority"
            >
              {{ t[priority] }}
            </option>
          </select>
        </label>
      </div>
      <label class="mt-4 flex items-start gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          :checked="row(factory.id).inherit"
          :disabled="disabled"
          data-inherit-evidence
          class="h-5 w-5 shrink-0"
          @change="set(factory.id, 'inherit', $event.target.checked)"
        />{{ t.inheritEvidence }}
      </label>
      <TaskCreationOptions
        v-if="!row(factory.id).inherit"
        :confirmation-required="row(factory.id).confirmation_required"
        :confirmation-method="row(factory.id).confirmation_method"
        :disabled="disabled"
        @update:confirmationRequired="
          set(factory.id, 'confirmation_required', $event)
        "
        @update:confirmationMethod="
          set(factory.id, 'confirmation_method', $event)
        "
      />
    </details>
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
