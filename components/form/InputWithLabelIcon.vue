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
        :class="[$slots.label_svg ? 'pl-11' : '', type === 'password' ? 'pr-11' : '', classes]"
        :type="type === 'password' && passwordVisible ? 'text' : type"
        :value="value"
        :placeholder="placeholder === ' ' ? '' : placeholder"
        :disabled="disabled"
        @input="$emit('input', $event.target.value)"
      />

      <button
        v-if="type === 'password'"
        type="button"
        class="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-700 focus:outline-none dark:text-slate-500 dark:hover:text-slate-200"
        :aria-label="passwordVisible ? 'Թաքցնել գաղտնաբառը' : 'Ցույց տալ գաղտնաբառը'"
        :title="passwordVisible ? 'Թաքցնել գաղտնաբառը' : 'Ցույց տալ գաղտնաբառը'"
        @click="passwordVisible = !passwordVisible"
      >
        <svg v-if="!passwordVisible" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.75" stroke-width="1.8" />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m3 3 18 18M10.6 6.2A10.5 10.5 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-2.6 3.3M14.1 14.1a3 3 0 0 1-4.2-4.2M6.2 6.2C3.8 7.7 2.5 12 2.5 12s3.5 6 9.5 6c1.5 0 2.8-.4 4-1" />
        </svg>
      </button>
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
  data() {
    return {
      passwordVisible: false,
    }
  },
}
</script>
