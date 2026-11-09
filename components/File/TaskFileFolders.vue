<template>
  <div class="min-w-0 space-y-2" data-task-file-folders>
    <details
      v-for="folder in folders"
      :key="folder.code"
      :data-file-folder="folder.code"
      class="file-folder rounded-xl border border-slate-200 dark:border-slate-700"
    >
      <summary
        class="flex cursor-pointer list-none items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:hover:bg-slate-800"
      >
        <FileFolderIcon :info="folder.code === 'INFO'" />
        <span class="min-w-0 flex-1 break-words font-semibold">{{
          folder.code
        }}</span>
        <span class="shrink-0 text-xs text-slate-500 dark:text-slate-400">
          {{ $t('order_create.file_count', { count: folder.items.length }) }}
        </span>
        <svg
          class="folder-chevron h-4 w-4 shrink-0 text-slate-500"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="m5 8 5 5 5-5" />
        </svg>
      </summary>
      <div
        class="min-w-0 space-y-2 border-t border-slate-200 p-2 dark:border-slate-700"
      >
        <slot :items="folder.items" />
      </div>
    </details>
  </div>
</template>

<script>
import FileFolderIcon from '@/components/File/FileFolderIcon.vue'
import { fileExtensionOf } from '@/utils/file-kind'

const sectionOrder = ['INFO', 'DLD', 'DXF', 'IGS', 'PDF', 'SW']
const legacySections = {
  dld: 'DLD',
  dxf: 'DXF',
  igs: 'IGS',
  iges: 'IGS',
  iqs: 'IGS',
  pdf: 'PDF',
  sldprt: 'SW',
  sldasm: 'SW',
  slddrw: 'SW',
}

export default {
  components: { FileFolderIcon },
  props: {
    items: { type: Array, required: true },
    fileField: { type: String, default: '' },
  },
  computed: {
    folders() {
      const sections = new Map()
      for (const item of this.items) {
        const file = (this.fileField ? item[this.fileField] : item) || {}
        const code = String(
          file.category?.code ||
            file.factory?.value ||
            legacySections[fileExtensionOf(file.original_name || file.path)] ||
            'INFO'
        ).toUpperCase()
        if (!sections.has(code)) sections.set(code, { code, items: [] })
        sections.get(code).items.push(item)
      }
      return [
        ...sectionOrder.filter((code) => sections.has(code)),
        ...[...sections.keys()].filter((code) => !sectionOrder.includes(code)),
      ].map((code) => sections.get(code))
    },
  },
}
</script>

<style scoped>
summary::-webkit-details-marker {
  display: none;
}
.file-folder[open] > summary {
  background-color: rgb(59 130 246 / 10%);
}
.file-folder[open] .folder-chevron {
  transform: rotate(180deg);
}
</style>
