<template>
  <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
    <!-- Top bar -->
    <div
      class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4"
    >
      <div class="relative w-full sm:max-w-xs">
        <input
          :value="searchQuery"
          type="search"
          placeholder="Որոնում…"
          class="w-full pl-10 pr-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
          @input="$emit('update:searchQuery', $event.target.value)"
        />
        <svg
          class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M21 21l-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </div>
    </div>

    <!-- Table (desktop) -->
    <div class="hidden md:block overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase">
              Պատկեր
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase">
              Անուն
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase">
              Արժեք
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase">
              Ամսաթիվ
            </th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase">
              Գործողություններ
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading">
            <td colspan="5" class="px-4 py-6 text-center text-gray-500">
              Բեռնում…
            </td>
          </tr>
          <tr v-for="p in products" :key="p.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <img
                :src="img(p)"
                alt=""
                class="w-14 h-14 rounded-lg object-cover border"
              />
            </td>
            <td class="px-4 py-3">
              <div class="font-medium">{{ p.name }}</div>
              <div class="text-sm text-gray-500 line-clamp-1">
                {{ p.description }}
              </div>
            </td>
            <td class="px-4 py-3 font-semibold">{{ fmt(p.price) }} ֏</td>
            <td class="px-4 py-3 text-sm text-gray-600">
              {{ dt(p.created_at) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <button
                  class="px-3 py-1.5 rounded-lg border hover:bg-gray-100"
                  @click="$emit('edit', p)"
                >
                  Խմբագրել
                </button>
                <button
                  class="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  @click="$emit('delete', p)"
                >
                  Ջնջել
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && (!products || !products.length)">
            <td colspan="5" class="px-4 py-6 text-center text-gray-500">
              Տվյալներ չկան
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cards (mobile) -->
    <div class="md:hidden grid grid-cols-1 gap-4">
      <article
        v-for="p in products"
        :key="p.id"
        class="rounded-2xl border p-4 flex gap-3"
      >
        <img
          :src="img(p)"
          alt=""
          class="w-20 h-20 rounded-lg object-cover border"
        />
        <div class="flex-1">
          <div class="font-semibold">{{ p.name }}</div>
          <div class="text-sm text-gray-500 line-clamp-2">
            {{ p.description }}
          </div>
          <div class="mt-2 font-semibold">{{ fmt(p.price) }} ֏</div>
          <div class="mt-3 flex items-center gap-2">
            <button
              class="px-3 py-1.5 rounded-lg border"
              @click="$emit('edit', p)"
            >
              Խմբագրել
            </button>
            <button
              class="px-3 py-1.5 rounded-lg bg-red-600 text-white"
              @click="$emit('delete', p)"
            >
              Ջնջել
            </button>
          </div>
        </div>
      </article>
      <p
        v-if="!loading && (!products || !products.length)"
        class="text-center text-gray-500"
      >
        Տվյալներ չկան
      </p>
    </div>

    <!-- Pagination -->
    <div v-if="pagination" class="mt-6 flex items-center justify-center gap-2">
      <button
        class="px-3 py-1.5 rounded-lg border disabled:opacity-50"
        :disabled="pagination.current_page <= 1"
        @click="$emit('change-page', pagination.current_page - 1)"
      >
        Նախորդ
      </button>

      <div v-for="p in pages" :key="`p-${p}`">
        <button
          v-if="p !== '…'"
          class="px-3 py-1.5 rounded-lg border"
          :class="
            p === pagination.current_page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'hover:bg-gray-100'
          "
          @click="$emit('change-page', p)"
        >
          {{ p }}
        </button>
        <span v-else class="px-2 text-gray-400">…</span>
      </div>

      <button
        class="px-3 py-1.5 rounded-lg border disabled:opacity-50"
        :disabled="pagination.current_page >= pagination.last_page"
        @click="$emit('change-page', pagination.current_page + 1)"
      >
        Հաջորդ
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductTable',
  props: {
    products: { type: Array, default: () => [] },
    pagination: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    searchQuery: { type: String, default: '' },
  },
  computed: {
    pages() {
      if (!this.pagination) return []
      // eslint-disable-next-line camelcase
      const { current_page, last_page } = this.pagination
      const out = []
      const add = (n) => out.push(n)
      const addGap = () => out.push('…')

      add(1)
      // eslint-disable-next-line camelcase
      if (current_page > 3) addGap()
      for (
        // eslint-disable-next-line camelcase
        let p = Math.max(2, current_page - 1);
        // eslint-disable-next-line camelcase
        p <= Math.min(last_page - 1, current_page + 1);
        p++
      )
        add(p)
      // eslint-disable-next-line camelcase
      if (current_page < last_page - 2) addGap()
      // eslint-disable-next-line camelcase
      if (last_page > 1) add(last_page)
      return Array.from(new Set(out)).filter(Boolean)
    },
  },
  methods: {
    img(p) {
      return p?.image_url || p?.images?.[0]?.url || '/logo.png'
    },
    fmt(n) {
      if (n == null) return '0'
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    dt(s) {
      if (!s) return ''
      try {
        const d = new Date(s)
        return d.toLocaleDateString()
      } catch {
        return s
      }
    },
  },
}
</script>
