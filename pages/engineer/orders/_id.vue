<template>
  <div
    class="flex flex-col items-center justify-center gap-12 border border-neutral-400 shadow-xl rounded-xl py-4 m-6"
  >
    <div class="w-full flex flex-row items-center gap-12">
      <div class="flex flex-row items-center mx-auto gap-12">
        <div v-for="(factory, index) in getFactory" :key="index">
          <button
            :class="{
              'border border-neutral-600 rounded-lg px-3 py-1 italic font-sans': true,
              'bg-gray-900 text-white': selectedFactoryId === factory.id,
              'bg-gray-600 text-white':
                factories.files[factory.id] &&
                factories.files[factory.id].length > 0,
            }"
            @click="selectFactory(factory)"
          >
            {{ factory.name }}
          </button>
        </div>
      </div>
      <nuxt-link to="/engineer" class="ml-auto mr-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="25"
          height="25"
          fill="red"
          viewBox="0 0 30 30"
        >
          <path
            d="M15,3C8.373,3,3,8.373,3,15c0,6.627,5.373,12,12,12s12-5.373,12-12C27,8.373,21.627,3,15,3z M16.414,15 c0,0,3.139,3.139,3.293,3.293c0.391,0.391,0.391,1.024,0,1.414c-0.391,0.391-1.024,0.391-1.414,0C18.139,19.554,15,16.414,15,16.414 s-3.139,3.139-3.293,3.293c-0.391,0.391-1.024,0.391-1.414,0c-0.391-0.391-0.391-1.024,0-1.414C10.446,18.139,13.586,15,13.586,15 s-3.139-3.139-3.293-3.293c-0.391-0.391-0.391-1.024,0-1.414c0.391-0.391,1.024-0.391,1.414,0C11.861,10.446,15,13.586,15,13.586 s3.139-3.139,3.293-3.293c0.391-0.391,1.024-0.391,1.414,0c0.391,0.391,0.391,1.024,0,1.414C19.554,11.861,16.414,15,16.414,15z"
          ></path>
        </svg>
      </nuxt-link>
    </div>

    <div v-if="selectedFactoryId" class="container flex flex-col">
      <div class="grid grid-cols-2 gap-8">
        <div class="show_file_section">
          <DxfViewer v-if="dxfUrl" :key="dxfUrl" :dxf-url="dxfUrl" />
        </div>

        <div class="show_files_name min-h-96 max-h-[32rem] overflow-y-auto">
          <div v-if="factories.files[selectedFactoryId]?.length > 0">
            <ol class="list-decimal px-3">
              <li
                v-for="(file, index) in factories.files[selectedFactoryId]"
                :key="index"
                class="my-1"
              >
                <div
                  class="cursor-pointer grid grid-cols-2 justify-between items-center"
                  :class="{
                    'border border-neutral-600 rounded-lg px-3 py-1 italic font-sans': true,
                    'bg-gray-900 text-white': selectedFileIndex === index,
                  }"
                  @click="selectFile(file)"
                >
                  <span>{{ file.name }}</span>
                  <div class="text-center">
                    <p
                      v-if="expandedFileIndex !== index"
                      @click.stop="toggleAddQuantity(index)"
                    >
                      Ավելացնել Քանակ
                    </p>
                    <input-with-labels
                      v-if="expandedFileIndex === index"
                      id="quantity"
                      v-model="quantityMap[index]"
                      label="Քանակ"
                      type="number"
                      class="shadow-md rounded-lg p-5"
                    />
                  </div>
                </div>
              </li>
            </ol>
          </div>

          <!-- Եթե ֆայլ չկա -->
          <div v-else>
            <p>Ֆայլ չկա ընտրված գործարանի համար:</p>
          </div>
        </div>
      </div>
      <div
        class="flex flex-row items-center justify-end gap-12 text-right my-3"
      >
        <button
          class="border border-green-700 bg-green-700 text-white rounded-xl px-3 py-1"
          @click="saveFiles"
        >
          Պահպանել Ֆայլերը
        </button>
        <button
          class="border border-green-700 bg-green-700 text-white rounded-xl px-3 py-1"
        >
          Շարունակել
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import DxfViewer from '~/components/File/DxfViewer.vue'
import InputWithLabels from '~/components/form/InputWithIcon.vue'

