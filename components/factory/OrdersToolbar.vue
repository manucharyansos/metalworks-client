<template>
  <div
    class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
  >
    <!-- Search -->
    <div class="w-full md:w-1/3">
      <div class="relative">
        <input
          v-model="localSearch"
          type="text"
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder="Որոնել ըստ համարի, անունի կամ կոդի..."
          @input="$emit('update:search', localSearch)"
        />
        <span
          class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </span>
      </div>
    </div>

    <!-- Status filters -->
    <div class="flex flex-wrap items-center gap-2">
      <span
        class="mr-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >
        Կարգավիճակներ
      </span>

      <button
        v-for="(opt, index) in statusOptions"
        :key="index"
        type="button"
        class="rounded-full px-3 py-1 text-xs font-medium transition-all"
        :class="
          isActive(opt)
            ? 'bg-indigo-600 text-white shadow-md'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
        "
        @click="toggleStatus(opt)"
      >
        {{ opt.label }}
      </button>

      <button
        v-if="selectedStatuses.length"
        type="button"
        class="rounded-full bg-transparent px-2 py-1 text-xs font-medium text-gray-500 underline underline-offset-2 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
        @click="clearFilters"
      >
        Մաքրել
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrdersToolbar',
  props: {
    search: {
      type: String,
      default: '',
    },
    statusOptions: {
      type: Array,
      default: () => [],
    },
    selectedStatuses: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      localSearch: this.search,
    }
  },
  watch: {
    search(val) {
      this.localSearch = val
    },
  },
  methods: {
    isActive(opt) {
      return this.selectedStatuses.includes(opt.value)
    },
    toggleStatus(opt) {
      const value = opt.value
      const exists = this.selectedStatuses.includes(value)

      const updated = exists
        ? this.selectedStatuses.filter((v) => v !== value)
        : [...this.selectedStatuses, value]

      this.$emit('update:selected-statuses', updated)
    },
    clearFilters() {
      this.$emit('update:selected-statuses', [])
    },
  },
}
</script>
