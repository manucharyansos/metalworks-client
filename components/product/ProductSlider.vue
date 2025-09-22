<template>
  <div class="product-slider relative w-full">
    <client-only>
      <div class="container mx-auto px-6 pb-10 sm:px-8 lg:px-10">
        <carousel
          :per-page="4"
          :per-page-custom="breakpoints"
          :navigation-enabled="true"
          :pagination-enabled="true"
          :scroll-per-page="true"
          :autoplay="true"
          :autoplay-timeout="3500"
          :loop="true"
          :mouse-drag="true"
          :touch-drag="true"
          :speed="450"
          class="mt-6 sm:mt-8 text-center w-full"
          aria-label="Ապրանքների կարուսել"
        >
          <slide
            v-for="product in products"
            :key="product.id"
            class="px-2 sm:px-3"
          >
            <article
              class="product-card group h-full flex flex-col bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <!-- Image -->
              <div class="relative w-full bg-neutral-50">
                <div class="aspect-[4/3] w-full overflow-hidden">
                  <img
                    :src="product.image_url"
                    :alt="product.name"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <!-- Discount badge -->
                <span
                  v-if="product.discount_percent"
                  class="absolute left-3 top-3 inline-flex items-center rounded-full bg-red-600 text-white text-xs font-semibold px-2.5 py-1 shadow"
                  >-{{ product.discount_percent }}%</span
                >

                <!-- Quick CTA -->
                <button
                  class="absolute bottom-3 right-3 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-sm font-medium text-neutral-900 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Տեսնել մանրամասն"
                  @click="goTo(product)"
                >
                  Դիտել
                </button>
              </div>

              <!-- Body -->
              <div class="p-4 sm:p-5 flex flex-col flex-1">
                <h3
                  class="product-title text-base sm:text-lg font-semibold text-neutral-900 line-clamp-2"
                  :title="product.name"
                >
                  {{ product.name }}
                </h3>

                <!-- Rating -->
                <div
                  v-if="product.rating_rate"
                  class="mt-1.5 flex items-center gap-1.5 text-amber-500"
                  aria-label="Գնահատական"
                >
                  <span
                    v-for="n in 5"
                    :key="n"
                    class="inline-block text-sm"
                    :class="
                      n <= Math.round(product.rating_rate)
                        ? 'opacity-100'
                        : 'opacity-30'
                    "
                    >★</span
                  >
                  <span class="ml-1 text-xs text-neutral-600">
                    ({{ product.rating_count || 0 }})
                  </span>
                </div>

                <!-- Price block -->
                <div class="mt-3 flex items-baseline gap-2">
                  <span class="text-red-600 font-bold text-lg">
                    {{ formatPrice(product.final_price ?? product.price) }}
                  </span>
                  <span
                    v-if="product.old_price"
                    class="text-neutral-400 line-through text-sm"
                  >
                    {{ formatPrice(product.old_price) }}
                  </span>
                  <span class="text-xs text-neutral-500">AMD</span>
                </div>
              </div>
            </article>
          </slide>
        </carousel>
      </div>
    </client-only>
  </div>
</template>

<script>
import { Carousel, Slide } from 'vue-carousel'

export default {
  name: 'ProductSlider',
  components: { Carousel, Slide },
  props: {
    products: { type: Array, required: true, default: () => [] },
  },
  data() {
    return {
      breakpoints: [
        [0, 1],
        [640, 2],
        [1024, 3],
        [1280, 4],
      ],
      priceFmt:
        typeof Intl !== 'undefined'
          ? new Intl.NumberFormat('hy-AM', { maximumFractionDigits: 0 })
          : null,
    }
  },
  methods: {
    formatPrice(value) {
      const num = Number(value ?? 0)
      if (this.priceFmt) {
        const withSymbol = this.priceFmt.format(num)
        return withSymbol.replace(/[֏\s]/g, '')
      }
      return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    goTo(product) {
      this.$router.push({ path: '/products/view', query: { id: product.id } })
    },
  },
}
</script>

<style scoped>
.product-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease,
    border-color 0.25s ease;
}
.product-card:hover {
  transform: translateY(-4px);
}

:deep(.VueCarousel) {
  position: relative;
}

.product-slider {
  --nav-size: clamp(28px, 6vw, 40px);
  --nav-offset: clamp(6px, 2vw, 12px);
}

::v-deep .VueCarousel {
  position: relative;
}
::v-deep .VueCarousel-navigation-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: var(--nav-size);
  height: var(--nav-size);
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}
@media (max-width: 420px) {
  ::v-deep .VueCarousel-navigation-prev {
    left: max(1rem, env(safe-area-inset-left));
    right: auto;
  }
  ::v-deep .VueCarousel-navigation-next {
    right: max(1rem, env(safe-area-inset-right));
    left: auto;
  }
}
@media (max-width: 360px) {
  .product-slider {
    --nav-size: 26px;
  }
}

@media (max-width: 360px) {
  .product-slider {
    --nav-size: 26px;
    --nav-offset: 8px;
  }
}
</style>
