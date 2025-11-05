<template>
  <div
    class="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
  >
    <div class="flex-1">
      <label class="block text-xs font-medium text-gray-500 mb-1">
        Փնտրել (անուն / slug / խումբ)
      </label>
      <div class="relative">
        <input
          :value="search"
          @input="$emit('update:search', $event.target.value)"
          type="text"
          placeholder="Օրինակ՝ orders, clients.edit, inventory.view"
          class="block w-full rounded-xl border-gray-300 pr-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          @keyup.enter="$emit('apply')"
        />
        <div
          class="pointer-events-none absolute inset-y-0 right-3 flex items-center"
        >
          <svg
            class="h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
            />
          </svg>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs sm:text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
        @click="$emit('apply')"
        :disabled="loading"
      >
        Կիրառել
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs sm:text-sm font-medium border border-transparent text-gray-500 hover:text-gray-700"
        @click="$emit('reset')"
        :disabled="loading"
      >
        Մաքրել
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    search: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
