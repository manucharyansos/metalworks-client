<template>
  <main class="p-4 flex flex-col items-start gap-1 relative">
    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50"
      aria-busy="true"
    >
      <svg
        aria-hidden="true"
        role="status"
        class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="#1C64F2"
        />
      </svg>
    </div>

    <!-- Breadcrumb -->
    <nav
      v-if="breadcrumb.length > 0"
      class="flex py-3 px-1.5 border border-gray-300 shadow-md shadow-gray-600 w-full"
      aria-label="Breadcrumb"
    >
      <ol
        class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse"
      >
        <li
          v-for="(item, index) in breadcrumb"
          :key="index"
          class="inline-flex items-center cursor-pointer"
        >
          <div
            class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
            @click="selectBreadcrumb(index)"
          >
            <template v-if="index === 0">
              <svg
                class="w-3 h-3 me-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"
                />
              </svg>
            </template>
            <template v-else>
              <svg
                class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            </template>
            {{ item }}
          </div>
        </li>
      </ol>
    </nav>

    <div class="flex flex-row items-start gap-4">
      <div
        class="flex items-start gap-4 border-r border-r-gray-300 pr-4 h-screen pt-6"
      >
        <div v-if="isOpen === 'remote_number'" class="flex flex-col gap-2">
          <div
            v-for="number in getPmp.remote_number"
            :key="number.id"
            class="grid grid-cols-3 items-center border border-gray-300 rounded-lg w-64 cursor-pointer p-2"
            @click="showFiles(number)"
          >
            <img class="size-16" src="/dxf.png" alt="DXF" />
            <div class="flex flex-col col-span-2 px-2">
              <span>{{ number.remote_number }}</span>
              <span>{{ number.remote_number_name }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="isOpen === 'factories'"
          class="flex flex-col items-start justify-center"
        >
          <div class="flex flex-col gap-2">
            <div v-for="factory in getFactory" :key="factory.id">
              <button
                class="border border-gray-300 rounded-lg w-64 p-2"
                :class="{
                  'bg-gray-900 text-white': selectedFactoryId === factory.id,
                  'bg-gray-600 text-white': hasFiles(factory.id),
                }"
                @click="selectFactory(factory)"
                :disabled="loading"
              >
                {{ factory?.value }}
              </button>
              <transition name="slide-down">
                <div
                  v-show="isOpenFiles === factory.id"
                  class="flex flex-col gap-2 my-6"
                >
                  <div
                    v-for="file in selectedFiles"
                    :key="file.id"
                    class="flex justify-between border border-gray-300 rounded-lg w-64 p-2 cursor-pointer truncate hover:!truncate"
                    @mouseover="showButton(file.id)"
                    @mouseleave="hideButton(file.id)"
                  >
                    <div
                      class="w-44 truncate"
                      @click="viewFile(file.path, file)"
                    >
                      {{ file.original_name }}
                    </div>
                    <div v-if="hoveredFileId === file.id" class="z-20">
                      <svg
                        v-if="!loading"
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="20"
                        height="20"
                        viewBox="0 0 30 30"
                        fill="red"
                        @click="isOpenModal = !isOpenModal"
                      >
                        <path
                          d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"
                        ></path>
                      </svg>
                      <svg
                        v-else
                        aria-hidden="true"
                        role="status"
                        class="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="#1C64F2"
                        />
                      </svg>
                    </div>
                    <PopupModal
                      :is-open-modal="isOpenModal"
                      text="Վստահ եք որ ուզում եք ջնջել՞"
                      @closeModal="closeModal"
                      @confirm="deleteDxfFile(file.id)"
                    />
                  </div>
                  <div class="w-64 mt-12">
                    <button
                      class="bg-green-600 rounded-lg text-white w-full py-1.5"
                      @click="openAddFileModal"
                      :disabled="loading"
                    >
                      Ավելացնել ֆայլ
                    </button>
                    <AddFileModal
                      :is-open-modal="isOpenAddFileModal"
                      :file="currentFile"
                      :is-dxf-file="isDxfFile"
                      @closeModal="openAddFileModal"
                      @createFile="addFile"
                    >
                      <template #file-input>
                        <input
                          type="file"
                          class="hidden"
                          @change="handleFileChange"
                          :disabled="loading"
                        />
                      </template>
                      <template #quantity>
                        <input-with-label-icon
                          v-model="fileData.quantity"
                          type="number"
                          name="quantity"
                          placeholder=" "
                          label="Քանակ լրակազմում"
                          label_-id="quantity"
                          for_-l-abel="quantity"
                          :disabled="loading"
                        />
                      </template>
                      <template #materialType>
                        <div class="relative">
                          <input-with-label-icon
                            v-model="fileData.material"
                            type="text"
                            name="materialType"
                            placeholder=" "
                            label="Նյութ"
                            label_-id="materialType"
                            for_-l-abel="materialType"
                            @focus="openMaterials"
                            :disabled="loading"
                          />
                          <button
                            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                            @click="openMaterials"
                            :disabled="loading"
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
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          <div
                            v-if="isSelectedMaterials"
                            class="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
                          >
                            <ul class="py-1">
                              <li
                                v-for="material in filteredMaterials"
                                :key="material.id"
                                class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                                @click="selectMaterial(material)"
                              >
                                {{ material.description }}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </template>
                      <template #thickness>
                        <input-with-label-icon
                          v-model="fileData.thickness"
                          type="text"
                          name="thickness"
                          placeholder=" "
                          label="Հաստություն"
                          label_-id="thickness"
                          for_-l-abel="thickness"
                          :disabled="loading"
                        />
                      </template>
                    </AddFileModal>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full">
        <div
          v-if="selectedFile"
          class="description_section flex flex-col items-start justify-between border border-gray-300 rounded-md h-28 px-4 my-6"
        >
          <div>Քանակ։ {{ selectedFile?.quantity }}</div>
          <div>Մատերիալի տեսակ։ {{ selectedFile?.material_type }}</div>
          <div>Հաստություն։ {{ selectedFile?.thickness }}</div>
        </div>
        <div
          v-if="dxfUrl"
          class="flex flex-col items-center justify-center mt-20"
        >
          <p v-if="selectedFile" class="my-6">
            {{ selectedFile.original_name }}
          </p>
          <DxfViewer
            v-if="dxfUrl"
            :key="dxfUrl"
            :dxf-url="dxfUrl"
            style="width: 700px"
          />
        </div>
      </div>
    </div>
    <notifications />
  </main>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import DxfViewer from '~/components/File/DxfViewer.vue'
