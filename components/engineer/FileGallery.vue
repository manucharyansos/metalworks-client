<template>
  <div class="w-full flex flex-col space-y-6 my-2">
    <section v-if="dxfFiles.length">
      <h4 class="text-sm font-semibold mb-2">DXF ֆայլեր</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="f in dxfFiles" :key="keyOf(f)" class="work-file-row">
          <div class="text-sm font-medium truncate mb-2">
            {{ f.original_name }}
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="$can('pmp_files.view')"
              class="work-button flex-1"
              data-variant="dark"
              @click="downloadFile(f)"
            >
              Ներբեռնել
            </button>
            <button
              v-if="$can('pmp_files.view')"
              class="work-button flex-1"
              @click="openDxf(f)"
            >
              Դիտել
            </button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="pdfs.length">
      <h4 class="text-sm font-semibold mb-2">PDF ֆայլեր</h4>
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
              :src="filePreviewUrl(f)"
              type="application/pdf"
              class="w-full h-full"
            />
          </div>
          <div class="mt-2 flex items-center justify-between gap-2">
            <div class="text-xs truncate">{{ f.original_name }}</div>
            <div class="flex items-center gap-2">
              <button
                v-if="$can('pmp_files.view')"
                class="text-xs text-blue-600 hover:underline"
                @click="downloadFile(f)"
              >
                Ներբեռնել
              </button>
              <a
                v-if="$can('pmp_files.view')"
                class="text-xs text-gray-700 hover:underline"
                :href="filePreviewUrl(f)"
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

    <section v-if="images.length && $can('pmp_files.view')">
      <h4 class="text-sm font-semibold mb-2">Նկարներ</h4>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <a
          v-for="f in images"
          :key="keyOf(f)"
          :href="filePreviewUrl(f)"
          target="_blank"
          rel="noopener"
          class="block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 group"
        >
          <img
            :src="filePreviewUrl(f)"
            class="w-full h-40 object-cover group-hover:scale-[1.02] transition"
            :alt="f.original_name"
          />
          <div class="p-2 text-[11px] truncate">{{ f.original_name }}</div>
        </a>
      </div>
    </section>

    <section v-if="cadFiles.length">
      <h4 class="text-sm font-semibold mb-2">CAD ֆայլեր</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="f in cadFiles" :key="keyOf(f)" class="work-file-row">
          <div class="text-sm font-medium truncate mb-3">
            {{ f.original_name }}
          </div>
          <button
            v-if="$can('pmp_files.view')"
            class="work-button w-full"
            data-variant="dark"
            @click="downloadFile(f)"
          >
            Ներբեռնել
          </button>
        </div>
      </div>
    </section>

    <div
      v-if="showDxf"
      class="work-modal-backdrop fixed inset-0 z-[1500] flex items-center justify-center"
      @click.self="closeDxf"
      @keydown.esc.stop="closeDxf"
    >
      <section
        data-work-modal
        class="work-modal work-modal--structured flex w-full max-w-5xl flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Ֆայլի դիտում"
      >
        <header
          class="work-modal__header flex items-center justify-between gap-3"
        >
          <h4 class="work-section__title break-all">
            {{ currentDxfFile?.original_name || 'DXF' }}
          </h4>
          <button
            type="button"
            class="work-modal__close"
            aria-label="Փակել ֆայլը"
            @click="closeDxf"
          >
            ✕
          </button>
        </header>
        <div class="h-[360px] min-h-[240px] sm:h-[560px]">
          <DxfViewerModal
            :dxf-url="currentDxfPath"
            :file-meta="currentDxfFile"
            @close="closeDxf"
          />
        </div>
      </section>
    </div>
    <notifications />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import DxfViewerModal from '@/components/File/DxfViewerModal.vue'

export default {
  name: 'FileGallery',
  components: { DxfViewerModal },
  props: {
    items: { type: Array, default: () => [] },
  },
  data() {
    return {
      showDxf: false,
      currentDxfPath: null,
      currentDxfFile: null,
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
    filePreviewUrl(file) {
      if (!file) return null
      if (file.id && this.$getPmpFileUrl) return this.$getPmpFileUrl(file)
      return this.$getFileUrl ? this.$getFileUrl(file.path) : null
    },
    hasExt(file, exts) {
      const p = (file?.path || '').toLowerCase()
      const n = (file?.original_name || '').toLowerCase()
      return exts.some((ext) => p.endsWith(ext) || n.endsWith(ext))
    },
    async downloadFile(file) {
      try {
        if (!file?.id && !file?.path) {
          this.$notify?.({
            text: 'Ֆայլի ներբեռնումը ձախողվեց',
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'error',
          })
          return
        }
        await this.downloadUploadedFile(file)
      } catch (e) {
        this.$notify?.({
          text: e?.response?.data?.message || e?.message || String(e),
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
      }
    },
    openDxf(file) {
      this.currentDxfFile = file
      this.currentDxfPath = String(file?.path || '').replace(/\\/g, '/')
      this.showDxf = Boolean(this.currentDxfPath)
    },
    closeDxf() {
      this.showDxf = false
      this.currentDxfPath = null
      this.currentDxfFile = null
    },
  },
}
</script>
