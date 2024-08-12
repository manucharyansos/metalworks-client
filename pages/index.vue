<template>
  <div>
    <p>input + {{search}}</p>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'IndexPage',
  // middleware: 'auth',
  data () {
    return {
      search: ""
    }
  },
  mounted() {
    this.fetchServices()
  },
  methods: {
    ...mapActions("services", ["fetchServices"]),
  }
}
</script>
