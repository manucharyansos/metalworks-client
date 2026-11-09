<template>
  <div
    class="work-production-detail grid items-start gap-5 xl:grid-cols-[0.9fr_1.1fr]"
  >
    <section
      ref="filePreviewRegion"
      tabindex="-1"
      data-file-preview-region
      class="work-card overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div
        class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800"
      >
        <div>
          <h3 class="mt-1 text-sm font-black text-slate-900 dark:text-white">
            {{ $t('file_details.preview') }}
          </h3>
        </div>
        <button
          v-if="(previewFile || previewUrl) && canDownload"
          type="button"
          class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="closePreview"
        >
          Փակել
        </button>
      </div>

      <div class="p-4 sm:p-5">
        <div
          v-if="!canDownload"
          class="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center dark:border-slate-800 dark:bg-slate-950/40"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
                d="M8 10V7a4 4 0 018 0v3m-9 0h10a2 2 0 012 2v8H5v-8a2 2 0 012-2Z"
              />
            </svg>
          </div>
          <p class="mt-4 text-sm font-black text-slate-700 dark:text-slate-200">
            Ֆայլերի հասանելիությունը փակ է
          </p>
          <p class="mt-2 max-w-sm text-xs leading-5 text-slate-400">
            Admin-ը պետք է տա «Արտադրամասի ֆայլեր դիտել և ներբեռնել» ֆունկցիան։
          </p>
        </div>

        <FilePreview
          v-else-if="previewFile"
          :file="previewFile"
          :order-id="details.id"
          show-download
          @download="$emit('download-file', $event)"
          @close="closePreview"
        />
        <div
          v-else-if="previewUrl"
          class="min-h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40"
        >
          <DxfViewerModal
            v-if="previewKind === 'dxf'"
            :key="resolvedPreviewUrl"
            :dxf-url="resolvedPreviewUrl"
            :show-laser-info="mode === 'laser'"
          />
          <iframe
            v-else-if="previewKind === 'pdf'"
            :key="resolvedPreviewUrl"
            :src="resolvedPreviewUrl"
            class="h-[430px] w-full border-0 bg-white"
            title="PDF Preview"
          ></iframe>
          <img
            v-else-if="previewKind === 'image'"
            :src="resolvedPreviewUrl"
            class="h-[430px] w-full object-contain p-3"
            alt="File preview"
          />
          <div
            v-else
            class="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                  d="M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2Zm7 0v6h5"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-200">
                Inline preview հասանելի չէ
              </p>
              <p class="mt-1 text-xs text-slate-400">
                Ֆայլը կարող եք բացել առանձին պատուհանում։
              </p>
            </div>
            <a
              :href="resolvedPreviewUrl"
              target="_blank"
              rel="noopener"
              class="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white dark:bg-white dark:text-slate-950"
              >Բացել ֆայլը</a
            >
          </div>
        </div>

        <div
          v-else
          class="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center dark:border-slate-800 dark:bg-slate-950/40"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
                d="M12 5v14M5 12h14"
              />
            </svg>
          </div>
          <p class="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
            Ընտրեք ֆայլ
          </p>
          <p class="mt-1 text-sm text-slate-400">
            Նախադիտումը կհայտնվի այստեղ։
          </p>
        </div>
      </div>
    </section>

    <div class="space-y-5">
      <section
        class="work-card rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
      >
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div class="min-w-0">
            <p
              class="text-sm font-bold uppercase tracking-[0.16em] text-slate-400"
            >
              Առաջադրանքի տվյալներ
            </p>
            <div class="mt-1 flex flex-wrap items-center gap-2">
              <h3
                class="truncate text-lg font-black text-slate-950 dark:text-white"
              >
                {{ details.name || 'Առաջադրանք' }}
              </h3>
              <span
                v-if="details?.order_number?.number"
                class="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >{{ details.order_number.number }}</span
              >
            </div>
            <p class="mt-2 text-xs text-slate-400">
              Ստեղծող՝
              <span class="font-bold text-slate-600 dark:text-slate-300">{{
                details?.creator?.name || '—'
              }}</span>
            </p>
          </div>
          <span
            class="shrink-0 rounded-full px-3 py-1.5 text-sm font-bold"
            :class="deadlineClass"
            >{{ deadlineText }}</span
          >
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/45">
            <p
              class="text-xs font-bold uppercase tracking-[0.12em] text-slate-400"
            >
              Ստեղծվել է
            </p>
            <p
              class="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              {{ details.created_at || '—' }}
            </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/45">
            <p
              class="text-xs font-bold uppercase tracking-[0.12em] text-slate-400"
            >
              Վերջնաժամկետ
            </p>
            <p
              class="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              {{ formattedDeadline }}
            </p>
          </div>
        </div>

        <div
          class="mt-4 rounded-2xl border border-slate-100 p-4 dark:border-slate-800"
        >
          <p
            class="text-xs font-bold uppercase tracking-[0.12em] text-slate-400"
          >
            Նկարագրություն
          </p>
          <p
            class="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300"
          >
            {{ details.description || 'Առանց նկարագրության' }}
          </p>
        </div>
      </section>

      <section
        class="work-card overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div
          class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6"
        >
          <div>
            <p
              class="text-sm font-bold uppercase tracking-[0.16em] text-slate-400"
            >
              Ֆայլեր
            </p>
            <h3 class="mt-1 text-sm font-black text-slate-900 dark:text-white">
              Արտադրամասի ֆայլեր
            </h3>
          </div>
          <span
            v-if="canDownload"
            class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300"
            >{{ totalFiles }} ֆայլ</span
          >
        </div>

        <div v-if="!canDownload" class="p-6 text-center">
          <p class="text-xs font-semibold text-slate-400">
            Ֆայլերի ցանկը հասանելի չէ այս աշխատակցին։
          </p>
        </div>
        <div
          v-else-if="factoryOrders.length"
          class="max-h-[min(60vh,560px)] space-y-3 overflow-y-auto overscroll-contain p-4 sm:p-5"
          data-files-scroll
        >
          <article
            v-for="order in factoryOrders"
            :key="order.id"
            class="work-card rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/35"
          >
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p class="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {{ order.factory?.name || 'Արտադրամաս' }}
                </p>
                <p class="mt-0.5 text-xs text-slate-400">
                  Օպերատոր՝ {{ order.operator?.name || '—' }}
                </p>
              </div>
              <span
                v-if="order.status"
                class="rounded-full px-2.5 py-1 text-sm font-bold"
                :class="
                  order.awaiting_engineer_confirmation
                    ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/35 dark:text-amber-300'
                    : statusClass(order.status)
                "
                >{{
                  order.awaiting_engineer_confirmation
                    ? 'Սպասում է ինժեների հաստատմանը'
                    : statusLabel(order.status)
                }}</span
              >
            </div>

            <TaskFileFolders
              v-if="order.files?.length"
              :items="order.files"
              v-slot="{ items: files }"
            >
              <div
                v-for="file in files"
                :key="file.id"
                class="work-file-row"
                :data-active="String(isPreviewed(file))"
              >
                <div
                  class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="min-w-0 flex-1">
                    <p class="flex min-w-0 items-start gap-2">
                      <span
                        class="file-badge"
                        :data-kind="fileKind(file.original_name || file.path)"
                        >{{
                          fileExtensionOf(file.original_name || file.path).toUpperCase() ||
                          '—'
                        }}</span
                      ><span
                        class="line-clamp-2 break-all text-sm font-bold text-slate-800 dark:text-slate-100"
                        :title="file.original_name"
                        >{{ file.original_name || 'Ֆայլ' }}</span
                      >
                    </p>
                    <div
                      class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400"
                    >
                      <span>Քանակ՝ {{ selectedQuantity(file) }}</span
                      ><span v-if="fileAttribute(file, 'material_type')"
                        >Նյութ՝ {{ fileAttribute(file, 'material_type') }}</span
                      ><span
                        v-if="
                          fileAttribute(file, 'thickness') !== null &&
                          fileAttribute(file, 'thickness') !== undefined
                        "
                        >Հաստ՝ {{ fileAttribute(file, 'thickness') }}</span
                      >
                    </div>
                    <FileProductionAttributes :file="file" />
                  </div>
                  <div v-if="!file.operator_download_restricted" class="flex shrink-0 gap-2">
                    <button
                      type="button"
                      class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      @click="openFile(file)"
                    >
                      Դիտել
                    </button>
                    <button
                      type="button"
                      class="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                      @click="$emit('download-file', file)"
                    >
                      Ներբեռնել
                    </button>
                  </div>
                </div>
              </div>
            </TaskFileFolders>
            <p v-else class="py-3 text-center text-xs text-slate-400">
              Ֆայլեր չկան։
            </p>
            <TaskChangeRequestPanel
              :step="order"
              :creator-id="details.creator_id"
              @updated="$emit('updated', $event)"
            />
            <TaskCompletionProof
              :step="order"
              :creator-id="details.creator_id"
              @updated="$emit('updated', $event)"
            />
          </article>
        </div>
        <div v-else class="p-8 text-center text-xs text-slate-400">
          Այս առաջադրանքի համար ֆայլեր չկան։
        </div>
      </section>
      <TaskFileVersions
        v-if="
          !['admin', 'manager', 'engineer'].includes($auth?.user?.role?.name) &&
          canDownload
        "
        :order="details"
      />
    </div>
  </div>
