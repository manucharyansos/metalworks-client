<template>
  <div class="product-show my-8 md:my-16 lg:my-24 px-4">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
      ></div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded"
    >
      <p>{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else-if="product" class="max-w-6xl mx-auto">
      <!-- Mobile -->
      <div class="md:hidden">
        <div class="relative mb-4 rounded-lg overflow-hidden shadow">
          <img
            :src="displayedImage"
            :alt="product.name"
            class="w-full h-64 object-cover"
            loading="lazy"
            @error="onImgError"
          />
          <div
            v-if="galleryImages.length > 1"
            class="absolute bottom-3 left-0 right-0 flex justify-center gap-2"
          >
            <button
              v-for="(url, i) in galleryImages"
              :key="`dot-${i}`"
              :aria-label="`Image ${i + 1}`"
              class="w-2.5 h-2.5 rounded-full ring-1 ring-black/10"
              :class="currentImage === url ? 'bg-blue-500' : 'bg-white/70'"
              @click="currentImage = url"
            />
          </div>
        </div>

        <div class="p-4 bg-white rounded-lg shadow">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">
            {{ product.name }}
          </h1>
          <p class="text-gray-600 mb-4">{{ product.description }}</p>
          <p class="text-red-600 text-xl font-semibold mb-4">
            {{ formattedPrice }} դրամ
          </p>
          <button
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
            @click="addToCart(product)"
          >
            Ավելացնել զամբյուղ
          </button>
        </div>
      </div>

      <!-- Desktop -->
      <div class="hidden md:grid md:grid-cols-2 gap-8 lg:gap-12">
        <!-- Gallery -->
        <div>
          <div class="mb-4 rounded-lg overflow-hidden shadow">
            <img
              :src="displayedImage"
              :alt="product.name"
              class="w-full h-96 object-cover"
              loading="lazy"
              @error="onImgError"
            />
          </div>

          <div
            v-if="galleryImages.length > 1"
            class="grid grid-cols-4 gap-2 mt-2"
          >
            <button
              v-for="(url, index) in galleryImages"
              :key="`thumb-${index}`"
              class="h-20 rounded overflow-hidden border-2 transition"
              :class="
                currentImage === url
                  ? 'border-blue-500'
                  : 'border-transparent hover:border-gray-200'
              "
              :aria-label="`Select image ${index + 1}`"
              @click="currentImage = url"
            >
              <img
                :src="url"
                :alt="`${product.name} - ${index + 1}`"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="thumbError($event)"
              />
            </button>
          </div>
        </div>

        <!-- Info -->
        <div>
          <h1 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            {{ product.name }}
          </h1>
          <p class="text-gray-700 mb-6 text-lg">{{ product.description }}</p>
          <p class="text-red-600 text-2xl lg:text-3xl font-bold mb-8">
            {{ formattedPrice }} դրամ
          </p>
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg transition text-lg"
            @click="addToCart(product)"
          >
            Ավելացնել զամբյուղ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
const FALLBACK = '/placeholder-product.jpg'

export default {
  data() {
    return {
      id: null,
      loading: false,
      error: null,
      currentImage: null,
    }
  },
  computed: {
    ...mapGetters('products', ['getProduct']),
    product() {
      return this.getProduct
    },
    formattedPrice() {
      const n = Number(this.product?.price) || 0
      return n.toLocaleString()
    },
    galleryImages() {
      const main = this.product?.image_url ? [this.product.image_url] : []
      const extra = Array.isArray(this.product?.images)
        ? this.product.images.map((i) => i?.url).filter(Boolean)
        : []
      return [...new Set([...main, ...extra])].length
        ? [...new Set([...main, ...extra])]
        : [FALLBACK]
    },
    displayedImage() {
      return this.currentImage || this.galleryImages[0] || FALLBACK
    },
  },
  created() {
    this.id = this.$route.query.id
  },
  async mounted() {
    await this.fetchProductData()
  },
  methods: {
    ...mapActions('products', ['fetchProduct']),
    ...mapActions('basket', ['addToBasket', 'openBasket']),
    async fetchProductData() {
      this.loading = true
      this.error = null
      try {
        await this.fetchProduct(this.id)
        this.$nextTick(() => {
          this.currentImage = this.galleryImages[0] || null
        })
      } catch (e) {
        this.error = 'Չհաջողվեց բեռնել ապրանքը'
      } finally {
        this.loading = false
      }
    },
    async addToCart(product) {
      if (!this.$auth?.loggedIn) {
        await this.$router.push('/login')
        return
      }
      await this.addToBasket(product)
      this.openBasket && this.openBasket()
      this.$toast?.success &&
        this.$toast.success('Ապրանքը ավելացվել է զամբյուղին', {
          position: 'top-right',
          duration: 3000,
        })
    },
    onImgError(e) {
      e.target.src = FALLBACK
    },
    thumbError(e) {
      e.target.src = FALLBACK
    },
  },
}
</script>

<style scoped>
.product-show {
  min-height: calc(100vh - 200px);
}
img {
  transition: opacity 0.25s ease;
}
</style>
