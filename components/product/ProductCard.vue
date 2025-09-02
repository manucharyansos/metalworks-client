<template>
  <article
    class="group flex flex-col overflow-hidden border border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
  >
    <nuxt-link
      class="relative block aspect-square overflow-hidden"
      :to="{ path: '/products/view', query: { id: product.id } }"
      :aria-label="product.name"
      prefetch
    >
      <img
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        :src="product.image_url || fallback"
        :alt="product.name"
        loading="lazy"
        @error="onImgError"
      />
    </nuxt-link>

    <div class="p-4 flex flex-col flex-grow">
      <h3
        class="text-base sm:text-lg font-medium text-gray-900 mb-1 line-clamp-2"
      >
        {{ product.name }}
      </h3>

      <div class="mt-auto">
        <div class="flex items-center justify-between mb-3">
          <span class="text-lg font-bold text-gray-900">
            {{ price }} դրամ
          </span>
        </div>

        <button
          class="w-full inline-flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white py-2.5 px-4 rounded-md transition-colors duration-200"
          @click.stop="addToCart"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mr-2 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
            />
          </svg>
          Ավելացնել զամբյուղ
        </button>
      </div>
    </div>
  </article>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true,
      validator: (p) => p && p.id && p.name && p.price != null,
    },
  },
  data() {
    return { fallback: '/metalworks-logo.jpg' }
  },
  computed: {
    price() {
      const n = Number(this.product?.price) || 0
      return n.toLocaleString()
    },
  },
  methods: {
    ...mapActions('basket', ['addToBasket', 'openBasket']),
    onImgError(e) {
      e.target.src = this.fallback
    },
    async addToCart() {
      if (this.$auth && !this.$auth.loggedIn) {
        this.$router.push('/login')
        return
      }
      await this.addToBasket(this.product)
      this.openBasket && this.openBasket()
    },
  },
}
</script>
