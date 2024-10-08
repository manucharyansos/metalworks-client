<template>
  <div>
    <header>
      <HeaderLayout />
    </header>
    <main>
      <Nuxt />
    </main>

    <footer>
      <footer-component />
    </footer>
  </div>
</template>

<script>
import HeaderLayout from '~/components/layouts/Header-layout.vue'
export default {
  components: {
    HeaderLayout,
  },
}
</script>

<style scoped></style>
