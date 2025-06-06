<template>
  <div class="product-show my-32">
    <!-- Loading State -->
    <div v-if="loading" class="p-4">Բեռնվում է...</div>
    <!-- Error State -->
    <div v-if="error" class="p-4 text-red-600">{{ error }}</div>
    <!-- Mobile (Stacked) -->
    <div v-if="product" class="block md:hidden">
      <img :src="product.image" :alt="product.name" class="w-full">
      <div class="p-4">
        <h1 class="text-2xl font-bold">{{ product.name }}</h1>
        <p> {{ product.description }}</p>
        <p class="text-red-600 text-xl">{{ product.price }} դրամ</p>
        <button class="bg-blue-500 text-white p-2 rounded" @click="addToCart">
          Ավելացնել զամբյուղ
        </button>
      </div>
    </div>
    <!-- Desktop (Side by Side) -->
    <div v-if="product" class="hidden md:flex gap-8 p-6  my-32">
      <img :src="product.image" :alt="product.name" class="w-1/2 rounded-lg">
      <div class="w-1/2">
        <h1 class="text-3xl font-bold">{{ product.name }}</h1>
        <p class="text-red-600 text-2xl my-4">{{ product.price }} դրամ</p>
        <button class="bg-blue-500 text-white p-3 rounded-lg" @click="addToCart(product)">
          Ավելացնել զամբյուղ
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  data() {
    return {
      id: null,
      loading: false,
      error: null
    };
  },
  computed: {
    ...mapGetters('products', ['getProduct']),
    product() {
      return this.getProduct;
    }
  },
  created() {
    this.id = this.$route.params.id;
  },
  mounted() {
    this.fetchProductData();
  },
  methods: {
    ...mapActions('products', ['fetchProduct']),
       ...mapActions('basket', [
      'addToBasket',
      'fetchBasket'
    ]),
    async fetchProductData() {
      this.loading = true;
      this.error = null;
      try {
        await this.fetchProduct(this.id);
      } catch (error) {
        this.error = 'Failed to load product';
        console.error('Fetch product error:', error);
      } finally {
        this.loading = false;
      }
    },
    async addToCart(product) {
            if (!this.$auth.loggedIn) {
        await this.$router.push('/login')
      } else {
        await this.addToBasket(product)
        await this.fetchBasket()
this.$emit('toggle');
      }
    }
  }
};
</script>

<style scoped>
.product-show {
  max-width: 1200px;
  margin: 0 auto;
}
</style>