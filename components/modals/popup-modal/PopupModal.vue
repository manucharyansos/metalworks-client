<template>
  <div>
    <!-- Backdrop -->
    <transition name="fade">
      <div
        v-if="isOpenModal"
        class="fixed inset-0 bg-black/50 z-40"
        aria-hidden="true"
      />
    </transition>

    <!-- Modal -->
    <transition name="zoom">
      <div
        v-if="isOpenModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <button
            type="button"
            class="absolute top-3 right-3 z-40 text-gray-600 hover:text-gray-800 transition-colors bg-white rounded-full p-2 shadow-sm"
            aria-label="Close"
            @click="$emit('close-modal')"
          >
            <svg
              class="w-5 h-5"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <div class="p-6 text-center">
            <svg
              class="mx-auto mb-4 text-gray-400 w-12 h-12"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <h3 class="mb-5 text-lg font-medium text-gray-700">{{ text }}</h3>
            <div class="flex justify-center gap-3">
              <button
                type="button"
                class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                @click="$emit('confirm')"
              >
                Այո ջնջել
              </button>
              <button
                type="button"
                class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                @click="$emit('close-modal')"
              >
                Ոչ, չեղարկել
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'PopupModal',
  props: {
    isOpenModal: { type: Boolean, default: false },
    text: { type: String, default: '' },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.zoom-enter-active,
.zoom-leave-active {
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0.98);
  opacity: 0;
}
</style>
