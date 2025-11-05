<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">
          Ջնջե՞լ այս թույլտվությունը
        </h2>
        <p class="text-sm text-gray-600 mb-4" v-if="permission">
          {{ permission.name }}<br />
          <code class="text-xs bg-gray-100 px-2 py-1 rounded inline-block mt-1">
            {{ permission.slug }}
          </code>
        </p>

        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="inline-flex items-center rounded-xl px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
            @click="$emit('cancel')"
          >
            Չեղարկել
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-xl px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700"
            @click="$emit('confirm')"
          >
            Այո, ջնջել
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    show: { type: Boolean, default: false },
    permission: { type: Object, default: null },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease-out;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
