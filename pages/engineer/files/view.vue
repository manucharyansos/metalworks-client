<template>
  <main
    class="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
  >
    <div
      v-if="pageError"
      role="alert"
      class="mb-4 rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-700 dark:text-red-300"
    >
      <p>{{ pageError }}</p>
      <button type="button" class="mt-2 underline" @click="loadPage">
        {{ $t('file_upload.retry') }}
      </button>
    </div>
    <div
      v-if="factoryListError"
      role="alert"
      class="mb-4 rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-700 dark:text-red-300"
    >
      <p>{{ factoryListError }}</p>
      <button type="button" class="mt-2 underline" @click="loadPage">
        {{ $t('file_upload.retry') }}
      </button>
    </div>
    <transition name="fade">
      <div
        v-if="loading"
        class="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"
        ></div>
      </div>
    </transition>

    <transition name="slide-up">
      <nav v-if="breadcrumb.length" class="mb-6">
        <ol
          class="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <li
            v-for="(item, index) in breadcrumb"
            :key="index"
            class="flex items-center"
          >
            <button
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white hover:shadow-sm dark:hover:bg-gray-800 transition-all duration-200"
              :class="{
                'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300':
                  index === breadcrumb.length - 1,
              }"
              @click="selectBreadcrumb(index)"
            >
              <svg
                v-if="index > 0"
                class="w-3 h-3 text-gray-400"
                viewBox="0 0 6 10"
                fill="none"
              >
                <path
                  d="M1 9l4-4-4-4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="truncate max-w-[150px] sm:max-w-[200px]">{{
                item
              }}</span>
            </button>
          </li>
        </ol>
      </nav>
    </transition>

    <div
      v-if="projectReady"
      class="grid grid-cols-1 lg:grid-cols-[minmax(300px,_1fr)_3fr] gap-6 xl:gap-8"
    >
      <aside class="space-y-6">
        <transition v-if="isOpen === 'remote_number'" name="fade-scale">
          <section class="grid gap-3">
            <button
              v-for="number in getPmp.remote_number"
              :key="number.id"
              class="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700"
              @click="showFiles(number)"
            >
              <div
                class="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center"
              >
                <img src="/dxf.png" alt="DXF" class="w-9 h-9 object-contain" />
              </div>
              <div class="text-left flex-1">
                <div class="font-semibold text-gray-900 dark:text-white">
                  {{ number.remote_number }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {{ number.remote_number_name }}
                </div>
              </div>
              <svg
                class="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M9 18l6-6-6-6"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </section>
        </transition>

        <transition
          v-else-if="isOpen === 'factories'"
          class="space-y-4"
          name="fade-scale"
        >
          <section>
            <div v-for="factory in getFactory" :key="factory.id">
              <button
                :disabled="loadingFactoryId === factory.id"
                class="w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center justify-between"
                :class="{
                  'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg':
                    selectedFactoryId === factory.id,
                  'bg-white dark:bg-gray-800 hover:shadow-md border border-gray-200 dark:border-gray-700':
                    selectedFactoryId !== factory.id,
                  'opacity-70 cursor-not-allowed':
                    loadingFactoryId === factory.id,
                }"
                @click="selectFactory(factory)"
              >
                <span class="font-medium">{{ factory.value }}</span>
                <span
                  v-if="loadingFactoryId === factory.id"
                  class="animate-spin"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke-width="3"
                      class="opacity-25"
                    />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke-width="3"
                      class="opacity-75"
                    />
                  </svg>
                </span>
                <span
                  v-else-if="hasFiles(factory.id)"
                  class="text-green-400 text-xl"
                  >✔</span
                >
              </button>

              <transition
                v-if="isOpenFiles === factory.id"
                class="mt-3 space-y-2 pl-4 border-l-2 border-blue-500"
                name="slide-down"
              >
                <div v-if="$can('pmp_files.view')">
                  <div
                    v-for="file in selectedFiles"
                    :key="file.id"
                    class="group bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 border border-gray-200 dark:border-gray-700"
                    @mouseenter="hoveredFileId = file.id"
                    @mouseleave="hoveredFileId = null"
                  >
                    <div class="flex items-center justify-between">
                      <button
                        class="text-left flex-1 min-w-0 truncate text-sm font-medium text-gray-800 dark:text-gray-200"
                        @click="viewFile(file.path, file)"
                      >
                        {{ file.original_name }}
                      </button>
                      <div
                        class="flex shrink-0 items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                      >
                        <button
                          v-if="$can('pmp_files.view')"
                          class="text-xs text-blue-600 hover:underline"
                          @click.stop="downloadFile(file)"
                        >
                          Ներբեռնել
                        </button>
                        <button
                          v-if="$can('pmp_files.delete')"
                          class="text-xs text-red-600 hover:underline"
                          @click.stop="openDelete(file.id)"
                        >
                          Ջնջել
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    v-if="$can('pmp_files.upload')"
                    :disabled="loading"
                    class="w-full mt-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    @click="openAddFileModal"
                  >
                    <svg
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M12 4v16m8-8H4"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    Ավելացնել ֆայլ
                  </button>
                </div>
              </transition>
            </div>
          </section>
        </transition>
      </aside>

      <section
        class="min-w-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 min-h-[70vh] flex flex-col"
      >
        <transition name="fade">
          <div class="flex-1 flex flex-col">
            <div
              v-if="selectedFile && $can('pmp_files.view')"
              class="flex-1 flex flex-col"
            >
              <div
                v-if="isDxfFile && selectedFile"
                class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
              >
                <div
                  class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-center"
                >
                  <div class="text-xs text-gray-600 dark:text-gray-400">
                    Քանակ
                  </div>
                  <div class="font-bold text-blue-700 dark:text-blue-300">
                    {{ selectedFile.quantity }}
                  </div>
                </div>
                <div
                  class="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg text-center"
                >
                  <div class="text-xs text-gray-600 dark:text-gray-400">
                    Նյութ
                  </div>
                  <div
                    class="font-bold text-green-700 dark:text-green-300 truncate"
                  >
                    {{ selectedFile.material_type }}
                  </div>
                </div>
                <div
                  class="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg text-center"
                >
                  <div class="text-xs text-gray-600 dark:text-gray-400">
                    Հաստություն
                  </div>
                  <div class="font-bold text-purple-700 dark:text-purple-300">
                    {{ selectedFile.thickness }}
                  </div>
                </div>
              </div>

              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center break-all"
              >
                {{ selectedFile.original_name }}
              </h3>

              <div
                v-if="fileType === 'dxf' && dxfUrl && $can('pmp_files.view')"
                class="flex-1 min-h-0"
              >
                <DxfViewerModal
                  :dxf-url="dxfUrl"
                  :file-meta="selectedFile"
                  :show-laser-info="true"
                  class="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
                  @close="dxfUrl = ''"
                />
              </div>

              <p v-else-if="previewLoading" role="status">
                {{ $t('file_upload.loading_preview') }}
              </p>
              <p
                v-else-if="previewError"
                role="alert"
                class="text-sm text-red-600"
              >
                {{ previewError }}
              </p>

              <div v-else-if="fileType === 'pdf' && previewUrl" class="flex-1">
                <embed
                  :src="previewUrl"
                  type="application/pdf"
                  class="w-full h-full min-h-[60vh] rounded-lg border"
                />
                <a
                  v-if="$can('pmp_files.view')"
                  :href="previewUrl"
                  target="_blank"
                  rel="noopener"
                  class="mt-3 block text-center text-blue-600 hover:underline"
                >
                  Բացել նոր պատուհանում
                </a>
              </div>

              <div
                v-else-if="fileType === 'image' && previewUrl"
                class="flex justify-center items-center flex-1"
              >
                <a :href="previewUrl" target="_blank" rel="noopener">
                  <img
                    :src="previewUrl"
                    class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                    :alt="selectedFile.original_name"
                  />
                </a>
              </div>

              <audio
                v-else-if="fileType === 'audio' && previewUrl"
                :src="previewUrl"
                controls
                preload="metadata"
                class="w-full"
              />
              <video
                v-else-if="fileType === 'video' && previewUrl"
                :src="previewUrl"
                controls
                preload="metadata"
                class="w-full max-h-[60vh]"
              />
              <pre
                v-else-if="fileType === 'text'"
                class="whitespace-pre-wrap break-words rounded-lg bg-gray-50 dark:bg-gray-900 p-4 text-sm overflow-auto max-h-[60vh]"
                >{{ previewText }}</pre
              >
              <p v-else class="text-sm text-gray-500 text-center py-6">
                {{ $t('file_upload.download_to_view') }}
              </p>
              <button
                type="button"
                class="mt-4 self-center rounded-lg bg-blue-600 px-5 py-3 text-white"
                @click="downloadFile(selectedFile)"
              >
                {{ $t('file_upload.download') }}
              </button>
            </div>
            <div
              v-else
              class="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400"
            >
              <div
                class="flex items-center justify-center gap-2 text-lg text-blue-700 font-medium py-4 px-6 bg-blue-50 rounded-xl border border-blue-200"
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
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                Ընտրեք ֆայլ՝ դիտելու համար
              </div>
            </div>
          </div>
        </transition>
      </section>
    </div>

    <AddFileModal
      :is-open-modal="isOpenAddFileModal"
      :file="currentFile"
      :is-dxf-file="isDxfFile"
      :factory="selectedFactory"
      :extensions="allowedExtensions"
      :server-validated-formats="serverValidatedFormats"
      :policy-loading="policyLoading"
      :policy-error="policyError"
      :upload-error="uploadError"
      :busy="uploading"
      :can-submit="canSubmitFile"
      :show-uploader="!isInfoFactory || infoMode !== 'text'"
      @closeModal="openAddFileModal"
      @createFile="addFile"
      @dropped="handleFileDrop"
      @retry-policy="loadFactoryPolicy"
    >
      <template v-if="isInfoFactory && isOpenAddFileModal" #info-content>
        <InfoContentInput
          :mode="infoMode"
          :text="infoText"
          :title="infoTitle"
          :file="fileData.file"
          :extensions="allowedExtensions"
          :disabled="uploading || policyLoading || !!policyError"
          @mode-change="changeInfoMode"
          @text-change="
            infoText = $event
            uploadError = ''
          "
          @title-change="
            infoTitle = $event
            uploadError = ''
          "
          @file-selected="handleFileDrop"
          @recording-change="recording = $event"
        />
      </template>
      <template #file-input>
        <input
          :key="`${selectedFactoryId}-${infoMode}-${fileInputKey}`"
          type="file"
          class="hidden"
          :accept="fileAccept"
          :disabled="
            uploading ||
            recording ||
            policyLoading ||
            !!policyError ||
            !allowedExtensions.length
          "
          @change="handleFileChange"
        />
      </template>

      <template v-if="isDxfFile" #quantity>
        <InputWithLabelIcon
          v-model="fileData.quantity"
          type="number"
          name="quantity"
          label="Քանակ լրակազմում"
          :disabled="uploading"
          min="1"
        />
      </template>

      <template v-if="isDxfFile" #materialType>
        <div class="relative">
          <InputWithLabelIcon
            v-model="fileData.material"
            type="text"
            name="materialType"
            label="Նյութ"
            :disabled="uploading"
            @focus="openMaterials"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 px-3 text-gray-500"
            :disabled="uploading"
            @click="openMaterials"
          >
            ▼
          </button>
          <div
            v-if="isSelectedMaterials"
            class="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
          >
            <ul class="py-1">
              <li
                v-for="material in filteredMaterials"
                :key="material.id"
                class="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                @click="selectMaterial(material)"
              >
                {{ material.description }}
              </li>
            </ul>
          </div>
        </div>
      </template>

      <template v-if="isDxfFile" #thickness>
        <InputWithLabelIcon
          v-model="fileData.thickness"
          type="number"
          name="thickness"
          label="Հաստություն"
          :disabled="uploading"
          min="0"
          step="any"
        />
      </template>
    </AddFileModal>

    <PopupModal
      :is-open-modal="isOpenModal"
      text="Վստահ եք, որ ուզում եք ջնջել՞"
      @close-modal="closeModal"
      @confirm="deleteDxfFile"
    />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DxfViewerModal from '@/components/File/DxfViewerModal.vue'
