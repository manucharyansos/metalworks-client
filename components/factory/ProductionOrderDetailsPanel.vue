<template>
  <div class="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
    <section class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <p class="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">File preview</p>
          <h3 class="mt-1 text-sm font-black text-slate-900 dark:text-white">Ֆայլի դիտում</h3>
        </div>
        <button v-if="previewUrl && canDownload" type="button" class="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="$emit('close-preview')">Փակել</button>
      </div>

      <div class="p-4 sm:p-5">
        <div v-if="!canDownload" class="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center dark:border-slate-800 dark:bg-slate-950/40">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 10V7a4 4 0 018 0v3m-9 0h10a2 2 0 012 2v8H5v-8a2 2 0 012-2Z" /></svg>
          </div>
          <p class="mt-4 text-sm font-black text-slate-700 dark:text-slate-200">Ֆայլերի հասանելիությունը փակ է</p>
          <p class="mt-2 max-w-sm text-xs leading-5 text-slate-400">Admin-ը պետք է տա «Արտադրամասի ֆայլեր դիտել և ներբեռնել» ֆունկցիան։</p>
        </div>

        <div v-else-if="previewUrl" class="min-h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
          <DxfViewerModal v-if="previewKind === 'dxf'" :key="resolvedPreviewUrl" :dxf-url="resolvedPreviewUrl" :show-laser-info="mode === 'laser'" />
          <iframe v-else-if="previewKind === 'pdf'" :key="resolvedPreviewUrl" :src="resolvedPreviewUrl" class="h-[430px] w-full border-0 bg-white" title="PDF Preview"></iframe>
          <img v-else-if="previewKind === 'image'" :src="resolvedPreviewUrl" class="h-[430px] w-full object-contain p-3" alt="File preview" />
          <div v-else class="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2Zm7 0v6h5" /></svg>
            </div>
            <div><p class="text-sm font-bold text-slate-700 dark:text-slate-200">Inline preview հասանելի չէ</p><p class="mt-1 text-xs text-slate-400">Ֆայլը կարող եք բացել առանձին պատուհանում։</p></div>
            <a :href="resolvedPreviewUrl" target="_blank" rel="noopener" class="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white dark:bg-white dark:text-slate-950">Բացել ֆայլը</a>
          </div>
        </div>

        <div v-else class="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center dark:border-slate-800 dark:bg-slate-950/40">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 5v14M5 12h14" /></svg>
          </div>
          <p class="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">Ընտրեք ֆայլ</p>
          <p class="mt-1 text-xs text-slate-400">Preview-ը կհայտնվի այստեղ։</p>
        </div>
      </div>
    </section>

    <div class="space-y-5">
      <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Production task</p>
            <div class="mt-1 flex flex-wrap items-center gap-2">
              <h3 class="truncate text-lg font-black text-slate-950 dark:text-white">{{ details.name || 'Առաջադրանք' }}</h3>
              <span v-if="details?.order_number?.number" class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ details.order_number.number }}</span>
            </div>
            <p class="mt-2 text-xs text-slate-400">Ստեղծող՝ <span class="font-bold text-slate-600 dark:text-slate-300">{{ details?.creator?.name || '—' }}</span></p>
          </div>
          <span class="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black" :class="deadlineClass">{{ deadlineText }}</span>
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/45"><p class="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Ստեղծվել է</p><p class="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">{{ details.created_at || '—' }}</p></div>
          <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/45"><p class="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Վերջնաժամկետ</p><p class="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">{{ formattedDeadline }}</p></div>
        </div>

        <div class="mt-4 rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
          <p class="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Նկարագրություն</p>
          <p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{{ details.description || 'Առանց նկարագրության' }}</p>
        </div>
      </section>

      <section class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div><p class="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Files</p><h3 class="mt-1 text-sm font-black text-slate-900 dark:text-white">Արտադրամասի ֆայլեր</h3></div>
          <span v-if="canDownload" class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{{ totalFiles }} ֆայլ</span>
        </div>

        <div v-if="!canDownload" class="p-6 text-center">
          <p class="text-xs font-semibold text-slate-400">Ֆայլերի ցանկը հասանելի չէ այս աշխատակցին։</p>
        </div>
        <div v-else-if="factoryOrders.length" class="max-h-[430px] space-y-3 overflow-y-auto p-4 sm:p-5">
          <article v-for="order in factoryOrders" :key="order.id" class="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/35">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div><p class="text-xs font-black text-slate-800 dark:text-slate-100">{{ order.factory?.name || 'Արտադրամաս' }}</p><p class="mt-0.5 text-[10px] text-slate-400">Օպերատոր՝ {{ order.operator?.name || '—' }}</p></div>
              <span v-if="order.status" class="rounded-full px-2.5 py-1 text-[9px] font-black" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
            </div>

            <div v-if="order.files?.length" class="space-y-2">
              <div v-for="file in order.files" :key="file.id" class="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div class="min-w-0 flex-1"><p class="truncate text-xs font-bold text-slate-800 dark:text-slate-100" :title="file.original_name">{{ file.original_name || 'Ֆայլ' }}</p><div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400"><span>Քանակ՝ {{ selectedQuantity(file) }}</span><span v-if="file.material_type">Նյութ՝ {{ file.material_type }}</span><span v-if="file.thickness">Հաստ՝ {{ file.thickness }}</span></div></div>
                  <div class="flex shrink-0 gap-2">
                    <button type="button" class="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="$emit('view-file', file)">Դիտել</button>
                    <button type="button" class="rounded-xl bg-slate-950 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" @click="$emit('download-file', file)">Ներբեռնել</button>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="py-3 text-center text-[10px] text-slate-400">Ֆայլեր չկան։</p>
          </article>
        </div>
        <div v-else class="p-8 text-center text-xs text-slate-400">Այս պատվերի համար ֆայլեր չկան։</div>
      </section>
    </div>
  </div>
