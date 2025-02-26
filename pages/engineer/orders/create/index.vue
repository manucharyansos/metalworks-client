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
          :data-value="users"
          label="Ընտրել հաճախորդ"
          :class="{ 'border-red-600': formSubmitted && !selectedClient }"
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
            id="phone"
            :value="selectedClient?.client?.phone"
            label="Հեռախոսահամար"
            type="text"
            :disabled="true"
            class="shadow-md rounded-lg p-5"
          ></input-with-labels>
          <input-with-labels
            id="email"
            :value="selectedClient?.email"
            label="Էլ․ փոստ"
            type="text"
            :disabled="true"
            class="shadow-md rounded-lg p-5"
          ></input-with-labels>
          <input-with-labels
            id="address"
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
          done-button="PMP files"
          @doneButton="doneToFiles"
          @addButton="pmpFiles"
        >
          <template #pmpGroup>
            <select-pmp
              v-model="selectedPmp"
              :dates="pnpGroup.pmp"
              label="Ընտրել PNP տեսակը"
              :class="{ 'border-red-600': formSubmitted && !selectedPmp }"
            />
          </template>
          <template #pmpName>
            <select-pmp
              v-model="selectedPmpRemoteNumber"
              :dates="pnpName"
              label="Ընտրել Անունը"
              :class="{
                'border-red-600': formSubmitted && !selectedPmpRemoteNumber,
              }"
            />
          </template>

          <template #detailsDesc>
            <textarea-with-label
              v-model="order.description"
              placeholder="Նկարագրություն"
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

          <div class="show_files_name">
            <div class="w-full my-4">
              <input type="file" multiple @change="handleFileChange" />
            </div>
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
            <div v-else>
              <p>Ֆայլ չկա ընտրված գործարանի համար:</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <notifications />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'
import CreateOrder from '~/components/modals/create/CreateOrder.vue'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import DxfViewer from '~/components/File/DxfViewer.vue'
import SelectPmp from '~/components/form/SelectPmp.vue'

export default {
  components: {
    SelectPmp,
    DxfViewer,
    InputWithLabels,
    CreateOrder,
    TextareaWithLabel,
    SelectWithLabel,
  },
  layout: 'EngineerLayout',
  middleware: ['engineer', 'roleRedirect'],
  data() {
    return {
      isSelectedClient: false,
      factories: {
        ids: [],
        files: {},
      },
      isDoneDetails: true,
      selectedClient: null,
      selectedPmp: null,
      selectedPmpRemoteNumber: null,
      order: {
        name: null,
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
    }
  },
  computed: {
    ...mapGetters('factory', ['getFactory']),
    ...mapGetters('users', ['getUsers']),
    ...mapGetters('pmp', ['getPmpes', 'getPmp']),
    users() {
      return this.getUsers
    },
    pnpGroup() {
      return this.getPmpes || []
    },
    pnpName() {
      if (!this.selectedPmp || !this.selectedPmp.remote_number) return []
      const selectedPmpData = this.pnpGroup.pmp.find(
        (pmp) => pmp.id === this.selectedPmp.id
      )

      return selectedPmpData
        ? selectedPmpData.remote_number.map((p) => p.remote_number)
        : []
    },
  },
  mounted() {
    this.fetchUsers()
    this.fetchFactory()
    this.fetchPmps()
  },
  methods: {
    ...mapActions('factory', ['fetchFactory']),
    ...mapActions('users', ['fetchUsers']),
    ...mapActions('engineer', ['createNewOrder']),
    ...mapActions('pmp', [
      'checkIfGroupExists',
      'fetchPmps',
      'checkIfGroupNameExists',
      'checkIfGroupExists',
    ]),
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
        this.$notify({
          text: `Գործարան ընտրված չէ:`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'success',
        })
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
      this.$router.push('/engineer/pmp.files')
    },

    async fetchFile(filePath) {
      try {
        const response = await this.$axios.get(
          `/api/factories/getFile/${encodeURIComponent(filePath)}`,
          { responseType: 'arraybuffer' } // Ափդեյթ արած responseType
        )
        const fileType = 'application/x-dxf'
        const blob = new Blob([response.data], { type: fileType })
        return new File([blob], filePath.split('/').pop(), { type: fileType })
      } catch (error) {
        console.error(`Error fetching file ${filePath}:`, error)
        return null
      }
    },

    async pmpFiles() {
      this.formSubmitted = true
      if (
        !this.selectedClient ||
        !this.selectedPmp ||
        !this.selectedPmpRemoteNumber ||
        !this.order.description
      ) {
        this.$notify({
          text: `Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը։`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        return
      }

      const formData = new FormData()
      formData.append('user_id', this.selectedClient.id)
      formData.append(
        'name',
        `${this.selectedPmp.group}.${this.selectedPmpRemoteNumber}`
      )
      formData.append('description', this.order.description)
      formData.append('status', this.order.status || 'pending')

      if (this.selectedPmp.files.length > 0) {
        const factoryFilesMap = {}
        this.selectedPmp.files.forEach((file) => {
          if (!factoryFilesMap[file.factory_id]) {
            factoryFilesMap[file.factory_id] = []
          }
          factoryFilesMap[file.factory_id].push(file)
        })

        for (const factoryId of Object.keys(factoryFilesMap)) {
          formData.append(`factories[${factoryId}][id]`, factoryId)

          for (
            let index = 0;
            index < factoryFilesMap[factoryId].length;
            index++
          ) {
            const file = factoryFilesMap[factoryId][index]
            try {
              const realFile = await this.fetchFile(file.path)
              if (realFile) {
                formData.append(
                  `factories[${factoryId}][files][${index}]`,
                  realFile
                )
                formData.append(
                  `factories[${factoryId}][files_quantity][]`,
                  file.quantity
                )
                formData.append(
                  `factories[${factoryId}][files_material_type][]`,
                  file.material_type
                )
                formData.append(
                  `factories[${factoryId}][files_thickness][]`,
                  file.thickness
                )
              } else {
                console.warn(`File ${file.path} not fetched`)
              }
            } catch (error) {
              console.error(`Error fetching file ${file.path}:`, error)
            }
          }
        }

        try {
          await this.createNewOrder(formData)
          this.$notify({
            text: `Ֆայլերը հաջողությամբ վերբեռնվեցին։`,
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'success',
          })
          this.resetForm()
        } catch (error) {
          this.$notify({
            text: `Ֆայլերի վերբեռնման սխալ՝ ${
              error.response?.data || error.message
            }`,
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'error',
          })
        }
      } else {
        this.$notify({
          text: `Ընտրված PMP ֆայլեր չունի։`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
      }
    },
    resetForm() {
      this.selectedClient = null
      this.selectedPmp = null
      this.selectedPmpRemoteNumber = null
      this.order.description = ''
      this.formSubmitted = false
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
