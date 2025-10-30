<template>
  <div
    v-if="item"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
  >
    <div class="bg-white p-6 rounded-lg w-full max-w-sm">
      <p class="mb-4 text-gray-800">Հաստատե՞լ ջնջումը</p>
      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 border rounded-lg" @click="$emit('close')">
          Չեղարկել
        </button>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded-lg"
          @click="$emit('confirm')"
        >
          {{ submitting ? 'Կատարվում է...' : 'Ջնջել' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: Object,
    submitting: Boolean,
  },
}
</script>
