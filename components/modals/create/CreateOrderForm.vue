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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            {{ $t('order_create.choose_files') }}
          </button>

          <!--          &lt;!&ndash; Ընտրել ֆայլերը – ակտիվ միայն եթե պարտադիր դաշտերը լրացված են &ndash;&gt;-->
          <!--          <button-->
          <!--            :disabled="!canProceedToFiles"-->
          <!--            :class="[-->
          <!--              'flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition',-->
          <!--              canProceedToFiles-->
          <!--                ? 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'-->
          <!--                : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500',-->
          <!--            ]"-->
          <!--            type="button"-->
          <!--            @click="$emit('openFiles')"-->
          <!--          >-->
          <!--            <svg-->
          <!--              class="w-5 h-5 mr-2"-->
          <!--              fill="none"-->
          <!--              stroke="currentColor"-->
          <!--              viewBox="0 0 24 24"-->
          <!--            >-->
          <!--              <path-->
          <!--                stroke-linecap="round"-->
          <!--                stroke-linejoin="round"-->
          <!--                stroke-width="2"-->
          <!--                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"-->
          <!--              />-->
          <!--            </svg>-->
          <!--            {{ $t('order_create.choose_files') }}ը-->
          <!--          </button>-->

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
