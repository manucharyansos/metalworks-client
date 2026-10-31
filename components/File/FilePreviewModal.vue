<template>
  <div
    class="work-modal-backdrop fixed inset-0 z-[1600] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
    @click.self="$emit('close')"
    @keydown.esc.stop.prevent="$emit('close')"
    @keydown.tab="trapFocus"
  >
    <section
      ref="panel"
      class="relative flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('file_details.preview')"
      tabindex="-1"
      data-file-preview-modal
    >
      <header
        class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5"
      >
        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
          {{ $t('file_details.preview') }}
        </h3>
        <button
          type="button"
          class="rounded-lg px-3 py-2 text-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          :aria-label="$t('file_upload.close')"
          data-close-file-preview
          @click="$emit('close')"
        >
          ×
        </button>
      </header>
      <div class="min-h-0 overflow-y-auto p-4 sm:p-5">
        <FilePreview
          :file="file"
          :customer-file="customerFile"
          :order-id="orderId"
          :show-download="showDownload"
          @close="$emit('close')"
          @download="$emit('download', $event)"
        />
      </div>
    </section>
  </div>
</template>
<script>
import FilePreview from '@/components/File/FilePreview.vue'
export default {
  components: { FilePreview },
  props: {
    file: { type: Object, required: true },
    orderId: { type: [Number, String], default: null },
    showDownload: Boolean,
    customerFile: Boolean,
  },
  mounted() {
    this.returnFocus = document.activeElement
    this.$nextTick(() => this.$refs.panel?.focus())
  },
  beforeDestroy() {
    if (this.returnFocus?.isConnected) this.returnFocus.focus()
  },
  methods: {
    trapFocus(event) {
      const nodes = [
        ...this.$refs.panel.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]'
        ),
      ].filter((node) => node.offsetParent !== null)
      if (!nodes.length) {
        event.preventDefault()
        return
      }
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === this.$refs.panel)
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === this.$refs.panel)
      ) {
        event.preventDefault()
        first.focus()
      }
    },
  },
}
</script>
