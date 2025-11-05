<template>
  <div
    class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden relative"
  >
    <!-- Loading bar -->
    <div
      v-if="loading"
      class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse"
    ></div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              Խումբ
            </th>
            <th
              scope="col"
              class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              Անուն
            </th>
            <th
              scope="col"
              class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              Slug
            </th>
            <th
              scope="col"
              class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              Գործողություններ
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-if="!permissions.length && !loading">
            <td
              colspan="4"
              class="px-4 sm:px-6 py-6 text-center text-gray-400 text-sm"
            >
              Դուք դեռ չունեք permissions կամ որոնմանը համապատասխանող արդյունք
              չկա։
            </td>
          </tr>

          <tr
            v-for="permission in permissions"
            :key="permission.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 sm:px-6 py-3 whitespace-nowrap">
              <span
                v-if="permission.group"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700"
              >
                {{ permission.group }}
              </span>
              <span
                v-else
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-500"
              >
                general
              </span>
            </td>
            <td class="px-4 sm:px-6 py-3 whitespace-normal">
              <div class="font-medium text-gray-900">
                {{ permission.name }}
              </div>
              <div class="text-xs text-gray-400">ID: {{ permission.id }}</div>
            </td>
            <td class="px-4 sm:px-6 py-3 whitespace-nowrap">
              <code class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {{ permission.slug }}
              </code>
            </td>
            <td class="px-4 sm:px-6 py-3 whitespace-nowrap text-right text-sm">
              <div class="inline-flex items-center gap-2">
                <button
                  type="button"
                  class="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                  @click="$emit('edit', permission)"
                >
                  Խմբագրել
                </button>
                <button
                  type="button"
                  class="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-100 text-red-600 bg-red-50 hover:bg-red-100"
                  @click="$emit('delete', permission)"
                >
                  Ջնջել
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="meta && meta.last_page && meta.last_page > 1"
      class="px-4 sm:px-6 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-gray-500"
    >
      <div>
        Ցուցադրված է
        <span class="font-semibold text-gray-700">{{ meta.from || 0 }}</span>
        -
        <span class="font-semibold text-gray-700">{{ meta.to || 0 }}</span>
        / {{ meta.total || 0 }}
      </div>

      <div class="flex flex-wrap items-center gap-1">
        <button
          v-for="page in pages"
          :key="page"
          type="button"
          class="px-2.5 py-1.5 rounded-lg border text-xs font-medium"
          :class="
            page === meta.current_page
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          "
          @click="$emit('page-change', page)"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    permissions: {
      type: Array,
      default: () => [],
    },
    meta: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    pages() {
      if (!this.meta || !this.meta.last_page) return []
      const pages = []
      for (let i = 1; i <= this.meta.last_page; i++) {
        pages.push(i)
      }
      return pages
    },
  },
}
</script>
