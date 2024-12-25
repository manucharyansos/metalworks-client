<template>
  <div class="w-full flex flex-col space-y-8 my-4">
    <h4 class="mt-6 text-md font-semibold border-b shadow-2xl p-5">Ֆայլեր</h4>
    <!-- DXF Files Section -->
    <div v-if="dxfFiles.length">
      <h3 class="text-lg font-bold mb-2">DXF Files</h3>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="file in dxfFiles"
          :key="file.id"
          class="w-56 h-32 dxfSection relative"
        >
          <button
            class="bg-neutral-700 w-full h-14 text-white"
            @click="downloadFile(file)"
          >
            {{ file.original_name }}
          </button>
        </div>
      </div>
    </div>

    <!-- PDFs Section -->
    <div v-if="pdfs.length">
      <h3 class="text-lg font-bold mb-2">PDF Files</h3>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="file in pdfs"
          :key="file.id"
          class="w-56 h-32 pdfSection relative"
        >
          <embed
            :src="fileUrl(file.path)"
            type="application/pdf"
            class="w-full"
          />
          <a
            class="absolute bottom-0 right-0 bg-gray-700 text-white rounded-xl px-5 py-1"
            :href="fileUrl(file.path)"
            target="_blank"
          >
            Տեսնել
          </a>
        </div>
      </div>
    </div>

    <!-- Images Section -->
    <div v-if="images.length">
      <h3 class="text-lg font-bold mb-2">Images</h3>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="file in images"
          :key="file.id"
          class="w-56 h-32 imgSection relative"
        >
          <a :href="fileUrl(file.path)" target="_blank">
            <img :src="fileUrl(file.path)" class="w-full" alt="Image file" />
          </a>
        </div>
      </div>
    </div>

    <!-- CAD Files Section -->
    <div v-if="cadFiles.length">
      <h3 class="text-lg font-bold mb-2">CAD Files</h3>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="file in cadFiles"
          :key="file.id"
          class="w-56 h-32 sldSection relative"
        >
          <a :href="fileUrl(file.path)" target="_blank">
            <span>{{ file.original_name }}</span>
          </a>
          <div
            class="sldButton flex items-center justify-center w-full h-10 bg-neutral-100 absolute opacity-50"
          >
            <button @click="downloadFile(file)">
              <img
                class="w-8 h-8 opacity-100"
                src="@/static/download-square-svgrepo-com.svg"
                alt=""
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: {
    details: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    images() {
      return (this.details || []).filter((file) => this.isImage(file.path))
    },
    pdfs() {
      return (this.details || []).filter((file) => file.path.endsWith('.pdf'))
    },
    dxfFiles() {
      return (this.details || []).filter((file) =>
        this.isDXFFile(file.original_name)
      )
    },
    cadFiles() {
      return (this.details || []).filter((file) =>
        this.isCADFile(file.original_name)
      )
    },
  },
  methods: {
    ...mapActions('factory', ['downloadUploadedFile']),
    downloadFile(file) {
      if (file && typeof file.path === 'string') {
        const sanitizedPath = file.path.replace(/\\/g, '/')
        const originalName = file.original_name || 'default-filename.pdf'
        this.downloadUploadedFile(sanitizedPath, originalName)
      } else {
        console.error('File object is invalid:', file)
      }
    },

    fileUrl(filePath) {
      if (!filePath || typeof filePath !== 'string') {
        return null
      }
      const baseURL = this.$axios.defaults.baseURL
      return `${baseURL}/storage/${filePath}`
    },
    isImage(path) {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.eps']
      return imageExtensions.some((ext) => path.endsWith(ext))
    },
    isCADFile(path) {
      const cadExtensions = ['.step', '.sldprt', '.sldasm']
      return cadExtensions.some((ext) => path.endsWith(ext))
    },
    isDXFFile(originalName) {
      return originalName && originalName.toLowerCase().endsWith('.dxf')
    },
  },
}
</script>
<style scoped>
.dxfSection {
  background-color: #f5f5f5;
  background-image: url('@/static/pngtree-dxf-file.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
