<template>
  <details
    class="work-card mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
    data-task-file-versions
    @toggle="onToggle"
  >
    <summary class="cursor-pointer font-bold">{{ t.fileVersions }}</summary>
    <p class="mt-3 text-sm text-slate-500">{{ t.fileVersionsHelp }}</p>
    <button
      type="button"
      :disabled="disabled || busy"
      class="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40"
      data-file-versions-refresh
      @click="load"
    >
      {{ busy ? t.evidenceSaving : t.refresh }}
    </button>
    <p v-if="error" role="alert" class="mt-3 break-words text-sm text-red-600">
      {{ error }}
    </p>
    <article
      v-for="file in files"
      :key="file.id"
      class="work-card mt-4 space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
      :data-file-versions="file.id"
    >
      <p class="break-all font-semibold">{{ file.original_name }}</p>
      <p class="text-sm font-bold text-blue-700 dark:text-blue-300">
        {{ t.currentVersion }} · v{{ currentVersion(file) }}
      </p>
      <div v-if="!file.versions.length" class="flex flex-wrap gap-3 text-sm">
        <span>{{ t.originalVersion }} · v1</span>
        <a
          :href="$getPmpFileUrl(file)"
          target="_blank"
          rel="noopener"
          class="text-blue-600 underline"
          >{{ t.view }}</a
        >
        <a :href="$getPmpFileUrl(file, true)" class="text-blue-600 underline">{{
          t.download
        }}</a>
      </div>
      <ul class="space-y-2">
        <li
          v-for="version in file.versions"
          :key="version.id"
          class="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800"
          :data-file-version="version.id"
        >
          <p class="break-words font-semibold">
            v{{ version.version }} · {{ version.original_name }}
            <span
              v-if="version.id === file.task_file_revision_id"
              class="text-blue-600"
              >· {{ t.currentVersion }}</span
            >
          </p>
          <p class="mt-1 text-xs text-slate-500">
            {{ version.user?.name }} · {{ $formatDate(version.created_at) }}
          </p>
          <p
            v-if="version.note"
            class="mt-1 whitespace-pre-wrap break-words text-xs"
          >
            {{ version.note }}
          </p>
          <div class="mt-2 flex flex-wrap items-center gap-3">
            <a
              :href="$getTaskRevisionUrl(version.id)"
              target="_blank"
              rel="noopener"
              class="text-blue-600 underline"
              >{{ t.view }}</a
            >
            <a
              :href="$getTaskRevisionUrl(version.id, true)"
              class="text-blue-600 underline"
              >{{ t.download }}</a
            >
            <button
              v-if="
                canManage &&
                file.can_update &&
                version.id !== file.task_file_revision_id
              "
              type="button"
              :disabled="disabled || busy"
              class="rounded-lg border border-slate-300 px-2 py-1 font-semibold disabled:opacity-40"
              data-activate-version
              @click="change(file, version.id)"
            >
              {{ t.activateVersion }}
            </button>
          </div>
        </li>
      </ul>
      <div
        v-if="canManage && file.can_update"
        class="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700"
      >
        <label class="block text-sm font-semibold"
          >{{ t.uploadVersion }}
          <input
            type="file"
            :accept="extension(file)"
            :disabled="disabled || busy"
            data-new-file-version
            class="mt-2 block w-full text-sm font-normal"
            @change="select(file, $event)"
          />
        </label>
        <p class="text-xs text-slate-500">{{ t.versionUploadHelp }}</p>
        <label class="block text-sm font-semibold"
          >{{ t.versionNote }}
          <textarea
            v-model="notes[file.id]"
            rows="2"
            maxlength="1000"
            :disabled="disabled || busy"
            data-version-note
            class="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <button
          type="button"
          :disabled="disabled || busy || !uploads[file.id]"
          data-upload-version
          class="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
          @click="change(file)"
        >
          {{ saving ? t.evidenceSaving : t.uploadVersion }}
        </button>
      </div>
    </article>
  </details>
</template>

