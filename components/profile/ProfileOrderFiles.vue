<template>
  <section class="mt-5 min-w-0 border-t border-slate-200 pt-4 dark:border-slate-700" :aria-label="$t('profile.files')">
    <h4 class="text-sm font-bold">{{ $t('profile.files') }}</h4>
    <p v-if="loading" role="status" class="mt-3 text-sm text-slate-500">{{ $t('profile.loading') }}</p>
    <div v-else-if="error" role="alert" class="mt-3 text-sm text-rose-600">
      {{ $t('profile.file_failed') }}
      <button type="button" class="min-h-[44px] px-3 underline" @click="load">{{ $t('profile.retry') }}</button>
    </div>
    <p v-else-if="!files.length" class="mt-3 text-sm text-slate-500">{{ $t('profile.no_files') }}</p>
    <ul v-else class="mt-3 space-y-3">
      <li v-for="file in files" :key="file.key" class="min-w-0 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
        <p class="break-all text-sm font-semibold">{{ file.original_name }}</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <button type="button" class="app-button-secondary min-h-[44px]" @click="preview = file">{{ $t('file_details.preview') }}</button>
          <button type="button" class="app-button-secondary min-h-[44px]" :disabled="!!downloading[file.key]" @click="download(file)">{{ $t('file_details.download') }}</button>
        </div>
        <p v-if="downloadErrors[file.key]" role="alert" class="mt-2 text-sm text-rose-600">{{ $t('profile.file_failed') }}</p>
      </li>
    </ul>
    <FilePreviewModal v-if="preview" :file="preview" :order-id="orderId" customer-file @close="preview = null" />
  </section>
</template>
<script>
import { saveAs } from 'file-saver'
import FilePreviewModal from '~/components/File/FilePreviewModal.vue'
export default {
  components: { FilePreviewModal },
  props: { orderId: { type: [Number, String], required: true } },
  data: () => ({ files: [], loading: false, error: false, preview: null, downloading: {}, downloadErrors: {}, request: 0 }),
  watch: { orderId() { this.preview = null; this.load() } },
  mounted() { this.load() },
  beforeDestroy() { ++this.request },
  methods: {
    async load() {
      const request = ++this.request
      this.loading = true
      this.error = false
      this.files = []
      try {
        const { data } = await this.$axios.get(`/api/profile/orders/${this.orderId}/files`)
        if (request === this.request) this.files = data.files || []
      } catch (_) {
        if (request === this.request) this.error = true
      } finally {
        if (request === this.request) this.loading = false
      }
    },
    async download(file) {
      if (this.downloading[file.key]) return
      const request = this.request
      this.$set(this.downloading, file.key, true)
      this.$set(this.downloadErrors, file.key, false)
      try {
        const { data } = await this.$axios.get(`/api/profile/orders/${this.orderId}/files/${file.key}`, { params: { download: 1 }, responseType: 'blob' })
        if (request === this.request) saveAs(data, file.original_name)
      } catch (_) {
        if (request === this.request) this.$set(this.downloadErrors, file.key, true)
      } finally {
        this.$set(this.downloading, file.key, false)
      }
    },
  },
}
</script>
