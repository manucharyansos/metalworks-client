<template>
  <div class="relative">
    <span class="absolute start-0 bottom-3 text-gray-500 dark:text-gray-400">
      <slot name="label_svg"></slot>
    </span>
    <input
      :id="label_Id"
      class="block py-2.5 ps-6 pe-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      :type="type"
      :class="classes"
      :value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="$emit('input', $event.target.value)"
    />
    <label
      :for="for_LAbel"
      :class="label_class"
      class="absolute text-sm dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-1 -z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
    >
      {{ label }}
    </label>
  </div>
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

<style scoped></style>
