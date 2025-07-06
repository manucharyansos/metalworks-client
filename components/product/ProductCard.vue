<template>
  <div
    class="product-card group flex flex-col overflow-hidden border border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
  >
    <nuxt-link
      class="relative block aspect-square overflow-hidden"
      :to="`/products/${product.id}`"
    >
      <img
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        :src="product.image || '/placeholder-product.jpg'"
        :alt="product.name"
        loading="lazy"
      />
      <div
        class="absolute inset-x-0 bottom-0 p-2 flex justify-end transition-all duration-300 opacity-0 group-hover:opacity-100"
      >
        <button
          class="w-10 h-10 flex items-center justify-center bg-white/90 text-gray-800 rounded-full shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Add to favorites"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </nuxt-link>

    <div class="p-4 flex flex-col flex-grow">
      <h3 class="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
        {{ product.name }}
      </h3>

      <div class="mt-auto">
        <div class="flex items-center justify-between mb-3">
          <span class="text-lg font-bold text-gray-900">
            {{ formatPrice(product.price) }}
          </span>
        </div>

        <button
          class="w-full flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-md transition-colors duration-200"
          @click.stop="$emit('addToCard', product)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mr-2 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
            />
          </svg>
          Ավելացնել զամբյուղ
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true,
      validator: (product) => {
        return product.id && product.name && product.price
      },
    },
  },
  methods: {
    formatPrice(price) {
      // Ավելացրեք ձեր գնի ֆորմատավորման տրամաբանությունը
      return typeof price === 'number' ? `$${price.toFixed(2)}` : price
    },
  },
}
</script>

<style scoped>
.product-card {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@supports not (aspect-ratio: 1 / 1) {
  .aspect-square::before {
    content: '';
    display: block;
    padding-bottom: 100%;
  }

  .aspect-square img {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
