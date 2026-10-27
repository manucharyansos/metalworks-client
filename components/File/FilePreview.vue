<template>
  <section class="min-w-0 space-y-4" data-file-preview>
    <div class="flex min-w-0 items-start justify-between gap-3">
      <div class="min-w-0">
        <p
          class="break-words text-sm font-bold text-slate-900 dark:text-slate-100"
          data-preview-filename
        >
          {{ metadata?.original_name || file.original_name }}
        </p>
        <p
          v-if="metadata?.category_name || extension"
          class="mt-1 text-xs text-slate-500 dark:text-slate-400"
        >
          {{ metadata?.category_name
          }}<span v-if="metadata?.category_name && extension"> · </span
          >{{ extension }}
        </p>
      </div>
      <button
        v-if="showDownload"
        type="button"
        :disabled="!metadata || detailsError"
        class="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
        data-file-preview-download
        @click="$emit('download', effectiveFile)"
      >
        {{ $t('file_details.download') }}
      </button>
    </div>
    <FileMetadataPanel
      :file="file"
      :order-id="orderId"
      @loading="onDetailsLoading"
      @loaded="onDetailsLoaded"
      @error="onDetailsError"
    />
    <div
      v-if="!detailsError"
      class="relative min-h-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40"
      data-file-preview-content
    >
      <div
        v-if="loading || !metadata"
        role="status"
        class="flex min-h-[280px] items-center justify-center gap-3 p-6 text-sm text-slate-500"
      >
        <span
          class="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
          aria-hidden="true"
        />{{ $t('file_upload.loading_preview') }}
      </div>
      <div
        v-else-if="error"
        role="alert"
        class="space-y-3 p-5 text-sm text-red-600 dark:text-red-300"
      >
        <p>{{ error }}</p>
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-3 py-2 font-semibold dark:border-slate-700"
          data-file-preview-retry
          @click="loadPreview"
        >
          {{ $t('file_upload.retry') }}
        </button>
      </div>
      <div v-else-if="kind === 'dxf'" class="h-[360px] sm:h-[480px]">
        <DxfViewerModal
          :key="previewKey"
          :file-meta="effectiveFile"
          :dxf-url="secureUrl"
          :show-production-attributes="false"
          class="h-full w-full"
          @close="$emit('close')"
        />
      </div>
      <ModelViewer
        v-else-if="kind === 'model' && model"
        :key="previewKey"
        :model="model"
        :filename="effectiveFile.original_name"
        class="w-full"
      />
      <object
        v-else-if="kind === 'pdf' && blobUrl"
        :data="blobUrl"
        type="application/pdf"
        class="h-[420px] w-full sm:h-[520px]"
        :aria-label="effectiveFile.original_name"
      >
        <p class="p-5 text-sm text-slate-500">
          {{ $t('file_details.no_preview') }}
        </p>
      </object>
      <img
        v-else-if="kind === 'image' && blobUrl"
        :src="blobUrl"
        :alt="effectiveFile.original_name"
        class="max-h-[520px] min-h-[240px] w-full object-contain p-3"
      />
      <audio
        v-else-if="kind === 'audio' && blobUrl"
        :key="blobUrl"
        controls
        :src="blobUrl"
        class="mx-auto my-10 max-w-full"
      />
      <video
        v-else-if="kind === 'video' && blobUrl"
        :key="blobUrl"
        controls
        :src="blobUrl"
        class="max-h-[520px] w-full"
      />
      <pre
        v-else-if="kind === 'text'"
        class="max-h-[520px] overflow-auto whitespace-pre-wrap break-words p-4 text-sm text-slate-700 dark:text-slate-200"
        data-file-preview-text
        >{{ text }}</pre
      >
      <p
        v-else
        class="flex min-h-[240px] items-center justify-center p-5 text-center text-sm text-slate-500 dark:text-slate-400"
      >
        {{ $t('file_details.no_preview') }}
      </p>
    </div>
    <p v-if="note" class="text-xs leading-5 text-slate-500 dark:text-slate-400">
      {{ $t(note) }}
    </p>
  </section>
</template>

<script>
import FileMetadataPanel from '@/components/File/FileMetadataPanel.vue'
import DxfViewerModal from '@/components/File/DxfViewerModal.vue'
import ModelViewer from '@/components/File/ModelViewer.vue'
import { inspectFactoryPreview } from '@/utils/factory-preview'
import { previewType } from '@/utils/factory-file-policy'
import { fileDetailsIdentity } from '@/utils/file-production-details'
import CadModelWorker from '~/workers/cad-model.worker.js'
import CadPreviewWorker from '~/workers/cad-preview.worker.js'

