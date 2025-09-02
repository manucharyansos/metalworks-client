<template>
  <section class="w-full">
    <!-- Header / Controls -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <div
        class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h2
            class="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight italic text-neutral-800"
          >
            Մեր արտադրանքը
          </h2>
          <p
            v-if="productPagination?.total"
            class="mt-2 text-sm text-neutral-500"
          >
            Գտնվել է {{ (productPagination.total || 0).toLocaleString() }} անուն
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Search -->
          <div class="relative">
            <input
              v-model="q"
              type="search"
              inputmode="search"
              placeholder="Փնտրել ապրանք…"
              class="w-64 sm:w-72 rounded-lg border border-gray-300 bg-white px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              @input="onSearchInput"
              aria-label="Փնտրել ապրանք"
            />
            <svg
              class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7"></circle>
              <path d="M20 20l-3.5-3.5"></path>
            </svg>
          </div>

          <!-- Per page -->
          <label class="sr-only" for="perPage">Ապրանքներ էջում</label>
          <select
            id="perPage"
            v-model.number="perPage"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            @change="changePerPage"
          >
            <option :value="8">8 / էջ</option>
            <option :value="12">12 / էջ</option>
            <option :value="16">16 / էջ</option>
            <option :value="24">24 / էջ</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Loading skeleton -->
      <div
        v-if="isFetching"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <div
          v-for="n in perPage"
          :key="n"
          class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm animate-pulse"
        >
          <div class="aspect-square w-full rounded-md bg-gray-200"></div>
          <div class="mt-3 h-4 w-3/5 rounded bg-gray-200"></div>
          <div class="mt-2 h-4 w-4/5 rounded bg-gray-100"></div>
          <div class="mt-4 h-9 w-full rounded bg-gray-100"></div>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!products?.length"
        class="mx-auto max-w-xl text-center rounded-2xl border border-dashed border-gray-300 p-10 bg-white/60"
      >
        <h3 class="text-lg font-semibold text-neutral-800">
          Ապրանքներ չեն գտնվել
        </h3>
        <p class="mt-2 text-neutral-600">
          Փորձիր փոխել որոնման բառը կամ մաքրել ֆիլտրերը։
        </p>
        <button
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition"
          @click="resetSearch"
        >
          Մաքրել որոնումը
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M18 6L6 18M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Products grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>

      <!-- Pagination -->
      <nav
        v-if="hasPagination"
        class="mt-10 flex flex-wrap items-center justify-center gap-2"
        role="navigation"
        aria-label="Products pagination"
      >
        <button
          class="px-3 py-1.5 rounded-lg text-sm border transition"
          :class="btnClass(!!productPagination?.prev_page_url)"
          :disabled="!productPagination?.prev_page_url"
          aria-label="Նախորդ էջ"
          @click="changeProductPage(productPagination.current_page - 1)"
        >
          Նախորդ
        </button>

        <div class="hidden sm:flex items-center gap-1">
          <button
            v-for="page in pagesToShow"
            :key="page"
            class="px-3 py-1.5 rounded-lg text-sm transition"
            :class="pageClass(page)"
            :aria-current="
              productPagination.current_page === page ? 'page' : null
            "
            @click="changeProductPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          class="px-3 py-1.5 rounded-lg text-sm border transition"
          :class="btnClass(!!productPagination?.next_page_url)"
          :disabled="!productPagination?.next_page_url"
          aria-label="Հաջորդ էջ"
          @click="changeProductPage(productPagination.current_page + 1)"
        >
          Հաջորդ
        </button>
      </nav>
    </div>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ProductCard from '~/components/product/ProductCard.vue'

export default {
  components: { ProductCard },
  data() {
    return {
      perPage: 12,
      q: '',
      isFetching: false,
      // eslint-disable-next-line vue/no-reserved-keys
      _qTimer: null,
    }
  },
  computed: {
    ...mapGetters('products', ['getProducts', 'getProductPagination']),
    products() {
      return this.getProducts || []
    },
    productPagination() {
      return this.getProductPagination || {}
    },
    hasPagination() {
      return (this.productPagination?.last_page || 0) > 1
    },
    pagesToShow() {
      const curr = this.productPagination?.current_page || 1
      const last = this.productPagination?.last_page || 1
      const win = 2
      const start = Math.max(1, curr - win)
      const end = Math.min(last, curr + win)
      const pages = []
      for (let p = start; p <= end; p++) pages.push(p)
      if (start > 1) pages.unshift(1)
      if (end < last) pages.push(last)
      return [...new Set(pages)]
    },
  },
  async mounted() {
    if (!this.products?.length)
      await this.load({ page: 1, perPage: this.perPage })
  },
  methods: {
    ...mapActions('products', ['fetchProducts']),
    async load({ page = 1, perPage = this.perPage, search = this.q } = {}) {
      this.isFetching = true
      try {
        await this.fetchProducts({ page, perPage, search })
      } finally {
        this.isFetching = false
      }
    },
    async changeProductPage(page) {
      await this.load({ page })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    async changePerPage() {
      await this.load({ page: 1, perPage: this.perPage })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    onSearchInput() {
      clearTimeout(this._qTimer)
      this._qTimer = setTimeout(
        () => this.load({ page: 1, search: this.q }),
        350
      )
    },
    resetSearch() {
      this.q = ''
      this.load({ page: 1, search: '' })
    },
    // UI helpers
    btnClass(enabled) {
      return enabled
        ? 'bg-white border-gray-300 text-neutral-700 hover:bg-neutral-50'
        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
    },
    pageClass(page) {
      const curr = this.productPagination?.current_page
      return curr === page
        ? 'bg-indigo-500 text-white font-semibold'
        : 'bg-white border border-gray-300 text-neutral-700 hover:bg-neutral-50'
    },
  },
}
</script>
