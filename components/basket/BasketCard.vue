<template>
  <div class="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden font-sans">
    <!-- Header -->
    <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white">Զամբյուղ</h2>
      <button class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" @click="$emit('closeBasket')">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Body -->
    <div v-if="items.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
      Զամբյուղը դատարկ է
    </div>
    <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
      <div v-for="item in items" :key="item.id" class="flex items-start p-4 space-x-4">
        <!-- Image -->
        <img :src="item.image" :alt="item.name" class="w-16 h-16 object-cover rounded-md" />

        <!-- Product Details -->
        <div class="flex-1">
          <h3 class="text-sm font-medium text-gray-800 dark:text-white">{{ item.name }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{{ item.description }}</p>
          <p class="text-sm font-semibold text-gray-800 dark:text-white mt-1">{{ item.price }} դրամ</p>

          <!-- Quantity Controls -->
          <div class="flex items-center mt-2 space-x-2">
            <button
              :disabled="item.quantity <= 1"
              class="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200"
              @click="$emit('update-quantity', { product: item, action: 'decrease' })"
            >
              -
            </button>
            <span class="text-sm text-gray-800 dark:text-white">{{ item.quantity }}</span>
            <button
              class="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200"
              @click="$emit('update-quantity', { product: item, action: 'increase' })"
            >
              +
            </button>
          </div>
        </div>

        <!-- Delete Button -->
        <button
          class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
          @click="$emit('delete-item', item.id)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="items.length > 0" class="p-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-center mb-4">
        <span class="text-sm font-medium text-gray-800 dark:text-white">Ընդհանուր:</span>
        <span class="text-lg font-bold text-gray-800 dark:text-white">{{ totalPrice }} դրամ</span>
      </div>
      <button
        @click="$emit('clear-basket')"
        class="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
      >
        Ջնջել Զամբյուղը
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    totalPrice() {
      return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    },
  },
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>