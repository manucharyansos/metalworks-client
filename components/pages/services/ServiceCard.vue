<template>
  <div
    class="relative grid grid-cols-2 md:grid-cols-1 bg-white md:min-h-64 h-full rounded-lg shadow-md hover:shadow-xl hover:translate-y-2 transition-shadow duration-300 overflow-hidden w-full md:max-w-80 m-4"
  >
    <img
      :src="image"
      alt="service image"
      class="object-cover md:h-52 h-32 w-full p-4 mx-auto"
    />
    <div class="p-6">
      <h2
        class="text-base md:text-2xl font-sans italic md:mb-3 text-gray-800 text-center md:text-start m-2"
      >
        {{ title }}
      </h2>
      <p class="hidden md:flex text-gray-600 font-sans italic leading-relaxed">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
}
</script>

<style scoped></style>
