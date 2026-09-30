<template>
  <div>
    <transition name="fade">
      <div
        v-if="isOpenModal"
        class="fixed inset-0 bg-black/50 z-40"
        aria-hidden="true"
      />
    </transition>
    <transition name="zoom">
      <div
        v-if="isOpenModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-file-title"
        :aria-busy="busy || policyLoading"
        @keydown.tab="trapFocus"
        @keydown.esc.stop="$emit('closeModal')"
      >
        <div
          ref="dialog"
          tabindex="-1"
          class="relative w-full max-w-4xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden file-modal"
        >
          <div
            class="flex items-start justify-between gap-3 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6"
          >
            <h2
              id="add-file-title"
              class="text-lg font-semibold break-words min-w-0"
            >
              {{ $t('file_upload.add') }} —
              {{ factory?.name || factory?.value }}
            </h2>
            <button
              type="button"
              :disabled="busy"
              class="shrink-0 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              :aria-label="$t('file_upload.close')"
              @click="$emit('closeModal')"
            >
              <svg class="w-5 h-5" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
          <div class="flex-1 min-h-0 p-4 sm:p-6 space-y-5 overflow-y-auto">
            <p v-if="policyLoading" role="status" class="text-sm">
              {{ $t('file_upload.loading_formats') }}
            </p>
            <div
              v-else-if="policyError"
              class="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              <p>{{ policyError }}</p>
              <button
                type="button"
                class="mt-2 underline"
                @click="$emit('retry-policy')"
              >
                {{ $t('file_upload.retry') }}
              </button>
            </div>
            <p
              v-else
              class="text-xs text-gray-500 dark:text-gray-400 break-words"
            >
              <template v-if="serverValidatedFormats">{{ $t('file_upload.server_formats') }}</template>
              <template v-else>{{ $t('file_upload.formats') }}: {{ formatLabel }}</template> ·
              {{ $t('file_upload.limit') }}
            </p>
            <fieldset
              :disabled="busy || policyLoading || !!policyError"
              class="min-w-0 space-y-5 disabled:opacity-60"
            >
              <div
                v-if="isDxfFile"
                class="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div class="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                  <slot name="quantity" />
                </div>
                <div class="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                  <slot name="materialType" />
                </div>
                <div class="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                  <slot name="thickness" />
                </div>
              </div>
              <slot name="info-content" />
              <label
                v-if="showUploader"
                class="block w-full cursor-pointer"
                @dragover.prevent
                @drop.prevent="onDrop"
              >
                <div
                  class="border-2 border-dashed rounded-xl p-5 sm:p-8 text-center"
                  :class="
                    hasFile
                      ? 'border-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  "
                >
                  <div v-if="hasFile" class="space-y-2">
                    <p
                      class="font-medium text-green-700 dark:text-green-300 break-all"
                    >
                      {{ file.name }}
                    </p>
                    <p class="text-xs text-gray-500">{{ fileSize }}</p>
                    <span class="text-xs text-gray-500">{{
                      $t('file_upload.replace')
                    }}</span>
                  </div>
                  <div v-else class="space-y-2">
                    <p class="font-medium">{{ $t('file_upload.choose') }}</p>
                    <p class="text-xs text-gray-500">
                      {{ $t('file_upload.drop') }}
                    </p>
                  </div>
                  <slot name="file-input" />
                </div>
              </label>
            </fieldset>
            <p
              v-if="uploadError"
              role="alert"
              class="text-sm text-red-600 dark:text-red-300"
            >
              {{ uploadError }}
            </p>
          </div>
          <div
            class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 grid grid-cols-2 gap-3"
          >
            <button
              type="button"
              :disabled="!canSubmit || busy || policyLoading || !!policyError"
              class="rounded-lg bg-green-600 hover:bg-green-700 px-3 py-3 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              @click="$emit('createFile')"
            >
              {{ $t(busy ? 'file_upload.saving' : 'file_upload.add') }}
            </button>
            <button
              type="button"
              :disabled="busy"
              class="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-3 text-sm disabled:opacity-50"
              @click="$emit('closeModal')"
            >
              {{ $t('file_upload.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'AddFileModal',
  props: {
    isOpenModal: { type: Boolean, default: false },
    isDxfFile: { type: Boolean, default: false },
    factory: { type: Object, default: null },
    extensions: { type: Array, default: () => [] },
    serverValidatedFormats: { type: Boolean, default: false },
    policyLoading: { type: Boolean, default: false },
    policyError: { type: String, default: '' },
    uploadError: { type: String, default: '' },
    busy: { type: Boolean, default: false },
    canSubmit: { type: Boolean, default: false },
    showUploader: { type: Boolean, default: true },
    file: { type: Object, default: () => ({ name: '', size: 0 }) },
  },
  data: () => ({ previousFocus: null }),
  computed: {
    hasFile() {
      return !!this.file?.name
    },
    fileSize() {
      return `${((this.file?.size || 0) / 1024 / 1024).toFixed(2)} MB`
    },
    formatLabel() {
      return this.extensions.includes('*')
        ? this.$t('file_upload.any_format')
        : this.extensions.length
        ? this.extensions.map((ext) => `.${ext}`).join(', ')
        : this.$t('file_upload.no_formats')
    },
  },
  watch: {
    isOpenModal(open) {
      if (typeof document === 'undefined') return
      if (open) {
        this.previousFocus = document.activeElement
        this.$nextTick(() => {
          if (this.isOpenModal) this.$refs.dialog?.focus()
        })
      } else {
        this.previousFocus?.focus()
      }
    },
  },
  methods: {
    trapFocus(event) {
      const dialog = this.$refs.dialog
      const controls = [
        ...dialog.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], audio[controls]'
        ),
      ].filter((element) => element.offsetParent !== null)
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (!first) {
        event.preventDefault()
        dialog.focus()
        return
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    onDrop(event) {
      if (this.busy || this.policyLoading || this.policyError) return
      const file = event.dataTransfer?.files?.[0]
      if (file) this.$emit('dropped', file)
    },
  },
}
</script>

<style scoped>
.file-modal {
  max-height: 90vh;
  max-height: 90dvh;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.zoom-enter-active,
.zoom-leave-active {
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.zoom-enter,
.zoom-leave-to {
  transform: scale(0.98);
  opacity: 0;
}
</style>
