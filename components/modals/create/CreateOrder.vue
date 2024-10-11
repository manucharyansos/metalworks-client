<template>
  <div
    class="flex flex-col items-center w-full p-4 bg-white rounded-lg shadow-md"
  >
    <h2 class="text-center text-neutral-600 text-xl my-4 font-semibold">
      Details
    </h2>

    <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col">
        <slot name="detailsType"></slot>
      </div>
      <div class="flex flex-col">
        <slot name="detailsQuantity"></slot>
      </div>
      <div class="flex flex-col">
        <slot name="detailsDesc"></slot>
      </div>
      <div class="flex flex-col">
        <slot name="link"></slot>
      </div>
      <div class="flex flex-col">
        <slot name="uploadFile"></slot>
      </div>
    </div>

    <button
      class="mt-6 py-2 px-8 bg-green-500 rounded-full text-white font-bold hover:bg-green-600 transition duration-200"
      @click="$emit('addButton')"
    >
      Add
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
