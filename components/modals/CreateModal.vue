<template>
  <div
    v-if="openModal"
    class="items-center w-full md:inset-0 h-modal md:h-full"
  >
    <div class="relative p-4 w-full max-w-2xl h-auto">
      <!-- Modal content -->
      <div class="relative bg-neutral-500 p-4 rounded-lg shadow sm:p-5">
        <!-- Modal header -->
        <div
          class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Add Task
          </h3>
          <button
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            @click="$emit('closeModal', $event)"
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
        <div class="grid bg-transparent gap-4 mb-4 sm:grid-cols-2 w-full">
          <slot name="title"></slot>
          <slot name="description"></slot>
          <slot name="select"></slot>
          <slot name="check"></slot>
        </div>
        <button
          class="py-1.5 px-10 bg-green-400 rounded-2xl text-white font-bold font-sans italic"
          @click="$emit('addButton')"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateModal',
  props: {
    openModal: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style scoped></style>
