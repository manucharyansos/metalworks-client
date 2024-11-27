<template>
  <div class="p-0 m-0">
    <home-component />
  </div>
</template>

<script>
import HomeComponent from '~/components/home/index.vue'
export default {
  name: 'IndexPage',
  components: { HomeComponent },
  middleware: ['guest'],
}
</script>
