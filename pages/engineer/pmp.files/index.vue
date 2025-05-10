<template>
  <div
    class="flex flex-col items-center w-full gap-12 border border-neutral-400 shadow-xl rounded-xl py-4 m-6 relative"
  >
    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="loader">Բեռնում...</div>
    </div>

    <!-- Existing Template -->
    <div class="flex items-center justify-center gap-12 w-full">
      <h1>PMP_</h1>
      <input-with-label-icon
        id="group"
        v-model="pmp.group"
        type="number"
        data-input-counter
        class="w-44 text-center"
        placeholder="###"
        required
        :disabled="loading"
      />
      <input-with-label-icon
        id="group_name"
        v-model="pmp.group_name"
        type="text"
        data-input-counter
        class="w-64"
        placeholder="Խմբի անվանում"
        required
        :disabled="loading"
      />
      <input-with-label-icon
        id="remote_number"
        v-model="pmp.remote_number"
        type="number"
        data-input-counter
        class="w-44 text-center"
        placeholder="##"
        required
        :disabled="loading"
      />
      <button
        v-if="getPmp.exists !== true"
        type="button"
        class="bg-green-600 rounded-xl text-white font-sans italic px-3 py-1"
        :disabled="loading"
        @click="addPmp"
      >
        Ավելացնել Նորը
      </button>
      <button
        v-else
        class="bg-green-600 rounded-xl text-white font-sans italic px-3 py-1"
        :disabled="loading"
        @click="remoteNumber"
      >
        Ավելացնել հերթական համար
      </button>
    </div>

    <!-- Rest of the Template (unchanged for brevity) -->
    <div v-if="getPmp">
      {{ getPmp?.pmp?.group_name || 'Տվյալներ չկան' }}
    </div>
    <template v-if="isSelectPmp">
      PMP_ {{ pmp.group }} ․ {{ selectedRemoteNumberValue }} /
      {{ selectedFactory }}
    </template>

    <div class="w-full flex flex-col items-center gap-12">
      <h2>Հերթական համար</h2>
      <div
        v-if="pmp.group && pmp.group_name"
        class="flex flex-row items-center mx-auto gap-12"
      >
        <div v-for="(pmp, index) in remoteNumberOptions" :key="index">
          <button
            :class="{
              'border border-neutral-600 rounded-lg px-3 py-1 italic font-sans': true,
              'bg-gray-900 text-white': selectedRemoteNumber === pmp.id,
              'bg-gray-600 text-white':
                pmpFiles.files[pmp.id] && pmpFiles.files[pmp.id].length > 0,
            }"
            :disabled="loading"
            @click="selectPmp(pmp)"
          >
            {{ pmp.remote_number }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="pmp.group && pmp.group_name"
      class="w-full flex flex-col items-center gap-12"
    >
      <h2>Ընտրել այստեղ</h2>
      <div class="flex flex-row items-center mx-auto gap-12">
        <div v-for="(factory, index) in getFactory" :key="index">
          <button
            :class="{
              'border border-neutral-600 rounded-lg px-3 py-1 italic font-sans': true,
              'bg-gray-900 text-white': selectedFactoryId === factory.id,
              'bg-gray-600 text-white':
                pmpFiles.files[selectedRemoteNumber] &&
                pmpFiles.files[selectedRemoteNumber][factory.id] &&
                pmpFiles.files[selectedRemoteNumber][factory.id].length > 0,
            }"
            :disabled="loading"
            @click="selectFactory(factory)"
          >
            {{ factory?.value }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-12 mt-4">
      <input-with-label-icon
        id="quantity"
        v-model="pmp.quantity"
        type="number"
        data-input-counter
        class="w-44 text-center"
        placeholder="Քանակ"
        required
        :disabled="loading"
      />
      <input-with-label-icon
        id="material_type"
        v-model="pmp.material_type"
        type="text"
        data-input-counter
        class="w-44 text-center"
        placeholder="Մատերիալի տեսակը"
        required
        :disabled="loading"
      />
      <input-with-label-icon
        id="thickness"
        v-model="pmp.thickness"
        type="text"
        data-input-counter
        class="w-44 text-center"
        placeholder="Հաստություն"
        required
        :disabled="loading"
      />
    </div>

    <div v-if="selectedRemoteNumber" class="container flex flex-col">
      <div class="grid grid-cols-2 gap-8">
        <div class="show_file_section">
          <DxfViewer v-if="dxfUrl" :key="dxfUrl" :dxf-url="dxfUrl" />
        </div>
        <div class="show_files_name min-h-96 max-h-[32rem] overflow-y-auto">
          <div class="w-full my-4">
            <input type="file" :disabled="loading" @change="handleFileChange" />
          </div>
          <div v-if="selectedRemoteNumber && selectedFactoryId">
            <ol class="list-decimal px-3">
              <li
                v-for="(file, index) in pmpFiles.files[selectedRemoteNumber][
                  selectedFactoryId
                ]"
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
                  <span>{{ file?.name }}</span>
                  <div class="ml-auto" @click.stop="deleteFile(index)">
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
      <div
        class="flex flex-row items-center justify-end gap-12 text-right my-3"
      >
        <button
          class="border border-green-700 bg-green-700 text-white rounded-xl px-3 py-1"
          :disabled="loading"
          @click="saveFiles"
        >
          Պահպանել Ֆայլերը
        </button>
      </div>
    </div>
    <notifications />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DxfViewer from '~/components/File/DxfViewer.vue'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'

