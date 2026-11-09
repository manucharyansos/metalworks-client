<template>
  <div class="task-explorer" data-task-file-folders>
    <div class="explorer-address">
      <FileFolderIcon :info="activeFolder?.code === 'INFO'" />
      <span>{{ $t('order_create.files') }}</span>
      <span aria-hidden="true">›</span>
      <strong>{{ activeFolder?.code || '—' }}</strong>
    </div>
    <div class="explorer-layout">
      <nav class="explorer-sidebar" :aria-label="$t('order_create.files')">
        <button
          v-for="folder in folders"
          :key="folder.code"
          type="button"
          class="explorer-folder"
          :class="{ 'is-selected': activeFolder === folder }"
          :aria-pressed="activeFolder === folder"
          :data-file-folder="folder.code"
          @click="selectedCode = folder.code"
        >
          <FileFolderIcon :info="folder.code === 'INFO'" />
          <span>{{ folder.code }}</span>
          <small>{{ folder.items.length }}</small>
        </button>
      </nav>
      <section class="explorer-content">
        <div class="explorer-heading">
          <strong>{{ activeFolder?.code || '—' }}</strong>
          <span>{{
            $t('order_create.file_count', {
              count: activeFolder?.items.length || 0,
            })
          }}</span>
        </div>
        <div class="explorer-file-list">
          <slot :items="activeFolder?.items || []" />
        </div>
      </section>
    </div>
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
  data: () => ({ selectedCode: null }),
  computed: {
    activeFolder() {
      return (
        this.folders.find((folder) => folder.code === this.selectedCode) ||
        this.folders[0]
      )
    },
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
.task-explorer {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #d9e1eb;
  border-radius: 8px;
  background: #fff;
  color: #243247;
}
.explorer-address {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 13px;
}
.explorer-address svg {
  width: 22px;
  height: 20px;
}
.explorer-layout {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
}
.explorer-sidebar {
  flex: 1 1 145px;
  padding: 8px;
  background: #f8fafc;
  min-width: 0;
}
.explorer-folder {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 13px;
  text-align: left;
}
.explorer-folder svg {
  width: 25px;
  height: 23px;
}
.explorer-folder span {
  flex: 1;
  overflow-wrap: anywhere;
}
.explorer-folder small {
  color: #64748b;
}
.explorer-folder:hover {
  background: #edf4fc;
}
.explorer-folder.is-selected {
  border-color: #bdd7f5;
  background: #dcecff;
}
.explorer-folder:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}
.explorer-content {
  flex: 4 1 260px;
  min-width: 0;
  border-left: 1px solid #e2e8f0;
}
.explorer-heading {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 12px;
}
.explorer-heading span {
  color: #64748b;
}
.explorer-file-list {
  padding: 8px;
  min-width: 0;
  max-height: 420px;
  overflow: auto;
}
.explorer-file-list > * {
  margin-bottom: 6px;
}
.dark .task-explorer {
  background: #0f172a;
  color: #e2e8f0;
  border-color: #334155;
}
.dark .explorer-sidebar,
.dark .explorer-address {
  background: #182234;
}
.dark .explorer-content,
.dark .explorer-heading,
.dark .explorer-address {
  border-color: #334155;
}
.dark .explorer-folder:hover,
.dark .explorer-folder.is-selected {
  background: #243d5b;
  border-color: #3b608c;
}
</style>
