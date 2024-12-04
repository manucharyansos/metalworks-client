<template>
  <div class="relative">
    <span class="absolute start-0 bottom-3 text-gray-500 dark:text-gray-400">
      <slot name="label_svg"></slot>
    </span>
    <input
      :id="id"
      :type="type"
      class="block py-2.5 ps-8 pe-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      :class="classes"
      :value="value"
      :disabled="disabled"
      @input="$emit('input', $event.target.value)"
    />
    <label
      :for="id"
      class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform scale-75 top-3 left-6 origin-[0] peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-focus:scale-75 peer-focus:-translate-y-6"
    >
      {{ label }}
    </label>
    <span class="absolute end-2 bottom-4 text-gray-500 dark:text-gray-400">
      <slot name="label_back"></slot>
    </span>
  </div>
</template>

<script>
export default {
  name: 'InputWithLabels',
  props: {
    id: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    value: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    classes: {
      type: String,
      default: '',
    },
  },
}
</script>