export default {
  components: {
    InputWithLabelIcon,
    DxfViewer,
  },
  layout: 'EngineerLayout',
  middleware: ['engineer', 'roleRedirect'],
  data() {
    return {
      timeout: null,
      isSelectPmp: false,
      selectedRemoteNumber: null,
      selectedRemoteNumberValue: null,
      selectedFactory: null,
      selectedFactoryId: null,
      pmp: {
        group: '',
        group_name: '',
        remote_number: null,
        quantity: null,
        material_type: '',
        thickness: '',
      },
      pmpFiles: {
        ids: [],
        files: {},
        factoryIds: [],
      },
      isDoneDetails: true,
      selectedClient: null,
      formSubmitted: false,
      isSelectedLaser: false,
      isSelectedBend: false,
      fileNames: [],
      dxfUrl: '',
      files: [],
      selectedFileIndex: null,
      pmpId: null,
      loading: false,
    }
  },
  computed: {
    ...mapGetters('users', ['getUsers']),
    ...mapGetters('factory', ['getFactory']),
    ...mapGetters('engineer', ['getOrder']),
    ...mapGetters('pmp', ['getPmp', 'getPmpes']),
    users() {
      return this.getUsers
    },
    remoteNumberOptions() {
      if (this.getPmp.pmp && this.getPmp.pmp.remote_number) {
        return this.getPmp.pmp.remote_number.map((item) => ({
          id: item.id,
          remote_number: item.remote_number,
        }))
      }
      return []
    },
  },
  watch: {
    'pmp.group': function (newVal, oldVal) {
      clearTimeout(this.timeout)
      if (!newVal) {
        this.pmp.group_name = ''
        return
      }
      this.timeout = setTimeout(async () => {
        if (newVal.length === 3) {
          this.loading = true
          try {
            const groupName = await this.checkGroupExists(newVal)
            if (groupName) {
              this.pmp.group_name = groupName
            }
          } finally {
            this.loading = false
          }
        }
      }, 500)
    },
    'pmp.group_name': function (newVal, oldVal) {
      clearTimeout(this.timeout)
      if (!newVal) {
        this.pmp.group = ''
        return
      }
      this.timeout = setTimeout(async () => {
        if (newVal.length >= 3) {
          this.loading = true
          try {
            const group = await this.checkGroupNameExists(newVal)
            if (group) {
              this.pmp.group = group
            }
          } finally {
            this.loading = false
          }
        }
      }, 500)
    },
  },
  mounted() {
    this.loading = true
    Promise.all([this.fetchUsers(), this.fetchPmps(), this.fetchFactory()])
      .then(() => {
        this.formSubmitted = true
        this.isDoneDetails = false
        this.selectedRemoteNumber = 1
        if (!this.pmpFiles.ids.includes(1)) {
          this.pmpFiles.ids.push(1)
        }
        if (!this.pmpFiles.files[1]) {
          this.pmpFiles.files[1] = []
        }
        this.selectedFileIndex = null
        this.dxfUrl = ''
        this.fileNames = []
        this.pmpId = this.getPmp?.pmp?.id
      })
      .finally(() => {
        this.loading = false
      })
  },
  methods: {
    ...mapActions('users', ['fetchUsers']),
    ...mapActions('factory', ['fetchFactory']),
    ...mapActions('engineer', [
      'createNewOrder',
      'fetchOrderDataById',
      'saveOrderFilesByFactory',
    ]),
    ...mapActions('pmp', [
      'fetchPmps',
      'checkIfGroupExists',
      'checkIfGroupNameExists',
      'createPmp',
      'createPmpFilesByFactory',
      'rememberNumberPmp',
    ]),
    resetPmpData() {
      this.pmp.group = ''
      this.pmp.group_name = ''
      this.pmp.remote_number = null
    },
    async checkGroupExists(group) {
      const exists = await this.checkIfGroupExists(group)
      if (exists) {
        this.pmpId = this.getPmp?.pmp?.id
        this.pmp.group_name = this.getPmp?.pmp?.group_name || ''
      } else {
        console.log(this.pmp.group_name, 'group name not found')
        this.pmp.group_name = ''
      }
    },
    async checkGroupNameExists(groupName) {
      const exists = await this.checkIfGroupNameExists(groupName)
      if (exists) {
        this.pmpId = this.getPmp?.pmp?.id
        this.pmp.group = this.getPmp?.pmp?.group || ''
      } else {
        console.log(this.pmp.group, 'gn')
      }
    },
    debounce(func, wait = 500) {
      let timeout
      return function (...args) {
        const context = this
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(context, args), wait)
      }
    },
    async addPmp() {
      if (!this.pmp.group || !this.pmp.remote_number) {
        console.error('Group or Remote Number is missing.')
        return
      }
      this.loading = true
      try {
        const pmp = {
          group: this.pmp.group.padStart(3, '0'),
          group_name: this.pmp.group_name,
          remote_number: this.pmp.remote_number.padStart(2, '0'),
          admin_confirmation: true,
        }
        await this.createPmp(pmp)
        await this.resetPmpData()
      } finally {
        this.loading = false
      }
    },
    async remoteNumber() {
      if (!this.pmp.group || !this.pmp.remote_number) {
        console.error('Group or Remote Number is missing.')
        return
      }
      this.loading = true
      try {
        const data = {
          id: this.getPmp.pmp.id,
          group: this.pmp.group.padStart(3, '0'),
          group_name: this.pmp.group_name,
          remote_number: this.pmp.remote_number.padStart(2, '0'),
          admin_confirmation: true,
        }
        await this.rememberNumberPmp(data)
        await this.resetPmpData()
      } finally {
        this.loading = false
      }
    },
    async initializeFiles() {
      if (this.files) {
        this.loading = true
        try {
          for (const factoryOrder of this.files) {
            const factoryId = factoryOrder.factory_id
            if (!this.pmpFiles.files[factoryId]) {
              this.pmpFiles.files[factoryId] = []
            }
            for (const file of factoryOrder.files) {
              const response = await fetch(`/${file.path}`)
              const blob = await response.blob()
              const fileObject = new File([blob], file.original_name, {
                type: 'application/dxf',
              })
              this.pmpFiles.files[factoryId].push(fileObject)
            }
          }
        } catch (error) {
          console.error('Error loading file:', error)
        } finally {
          this.loading = false
        }
      }
    },
    selectPmp(remoteNumber) {
      this.isSelectPmp = true
      this.selectedRemoteNumber = remoteNumber.id
      this.selectedRemoteNumberValue = remoteNumber.remote_number
      if (!this.pmpFiles.files[remoteNumber.id]) {
        this.pmpFiles.files[remoteNumber.id] = {}
      }
      this.selectedFileIndex = null
      this.dxfUrl = ''
      this.fileNames = []
    },
    selectFactory(factory) {
      this.selectedFactoryId = factory.id
      this.selectedFactory = factory.value
      if (!this.pmpFiles.files[this.selectedRemoteNumber]) {
        this.pmpFiles.files[this.selectedRemoteNumber] = {}
      }
      if (!this.pmpFiles.files[this.selectedRemoteNumber][factory.id]) {
        this.pmpFiles.files[this.selectedRemoteNumber][factory.id] = []
      }
      this.selectedFileIndex = null
      this.dxfUrl = ''
      this.fileNames = []
    },
    handleFileChange(event) {
      const newFiles = Array.from(event.target.files)
      if (this.selectedRemoteNumber && this.selectedFactoryId) {
        if (!this.pmpFiles.files[this.selectedRemoteNumber]) {
          this.pmpFiles.files[this.selectedRemoteNumber] = {}
        }
        this.pmpFiles.files[this.selectedRemoteNumber][this.selectedFactoryId] =
          newFiles.slice(-1)
        this.fileNames = this.pmpFiles.files[this.selectedRemoteNumber][
          this.selectedFactoryId
        ].map((file) => file.name)
        this.loadFile(newFiles[0])
      } else {
        console.error('Գործարան կամ հեռակա համար ընտրված չէ')
      }
    },
    selectFile(index) {
      if (this.selectedRemoteNumber && this.selectedFactoryId) {
        const selectedFile =
          this.pmpFiles.files[this.selectedRemoteNumber][
            this.selectedFactoryId
          ][index]
        this.selectedFileIndex = index
        this.loadFile(selectedFile)
      }
    },
    deleteFile(index) {
      if (this.selectedRemoteNumber && this.selectedFactoryId) {
        this.pmpFiles.files[this.selectedRemoteNumber][
          this.selectedFactoryId
        ].splice(index, 1)
        if (
          this.pmpFiles.files[this.selectedRemoteNumber][this.selectedFactoryId]
            .length === 0
        ) {
          this.dxfUrl = ''
          this.selectedFileIndex = null
        } else {
          this.selectedFileIndex = 0
          this.loadFile(
            this.pmpFiles.files[this.selectedRemoteNumber][
              this.selectedFactoryId
            ][0]
          )
        }
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
    saveFiles() {
      const formData = new FormData()
      formData.append('pmp_id', this.pmpId)
      if (this.selectedRemoteNumber && this.selectedFactoryId) {
        const files =
          this.pmpFiles.files[this.selectedRemoteNumber][
            this.selectedFactoryId
          ] || []
        if (files.length > 0) {
          this.loading = true
          const file = files[0]
          formData.append('file', file)
          formData.append('remote_number_id', this.selectedRemoteNumber)
          formData.append('factory_id', this.selectedFactoryId)
          formData.append('quantity', this.pmp.quantity)
          formData.append('material_type', this.pmp.material_type)
          formData.append('thickness', this.pmp.thickness)
          this.createPmpFilesByFactory(formData)
            .then(() => {
              alert('Ֆայլը հաջողությամբ պահպանված է։')
            })
            .catch((error) => {
              console.error('Ֆայլը պահպանելիս սխալ:', error)
              alert('Ֆայլը պահպանելիս սխալ։')
            })
            .finally(() => {
              this.loading = false
            })
        }
      } else {
        console.error('Գործարան կամ հեռակա համար ընտրված չէ')
      }
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
/* Loading Spinner */
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
