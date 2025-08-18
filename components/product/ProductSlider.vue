<template>
  <div class="product-slider relative">
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <div v-for="product in products" :key="product.id" class="swiper-slide">
          <div class="product-card h-full flex flex-col">
            <div class="relative h-48 overflow-hidden">
              <img
                :src="product.image"
                :alt="product.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-4 flex-grow flex flex-col">
              <h3 class="text-lg font-bold mb-2">{{ product.name }}</h3>
              <p class="text-red-600 font-bold mb-4">
                {{ formatPrice(product.price) }} AMD
              </p>
              <nuxt-link
                :to="`/products/${product.id}`"
                class="mt-auto bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-center"
              >
                View Details
              </nuxt-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="swiper-button-next"></div>
    <div class="swiper-button-prev"></div>
  </div>
</template>

<script>
import Swiper from 'swiper'
import 'swiper/css/swiper.min.css'

export default {
  name: 'ProductSlider',
  props: {
    products: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      swiper: null,
    }
  },
  mounted() {
    this.initSwiper()
  },
  beforeDestroy() {
    if (this.swiper) {
      this.swiper.destroy(true, true)
    }
  },
  methods: {
    initSwiper() {
      this.swiper = new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 20,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        },
      })
    },
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
  },
}
</script>

<style scoped>
.product-slider {
  padding: 1rem 2rem;
}

.swiper-container {
  width: 100%;
  height: 290px;
  padding: 10px;
}

.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.swiper-button-next,
.swiper-button-prev {
  color: #4a5568;
  background: rgba(255, 255, 255, 0.8);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.swiper-button-next:after,
.swiper-button-prev:after {
  font-size: 1.2rem;
}
</style>
