<template>
  <div class="items-center w-full md:inset-0">
    <div class="w-full">
      <h2 class="text-center text-neutral-400 text-xl my-4">Details</h2>
      <slot name="detailsType"></slot>
      <slot name="detailsQuantity"></slot>
      <slot name="detailsDesc"></slot>
      <slot name="link"></slot>
    </div>
    <button
      class="py-1.5 px-10 bg-green-400 rounded-2xl text-white font-bold font-sans italic"
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