import PopupModal from '~/components/modals/popup-modal/Popup-Modal.vue'
import AddFileModal from '~/components/modals/add-file/AddFile.vue'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'

export default {
  components: {
    InputWithLabelIcon,
    AddFileModal,
    PopupModal,
    DxfViewer,
  },
  layout: 'EngineerLayout',
  middleware: ['engineer', 'roleRedirect'],
  data() {
    return {
      loading: false,
      isOpen: 'remote_number',
      isOpenFiles: 'files_by_id',
      id: '',
      dxfUrl: '',
      selectedFactoryId: null,
      selectedRemoteNumber: null,
      selectedRemoteNumberId: null,
      selectedFiles: [],
      selectedFile: null,
      breadcrumb: [],
      hoveredFileId: null,
      isOpenModal: false,
      isOpenAddFileModal: false,
      isDxfFile: false,
      isSelectedMaterials: false,
      fileData: {
        quantity: null,
        material: '',
        thickness: '',
        file: null,
      },
      currentFile: {
        name: '',
        size: 0,
      },
    }
  },
  computed: {
    ...mapGetters('pmp', ['getPmp', 'errorMessage']),
    ...mapGetters('factory', ['getFactory']),
    ...mapGetters('materials', ['getMaterials']),
    materials() {
      return this.getMaterials || []
    },
    filteredMaterials() {
      if (!this.fileData.material) return this.materials
      return this.materials.filter((material) =>
        material.description
          .toLowerCase()
          .includes(this.fileData.material.toLowerCase())
      )
    },
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(newId) {
        this.id = newId
        this.loading = true
        Promise.all([this.fetchPmp(this.id), this.fetchFactory()])
          .finally(() => {
            this.loading = false
          })
      },
    },
  },
  methods: {
    ...mapActions('pmp', ['fetchPmp', 'deleteFile', 'createPmpFilesByFactory']),
    ...mapActions('factory', ['fetchFactory']),
    ...mapActions('materials', ['fetchMaterials']),
    openMaterials() {
      this.loading = true
      this.fetchMaterials()
        .then(() => {
          this.isSelectedMaterials = !this.isSelectedMaterials
        })
        .finally(() => {
          this.loading = false
        })
    },
    selectMaterial(material) {
      this.fileData.material = material.description
      this.fileData.thickness = material.thickness
      this.isSelectedMaterials = false
    },
    showButton(fileId) {
      this.hoveredFileId = fileId
    },
    hideButton(fileId) {
      if (this.hoveredFileId === fileId) {
        this.hoveredFileId = null
      }
    },
    showFiles(number) {
      this.isOpen = 'factories'
      this.selectedRemoteNumber = number
      this.selectedRemoteNumberId = number.id
      this.selectedFiles = this.getPmp.files.filter(
        (f) => f.remote_number_id === number.id
      )
      this.updateBreadcrumb(number.remote_number_name)
    },
    selectFactory(factory) {
      if (factory.value === 'DXF') {
        this.isDxfFile = true
      }
      if (this.isOpenFiles === factory.id) {
        this.isOpenFiles = null
      } else {
        this.isOpenFiles = factory.id
      }
      this.selectedFactoryId = factory.id
      this.selectedFiles = this.getPmp.files.filter(
        (file) => file.factory_id === factory.id
      )
      if (this.breadcrumb.length > 1) {
        this.breadcrumb.splice(1, 1, factory.value)
      } else {
        this.breadcrumb.push(factory.value)
      }
    },
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.currentFile = {
          name: file.name,
          size: file.size,
        }
        this.fileData.file = file
      } else {
        this.currentFile = {
          name: '',
          size: 0,
        }
        this.fileData.file = null
      }
    },
    async addFile() {
      const { file, quantity, material, thickness } = this.fileData
      const isDxfFactory = this.isDxfFile
      if (isDxfFactory) {
        if (!file || !quantity || !material || !thickness) {
          this.$notify({
            text: `Խնդրում ենք լրացնել բոլոր դաշտերը և ընտրել ֆայլ:`,
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'warning',
          })
          return
        }
      } else if (!file) {
        this.$notify({
          text: `Խնդրում ենք ընտրել ֆայլ:`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'warning',
        })
        return
      }
      this.loading = true
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pmp_id', this.getPmp.id)
      formData.append('remote_number_id', this.selectedRemoteNumberId)
      formData.append('factory_id', this.selectedFactoryId)
      if (isDxfFactory) {
        formData.append('quantity', quantity)
        formData.append('material_type', material)
        formData.append('thickness', thickness)
      }
      try {
        const isSuccess = await this.createPmpFilesByFactory(formData)
        if (isSuccess) {
          this.$notify({
            text: `Ֆայլը հաջողությամբ ավելացվեց:`,
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'success',
          })
          await this.fetchPmp(this.id)
          this.selectedFiles = this.getPmp.files.filter(
            (f) =>
              f.remote_number_id === this.selectedRemoteNumberId &&
              f.factory_id === this.selectedFactoryId
          )
          this.openAddFileModal()
          this.fileData = {
            file: null,
            quantity: '',
            material: '',
            thickness: '',
          }
        } else {
          this.$notify({
            text: this.errorMessage.error || this.errorMessage.error.message,
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'error',
          })
        }
      } finally {
        this.loading = false
      }
    },
    viewFile(filePath, file) {
      if (!this.breadcrumb.includes(file.original_name)) {
        if (this.breadcrumb.length > 2) {
          this.breadcrumb.pop()
        }
        this.breadcrumb.push(file.original_name)
      }
      this.selectedFile = file
      this.dxfUrl = filePath
      this.isOpenFiles = file.factory_id
    },
    async deleteDxfFile(fileId) {
      this.loading = true
      try {
        const res = await this.deleteFile(fileId)
        if (res) {
          await this.fetchPmp(this.id)
          this.updateBreadcrumb(this.selectedRemoteNumberId)
          if (this.selectedFile && this.selectedFile.id === fileId) {
            this.selectedFile = null
            this.dxfUrl = ''
            this.isOpenModal = false
          }
          this.selectedFiles = this.selectedFiles.filter(
            (file) => file.id !== fileId
          )
        }
      } finally {
        this.loading = false
      }
    },
    openAddFileModal() {
      this.isOpenAddFileModal = !this.isOpenAddFileModal
      if (!this.isOpenAddFileModal) {
        this.resetFileFields()
      }
    },
    resetFileFields() {
      this.fileData = {
        quantity: null,
        material: '',
        thickness: '',
        file: null,
      }
    },
    closeModal() {
      this.isOpenModal = false
    },
    selectBreadcrumb(index) {
      this.breadcrumb = this.breadcrumb.slice(0, index + 1)
      if (index === 0) {
        this.isOpen = 'remote_number'
        this.selectedFactoryId = null
        this.selectedRemoteNumberId = null
        this.dxfUrl = null
        this.selectedFiles = []
      } else if (index === 1) {
        this.isOpen = 'factories'
        this.dxfUrl = null
        const selectedRemoteNumberName = this.breadcrumb[1]
        const selectedRemoteNumberId = this.getPmp.remote_number.find(
          (number) => number.remote_number_name === selectedRemoteNumberName
        )
        if (selectedRemoteNumberId) {
          this.selectedRemoteNumberId = selectedRemoteNumberId.id
          this.selectedFiles = this.getPmp.files.filter(
            (f) => f.remote_number_id === this.selectedRemoteNumberId
          )
        }
      } else if (index === 2) {
        this.isOpen = 'files_by_id'
        const selectedFactoryName = this.breadcrumb[2]
        const selectedFactory = this.getFactory.find(
          (factory) => factory.value === selectedFactoryName
        )
        if (selectedFactory) {
          this.selectedFactoryId = selectedFactory.id
          this.selectedFiles = this.getPmp.files.filter(
            (f) => f.factory_id === this.selectedFactoryId
          )
        }
      }
    },
    hasFiles(factoryId) {
      return this.getPmp.files.some((f) => f.factory_id === factoryId)
    },
    updateBreadcrumb(item) {
      if (!this.breadcrumb.includes(item)) {
        this.breadcrumb.push(item)
      }
    },
  },
}
</script>
<style scoped>
.slide-down-enter-active {
  transition: all 1.5s ease-in-out;
}
.slide-down-enter-from {
  transition: all 1.5s ease-in-out;
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
