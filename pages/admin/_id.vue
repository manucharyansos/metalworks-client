<template>
  <div
    class="flex flex-col overflow-y-auto items-center justify-center bg-gray-50 dark:bg-gray-800"
  >
    <div class="w-full p-16 rounded-lg shadow-md dark:bg-gray-900">
      <div v-if="getOrder && getFactory">
        <!-- Stepper Component -->
        <div class="my-5">
          <stepper-component :data-stepper="stepperData" />
        </div>

        <!--order detail-->

        <OrderDetail :order="getOrder">
          <template #name>
            <input-with-labels
              id="name"
              v-model="getOrder.name"
              label="Անուն"
              type="text"
              class="shadow-md rounded-lg p-3 pt-5"
            ></input-with-labels>
          </template>

          <template #orderNumber>
            <input-with-labels
              id="orderNumber"
              v-model="getOrder.order_number.number"
              label="Պատվերի համարը"
              class="shadow-md rounded-lg p-3 pt-5"
              disabled
            ></input-with-labels>
          </template>

          <template #quantity>
            <input-with-labels
              id="quantity"
              v-model="getOrder.quantity"
              label="Քանակ"
              type="number"
              class="shadow-md rounded-lg p-3 pt-5"
            ></input-with-labels>
          </template>

          <template #startDate>
            <input-with-labels
              id="startDate"
              v-model="getOrder.created_at"
              label="Ստեղծված ամսաթիվ"
              class="shadow-md rounded-lg p-3 pt-5"
              disabled
            ></input-with-labels>
          </template>

          <template #finishDate>
            <input-with-labels
              id="finishDate"
              v-model="getOrder.dates.finish_date"
              label="Անհաժեշտ ավարտի ամսաթիվ"
              type="datetime-local"
              class="shadow-md rounded-lg p-3 pt-5"
            ></input-with-labels>
          </template>

          <template #files>
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
                    <a :href="fileUrl(file.path)" target="_blank">
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
          </template>

          <template #description>
            <textarea-with-label
              v-model="getOrder.description"
              placeholder="Description"
              class="w-full my-2 p-3 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
              required
            ></textarea-with-label>
          </template>
          <template #buttons>
            <button
              type="button"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="doneOrder"
            >
              Հաստատել
            </button>
            <button
              type="button"
              class="inline-flex justify-center py-2 px-4 border border-red-600 shadow-sm text-sm font-medium rounded-md text-red-600 hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              @click="deleteOrder(order.id)"
            >
              Ջնջել
            </button>
          </template>

          <!--          Factory order status-->
          <template #factoryStatus>
            <div class="my-6">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                Գործարանային կարգավիճակ
              </p>
              <div
                v-for="factoriesStatus in getOrder.factory_order_statuses"
                :key="factoriesStatus.id"
                class="mt-2"
              >
                <div
                  class="flex items-center justify-between space-x-2 text-gray-700 dark:text-gray-300"
                  :class="
                    factoriesStatus.status === 'Հաստատել'
                      ? 'bg-green-300 text-white p-2 rounded'
                      : factoriesStatus.status === 'Մերժել'
                      ? 'bg-red-500 text-white p-2 rounded'
                      : factoriesStatus.status === 'Կատարման ժամկետի փոխարինում'
                      ? 'bg-orange-500 text-white p-2 rounded'
                      : factoriesStatus.status === 'Ավարտել'
                      ? 'bg-green-500 text-white p-2 rounded'
                      : 'bg-gray-100 text-gray-500 p-2 rounded'
                  "
                >
                  <div class="flex flex-col items-center justify-center">
                    <p>Գործարաններ</p>
                    <p>{{ factoriesStatus.factory.name }}</p>
                  </div>

                  <div class="flex flex-col items-center justify-center">
                    <p>Կարգավիճակ</p>
                    <p>
                      {{ factoriesStatus.status }}

                      <template v-if="factoriesStatus.canceling">
                        {{ factoriesStatus?.canceling }}
                      </template>
                      <template v-if="factoriesStatus.cancel_date">
                        {{ $formatDate(factoriesStatus?.cancel_date) }}
                      </template>
                      <template v-if="factoriesStatus.operator_finish_date">
                        {{ $formatDate(factoriesStatus?.operator_finish_date) }}
                      </template>
                    </p>
                    <template v-if="factoriesStatus.status === 'Ավարտել'">
                      <button
                        class="border border-green-800 rounded-xl bg-green-800 hover:bg-green-400 px-6 py-1 mt-2"
                        @click="confirmStatus(factoriesStatus)"
                      >
                        Հաստատել
                      </button>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #factories>
            <template v-if="getOrder.factories">
              <div
                v-for="actualFactory in getOrder.factories"
                :key="actualFactory.id"
                class="mt-2 text-gray-700 dark:text-gray-300"
              >
                {{ actualFactory.name }}
              </div>
            </template>
          </template>

          <template #selectFactory>
            <!-- Factory Selection -->
            <div class="mt-6">
              <p>Ընտրել գործարան</p>
              <div
                v-for="manyFactory in factories"
                :key="manyFactory.id"
                class="flex justify-between items-center mt-2 p-2"
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
          </template>
        </OrderDetail>

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
import OrderDetail from '~/components/modals/admin/OrderDetail.vue'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'

