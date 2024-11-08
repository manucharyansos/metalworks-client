<template>
  <div
    v-if="isOpen"
    id="updateProductModal"
    class="overflow-y-auto mx-auto z-50 flex justify-center items-center w-full md:inset-0 h-modal md:h-full"
  >
    <div class="relative p-4 w-full max-w-4xl h-full md:h-auto">
      <!-- Modal content -->
      <div
        class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5"
      >
        <!-- Modal header -->
        <div
          class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Edit order
          </h3>
          <button
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            @click="$emit('closeModal')"
          >
            <svg
              aria-hidden="true"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
        </div>
        <!-- Modal body -->
        <div>
          <div class="grid gap-6 mb-4 sm:grid-cols-2">
            <div class="grid gap-4 mb-4 sm:grid-cols-2 items-center">
              <slot name="orderId"></slot>
              <slot name="storageLink"></slot>
            </div>
            <div>
              <slot name="orderDate"></slot>
            </div>
          </div>
          <div>
            <slot name="details"></slot>
          </div>
          <div class="grid gap-6 mb-4 sm:grid-cols-2 mt-4">
            <div>
              <slot name="number"></slot>
            </div>
            <div>
              <slot name="prefixCode"></slot>
            </div>
            <div>
              <slot name="orderStatus"></slot>
            </div>
          </div>
          <div class="grid gap-6 mb-4 sm:grid-cols-2">
            <div class="border-2 border-b-gray-300">
              <slot name="factories"></slot>
            </div>
            <div class="border-2 border-b-gray-300">
              <slot name="orderByFactoryStatus"></slot>
            </div>
          </div>
        </div>
        <template v-if="otherFiles.length > 0">
          <div v-for="(file, index) in otherFiles" :key="index">
            <a :href="getFileUrl(file.path)" target="_blank">{{
              file.name || 'Download File'
            }}</a>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => {},
    },
    otherFiles: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    getFileUrl(filePath) {
      return `${'https://api.metalworks.am'}/storage/${filePath}`
    },
  },
}
</script>

<style scoped></style>