import PopupModal from '~/components/modals/popup-modal/PopupModal.vue'
import AddFileModal from '~/components/modals/add-file/AddFile.vue'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
import InfoContentInput from '~/components/modals/add-file/InfoContentInput.vue'
import {
  allowsExtension,
  inputAccept,
  normalizeExtensions,
  previewType,
  textAttachment,
  uploadErrorMessage,
  validateFactoryFile,
} from '~/utils/factory-file-policy'

export default {
  name: 'EngineerFilesView',
  components: {
    InputWithLabelIcon,
    AddFileModal,
    PopupModal,
    DxfViewerModal,
    InfoContentInput,
  },
  layout: 'engineer',
  middleware: ['role-guard'],
  meta: { role: 'engineer' },

  data() {
    return {
      loadingFactoryId: null,
      loading: false,
      pageError: '',
      factoryListError: '',
      projectReady: false,
      uploading: false,
      recording: false,
      factoryPolicies: [],
      policyLoading: false,
      policyError: '',
      policyRequest: 0,
      uploadError: '',
      infoMode: 'file',
      infoText: '',
      infoTitle: '',
      fileInputKey: 0,
      previewLoading: false,
      previewError: '',
      previewUrl: '',
      previewText: '',
      previewRequest: 0,
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
      fileData: { quantity: null, material: '', thickness: '', file: null },
      currentFile: { name: '', size: 0 },
      toDeleteId: null,
    }
  },

  computed: {
    ...mapGetters('pmp', ['getPmp', 'errorMessage']),
    ...mapGetters('factory', ['getFactory']),
    ...mapGetters('materials', ['getMaterials']),
    selectedFactory() {
      return (
        (this.getFactory || []).find(
          (factory) => this.n(factory.id) === this.selectedFactoryId
        ) || null
      )
    },
    isInfoFactory() {
      return this.selectedFactory?.value === 'INFO'
    },
    allowedExtensions() {
      const policy = this.factoryPolicies.find(
        (factory) => this.n(factory.id) === this.selectedFactoryId
      )
      return normalizeExtensions(policy?.extensions)
    },
    serverValidatedFormats() {
      return !!this.factoryPolicies.find(
        (factory) => this.n(factory.id) === this.selectedFactoryId
      )?.serverValidatedFormats
    },
    fileAccept() {
      return inputAccept(
        this.allowedExtensions,
        this.isInfoFactory ? this.infoMode : 'file'
      )
    },
    canSubmitFile() {
      return (
        !this.recording &&
        this.allowedExtensions.length > 0 &&
        (this.isInfoFactory && this.infoMode === 'text'
          ? allowsExtension(this.allowedExtensions, 'txt') &&
            !!this.infoText.trim()
          : !!this.fileData.file)
      )
    },
    materials() {
      return this.getMaterials || []
    },
    filteredMaterials() {
      if (!this.fileData.material) return this.materials
      const q = this.fileData.material.toLowerCase()
      return this.materials.filter((m) =>
        (m.description || '').toLowerCase().includes(q)
      )
    },
  },

  created() {
    this.id = this.$route.query.id
    if (this.id) {
      this.loadPage()
    } else {
      this.$notify({ text: 'ID-ն բացակայում է', type: 'error' })
    }
  },

  beforeDestroy() {
    ++this.policyRequest
    this.clearPreview()
  },

  methods: {
    ...mapActions('pmp', ['fetchPmp', 'deleteFile', 'createPmpFilesByFactory']),
    ...mapActions('factory', [
      'fetchFactoryFilePolicies',
      'fetchFactory',
      'downloadUploadedFile',
    ]),
    ...mapActions('materials', ['fetchMaterials']),

    async loadPage() {
      if (this.loading) return
      this.loading = true
      this.pageError = ''
      this.factoryListError = ''
      this.projectReady = false
      try {
        const [project, policies] = await Promise.allSettled([
          this.fetchPmp(this.id),
          this.fetchFactoryFilePolicies(),
        ])
        if (project.status === 'fulfilled') {
          const number = (this.getPmp.remote_number || []).find(
            (remote) => this.n(remote.id) === this.n(this.id)
          )
          if (number) {
            this.projectReady = true
            this.showFiles(number)
          } else this.pageError = this.$t('file_upload.project_failed')
        } else this.pageError = this.$t('file_upload.project_failed')

        if (policies.status === 'fulfilled') this.factoryPolicies = policies.value
        else {
          this.factoryPolicies = []
          // A formats error must not hide an otherwise readable project.
          if (!(await this.fetchFactory()))
            this.factoryListError = this.$t('file_upload.factories_failed')
        }
      } catch (error) {
        this.factoryListError = this.$t('file_upload.factories_failed')
      } finally {
        this.loading = false
      }
    },

    n(v) {
      return Number(v)
    },
    openMaterials() {
      this.loading = true
      this.fetchMaterials()
        .then(() => (this.isSelectedMaterials = !this.isSelectedMaterials))
        .catch((error) => this.$notify({ text: String(error), type: 'error' }))
        .finally(() => (this.loading = false))
    },

    selectMaterial(material) {
      this.fileData.material = material.description
      this.fileData.thickness = material.thickness
      this.isSelectedMaterials = false
    },

    showButton(id) {
      this.hoveredFileId = id
    },
    hideButton(id) {
      if (this.hoveredFileId === id) this.hoveredFileId = null
    },

    showFiles(number) {
      this.clearPreview()
      this.isOpen = 'factories'
      this.selectedRemoteNumber = number
      this.selectedRemoteNumberId = this.n(number.id)
      this.selectedFiles = (this.getPmp.files || []).filter(
        (f) => this.n(f.remote_number_id) === this.selectedRemoteNumberId
      )
      this.dxfUrl = ''
      this.fileType = null
      this.selectedFile = null
      this.isDxfFile = false
      this.selectedFactoryId = null
      this.resetFileFields()
      this.breadcrumb = [
        this.getPmp?.group_name || 'PMP',
        number.remote_number_name,
      ]
    },

    selectFactory(factory) {
      this.clearPreview()
      this.resetFileFields()
      this.isDxfFile = factory.value === 'DXF'
      this.loadingFactoryId = factory.id
      this.loading = true
      try {
        this.isOpenFiles =
          this.isOpenFiles === this.n(factory.id) ? null : this.n(factory.id)

        this.selectedFactoryId = this.n(factory.id)
        this.selectedFiles = (this.getPmp.files || []).filter(
          (f) =>
            this.n(f.factory_id) === this.selectedFactoryId &&
            this.n(f.remote_number_id) === this.selectedRemoteNumberId
        )

        this.dxfUrl = ''
        this.fileType = null
        this.selectedFile = null

        if (this.breadcrumb.length > 1)
          this.breadcrumb.splice(1, 1, factory.value)
        else this.breadcrumb.push(factory.value)
      } finally {
        this.loadingFactoryId = null
        this.loading = false
      }
    },

    handleFileChange(e) {
      const file = e.target.files?.[0]
      if (file) this.handleFileDrop(file)
      // Selecting the same file again must trigger validation after a rejection.
      e.target.value = ''
    },

    handleFileDrop(file) {
      if (
        this.uploading ||
        this.recording ||
        this.policyLoading ||
        this.policyError
      )
        return
      const error = validateFactoryFile(
        file,
        this.allowedExtensions,
        this.isInfoFactory ? this.infoMode : 'file'
      )
      if (error) {
        this.uploadError = this.$t(`file_upload.${error}`)
        this.fileData.file = null
        this.currentFile = { name: '', size: 0 }
        return
      }
      this.uploadError = ''
      this.currentFile = { name: file.name, size: file.size }
      this.fileData.file = file
    },

    async addFile() {
      if (
        this.uploading ||
        this.recording ||
        this.policyLoading ||
        this.policyError
      )
        return
      let { file } = this.fileData
      const { quantity, material, thickness } = this.fileData
      const isDxf = this.isDxfFile
      this.uploadError = ''
      if (this.isInfoFactory && this.infoMode === 'text') {
        if (!this.infoText.trim()) {
          this.uploadError = this.$t('file_upload.text_required')
          return
        }
        file = textAttachment(
          this.infoTitle || `info-${Date.now()}`,
          this.infoText
        )
      }
      const error = validateFactoryFile(
        file,
        this.allowedExtensions,
        this.isInfoFactory ? this.infoMode : 'file'
      )
      if (error) {
        this.uploadError = this.$t(`file_upload.${error}`)
        return
      }
      if (
        isDxf &&
        (!Number.isInteger(Number(quantity)) ||
          Number(quantity) < 1 ||
          !material.trim() ||
          String(thickness).trim() === '' ||
          !Number.isFinite(Number(thickness)) ||
          Number(thickness) < 0)
      ) {
        this.uploadError = this.$t('file_upload.dxf_fields_required')
        return
      }

      this.uploading = true
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pmp_id', this.getPmp.id)
      formData.append('remote_number_id', this.selectedRemoteNumberId)
      formData.append('factory_id', this.selectedFactoryId)
      if (isDxf) {
        formData.append('quantity', quantity)
        formData.append('material_type', material.trim())
        formData.append('thickness', thickness)
      }

      try {
        await this.createPmpFilesByFactory(formData)
        this.$notify({ text: this.$t('file_upload.saved'), type: 'success' })
        this.isOpenAddFileModal = false
        this.resetFileFields()
        try {
          await this.fetchPmp(this.id)
        } catch (error) {
          this.$notify({
            text: this.$t('file_upload.refresh_failed'),
            type: 'warning',
          })
        }
        this.selectedFiles = (this.getPmp.files || []).filter(
          (f) =>
            this.n(f.remote_number_id) ===
              this.n(this.selectedRemoteNumberId) &&
            this.n(f.factory_id) === this.n(this.selectedFactoryId)
        )
      } catch (error) {
        this.uploadError = uploadErrorMessage(
          error,
          this.$t('file_upload.save_failed')
        )
      } finally {
        this.uploading = false
      }
    },

    async viewFile(filePath, file) {
      this.clearPreview()
      if (!this.breadcrumb.includes(file.original_name)) {
        if (this.breadcrumb.length > 2) this.breadcrumb.pop()
        this.breadcrumb.push(file.original_name)
      }
      this.selectedFile = file
      this.dxfUrl = filePath
      this.isOpenFiles = this.n(file.factory_id)
      this.isDxfFile =
        this.n(file.factory_id) === this.selectedFactoryId && this.isDxfFile
      this.fileType = previewType(file.original_name || filePath)
      if (this.fileType === 'dxf' || this.fileType === 'file') return
      const request = this.previewRequest
      const type = this.fileType
      this.previewLoading = true
      try {
        const { data } = await this.$axios.get(this.fileUrl(file), {
          responseType: 'blob',
        })
        if (request !== this.previewRequest) return
        if (!(data instanceof Blob) || data.size > 10 * 1024 * 1024)
          throw new Error('Invalid preview')
        if (type === 'video' && data.type.startsWith('audio/'))
          this.fileType = 'audio'
        if (type === 'text') {
          const text = await data.text()
          if (request === this.previewRequest) this.previewText = text
        } else {
          // Blob URLs preserve authenticated access without frame/cookie restrictions.
          const blob =
            type === 'pdf'
              ? new Blob([data], { type: 'application/pdf' })
              : data
          this.previewUrl = URL.createObjectURL(blob)
        }
      } catch (error) {
        if (request === this.previewRequest)
          this.previewError = this.$t('file_upload.preview_failed')
      } finally {
        if (request === this.previewRequest) this.previewLoading = false
      }
    },

    clearPreview() {
      ++this.previewRequest
      if (this.previewUrl) URL.revokeObjectURL(this.previewUrl)
      this.previewUrl = this.previewText = this.previewError = ''
      this.previewLoading = false
    },

    async downloadFile(file) {
      try {
        await this.downloadUploadedFile(file)
      } catch (error) {
        this.$notify?.({
          text:
            error?.response?.data?.message ||
            error?.message ||
            'Ֆայլի ներբեռնումը ձախողվեց',
          type: 'error',
        })
      }
    },

    fileUrl(file) {
      if (!file) return null
      if (file.id && this.$getPmpFileUrl) return this.$getPmpFileUrl(file)
      return this.$getFileUrl ? this.$getFileUrl(file.path) : null
    },

    openDelete(id) {
      this.toDeleteId = id
      this.isOpenModal = true
    },
    closeModal() {
      this.isOpenModal = false
      this.toDeleteId = null
    },

    async deleteDxfFile() {
      if (!this.toDeleteId) return
      this.loading = true
      try {
        await this.deleteFile(this.toDeleteId)
        await this.fetchPmp(this.id)
        this.selectedFiles = this.selectedFiles.filter(
          (f) => f.id !== this.toDeleteId
        )
        if (this.selectedFile?.id === this.toDeleteId) {
          this.clearPreview()
          this.selectedFile = null
          this.dxfUrl = ''
          this.fileType = null
        }
        this.$notify({ text: 'Ֆայլը ջնջվեց', type: 'success' })
      } catch (error) {
        this.$notify({
          text: uploadErrorMessage(error, this.$t('file_upload.delete_failed')),
          type: 'error',
        })
      } finally {
        this.isOpenModal = false
        this.toDeleteId = null
        this.loading = false
      }
    },

    openAddFileModal() {
      if (this.uploading) return
      this.isOpenAddFileModal = !this.isOpenAddFileModal
      if (this.isOpenAddFileModal) this.loadFactoryPolicy()
      else {
        ++this.policyRequest
        this.policyLoading = false
        this.resetFileFields()
      }
    },

    async loadFactoryPolicy() {
      const request = ++this.policyRequest
      this.policyLoading = true
      this.policyError = ''
      this.factoryPolicies = []
      try {
        const policies = await this.fetchFactoryFilePolicies()
        if (request !== this.policyRequest) return
        if (
          !policies.some(
            (factory) => this.n(factory.id) === this.selectedFactoryId
          )
        )
          throw new Error('Factory policy missing')
        this.factoryPolicies = policies
      } catch (error) {
        if (request === this.policyRequest)
          this.policyError = this.$t('file_upload.policy_failed')
      } finally {
        if (request === this.policyRequest) this.policyLoading = false
      }
    },

    changeInfoMode(mode) {
      if (this.uploading || this.recording) return
      this.infoMode = mode
      this.fileData.file = null
      this.currentFile = { name: '', size: 0 }
      this.uploadError = ''
      ++this.fileInputKey
    },

    resetFileFields() {
      this.fileData = {
        quantity: null,
        material: '',
        thickness: '',
        file: null,
      }
      this.currentFile = { name: '', size: 0 }
      this.isSelectedMaterials = false
      this.infoMode = 'file'
      this.infoText = this.infoTitle = this.uploadError = ''
      this.recording = false
      ++this.fileInputKey
    },

    selectBreadcrumb(index) {
      this.clearPreview()
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
        const rn = (this.getPmp.remote_number || []).find(
          (n) => n.remote_number_name === this.breadcrumb[1]
        )
        if (rn) {
          this.selectedRemoteNumberId = this.n(rn.id)
          this.selectedFiles = (this.getPmp.files || []).filter(
            (f) => this.n(f.remote_number_id) === this.selectedRemoteNumberId
          )
        }
      } else if (index === 2) {
        const fac = (this.getFactory || []).find(
          (f) => f.value === this.breadcrumb[2]
        )
        if (fac) {
          this.selectedFactoryId = this.n(fac.id)
          this.isDxfFile = fac.value === 'DXF'
          this.selectedFiles = (this.getPmp.files || []).filter(
            (f) => this.n(f.factory_id) === this.selectedFactoryId
          )
          this.dxfUrl = null
          this.fileType = null
          this.selectedFile = null
          this.resetFileFields()
        }
      }
    },

    hasFiles(factoryId) {
      return (this.getPmp.files || []).some(
        (f) =>
          this.n(f.factory_id) === this.n(factoryId) &&
          this.n(f.remote_number_id) === this.selectedRemoteNumberId
      )
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-up-enter-active {
  animation: slideUp 0.4s ease;
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-scale-enter-active {
  animation: fadeScale 0.35s ease;
}
@keyframes fadeScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
