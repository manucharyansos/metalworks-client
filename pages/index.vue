<template>
  <div>
    <home-component/>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import HomeComponent from '~/components/home/index.vue'
export default {
  name: 'IndexPage',
  components: { HomeComponent },
  auth: 'guest',
  // middleware: 'auth',
  data () {
    return {
      search: ""
    }
  },
  mounted() {
    // this.fetchServices()
  },
  methods: {
    ...mapActions("services", ["fetchServices"]),
  }
}
</script>
