<template>
  <div class="product-slider relative">
    <client-only>
      <carousel
        :per-page="4"
        :per-page-custom="[
          [0, 1],
          [640, 2],
          [1024, 3],
          [1280, 4],
        ]"
        :navigation-enabled="true"
        :pagination-enabled="true"
        :scroll-per-page="true"
        :autoplay="true"
        :autoplay-timeout="3000"
        :loop="true"
      >
        <slide v-for="product in products" :key="product.id" class="px-2">
          <div class="product-card h-full flex flex-col">
            <div class="relative h-40 overflow-hidden">
              <img
                :src="product.image_url"
                :alt="product.name"
                class="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div class="p-4 flex-grow flex flex-col">
              <h3 class="product-title text-lg font-bold mb-2">
                {{ product.name }}
              </h3>
              <p class="text-red-600 font-bold mb-4">
                {{ formatPrice(product.price) }} AMD
              </p>
              <nuxt-link
                :to="`/products/${product.id}`"
                class="mt-auto bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-center"
              >
                Տեսնել մանրամասն
              </nuxt-link>
            </div>
          </div>
        </slide>
      </carousel>
    </client-only>
  </div>
</template>

<script>
import { Carousel, Slide } from 'vue-carousel'

export default {
  name: 'ProductSlider',
  components: { Carousel, Slide },
  props: {
    products: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    formatPrice(price) {
      return String(price ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
  },
}
</script>

<style scoped>
.product-title {
  font-size: 1.125rem; /* text-lg */
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* max 2 տող */
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3rem; /* ապահովում ա որ բոլոր վերնագրերը հավասար բարձրություն ունենան */
}

.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: #fff;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>
