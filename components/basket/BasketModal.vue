<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <BasketCard @close="close" />
      </div>
    </div>
  </transition>
</template>

<script>
import { mapActions } from 'vuex'
import BasketCard from './BasketCard.vue'

export default {
  components: { BasketCard },
  props: { isOpen: { type: Boolean, default: false } },
  methods: {
    ...mapActions('basket', ['closeBasket']),
    close() {
      this.closeBasket()
      this.$emit('close') // optional backward-compat
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  max-width: 95%;
  width: 420px;
  max-height: 90vh;
  overflow: hidden;
}

/* Transition effects */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s;
}

.modal-enter .modal-container,
.modal-leave-to .modal-container {
  transform: translateY(-20px);
}
</style>
