<template>
  <div class="bg-white rounded-xl shadow-xl overflow-hidden">
    <!-- top bar -->
    <div
      class="flex flex-col sm:flex-row items-center justify-between p-4 gap-3 bg-gray-50"
    >
      <div class="w-full sm:w-auto">
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text"
          placeholder="Որոնել ըստ վերնագրի/նկարագրության…"
          class="w-full sm:w-72 rounded-lg border px-3 py-2"
        />
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
        @click="$emit('create')"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14m-7-7h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        Նոր աշխատանք
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left">
        <thead class="text-xs uppercase bg-gray-100">
          <tr>
            <th class="px-4 py-3">Կவர்</th>
            <th class="px-4 py-3">Վերնագիր</th>
            <th class="px-4 py-3">Slug</th>
            <th class="px-4 py-3">Tags</th>
            <th class="px-4 py-3">Published</th>
            <th class="px-4 py-3">Ստեղծվել է</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="w in works"
            :key="w.id"
            class="border-b last:border-0 hover:bg-gray-50"
          >
            <td class="px-4 py-3">
              <img
                :src="cover(w)"
                class="w-14 h-10 rounded object-cover border"
              />
            </td>
            <td class="px-4 py-3 font-medium">{{ w.title }}</td>
            <td class="px-4 py-3 text-gray-600">{{ w.slug }}</td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(t, i) in (w.tags || []).slice(0, 3)"
                  :key="i"
                  class="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs"
                  >{{ t }}</span
                >
                <span
                  v-if="(w.tags || []).length > 3"
                  class="text-xs text-gray-500"
                >
                  +{{ (w.tags || []).length - 3 }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1 text-xs"
                :class="w.is_published ? 'text-emerald-600' : 'text-gray-500'"
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="w.is_published ? 'bg-emerald-500' : 'bg-gray-400'"
                ></span>
                {{ w.is_published ? 'ஆம்' : 'Ոչ' }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-600">
              {{ dateText(w.created_at) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-2">
                <button
                  class="px-3 py-1.5 rounded-lg border hover:bg-gray-100"
                  @click="$emit('edit', w)"
                >
                  Խմբագրել
                </button>
                <button
                  class="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  @click="$emit('delete', w)"
                >
                  Ջնջել
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!works || works.length === 0">
            <td colspan="7" class="px-4 py-6 text-center text-gray-500">
              Աշխատանքներ չկան
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- pagination -->
    <div
      v-if="pagination"
      class="flex items-center justify-between px-4 py-3 border-t bg-white"
    >
      <div class="text-xs text-gray-500">
        էջ {{ pagination.current_page }} / {{ pagination.last_page }} •
        ընդհանուր՝ {{ pagination.total }}
      </div>
      <div class="flex items-center gap-1">
        <button
          class="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
          :disabled="pagination.current_page <= 1"
          @click="$emit('change-page', pagination.current_page - 1)"
        >
          Նախորդ
        </button>
        <button
          class="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
          :disabled="pagination.current_page >= pagination.last_page"
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
  name: 'WorkTable',
  props: {
    works: { type: Array, default: () => [] },
    pagination: { type: Object, default: null },
    searchQuery: { type: String, default: '' },
  },
  methods: {
    cover(w) {
      return (
        w.image_url ||
        (Array.isArray(w.images) && w.images.length ? w.images[0].url : null) ||
        'static/images/logo.png'
      )
    },
    dateText(v) {
      if (!v) return '-'
      try {
        const d = new Date(v)
        return d.toLocaleDateString()
      } catch {
        return v
      }
    },
  },
}
</script>