export default {
  components: {
    TextareaWithLabel,
    InputWithLabels,
    OrderDetail,
    StepperComponent,
    SpinnerComponent,
  },
  layout: 'AdminLayout',
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
    ...mapActions('factory', ['fetchFactory', 'adminConfirmFactoryStatus']),
    handleFileUpload(event) {
      this.getOrder.files = Array.from(event.target.files)
    },
    fileUrl(filePath) {
      return this.$getFileUrl(filePath)
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
        if (!this.getOrder.name) {
          throw new Error('Անուն դաշտը պարտադիր է')
        }
        if (
          !this.getOrder.quantity ||
          isNaN(this.getOrder.quantity) ||
          this.getOrder.quantity <= 0
        ) {
          throw new Error('Քանակը պարտադիր է և պետք է լինի դրական թիվ')
        }
        if (!this.getOrder.dates || !this.getOrder.dates.finish_date) {
          throw new Error('Անհրաժեշտ ավարտի ամսաթիվը պարտադիր է')
        }
        if (!this.getOrder.description) {
          throw new Error('Նկարագրությունը պարտադիր է')
        }

        if (this.getOrder.files && !Array.isArray(this.getOrder.files)) {
          throw new Error('Ֆայլերը պետք է լինեն զանգվածի ձևով')
        }

        const formData = new FormData()
        this.getOrder.files?.forEach((file) => {
          if (file instanceof File) {
            formData.append('files[]', file)
          }
        })
        formData.append('name', this.getOrder.name)
        formData.append('quantity', this.getOrder.quantity)
        formData.append('description', this.getOrder.description)
        formData.append('status', this.getOrder.status || 'in process')
        formData.append('finish_date', this.getOrder.dates.finish_date)

        if (this.getOrder.store_link && this.getOrder.store_link.url) {
          formData.append('store_link[url]', this.getOrder.store_link.url)
        }

        if (this.selectedFactories.length) {
          this.selectedFactories.forEach((factoryId, index) => {
            formData.append(`factories[${index}][id]`, factoryId)
          })
        } else if (
          this.getOrder.factories &&
          Array.isArray(this.getOrder.factories)
        ) {
          this.getOrder.factories.forEach((factory, index) => {
            formData.append(`factories[${index}][id]`, factory.id)
          })
        } else {
          throw new Error('Գոնե մեկ գործարան պետք է ընտրված լինի')
        }

        await this.updateOrder({ id: this.id, payload: formData })
        this.$notify({
          type: 'success',
          title: 'Պատվերը հաջողությամբ թարմացվել է',
        })
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Սխալ պատվերի թարմացման ընթացքում',
          text: error.message,
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
    confirmStatus(factoryStatus) {
      const confirmData = {
        id: factoryStatus.order_id,
        factory_id: factoryStatus.factory_id,
      }
      this.adminConfirmFactoryStatus(confirmData)
    },
  },
}
</script>
