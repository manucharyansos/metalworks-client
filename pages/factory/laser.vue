<template>
  <main class="min-h-screen">
    <template v-if="getOrderByFactories && !isModal">
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-36">
        <table
          class="w-full text-sm bg-amber-50 border-b-gray-500 text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead
            class="text-xs text-gray-700 bg-gray-300 uppercase dark:text-gray-400"
          >
            <tr class="border-b-neutral-700">
              <th scope="col" class="px-3 py-3 text-center">Հ/Հ</th>
              <th scope="col" class="px-3 py-3 text-center">
                Ստեղծման ամսաթիվ
              </th>
              <th scope="col" class="px-3 py-3 text-center">Ում կողմից</th>
              <th scope="col" class="px-3 py-3 text-center">
                Ավարտի անհրաժեշտ ժամկետ
              </th>
              <th scope="col" class="px-3 py-3 text-center">Նկարագրություն</th>
              <th scope="col" class="px-3 py-3 text-center">Կարգավիճակ</th>
              <th scope="col" class="px-3 py-3 text-center"></th>
              <!--              <th scope="col" class="px-3 py-3 text-center"></th>-->
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
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800 text-center"
              >
                {{ order.id }}
              </th>
              <td v-if="order.dates.created_at" class="px-6 py-4 text-center">
                {{ order.dates.created_at }}
              </td>
              <td v-if="order.user_id" class="px-6 py-4 text-center">
                {{ order.user.name }}
              </td>
              <td class="px-6 py-4 text-center">
                {{ order.dates.finish_date ? order.dates.finish_date : 'null' }}
              </td>
              <td
                v-if="order.description"
                class="px-6 py-4 cursor-pointer text-center hover:text-indigo-900"
                @click="toggleDetails(order.id)"
              >
                Դիտել
                <template v-if="isOpenDetails(order.id)">
                  <ul
                    class="w-full h-screan border-neutral-400 shadow-neutral-400 bg-neutral-400 rounded-2xl p-4 text-start text-white"
                  >
                    <li>Անւն: {{ order.name }}</li>
                    <li>Քանակ: {{ order.quantity }}</li>
                    <li>Նկարագրություն: {{ order.description }}</li>
                    <li v-for="file in order.files" :key="file.id">
                      <a
                        class="hover:!text-blue-700"
                        :href="fileUrl(file.path)"
                        target="_blank"
                        >Տեսնել ֆայլը</a
                      >
                    </li>
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
                  class="px-6 py-4 text-center w-full"
                  :class="
                    item.status === 'Հաստատել'
                      ? 'bg-green-500 text-white'
                      : item.status === 'Մերժել'
                      ? 'bg-red-500 text-white'
                      : item.status === 'Կատարման ժամկետի փոխարինում'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-500'
                  "
                >
                  <div
                    v-if="item.factory_id === 3 || item.factory_id === '3'"
                    class="text-center"
                  >
                    {{ item.status }}
                  </div>
                </div>
              </td>
              <td
                class="px-12 text-indigo-500 border-indigo-500 hover:bg-indigo-500 hover:text-indigo-50 cursor-pointer"
                @click="updateOrder(order)"
              >
                Խմբագրել
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
              Խմբագրել առաջադրանքը
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
                label="Գործողություն"
              >
              </select-with-label>
              <div
                v-if="selectedOption && selectedOption.value === 'canceling'"
                class="my-5"
              >
                <select-with-label
                  v-model="additionalOption"
                  :dates="additionalOptions"
                  label="Մերժման պատճառ"
                ></select-with-label>
              </div>
              <div
                v-if="selectedOption && selectedOption.value === 'changeDate'"
                class="my-5"
              >
                <input-with-label-icon
                  type="date"
                  v-model="changeDate"
                  format="dd-mm-yyyy"
                />
              </div>
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
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import OrderCard from '~/components/card/OrderCard.vue'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'

export default {
  components: {
    InputWithLabelIcon,
    OrderCard,
    SelectWithLabel,
  },
  layout: 'FactoryLayout',
  middleware: ['laser', 'roleRedirect'],
  data() {
    return {
      searchable: '',
      changeDate: '',
      isModal: false,
      selectedOrder: {},
      selectedOption: null,
      additionalOption: null,
      selectedOrderId: null,
      status: [
        { id: 1, name: 'Հաստատել', value: 'confirmation' },
        { id: 2, name: 'Մերժել', value: 'canceling' },
        { id: 3, name: 'Կատարման ժամկետի փոխարինում', value: 'changeDate' },
      ],
      additionalOptions: [
        { id: 1, name: 'Ոչ հստակ պատվեր', value: 'unclear' },
        { id: 2, name: 'Սխալ տվյալներ', value: 'error' },
        { id: 2, name: 'Նյութորի առկայության բացակայում', value: 'error' },
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
    ...mapActions('factory', [
      'fetchOrdersByFactory',
      'doneFinishedOrder',
      'downloadUploadedFile',
    ]),
    fileUrl(filePath) {
      return this.$getFileUrl(filePath)
    },
    downloadFile(filePath) {
      const fileUrl = `/factories/files/${filePath}`
      window.location.href = fileUrl
    },
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
          canceling: this.additionalOption?.name || null,
          cancel_date: this.changeDate || '',
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
