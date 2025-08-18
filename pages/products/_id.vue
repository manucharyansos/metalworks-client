<template>
  <div class="product-show my-8 md:my-16 lg:my-24 px-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
      ></div>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded"
    >
      <p>{{ error }}</p>
    </div>

    <!-- Product Content -->
    <div v-if="product" class="max-w-6xl mx-auto">
      <!-- Mobile Layout -->
      <div class="md:hidden">
        <!-- Main Image Carousel -->
        <div class="relative mb-4 rounded-lg overflow-hidden shadow-lg">
          <img
            :src="currentImage || product.image"
            :alt="product.name"
            class="w-full h-64 md:h-96 object-cover"
          />
          <!-- Gallery Navigation -->
          <div
            v-if="product.images && product.images.length > 0"
            class="absolute bottom-4 left-0 right-0 flex justify-center space-x-2"
          >
            <button
              v-for="(img, index) in [product, ...product.images]"
              :key="index"
              :class="{
                'bg-blue-500':
                  currentImage === (index === 0 ? product.image : img.path),
                'bg-white bg-opacity-50':
                  currentImage !== (index === 0 ? product.image : img.path),
              }"
              @click="currentImage = index === 0 ? product.image : img.path"
              class="w-3 h-3 rounded-full"
            ></button>
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
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition duration-300"
            @click="addToCart(product)"
          >
            Ավելացնել զամբյուղ
          </button>
        </div>
      </div>

      <!-- Desktop Layout -->
      <div class="hidden md:flex gap-8 lg:gap-12">
        <!-- Image Gallery -->
        <div class="w-1/2">
          <!-- Main Image -->
          <div class="mb-4 rounded-lg overflow-hidden shadow-lg">
            <img
              :src="currentImage || product.image"
              :alt="product.name"
              class="w-full h-96 object-cover rounded-lg"
            />
          </div>

          <!-- Thumbnail Gallery -->
          <div
            v-if="product.images && product.images.length > 0"
            class="grid grid-cols-4 gap-2 mt-2"
          >
            <button
              v-for="(img, index) in [product, ...product.images]"
              :key="index"
              class="h-20 rounded overflow-hidden border-2"
              :class="{
                'border-blue-500':
                  currentImage === (index === 0 ? product.image : img.path),
              }"
              @click="currentImage = index === 0 ? product.image : img.path"
            >
              <img
                :src="index === 0 ? product.image : img.path"
                :alt="`${product.name} - Image ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="w-1/2">
          <h1 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            {{ product.name }}
          </h1>
          <p class="text-gray-700 mb-6 text-lg">{{ product.description }}</p>
          <p class="text-red-600 text-2xl lg:text-3xl font-bold mb-8">
            {{ formattedPrice }} դրամ
          </p>

          <button
            @click="addToCart(product)"
            class="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg transition duration-300 text-lg"
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
      // if (!this.product || typeof this.product.price !== 'number') {
      //   return '0'
      // }
      return this.product.price?.toLocaleString()
    },
  },
  created() {
    this.id = this.$route.params.id
  },
  mounted() {
    this.fetchProductData()
  },
  methods: {
    ...mapActions('products', ['fetchProduct']),
    ...mapActions('basket', ['addToBasket', 'fetchBasket']),

    async fetchProductData() {
      this.loading = true
      this.error = null
      try {
        await this.fetchProduct(this.id)
        this.currentImage = this.product.image
      } catch (error) {
        this.error = 'Չհաջողվեց բեռնել ապրանքը'
      } finally {
        this.loading = false
      }
    },

    async addToCart(product) {
      if (!this.$auth.loggedIn) {
        await this.$router.push('/login')
      } else {
        await this.addToBasket(product)
        await this.fetchBasket()
        this.$emit('toggle')

        // Show notification
        this.$toast.success('Ապրանքը ավելացվել է զամբյուղին', {
          position: 'top-right',
          duration: 3000,
        })
      }
    },
  },
}
</script>

<style scoped>
.product-show {
  min-height: calc(100vh - 200px);
}

/* Smooth transitions for images */
img {
  transition: opacity 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .product-show {
    padding: 0 1rem;
  }
}

/* Gallery thumbnail hover effect */
button:hover img {
  opacity: 0.8;
}
</style>
