<template>
  <div class="basket-card">
    <!-- Header -->
    <div class="basket-header">
      <h2 class="basket-title">{{ $t('basket.your_cart') }}</h2>
      <button
        class="close-button"
        aria-label="Close basket"
        @click="$emit('close')"
      >
        &times;
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('basket.loading') }}</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="retry">{{ $t('basket.try_again') }}</button>
    </div>

    <!-- Empty basket -->
    <div v-if="!loading && items.length === 0" class="empty-basket">
      <p>{{ $t('basket.cart_is_empty') }}</p>
      <button class="continue-shopping" @click="$emit('close')">
        {{ $t('basket.continue_shopping') }}
      </button>
    </div>

    <!-- Items list -->
    <transition-group v-else name="basket-item" tag="div" class="items-list">
      <div v-for="item in items" :key="item.id" class="basket-item">
        <div class="item-image">
          <img
            :src="item.image_url || '/metalworks-logo.jpg'"
            :alt="item.name"
          />
        </div>

        <div class="item-details">
          <h3 class="item-name">{{ item.name }}</h3>
          <p class="item-price">{{ formatPrice(item.price) }} դրամ</p>

          <div class="quantity-controls">
            <button
              :disabled="item.quantity <= 1"
              class="quantity-button"
              aria-label="Decrease quantity"
              @click="updateQuantity(item.id, item.quantity - 1)"
            >
              −
            </button>
            <span class="quantity">{{ item.quantity }}</span>
            <button
              class="quantity-button"
              aria-label="Increase quantity"
              @click="updateQuantity(item.id, item.quantity + 1)"
            >
              +
            </button>
          </div>
        </div>

        <button
          class="remove-item"
          aria-label="Remove item"
          @click="deleteItem(item.id)"
        >
          &times;
        </button>
      </div>
    </transition-group>

    <!-- Checkout section -->
    <div v-if="items.length > 0" class="checkout-section">
      <div class="total-section">
        <span>{{ $t('basket.general') }}</span>
        <span class="total-price">{{ formatPrice(total) }} դրամ</span>
      </div>

      <button class="checkout-button" @click="proceedToCheckout">
        {{ $t('basket.to_checkout') }}
      </button>

      <button class="clear-basket" @click="clearBasket">
        {{ $t('basket.empty_the_cart') }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters('basket', [
      'basketItems',
      'basketTotal',
      'isLoading',
      'error',
    ]),

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
  },

  methods: {
    ...mapActions('basket', [
      'updateItem',
      'removeItem',
      'clearBasket',
      'fetchBasket',
    ]),
    formatPrice(price) {
      return (parseFloat(price) || 0).toFixed(2)
    },

    async updateQuantity(itemId, newQuantity) {
      if (newQuantity > 0) {
        await this.updateItem({ itemId, quantity: newQuantity })
        // ❌ await this.fetchBasket() // ավելորդ է, actions-ը արդեն թարմացնում է
      }
    },

    async deleteItem(itemId) {
      await this.removeItem(itemId)
      // ❌ await this.fetchBasket()
    },

    proceedToCheckout() {
      this.$router.push('/checkout')
      this.$emit('close')
    },

    retry() {
      this.fetchBasket()
    },
  },
}
</script>

<style scoped>
.basket-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.basket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.basket-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid #3498db;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  padding: 1rem;
  color: #e74c3c;
  text-align: center;
}

.empty-basket {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;
}

.empty-basket img {
  width: 120px;
  height: 120px;
  margin-bottom: 1rem;
}

.continue-shopping {
  margin-top: 1rem;
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.items-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.basket-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
  position: relative;
  transition: all 0.3s ease;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 12px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  flex: 1;
}

.item-name {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 500;
}

.item-price {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: #e74c3c;
  font-weight: 600;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-button {
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  background: white;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.quantity-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  margin: 0 8px;
  min-width: 20px;
  text-align: center;
}

.remove-item {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #999;
  cursor: pointer;
}

.checkout-section {
  padding: 16px;
  border-top: 1px solid #eee;
}

.total-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.total-price {
  font-weight: 600;
  color: #e74c3c;
}

.checkout-button {
  width: 100%;
  padding: 12px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 8px;
}

.clear-basket {
  width: 100%;
  padding: 8px;
  background: none;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  cursor: pointer;
}

/* Transition effects */
.basket-item-enter-active,
.basket-item-leave-active {
  transition: all 0.3s;
}

.basket-item-enter,
.basket-item-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
