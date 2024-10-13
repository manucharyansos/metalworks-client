<template>
  <div
    class="flex flex-col items-center w-full p-6 bg-white rounded-xl shadow-lg"
  >
    <h2 class="text-center text-neutral-700 text-2xl my-6 font-bold">
      Order Details
    </h2>

    <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div class="flex flex-col">
        <slot name="detailsType"></slot>
      </div>
      <div class="flex flex-col">
        <slot name="detailsQuantity"></slot>
      </div>
      <div class="flex flex-col">
        <slot name="link"></slot>
      </div>
      <div class="flex flex-col">
        <slot name="uploadFile"></slot>
      </div>
    </div>
    <div class="flex flex-col w-full">
      <slot name="detailsDesc"></slot>
    </div>

    <button
      class="mt-8 py-3 px-10 bg-green-500 rounded-full text-white font-semibold hover:bg-green-600 transition-transform transform hover:scale-105"
      @click="$emit('addButton')"
    >
      Add Order
    </button>
  </div>
</template>

<script>
export default {
  name: 'CreateOrder',
  props: {
    openModal: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
