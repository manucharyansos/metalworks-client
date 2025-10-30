<template>
  <div
    class="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6"
  >
    <h1 class="text-xl sm:text-2xl font-semibold">Հաճախորդներ</h1>
    <div class="flex items-center gap-3 w-full sm:w-auto">
      <div class="relative w-full sm:w-72">
        <input
          :value="search"
          type="text"
          placeholder="Որոնել հաճախորդ..."
          class="w-full rounded-lg border px-3 py-2 pr-9"
          @input="$emit('update:search', $event.target.value)"
        />
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
        @click="$emit('create')"
      >
        Նոր հաճախորդ
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: { search: { type: String, default: '' } },
}
</script>
