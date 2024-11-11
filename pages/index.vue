<template>
  <div class="p-0 m-0">
    <home-component />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import HomeComponent from '~/components/home/index.vue'
export default {
  name: 'IndexPage',
  components: { HomeComponent },
  auth: 'guest',
  middleware: 'auth',
  data() {
    return {
      search: '',
    }
  },
  computed: {
    ...mapGetters('services', ['getServices']),
    allServices() {
      return this.getServices
    },
  },
  mounted() {
    // this.fetchServices()
  },
  methods: {
    ...mapActions('services', ['fetchServices']),
  },
}
</script>
