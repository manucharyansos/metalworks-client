<template>
  <main class="flex flex-row flex-wrap p-4 h-auto pt-20">
    <template v-if="searchFilter">
      <div
        v-for="(order, index) in searchFilter"
        :key="index"
        class="m-3 flex items-start justify-between flex-wrap"
      >
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-4 dark:border-gray-600 h-64 cursor-pointer"
        >
          <p v-if="order.created_at">
            <span class="font-bold">Start:</span> {{ order.created_at }}
          </p>
          <div @click="editOrder(order)">
            <div>
              <div>
                <p v-if="order.status.status === 'in process'">
                  <span class="font-bold">Status:</span>
                  <span class="bg-blue-700 font-sans italic"
                    >{{ order.status.status }}
                  </span>
                </p>
                <p v-if="order.status.status === 'waiting'">
                  <span class="font-bold">Status:</span>
                  <span class="bg-yellow-700 font-sans italic">
                    {{ order.status.status }}</span
                  >
                </p>
              </div>
              <div class="flex flex-col items-start justify-start">
                <span class="font-bold">Մանրամասներ</span>
                <p>Անուն: {{ order.name }}</p>
                <p>Քանակ: {{ order.quantity }}</p>
                <p class="will-change-auto">
                  Նկարագրություն: {{ order.description }}
                </p>
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
    </template>
  </main>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'AdminPage',
  layout: 'AdminLayout',
  middleware: ['admin', 'roleRedirect'],
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
        const name =
          order.name && typeof order.name === 'string'
            ? order.name.toLowerCase()
            : ''
        const description =
          order.details && typeof order.description === 'string'
            ? order.description.toLowerCase()
            : ''
        const prefixCode =
          order.prefix_code && typeof order.prefix_code.code === 'string'
            ? order.prefix_code.code.toLowerCase()
            : ''
        return (
          orderNumber.includes(searchTerm) ||
          description.includes(searchTerm) ||
          name.includes(searchTerm) ||
          prefixCode.includes(searchTerm)
        )
      })
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
