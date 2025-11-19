<template>
  <div
    class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-5"
  >
    <!-- Ձախ՝ վերնագիր + ինֆո -->
    <div class="space-y-1">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        Պատվերներ
      </h1>
      <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        Ընդհանուր պատվերներ՝
        <span class="font-semibold text-gray-800 dark:text-gray-100">
          {{ total }}
        </span>
        <span v-if="searchTerm"> | Ֆիլտրացված՝ {{ filtered }} </span>
      </p>
    </div>

    <!-- Աջ՝ փնտրում + էջավորում -->
    <div
      class="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto"
    >
      <!-- Փնտրում -->
      <div class="relative flex-1 min-w-[180px]">
        <input
          :value="searchTerm"
          @input="$emit('update:search', $event.target.value)"
          type="text"
          class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 pl-9 text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          placeholder="Փնտրել ըստ համարի, անվան, prefix code..."
        />
        <span
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm"
        >
          🔍
        </span>
      </div>

      <!-- Էջավորում -->
      <div
        v-if="pagination && pagination.last_page > 1"
        class="flex items-center justify-end"
      >
        <Pagination
          :meta="pagination"
          @change="(page) => $emit('change-page', page)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '~/components/ui/Pagination.vue'

export default {
  name: 'OrdersToolbar',
  components: { Pagination },
  props: {
    total: {
      type: Number,
      default: 0,
    },
    filtered: {
      type: Number,
      default: 0,
    },
    searchTerm: {
      type: String,
      default: '',
    },
    pagination: {
      type: Object,
      default: null,
    },
  },
}
</script>
