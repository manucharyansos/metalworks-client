<template>
  <div class="basket-button-container">
    <button class="basket-button" aria-label="Basket" @click="toggleBasket">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        class="w-8 h-8"
      >
        <path
          d="M6 8h12l-1.2 10.2A2 2 0 0 1 14.8 20H9.2a2 2 0 0 1-2-1.8L6 8Z"
        />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>

      <span v-if="itemCount > 0" class="basket-count">{{ itemCount }}</span>
    </button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  computed: {
    ...mapGetters('basket', ['basketItemCount']),
    itemCount() {
      return this.basketItemCount
    },
  },
  methods: {
    ...mapActions('basket', ['toggleBasket']),
  },
}
</script>

<style scoped>
.basket-button-container {
  position: relative;
}

.basket-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  position: relative;
  color: #333;
}

.basket-button svg {
  width: 24px;
  height: 24px;
}

.basket-count {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}
</style>
