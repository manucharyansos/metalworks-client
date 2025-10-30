<template>
  <div class="flex items-center justify-between flex-wrap gap-3">
    <!-- Category picker (optional) -->
    <div class="relative" v-if="categories && categories.length">
      <button
        class="inline-flex items-center text-gray-700 bg-white border border-gray-300 rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-200"
        @click="open = !open"
      >
        {{ selectedCategory?.name || 'Բոլորը' }}
        <svg class="w-3 h-3 ml-2" viewBox="0 0 10 6">
          <path stroke="currentColor" stroke-width="2" d="m1 1 4 4 4-4" />
        </svg>
      </button>
      <div
        v-if="open"
        class="absolute z-10 mt-2 bg-white dark:bg-gray-700 rounded-lg shadow w-56 max-h-72 overflow-y-auto"
      >
        <div class="p-2 text-xs font-semibold text-gray-500 dark:text-gray-300">
          Կատեգորիաներ
        </div>
        <ul class="py-1 text-sm">
          <li
            class="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
            @click="pick(null)"
          >
            Բոլորը
          </li>
          <li
            v-for="c in categories"
            :key="c.id"
            class="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
            @click="pick(c)"
          >
            {{ c.name }}
          </li>
        </ul>
      </div>
    </div>

    <div class="flex-1 min-w-[260px]">
      <input
        :value="search"
        class="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-gray-100"
        placeholder="Որոնել նկարագրությամբ/չափերով…"
        @input="$emit('update:search', $event.target.value)"
      />
    </div>

    <div>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        @click="$emit('create')"
      >
        Նոր նյութ
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    categories: { type: Array, default: () => [] },
    selectedCategory: { type: Object, default: null },
    search: { type: String, default: '' },
  },
  data: () => ({ open: false }),
  methods: {
    pick(c) {
      this.$emit('pick-category', c)
      this.open = false
    },
  },
}
</script>
