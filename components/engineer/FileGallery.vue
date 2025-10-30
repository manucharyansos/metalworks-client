<template>
  <div class="w-full flex flex-col space-y-6 my-2">
    <!-- DXF -->
    <section v-if="dxfFiles.length">
      <h4 class="text-sm font-semibold mb-2">DXF Files</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="f in dxfFiles"
          :key="keyOf(f)"
          class="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/40"
        >
          <div class="text-sm font-medium truncate mb-2">
            {{ f.original_name }}
          </div>
          <div class="flex items-center gap-2">
            <button
              class="flex-1 h-10 rounded-lg bg-gray-900 text-white dark:bg-gray-700 hover:bg-black/80 transition"
              @click="downloadFile(f)"
            >
              Ներբեռնել
            </button>
            <button
              class="flex-1 h-10 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              @click="openDxf(f)"
            >
              Դիտել
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- PDF -->
    <section v-if="pdfs.length">
      <h4 class="text-sm font-semibold mb-2">PDF Files</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="f in pdfs"
          :key="keyOf(f)"
          class="rounded-xl border border-gray-200 dark:border-gray-800 p-3 overflow-hidden"
        >
          <div
            class="h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
          >
            <embed
              :src="filePreviewUrl(f.path, f.original_name)"
              type="application/pdf"
              class="w-full h-full"
            />
          </div>
          <div class="mt-2 flex items-center justify-between gap-2">
            <div class="text-xs truncate">{{ f.original_name }}</div>
            <div class="flex items-center gap-2">
              <button
                class="text-xs text-blue-600 hover:underline"
                @click="downloadFile(f)"
              >
                Ներբեռնել
              </button>
              <a
                class="text-xs text-gray-700 hover:underline"
                :href="filePreviewUrl(f.path, f.original_name)"
                target="_blank"
                rel="noopener"
              >
                Բացել
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Images -->
    <section v-if="images.length">
      <h4 class="text-sm font-semibold mb-2">Նկարներ</h4>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <a
          v-for="f in images"
          :key="keyOf(f)"
          :href="filePreviewUrl(f.path, f.original_name)"
          target="_blank"
          rel="noopener"
          class="block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 group"
        >
          <img
            :src="filePreviewUrl(f.path, f.original_name)"
            class="w-full h-40 object-cover group-hover:scale-[1.02] transition"
          />
          <div class="p-2 text-[11px] truncate">{{ f.original_name }}</div>
        </a>
      </div>
    </section>

    <!-- CAD (այլ) -->
    <section v-if="cadFiles.length">
      <h4 class="text-sm font-semibold mb-2">CAD Files</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="f in cadFiles"
          :key="keyOf(f)"
          class="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900"
        >
          <div class="text-sm font-medium truncate mb-3">
            {{ f.original_name }}
          </div>
          <button
            class="w-full h-10 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            @click="downloadFile(f)"
          >
            Ներբեռնել
          </button>
        </div>
      </div>
    </section>

    <!-- DXF viewer modal -->
    <DxfViewerModal
      v-if="showDxf"
      :dxf-url="encodedDxfPath"
      :file-name="currentDxfName"
      @close="showDxf = false"
    />
    <notifications />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import DxfViewerModal from '~/components/engineer/DxfViewerModal.vue'

export default {
  name: 'FileGallery',
  components: { DxfViewerModal },
  props: {
    items: { type: Array, default: () => [] },
  },
  data() {
    return {
      showDxf: false,
      encodedDxfPath: null,
      currentDxfName: null,
    }
  },
  computed: {
    images() {
      return this.items.filter((f) =>
        this.hasExt(f, ['.jpg', '.jpeg', '.png', '.webp', '.gif'])
      )
    },
    pdfs() {
      return this.items.filter((f) => this.hasExt(f, ['.pdf']))
    },
    dxfFiles() {
      return this.items.filter((f) => this.hasExt(f, ['.dxf']))
    },
    cadFiles() {
      return this.items.filter((f) =>
        this.hasExt(f, [
          '.step',
          '.stp',
          '.sldprt',
          '.sldasm',
          '.igs',
          '.iges',
          '.dwg',
          '.dwt',
        ])
      )
    },
  },
  methods: {
    ...mapActions('factory', ['downloadUploadedFile']),
    keyOf(f) {
      return f.id || `${f.path}-${f.original_name}`
    },
    filePreviewUrl(filePath, name) {
      if (!filePath || typeof filePath !== 'string') return null
      const baseURL = this.$axios.defaults.baseURL
      return `${baseURL}/storage/${filePath}`
    },
    hasExt(file, exts) {
      const p = (file?.path || '').toLowerCase()
      const n = (file?.original_name || '').toLowerCase()
      return exts.some((ext) => p.endsWith(ext) || n.endsWith(ext))
    },
    async downloadFile(file) {
      try {
        if (!file || typeof file.path !== 'string') {
          this.$notify?.({
            text: 'Ֆայլի ներբեռնումը ձախողվեց',
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'error',
          })
          return
        }
        const sanitizedPath = String(file.path).replace(/\\/g, '/')
        await this.downloadUploadedFile({
          path: sanitizedPath,
          original_name: file.original_name || 'downloaded_file',
        })
      } catch (e) {
        this.$notify({
          text: e,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
      }
    },
    openDxf(file) {
      this.encodedDxfPath = String(file.path).replace(/\\/g, '/')
      this.currentDxfName = file?.original_name || 'DXF'
      this.showDxf = true
    },
  },
}
</script>