</template>

<script>
import { workshopSteps } from '@/utils/task-board'
import TaskCompletionProof from '@/components/order/TaskCompletionProof.vue'
import TaskChangeRequestPanel from '@/components/order/TaskChangeRequestPanel.vue'
import TaskFileVersions from '@/components/order/TaskFileVersions.vue'
import DxfViewerModal from '@/components/File/DxfViewerModal.vue'
import TaskFileFolders from '@/components/File/TaskFileFolders.vue'
import FileProductionAttributes from '@/components/File/FileProductionAttributes.vue'
import FilePreview from '@/components/File/FilePreview.vue'
import { fileAttribute } from '@/utils/file-production-details'
import {
  fileExtensionOf,
  fileKind,
  preferredPreviewFile,
} from '@/utils/file-kind'

export default {
  name: 'ProductionOrderDetailsPanel',
  components: {
    FilePreview,
    FileProductionAttributes,
    TaskFileFolders,
    DxfViewerModal,
    TaskCompletionProof,
    TaskChangeRequestPanel,
    TaskFileVersions,
  },
  props: {
    details: { type: Object, required: true },
    previewUrl: { type: String, default: '' },
    mode: { type: String, default: 'factory' },
  },
  data: () => ({ activePreviewFile: null }),
  computed: {
    previewFile() {
      if (this.activePreviewFile) return this.activePreviewFile
      if (!this.previewUrl) return null
      const files = this.factoryOrders.flatMap((step) => step.files || [])
      const raw = decodeURIComponent(String(this.previewUrl).split('?')[0])
      const id = raw.match(/\/pmp\/(\d+)$/)?.[1]
      const revision = raw.match(/\/task-revisions\/(\d+)$/)?.[1]
      return (
        files.find((file) =>
          id
            ? Number(file.id) === Number(id)
            : revision
            ? Number(
                file.task_file_revision_id || file.pivot?.task_file_revision_id
              ) === Number(revision)
            : file.path && (raw === file.path || raw.endsWith('/' + file.path))
        ) || null
      )
    },
    canDownload() {
      return this.$can('factory.download')
    },
    factoryOrders() {
      return workshopSteps(this.details)
    },
    totalFiles() {
      return this.factoryOrders.reduce(
        (sum, order) => sum + (order.files?.length || 0),
        0
      )
    },
    resolvedPreviewUrl() {
      if (!this.previewUrl) return ''
      if (
        /^(https?:|blob:|data:)/i.test(this.previewUrl) ||
        this.previewUrl.startsWith('/api/')
      )
        return this.previewUrl
      return this.$getFileUrl
        ? this.$getFileUrl(this.previewUrl)
        : this.previewUrl
    },
    previewKind() {
      const source = String(this.previewUrl || '')
      const name = source.includes('?')
        ? new URLSearchParams(source.split('?')[1]).get('filename')
        : null
      const value = (name || source.split('?')[0]).toLowerCase()
      if (value.endsWith('.dxf')) return 'dxf'
      if (value.endsWith('.pdf')) return 'pdf'
      if (/\.(png|jpe?g|webp|gif)$/.test(value)) return 'image'
      return 'file'
    },
    formattedDeadline() {
      const value =
        (this.mode === 'factory' && this.factoryOrders.length === 1
          ? this.factoryOrders[0].deadline
          : null) || this.details?.dates?.finish_date
      if (!value) return 'Չի նշված'
      return this.$formatDate ? this.$formatDate(value) : value
    },
    deadlineState() {
      const value =
        (this.mode === 'factory' && this.factoryOrders.length === 1
          ? this.factoryOrders[0].deadline
          : null) || this.details?.dates?.finish_date
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
      if (this.deadlineState === 'overdue')
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/35 dark:text-rose-300'
      if (this.deadlineState === 'soon')
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-300'
      if (this.deadlineState === 'ok')
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300'
      return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
    },
  },
  watch: {
    'details.id'() {
      this.activePreviewFile = null
      this.$nextTick(() => this.autoPreview())
    },
    previewUrl(value, previous) {
      if (!value && previous) this.activePreviewFile = null
    },
  },
  mounted() {
    this.autoPreview()
  },
  methods: {
    fileAttribute,
    fileExtensionOf,
    fileKind,
    isPreviewed(file) {
      const shown = this.previewFile
      return Boolean(shown && file && Number(shown.id) === Number(file.id))
    },
    // Opening a task shows its most useful file right away: the workshop's
    // program (DXF, DLD), else a drawing, image, 3D model or CAD view.
    autoPreview() {
      if (!this.canDownload || this.activePreviewFile) return
      if (this.previewUrl) {
        if (this.previewFile) return
        // A preview left over from another task is cleared first.
        this.$emit('close-preview')
      }
      const file = preferredPreviewFile(
        this.factoryOrders.flatMap((step) => step.files || [])
      )
      if (!file) return
      this.activePreviewFile = file
      this.$emit('view-file', file)
    },
    openFile(file) {
      this.activePreviewFile = file
      this.$emit('view-file', file)
      this.$nextTick(() => {
        const region = this.$refs.filePreviewRegion
        region?.scrollIntoView?.({ block: 'start', behavior: 'auto' })
        region?.focus?.({ preventScroll: true })
      })
    },
    closePreview() {
      this.activePreviewFile = null
      this.$emit('close-preview')
    },
    selectedQuantity(file) {
      return fileAttribute(file, 'quantity') ?? '—'
    },
    statusLabel(status) {
      const value = String(status || '').toLowerCase()
      const labels = {
        pending: 'Սպասում է',
        waiting: 'Սպասում է',
        in_progress: 'Ընթացքում',
        accepted: 'Հաստատված',
        finished: 'Ավարտված',
        confirmed: 'Կատարվում է',
        rejected: 'Մերժված',
        canceled: 'Չեղարկված',
        cancelled: 'Չեղարկված',
      }
      return labels[value] || status || '—'
    },
    statusClass(status) {
      const value = String(status || '').toLowerCase()
      if (value === 'finished')
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300'
      if (['rejected', 'canceled', 'cancelled'].includes(value))
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/35 dark:text-rose-300'
      if (['confirmed', 'accepted', 'in_progress'].includes(value))
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-300'
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-300'
    },
  },
}
</script>

