<template>
  <div>
    <label
      :for="for_LAbel"
      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >{{ label }}</label
    >
    <textarea
      :id="textarea_id"
      :rows="rows"
      :value="value"
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      :placeholder="placeholder"
      @input="$emit('input', $event.target.value)"
    ></textarea>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    for_LAbel: {
      type: String,
      default: '',
    },
    textarea_id: {
      type: String,
      default: '',
    },
    rows: {
      type: Number,
      default: 4,
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
}
</script>

<style scoped></style>
