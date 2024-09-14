<template>
  <main
    class="flex flex-row flex-wrap items-center justify-center p-4 md:ml-64 h-auto pt-20"
  >
    <input v-model="searchable" type="text" />
    <div v-for="order in searchFilter" :key="order.id" class="m-3">
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-4 dark:border-gray-600 h-32 md:h-64 cursor-pointer"
      >
        <p v-if="order.created_at">
          <span class="font-bold">Start:</span> {{ order.created_at }}
        </p>
        <div @click="editOrder(order)">
          <div>
            <div>
              <p
                v-if="order.status.status === 'in_process'"
                class="bg-blue-700"
              >
                <span class="font-sans font-bold italic">Status: </span>
                {{ order.status.status }}
              </p>
              <p v-if="order.status.status === 'waiting'" class="bg-yellow-700">
                <span class="font-sans font-bold italic">Status: </span>
                {{ order.status.status }}
              </p>
            </div>
            <div
              v-for="detail in order.details"
              :key="detail.id"
              class="flex flex-col items-start justify-start"
            >
              <span class="font-bold">Description</span>
              <p>Title: {{ detail.type }}</p>
              <p>Type: {{ detail.quantity }}</p>
              <p>Details: {{ detail.description }}</p>
            </div>
          </div>
        </div>
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
    searchFilter() {
      const searchTerm = this.searchable.trim().toLowerCase()
      if (searchTerm === '') {
        return this.allOrders
      }
      return this.allOrders.filter((order) => {
        const orderNumber =
          order.order_number && typeof order.order_number.number === 'string'
            ? order.order_number.number.toLowerCase()
            : ''
        const descriptionName =
          order.details &&
          order.details.length > 0 &&
          typeof order.details[0].description === 'string'
            ? order.details[0].description.toLowerCase()
            : ''
        return (
          orderNumber.includes(searchTerm) ||
          descriptionName.includes(searchTerm)
        )
      })
    },
  },
  watch: {
    searchable(val) {
      if (val.length > 2) {
        setTimeout(() => {
          this.isSearch = true
        }, 2000)
      } else {
        this.isSearch = false
      }
    },
  },
  created() {
    this.fetchOrders()
  },
  methods: {
    ...mapActions('orders', ['fetchOrders']),
    editOrder(order) {
      this.$router.push(`/admin/${order.id}`)
    },
  },
}
</script>
