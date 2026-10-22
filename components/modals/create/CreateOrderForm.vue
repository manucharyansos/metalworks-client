<template>
  <div class="flex w-full flex-col gap-2">
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
    <div
      class="mt-6 w-full border-t border-slate-200 pt-5 dark:border-slate-800"
    >
      <div class="flex w-full flex-wrap items-center justify-between gap-3">
        <!-- Cancel -->
        <button
          class="flex items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          type="button"
          @click="$emit('cancelButton')"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0 9 9 0 01-18 0z"
            />
          </svg>
          {{ cancelButton }}
        </button>

        <div class="flex flex-row flex-wrap gap-3">
          <!-- Ընտրել այլ գործարանից – միշտ ակտիվ -->
          <button
            type="button"
            data-edit-task-configuration
            :aria-expanded="configurationOpen"
            aria-controls="task-configuration"
            :disabled="!canProceedToFiles"
            :class="[
              'flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition',
              canProceedToFiles
                ? 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500',
            ]"
            @click="$emit('selectFromOtherFactory')"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m16 4 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 6 5-2"
              />
            </svg>
            {{ $t('order_configuration.edit') }}
          </button>

          <!-- Հաստատել – ակտիվ միայն եթե բոլորը լրացված են (non-editing) -->
          <button
            v-if="!isEditingMode"
            :disabled="!canSubmit"
            :class="[
              'flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition',
              canSubmit
                ? 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500',
            ]"
            type="button"
            @click="$emit('addButton')"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ successButton }}
          </button>
        </div>
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
    cancelButton: { type: String, default: 'Չեղարկել' },
    configurationOpen: { type: Boolean, default: false },
    canProceedToFiles: { type: Boolean, default: false },
    canSubmit: { type: Boolean, default: false },
  },
  emits: [
    'addButton',
    'cancelButton',
    'selectFromOtherFactory',
    'back',
    'backToFactories',
  ],
}
</script>
