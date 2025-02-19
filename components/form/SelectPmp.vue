<template>
  <div>
    <label
      v-if="label"
      :for="name"
      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
    >
      {{ label }}
    </label>
    <select
      :id="name"
      v-model="selectValue"
      :name="name"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      v-bind="$attrs"
    >
      <option v-for="(data, index) in dates" :key="index" :value="data">
        {{ data.group || data || 'N/A' }}
      </option>
    </select>
    <p v-if="!dates || dates.length === 0" class="mt-2 text-sm text-red-500">
      Տվյալներ չկան։
    </p>
  </div>
</template>

<script>
export default {
  name: 'SelectPmp',
  props: {
    label: {
      type: String,
      default: '',
    },
    value: {
      type: [Number, Object, String],
      default: null,
    },
    name: {
      type: String,
      default: '',
    },
    dates: {
      type: [Array, Object],
      default: () => [],
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
