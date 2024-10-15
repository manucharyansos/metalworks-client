<template>
  <div
    class="flex flex-col overflow-y-auto items-center justify-center bg-gray-50 dark:bg-gray-800"
  >
    <header-component />
    <div class="w-full p-16 bg-white rounded-lg shadow-md dark:bg-gray-900">
      <div v-if="getOrder && getFactory">
        <div class="my-5">
          <stepper-component :data-stepper="stepperData" />
        </div>

        <div class="grid gap-6 sm:grid-cols-3 mb-6">
          <!-- Start Date -->
          <div v-if="getOrder.created_at">
            <label
              for="start"
              class="block text-sm font-medium text-gray-900 dark:text-white"
              >Start</label
            >
            <input
              id="start"
              v-model="getOrder.created_at"
              disabled
              type="text"
              class="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Finish Date -->
          <div>
            <label
              for="finish"
              class="block text-sm font-medium text-gray-900 dark:text-white"
              >Finish</label
            >
            <input
              id="finish"
              v-model="getOrder.dates.finish_date"
              type="date"
              class="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Order Number -->
          <div v-if="getOrder.order_number">
            <label
              for="number"
              class="block text-sm font-medium text-gray-900 dark:text-white"
              >Number</label
            >
            <input
              id="number"
              v-model="getOrder.order_number.number"
              disabled
              type="text"
              class="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Status -->
          <div>
            <label
              for="status"
              class="block text-sm font-medium text-gray-900 dark:text-white"
              >Status</label
            >
            <input
              id="status"
              v-model="getOrder.status"
              type="text"
              class="block w-full mt-1 rounded-md bg-yellow-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Factory Selection -->
          <div>
            <label
              class="block text-sm font-medium text-gray-900 dark:text-white"
              >Factory</label
            >
            <template v-if="getOrder.factories">
              <div
                v-for="actualFactory in getOrder.factories"
                :key="actualFactory.id"
                class="mt-2 text-gray-700 dark:text-gray-300"
              >
                {{ actualFactory.name }}
              </div>
            </template>
            <div
              v-for="manyFactory in factories"
              :key="manyFactory.id"
              class="flex justify-between items-center mt-2"
            >
              <label
                :for="'factory-' + manyFactory.id"
                class="text-sm text-gray-600 dark:text-gray-400"
                >{{ manyFactory.name }}</label
              >
              <input
                :id="'factory-' + manyFactory.id"
                v-model="selectedFactories"
                type="checkbox"
                :value="manyFactory.id"
                class="rounded-md border-gray-300 focus:ring-indigo-500 h-5 w-5 text-indigo-600"
                @change="add(manyFactory)"
              />
            </div>
          </div>

          <!-- Factory Order Status -->
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              Factory Status
            </p>
            <div
              v-for="factoriesStatus in getOrder.factory_order_statuses"
              :key="factoriesStatus.id"
              class="mt-2"
            >
              <div
                class="flex items-center justify-between space-x-2 text-gray-700 dark:text-gray-300"
              >
                <p>Factory: {{ factoriesStatus.factory.name }}</p>
                <p>Status: {{ factoriesStatus.status }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Details -->
        <div class="grid gap-6 sm:grid-cols-3 mb-6">
          <div>
            <label
              for="name"
              class="block text-sm font-medium text-gray-900 dark:text-white"
              >Name</label
            >
            <input
              id="name"
              v-model="getOrder.name"
              type="text"
              class="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label
              for="quantity"
              class="block text-sm font-medium text-gray-900 dark:text-white"
              >Quantity</label
            >
            <input
              id="quantity"
              v-model="getOrder.quantity"
              type="text"
              class="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label
              for="file"
              class="block text-sm font-medium text-gray-900 dark:text-white"
              >File</label
            >
            <input
              type="file"
              multiple
              class="block w-full mt-1"
              @change="handleFileUpload"
            />
          </div>

          <div class="sm:col-span-2">
            <label
              for="description"
              class="block text-sm font-medium text-gray-900 dark:text-white"
              >Description</label
            >
            <textarea
              id="description"
              v-model="getOrder.description"
              rows="4"
              class="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center space-x-4">
          <button
            type="button"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            @click="doneOrder"
          >
            Done
          </button>
          <button
            type="button"
            class="inline-flex justify-center py-2 px-4 border border-red-600 shadow-sm text-sm font-medium rounded-md text-red-600 hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            @click="deleteOrder(getOrder.id)"
          >
            Delete
          </button>
        </div>

        <notifications />
      </div>

      <template v-else>
        <div class="flex justify-center items-center">
          <spinner-component />
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import StepperComponent from '@/components/stepper'
import SpinnerComponent from '~/components/spinner/index.vue'
import HeaderComponent from '~/components/header/HeaderComponent.vue'

export default {
  components: { HeaderComponent, StepperComponent, SpinnerComponent },
  layout: 'adminLayout',
  middleware: 'admin',
  data() {
    return {
      stepperData: [],
      selectedFactories: [],
      statusesByFactories: [],
    }
  },
  computed: {
    ...mapGetters('orders', ['order', 'errorMessage']),
    ...mapGetters('factory', ['getFactory']),
    getOrder() {
      const order = this.order ? JSON.parse(JSON.stringify(this.order)) : {}
      order.dates = order.dates || { finish_date: null }
      return order
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
    handleFileUpload(event) {
      this.getOrder.files = Array.from(event.target.files)
    },
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

      const formData = new FormData()

      formData.append('id', this.getOrder.id)
      formData.append('description', this.getOrder.description)
      formData.append('quantity', this.getOrder.quantity)
      formData.append('name', this.getOrder.name)
      formData.append('status', 'in process')
      formData.append('finish_date', this.getOrder.dates?.finish_date)

      formattedFactories.forEach((factory, index) => {
        formData.append(`factories[${index}][id]`, factory.id)
      })

      if (this.getOrder.files) {
        this.getOrder.files.forEach((file, index) => {
          formData.append(`files[${index}]`, file)
        })
      }

      const currentDate = new Date()
      const finishDate = new Date(this.getOrder.dates?.finish_date)

      if (finishDate <= currentDate) {
        this.$notify({
          text: 'Finish date must be greater than the current date.',
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        return
      }

      const res = await this.updateOrder(formData)

      if (res) {
        this.$notify({
          text: 'Product updated successfully',
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
