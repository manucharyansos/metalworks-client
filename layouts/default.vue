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
import FooterComponent from '~/components/footer/FooterComponent.vue'
export default {
  components: {
    FooterComponent,
    HeaderLayout
  },
}
</script>

<style scoped></style>
