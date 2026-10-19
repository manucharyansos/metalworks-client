<template>
  <div
    v-if="item"
    class="work-modal-backdrop fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
  >
    <div
      class="work-modal w-full max-w-sm p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Հաստատել ջնջումը"
      data-work-modal
    >
      <p class="mb-4 text-gray-800">Հաստատե՞լ ջնջումը</p>
      <div class="flex justify-end gap-3">
        <button class="work-button" @click="$emit('close')">Չեղարկել</button>
        <button
          class="work-button"
          data-variant="danger"
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
