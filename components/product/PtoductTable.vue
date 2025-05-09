<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <!-- Action Button and Search -->
    <div
      class="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900"
    >
      <div>
        <button
          id="dropdownActionButton"
          data-dropdown-toggle="dropdownAction"
          class="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          type="button"
        >
          <span class="sr-only">Action button</span>
          Գործողություն
          <svg
            class="w-2.5 h-2.5 ms-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
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
      <div class="relative">
        <div
          class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none"
        >
          <svg
            class="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text"
          class="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Որոնել ապրանք..."
        />
      </div>
    </div>

    <!-- Products Table -->
    <table
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
    >
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
      >
        <tr>
          <th scope="col" class="p-4">
            <div class="flex items-center">
              <input
                id="checkbox-all"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label for="checkbox-all" class="sr-only">checkbox</label>
            </div>
          </th>
          <th scope="col" class="px-6 py-3">Անուն</th>
          <th scope="col" class="px-6 py-3">Նկարագրություն</th>
          <th scope="col" class="px-6 py-3">Առժեք</th>
          <th scope="col" class="px-6 py-3">Գործողություն</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in filteredProducts"
          :key="product.id"
          class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <td class="w-4 p-4">
            <div class="flex items-center">
              <input
                :id="`checkbox-${product.id}`"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label :for="`checkbox-${product.id}`" class="sr-only">checkbox</label>
            </div>
          </td>
          <th
            scope="row"
            class="flex items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            <div class="relative">
              <img
                v-if="product.image && !imageErrors[product.id]"
                :src="resolveImageUrl(product.image)"
                class="w-10 h-10 rounded-full object-cover"
                :alt="product.name"
                loading="lazy"
                @error="handleImageError(product.id)"
              />
              <div
                class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                :class="{ 'hidden': product.image && !imageErrors[product.id] }"
              >
                <svg
                  class="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div class="ps-3">
              <div class="text-base font-semibold">{{ product.name }}</div>
            </div>
          </th>
          <td class="px-6 py-4">{{ product.description }}</td>
          <td class="px-6 py-4">{{ product.price }} դրամ</td>
          <td class="px-6 py-4">
            <a
              href="#"
              class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >Խմբագրել</a
            >
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <nav
      class="flex items-center justify-between p-4"
      aria-label="Table navigation"
    >
      <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
        Ցուցադրվում է
        <span class="font-semibold text-gray-900 dark:text-white"
          >{{ pagination.per_page * (pagination.current_page - 1) + 1 }}-{{ Math.min(pagination.per_page * pagination.current_page, pagination.total) }}</span
        >
        ընդհանուր
        <span class="font-semibold text-gray-900 dark:text-white">{{ pagination.total }}</span
        >-ից
      </span>
      <ul class="inline-flex -space-x-px text-sm h-8">
        <li>
          <button
            @click="$emit('change-page', pagination.current_page - 1)"
            :disabled="!pagination.prev_page_url"
            class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Նախորդ
          </button>
        </li>
        <li v-for="page in pagination.last_page" :key="page">
          <button
            @click="$emit('change-page', page)"
            :class="[
              pagination.current_page === page
                ? 'text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100 hover:text-blue-700'
                : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700',
              'flex items-center justify-center px-3 h-8 leading-tight border dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
            ]"
          >
            {{ page }}
          </button>
        </li>
        <li>
          <button
            @click="$emit('change-page', pagination.current_page + 1)"
            :disabled="!pagination.next_page_url"
            class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Հաջորդ
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'ProductTable',
  props: {
    products: {
      type: Array,
      default: () => []
    },
    pagination: {
      type: Object,
      default: () => ({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        next_page_url: null,
        prev_page_url: null
      })
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['update:searchQuery', 'change-page'],
  data() {
    return {
      imageErrors: {} // Track which product images failed to load
    }
  },
  computed: {
    filteredProducts() {
      if (!this.searchQuery) return this.products
      return this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  methods: {
    resolveImageUrl(image) {
      if (!image || typeof image !== 'string' || image.trim() === '' || image === 'products/') {
        console.warn('Invalid or empty image path:', image)
        return ''
      }
      const baseUrl = this.$baseUrl || this.$axios.defaults.baseURL || 'http://localhost:8000'
      // Handle absolute paths (e.g., '/storage/MetalWorks/filename.jpg', '/storage/Products/filename.jpg')
      if (image.startsWith('/storage/')) {
        const resolvedUrl = `${baseUrl}${image}`
        console.log(`Resolved image URL (absolute) for path "${image}":`, resolvedUrl)
        return resolvedUrl
      }
      // Handle relative paths (e.g., 'products/filename.jpg', 'Products/filename.jpg', 'MetalWorks/filename.jpg')
      if (!image.startsWith('http') && !image.startsWith('data:')) {
        // Normalize to '/storage/directory/filename.jpg'
        const normalizedImage = image.startsWith('products/') || 
                               image.startsWith('Products/') || 
                               image.startsWith('MetalWorks/')
          ? `/storage/${image}`
          : `/storage/MetalWorks/${image}`
        const resolvedUrl = `${baseUrl}${normalizedImage}`
        console.log(`Resolved image URL (relative) for path "${image}":`, resolvedUrl)
        return resolvedUrl
      }
      console.log(`Resolved image URL (unchanged) for path "${image}":`, image)
      return image
    },
    handleImageError(productId) {
      console.error('Image failed to load for product:', productId)
      this.$set(this.imageErrors, productId, true)
    }
  }
}
</script>