export default {
  components: {
    InputWithLabels,
    DxfViewer,
  },
  layout: 'EngineerLayout',
  middleware: ['engineer', 'roleRedirect'],
  data() {
    return {
      expandedFileIndex: null,
      quantityMap: {},
      factories: {
        ids: [],
        files: {},
      },
      isDoneDetails: true,
      selectedClient: null,
      order: {
        name: null,
        quantity: null,
        description: null,
      },
      formSubmitted: false,
      isSelectedLaser: false,
      isSelectedBend: false,
      fileNames: [],
      dxfUrl: '',
      files: [],
      selectedFactoryId: null,
      selectedFileIndex: null,
      orderId: null,
    }
  },
  computed: {
    ...mapGetters('factory', ['getFactory']),
    ...mapGetters('users', ['getUsers']),
    ...mapGetters('engineer', ['getOrder']),
    users() {
      return this.getUsers
    },
  },
  mounted() {
    this.fetchUsers()
    this.fetchFactory()
    this.formSubmitted = true
    this.isDoneDetails = false
    this.selectedFactoryId = 1
    if (!this.factories.ids.includes(1)) {
      this.factories.ids.push(1)
    }
    if (!this.factories.files[1]) {
      this.factories.files[1] = []
    }
    this.selectedFileIndex = null
    this.dxfUrl = ''
    this.fileNames = []

    this.orderId = this.$route.params.id
    this.fetchOrderDataById(this.orderId).then(() => {
      this.initializeFiles()
    })
  },
  methods: {
    ...mapActions('factory', ['fetchFactory']),
    ...mapActions('users', ['fetchUsers']),
    ...mapActions('engineer', [
      'createNewOrder',
      'fetchOrderDataById',
      'saveOrderFilesByFactory',
    ]),
    toggleAddQuantity(index) {
      this.expandedFileIndex = this.expandedFileIndex === index ? null : index
      if (!this.quantityMap[index]) {
        this.quantityMap[index] = ''
      }
    },
    initializeFiles() {
      const order = this.getOrder
      if (order && order.factory_orders) {
        for (const factoryOrder of order.factory_orders) {
          const factoryId = factoryOrder.factory_id
          if (!this.factories.files[factoryId]) {
            this.factories.files[factoryId] = []
          }
          for (const file of factoryOrder.files) {
            try {
              const fileUrl = file.path
              this.factories.files[factoryId].push({
                name: file.original_name,
                path: fileUrl,
              })
            } catch (error) {
              this.$notify({
                text: error,
                duration: 3000,
                speed: 1000,
                position: 'top',
                type: 'success',
              })
            }
          }
        }
      }
    },
    // deleteFile(index) {
    //   if (
    //     this.selectedFactoryId &&
    //     this.factories.files[this.selectedFactoryId]
    //   ) {
    //     this.factories.files[this.selectedFactoryId].splice(index, 1)
    //     if (this.factories.files[this.selectedFactoryId].length === 0) {
    //       this.dxfUrl = ''
    //       this.selectedFileIndex = null
    //     } else {
    //       this.selectedFileIndex = 0
    //       this.loadFile(this.factories.files[this.selectedFactoryId][0])
    //     }
    //   }
    // },

    selectFactory(factory) {
      this.selectedFactoryId = factory.id
      if (!this.factories.ids.includes(factory.id)) {
        this.factories.ids.push(factory.id)
      }
      if (!this.factories.files[factory.id]) {
        this.factories.files[factory.id] = []
      }
      this.selectedFileIndex = null
      this.dxfUrl = ''
      this.fileNames = []
    },

    selectFile(file) {
      if (file && file.path) {
        this.dxfUrl = file.path
      } else {
        console.error('Invalid file object')
      }
    },

    loadFile(file) {
      if (!(file instanceof File)) {
        console.error('Invalid file type')
        return
      }

      // Create a URL for the file (only for local preview)
      const reader = new FileReader()
      reader.onload = () => {
        console.log('File content:', reader.result) // Log the file content
        this.dxfUrl = URL.createObjectURL(file)
      }
      reader.readAsText(file) // Read the file content
    },
    async saveFiles() {
      if (!this.orderId) {
        console.error('Պատվերի ID չի գտնվել։')
        return
      }

      const formData = new FormData()
      formData.append('order_id', this.orderId)
      Object.keys(this.factories.files).forEach((factoryId) => {
        const files = this.factories.files[factoryId] || []
        if (files.length > 0) {
          formData.append(`factories[${factoryId}][id]`, factoryId) // Ավելացնել գործարանի ID
          files.forEach((file, index) => {
            formData.append(`factories[${factoryId}][files][${index}]`, file)
          })
        }
      })
      for (const [key, value] of formData.entries()) {
        console.log(key, value)
      }
      await this.saveOrderFilesByFactory(formData)
      await this.$router.push('/engineer')
    },

    doneToFiles() {
      // this.formSubmitted = true
      // this.isDoneDetails = false
      // this.selectedFactoryId = 1
      // if (!this.factories.ids.includes(1)) {
      //   this.factories.ids.push(1)
      // }
      // if (!this.factories.files[1]) {
      //   this.factories.files[1] = []
      // }
      // this.selectedFileIndex = null
      // this.dxfUrl = ''
      // this.fileNames = []
    },

    createOrder() {
      const order = {
        user_id: this.selectedClient.id,
        name: this.order.name,
        quantity: this.order.quantity,
        description: this.order.description,
      }
      this.createNewOrder(order)
    },
  },
}
</script>

<style scoped>
.container {
  padding: 1rem;
}
.show_file_section {
  border: 1px solid #ccc;
  padding: 1rem;
}
.show_files_name {
  border: 1px solid #ccc;
  padding: 1rem;
}
.cursor-pointer {
  cursor: pointer;
}
ol {
  list-style-type: decimal;
}
</style>
