<template>
  <main
    class="flex flex-row flex-wrap items-start justify-start p-4 md:ml-64 h-auto pt-20"
  >
    <div v-for="order in orders" :key="order.id" class="m-3">
      <div
        class="border-2 border-dashed bg-neutral-700 border-neutral-700 text-white rounded-lg p-4 dark:border-gray-600 h-32 md:h-64 cursor-pointer"
      >
        <p v-if="order.created_at">
          <span class="font-bold">Start:</span> {{ order.created_at }}
          <span class="font-bold">Finish:</span> {{ order.dates.finish_date }}
        </p>
        <div @click="updateOrder(order)">
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
    <!-- Main modal -->
    <div
      v-if="isModal"
      class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full"
    >
      <div class="relative mx-auto p-4 w-full max-w-2xl h-full md:h-auto">
        <!-- Modal content -->
        <div
          class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5"
        >
          <!-- Modal header -->
          <div
            class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Add Product
            </h3>
            <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              @click="closeModal"
            >
              <svg
                aria-hidden="true"
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <!-- Modal body -->
          <div class="grid gap-4 mb-4 sm:grid-cols-2">
            <div>
              <input-with-label-icon v-model="selectedOrder.status" />
            </div>
            <div>
              <input-with-label-icon
                v-model="selectedOrder.created_at"
                disabled
              />
            </div>
            <div>
              <input-with-label-icon
                v-model="selectedOrder.finish_date"
                type="date"
              />
            </div>
            <div>
              <input-with-label-icon v-model="selectedOrder.name" type="text" />
            </div>
            <div>
              <input-with-label-icon
                v-model="selectedOrder.quantity"
                type="number"
              />
            </div>
            <div class="sm:col-span-2">
              <textarea-with-label v-model="selectedOrder.description" />
            </div>
          </div>
          <button
            class="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            @click="doneOrder(selectedOrder.id)"
          >
            <svg
              class="mr-1 -ml-1 w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Done
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'

export default {
  components: { TextareaWithLabel, InputWithLabelIcon },
  layout: 'FactoryLayout',
  middleware: 'roleRedirect',
  data() {
    return {
      isModal: false,
      selectedOrder: {},
    }
  },
  computed: {
    ...mapGetters('factory', ['getOrderByFactories']),
    orders() {
      return this.getOrderByFactories
    },
  },
  mounted() {
    this.fetchOrdersByFactory(3)
  },
  methods: {
    ...mapActions('factory', ['fetchOrdersByFactory', 'doneFinishedOrder']),
    updateOrder(order) {
      this.isModal = true
      this.selectedOrder.status = order.status.status
      this.selectedOrder.created_at = order.created_at
      this.selectedOrder.finish_date = order.dates.finish_date
      this.selectedOrder.name = order.details[0].name
      this.selectedOrder.quantity = order.details[0].quantity
      this.selectedOrder.description = order.details[0].description
    },
    closeModal() {
      this.isModal = false
    },
    doneOrder() {
      const updatedOrder = {
        ...this.selectedOrder,
        status: 'finished',
      }

      this.doneFinishedOrder(updatedOrder)
    },
  },
}
</script>

<style scoped></style>
