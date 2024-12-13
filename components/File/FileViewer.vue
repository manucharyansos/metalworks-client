<template>
  <ul>
    <li
      v-for="file in details"
      :key="file.id"
      class="flex justify-between items-center"
    >
      <template v-if="isImage(file.path)">
        <img
          :src="fileUrl(file.path)"
          alt="file preview"
          class="w-full min-h-96"
        />
      </template>
      <template v-else-if="file.path.endsWith('.pdf')">
        <embed
          :src="fileUrl(file.path)"
          type="application/pdf"
          class="w-full min-h-96"
        />
      </template>
      <template v-else-if="isDxf(file.path)">
        <iframe :src="fileUrl(file.path)" class="w-full min-h-96" />
      </template>
      <template v-else>
        <span>Unsupported file type</span>
      </template>
      <span>{{ file.original_name }}</span>
      <button class="btn-download" @click="downloadFile(file.path)">
        Ներբեռնել
      </button>
    </li>
  </ul>
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
  methods: {
    ...mapActions('factory', ['downloadUploadedFile']),
    fileUrl(filePath) {
      const fileUrl = this.$getFileUrl(filePath)
      return fileUrl
    },
    downloadFile(path) {
      this.downloadUploadedFile(path)
      // const fileUrl = this.$getFileUrl(path)
      // const fileUrl = `http://localhost:8000/api/download/${path}`
      // fetch(fileUrl, { mode: 'no-cors' })
      //   .then((response) => {
      //     if (!response.ok) {
      //       throw new Error('File not found.')
      //     }
      //     return response.blob()
      //   })
      //   .then((blob) => {
      //     const url = URL.createObjectURL(blob)
      //     const a = document.createElement('a')
      //     a.href = url
      //     a.download = path.split('/').pop()
      //     a.click()
      //   })
      //   .catch((error) => {
      //     console.error('Download error:', error)
      //   })
    },

    isImage(path) {
      const imageTypes = [
        'png',
        'jpeg',
        'jpg',
        'eps',
        'step',
        'sldprt',
        'sldasm',
      ]
      return imageTypes.some((type) => path.endsWith(`.${type}`))
    },
    isDxf(path) {
      return path.endsWith('.dxf') || path.endsWith('.DXF')
    },
  },
}
</script>
