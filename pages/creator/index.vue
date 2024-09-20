<template>
  <div class="antialiased bg-gray-50 dark:bg-gray-900">
    <main
      class="creator p-6 flex items-center justify-center fixed top-20 left-0 right-0 z-10 w-full overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full"
    >
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
      <!--      table-->

      <div
        v-if="orders"
        class="relative overflow-x-auto shadow-md sm:rounded-lg ml-20"
      >
        <table
          v-if="!isOpenDeleteModal"
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
              <th scope="col" class="px-3 py-3">Status</th>
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
              <td v-if="order.finish_date" class="px-6 py-4">
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
              <td v-if="order.store_link" class="px-12">
                <a class="hover:!text-blue-700" :href="order.store_link.url"
                  >Link</a
                >
              </td>
              <td
                class="px-12 text-indigo-500 border-indigo-500 hover:bg-indigo-500 hover:text-indigo-50 cursor-pointer"
                @click="editOrder(order)"
              >
                Edit
              </td>
              <td
                class="px-12 text-red-600 border-1 border-red-500 hover:bg-red-700 hover:text-white cursor-pointer"
                @click="openDeleteModal(order)"
              >
                Delete
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--      modals-->
      <div
        v-if="isOpenDeleteModal"
        class="overflow-y-auto overflow-x-hidden fixed z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div class="relative p-4 w-full max-w-md max-h-full">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              type="button"
              class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              @click="closeDeleteModal"
            >
              <svg
                class="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
            <div class="p-4 md:p-5 text-center">
              <svg
                class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
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
                  d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h3
                class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400"
              >
                Are you sure you want to delete this product?
              </h3>
              <button
                data-modal-hide="popup-modal"
                type="button"
                class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                @click="deleteSelectedOrder"
              >
                Yes, I'm sure
              </button>
              <button
                data-modal-hide="popup-modal"
                type="button"
                class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                @click="closeDeleteModal"
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      <!--      notifications-->
      <notifications />
    </main>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'

export default {
  name: 'CreatorPage',
  components: { InputWithLabelIcon },
  layout: 'creatorLayout',
  middleware: 'creator',
  data() {
    return {
      searchable: '',
      isDetails: false,
      isOpenDeleteModal: false,
      selectedOrder: null,
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
  },
  created() {
    this.fetchOrders()
  },
  methods: {
    ...mapActions('orders', ['fetchOrders', 'orderDelete']),
    editOrder(order) {
      console.log(order)
    },
    openDeleteModal(order) {
      if (order && order.id) {
        this.selectedOrder = order
        this.isOpenDeleteModal = true
      }
    },
    closeDeleteModal() {
      this.isOpenDeleteModal = false
    },
    async deleteSelectedOrder() {
      if (!this.selectedOrder || !this.selectedOrder.id) {
        return
      }
      const id = this.selectedOrder.id
      try {
        const res = await this.orderDelete(id)
        if (res) {
          this.$notify({
            text: `Order deleted successfully`,
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'success',
          })
          await this.fetchOrders()
          this.isOpenDeleteModal = false
        }
      } catch (err) {
        const error = this.errorMessage || { message: 'An error occurred' }
        this.$notify({
          text: error.message,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
      }
    },
  },
}
</script>

<style scoped></style>
