<template>
  <div
    class="space-y-6 p-4 sm:p-6 md:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl transition-all duration-300 animate-fade-in"
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Պատվերի մանրամասներ</h2>
      <span class="text-sm text-gray-500 dark:text-gray-400">ID: {{ orderId || 'N/A' }}</span>
    </div>

    <!-- Order Details -->
    <div class="grid gap-6 sm:grid-cols-2">
      <div class="space-y-4">
        <div
          class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm transition-transform hover:scale-[1.02] duration-200"
        >
          <slot name="name"></slot>
        </div>
        <div
          class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm transition-transform hover:scale-[1.02] duration-200"
        >
          <slot name="orderNumber"></slot>
        </div>
        <div
          class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm transition-transform hover:scale-[1.02] duration-200"
        >
          <slot name="startDate"></slot>
        </div>
        <div
          class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm transition-transform hover:scale-[1.02] duration-200"
        >
          <slot name="finishDate"></slot>
        </div>
      </div>

      <!-- Factory Status -->
      <div class="space-y-4 sm:col-span-2 lg:col-span-1">
        <div
          class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm transition-transform hover:scale-[1.02] duration-200"
        >
          <slot name="factoryStatus"></slot>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div class="grid grid-cols-1">
      <div class="space-y-4">
        <div
          class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm transition-transform hover:scale-[1.02] duration-200"
        >
          <slot name="description"></slot>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div
      class="flex flex-wrap items-center justify-end gap-4 mt-6 border-t border-gray-200 dark:border-gray-700 pt-4"
    >
      <slot name="buttons"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderDetail',
  props: {
    orderId: {
      type: [String, Number],
      default: null,
    },
  },
};
</script>

<style scoped>
/* Custom Animation for Fade-In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* Smooth hover effects */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Ensure dark mode transitions */
.bg-white,
.bg-gray-50,
.bg-gray-800,
.bg-gray-900 {
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Input and textarea focus states */
input:focus,
textarea:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
