<template>
  <main class="min-h-screen relative">
    <template v-if="getOrderByFactories && !isModal">
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg pt-36">
        <table
          class="w-full text-sm bg-amber-50 border-b-gray-500 text-left rtl:text-right text-gray-500 dark:text-gray-400 box-content"
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
            <tr
              class="border-b border-gray-200 dark:border-gray-700"
              :class="
                order?.factory_orders?.some(
                  (item) =>
                    item.status === 'Ավարտել' ||
                    item.admin_confirmation_date !== null
                )
                  ? 'bg-green-500 text-white'
                  : ''
              "
            >
              <th
                v-if="order.id"
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800 text-center"
              >
                {{ order.id }}
              </th>
              <td v-if="order?.created_at" class="px-6 py-4 text-center">
                {{ order?.created_at }}
              </td>
              <td v-if="order.user_id" class="px-6 py-4 text-center">
                {{ order.user_id }}
              </td>
              <td class="px-6 py-4 text-center">
                {{
                  order?.finish_date ? $formatDate(order.finish_date) : 'null'
                }}
              </td>
              <td
                v-if="order.description"
                class="px-6 py-4 cursor-pointer text-center bg-indigo-400 text-white hover:text-indigo-100 hover:bg-[#2557D6]/90"
                @click="toggleDetails(order)"
              >
                Դիտել
              </td>
              <td
                v-if="order.factory_orders"
                class="flex items-center justify-center text-center"
              >
                <div
                  v-for="item in order.factory_orders"
                  :key="item.id"
                  class="px-6 py-4 text-center w-full"
                  :class="
                    item.status === 'Հաստատել'
                      ? 'bg-green-300 text-white'
                      : item.status === 'Մերժել'
                      ? 'bg-red-500 text-white'
                      : item.status === 'Կատարման ժամկետի փոխարինում'
                      ? 'bg-orange-500 text-white'
                      : item.status === 'Ավարտել'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-500'
                  "
                >
                  <div
                    v-if="item.factory_id === 3 || item.factory_id === '3'"
                    class="text-center"
                  >
                    {{
                      item.operator_finish_date
                        ? item.operator_finish_date
                        : item.status
                    }}
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
                :data-value="status"
                label="Գործողություն"
              >
              </select-with-label>
              <div
                v-if="selectedOption && selectedOption.value === 'canceling'"
                class="my-5"
              >
                <select-with-label
                  v-model="additionalOption"
                  :data-value="additionalOptions"
                  label="Մերժման պատճառ"
                ></select-with-label>
              </div>
              <div
                v-if="selectedOption && selectedOption.value === 'finishing'"
                class="my-5"
              >
                {{ finishDate }}
              </div>
              <div
                v-if="selectedOption && selectedOption.value === 'changeDate'"
                class="my-5"
              >
                <input-with-label-icon
                  v-model="changeDate"
                  type="date"
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
            Հաստատել
          </button>
        </div>
      </div>
    </div>

    <!--    details modal-->

    <template v-if="isOpenDetails">
      <div
        class="absolute top-0 min-h-screen w-full flex items-center justify-center bg-gray-100 rounded p-4 text-gray-700"
      >
        <!-- Close button -->
        <button class="fixed top-10 right-20" @click="isOpenDetails = false">
          <svg
            class="w-6 h-6 text-gray-800"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="red"
            viewBox="0 0 24 24"
          >
            <path
              stroke="red"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18 17.94 6M18 18 6.06 6"
            />
          </svg>
        </button>

        <div
          class="grid lg:grid-cols-2 grid-cols-1 justify-between gap-2 bg-white p-6 rounded-lg shadow-slate-500 lg:w-5/6 w-full"
        >
          <div
            class="flex items-center justify-center show_file_section mx-auto text-center"
          >
            <DxfViewer v-if="dxfUrl" :key="dxfUrl" :dxf-url="dxfUrl" />
          </div>
          <div class="flex flex-col items-start justify-center">
            <h3 class="text-lg font-bold mb-4">Առաջադրանքի մանրամասներ</h3>
            <ul class="text-base font-medium leading-7">
              <li>Անուն: {{ details.name }}</li>
              <!--              <li>Քանակ: {{ details.quantity }}</li>-->
              <li>Նկարագրություն: {{ details.description }}</li>
            </ul>
            <!-- File list -->
            <div
              v-if="details.factory_orders && details.factory_orders.length > 0"
              class="flex flex-col items-center justify-center w-full"
            >
              <h4 class="text-lg font-bold mt-4">Ֆայլեր</h4>
              <ul class="w-full">
                <li v-for="order in details.factory_orders" :key="order.id">
                  <div v-if="order.files && order.files.length > 0">
                    <div
                      v-for="file in order.files"
                      :key="file.id"
                      class="border border-gray-200 rounded-md my-1 shadow-slate-600 shadow-md rounded-b-lg w-full"
                    >
                      <div class="flex items-center gap-4 justify-between p-3">
                        <button
                          class="text-blue-500 hover:text-blue-700"
                          @click="viewFile(file.path)"
                        >
                          Դիտել
                        </button>
                        <button
                          class="text-green-500 hover:text-green-700 flex items-center gap-2 justify-between"
                          :class="{
                            'text-black': file.status === 'downloaded',
                          }"
                          @click="downloadFile(file)"
                        >
                          {{ file.original_name }}
                          <img class="w-8 h-8" src="/images/img.png" alt="" />
                        </button>
                      </div>
                      <div
                        class="flex items-center justify-between gap-2 my-2 p-3"
                      >
                        <p class="flex flex-col items-center gap-2">
                          <span class="italic font-sans font-bold">Քանակ։</span>
                          {{ file?.quantity }}
                        </p>
                        <p class="flex flex-col items-center gap-2">
                          <span class="italic font-sans font-bold"
                            >Նյութի տեսակ։</span
                          >
                          {{ file?.material_type }}
                        </p>
                        <p class="flex flex-col items-center gap-2">
                          <span class="italic font-sans font-bold"
                            >Հաստություն։</span
                          >
                          {{ file?.thickness }}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </template>

    <notifications />
  </main>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
