<template>
  <div class="bg-gray-50 dark:bg-gray-900 h-screen">
    <div
      v-if="!isOpenDeleteModal && !openEditModal"
      class="grid md:grid-cols-3 grid-cols-1 gap-4 mt-12"
    >
      <div class="grid grid-cols-2 shadow-lg rounded-lg">
        <div class="flex items-center justify-center">
          <img
            class="size-20 rounded-t-lg md:rounded-lg"
            src="/alyumin.jpg"
            alt=""
          />
        </div>
        <div class="flex flex-col justify-start p-4 leading-normal">
          <h5
            class="mb-2 italic font-sans font-bold tracking-tight text-gray-900 dark:text-white"
          >
            Նյութեր
          </h5>
          <p
            class="mb-3 font-light italic font-sans text-gray-700 dark:text-gray-400"
          >
            Քանակ։ {{ materials.length }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 shadow-lg rounded-lg">
        <div class="flex items-center justify-center">
          <img
            class="size-20 rounded-t-lg md:rounded-lg"
            src="/Без%20названия.png"
            alt=""
          />
        </div>

        <div class="flex flex-col justify-between p-4 leading-normal">
          <h5
            class="mb-2 italic font-sans font-bold tracking-tight text-gray-900 dark:text-white"
          >
            Գրանցվաշ օգտատերեր
          </h5>
          <p
            v-if="users"
            class="mb-3 font-light italic font-sans text-gray-700 dark:text-gray-400"
          >
            Օգտատերեր։ {{ users.length }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 shadow-lg rounded-lg">
        <div class="flex items-center justify-center">
          <img
            class="size-20 rounded-t-lg md:rounded-lg"
            src="/orders.png"
            alt=""
          />
        </div>
        <div class="flex flex-col justify-between p-4 leading-normal">
          <h5
            class="mb-2 italic font-sans font-bold tracking-tight text-gray-900 dark:text-white"
          >
            Պատվերներ
          </h5>
          <p
            class="mb-3 font-light italic font-sans text-gray-700 dark:text-gray-400"
          >
            Պատվերների քանակ։ {{ allOrders.length }}
          </p>
        </div>
      </div>
    </div>

    <!--    visitors-->

    <DeviceStatsChart v-if="!isOpenDeleteModal && !openEditModal" />

    <div
      v-if="orders.length > 0 && !isOpenDeleteModal && !openEditModal"
      class="relative overflow-x-auto overflow-y-auto max-h-screen shadow-md sm:rounded-lg p-6 py-24"
    >
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
            <th scope="col" class="px-3 py-3">Status</th>
            <th scope="col" class="px-3 py-3">Name</th>
            <th scope="col" class="px-3 py-3">Quantity</th>
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
            <td v-if="order.status" class="px-6 py-4">
              {{ order.status }}
            </td>
            <td v-if="order.name" class="px-6 py-4">
              {{ order.name }}
            </td>
            <td v-if="order.quantity" class="px-6 py-4">
              {{ order.quantity }}
            </td>
            <td v-if="order.store_link" class="px-12">
              <a class="hover:!text-blue-700" :href="order.store_link?.url"
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

    <!--      edit modal-->
    <edit-modal
      :data="showOrder"
      :is-open="openEditModal"
      :other-files="showOrder?.files"
      class="py-20 absolute top-10"
      @closeModal="closeEditeModal"
      @openFile="openFile"
    >
      <template #orderId>
        <input-with-label-icon
          v-model="showOrder.id"
          label="Id"
          type="text"
          label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          :disabled="true"
        />
      </template>
      <template #storageLink>
        <div>
          <a
            class="border-b-2 border-b-gray-300 pb-3"
            :href="showOrder.store_link?.url"
            >Store link</a
          >
        </div>
      </template>
      <template #orderDate>
        <div class="grid grid-cols-2">
          <input-with-label-icon
            :value="showOrder.created_at"
            :disabled="true"
            label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            label="Start date"
          >
            <template #label_svg>
              <svg
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
                  clip-rule="evenodd"
                />
              </svg>
            </template>
          </input-with-label-icon>
          <input-with-label-icon
            :value="showOrder.dates.finish_date"
            label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            :disabled="true"
            label="Finish date"
          >
            <template #label_svg>
              <svg
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
                  clip-rule="evenodd"
                />
              </svg>
            </template>
          </input-with-label-icon>
        </div>
      </template>
      <template #details>
        <div class="grid grid-cols-2 gap-8">
          <input-with-label-icon
            v-model="showOrder.name"
            type="text"
            label="Order name"
            label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            :disabled="true"
          />
          <input-with-label-icon
            v-model="showOrder.quantity"
            label="Order quantity"
            label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            :disabled="true"
          />
        </div>
        <textarea-with-label
          v-model="showOrder.description"
          label="Order description"
          label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          classes="block my-2 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          :disabled="true"
        />
      </template>
      <template #number>
        <input-with-label-icon
          v-model="showOrder.order_number.number"
          label="Order number"
          label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          :disabled="true"
        />
      </template>
      <template #prefixCode>
        <input-with-label-icon
          v-model="showOrder.prefix_code.code"
          label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          :disabled="true"
          label="code"
        />
      </template>
      <template #orderStatus>
        <input-with-label-icon
          v-model="showOrder.status"
          label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          classes="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          :disabled="true"
        />
      </template>

      <template v-if="showOrder?.factories" #factories>
        <div
          v-for="factory in showOrder.factories"
          :key="factory.id"
          class="flex flex-col items-center justify-center"
        >
          <p>Factory: {{ factory.name }}</p>
        </div>
      </template>
      <template v-if="showOrder?.factory_order" #orderByFactoryStatus>
        <div
          v-for="orderStatus in showOrder.factory_order"
          :key="orderStatus.id"
          class="flex flex-col items-center justify-center"
        >
          <p>Status by factory: {{ orderStatus.status }}</p>
        </div>
      </template>
    </edit-modal>

    <!--      notifications-->
    <notifications />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
import EditModal from '~/components/pages/manager/EditModal.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'

export default {
  name: 'ManagerPage',
  components: {
    TextareaWithLabel,
    EditModal,
    InputWithLabelIcon,
  },
  layout: 'ManagerLayout',
  middleware: ['manager', 'roleRedirect'],
  data() {
    return {
      searchable: '',
      isDetails: false,
      isOpenDeleteModal: false,
      openEditModal: false,
      selectedOrder: null,
      showOrder: null,
    }
  },
  computed: {
    ...mapGetters('orders', ['orders']),
    ...mapGetters('materials', ['getMaterials']),
    ...mapGetters('users', ['getUsers']),
    allOrders() {
      return this.orders
    },
    materials() {
      return this.getMaterials
    },
    users() {
      return this.getUsers
    },
    searchFilter() {
      const searchTerm = this.searchable.trim().toLowerCase()
      return this.allOrders.filter(
        (order) =>
          order &&
          (((order.order_number && order.order_number.number) || '')
            .toLowerCase()
            .includes(searchTerm) ||
            ((order.details && order.details[0] && order.details[0].name) || '')
              .toLowerCase()
              .includes(searchTerm) ||
            ((order.prefix_code && order.prefix_code.code) || '')
              .toLowerCase()
              .includes(searchTerm))
      )
    },
  },
  created() {
    this.fetchMaterials()
    this.fetchOrders()
    this.fetchUsers()
  },
  methods: {
    ...mapActions('orders', ['fetchOrders', 'orderDelete']),
    ...mapActions('materials', ['fetchMaterials']),
    ...mapActions('users', ['fetchUsers']),
    getFileUrl(filePath) {
      return `${'https://api.metalworks.am'}/storage/${filePath}`
      // return `${'http://localhost:8000'}/storage/${filePath}`
    },
    editOrder(order) {
      this.openEditModal = true
      this.showOrder = order
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
    closeEditeModal() {
      this.openEditModal = false
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
    openFile() {
      const fileUrl = '/uploads/example1.step'
      fetch(fileUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob)
          window.open(blobUrl)
        })
    },
  },
}
</script>

<style scoped></style>
