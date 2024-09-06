<template>
  <main
    class="flex flex-row flex-wrap items-center justify-center p-4 md:ml-64 h-auto pt-20"
  >
    <div v-for="order in allOrders" :key="order.id" class="m-3">
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-4 dark:border-gray-600 h-32 md:h-64 cursor-pointer"
      >
        <p><span class="font-bold">Start:</span> {{ order.created_at }}</p>
        <nuxt-link :to="`/admin/${order.id}`">
          <div>
            <div
              v-for="detail in order.details"
              :key="detail.id"
              class="flex flex-col items-center justify-center"
            >
              <span class="font-bold">Description</span>
              <p>Title: {{ detail.type }}</p>
              <p>Type: {{ detail.quantity }}</p>
              <p>Details: {{ detail.description }}</p>
            </div>
          </div>
        </nuxt-link>
        <p>
          <span class="font-bold">Order number:</span>
          {{ order.order_number.number }}
        </p>
        <a
          v-if="order.store_link"
          target="_blank"
          :href="order.store_link.url"
          class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >Read more</a
        >
      </div>
    </div>
  </main>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'AdminPage',
  layout: 'adminLayout',
  middleware: 'admin',
  data() {
    return {
      searchable: '',
    }
  },
  computed: {
    ...mapGetters('orders', ['orders']),
    allOrders() {
      return this.orders
    },
  },
  watch: {
    // searchable(val) {
    //   if (val.length > 2) {
    //     setTimeout(() => {
    //       this.isSearch = true
    //     }, 2000)
    //   } else {
    //     this.isSearch = false
    //   }
    // },
  },
  created() {
    this.fetchOrders()
    // console.log(this.searchFilter())
  },
  methods: {
    ...mapActions('orders', ['fetchOrders']),
    searchFilter() {
      if (this.searchable !== '') {
        return this.orders.filter(
          (order) =>
            order.order_number.includes(this.searchable) ||
            (order.description?.name &&
              order.description.name.includes(this.searchable))
        )
      }
      return this.orders
    },
  },
}
</script>
