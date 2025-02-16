<template>
  <div
    class="border-2 border-dashed bg-neutral-700 border-neutral-700 text-white rounded-lg p-4 dark:border-gray-600 h-32 md:h-64 cursor-pointer"
  >
    <p v-if="order.created_at">
      <span class="font-bold">Start:</span> {{ order.created_at }}
      <span class="font-bold">Finish:</span> {{ order.dates.finish_date }}
    </p>
    <div @click="updateOrder(order)">
      <div>
        <div v-for="status in statuses" :key="status.label">
          <div
            v-if="order.factory_order.status === status.value"
            class="flex flex-row items-start"
          >
            <span class="font-bold">Status:</span>
            <div :class="status.class" class="font-sans italic mx-2">
              {{ order.factory_order.status }}
            </div>
          </div>
        </div>
        <div class="flex flex-col items-start justify-start">
          <span class="font-bold">Description</span>
          <p>Name: {{ order.name }}</p>
          <p>Quantity: {{ order.quantity }}</p>
          <p>Description: {{ order.description }}</p>
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
    >
      Read more
    </a>
  </div>
</template>

<script>
export default {
  props: {
    order: Object,
    updateOrder: Function,
  },
  computed: {
    statuses() {
      return [
        { value: 'in process', class: 'bg-blue-700' },
        { value: 'waiting', class: 'bg-yellow-700' },
        { value: 'finished', class: 'bg-green-700' },
      ]
    },
  },
}
</script>

<style scoped>
/* Add any styles specific to this component here */
</style>
