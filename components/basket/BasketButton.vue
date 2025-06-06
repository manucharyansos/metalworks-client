<template>
  <div class="basket-button-container">
    <button class="basket-button" @click="toggleBasket" aria-label="Basket">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
      <span v-if="itemCount > 0" class="basket-count">
        {{ itemCount }}
      </span>
    </button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('basket', ['basketItemCount']),
    itemCount() {
      return this.basketItemCount
    }
  },
  methods: {
    toggleBasket() {
      this.$emit('toggle') // ✅ Emit event to parent (HeaderLayout)
    }
  }
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
