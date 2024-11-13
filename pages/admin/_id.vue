<template>
  <div
    class="flex flex-col overflow-y-auto items-center justify-center bg-gray-50 dark:bg-gray-800"
  >
    <header-component class="bg-gray-900" />
    <div class="w-full p-16 rounded-lg shadow-md dark:bg-gray-900">
      <div v-if="getOrder && getFactory">
        <!-- Stepper Component -->
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
                @change="addFactory(manyFactory)"
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

            <!-- Ֆայլերի ցուցադրում -->
            <div v-if="getOrder.files && getOrder.files.length">
              <h3
                class="mt-4 text-sm font-medium text-gray-900 dark:text-white"
              >
                Uploaded Files:
              </h3>
              <ul class="list-disc list-inside mt-2">
                <li
                  v-for="(file, index) in getOrder.files"
                  :key="index"
                  class="flex items-center justify-between"
                >
                  <a :href="getFileUrl(file.path)" target="_blank">
                    {{ file.name || 'Download File' }}
                  </a>
                  <button
                    type="button"
                    class="ml-2 text-red-600 hover:text-red-800"
                    aria-label="Delete File"
                    @click="deleteFile(index)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M10 9a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2zm-7-7a1 1 0 011-1h12a1 1 0 011 1v1H3V6zm1 2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V10a2 2 0 012-2zm1 2v10h12V10H5z"
                      />
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
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
  middleware: ['admin', 'roleRedirect'],
  data() {
    return {
      stepperData: [],
      selectedFactories: [],
    }
  },
  computed: {
    ...mapGetters('orders', ['order', 'errorMessage']),
    ...mapGetters('factory', ['getFactory']),
    getOrder() {
      return this.order ? JSON.parse(JSON.stringify(this.order)) : {}
      // order.dates = order.dates || { finish_date: null }
      // return order
    },
    factories() {
      return this.getFactory ? JSON.parse(JSON.stringify(this.getFactory)) : []
    },
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
    getFileUrl(filePath) {
      return `${'https://api.metalworks.am'}/storage/${filePath}`
    },
    deleteFile(index) {
      this.getOrder.files.splice(index, 1)
      this.fetchOrder(this.id)
      this.$notify({
        text: 'File deleted successfully',
        duration: 3000,
        speed: 1000,
        position: 'top',
        type: 'success',
      })
    },
    addFactory(value) {
      const factoryId = value.id
      const exists = this.stepperData.some((item) => item.id === factoryId)

      if (exists) {
        this.stepperData = this.stepperData.filter(
          (item) => item.id !== factoryId
        )
      } else {
        this.stepperData.push(value)
      }
    },

    getFormDataEntries(formData) {
      const entries = {}
      for (const [key, value] of formData.entries()) {
        if (entries[key]) {
          if (Array.isArray(entries[key])) {
            entries[key].push(value)
          } else {
            entries[key] = [entries[key], value]
          }
        } else {
          entries[key] = value
        }
      }
      return entries
    },
    async doneOrder() {
      try {
        const formData = new FormData()
        if (this.getOrder.files && Array.isArray(this.getOrder.files)) {
          this.getOrder.files.forEach((file) => {
            if (file instanceof File) {
              formData.append('files[]', file)
            }
          })
        }
        formData.append('description', this.getOrder.description || '')
        formData.append('quantity', this.getOrder.quantity || '')
        formData.append('name', this.getOrder.name || '')
        formData.append('status', this.getOrder.status || 'in process')
        if (this.getOrder.store_link && this.getOrder.store_link.url) {
          formData.append('store_link[url]', this.getOrder.store_link.url)
        }
        if (this.selectedFactories.length) {
          this.selectedFactories.forEach((factoryId, index) => {
            formData.append(`factories[${index}][id]`, factoryId)
          })
        }
        if (this.getOrder.dates && this.getOrder.dates.finish_date) {
          formData.append('finish_date', this.getOrder.dates.finish_date)
        }
        await this.updateOrder({ id: this.id, payload: formData })
        this.$notify({ type: 'success', title: 'Order updated successfully' })
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Error updating order',
          text: error.response?.data?.message || error.message,
        })
      }
    },

    async deleteOrder(id) {
      try {
        await this.orderDelete(id)
        this.$notify({ type: 'success', title: 'Order deleted successfully' })
        await this.$router.push('/admin/orders')
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Error deleting order',
          text: error.message,
        })
      }
    },
  },
}
</script>
