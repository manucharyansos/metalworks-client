<template>
  <div class="bg-neutral-400 flex items-center justify-center w-full h-full">
    <template v-if="clients && clients.length > 0">
      <div class="grid grid-cols-2 gap-2 p-6 w-full h-full">
        <div class="mt-10 w-1/3 ml-auto mr-4">
          <select-with-label
            v-model="selectedOption"
            :dates="clients"
            label="Select Client"
          ></select-with-label>
        </div>
        <div class="w-3/4">
          <create-order @addButton="addTask">
            <template #detailsType>
              <input-with-labels
                v-model="order.details.name"
                type="text"
                placeholder="Name"
                classes=" my-2 w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              ></input-with-labels>
            </template>
            <template #detailsQuantity>
              <input-with-labels
                v-model="order.details.quantity"
                type="number"
                placeholder="Quantity"
                classes="border my-2 w-full border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              ></input-with-labels>
            </template>
            <template #link>
              <input-with-labels
                v-model="order.store_link.url"
                type="url"
                placeholder="Store link"
                classes="border my-2 w-full border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              ></input-with-labels>
            </template>
            <template #detailsDesc>
              <textarea-with-label
                v-model="order.details.description"
                placeholder="Description"
                class="w-full my-2 opacity-100"
              ></textarea-with-label>
            </template>
          </create-order>
        </div>
      </div>
    </template>
    <template v-else> <spinner-component /> </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import CreateOrder from '~/components/modals/create/CreateOrder.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import SpinnerComponent from '~/components/spinner/index.vue'

export default {
  components: {
    SpinnerComponent,
    SelectWithLabel,
    InputWithLabels,
    TextareaWithLabel,
    CreateOrder,
  },
  layout: 'creatorLayout',
  middleware: 'creator',
  data() {
    return {
      selectedOption: null,
      openTaskDrawer: false,
      openOrderDrawer: false,
      order: {
        user_id: '',
        order_number: '',
        details: [
          {
            description: '',
            quantity: '',
            name: '',
          },
        ],
        store_link: {
          url: 'http://localhost:3000',
        },
        status_id: null,
      },
      scrollX: 0,
      clientId: null,
    }
  },
  computed: {
    ...mapGetters('clients', ['allClients']),
    clients() {
      return this.allClients
    },
  },
  mounted() {
    this.fetchClients()
  },
  methods: {
    ...mapActions('orders', ['createOrder']),
    ...mapActions('clients', ['fetchClients']),
    async addTask() {
      if (this.selectedOption && this.selectedOption.id) {
        const orderData = {
          client_id: this.selectedOption.id,
          details: [
            {
              description: this.order.details.description,
              quantity: this.order.details.quantity,
              name: this.order.details.name,
            },
          ],
          store_link: {
            url: this.order.store_link.url,
          },
          status_id: this.order.status_id,
        }

        try {
          await this.createOrder(orderData)
        } catch (error) {
          console.error('Error creating order:', error.response.data)
        }
      }
    },
  },
}
</script>

<style scoped></style>
