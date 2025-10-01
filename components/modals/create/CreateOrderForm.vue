<template>
  <div
    class="flex flex-col items-center w-full p-6 bg-white rounded-xl shadow-lg"
  >
    <h2
      class="text-center text-neutral-700 font-montserrat text-xl my-6 font-bold"
    >
      {{
        isEditingMode ? 'Ստեղծել նոր պատվեր խմբագրելով' : 'Պատվերի մանրամասները'
      }}
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
      <div v-if="isEditingMode" class="flex flex-col w-full">
        <slot name="quantity"></slot>
      </div>
    </div>
    <div class="flex flex-col w-full">
      <slot name="description"></slot>
    </div>

    <div class="flex flex-row w-full gap-6 justify-end">
      <button
        class="mt-8 py-3 px-10 bg-blue-500 rounded-full text-white font-semibold hover:bg-blue-600 transition-transform transform hover:scale-105"
        @click="$emit('openFiles')"
      >
        {{ isEditingMode ? openFilesButton : editButton }}
      </button>
      <button
        class="mt-8 py-3 px-10 bg-red-500 rounded-full text-white font-semibold hover:bg-red-600 transition-transform transform hover:scale-105"
        @click="$emit('cancelButton')"
      >
        {{ cancelButton }}
      </button>
      <button
        v-if="!isEditingMode"
        class="mt-8 py-3 px-10 bg-green-500 rounded-full text-white font-semibold hover:bg-green-600 transition-transform transform hover:scale-105"
        @click="$emit('addButton')"
      >
        {{ successButton }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateOrderForm',
  props: {
    isEditingMode: {
      type: Boolean,
      default: false,
    },
    successButton: {
      type: String,
      default: 'Հաստատել',
    },
    cancelButton: {
      type: String,
      default: 'Չեղարկել',
    },
    openFilesButton: {
      type: String,
      default: 'Ընտրել ֆայլերը',
    },
    editButton: {
      type: String,
      default: 'Խմբագրել',
    },
  },
}
</script>
