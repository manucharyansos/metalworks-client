<template>
  <div
    class="relative grid grid-cols-2 md:grid-cols-1 bg-white md:min-h-80 h-full w-96 m-4 rounded-lg shadow-md hover:shadow-xl hover:translate-y-2 transition-shadow duration-300 overflow-hidden"
  >
    <img
      :src="image"
      alt="service image"
      class="object-cover md:h-52 h-28 p-4 mx-auto items-center justify-center"
    />
    <div class="p-6 md:h-64 w-full">
      <div
        class="text-sm md:text-2xl font-sans italic md:mb-3 text-gray-800 text-center md:text-start m-2"
      >
        <slot name="title"></slot>
      </div>
      <div class="hidden md:flex text-gray-600 font-sans italic leading-relaxed">
        <slot name="description"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    image: {
      type: String,
      required: true,
    },
  },
}
</script>

<style scoped></style>
