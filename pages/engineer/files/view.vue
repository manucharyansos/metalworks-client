<template>
  <main class="p-4 flex flex-col gap-3 relative">
    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-gray-200/60 flex items-center justify-center z-50">
      <svg class="w-8 h-8 text-blue-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="2" class="opacity-25" />
        <path d="M4 12a8 8 0 018-8" stroke-width="2" class="opacity-75" />
      </svg>
    </div>

    <!-- Breadcrumb -->
    <nav v-if="breadcrumb.length" class="w-full">
      <ol class="flex flex-wrap items-center gap-1 text-sm text-gray-700">
        <li v-for="(item, index) in breadcrumb" :key="index" class="flex items-center">
          <button class="inline-flex items-center gap-1 px-1.5 py-1 hover:text-blue-600" @click="selectBreadcrumb(index)">
            <span v-if="index === 0" class="sr-only">Գլխավոր</span>
            <svg v-if="index !== 0" class="w-3 h-3 text-gray-400" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 9l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="truncate max-w-[40vw] sm:max-w-[60vw]">{{ item }}</span>
          </button>
        </li>
      </ol>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <!-- Left column -->
      <aside class="lg:border-r lg:border-gray-200 lg:pr-6 lg:min-h-[70vh]">
        <!-- Remote numbers -->
        <section v-if="isOpen === 'remote_number'" class="flex flex-col gap-2">
          <button
            v-for="number in getPmp.remote_number"
            :key="number.id"
            class="grid grid-cols-[64px_1fr] gap-3 items-center border border-gray-200 rounded-lg p-2 text-left hover:shadow-sm"
            @click="showFiles(number)"
          >
            <img class="w-16 h-16 object-contain" src="/dxf.png" alt="DXF" />
            <div class="truncate">
              <div class="font-medium">{{ number.remote_number }}</div>
              <div class="text-gray-600 truncate">{{ number.remote_number_name }}</div>
            </div>
          </button>
        </section>

        <!-- Factories -->
        <section v-else-if="isOpen === 'factories'" class="flex flex-col gap-2">
          <div v-for="factory in getFactory" :key="factory.id">
            <button
              class="w-full border border-gray-200 rounded-lg p-2 flex items-center justify-between hover:bg-gray-50"
              :class="{
                'bg-gray-900 text-white hover:bg-gray-900': selectedFactoryId === factory.id,
                'bg-gray-600 text-white': hasFiles(factory.id),
              }"
              :disabled="loading"
              @click="selectFactory(factory)"
            >
              <span class="truncate">{{ factory.value }}</span>
              <span v-if="loadingFactoryId === factory.id">
                <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75" />
                </svg>
              </span>
              <span v-else-if="hasFiles(factory.id)" class="text-green-400">✔</span>
            </button>

            <transition name="slide-down">
              <div v-show="isOpenFiles === factory.id" class="mt-3 flex flex-col gap-2">
                <div
                  v-for="file in selectedFiles"
                  :key="file.id"
                  class="flex items-center justify-between border border-gray-200 rounded-lg p-2 hover:bg-gray-50"
                  @mouseenter="showButton(file.id)"
                  @mouseleave="hideButton(file.id)"
                >
                  <button class="truncate text-left max-w-[220px]" @click="viewFile(file.path, file)">
                    {{ file.original_name }}
                  </button>
                  <div class="flex items-center gap-3">
                    <button class="text-sm text-blue-600 hover:underline" @click.prevent="downloadFile(file)">Ներբեռնել</button>
                    <button v-if="hoveredFileId === file.id" class="text-red-600" @click="openDelete(file.id)">Ջնջել</button>
                  </div>
                </div>


                <div class="mt-4">
                  <button
                    class="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 flex justify-center items-center"
                    :disabled="loading"
                    @click="openAddFileModal"
                  >
                    <span v-if="!loading">Ավելացնել ֆայլ</span>
                    <svg v-else class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75" />
                    </svg>
                  </button>

                  <!-- Add File Modal -->
                  <AddFileModal
                    :is-open-modal="isOpenAddFileModal"
                    :file="currentFile"
                    :is-dxf-file="isDxfFile"
                    text="Ընտրեք ֆայլը և լրացրեք դաշտերը"
                    @closeModal="openAddFileModal"
                    @createFile="addFile"
                  >
                    <template #file-input>
                      <input type="file" class="hidden" :disabled="loading" @change="handleFileChange" />
                    </template>

                    <template v-if="isDxfFile" #quantity>
                      <InputWithLabelIcon v-model="fileData.quantity" type="number" name="quantity" label="Քանակ լրակազմում" :disabled="loading" min="1" />
                    </template>

                    <template v-if="isDxfFile" #materialType>
                      <div class="relative">
                        <InputWithLabelIcon v-model="fileData.material" type="text" name="materialType" label="Նյութ" :disabled="loading" @focus="openMaterials" />
                        <button type="button" class="absolute inset-y-0 right-0 px-3 text-gray-500" :disabled="loading" @click="openMaterials">▼</button>
                        <div v-if="isSelectedMaterials" class="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                          <ul class="py-1">
                            <li v-for="material in filteredMaterials" :key="material.id" class="px-4 py-2 hover:bg-blue-50 cursor-pointer" @click="selectMaterial(material)">
                              {{ material.description }}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </template>

                    <template v-if="isDxfFile" #thickness>
                      <InputWithLabelIcon v-model="fileData.thickness" type="text" name="thickness" label="Հաստություն" :disabled="loading" />
                    </template>

                  </AddFileModal>

                  <PopupModal
                    :is-open-modal="isOpenModal"
                    text="Վստահ եք, որ ուզում եք ջնջել՞"
                    @close-modal="closeModal"
                    @confirm="deleteDxfFile"
                  />

                </div>
              </div>
            </transition>
          </div>
        </section>
      </aside>

      <!-- Right column (viewer) -->
      <section class="min-h-[50vh]">
        <!-- DXF meta -->
        <div v-if="selectedFile && isDxfFile" class="border border-gray-200 rounded-lg p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>Քանակ․ <b>{{ selectedFile?.quantity }}</b></div>
          <div>Նյութ․ <b>{{ selectedFile?.material_type }}</b></div>
          <div>Հաստություն․ <b>{{ selectedFile?.thickness }}</b></div>
        </div>

        <div v-if="selectedFile" class="flex flex-col items-center">
          <p class="my-4 text-center font-medium break-words">{{ selectedFile.original_name }}</p>

          <DxfViewer v-if="fileType === 'dxf' && dxfUrl" :key="dxfUrl" :dxf-url="dxfUrl" class="w-full max-w-[920px]" />

          <div v-if="fileType === 'pdf'" class="w-full">
            <embed :src="fileUrl(selectedFile.path)" type="application/pdf" class="w-full min-h-[60vh] border rounded" />
            <a class="mt-2 inline-block bg-gray-800 text-white rounded px-4 py-1" :href="fileUrl(selectedFile.path)" target="_blank">Բացել նոր պատուհանում</a>
          </div>

          <div v-if="fileType === 'image'" class="w-full flex justify-center">
            <a :href="fileUrl(selectedFile.path)" target="_blank">
              <img :src="fileUrl(selectedFile.path)" class="max-w-full max-h-[70vh] object-contain rounded" :alt="selectedFile.original_name" />
            </a>
          </div>

          <div v-if="fileType === 'cad'" class="text-center">
            <p class="text-gray-600">{{ selectedFile.original_name }} ({{ fileType.toUpperCase() }} ֆայլ)</p>
            <a class="mt-2 inline-block bg-gray-800 text-white rounded px-4 py-1" :href="fileUrl(selectedFile.path)" :download="selectedFile.original_name">Ներբեռնել</a>
          </div>
        </div>
      </section>
    </div>
    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DxfViewer from '~/components/File/DxfViewer.vue'
