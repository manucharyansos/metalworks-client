<template>
  <label class="block w-full" :for="for_LAbel || label_Id">
    <span
      v-if="label"
      class="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400"
      :class="label_class"
    >
      {{ label }}
    </span>

    <span class="relative block">
      <span
        v-if="$slots.label_svg"
        class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-slate-500"
      >
        <slot name="label_svg"></slot>
      </span>

      <input
        :id="label_Id"
        class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600 dark:focus:border-slate-500 dark:focus:ring-slate-800"
        :class="[$slots.label_svg ? 'pl-11' : '', classes]"
        :type="type"
        :value="value"
        :placeholder="placeholder === ' ' ? '' : placeholder"
        :disabled="disabled"
        @input="$emit('input', $event.target.value)"
      />
    </span>
  </label>
</template>

<script>
export default {
  name: 'InputWithLabelIcon',
  props: {
    label: {
      type: String,
      default: '',
    },
    // eslint-disable-next-line vue/prop-name-casing
    label_Id: {
      type: String,
      default: '',
    },
    // eslint-disable-next-line vue/prop-name-casing
    for_LAbel: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    value: {
      type: [String, Array, Number],
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    classes: {
      type: String,
      default: '',
    },
    // eslint-disable-next-line vue/prop-name-casing
    label_class: {
      type: [String, Object],
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
