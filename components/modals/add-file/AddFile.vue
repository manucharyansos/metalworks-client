<template>
  <div>
    <!-- Backdrop with smoother transition -->
    <div
      v-if="isOpenModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
    ></div>

    <!-- Full-screen centered modal -->
    <div
      v-if="isOpenModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="relative w-full max-w-4xl h-auto max-h-[90vh]">
        <!-- White background with subtle shadow and rounded corners -->
        <div
          class="relative bg-white rounded-xl shadow-lg w-full h-full flex flex-col overflow-hidden"
        >
          <!-- Close button -->
          <button
            type="button"
            class="absolute top-4 right-4 z-40 text-gray-500 hover:text-gray-700 transition-colors duration-200 bg-white rounded-full p-2 shadow-sm"
            @click="$emit('closeModal')"
          >
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span class="sr-only">Close modal</span>
          </button>

          <!-- Modal content -->
          <div
            class="flex-1 p-6 md:p-8 flex flex-col items-center justify-center space-y-6"
          >
            <!-- Input sections in a responsive grid -->
            <div
              v-if="isDxfFile"
              class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
            >
              <div class="bg-gray-50 p-4 rounded-lg">
                <slot name="quantity"></slot>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <slot name="materialType"></slot>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <slot name="thickness"></slot>
              </div>
            </div>

            <!-- File upload with better styling -->
            <label id="file-input" class="w-full max-w-md cursor-pointer">
              <div
                class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors duration-200"
                :class="{ 'border-green-500': hasFile }"
              >
                <div
                  class="flex flex-col items-center justify-center space-y-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-10 w-10"
                    :class="hasFile ? 'text-green-500' : 'text-gray-400'"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>

                  <template v-if="hasFile">
                    <div class="flex items-center text-green-600 font-medium">
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
                    <div class="text-sm text-gray-500">
                      {{ fileSize }}
                    </div>
                  </template>
                  <template v-else>
                    <span class="text-gray-600 font-medium"
                      >Սեղմեք այստեղ՝ ֆայլ ընտրելու համար</span
                    >
                    <span class="text-sm text-gray-500"
                      >կամ տեղափոխեք ֆայլը այստեղ</span
                    >
                  </template>
                </div>
                <slot name="file-input"></slot>
              </div>
            </label>

            <h3 class="text-lg text-gray-600 mt-4">
              {{ text }}
            </h3>
          </div>
          <div class="bg-gray-50 px-6 py-4 flex justify-center space-x-4">
            <button
              type="button"
              class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              @click="$emit('createFile')"
            >
              Ավելացնել ֆայլ
            </button>
            <button
              type="button"
              class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              @click="$emit('closeModal')"
            >
              Մաքրել
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isOpenModal: Boolean,
    text: String,
    isDxfFile: {
      type: Boolean,
      default: false,
    },
    file: {
      // Ավելացնում ենք նոր prop
      type: Object,
      default: () => ({
        name: '',
        size: 0,
      }),
    },
  },
  computed: {
    hasFile() {
      return !!this.file.name
    },
    fileName() {
      return this.file.name
    },
    fileSize() {
      return this.formatFileSize(this.file.size)
    },
  },
  methods: {
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
  },
}
</script>
<style scoped>
.upload-container {
  background-image: url('@/static/images/img_2.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  height: 300px;
  width: 100%;
}
</style>