import PopupModal from '~/components/modals/popup-modal/PopupModal.vue'
import AddFileModal from '~/components/modals/add-file/AddFile.vue'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'

export default {
  name: 'EngineerFilesView',
  components: { InputWithLabelIcon, AddFileModal, PopupModal, DxfViewer },
  layout: 'EngineerLayout',
  middleware: ['engineer', 'roleRedirect'],
  data() {
    return {
      loadingFactoryId: null,
      loading: false,
      isOpen: 'remote_number',
      isOpenFiles: 'files_by_id',
      id: '',
      dxfUrl: '',
      fileType: null,
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
      currentFile: { name: '', size: 0 },
      toDeleteId: null,
    }
  },
  computed: {
    ...mapGetters('pmp', ['getPmp', 'errorMessage']),
    ...mapGetters('factory', ['getFactory']),
    ...mapGetters('materials', ['getMaterials']),
    materials() { return this.getMaterials || [] },
    filteredMaterials() {
      if (!this.fileData.material) return this.materials
      const q = this.fileData.material.toLowerCase()
      return this.materials.filter(m => (m.description || '').toLowerCase().includes(q))
    },
  },
  created() {
    this.id = this.$route.query.id
    if (this.id) {
      this.loading = true
      Promise.all([this.fetchPmp(this.id), this.fetchFactory()])
        .catch((error) => {
          this.$notify({ text: String(error), duration: 3000, speed: 1000, position: 'top', type: 'error' })
        })
        .finally(() => { this.loading = false })
    } else {
      this.$notify({ text: 'Հաշվի ID-ն բացակայում է: Խնդրում ենք ստուգել URL-ը:', duration: 3000, speed: 1000, position: 'top', type: 'error' })
    }
  },
  methods: {
    ...mapActions('pmp', ['fetchPmp', 'deleteFile', 'createPmpFilesByFactory']),
    ...mapActions('factory', ['fetchFactory', 'downloadUploadedFile']),
    ...mapActions('materials', ['fetchMaterials']),

    openMaterials() {
      this.loading = true
      this.fetchMaterials()
        .then(() => { this.isSelectedMaterials = !this.isSelectedMaterials })
        .catch((error) => {
          this.$notify({ text: String(error), duration: 3000, speed: 1000, position: 'top', type: 'error' })
        })
        .finally(() => { this.loading = false })
    },

    selectMaterial(material) {
      this.fileData.material = material.description
      this.fileData.thickness = material.thickness
      this.isSelectedMaterials = false
    },

    showButton(id) { this.hoveredFileId = id },
    hideButton(id) { if (this.hoveredFileId === id) this.hoveredFileId = null },

    showFiles(number) {
      this.isOpen = 'factories'
      this.selectedRemoteNumber = number
      this.selectedRemoteNumberId = number.id
      this.selectedFiles = (this.getPmp.files || []).filter(f => f.remote_number_id === number.id)
      this.dxfUrl = ''
      this.fileType = null
      this.selectedFile = null
      this.isDxfFile = false
      this.resetFileFields()
      this.breadcrumb = [this.getPmp?.group_name || 'PMP', number.remote_number_name]
    },

    selectFactory(factory) {
      this.isDxfFile = factory.value === 'DXF'
      this.loadingFactoryId = factory.id
      this.loading = true
      try {
        this.isOpenFiles = this.isOpenFiles === factory.id ? null : factory.id
        this.selectedFactoryId = factory.id
        this.selectedFiles = (this.getPmp.files || []).filter(f => f.factory_id === factory.id && f.remote_number_id === this.selectedRemoteNumberId)
        this.dxfUrl = ''
        this.fileType = null
        this.selectedFile = null
        if (this.breadcrumb.length > 1) this.breadcrumb.splice(1, 1, factory.value); else this.breadcrumb.push(factory.value)
      } finally {
        this.loadingFactoryId = null
        this.loading = false
      }
    },

    handleFileChange(e) {
      const file = e.target.files?.[0]
      if (file) { this.currentFile = { name: file.name, size: file.size }; this.fileData.file = file }
      else { this.currentFile = { name: '', size: 0 }; this.fileData.file = null }
    },

    async addFile() {
      const { file, quantity, material, thickness } = this.fileData
      const isDxf = this.isDxfFile

      if (isDxf) {
        if (!file || !quantity || !material || !thickness) {
          this.$notify({ text: 'DXF-ի համար բոլոր դաշտերը պարտադիր են՝ ֆայլ, քանակ, նյութ', duration: 3000, speed: 1000, position: 'top', type: 'warning' })
          return
        }
      } else if (!file) {
        this.$notify({ text: 'Խնդրում ենք ընտրել ֆայլ', duration: 3000, speed: 1000, position: 'top', type: 'warning' })
        return
      }

      this.loading = true
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pmp_id', this.getPmp.id)
      formData.append('remote_number_id', this.selectedRemoteNumberId)
      formData.append('factory_id', this.selectedFactoryId)
      if (isDxf) {
        formData.append('quantity', quantity)
        formData.append('material_type', material)
        formData.append('thickness', thickness)
      }

      try {
        const ok = await this.createPmpFilesByFactory(formData)
        if (ok) {
          this.$notify({ text: 'Ֆայլը հաջողությամբ ավելացվեց', duration: 3000, speed: 1000, position: 'top', type: 'success' })
          await this.fetchPmp(this.id)
          this.selectedFiles = (this.getPmp.files || []).filter(f => f.remote_number_id === this.selectedRemoteNumberId && f.factory_id === this.selectedFactoryId)
          this.isOpenAddFileModal = false
          this.resetFileFields()
        } else {
          const msg = this.errorMessage?.error || this.errorMessage?.error?.message || 'Սխալ'
          this.$notify({ text: msg, duration: 3000, speed: 1000, position: 'top', type: 'error' })
        }
      } finally {
        this.loading = false
      }
    },

    viewFile(filePath, file) {
      if (!this.breadcrumb.includes(file.original_name)) {
        if (this.breadcrumb.length > 2) this.breadcrumb.pop()
        this.breadcrumb.push(file.original_name)
      }
      this.selectedFile = file
      this.dxfUrl = filePath
      this.isOpenFiles = file.factory_id
      this.isDxfFile = (file.factory_id === this.selectedFactoryId) && this.isDxfFile
      this.fileType = this.getFileType(file.original_name || filePath)
    },

    async downloadFile(file) {
      if (!file || typeof file.path !== 'string') {
        this.$notify({
          text: 'Ֆայլի ներբեռնումը ձախողվեց:',
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error'
        })
        return
      }

      const sanitizedPath = String(file.path).replace(/\\/g, '/')
      await this.downloadUploadedFile({
        path: sanitizedPath,
        original_name: file.original_name || 'downloaded_file'
      })
    },

    fileUrl(filePath) {
      if (!filePath || typeof filePath !== 'string') return null
      const baseURL = this.$axios.defaults.baseURL
      return `${baseURL}/storage/${filePath}`
    },

    getFileType(name) {
      if (!name || typeof name !== 'string') return null
      const ext = name.toLowerCase().split('.').pop()
      if (ext === 'dxf') return 'dxf'
      if (ext === 'pdf') return 'pdf'
      if (['jpg', 'jpeg', 'png', 'eps'].includes(ext)) return 'image'
      if (['step', 'sldprt', 'sldasm', 'slddrw', 'solid'].includes(ext)) return 'cad'
      return null
    },

    openDelete(id) { this.toDeleteId = id; this.isOpenModal = true },

    async deleteDxfFile() {
      if (!this.toDeleteId) return
      this.loading = true
      try {
        const res = await this.deleteFile(this.toDeleteId)
        if (res) {
          await this.fetchPmp(this.id)
          if (this.selectedFile && this.selectedFile.id === this.toDeleteId) {
            this.selectedFile = null
            this.dxfUrl = ''
            this.fileType = null
          }
          this.selectedFiles = this.selectedFiles.filter(f => f.id !== this.toDeleteId)
          this.$notify({ text: 'Ֆայլը ջնջվեց', duration: 2500, speed: 800, position: 'top', type: 'success' })
        }
      } finally {
        this.isOpenModal = false
        this.toDeleteId = null
        this.loading = false
      }
    },

    openAddFileModal() { this.isOpenAddFileModal = !this.isOpenAddFileModal; if (!this.isOpenAddFileModal) this.resetFileFields() },

    resetFileFields() {
      this.fileData = { quantity: null, material: '', thickness: '', file: null }
      this.currentFile = { name: '', size: 0 }
      this.isSelectedMaterials = false
    },

    closeModal() { this.isOpenModal = false; this.toDeleteId = null },

    selectBreadcrumb(index) {
      this.breadcrumb = this.breadcrumb.slice(0, index + 1)
      if (index === 0) {
        this.isOpen = 'remote_number'
        this.selectedFactoryId = null
        this.selectedRemoteNumberId = null
        this.dxfUrl = null
        this.fileType = null
        this.selectedFiles = []
        this.selectedFile = null
        this.isDxfFile = false
        this.resetFileFields()
      } else if (index === 1) {
        this.isOpen = 'factories'
        this.dxfUrl = null
        this.fileType = null
        this.selectedFile = null
        this.isDxfFile = false
        this.resetFileFields()
        const title = this.breadcrumb[1]
        const rn = (this.getPmp.remote_number || []).find(n => n.remote_number_name === title)
        if (rn) {
          this.selectedRemoteNumberId = rn.id
          this.selectedFiles = (this.getPmp.files || []).filter(f => f.remote_number_id === this.selectedRemoteNumberId)
        }
      } else if (index === 2) {
        this.isOpen = 'files_by_id'
        const facName = this.breadcrumb[2]
        const fac = (this.getFactory || []).find(f => f.value === facName)
        if (fac) {
          this.selectedFactoryId = fac.id
          this.isDxfFile = fac.value === 'DXF'
          this.selectedFiles = (this.getPmp.files || []).filter(f => f.factory_id === this.selectedFactoryId)
          this.dxfUrl = null
          this.fileType = null
          this.selectedFile = null
          this.resetFileFields()
        }
      }
    },

    hasFiles(factoryId) { return (this.getPmp.files || []).some(f => f.factory_id === factoryId) },
  },
}
</script>

<style scoped>
.slide-down-enter-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
