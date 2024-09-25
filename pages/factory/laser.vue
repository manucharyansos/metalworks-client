<template>
  <main>
    <header-component class="ml-auto bg-transparent">
      <template #searchInput>
        <input-with-label-icon
          v-model="searchable"
          type="text"
          label="Search"
          class="ml-24"
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
    <template v-if="getOrderByFactories">
      <!--      table-->
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg ml-20 mt-36">
        <table
          class="w-full text-sm bg-amber-50 border-b-gray-500 text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <!--          <thead-->
          <!--            class="text-xs text-gray-700 bg-gray-300 uppercase dark:text-gray-400"-->
          <!--          >-->
          <!--            <tr class="border-b-neutral-700">-->
          <!--              <th scope="col" class="px-3 py-3">Id</th>-->
          <!--              <th scope="col" class="px-3 py-3">Start Date</th>-->
          <!--              <th scope="col" class="px-3 py-3">Finish Date</th>-->
          <!--              <th scope="col" class="px-3 py-3">Order number</th>-->
          <!--              <th scope="col" class="px-3 py-3">Prefix code</th>-->
          <!--              <th scope="col" class="px-3 py-3">Status</th>-->
          <!--              <th scope="col" class="px-3 py-3">Storage link</th>-->
          <!--              <th scope="col" class="px-3 py-3"></th>-->
          <!--              <th scope="col" class="px-3 py-3"></th>-->
          <!--            </tr>-->
          <!--          </thead>-->
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
              <td v-if="order.status" class="px-6 py-4">
                {{ order.status.status }}
              </td>
              <td
                v-if="order.factory_order_statuses"
                class="flex items-center justify-center"
              >
                <div
                  v-for="(item, index) in order.factory_order_statuses"
                  :key="index"
                  class="px-6 py-4"
                >
                  <template v-if="item.factory_id === 3">
                    {{ item.status }}</template
                  >
                </div>
              </td>
              <td v-if="order.store_link" class="px-12">
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
    </template>
    <div class="grid grid-cols-3 pt-20 p-4 md:ml-64">
      <div class="flex flex-col items-start justify-start">
        <h2 class="text-2xl text-white font-bold italic">In process</h2>
        <div v-for="order in inProcess" :key="order.id" class="m-3">
          <div v-if="order.status || order.status.status === 'waiting'">
            <div
              class="border-2 border-dashed bg-neutral-700 border-neutral-700 text-white rounded-lg p-4 dark:border-gray-600 h-32 md:h-64 cursor-pointer"
            >
              <p v-if="order.created_at">
                <span class="font-bold">Start:</span> {{ order.created_at }}
                <span class="font-bold">Finish:</span>
                {{ order.dates.finish_date }}
              </p>
              <div @click="updateOrder(order)">
                <div>
                  <div>
                    <div
                      v-if="order.status.status === 'in process'"
                      class="flex flex-row items-start"
                    >
                      <span class="font-bold">Status:</span>
                      <div class="bg-blue-700 font-sans italic mx-2">
                        {{ order.status.status }}
                      </div>
                    </div>
                    <div
                      v-if="order.status.status === 'waiting'"
                      class="flex flex-row items-start"
                    >
                      <span class="font-bold">Status:</span>
                      <div class="bg-yellow-700 font-sans italic mx-2">
                        {{ order.status.status }}
                      </div>
                    </div>
                    <div
                      v-if="order.status.status === 'finished'"
                      class="flex flex-row items-start"
                    >
                      <span class="font-bold">Status:</span>
                      <div class="bg-green-700 font-sans italic mx-2">
                        {{ order.status.status }}
                      </div>
                    </div>
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
        </div>
      </div>
      <div class="flex flex-col items-center justify-items-start">
        <h2 class="text-2xl text-white font-bold italic">Waiting</h2>
        <div v-for="order in waiting" :key="order.id" class="m-3">
          <div v-if="order.status || order.status.status === 'waiting'">
            <div
              class="border-2 border-dashed bg-neutral-700 border-neutral-700 text-white rounded-lg p-4 dark:border-gray-600 h-32 md:h-64 cursor-pointer"
            >
              <p v-if="order.created_at">
                <span class="font-bold">Start:</span> {{ order.created_at }}
                <span class="font-bold">Finish:</span>
                {{ order.dates.finish_date }}
              </p>
              <div @click="updateOrder(order)">
                <div>
                  <div>
                    <div
                      v-if="order.status.status === 'in process'"
                      class="flex flex-row items-start"
                    >
                      <span class="font-bold">Status:</span>
                      <div class="bg-blue-700 font-sans italic mx-2">
                        {{ order.status.status }}
                      </div>
                    </div>
                    <div
                      v-if="order.status.status === 'waiting'"
                      class="flex flex-row items-start"
                    >
                      <span class="font-bold">Status:</span>
                      <div class="bg-yellow-700 font-sans italic mx-2">
                        {{ order.status.status }}
                      </div>
                    </div>
                    <div
                      v-if="order.status.status === 'finished'"
                      class="flex flex-row items-start"
                    >
                      <span class="font-bold">Status:</span>
                      <div class="bg-green-700 font-sans italic mx-2">
                        {{ order.status.status }}
                      </div>
                    </div>
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
        </div>
      </div>
      <div class="flex flex-col items-center justify-items-start">
        <h2 class="text-2xl text-white font-bold italic">Finished</h2>
        <div v-for="order in finished" :key="order.id" class="m-3">
          <div v-if="order.status || order.status.status === 'waiting'">
            <div
              class="border-2 border-dashed bg-neutral-700 border-neutral-700 text-white rounded-lg p-4 dark:border-gray-600 h-32 md:h-64 cursor-pointer"
            >
              <p v-if="order.created_at">
                <span class="font-bold">Start:</span> {{ order.created_at }}
                <span class="font-bold">Finish:</span>
                {{ order.dates.finish_date }}
              </p>
              <div @click="updateOrder(order)">
                <div>
                  <div>
                    <div
                      v-if="order.status.status === 'in process'"
                      class="flex flex-row items-start"
                    >
                      <span class="font-bold">Status:</span>
                      <div class="bg-blue-700 font-sans italic mx-2">
                        {{ order.status.status }}
                      </div>
                    </div>
                    <div
                      v-if="order.status.status === 'waiting'"
                      class="flex flex-row items-start"
                    >
                      <span class="font-bold">Status:</span>
                      <div class="bg-yellow-700 font-sans italic mx-2">
                        {{ order.status.status }}
                      </div>
                    </div>
                    <div
                      v-if="order.status.status === 'finished'"
                      class="flex flex-row items-start"
                    >
                      <span class="font-bold">Status:</span>
                      <div class="bg-green-700 font-sans italic mx-2">
                        {{ order.status.status }}
                      </div>
                    </div>
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
        </div>
      </div>
      <!-- Main modal -->
      <div
        v-if="isModal"
        class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full"
      >
        <div
          class="flex items-center justify-center mx-auto p-4 w-full max-w-2xl h-full md:h-auto"
        >
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
            <div class="grid gap-4 mb-4 sm:grid-cols-2">
              <div>
                <select-with-label v-model="selectedOption" :dates="status" />
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
      <notifications />
    </div>
  </main>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import HeaderComponent from '~/components/header/HeaderComponent.vue'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'