<style scoped>
.work-file-row[data-active='true'] {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}
/* File type badges: programs blue, drawings red, images green, 3D violet,
   CAD views amber. */
.file-badge {
  flex-shrink: 0;
  margin-top: 1px;
  padding: 1px 6px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.6;
}
.file-badge[data-kind='program'] {
  background: #dbeafe;
  color: #1d4ed8;
}
.file-badge[data-kind='drawing'] {
  background: #ffe4e6;
  color: #be123c;
}
.file-badge[data-kind='image'] {
  background: #d1fae5;
  color: #047857;
}
.file-badge[data-kind='model'] {
  background: #ede9fe;
  color: #6d28d9;
}
.file-badge[data-kind='cad'] {
  background: #fef3c7;
  color: #b45309;
}
.dark .file-badge {
  background: #1e293b;
  color: #cbd5e1;
}
.dark .file-badge[data-kind='program'] {
  background: #172554;
  color: #93c5fd;
}
.dark .file-badge[data-kind='drawing'] {
  background: #4c0519;
  color: #fda4af;
}
.dark .file-badge[data-kind='image'] {
  background: #052e2b;
  color: #6ee7b7;
}
.dark .file-badge[data-kind='model'] {
  background: #2e1065;
  color: #c4b5fd;
}
.dark .file-badge[data-kind='cad'] {
  background: #422006;
  color: #fcd34d;
}
</style>
