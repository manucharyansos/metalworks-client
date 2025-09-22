<template>
  <div class="bg-white rounded-xl border shadow-sm">
    <div class="p-4 flex items-center justify-between gap-3">
      <div class="relative w-full max-w-sm">
        <input
          v-model="localQuery"
          type="text"
          placeholder="Որոնել…"
          class="w-full rounded-lg border px-3 py-2 pr-9"
          @input="$emit('update:searchQuery', localQuery)"
        />
        <svg
          class="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
          />
        </svg>
      </div>
      <button
        class="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
        @click="$emit('create')"
      >
        + Ավելացնել
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="text-left font-semibold px-4 py-3">#</th>
            <th class="text-left font-semibold px-4 py-3">Վերնագիր (HY)</th>
            <th class="text-left font-semibold px-4 py-3">Slug (HY)</th>
            <th class="text-left font-semibold px-4 py-3">Մեդիա</th>
            <th class="text-right font-semibold px-4 py-3">Գործողություններ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in services" :key="s.id" class="border-t">
            <td class="px-4 py-3">{{ s.id }}</td>
            <td class="px-4 py-3">
              {{ s.title }}
            </td>
            <td class="px-4 py-3">
              {{ s.slug }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <img
                  v-if="s.image_url"
                  :src="s.image_url"
                  alt=""
                  class="h-10 w-14 object-cover rounded"
                />
                <span v-else class="text-gray-400">—</span>
                <span
                  v-if="s.video_url"
                  class="text-xs text-emerald-600 font-medium"
                  >վիդեո</span
                >
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <button
                  class="px-3 py-1.5 rounded border hover:bg-gray-50"
                  @click="$emit('edit', s)"
                >
                  Խմբագրել
                </button>
                <button
                  class="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
                  @click="$emit('delete', s)"
                >
                  Ջնջել
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!services || !services.length">
            <td colspan="5" class="px-4 py-6 text-center text-gray-500">
              Տվյալներ չկան
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- pagination -->
    <div
      v-if="pagination"
      class="p-4 flex items-center justify-between text-sm"
    >
      <div>Էջ {{ pagination.current_page }} / {{ pagination.last_page }}</div>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 rounded border disabled:opacity-50"
          :disabled="!pagination.prev_page_url"
          @click="$emit('change-page', pagination.current_page - 1)"
        >
          Նախորդ
        </button>
        <button
          class="px-3 py-1.5 rounded border disabled:opacity-50"
          :disabled="!pagination.next_page_url"
          @click="$emit('change-page', pagination.current_page + 1)"
        >
          Հաջորդ
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServiceTable',
  props: {
    services: { type: Array, default: () => [] },
    pagination: { type: Object, default: null },
    searchQuery: { type: String, default: '' },
  },
  data() {
    return { localQuery: this.searchQuery }
  },
  watch: {
    searchQuery(val) {
      this.localQuery = val
    },
  },
}
</script>
