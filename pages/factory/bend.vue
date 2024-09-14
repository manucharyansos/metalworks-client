<template>
  <main
    class="flex flex-row flex-wrap items-center justify-center p-4 md:ml-64 h-auto pt-20"
  >
    <div v-for="order in orders" :key="order.id" class="m-3">
      <div
        class="border-2 border-dashed bg-neutral-400 border-neutral-500 text-white rounded-lg p-4 dark:border-gray-600 h-32 md:h-64 cursor-pointer"
      >
        <p v-if="order.created_at">
          <span class="font-bold">Start:</span> {{ order.created_at }}
        </p>
        <div>
          <div>
            <div>
              <p
                v-if="order.status.status === 'in_process'"
              ><span class="font-bold">Status:</span> 
                <span class="bg-blue-700 font-sans italic">{{ order.status.status }} </span>
                
              </p>
              <p v-if="order.status.status === 'waiting'">
                <span class="font-bold">Status:</span> 
                <span class="bg-yellow-700 font-sans italic"> {{ order.status.status }}</span>
                
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
  layout: 'FactoryLayout',
  middleware: 'roleRedirect',
  computed: {
    ...mapGetters('factory', ['getOrderByFactories']),
    orders() {
      return this.getOrderByFactories
    },
  },
  mounted() {
    this.fetchOrdersByFactory(2)
  },
  methods: {
    ...mapActions('factory', ['fetchOrdersByFactory']),
  },
}
</script>

<style scoped></style>
