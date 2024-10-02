<template>
  <div
    class="page flex mt-20 flex-col items-center justify-center bg-white dark:bg-gray-800"
  >
    <div class="flex flex-row items-center justify-center">
      <div v-if="getOrder && getFactory">
        <div class="h-26 my-3">
          <stepper-component :data-stepper="stepperData" />
        </div>

        <div>
          <div class="grid gap-4 mb-4 sm:grid-cols-2">
            <div v-if="getOrder.created_at">
              <label
                for="start"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Start</label
              >
              <input
                id="start"
                v-model="getOrder.created_at"
                disabled
                type="text"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              />
            </div>
            <div>
              <label
                for="finish"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Finish</label
              >
              <input
                id="finish"
                v-model="finishData"
                type="date"
                name="name"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              />
            </div>
            <div>
              <label
                for="number"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Number</label
              >
              <input
                v-if="getOrder.order_number"
                id="number"
                v-model="getOrder.order_number.number"
                disabled
                type="text"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
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
                id="status"
                v-model="getOrder.status.status"
                type="text"
                name="status"
                class="bg-yellow-400 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              />
            </div>
            <div>
              <div
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Factory
              </div>
              <template v-if="getOrder.factories">
                <div
                  v-for="actualFactory in getOrder.factories"
                  :key="actualFactory.id"
                  class="flex flex-row items-center justify-center"
                >
                  {{ actualFactory.name }}
                </div>
              </template>
              <div
                v-for="manyFactory in factories"
                :key="manyFactory.id"
                class="flex flex-row justify-between items-center"
              >
                <label :for="'factory-' + manyFactory.id">{{
                  manyFactory.name
                }}</label>
                <input
                  :id="'factory-' + manyFactory.id"
                  v-model="selectedFactories"
                  type="checkbox"
                  :value="manyFactory.id"
                  class="rounded-md w-6 h-6 border-2"
                  @change="add(manyFactory)"
                />
              </div>
            </div>
          </div>
          <div
            v-for="detail in getOrder.details"
            :key="detail.id"
            class="grid gap-6 mb-4 sm:grid-cols-2"
          >
            <label
              for="name"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Name</label
            >
            <input
              id="name"
              v-model="detail.name"
              type="text"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            />
            <label
              for="quantity"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Quantity</label
            >
            <input
              id="quantity"
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
              @click="doneOrder"
            >
              Done
            </button>
            <button
              type="button"
              class="text-red-600 inline-flex items-center hover:text-white border border-red-600 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
              @click="deleteOrder(order.id)"
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

          <notifications />
        </div>
      </div>
      <template v-else>
        <div class="flex items-center justify-center">
          <spinner-component />
        </div>
      </template>
<!--      Factory order status-->
      <div >

      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import StepperComponent from '@/components/stepper'
import SpinnerComponent from '~/components/spinner/index.vue'

export default {
  components: { StepperComponent, SpinnerComponent },
  layout: 'adminLayout',
  middleware: 'admin',
  data() {
    return {
      stepperData: [],
      selectedFactories: [],
      finishData: [],
      orderData: {
        type: '',
        details: [
          {
            description: '',
            quantity: '',
            type: '',
          },
        ],
        store_link: {
          url: '',
        },
        status_id: null,
      },
    }
  },
  computed: {
    ...mapGetters('orders', ['order', 'errorMessage']),
    ...mapGetters('factory', ['getFactory']),
    getOrder() {
      return this.order ? JSON.parse(JSON.stringify(this.order)) : {}
    },
    factories() {
      return this.getFactory ? JSON.parse(JSON.stringify(this.getFactory)) : []
    },
  },
  watch: {
    stepperData(value) {},
  },
  mounted() {
    this.fetchOrder(this.id)
    this.fetchFactory()
  },
  created() {
    this.id = this.$route.params.id
  },
  methods: {
    ...mapActions('orders', ['fetchOrder', 'updateOrder', 'orderDelete']),
    ...mapActions('factory', ['fetchFactory']),
    add(value) {
      const exists = this.stepperData.some((i) => i.id === value.id)

      if (!exists) {
        this.stepperData.push({ id: value.id, name: value.name })
      } else {
        this.stepperData = this.stepperData.filter((i) => i.id !== value.id)
      }
    },
    async doneOrder() {
      const formattedFactories = this.selectedFactories.map((id) => ({ id }))
      const updatedOrder = {
        ...this.getOrder,
        status: 'in process',
        factories: formattedFactories,
        finish_date: this.finishData,
      }
      const res = await this.updateOrder(updatedOrder)
      if (res) {
        this.$notify({
          text: `Product updated successfully`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'success',
        })
      } else {
        const error = this.errorMessage
        this.$notify({
          text: error.message,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
      }
    },
    async deleteOrder(id) {
      try {
        const res = await this.orderDelete(id)
        if (res) {
          this.$notify({
            text: `Product updated successfully`,
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'success',
          })
        }
      } catch (err) {
        const error = this.errorMessage
        this.$notify({
          text: error.message,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'success',
        })
        return false
      }
    },
  },
}
</script>
