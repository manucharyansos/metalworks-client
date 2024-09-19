<template>
  <main
    class="flex flex-row flex-wrap items-center justify-center p-4 md:ml-64 h-auto pt-20"
  >
    <header-component class="ml-auto">
      <template #searchInput>
        <input-with-label-icon v-model="searchable" type="text" label="Search">
          <template #label_svg>
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </template>
        </input-with-label-icon>
      </template>
    </header-component>
    <template v-if="searchFilter">
      <div
        v-for="(order, index) in searchFilter"
        :key="index"
        class="m-3 flex items-start justify-between flex-wrap"
      >
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-4 dark:border-gray-600 h-32 md:h-64 cursor-pointer"
        >
          <p v-if="order.created_at">
            <span class="font-bold">Start:</span> {{ order.created_at }}
          </p>
          <div @click="editOrder(order)">
            <div>
              <div>
                <p v-if="order.status.status === 'in_process'">
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
              <div
                v-for="detail in order.details"
                :key="detail.id"
                class="flex flex-col items-start justify-start"
              >
                <span class="font-bold">Description</span>
                <p>Name: {{ detail.name }}</p>
                <p>Quantity: {{ detail.quantity }}</p>
                <p class="will-change-auto">
                  Details: {{ detail.description }}
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
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
import HeaderComponent from '~/components/header/HeaderComponent.vue'

export default {
  name: 'AdminPage',
  components: { HeaderComponent, InputWithLabelIcon },
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
        const detailsName =
          order.details &&
          order.details.length > 0 &&
          typeof order.details[0].name === 'string'
            ? order.details[0].name.toLowerCase()
            : ''
        const descriptionName =
          order.details &&
          order.details.length > 0 &&
          typeof order.details[0].description === 'string'
            ? order.details[0].description.toLowerCase()
            : ''
        return (
          orderNumber.includes(searchTerm) ||
          descriptionName.includes(searchTerm) ||
          detailsName.includes(searchTerm)
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
