<template>
  <div class="confirmation-page container mx-auto px-4 py-8 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Շնորհակալություն Ձեր պատվերի համար</h1>
    <p class="text-lg mb-4">Ձեր պատվերը (#{{ purchaseId }}) հաջողությամբ տեղադրվել է:</p>
    <p class="text-gray-600 mb-6">Մանրամասները կուղարկվեն Ձեր էլ. փոստին:</p>
    <router-link to="/" class="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
      Շարունակել գնումները
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    purchaseId: {
      type: [Number, String],
      required: true,
    },
  },
}
</script>

<style scoped>
.confirmation-page {
  max-width: 1200px;
}
</style>
