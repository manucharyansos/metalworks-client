<template>
  <div
    class="flex flex-col items-center w-full p-6 bg-white rounded-xl shadow-lg"
  >
    <h2
      class="text-center text-neutral-700 font-sans italic text-xl my-6 font-bold"
    >
      Ընտրել ծածկագիրը
    </h2>

    <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-12 items-center">
      <div class="flex flex-col">
        <slot name="pmpGroup"></slot>
      </div>
      <div class="flex flex-col">
        <slot name="pmpName"></slot>
      </div>
    </div>
    <div
      class="w-full grid grid-cols-1 sm:grid-cols-2 gap-12 items-center my-3"
    >
      <div class="flex flex-col w-full">
        <slot name="finishDate"></slot>
      </div>
      <div class="flex flex-col w-full">
        <slot name="quantity"></slot>
      </div>
    </div>
    <div class="flex flex-col w-full">
      <slot name="description"></slot>
    </div>

    <!-- <div v-if="isSuccsess" class="flex flex-row w-full gap-6 justify-end">
      <button
        class="mt-8 py-3 px-10 bg-green-500 rounded-full text-white font-semibold hover:bg-green-600 transition-transform transform hover:scale-105"
        @click="$emit('addButton')"
      >
        {{ successButton }}
      </button>
      <button
        class="mt-8 py-3 px-10 bg-red-500 rounded-full text-white font-semibold hover:bg-red-600 transition-transform transform hover:scale-105"
        @click="$emit('cancelButton')"
      >
        {{ cancelButton }}
      </button>
    </div> -->
    <div>
      <button
        class="mt-8 py-3 px-10 bg-blue-500 rounded-full text-white font-semibold hover:bg-blue-600 transition-transform transform hover:scale-105"
        @click="$emit('openFiles')"
      >
        {{ openFilesButton }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateByEditing',
  props: {
    openModal: {
      type: Boolean,
      default: false,
    },
    successButton: {
      type: String,
      default: 'Շարունակել',
    },
    cancelButton: {
      type: String,
      default: 'Խմբագրել',
    },
    openFilesButton: {
      type: String,
      default: 'Ընտրել ֆայլը',
    },
    isSuccsess: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