<script>
import { canManageTask } from '@/utils/task-routing'
import { apiErrorMessage, taskCopy } from '@/utils/task-workflow'
export default {
  props: { order: { type: Object, required: true }, disabled: Boolean },
  data: () => ({
    files: [],
    uploads: {},
    notes: {},
    loading: false,
    saving: false,
    error: '',
    loaded: false,
    requestVersion: 0,
  }),
  computed: {
    t() {
      return taskCopy[this.$i18n?.locale] || taskCopy.hy
    },
    canManage() {
      return canManageTask(
        this.$auth?.user,
        this.order,
        this.$can('orders.update')
      )
    },
    busy() {
      return this.loading || this.saving
    },
    scopeKey() {
      return `${this.$auth?.user?.id || ''}:${
        this.$store?.state?.workspace?.company?.id ||
        this.order.company_id ||
        ''
      }:${this.order.id}`
    },
  },
  watch: {
    scopeKey() {
      this.requestVersion++
      this.files = []
      this.uploads = {}
      this.notes = {}
      this.error = ''
      this.loaded = false
      this.loading = false
      this.saving = false
      this.$emit('busy', false)
    },
  },
  beforeDestroy() {
    this.requestVersion++
  },
  methods: {
    extension(file) {
      const name = file.original_name || ''
      return name.includes('.') ? `.${name.split('.').pop().toLowerCase()}` : ''
    },
    currentVersion(file) {
      return (
        file.versions.find((row) => row.id === file.task_file_revision_id)
          ?.version || 1
      )
    },
    onToggle(event) {
      if (event.target.open && !this.loaded) this.load()
    },
    async load() {
      if (this.disabled || this.busy) return
      const version = ++this.requestVersion
      const scope = this.scopeKey
      const current = () =>
        version === this.requestVersion && scope === this.scopeKey
      this.loading = true
      this.$emit('busy', true)
      this.error = ''
      try {
        const { data } = await this.$axios.get(
          `/api/tasks/${this.order.id}/file-versions`
        )
        if (!current()) return
        this.files = data.files
        this.loaded = true
      } catch (error) {
        if (current())
          this.error = apiErrorMessage(error, this.t.evidenceSaveFailed)
      } finally {
        if (current()) {
          this.loading = false
          this.$emit('busy', false)
        }
      }
    },
    select(file, event) {
      if (this.disabled || this.busy) return
      const upload = event.target.files?.[0]
      this.error = ''
      this.$set(this.uploads, file.id, null)
      if (!upload) return
      if (
        upload.size > 10 * 1024 * 1024 ||
        !upload.name.toLowerCase().endsWith(this.extension(file))
      ) {
        this.error = this.t.versionUploadHelp
        event.target.value = ''
        return
      }
      this.$set(this.uploads, file.id, upload)
    },
    async change(file, revisionId = null) {
      if (
        !this.canManage ||
        !file.can_update ||
        this.disabled ||
        this.busy ||
        (!revisionId && !this.uploads[file.id])
      )
        return
      const version = ++this.requestVersion
      const scope = this.scopeKey
      const current = () =>
        version === this.requestVersion && scope === this.scopeKey
      this.saving = true
      this.$emit('busy', true)
      this.error = ''
      try {
        let response
        if (revisionId)
          response = await this.$axios.put(
            `/api/tasks/${this.order.id}/files/${file.id}/version`,
            {
              revision_id: revisionId,
              previous_revision_id: file.task_file_revision_id || null,
            }
          )
        else {
          const form = new FormData()
          form.append('file', this.uploads[file.id])
          form.append('note', this.notes[file.id] || '')
          form.append('previous_revision_id', file.task_file_revision_id || '')
          response = await this.$axios.post(
            `/api/tasks/${this.order.id}/files/${file.id}/versions`,
            form
          )
        }
        if (!current()) return
        this.files = response.data.files
        this.$delete(this.uploads, file.id)
        this.$delete(this.notes, file.id)
        this.$emit('updated', response.data.order)
        this.$notify?.({ type: 'success', text: this.t.versionSaved })
      } catch (error) {
        if (current())
          this.error = apiErrorMessage(error, this.t.evidenceSaveFailed)
      } finally {
        if (current()) {
          this.saving = false
          this.$emit('busy', false)
        }
      }
    },
  },
}
</script>
