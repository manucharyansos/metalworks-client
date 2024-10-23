<template>
  <div
    class="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden"
  >
    <img
      :src="image"
      alt="service image"
      class="w-full h-52 object-cover hover:scale-105 transition-transform duration-300 ease-in-out"
    />
    <div class="p-6">
      <h2 class="text-2xl font-semibold mb-3 text-gray-800">{{ title }}</h2>
      <p class="text-gray-600 leading-relaxed">{{ description }}</p>
    </div>
    <div
      class="absolute inset-0 bg-gradient-to-t from-gray-900 opacity-0 hover:opacity-50 transition-opacity duration-300 ease-in-out"
    ></div>
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
