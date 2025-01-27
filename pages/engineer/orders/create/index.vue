<template>
  <div class="container flex flex-col">
    <h1 class="text-3xl font-sans italic leading-6 my-6 text-center mx-auto">
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
        <create-order @addButton="createOrder">
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
      class="flex flex-row items-start justify-center gap-12"
    >
      <div v-for="(factory, index) in getFactory" :key="index">
        <button
          :class="{
            'border border-neutral-600 rounded-lg px-3 py-1 italic font-sans': true,
            'bg-green-500 text-white': factories.ids.includes(factory.id),
          }"
          @click="selectFactory(factory)"
        >
          {{ factory.name }}
        </button>
      </div>
    </div>

    <div v-if="selectedFactoryId" class="container flex flex-col">
      <div class="grid grid-cols-2 gap-8">
        <!-- DXF Ֆայլի դիտման հատված -->
        <div class="show_file_section">
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
            <ul>
              <li
                v-for="(file, index) in factories.files[selectedFactoryId]"
                :key="index"
                class="cursor-pointer hover:bg-gray-200 p-2"
                :class="{
                  'border border-neutral-600 rounded-lg px-3 py-1 italic font-sans': true,
                  'bg-gray-900 text-white': selectedFileIndex === index,
                }"
                @click="selectFile(index)"
              >
                {{ file.name }}
              </li>
            </ul>
          </div>

          <!-- Եթե ֆայլ չկա -->
          <div v-else>
            <p>Ֆայլ չկա ընտրված գործարանի համար:</p>
          </div>
        </div>
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
  layout: 'ManagerLayout',
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
        quantity: null,
        description: null,
      },
      formSubmitted: false,
      isSelectedLaser: false,
      isSelectedBend: false,
      fileNames: [],
      dxfUrl: '',
      files: [],
      selectedFactoryId: null, // Ընտրված գործարանի ID-ն
      selectedFileIndex: null,
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

    selectFactory(factory) {
      this.selectedFactoryId = factory.id

      // Եթե գործարանը նոր է ընտրվում, ապա ավելացնում ենք `factories.ids`
      if (!this.factories.ids.includes(factory.id)) {
        this.factories.ids.push(factory.id)
      }

      // Ստեղծում ենք ֆայլերի նոր ցուցակ, եթե չկա
      if (!this.factories.files[factory.id]) {
        this.factories.files[factory.id] = []
      }

      // Զրոյացնում ենք ֆայլերի ընտրությունը
      this.selectedFileIndex = null
      this.dxfUrl = ''
      this.fileNames = []
    },

    handleFileChange(event) {
      const files = Array.from(event.target.files)

      // Ավելացնում ենք ֆայլերը ընտրված գործարանի ID-ի տակ
      if (this.selectedFactoryId) {
        this.factories.files[this.selectedFactoryId] = files

        // Թարմացնում ենք ֆայլերի անունները
        this.fileNames = files.map((file) => file.name)

        // Բեռնում ենք առաջին ֆայլը
        this.loadFile(files[0])
      } else {
        console.error('Գործարան ընտրված չէ')
      }
    },

    loadFile(file) {
      const reader = new FileReader()

      reader.onload = (e) => {
        // Ստեղծում ենք Blob URL
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

    createOrder() {
      this.formSubmitted = true
      this.isDoneDetails = false
    },

    // selectFactory(factory) {
    //   if (!this.factories.ids.includes(factory.id)) {
    //     this.factories.ids.push(factory.id)
    //   }
    // },
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
</style>