export default {
  components: { FileMetadataPanel, DxfViewerModal, ModelViewer },
  props: {
    file: { type: Object, required: true },
    orderId: { type: [Number, String], default: null },
    showDownload: Boolean,
  },
  data: () => ({
    metadata: null,
    detailsError: false,
    kind: '',
    blobUrl: '',
    text: '',
    model: null,
    loading: false,
    error: '',
    note: '',
    request: 0,
    cancelWorker: null,
  }),
  computed: {
    previewKey() {
      return fileDetailsIdentity(
        this.file,
        this.orderId,
        this.$store?.state?.workspace,
        this.$auth?.user
      )
    },
    effectiveFile() {
      return {
        ...this.file,
        ...this.metadata,
        original_name: this.metadata?.original_name || this.file.original_name,
      }
    },
    extension() {
      return String(this.effectiveFile.original_name || '')
        .split('.')
        .pop()
        .toUpperCase()
    },
    secureUrl() {
      return this.file.id && this.$getPmpFileUrl
        ? this.$getPmpFileUrl(this.file)
        : this.$getFileUrl?.(this.file.path)
    },
  },
  watch: {
    previewKey() {
      this.onDetailsLoading()
    },
  },
  beforeDestroy() {
    this.clearPreview()
  },
  methods: {
    clearPreview() {
      ++this.request
      this.cancelWorker?.()
      if (this.blobUrl) URL.revokeObjectURL(this.blobUrl)
      this.blobUrl = this.text = this.error = this.note = this.kind = ''
      this.model = null
      this.loading = false
    },
    onDetailsLoading() {
      this.clearPreview()
      this.metadata = null
      this.detailsError = false
    },
    onDetailsError() {
      this.clearPreview()
      this.metadata = null
      this.detailsError = true
    },
    onDetailsLoaded(details) {
      this.metadata = details
      this.detailsError = false
      this.loadPreview()
    },
    async loadPreview() {
      this.clearPreview()
      const request = this.request
      const filename = this.effectiveFile.original_name || this.file.path
      const type = previewType(filename)
      if (type === 'dxf') {
        this.kind = 'dxf'
        return
      }
      this.loading = true
      try {
        const { data } = await this.$axios.get(this.secureUrl, {
          responseType: 'blob',
        })
        if (request !== this.request) return
        const preview = await inspectFactoryPreview(data, filename, type)
        if (request !== this.request) return
        this.kind = preview.type
        if (preview.type === 'model') {
          const result = await this.runWorker(
            CadModelWorker,
            preview.bytes,
            { format: preview.format, filename },
            45000,
            { error: 'unavailable' }
          )
          if (request !== this.request) return
          if (result?.model) this.model = Object.freeze(result.model)
          else
            this.error = this.$t(
              'model_preview.error_' + (result?.error || 'unavailable')
            )
        } else if (preview.type === 'cad') {
          const image = await this.runWorker(
            CadPreviewWorker,
            preview.bytes,
            { filename },
            10000,
            null
          )
          if (request !== this.request) return
          if (image) {
            this.kind = 'image'
            this.blobUrl = URL.createObjectURL(
              new Blob([image.bytes], { type: `image/${image.format}` })
            )
            this.note = 'file_preview.saved_view'
          } else this.note = 'file_preview.no_saved_view'
        } else if (preview.type === 'text') {
          this.text = preview.text
          if (preview.truncated) this.note = 'file_preview.truncated'
        } else if (preview.blob)
          this.blobUrl = URL.createObjectURL(preview.blob)
      } catch (error) {
        if (request === this.request)
          this.error = this.$t('file_upload.preview_failed')
      } finally {
        if (request === this.request) this.loading = false
      }
    },
    runWorker(Worker, bytes, options, timeout, fallback) {
      return new Promise((resolve) => {
        let worker
        let timer
        let finished = false
        const finish = (result) => {
          if (finished) return
          finished = true
          clearTimeout(timer)
          worker?.terminate()
          this.cancelWorker = null
          resolve(result)
        }
        this.cancelWorker = () => finish(fallback)
        try {
          worker = new Worker()
          worker.onmessage = ({ data }) => finish(data)
          worker.onerror = () => finish(fallback)
          timer = setTimeout(() => finish(fallback), timeout)
          worker.postMessage({ buffer: bytes.buffer, ...options }, [
            bytes.buffer,
          ])
        } catch (_) {
          finish(fallback)
        }
      })
    },
  },
}
</script>
