<template>
  <div class="checkout-page container mx-auto px-4 py-8">
    <h1 class="text-2xl md:text-3xl font-bold mb-6 text-center">Վճարում</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Ձևաթուղթ -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Առաքման մանրամասներ</h2>
        <form @submit.prevent="submitPurchase">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700"
              >Անուն</label
            >
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700"
              >Էլ. փոստ</label
            >
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div class="mb-4">
            <label for="address" class="block text-sm font-medium text-gray-700"
              >Հասցե</label
            >
            <input
              id="address"
              v-model="form.address"
              type="text"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div class="mb-4">
            <label for="phone" class="block text-sm font-medium text-gray-700"
              >Հեռախոս</label
            >
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div class="mb-4">
            <label
              for="payment_method"
              class="block text-sm font-medium text-gray-700"
              >Վճարման եղանակ</label
            >
            <select
              id="payment_method"
              v-model="form.payment_method"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="cash">Կանխիկ առաքման ժամանակ</option>
              <option value="card">Բանկային քարտ</option>
            </select>
          </div>
          <button
            type="submit"
            class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            :disabled="loading"
          >
            {{ loading ? 'Մշակվում է...' : 'Տեղադրել պատվեր' }}
          </button>
        </form>
      </div>

      <!-- Պատվերի ամփոփում -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Պատվերի ամփոփում</h2>
        <div v-if="items.length === 0" class="text-center text-gray-500">
          Ձեր զամբյուղը դատարկ է
        </div>
        <div v-else>
          <div
            v-for="item in items"
            :key="item.id"
            class="flex justify-between mb-3"
          >
            <div class="flex items-center">
              <img
                :src="item.image || '/images/placeholder-product.jpg'"
                alt="item.name"
                class="w-12 h-12 object-cover rounded mr-3"
              />
              <div>
                <p class="font-medium">{{ item.name }}</p>
                <p class="text-sm text-gray-500">
                  {{ item.quantity }} x {{ formatPrice(item.price) }} դրամ
                </p>
              </div>
            </div>
            <p class="font-medium">{{ formatPrice(item.total) }} դրամ</p>
          </div>
          <hr class="my-4" />
          <div class="flex justify-between font-semibold">
            <span>Ընդհանուր:</span>
            <span>{{ formatPrice(total) }} դրամ</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import axios from 'axios'

export default {
  data() {
    return {
      form: {
        name: '',
        email: '',
        address: '',
        phone: '',
        payment_method: 'cash',
      },
    }
  },
  computed: {
    ...mapGetters('basket', ['basketItems', 'basketTotal', 'isLoading']),
    items() {
      return Array.isArray(this.basketItems) ? this.basketItems : []
    },
    total() {
      return this.basketTotal
    },
    loading() {
      return this.isLoading
    },
  },
  mounted() {
    this.fetchBasket()
    this.loadUserData()
  },
  methods: {
    ...mapActions('basket', ['fetchBasket', 'clearBasket']),
    loadUserData() {
      this.form.name = this.$auth.user.name || ''
      this.form.email = this.$auth.user.email || ''
      this.form.address = this.$auth.user.address || ''
      this.form.phone = this.$auth.user.phone || ''
      // try {
      //   const response = await axios.get('/api/user')
      //   const user = response.data
      //   this.form.name = user.name || ''
      //   this.form.email = user.email || ''
      // } catch (error) {
      //   console.error('Failed to load user data:', error)
      // }
    },
    async submitPurchase() {
      try {
        const response = await axios.post('/api/checkout', {
          ...this.form,
          items: this.items,
          total: this.total,
        })
        this.clearBasket()
        this.$router.push({
          name: 'purchase-confirmation',
          params: { purchaseId: response.data.purchase_id },
        })
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || 'Պատվերը տեղադրելու խնդիր'
        )
      }
    },
    formatPrice(price) {
      return parseFloat(price).toFixed(2)
    },
  },
}
</script>

<style scoped>
.checkout-page {
  max-width: 1200px;
}

@media (max-width: 768px) {
  .checkout-page {
    padding: 16px;
  }
}
</style>
