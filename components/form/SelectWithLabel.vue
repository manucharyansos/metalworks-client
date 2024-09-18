<template>
  <div>
    <label
      for="countries"
      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >{{ label }}</label
    >
    <select
      v-model="selectValue"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      aria-label="Select client"
      v-bind="$attrs"
    >
      <option v-for="data in dates" :key="data.id" :value="data">
        {{ data.name }}
      </option>
    </select>
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
      type: Number,
      default: null,
    },
    name: {
      type: String,
      default: '',
    },
    dates: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      selectValue: this.value,
    }
  },
  watch: {
    selectValue(value) {
      this.$emit('input', value)
    },
  },
}
</script>

<style scoped></style>
