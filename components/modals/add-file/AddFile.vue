<template>
  <div>
    <!-- Backdrop -->
    <transition name="fade">
      <div
        v-if="isOpenModal"
        class="fixed inset-0 bg-black/50 z-40"
        aria-hidden="true"
      />
    </transition>

    <!-- Modal -->
    <transition name="zoom">
      <div
        v-if="isOpenModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <!-- Close -->
          <button
            type="button"
            class="absolute top-4 right-4 z-40 text-gray-600 hover:text-gray-800 transition-colors bg-white rounded-full p-2 shadow-sm"
            aria-label="Close"
            @click="$emit('closeModal')"
          >
            <svg
              class="w-5 h-5"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <!-- Content -->
          <div
            class="flex-1 p-5 sm:p-6 md:p-8 flex flex-col items-stretch gap-6 overflow-y-auto"
          >
            <!-- DXF-only fields -->
            <div v-if="isDxfFile" class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <slot name="quantity" />
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <slot name="materialType" />
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <slot name="thickness" />
              </div>
            </div>

            <!-- File uploader -->
            <label
              class="w-full max-w-2xl mx-auto cursor-pointer"
              @dragover.prevent
              @drop.prevent="onDrop"
            >
              <div
                class="border-2 border-dashed rounded-xl p-8 text-center transition-colors"
                :class="
                  hasFile
                    ? 'border-green-500'
                    : 'border-gray-300 hover:border-blue-500'
                "
              >
                <div class="flex flex-col items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-10 w-10"
                    :class="hasFile ? 'text-green-500' : 'text-gray-400'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3-3 3m3-3v12"
                    />
                  </svg>

                  <template v-if="hasFile">
                    <div class="flex items-center text-green-700 font-medium">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      {{ fileName }}
                    </div>
                    <div class="text-sm text-gray-500">{{ fileSize }}</div>
                  </template>

                  <template v-else>
                    <span class="text-gray-700 font-medium"
                      >Սեղմեք՝ ֆայլ ընտրելու համար</span
                    >
                    <span class="text-xs text-gray-500"
                      >կամ տեղափոխեք ֆայլը այստեղ</span
                    >
                  </template>
                </div>
                <slot name="file-input" />
              </div>
            </label>

            <p class="text-center text-gray-600 text-sm">{{ text }}</p>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-4 sm:px-6 py-3 flex justify-center gap-3">
            <button
              type="button"
              class="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              @click="$emit('createFile')"
            >
              Ավելացնել ֆայլ
            </button>
            <button
              type="button"
              class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              @click="$emit('closeModal')"
            >
              Մաքրել
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
    text: { type: String, default: '' },
    isDxfFile: { type: Boolean, default: false },
    file: {
      type: Object,
      default: () => ({ name: '', size: 0 }),
    },
  },
  computed: {
    hasFile() {
      return !!this.file?.name
    },
    fileName() {
      return this.file?.name || ''
    },
    fileSize() {
      const bytes = this.file?.size || 0
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
    },
  },
  methods: {
    onDrop(e) {
      const file = e.dataTransfer?.files?.[0]
      if (!file) return
      this.$emit('dropped', file)
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0.98);
  opacity: 0;
}
</style>
