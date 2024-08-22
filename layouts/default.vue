<template>
  <div>
    <header>
      <HeaderLayout />
    </header>
    <main>
      <Nuxt />
    </main>
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
