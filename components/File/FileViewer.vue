<template>
  <div>
    <div v-for="file in details" :key="file.id">
      <div v-if="file.path.endsWith('.pdf')">
        <embed
          :src="fileUrl(file.path)"
          type="application/pdf"
          class="w-full min-h-96"
        />
      </div>
      <div v-else-if="file.path.endsWith('.dxf')">
        <a :href="fileUrl(file.path)" target="_blank">
          <span>{{ file.original_name }}</span>
        </a>
      </div>
      <div>
        <button @click="downloadFile(file)">Скачать</button>
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
  methods: {
    ...mapActions('factory', ['downloadUploadedFile']),
    downloadFile(file) {
      if (file && typeof file.path === 'string') {
        this.downloadUploadedFile(file.path)
      }
    },

    fileUrl(filePath) {
      return `${this.$axios.defaults.baseURL}/storage/${filePath}`
    },
  },
}
</script>
