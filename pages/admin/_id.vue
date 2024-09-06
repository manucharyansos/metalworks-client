<template>
  <div
    class="page flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-800"
  >
    <div>
      <div class="grid gap-4 mb-4 sm:grid-cols-2">
        <div>
          <label
            for="name"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Start</label
          >
          <input
            id="name"
            v-model="getOrder.created_at"
            disabled
            type="text"
            name="name"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          />
        </div>
        <div>
          <label
            for="brand"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Number</label
          >
          <input
            v-if="getOrder.order_number"
            id="brand"
            v-model="getOrder.order_number.number"
            type="text"
            name="brand"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            placeholder="Ex. Apple"
          />
        </div>
        <div>
          <label
            for="status"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Status</label
          >
          <input
            v-if="getOrder.status"
            id="price"
            v-model="getOrder.status.status"
            type="text"
            name="status"
            class="bg-yellow-400 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          />
        </div>
        <div>
          <label
            for="category"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Category</label
          >
          <select
            id="category"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          >
            <option selected="">Factory</option>
            <option
              v-for="factor in factory"
              :key="factor.id"
              :value="factor.value"
            >
              {{ factor.name }}
            </option>
          </select>
        </div>
      </div>
      <div
        v-for="detail in getOrder.details"
        :key="detail.id"
        class="grid gap-6 mb-4 sm:grid-cols-2"
      >
        <label
          for="price"
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >Type</label
        >
        <input
          id="price"
          v-model="detail.type"
          type="text"
          name="price"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        />
        <label
          for="quantity"
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >Quantity</label
        >
        <input
          id="price"
          v-model="detail.quantity"
          type="text"
          name="quantity"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        />

        <div class="sm:col-span-4">
          <label
            for="description"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Description</label
          >
          <textarea
            id="description"
            v-model="detail.description"
            rows="5"
            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          ></textarea>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <button
          type="submit"
          class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        >
          Update product
        </button>
        <button
          type="button"
          class="text-red-600 inline-flex items-center hover:text-white border border-red-600 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
        >
          <svg
            class="mr-1 -ml-1 w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd"
            ></path>
          </svg>
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  data() {
    return {
      factory: [
        { id: 1, name: 'Laser', value: 'laser' },
        { id: 2, name: 'Bend', value: 'bend' },
        { id: 3, name: 'Powder cutting', value: 'powder_cutting' },
      ],
    }
  },
  computed: {
    ...mapGetters('orders', ['order']),
    getOrder() {
      return this.order
    },
  },
  created() {
    this.id = this.$route.params.id
    this.fetchOrder(this.id)
  },
  methods: {
    ...mapActions('orders', ['fetchOrder']),
  },
}
</script>