import DxfViewer from '~/components/File/DxfViewer.vue'

export default {
  components: {
    DxfViewer,
    InputWithLabelIcon,
    SelectWithLabel,
  },
  layout: 'FactoryLayout',
  middleware: ['laser', 'roleRedirect'],
  data() {
    return {
      searchable: '',
      changeDate: '',
      isModal: false,
      isOpenDetails: false,
      selectedOrder: {},
      selectedOption: null,
      additionalOption: null,
      selectedOrderId: null,
      dxfUrl: '',
      details: {
        name: '',
        quantity: 0,
        description: '',
        files: [],
      },
      status: [
        { id: 1, name: 'Հաստատել', value: 'confirmation' },
        { id: 2, name: 'Մերժել', value: 'canceling' },
        { id: 3, name: 'Կատարման ժամկետի փոխարինում', value: 'changeDate' },
        { id: 4, name: 'Ավարտել', value: 'finishing' },
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

    searchFilter() {
      const searchTerm = this.searchable.trim().toLowerCase()
      if (searchTerm === '') {
        return this.getOrderByFactories.orders
      }
      return this.getOrderByFactories.orders.filter((order) => {
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

    finishDate() {
      const date = new Date()
      return this.$formatDate(date)
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
    viewFile(filePath) {
      this.dxfUrl = filePath
    },
    async downloadFile(file) {
      await this.downloadUploadedFile(file)
      file.status = 'downloaded'
    },
    loadFile(file) {
      if (!(file instanceof Blob)) {
        return
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        const blob = new Blob([e.target.result], { type: 'application/dxf' })
        this.dxfUrl = URL.createObjectURL(blob)
      }
      reader.readAsArrayBuffer(file)
    },
    updateOrder(order) {
      this.isModal = true
      this.selectedOrder = { ...order }
      this.selectedOrder.factory_order = order.factory_order
        ? {
            ...order.factory_order,
            cancel_date: order.factory_order.cancel_date || null,
            canceling: order.factory_order.canceling || '',
            finish_date: order.factory_order.finish_date || null,
          }
        : {
            status: '',
            cancel_date: null,
            canceling: '',
            finish_date: null,
          }
    },

    closeModal() {
      this.isModal = false
    },

    async doneOrder() {
      const updatedOrder = {
        id: this.selectedOrder.id,
        factory_order: {
          status: this.selectedOption?.name || null,
          canceling: this.additionalOption?.name || null,
          cancel_date: this.changeDate || null,
          operator_finish_date:
            this.selectedOption?.value === 'finishing'
              ? new Date().toISOString().replace('T', ' ').slice(0, 19)
              : null,
        },
        factory_id: 3,
      }

      if (
        this.selectedOption?.name &&
        this.selectedOrder.status !== 'finished'
      ) {
        const res = await this.doneFinishedOrder(updatedOrder)
        if (res) {
          this.$notify({
            text: `Order updated successfully.`,
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'success',
          })
          this.selectedOption = null
          this.additionalOption = null
          this.changeDate = null

          await this.closeModal()
          await this.fetchOrdersByFactory(3)
        }
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

    toggleDetails(order) {
      this.isOpenDetails = !this.isOpenDetails
      this.details = order
    },
  },
}
</script>

<style scoped>
td {
  width: 200px;
}
</style>
