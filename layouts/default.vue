<template>
  <div>
    <!--    <header>-->
    <!--      <HeaderLayout />-->
    <!--    </header>-->
    <main>
      <Nuxt />
    </main>

    <footer>
      <footer-component />
    </footer>
  </div>
</template>

<script>
import FooterComponent from '~/components/footer/FooterComponent.vue'
export default {
  components: {
    FooterComponent,
  },
}
</script>

<style scoped></style>
