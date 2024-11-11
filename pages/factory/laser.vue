<template>
  <main class="min-h-screen">
    <template v-if="getOrderByFactories && !isModal">
      <header-component class="ml-auto bg-gray-900">
        <template #searchInput>
          <input-with-label-icon
            v-model="searchable"
            type="text"
            label="Search"
            class="ml-24"
            label_class="text-gray-50"
          >
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
      <!--      table-->
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg ml-20 mt-36">
        <table
          class="w-full text-sm bg-amber-50 border-b-gray-500 text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead
            class="text-xs text-gray-700 bg-gray-300 uppercase dark:text-gray-400"
          >
            <tr class="border-b-neutral-700">
              <th scope="col" class="px-3 py-3">Id</th>
              <th scope="col" class="px-3 py-3">Start Date</th>
              <th scope="col" class="px-3 py-3">Finish Date</th>
              <th scope="col" class="px-3 py-3">Order number</th>
              <th scope="col" class="px-3 py-3">Prefix code</th>
              <th scope="col" class="px-3 py-3">Description</th>
              <th scope="col" class="px-3 py-3 text-center">Status</th>
              <th scope="col" class="px-3 py-3">Storage link</th>
              <th scope="col" class="px-3 py-3"></th>
              <th scope="col" class="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody
            v-for="(order, index) in searchFilter"
            :key="index"
            class="bg-amber-50"
          >
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th
                v-if="order.id"
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800"
              >
                {{ order.id }}
              </th>
              <td v-if="order.created_at" class="px-6 py-4">
                {{ order.created_at }}
              </td>
              <td class="px-6 py-4">
                {{ order.dates.finish_date ? order.dates.finish_date : 'null' }}
              </td>
              <td v-if="order.order_number" class="px-6 py-4">
                {{ order.order_number.number }}
              </td>
              <td v-if="order.prefix_code" class="px-6 py-4">
                {{ order.prefix_code.code }}
              </td>
              <td
                v-if="order.description"
                class="px-6 py-4 cursor-pointer relative"
                @click="toggleDetails(order.id)"
              >
                Description
                <template v-if="isOpenDetails(order.id)">
                  <ul
                    class="absolute top-10 right-0 border-neutral-400 shadow-neutral-700 bg-neutral-400 rounded-2xl p-4"
                  >
                    <li>Name: {{ order.name }}</li>
                    <li>Quantity: {{ order.quantity }}</li>
                    <li>Description: {{ order.description }}</li>
                  </ul>
                </template>
              </td>
              <td
                v-if="order.factory_order_statuses"
                class="flex items-center justify-center text-center"
              >
                <div
                  v-for="item in order.factory_order_statuses"
                  :key="item.id"
                  class="px-6 py-4 text-center"
                >
                  <div v-if="item.factory_id === 3" class="text-center">
                    {{ item.status }}
                  </div>
                </div>
              </td>
              <td v-if="order.store_link" class="px-6">
                <a class="hover:!text-blue-700" :href="order.store_link.url"
                  >Link</a
                >
              </td>
              <td
                class="px-12 text-indigo-500 border-indigo-500 hover:bg-indigo-500 hover:text-indigo-50 cursor-pointer"
                @click="updateOrder(order)"
              >
                Update
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="grid grid-cols-3 gap-4 pt-20 p-4">
        <div class="flex flex-col items-center justify-start">
          <h2 class="text-2xl text-white font-bold italic text-center">
            In process
          </h2>
          <div v-for="order in inProcess" :key="order.id" class="m-3">
            <OrderCard :order="order" :update-order="updateOrder" />
          </div>
        </div>

        <div class="flex flex-col items-center justify-items-start">
          <h2 class="text-2xl text-white font-bold italic text-center">
            Waiting
          </h2>
          <div v-for="order in waiting" :key="order.id" class="m-3">
            <OrderCard :order="order" :update-order="updateOrder" />
          </div>
        </div>

        <div class="flex flex-col items-center justify-items-start">
          <h2 class="text-2xl text-white font-bold italic text-center">
            Finished
          </h2>
          <div v-for="order in finished" :key="order.id" class="m-3">
            <OrderCard :order="order" :update-order="updateOrder" />
          </div>
        </div>
      </div>
    </template>

    <!-- Main modal -->
    <div
      v-if="isModal"
      class="overflow-y-auto overflow-x-hidden fixed top-40 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-modal md:h-full"
    >
      <div class="p-4 w-full mx-auto max-w-2xl h-full md:h-auto">
        <!-- Modal content -->
        <div
          class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5"
        >
          <!-- Modal header -->
          <div
            class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Update order
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
          <div class="grid mb-4 sm:grid-cols-2 w-full">
            <div>
              <select-with-label
                v-model="selectedOption"
                :dates="status"
                label="Ընտրել կարգավիճակը"
              ></select-with-label>
            </div>
            <div class="sm:col-span-2">
              <textarea-with-label
                v-model="selectedOrder.factory_order_statuses.description"
                placeholder="Description"
                class="w-full my-2 p-3 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
              ></textarea-with-label>
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
    <notifications />
  </main>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import HeaderComponent from '~/components/header/HeaderComponent.vue'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
