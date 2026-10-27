<template>
  <div class="my-3 min-w-0" data-file-gallery>
    <div class="grid gap-3 sm:grid-cols-2">
      <article
        v-for="file in items"
        :key="file.id || file.path"
        class="min-w-0 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
        :data-gallery-file="file.id"
      >
        <div class="flex min-w-0 items-start gap-3">
          <span
            class="flex h-10 min-w-[2.5rem] shrink-0 items-center justify-center rounded-lg bg-blue-50 px-1.5 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
            aria-hidden="true"
            >{{ extension(file) }}</span
          >
          <div class="min-w-0 flex-1">
            <p
              class="break-words text-sm font-semibold text-slate-800 dark:text-slate-100"
            >
              {{ file.original_name }}
            </p>
            <FileProductionAttributes :file="file" />
          </div>
        </div>
        <div
          class="mt-3 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800"
        >
          <button
            v-if="$can('pmp_files.view')"
            type="button"
            class="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
            data-gallery-view
            @click="previewFile = file"
          >
            {{ $t('file_details.view') }}
          </button>
          <button
            v-if="$can('pmp_files.view')"
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
            @click="downloadFile(file)"
          >
            {{ $t('file_details.download') }}
          </button>
        </div>
      </article>
    </div>
    <FilePreviewModal
      v-if="previewFile"
      :file="previewFile"
      :order-id="orderId"
      show-download
      @close="previewFile = null"
      @download="downloadFile"
    />
  </div>
</template>
<script>
import { mapActions } from 'vuex'
import FilePreviewModal from '@/components/File/FilePreviewModal.vue'
import FileProductionAttributes from '@/components/File/FileProductionAttributes.vue'
export default {
  name: 'FileGallery',
  components: { FilePreviewModal, FileProductionAttributes },
  props: {
    items: { type: Array, default: () => [] },
    orderId: { type: [Number, String], default: null },
  },
  data: () => ({ previewFile: null }),
  watch: {
    orderId() {
      this.previewFile = null
    },
  },
  methods: {
    ...mapActions('factory', ['downloadUploadedFile']),
    extension(file) {
      return String(file.original_name || '')
        .split('.')
        .pop()
        .slice(0, 7)
    },
    async downloadFile(file) {
      try {
        await this.downloadUploadedFile(file)
      } catch (error) {
        this.$notify?.({
          text:
            error?.response?.data?.message ||
            this.$t('file_details.download_failed'),
          type: 'error',
        })
      }
    },
  },
}
</script>