export default {
  components: {
    InputWithLabelIcon,
    HeaderComponent,
    SelectWithLabel,
    TextareaWithLabel,
  },
  layout: 'FactoryLayout',
  middleware: 'roleRedirect',
  data() {
    return {
      searchable: '',
      isModal: false,
      selectedOrder: {},
      selectedOption: null,
      status: [
        { id: 1, name: 'in process', value: 'In process' },
        { id: 2, name: 'waiting', value: 'Waiting' },
        { id: 2, name: 'finished', value: 'Finished' },
      ],
    }
  },
  computed: {
    ...mapGetters('factory', ['getOrderByFactories']),
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
        const prefixCode =
          order.prefix_code && typeof order.prefix_code.code === 'string'
            ? order.prefix_code.code.toLowerCase()
            : ''
        return (
          orderNumber.includes(searchTerm) ||
          descriptionName.includes(searchTerm) ||
          detailsName.includes(searchTerm) ||
          prefixCode.includes(searchTerm)
        )
      })
    },
    inProcess() {
      if (!this.getOrderByFactories) {
        return null
      }

      return this.getOrderByFactories.filter((order) => {
        return (
          order.factory_order_statuses &&
          order.factory_order_statuses.some(
            (status) => status.status === 'in process'
          )
        )
      })
    },
    waiting() {
      if (!this.getOrderByFactories) {
        return null
      }

      return this.getOrderByFactories.filter((order) => {
        return (
          order.factory_order_statuses &&
          order.factory_order_statuses.some(
            (status) => status.status === 'waiting'
          )
        )
      })
    },
    finished() {
      if (!this.getOrderByFactories) {
        return null
      }

      return this.getOrderByFactories.filter((order) => {
        return (
          order.factory_order_statuses &&
          order.factory_order_statuses.some(
            (status) => status.status === 'finished'
          )
        )
      })
    },
  },
  mounted() {
    this.fetchOrdersByFactory(3)
  },
  methods: {
    ...mapActions('factory', ['fetchOrdersByFactory', 'doneFinishedOrder']),
    updateOrder(order) {
      this.isModal = true
      this.selectedOrder.id = order.id
      this.selectedOrder.status = order.status.status
      this.selectedOrder.created_at = order.created_at
      this.selectedOrder.finish_date = order.dates.finish_date
      this.selectedOrder.factory_order_statuses =
        order.factory_order_statuses.status
      if (order.details.length > 0) {
        this.selectedOrder.name = order.details[0].name
        this.selectedOrder.quantity = order.details[0].quantity
        this.selectedOrder.description = order.details[0].description
      }
    },
    closeModal() {
      this.isModal = false
    },
    async doneOrder() {
      const updatedOrder = {
        ...this.selectedOrder,
        id: this.selectedOrder.id,
        factory_order_statuses: this.selectedOption.name,
        factory_id: 3,
        details: [
          {
            description: this.selectedOrder.description,
            quantity: this.selectedOrder.quantity,
            name: this.selectedOrder.name,
          },
        ],
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
  },
}
</script>

<style scoped></style>