</template>

<script>
import DxfViewerModal from '@/components/File/DxfViewerModal.vue'

export default {
  name: 'ProductionOrderDetailsPanel',
  components: { DxfViewerModal },
  props: {
    details: { type: Object, required: true },
    previewUrl: { type: String, default: '' },
    mode: { type: String, default: 'factory' },
  },
  computed: {
    canDownload() { return this.$can('factory.download') },
    factoryOrders() { return Array.isArray(this.details?.factory_orders) ? this.details.factory_orders : [] },
    totalFiles() { return this.factoryOrders.reduce((sum, order) => sum + (order.files?.length || 0), 0) },
    resolvedPreviewUrl() {
      if (!this.previewUrl) return ''
      if (/^(https?:|blob:|data:)/i.test(this.previewUrl) || this.previewUrl.startsWith('/api/')) return this.previewUrl
      return this.$getFileUrl ? this.$getFileUrl(this.previewUrl) : this.previewUrl
    },
    previewKind() {
      const value = String(this.previewUrl || '').split('?')[0].toLowerCase()
      if (value.endsWith('.dxf') || this.mode === 'laser') return 'dxf'
      if (value.endsWith('.pdf')) return 'pdf'
      if (/\.(png|jpe?g|webp|gif)$/.test(value)) return 'image'
      return 'file'
    },
    formattedDeadline() {
      const value = this.details?.dates?.finish_date
      if (!value) return 'Չի նշված'
      return this.$formatDate ? this.$formatDate(value) : value
    },
    deadlineState() {
      const value = this.details?.dates?.finish_date
      if (!value) return 'none'
      const end = new Date(value)
      if (Number.isNaN(end.getTime())) return 'none'
      const diff = end.getTime() - Date.now()
      if (diff < 0) return 'overdue'
      if (diff <= 24 * 60 * 60 * 1000) return 'soon'
      return 'ok'
    },
    deadlineText() {
      if (this.deadlineState === 'overdue') return 'Ժամկետանց'
      if (this.deadlineState === 'soon') return '24 ժամից քիչ'
      if (this.deadlineState === 'ok') return 'Ժամկետում'
      return 'Ժամկետ չկա'
    },
    deadlineClass() {
      if (this.deadlineState === 'overdue') return 'bg-rose-50 text-rose-700 dark:bg-rose-950/35 dark:text-rose-300'
      if (this.deadlineState === 'soon') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-300'
      if (this.deadlineState === 'ok') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300'
      return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
    },
  },
  methods: {
    selectedQuantity(file) {
      if (this.details?.link_existing_files) return file?.pivot?.quantity ?? file?.quantity ?? '—'
      return file?.quantity ?? '—'
    },
    statusLabel(status) {
      const value = String(status || '').toLowerCase()
      const labels = { pending: 'Սպասում է', waiting: 'Սպասում է', in_progress: 'Ընթացքում', accepted: 'Հաստատված', finished: 'Ավարտված', confirmed: 'Հաստատված', rejected: 'Մերժված', canceled: 'Չեղարկված', cancelled: 'Չեղարկված' }
      return labels[value] || status || '—'
    },
    statusClass(status) {
      const value = String(status || '').toLowerCase()
      if (['finished', 'confirmed'].includes(value)) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300'
      if (['rejected', 'canceled', 'cancelled'].includes(value)) return 'bg-rose-50 text-rose-700 dark:bg-rose-950/35 dark:text-rose-300'
      if (['accepted', 'in_progress'].includes(value)) return 'bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-300'
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-300'
    },
  },
}
</script>
