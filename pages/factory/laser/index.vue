```vue
<template>
  <main class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Orders Table -->
    <template v-if="getOrderByFactories && !isModal">
      <div class="container mx-auto px-4 py-16 sm:py-24">
        <div class="relative overflow-x-auto shadow-lg rounded-lg">
          <table
            class="w-full text-sm text-left text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300"
          >
            <thead
              class="text-xs uppercase bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <tr>
                <th scope="col" class="px-4 py-3 text-center">Հ/Հ</th>
                <th scope="col" class="px-4 py-3 text-center">
                  Ստեղծման ամսաթիվ
                </th>
                <th scope="col" class="px-4 py-3 text-center">Ում կողմից</th>
                <th scope="col" class="px-4 py-3 text-center">Ավարտի ժամկետ</th>
                <th scope="col" class="px-4 py-3 text-center">
                  Նկարագրություն
                </th>
                <th scope="col" class="px-4 py-3 text-center">Կարգավիճակ</th>
                <th scope="col" class="px-4 py-3 text-center">Գործողություն</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(order, index) in searchFilter"
                :key="index"
                class="border-b dark:border-gray-700"
                :class="{
                  'bg-green-100 dark:bg-green-800': order?.factory_orders?.some(
                    (item) =>
                      item.status === 'Ավարտել' ||
                      item.admin_confirmation_date !== null
                  ),
                }"
              >
                <th
                  scope="row"
                  class="px-4 py-4 font-medium text-gray-900 dark:text-white text-center"
                >
                  {{ order.id }}
                </th>
                <td class="px-4 py-4 text-center">
                  {{ order?.created_at }}
                </td>
                <td class="px-4 py-4 text-center">
                  {{ order?.creator?.name }}
                </td>
                <td class="px-4 py-4 text-center">
                  {{
                    order?.dates?.finish_date
                      ? $formatDate(order.dates?.finish_date)
                      : 'Հաշվի առնել'
                  }}
                </td>
                <td
                  class="px-4 py-4 text-center bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer transition-colors"
                  @click="toggleDetails(order)"
                >
                  Դիտել
                </td>
                <td class="px-4 py-4 text-center">
                  <div
                    v-for="item in order.factory_orders"
                    :key="item.id"
                    class="py-2"
                    :class="{
                      'bg-green-300 text-white': item.status === 'Հաստատել',
                      'bg-red-500 text-white': item.status === 'Մերժել',
                      'bg-orange-500 text-white':
                        item.status === 'Կատարման ժամկետի փոխարինում',
                      'bg-green-500 text-white': item.status === 'Ավարտել',
                      'text-gray-500': !item.status,
                    }"
                  >
                    <div
                      v-if="item.factory_id === 3 || item.factory_id === '3'"
                      class="text-center"
                    >
                      {{
                        item.status === 'Մերժել'
                          ? item.canceling || 'Հաշվի առնել'
                          : item.status === 'Կատարման ժամկետի փոխարինում'
                          ? $formatDate(item.cancel_date) || 'Հաշվի առնել'
                          : item.operator_finish_date
                          ? item.operator_finish_date
                          : item.status || 'Հաշվի առնել'
                      }}
                    </div>
                  </div>
                </td>
                <td
                  class="px-4 py-4 text-center text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
                  @click="updateOrder(order)"
                >
                  Խմբագրել
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Edit Modal -->
    <div
      v-if="isModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 relative"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Խմբագրել առաջադրանքը
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="closeModal"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <select-with-label
            v-model="selectedOption"
            :data-value="status"
            label="Գործողություն"
          />
          <div
            v-if="selectedOption && selectedOption.value === 'canceling'"
            class="my-4"
          >
            <select-with-label
              v-model="additionalOption"
              :data-value="additionalOptions"
              label="Մերժման պատճառ"
            />
          </div>
          <div
            v-if="selectedOption && selectedOption.value === 'finishing'"
            class="my-4"
          >
            <p class="text-gray-700 dark:text-gray-300">
              Ավարտի ամսաթիվ: {{ finishDate }}
            </p>
          </div>
          <div
            v-if="selectedOption && selectedOption.value === 'changeDate'"
            class="my-4"
          >
            <input-with-label-icon
              v-model="changeDate"
              type="date"
              format="dd-mm-yyyy"
              label="Նոր ավարտի ամսաթիվ"
            />
          </div>
          <button
            class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            @click="doneOrder(selectedOrder.id)"
          >
            Հաստատել
          </button>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <template v-if="isOpenDetails">
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6 relative"
        >
          <button
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="isOpenDetails = false"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="flex items-center justify-center">
              <DxfViewer v-if="dxfUrl" :key="dxfUrl" :dxf-url="dxfUrl" />
            </div>
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Առաջադրանքի մանրամասներ
              </h3>
              <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                <li>Անուն: {{ details.name }}</li>
                <li>Քանակ: {{ details.quantity }}</li>
                <li>Նկարագրություն: {{ details.description }}</li>
              </ul>
              <div v-if="details.factory_orders?.length">
                <h4 class="text-lg font-semibold mt-4">Ֆայլեր</h4>
                <ul class="space-y-2">
                  <li
                    v-for="order in details.factory_orders"
                    :key="order.id"
                    class="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                  >
                    <div v-for="file in order.files" :key="file.id">
                      <div class="flex items-center justify-between gap-4 mb-2">
                        <button
                          class="text-blue-500 hover:text-blue-700"
                          @click="viewFile(file.path)"
                        >
                          Դիտել
                        </button>
                        <button
                          class="text-green-500 hover:text-green-700 flex items-center gap-2"
                          :class="{
                            'text-black': file.status === 'downloaded',
                          }"
                          @click="downloadFile(file)"
                        >
                          {{ file.original_name }}
                          <img class="w-6 h-6" src="/images/img.png" alt="" />
                        </button>
                      </div>
                      <div class="grid grid-cols-3 gap-2 text-sm">
                        <p>
                          <span class="font-bold">Քանակ:</span>
                          <span
                            v-if="details.link_existing_files"
                            class="flex items-center gap-1"
                          >
                            <span class="line-through text-gray-500">{{
                              file.quantity
                            }}</span>
                            <span class="text-gray-400">→</span>
                            <span class="text-green-600 font-bold">{{
                              file.pivot.quantity
                            }}</span>
                          </span>
                          <span v-else>{{ file.quantity }}</span>
                        </p>
                        <p>
                          <span class="font-bold">Նյութ Torrentին տեսակ:</span>
                          {{ file?.material_type }}
                        </p>
                        <p>
                          <span class="font-bold">Հաստություն:</span>
                          {{ file?.thickness }}
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
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
import SelectWithLabel from '@/components/form/SelectWithLabel.vue'
import InputWithLabelIcon from '@/components/form/InputWithLabelIcon.vue'
import DxfViewer from '@/components/File/DxfViewer.vue'

export default {
  components: {
    DxfViewer,
    InputWithLabelIcon,
    SelectWithLabel,
  },
  layout: 'FactoryLayout',
  middleware: ['role-guard'],
  meta: { role: 'laser' },
  data() {
    return {
      searchable: '',
      changeDate: '',
      isModal: false,
      isOpenDetails: false,
      selectedOrder: {},
      selectedOption: null,
      additionalOption: null,
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
        {
          id: 3,
          name: 'Նյութի առկայության բացակայություն',
          value: 'no_material',
        },
      ],
    }
  },
  computed: {
    ...mapGetters('factory', ['getOrderByFactories']),
    searchFilter() {
      const searchTerm = this.searchable.trim().toLowerCase()
      if (!searchTerm) return this.getOrderByFactories.orders
      return this.getOrderByFactories.orders.filter((order) => {
        const orderNumber = order.order_number?.number?.toLowerCase() || ''
        const name = order.name?.toLowerCase() || ''
        const description = order.description?.toLowerCase() || ''
        const prefixCode = order.prefix_code?.code?.toLowerCase() || ''
        return (
          orderNumber.includes(searchTerm) ||
          description.includes(searchTerm) ||
          name.includes(searchTerm) ||
          prefixCode.includes(searchTerm)
        )
      })
    },
    finishDate() {
      return this.$formatDate(new Date())
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
      if (!(file instanceof Blob)) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const blob = new Blob([e.target.result], { type: 'application/dxf' })
        this.dxfUrl = URL.createObjectURL(blob)
      }
      reader.readAsArrayBuffer(file)
    },
    updateOrder(order) {
      this.isModal = true
      this.selectedOrder = {
        ...order,
        factory_order: order.factory_order
          ? {
              ...order.factory_order,
              cancel_date: order.factory_order.cancel_date || null,
              canceling: order.factory_order.canceling || '',
              finish_date: order.factory_order.finish_date || null,
            }
          : { status: '', cancel_date: null, canceling: '', finish_date: null },
      }
    },
    closeModal() {
      this.isModal = false
      this.selectedOption = null
      this.additionalOption = null
      this.changeDate = null
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
              ? new Date().toISOString().slice(0, 19).replace('T', ' ')
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
            text: 'Առաջադրանքը հաջողությամբ թարմացվել է։',
            duration: 3000,
            position: 'top',
            type: 'success',
          })
          this.closeModal()
          await this.fetchOrdersByFactory(3)
        }
      } else {
        this.$notify({
          text: 'Առաջադրանքն արդեն ավարտված է։',
          duration: 3000,
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
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  min-width: 120px;
}

@media (max-width: 640px) {
  th,
  td {
    min-width: 80px;
    font-size: 0.75rem;
  }
}
</style>
