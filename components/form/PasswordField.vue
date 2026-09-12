<template>
  <span class="relative block w-full">
    <input
      v-bind="$attrs"
      data-password-visibility-managed="true"
      :type="visible ? 'text' : 'password'"
      :value="value"
      :class="['pr-11', inputClass]"
      @input="$emit('input', $event.target.value)"
    />
    <button
      type="button"
      class="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-700 focus:outline-none dark:text-slate-500 dark:hover:text-slate-200"
      :aria-label="visible ? 'Թաքցնել գաղտնաբառը' : 'Ցույց տալ գաղտնաբառը'"
      :title="visible ? 'Թաքցնել գաղտնաբառը' : 'Ցույց տալ գաղտնաբառը'"
      @click="visible = !visible"
    >
      <svg v-if="!visible" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.75" stroke-width="1.8" />
      </svg>
      <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m3 3 18 18M10.6 6.2A10.5 10.5 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-2.6 3.3M14.1 14.1a3 3 0 0 1-4.2-4.2M6.2 6.2C3.8 7.7 2.5 12 2.5 12s3.5 6 9.5 6c1.5 0 2.8-.4 4-1" />
      </svg>
    </button>
  </span>
</template>

<script>
export default {
  name: 'PasswordField',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number],
      default: '',
    },
    inputClass: {
      type: [String, Array, Object],
      default: '',
    },
  },
  data() {
    return { visible: false }
  },
}
</script>
