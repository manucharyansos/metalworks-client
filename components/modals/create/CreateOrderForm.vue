<template>
  <div
    class="flex flex-col items-center w-full p-5 md:p-6 bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-white/60"
  >
    <h2
      class="text-center text-neutral-700 font-montserrat text-xl md:text-2xl my-4 font-bold"
    >
      {{
        isEditingMode ? 'Ստեղծել նոր պատվեր խմբագրելով' : 'Պատվերի մանրամասները'
      }}
    </h2>

    <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
      <div class="flex flex-col">
        <slot name="pmpGroup"></slot>
      </div>
      <div class="flex flex-col">
        <slot name="pmpName"></slot>
      </div>
    </div>

    <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 items-start my-4">
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

    <!-- Action buttons (with back) -->
    <div class="mt-2 w-full flex flex-wrap gap-3 md:gap-4 justify-between">
      <button
        class="py-3 px-5 md:px-6 inline-flex items-center text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition"
        type="button"
        @click="$emit('cancelButton')"
      >
        <!-- back icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clip-rule="evenodd"
          />
        </svg>
        {{ cancelButton }}
      </button>

      <div class="flex flex-wrap gap-3 md:gap-4 justify-end">
        <button
          class="py-3 px-6 bg-indigo-500 rounded-full text-white font-semibold hover:bg-indigo-600 transition-transform transform hover:scale-[1.02] active:scale-95"
          type="button"
          @click="$emit('openFiles')"
        >
          {{ isEditingMode ? openFilesButton : editButton }}
        </button>

        <button
          v-if="!isEditingMode"
          class="py-3 px-6 bg-emerald-500 rounded-full text-white font-semibold hover:bg-emerald-600 transition-transform transform hover:scale-[1.02] active:scale-95"
          type="button"
          @click="$emit('addButton')"
        >
          {{ successButton }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateOrderForm',
  props: {
    isEditingMode: { type: Boolean, default: false },
    successButton: { type: String, default: 'Հաստատել' },
    openFilesButton: { type: String, default: 'Շարունակել դեպի ֆայլեր' },
    editButton: { type: String, default: 'Խմբագրել (ֆայլեր)' },
  },
}
</script>
