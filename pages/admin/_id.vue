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

        <OrderDetail>
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
                v-for="factoriesStatus in getOrder.factory_order"
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

              <!-- Displaying the uploaded files -->
              <div v-if="getOrder.files && getOrder.files.length">
                <h3
                  class="mt-4 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Uploaded Files:
                </h3>
                <div class="grid gap-6 grid-cols-2 items-start justify-between">
                  <div>
                    <ul class="list-disc list-inside mt-2">
                      <li v-for="(file, index) in getOrder.files" :key="index">
                        <div>
                          <!-- File Download Link -->
                          <button
                            :disabled="!selectedFactory"
                            @click="addFileForFactory(file)"
                          >
                            {{ file.original_name || 'Download File' }}
                          </button>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div
                    class="flex flex-row flex-wrap items-start justify-between"
                  >
                    <div v-for="factory in getFactory" :key="factory.id">
                      <h2
                        class="cursor-pointer"
                        @click="selectFactoryForFiles(factory)"
                      >
                        {{ factory.name }}
                      </h2>
                      <div v-if="factoryFiles.find((f) => f.id === factory.id)">
                        <ul>
                          <li
                            v-for="file in factoryFiles.find(
                              (f) => f.id === factory.id
                            )?.files"
                            :key="file"
                            class="flex flex-row items-center justify-between my-1 hover:bg-indigo-300 px-3 py-2"
                          >
                            <p class="w-32">
                              {{
                                file.name ||
                                file.original_name ||
                                'Unnamed File'
                              }}
                            </p>

                            <button
                              @click="removeFileFromFactory(factory.id, file)"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                x="0px"
                                y="0px"
                                width="20"
                                height="20"
                                fill="red"
                                viewBox="0 0 30 30"
                              >
                                <path
                                  d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"
                                ></path>
                              </svg>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <button
                      class="px-3 py-1 bg-green-400 rounded-xl"
                      @click="addFiles"
                    >
                      Add files
                    </button>
                  </div>
                </div>
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
      selectedFactory: null,
      factoryFiles: [],
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
    ...mapActions('factoryFiles', ['createFactoryFiles']),
    handleFileUpload(event) {
      const files = Array.from(event.target.files)
      if (this.selectedFactory) {
        const factory = this.factoryFiles.find(
          (f) => f.id === this.selectedFactory.id
        )
        if (factory) {
          files.forEach((file) => {
            if (!factory.files.some((f) => f.name === file.name)) {
              factory.files.push(file)
            } else {
              this.$notify({
                text: `File "${file.name}" is already added to the factory.`,
                type: 'error',
              })
            }
          })
        } else {
          this.factoryFiles.push({
            id: this.selectedFactory.id,
            name: this.selectedFactory.name,
            files,
          })
        }
      } else {
        this.$notify({
          text: 'Please select a factory first',
          type: 'error',
        })
      }
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
    addFileForFactory(file) {
      if (this.selectedFactory) {
        const factory = this.factoryFiles.find(
          (f) => f.id === this.selectedFactory.id
        )
        if (factory) {
          if (!factory.files.includes(file)) {
            factory.files.push(file)
          } else {
            this.$notify({
              text: 'This file is already added to the factory',
              type: 'error',
            })
          }
        } else {
          this.factoryFiles.push({
            id: this.selectedFactory.id,
            name: this.selectedFactory.name,
            files: [file],
          })
        }
      } else {
        this.$notify({
          text: 'Please select a factory first',
          type: 'error',
        })
      }
    },

    addFiles() {
      const formData = new FormData()

      let factory = this.factoryFiles.find(
        (f) => f.id === this.selectedFactory.id
      )
      if (!factory) {
        factory = {
          id: this.selectedFactory.id,
          name: this.selectedFactory.name,
          files: [],
        }
        this.factoryFiles.push(factory)
      }
      factory.files.forEach((file) => {
        if (file.path && file.original_name) {
          formData.append('files[]', file.path)
          formData.append('original_name[]', file.original_name)
        } else {
          formData.append('files[]', file)
        }
      })
      if (formData.has('files[]')) {
        formData.append('factory_id', this.selectedFactory.id)
        formData.append('order_id', this.getOrder.id)

        this.createFactoryFiles(formData)
      } else {
        this.$notify({
          text: 'Please add at least one file.',
          type: 'error',
        })
      }
    },

    removeFileFromFactory(factoryId, file) {
      const factory = this.factoryFiles.find((f) => f.id === factoryId)
      if (factory) {
        const fileIndex = factory.files.indexOf(file)
        if (fileIndex !== -1) {
          factory.files.splice(fileIndex, 1)
        }
      }
    },

    selectFactoryForFiles(factory) {
      if (this.selectedFactory && this.selectedFactory.id === factory.id) {
        this.selectedFactory = null
      } else {
        this.selectedFactory = factory
      }
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
