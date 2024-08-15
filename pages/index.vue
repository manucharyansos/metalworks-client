<template>
  <div>

  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'IndexPage',
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