import OrderCard from '~/components/card/OrderCard.vue'

export default {
  components: {
    OrderCard,
    InputWithLabelIcon,
    HeaderComponent,
    SelectWithLabel,
    TextareaWithLabel,
  },
  layout: 'FactoryLayout',
  middleware: 'laser',
  data() {
    return {
      searchable: '',
      isModal: false,
      selectedOrder: {},
      selectedOption: null,
      selectedOrderId: null,
      status: [
        { id: 1, name: 'in process', value: 'In process' },
        { id: 2, name: 'waiting', value: 'Waiting' },
        { id: 2, name: 'finished', value: 'Finished' },
      ],
    }
  },
  computed: {
    ...mapGetters('factory', ['getOrderByFactories']),
    inProcess() {
      return this.filterOrdersByStatus('in process')
    },

    waiting() {
      return this.filterOrdersByStatus('waiting')
    },

    finished() {
      return this.filterOrdersByStatus('finished')
    },

    searchFilter() {
      const searchTerm = this.searchable.trim().toLowerCase()
      if (searchTerm === '') {
        return this.getOrderByFactories
      }
      return this.getOrderByFactories.filter((order) => {
        const orderNumber =
          order.order_number && typeof order.order_number.number === 'string'
            ? order.order_number.number.toLowerCase()
            : ''
        const name =
          order.name && order.name.length > 0 && typeof order.name === 'string'
            ? order.name.toLowerCase()
            : ''
        const description =
          order.description &&
          order.description.length > 0 &&
          typeof order.description === 'string'
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
  mounted() {
    this.fetchOrdersByFactory(3)
  },
  methods: {
    ...mapActions('factory', ['fetchOrdersByFactory', 'doneFinishedOrder']),
    filterOrdersByStatus(status) {
      if (!this.getOrderByFactories) {
        return null
      }

      return this.getOrderByFactories.filter((order) => {
        return (
          order.factory_order_statuses &&
          order.factory_order_statuses.some(
            (factoryStatus) => factoryStatus.status === status
          )
        )
      })
    },

    updateOrder(order) {
      this.isModal = true
      this.selectedOrder.id = order.id
      this.selectedOrder.status = order.status.status
      this.selectedOrder.created_at = order.created_at
      this.selectedOrder.finish_date = order.dates.finish_date
      if (order.factory_order_statuses) {
        this.selectedOrder.factory_order_statuses = {
          status: order.factory_order_statuses.status,
          description: order.factory_order_statuses.description || '',
        }
      } else {
        this.selectedOrder.factory_order_statuses = {
          status: '',
          description: '',
        }
      }
      this.selectedOrder.name = order.name
      this.selectedOrder.quantity = order.quantity
      this.selectedOrder.description = order.description
    },
    closeModal() {
      this.isModal = false
    },
    async doneOrder() {
      const updatedOrder = {
        ...this.selectedOrder,
        id: this.selectedOrder.id,
        factory_order_statuses: {
          status: this.selectedOption.name,
          description: this.selectedOrder.factory_order_statuses.description,
        },
        factory_id: 3,
      }

      if (
        this.selectedOption &&
        this.selectedOption.name &&
        this.selectedOrder.status !== 'finished'
      ) {
        await this.doneFinishedOrder(updatedOrder)
        await this.closeModal()
        await this.fetchOrdersByFactory(3)
        await this.$notify({
          text: `Product status updated successfully.`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'success',
        })
      } else {
        this.$notify({
          text: `Product status is already finished.`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'info',
        })
        this.closeModal()
      }
    },
    toggleDetails(orderId) {
      if (this.selectedOrderId === orderId) {
        this.selectedOrderId = null
      } else {
        this.selectedOrderId = orderId
      }
    },
    isOpenDetails(orderId) {
      return this.selectedOrderId === orderId
    },
  },
}
</script>

<style scoped></style>
