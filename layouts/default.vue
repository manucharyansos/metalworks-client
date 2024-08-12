<template>
  <div>
    <header>
      <HeaderLayout />
    </header>
    <main class="bg-white dark:bg-gray-700 h-screen flex items-center justify-center">
      <Nuxt/>
    </main>
  </div>
</template>

<script>
import HeaderLayout from "~/components/layouts/Header-layout.vue";
export default {
  components: {
    HeaderLayout,
  }
}
</script>

<style scoped>

</style>
