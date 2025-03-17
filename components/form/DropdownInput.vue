<template>
  <div class="relative">
    <div
      class="font-medium border-2 border-gray-200 px-3 rounded-lg text-sm text-center inline-flex items-center"
    >
      <input
        :value="modelValue"
        type="text"
        class="border-none outline-0"
        :placeholder="placeholder"
        readonly
        @click="toggleDropdown"
      />
      <button @click="toggleDropdown">
        <svg
          class="w-2.5 h-2.5 ms-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="black"
          viewBox="0 0 10 6"
          width="20"
          height="20"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>
    </div>

    <!-- Dropdown Menu -->
    <div
      v-show="isOpen"
      class="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 absolute mt-1"
    >
      <ul>
        <li
          v-for="(option, index) in options"
          :key="index"
          class="cursor-pointer px-4 py-2 hover:bg-gray-100"
          @click="selectOption(option)"
        >
          {{ option[labelKey] }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DropdownInput',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    labelKey: {
      type: String,
      default: 'label',
    },
    placeholder: {
      type: String,
      default: 'Select an option',
    },
  },
  data() {
    return {
      isOpen: false,
    }
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },
    selectOption(option) {
      this.$emit('update:modelValue', option[this.labelKey])
      this.$emit('select', option)
      this.isOpen = false
    },
  },
}
</script>
