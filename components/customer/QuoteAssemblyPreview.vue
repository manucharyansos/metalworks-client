<template>
  <FilePreviewModal :file="active" :source-url="url(active)" @close="$emit('close')">
    <div class="space-y-3">
      <div class="flex flex-wrap gap-2">
        <button v-if="file.assembly_key" type="button" class="work-button" :aria-pressed="in3d"
          @click="in3d = true">{{ copy.title }} · 3D</button>
        <button v-if="in3d && geometry && !tooLarge" type="button" class="work-button"
          @click="downloadStep">{{ $t('file_details.download') }} STEP</button>
      </div>
      <p class="text-sm font-semibold">{{ copy.parts }} · {{ members.length }} (× {{ pieces }})</p>
      <div class="flex flex-wrap gap-2">
        <button v-for="(item,i) in members" :key="item.id" type="button" class="work-button max-w-full break-all"
          :aria-pressed="!in3d && selected === i" @click="selected = i; in3d = false">
          {{ i + 1 }}. {{ item.original_name }} × {{ item.quantity }}
        </button>
      </div>
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span v-if="active.material">{{ labels.material }} · {{ active.material }}</span>
        <span v-if="active.thickness">{{ labels.thickness }} · {{ active.thickness }} mm</span>
        <span v-if="active.pricing && active.pricing.status === 'priced'">
          {{ labels.line }} · {{ money(active.pricing.line) }}
        </span>
      </div>
      <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
      <template v-if="in3d">
        <div v-if="geometry" class="h-80 sm:h-[28rem]">
          <PartAssembly3D :items="views" :placements="placements" mode="edge" :selected="selected"
            :unavailable="viewCopy.unavailable" :too-many="viewCopy.tooMany(holeLimit)"
            :hint="viewCopy.hint" @select="selected = $event" />
        </div>
        <button v-else-if="error" type="button" class="work-button" @click="load">{{ $t('file_upload.retry') }}</button>
        <p v-else role="status">{{ $t('file_upload.loading_preview') }}</p>
        <button type="button" class="work-button" @click="in3d = false">
          {{ selected + 1 }}. {{ active.original_name }} × {{ active.quantity }} · DXF
        </button>
      </template>
      <FilePreview v-else :key="active.id" :file="active" :source-url="url(active)"
        :show-download="showDownload" @download="$emit('download',active)" @close="$emit('close')" />
    </div>
  </FilePreviewModal>
</template>

<script>
import FilePreviewModal from '@/components/File/FilePreviewModal.vue'
import FilePreview from '@/components/File/FilePreview.vue'
import PartAssembly3D from '@/components/customer/PartAssembly3D.vue'
import { assemblyStep } from '@/utils/assembly-geometry'
import { builderCopy } from '@/utils/part-builder-copy'
import { formatMoney, quoteCopy } from '@/utils/quote-copy'
import { moreCopy } from '@/utils/part-builder-more'
import { MAX_3D_HOLES } from '@/utils/part-patterns'

export default {
  components: { FilePreviewModal, FilePreview, PartAssembly3D },
  props: {
    items: { type: Array, required: true },
    file: { type: Object, required: true },
    base: { type: String, required: true },
    showDownload: Boolean,
  },
  data: () => ({ selected: 0, in3d: false, geometry: null, error: '', holeLimit: MAX_3D_HOLES }),
  computed: {
    members() {
      return this.items.filter(item => item.assembly_key === this.file.assembly_key)
    },
    active() { return this.members[this.selected] || this.file },
    pieces() { return this.members.reduce((sum,item) => sum + Number(item.quantity), 0) },
    labels() { return quoteCopy(this.$i18n.locale).create },
    copy() { return moreCopy(this.$i18n.locale).assembly },
    viewCopy() { return builderCopy(this.$i18n.locale).view },
    views() { return this.geometry.map(g => g.view) },
    placements() { return this.geometry.map(g => g.placement) },
    tooLarge() { return this.views.some(v => v.part.holes.length > this.holeLimit) },
  },
  created() {
    this.selected = Math.max(0, this.members.findIndex(i => i.id === this.file.id))
    this.in3d = Boolean(this.file.assembly_key)
    if (this.in3d) this.load()
  },
  methods: {
    money: formatMoney,
    url(item) { return `${this.base}/items/${item.id}/file` },
    async load() {
      this.error = ''
      try {
        this.geometry = Object.freeze(await Promise.all(this.members.map(item =>
          this.$axios.$get(this.url(item), { params: { geometry: 1 } }))))
      } catch (_) {
        this.error = this.labels.loadFailed
      }
    },
    downloadStep() {
      try {
        const output = assemblyStep(this.geometry)
        const href = URL.createObjectURL(new Blob([output], { type: 'application/step' }))
        const link = document.createElement('a')
        link.href = href
        link.download = `assembly-${this.members[0].id}.step`
        link.click()
        setTimeout(() => URL.revokeObjectURL(href), 1000)
      } catch (_) {
        this.error = this.viewCopy.unavailable
      }
    },
  },
}
</script>
