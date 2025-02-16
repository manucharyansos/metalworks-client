<template>
  <div class="container flex flex-col">
    <h1
      v-if="isDoneDetails"
      class="text-3xl font-sans italic leading-6 my-6 text-center mx-auto"
    >
      Ստեղծել նոր պատվեր
    </h1>

    <div
      v-if="isDoneDetails"
      class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-12"
    >
      <div class="w-full h-full ml-auto mr-4 p-6 bg-white rounded-xl shadow-lg">
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
        <create-order
          button-text="Ստեղծել Պատվեր"
          @doneButton="doneToFiles"
          @addButton="createOrder"
        >
          <template #detailsType>
            <!--            <input-with-labels-->
            <!--              id="name"-->
            <!--              v-model="order.name"-->
            <!--              label="Անուն"-->
            <!--              type="text"-->
            <!--              class="shadow-md rounded-lg p-3"-->
            <!--              :class="{ 'border-red-500': !order.name && formSubmitted }"-->
            <!--              required-->
            <!--            ></input-with-labels>-->
            <select-with-label
              v-model="order.pnp_groupe"
              :dates="pnpGroupe"
              label="Ընտրել PNP տեսակը"
            />
            <select-with-label
              v-model="order.pnp_name"
              :dates="pnp_name"
              label="Ընտրել Անունը"
            />
          </template>

          <template #detailsQuantity>
            <input-with-labels
              id="quantity"
              v-model="order.quantity"
              label="Քանակ"
              type="number"
              class="shadow-md rounded-lg p-3"
              :class="{
                'border-red-500': !order.quantity && formSubmitted,
              }"
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

    <div
      v-if="!isDoneDetails"
      class="flex flex-col items-center justify-center gap-12 border border-neutral-400 shadow-xl rounded-xl py-4"
    >
      <div class="flex flex-row items-center gap-12">
        <div class="flex flex-row items-center justify-center gap-12">
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
        <div
          class="flex flex-row items-center justify-center gap-12 text-right my-3"
        >
          <button @click="isDoneDetails = !isDoneDetails">
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
          </button>
          <button
            class="border border-green-700 bg-green-700 text-white rounded-xl px-3 py-1"
          >
            Շարունակել
          </button>
        </div>
      </div>

      <div v-if="selectedFactoryId" class="container flex flex-col">
        <div class="grid grid-cols-2 gap-8">
          <!-- DXF Ֆայլի դիտման հատված -->
          <div class="show_file_section h-96">
            <DxfViewer v-if="dxfUrl" :key="dxfUrl" :dxf-url="dxfUrl" />
          </div>

          <!-- Ընտրած ֆայլերի ցուցակ -->
          <div class="show_files_name">
            <div class="w-full my-4">
              <!-- Ֆայլերի ընտրության ինպուտ -->
              <input type="file" multiple @change="handleFileChange" />
            </div>

            <!-- Ցուցադրում ենք ընտրված ֆայլերի անունները -->
            <div v-if="factories.files[selectedFactoryId]?.length > 0">
              <ol class="list-decimal px-3">
                <li
                  v-for="(file, index) in factories.files[selectedFactoryId]"
                  :key="index"
                >
                  <div
                    class="cursor-pointer grid grid-cols-2 justify-between"
                    :class="{
                      'border border-neutral-600 rounded-lg px-3 py-1 italic font-sans': true,
                      'bg-gray-900 text-white': selectedFileIndex === index,
                    }"
                    @click="selectFile(index)"
                  >
                    <span>{{ file.name }}</span>

                    <div class="ml-auto" @click="deleteFile(index)">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="20"
                        height="20"
                        fill="red"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z"
                        ></path>
                      </svg>
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
        <!--        <div-->
        <!--          class="flex flex-row items-center justify-center gap-12 float-right my-3"-->
        <!--        >-->
        <!--          <button-->
        <!--            class="border border-red-700 bg-red-600 text-white rounded-xl px-3 py-1"-->
        <!--          >-->
        <!--            Չեղարկել-->
        <!--          </button>-->
        <!--          <button-->
        <!--            class="border border-green-700 bg-green-700 text-white rounded-xl px-3 py-1"-->
        <!--          >-->
        <!--            Շարունակել-->
        <!--          </button>-->
        <!--        </div>-->
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'
import CreateOrder from '~/components/modals/create/CreateOrder.vue'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import DxfViewer from '~/components/File/DxfViewer.vue'

export default {
  components: {
    DxfViewer,
    InputWithLabels,
    CreateOrder,
    TextareaWithLabel,
    SelectWithLabel,
  },
  layout: 'EngineerLayout',
  middleware: ['admin', 'roleRedirect'],
  data() {
    return {
      factories: {
        ids: [],
        files: {},
      },
      isDoneDetails: true,
      selectedClient: null,
      order: {
        name: null,
        pnp_groupe: null,
        pnp_name: null,
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
      pnp_name: [
        { name: '01' },
        { name: '02' },
        { name: '03' },
        { name: '04' },
        { name: '05' },
        { name: '06' },
        { name: '07' },
      ],
      pnpGroupe: [
        { name: '001' },
        { name: '002' },
        { name: '003' },
        { name: '004' },
        { name: '005' },
        { name: '006' },
      ],
    }
  },
  computed: {
    ...mapGetters('factory', ['getFactory']),
    ...mapGetters('users', ['getUsers']),
    users() {
      return this.getUsers
    },
  },
  mounted() {
    this.fetchUsers()
    this.fetchFactory()
  },
  methods: {
    ...mapActions('factory', ['fetchFactory']),
    ...mapActions('users', ['fetchUsers']),
    ...mapActions('engineer', ['createNewOrder']),
    deleteFile(index) {
      if (
        this.selectedFactoryId &&
        this.factories.files[this.selectedFactoryId]
      ) {
        this.factories.files[this.selectedFactoryId].splice(index, 1)
        if (this.factories.files[this.selectedFactoryId].length === 0) {
          this.dxfUrl = ''
          this.selectedFileIndex = null
        } else {
          this.selectedFileIndex = 0
          this.loadFile(this.factories.files[this.selectedFactoryId][0])
        }
      }
    },

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
    handleFileChange(event) {
      const newFiles = Array.from(event.target.files)
      if (this.selectedFactoryId) {
        if (!this.factories.files[this.selectedFactoryId]) {
          this.factories.files[this.selectedFactoryId] = []
        }
        this.factories.files[this.selectedFactoryId] = [
          ...this.factories.files[this.selectedFactoryId],
          ...newFiles,
        ]
        this.fileNames = this.factories.files[this.selectedFactoryId].map(
          (file) => file.name
        )
        this.loadFile(newFiles[0])
      } else {
        console.error('Գործարան ընտրված չէ')
      }
    },

    loadFile(file) {
      const reader = new FileReader()

      reader.onload = (e) => {
        const blob = new Blob([e.target.result], { type: 'application/dxf' })
        this.dxfUrl = URL.createObjectURL(blob)
      }
      reader.readAsArrayBuffer(file)
    },

    selectFile(index) {
      if (this.selectedFactoryId) {
        const selectedFile = this.factories.files[this.selectedFactoryId][index]
        this.selectedFileIndex = index
        this.loadFile(selectedFile)
      }
    },

    doneToFiles() {
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
    },

    createOrder() {
      const fullName =
        this.order.pnp_groupe.name + '.' + this.order.pnp_name.name
      const order = {
        user_id: this.selectedClient.id,
        name: fullName,
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
