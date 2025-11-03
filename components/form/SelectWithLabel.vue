<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="name"
      class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
    >
      {{ label }}
    </label>

    <!-- Select -->
    <div class="relative">
      <select
        :id="name"
        v-model="selectValue"
        :name="name"
        class="appearance-none w-full px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-blue-500 transition-all duration-200 ease-in-out hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
        v-bind="$attrs"
        :disabled="dataValue.length === 0"
      >
        <option value="" disabled selected hidden>
          {{ placeholder || 'Ընտրեք տարբերակը' }}
        </option>
        <option
          v-for="(item, index) in dataValue"
          :key="index"
          :value="item"
          class="text-sm"
        >
          {{ displayField === 'value' ? item.value : item.name }}
        </option>
      </select>

      <!-- Custom Arrow Icon -->
      <div
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <!--        <svg-->
        <!--          class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200"-->
        <!--          :class="{ 'rotate-180': isOpen }"-->
        <!--          fill="none"-->
        <!--          stroke="currentColor"-->
        <!--          viewBox="0 0 24 24"-->
        <!--        >-->
        <!--          <path-->
        <!--            stroke-linecap="round"-->
        <!--            stroke-linejoin="round"-->
        <!--            stroke-width="2"-->
        <!--            d="M19 9l-7 7-7-7"-->
        <!--          />-->
        <!--        </svg>-->
      </div>
    </div>

    <!-- Empty State Message -->
    <p
      v-if="!dataValue || dataValue.length === 0"
      class="mt-2 text-xs text-red-600 dark:text-red-400 animate-fade-in"
    >
      Տվյալներ չկան։
    </p>

    <!-- Optional Helper Text -->
    <p
      v-if="$slots.helper"
      class="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
    >
      <slot name="helper" />
    </p>
  </div>
</template>

<script>
export default {
  props: {
    displayField: {
      type: String,
      default: 'name',
    },
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
    dataValue: {
      type: [Array, Object],
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      selectValue: this.value,
      isOpen: false,
    }
  },
  watch: {
    value(newVal) {
      this.selectValue = newVal
    },
    selectValue(newVal) {
      this.$emit('input', newVal)
      this.$emit('change', newVal)
    },
  },
  mounted() {
    // Detect open/close for arrow animation (optional enhancement)
    const select = this.$el.querySelector('select')
    if (select) {
      // eslint-disable-next-line no-return-assign
      select.addEventListener('focus', () => (this.isOpen = true))
      // eslint-disable-next-line no-return-assign
      select.addEventListener('blur', () => (this.isOpen = false))
    }
  },
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

select::-ms-expand {
  display: none;
}
</style>
