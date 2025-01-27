<template>
  <div>
    <h1 class="text-2xl text-center font-sans italic w-full my-6">
      Ստեղծել նոր պատվեր
    </h1>
    <template v-if="isUpload">
      <div class="mt-12 border border-gray-200 rounded-xl m-4 p-4">
        <label for="file" class="block text-sm font-medium text-gray-700"
          >Ներբեռնել ֆայլեր</label
        >
        <input
          type="file"
          multiple
          class="block w-full my-4"
          @change="handleFileUpload"
        />

        <!-- Displaying the uploaded files -->
        <div class="flex flex-col">
          <div class="flex flex-row items-start justify-between px-4 my-12">
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
                    v-for="file in factoryFiles.find((f) => f.id === factory.id)
                      ?.files"
                    :key="file"
                    class="flex flex-row items-center justify-between my-1 hover:bg-indigo-300 px-3 py-2"
                  >
                    <p class="w-32">
                      {{ file.name || file.original_name || 'Unnamed File' }}
                    </p>

                    <button @click="removeFileFromFactory(factory.id, file)">
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
          </div>
          <div>
            <button class="px-3 py-1 bg-green-400 rounded-xl" @click="addFiles">
              Add files
            </button>
          </div>
        </div>
      </div>
    </template>
    <template v-if="isDetails">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-12">
        <div
          class="w-full h-full ml-auto mr-4 p-6 bg-white rounded-xl shadow-lg"
        >
          <select-with-label
            v-model="selectedClient"
            :dates="users"
            label="Ընտրել հաճախորդ"
          ></select-with-label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
            <input-with-labels
              id="name"
              :value="selectedClient?.name"
              label="Անուն"
              type="text"
              :disabled="true"
              class="shadow-md rounded-lg p-5"
            ></input-with-labels>
            <input-with-labels
              id="name"
              :value="selectedClient?.client?.phone"
              label="Հեռախոսահամար"
              type="text"
              :disabled="true"
              class="shadow-md rounded-lg p-5"
            ></input-with-labels>
            <input-with-labels
              id="name"
              :value="selectedClient?.email"
              label="Էլ․ փոստ"
              type="text"
              :disabled="true"
              class="shadow-md rounded-lg p-5"
            ></input-with-labels>
            <input-with-labels
              id="name"
              :value="selectedClient?.client?.address"
              label="Հասցե"
              type="text"
              class="shadow-md rounded-lg p-5"
              :disabled="true"
            ></input-with-labels>
          </div>
        </div>
        <div class="w-full">
          <create-order @addButton="addTask">
            <template #detailsType>
              <input-with-labels
                id="name"
                v-model="order.name"
                label="Անուն"
                type="text"
                class="shadow-md rounded-lg p-3"
                :class="{ 'border-red-500': !order.name && formSubmitted }"
                required
              ></input-with-labels>
            </template>

            <template #detailsQuantity>
              <input-with-labels
                id="quantity"
                v-model="order.quantity"
                label="Քանակ"
                type="number"
                class="shadow-md rounded-lg p-3"
                :class="{ 'border-red-500': !order.quantity && formSubmitted }"
                required
              ></input-with-labels>
            </template>

            <template #detailsDesc>
              <textarea-with-label
                v-model="order.description"
                placeholder="Description"
                class="w-full my-2 p-3 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
                :class="{
                  'border-red-500': !order.description && formSubmitted,
                }"
                required
              ></textarea-with-label>
            </template>
          </create-order>
        </div>
      </div>
    </template>
    <notifications />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'
import CreateOrder from '~/components/modals/create/CreateOrder.vue'
import InputWithLabels from '~/components/form/InputWithIcon.vue'

export default {
  components: {
    InputWithLabels,
    CreateOrder,
    TextareaWithLabel,
    SelectWithLabel,
  },
  layout: 'EngineerLayout',
  middleware: ['admin', 'roleRedirect'],
  data() {
    return {
      isUpload: true,
      isDetails: false,
      selectedFactory: null,
      factoryFiles: [],
      selectedClient: null,
      order: {
        order_number: '',
        description: '',
        quantity: '',
        name: '',
        store_link: {
          url: '',
        },
      },
      formSubmitted: false,
    }
  },
  computed: {
    ...mapGetters('factoryFiles', ['getFactoryFiles']),
    ...mapGetters('factory', ['getFactory']),
    ...mapGetters('users', ['getUsers']),
    users() {
      return this.getUsers
    },
  },
  mounted() {
    this.fetchFactory()
    this.fetchUsers()
  },
  methods: {
    ...mapActions('factoryFiles', ['createFactoryFiles', 'createOrder']),
    ...mapActions('factory', ['fetchFactory']),
    ...mapActions('users', ['fetchUsers']),
    handleFileUpload(event) {
      const files = Array.from(event.target.files)

      if (!this.selectedFactory) {
        this.$notify({
          text: 'Խնդրում ենք ընտրել գործարան նախքան ֆայլեր ավելացնելը:',
          type: 'error',
        })
        return
      }

      // Գտնել կամ ստեղծել ընտրված գործարանը
      const factory = this.factoryFiles.find(
        (f) => f.id === this.selectedFactory.id
      )

      if (!factory) {
        this.factoryFiles.push({
          id: this.selectedFactory.id,
          name: this.selectedFactory.name,
          files: files.map((file) => ({
            file,
            name: file.name,
            original_name: file.name,
          })),
        })
      } else {
        // Ստուգել և ավելացնել միայն նոր ֆայլերը
        files.forEach((file) => {
          if (!factory.files.some((f) => f.name === file.name)) {
            factory.files.push({
              file,
              name: file.name,
              original_name: file.name,
            })
          } else {
            this.$notify({
              text: `Ֆայլը "${file.name}" արդեն կցված է տվյալ գործարանին:`,
              type: 'error',
            })
          }
        })
      }
    },

    addFiles() {
      this.isUpload = false
      this.isDetails = true
    },

    async addTask() {
      this.formSubmitted = true

      if (!this.selectedClient) {
        this.$notify({
          text: 'Հաճախորդի ընտրությունը պարտադիր է',
          type: 'error',
        })
        return
      }

      if (!this.order.name || !this.order.quantity || !this.order.description) {
        this.$notify({
          text: 'Անունը, քանակը և նկարագրությունը պարտադիր են',
          type: 'error',
        })
        return
      }

      const formData = new FormData()

      this.factoryFiles.forEach((factory) => {
        factory.files.forEach((file) => {
          formData.append(`files[${factory.id}][]`, file.file)
        })
      })

      formData.append('user_id', this.selectedClient.id)
      formData.append('store_link[url]', this.order.store_link.url)
      formData.append('name', this.order.name)
      formData.append('quantity', this.order.quantity)
      formData.append('description', this.order.description)

      try {
        await this.createOrder(formData)
        this.$notify({
          text: 'Պատվերը հաջողությամբ ստեղծվեց:',
          type: 'success',
        })
      } catch (error) {
        this.$notify({
          text: error.response?.data?.message || 'Սխալ տեղի ունեցավ:',
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
        this.selectedFactory = null // Եթե նույն գործարանն ընտրած է, ապա հանել
      } else {
        this.selectedFactory = factory // Նոր գործարան ընտրել
      }
    },
  },
}
</script>
