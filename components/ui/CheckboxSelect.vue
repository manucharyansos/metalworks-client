<template>
  <div ref="root" class="min-w-0" @keydown.esc="closeWithEscape">
    <label :id="controlId + '-label'" class="mb-2 block text-xs font-semibold text-slate-600 dark:text-slate-300">{{ label }}</label>
    <button type="button" class="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900" :disabled="disabled" :aria-labelledby="controlId + '-label ' + controlId + '-value'" :aria-expanded="open" :aria-controls="controlId" @click="open = !open">
      <span :id="controlId + '-value'" class="min-w-0 break-words">{{ selectedLabels.length ? selectedLabels.join(', ') : placeholder }}</span>
      <svg class="h-4 w-4 shrink-0" :class="{ 'rotate-180': open }" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
    </button>
    <fieldset v-if="open" :id="controlId" :aria-labelledby="controlId + '-label'" :disabled="disabled" class="mt-2 max-h-64 min-w-0 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950">
      <label v-for="option in options" :key="option.id" class="flex min-w-0 cursor-pointer items-start gap-3 rounded-lg px-2 py-3 text-sm hover:bg-white dark:hover:bg-slate-800" :class="{ 'opacity-60': option.disabled }">
        <input type="checkbox" class="mt-0.5 h-4 w-4 shrink-0" :checked="has(option.id)" :disabled="option.disabled" :aria-label="option.label" @change="change(option.id, $event.target.checked)" />
        <span class="min-w-0 break-words"><span class="font-semibold">{{ option.label }}</span><span v-if="option.note" class="mt-1 block text-xs leading-5 text-slate-500">{{ option.note }}</span></span>
      </label>
      <p v-if="!options.length" class="px-2 py-3 text-sm text-slate-500">{{ emptyLabel || placeholder }}</p>
    </fieldset>
  </div>
</template>
<script>
export default {
  props: { value: { type: Array, default: () => [] }, options: { type: Array, default: () => [] }, label: { type: String, required: true }, placeholder: { type: String, default: '' }, emptyLabel: { type: String, default: '' }, disabled: { type: Boolean, default: false }, idPrefix: { type: String, default: '' } },
  data() { return { open: false } },
  computed: {
    controlId() { return this.idPrefix || `checkbox-select-${this._uid}` },
    selectedLabels() { return this.options.filter(option => this.has(option.id)).map(option => option.label) },
  },
  mounted() { document.addEventListener('click', this.closeOutside) },
  beforeDestroy() { document.removeEventListener('click', this.closeOutside) },
  methods: {
    has(id) { return this.value.some(value => String(value) === String(id)) },
    closeWithEscape(event) { if (this.open) { event.stopPropagation(); event.preventDefault(); this.open = false } },
    change(id, checked) { if (!this.disabled) this.$emit('input', checked ? [...this.value.filter(value => String(value) !== String(id)), id] : this.value.filter(value => String(value) !== String(id))) },
    closeOutside(event) { if (!this.$refs.root?.contains(event.target)) this.open = false },
  },
}
</script>
