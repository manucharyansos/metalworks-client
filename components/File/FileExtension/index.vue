<template>
  <section class="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div class="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Allowed formats</p>
          <h2 class="mt-1 text-sm font-bold leading-5 text-slate-900 dark:text-white">{{ paragraph }}</h2>
        </div>
        <span class="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{{ extensions.length }}</span>
      </div>
    </div>

    <div class="flex-1 p-4">
      <div v-if="extensions.length" class="max-h-72 space-y-2 overflow-y-auto pr-1">
        <div v-for="(extension, index) in extensions" :key="extension.id" class="rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5 transition hover:border-slate-200 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700">
          <div v-if="editIndex !== index" class="flex items-center justify-between gap-3">
            <button type="button" class="min-w-0 flex-1 text-left" @click="startEditing(index)">
              <span class="inline-flex max-w-full rounded-xl bg-white px-3 py-2 font-mono text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">.{{ extension.extension }}</span>
            </button>
            <div class="flex shrink-0 items-center gap-1">
              <button type="button" class="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Edit extension" @click="startEditing(index)">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82 3 21l1.18-3.832L16.862 4.487Z" /></svg>
              </button>
              <button type="button" class="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-300" aria-label="Delete extension" @click="deleteExtension(extension.id)">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166M19.228 5.79 18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .563c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0V4.477c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
              </button>
            </div>
          </div>

          <div v-else class="flex items-center gap-2">
            <div class="relative min-w-0 flex-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">.</span>
              <input v-model="editedExtension" type="text" class="w-full rounded-xl border border-slate-300 bg-white py-2 pl-6 pr-3 font-mono text-xs font-bold text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" @keyup.enter="saveEdit(extension.id)" @keyup.esc="cancelEdit" />
            </div>
            <button type="button" class="rounded-xl bg-slate-950 p-2 text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950" aria-label="Save extension" @click="saveEdit(extension.id)">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m4.5 12.75 6 6 9-13.5" /></svg>
            </button>
            <button type="button" class="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Cancel edit" @click="cancelEdit">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 dark:border-slate-800">Դեռ format ավելացված չէ</div>
    </div>

    <div class="border-t border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/30">
      <slot name="custom"></slot>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FileExtension',
  props: {
    paragraph: { type: String, default: '' },
    extensions: { type: Array, default: () => [] },
  },
  data() {
    return { editIndex: null, editedExtension: '' }
  },
  methods: {
    startEditing(index) {
      this.editIndex = index
      this.editedExtension = this.extensions[index].extension
    },
    saveEdit(id) {
      if (!this.editedExtension?.trim()) return
      this.$emit('update-extension', { id, value: this.editedExtension.trim().replace(/^\./, '') })
      this.editIndex = null
      this.editedExtension = ''
    },
    cancelEdit() {
      this.editIndex = null
      this.editedExtension = ''
    },
    deleteExtension(id) {
      this.$emit('delete-extension', id)
    },
  },
}
</script>
