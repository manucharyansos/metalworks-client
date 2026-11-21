<template>
  <div
    v-if="canRename || canDelete"
    class="flex shrink-0 items-center gap-1.5"
    data-project-actions
  >
    <button
      v-if="canRename"
      ref="renameButton"
      type="button"
      class="project-action"
      :title="copy.rename"
      :aria-label="copy.rename"
      data-project-rename
      @click="openRename"
    >
      <svg
        class="h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Zm9.5-12.5 3 3"
        />
      </svg>
      <span class="hidden 2xl:inline">{{ copy.rename }}</span>
    </button>
    <button
      v-if="canDelete"
      ref="deleteButton"
      type="button"
      class="project-action project-action--danger"
      :title="copy.remove"
      :aria-label="copy.remove"
      data-project-delete
      @click="openDelete"
    >
      <svg
        class="h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
        />
      </svg>
      <span class="hidden 2xl:inline">{{ copy.remove }}</span>
    </button>

    <div
      v-if="renaming"
      class="work-modal-backdrop fixed inset-0 z-[1000]"
      @click.self="closeRename"
    >
      <form
        class="work-modal flex w-full max-w-md flex-col"
        role="dialog"
        aria-modal="true"
        :aria-label="copy.renameTitle"
        data-work-modal
        data-project-rename-dialog
        novalidate
        @submit.prevent="saveNames"
        @keydown.esc="closeRename"
      >
        <header
          class="work-modal__header flex items-center justify-between gap-3"
        >
          <h2 class="text-base font-bold">{{ copy.renameTitle }}</h2>
          <button
            type="button"
            class="work-modal__close"
            :aria-label="copy.close"
            @click="closeRename"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </header>
        <div class="work-modal__body space-y-4">
          <label class="block text-sm font-semibold">
            <span class="flex items-baseline justify-between gap-3">
              <span>{{ copy.groupName }}</span>
              <span class="font-mono text-xs text-slate-400">{{
                groupCode
              }}</span>
            </span>
            <input
              ref="groupInput"
              v-model="form.group_name"
              type="text"
              maxlength="255"
              autocomplete="off"
              :disabled="saving"
              :aria-invalid="String(Boolean(fieldErrors.group_name))"
              class="project-input"
              data-project-group-name
              @input="fieldErrors.group_name = ''"
            />
          </label>
          <p
            v-if="fieldErrors.group_name"
            role="alert"
            class="-mt-2 text-sm text-rose-600 dark:text-rose-300"
          >
            {{ fieldErrors.group_name }}
          </p>
          <label class="block text-sm font-semibold">
            <span class="flex items-baseline justify-between gap-3">
              <span>{{ copy.subgroupName }}</span>
              <span class="font-mono text-xs text-slate-400"
                >{{ groupCode }}.{{ subgroupCode }}</span
              >
            </span>
            <input
              v-model="form.remote_number_name"
              type="text"
              maxlength="255"
              autocomplete="off"
              :disabled="saving"
              :aria-invalid="String(Boolean(fieldErrors.remote_number_name))"
              class="project-input"
              data-project-subgroup-name
              @input="fieldErrors.remote_number_name = ''"
            />
          </label>
          <p
            v-if="fieldErrors.remote_number_name"
            role="alert"
            class="-mt-2 text-sm text-rose-600 dark:text-rose-300"
          >
            {{ fieldErrors.remote_number_name }}
          </p>
          <p
            class="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500 dark:bg-slate-950/40 dark:text-slate-400"
          >
            {{ copy.codesKept(groupCode, subgroupCode) }} {{ copy.groupShared }}
          </p>
          <p
            v-if="renameError"
            role="alert"
            class="break-words text-sm text-rose-600 dark:text-rose-300"
          >
            {{ renameError }}
          </p>
        </div>
        <footer class="work-modal__footer flex flex-wrap justify-end gap-2">
          <button
            type="button"
            class="work-button"
            :disabled="saving"
            @click="closeRename"
          >
            {{ copy.cancel }}
          </button>
          <button
            type="submit"
            class="work-button"
            data-variant="primary"
            :disabled="!canSave"
            data-project-rename-save
          >
            {{ saving ? copy.saving : copy.save }}
          </button>
        </footer>
      </form>
    </div>

    <div
      v-if="removing"
      class="work-modal-backdrop fixed inset-0 z-[1000]"
      @click.self="closeDelete"
    >
      <div
        class="work-modal flex w-full max-w-md flex-col"
        role="alertdialog"
        aria-modal="true"
        :aria-label="copy.deleteTitle"
        tabindex="-1"
        data-work-modal
        data-project-delete-dialog
        @keydown.esc="closeDelete"
      >
        <header
          class="work-modal__header flex items-center justify-between gap-3"
        >
          <h2 class="text-base font-bold">{{ copy.deleteTitle }}</h2>
          <button
            ref="deleteClose"
            type="button"
            class="work-modal__close"
            :aria-label="copy.close"
            @click="closeDelete"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </header>
        <div class="work-modal__body space-y-3 text-sm leading-6">
          <p class="break-words font-semibold" data-project-delete-label>
            <span class="font-mono">{{ groupCode }}.{{ subgroupCode }}</span> —
            {{ remote.remote_number_name }}
          </p>
          <p
            v-if="checking"
            role="status"
            class="text-slate-500 dark:text-slate-400"
          >
            {{ copy.checking }}
          </p>
          <template v-else-if="preview && preview.can_delete">
            <p data-project-delete-files>{{ copy.files(preview.files) }}</p>
            <p v-if="preview.removes_group" data-project-delete-group>
              {{ copy.group(groupLabel) }}
            </p>
            <p class="font-semibold text-rose-600 dark:text-rose-300">
              {{ copy.final }}
            </p>
          </template>
          <template v-else-if="preview">
            <p
              class="rounded-xl bg-amber-50 p-3 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
              data-project-delete-blocked
            >
              {{ copy.blocked(preview.tasks_total) }}
            </p>
            <ul class="space-y-1" data-project-delete-tasks>
              <li
                v-for="task in preview.tasks"
                :key="task.id"
                class="break-words"
              >
                <span class="font-mono">{{
                  task.number || '#' + task.id
                }}</span>
                <template v-if="task.name"> — {{ task.name }}</template>
              </li>
              <li v-if="hiddenTasks" class="text-slate-500 dark:text-slate-400">
                {{ copy.more(hiddenTasks) }}
              </li>
            </ul>
            <p class="text-slate-500 dark:text-slate-400">
              {{ copy.blockedHint }}
            </p>
          </template>
          <p
            v-if="deleteError"
            role="alert"
            class="break-words text-rose-600 dark:text-rose-300"
          >
            {{ deleteError }}
            <button
              v-if="!preview"
              type="button"
              class="ml-1 font-semibold underline"
              @click="loadPreview"
            >
              {{ copy.retry }}
            </button>
          </p>
        </div>
        <footer class="work-modal__footer flex flex-wrap justify-end gap-2">
          <button
            type="button"
            class="work-button"
            :disabled="deleting"
            @click="closeDelete"
          >
            {{ preview && !preview.can_delete ? copy.close : copy.cancel }}
          </button>
          <button
            v-if="preview && preview.can_delete"
            type="button"
            class="work-button"
            data-variant="danger"
            :disabled="deleting"
            data-project-delete-confirm
            @click="confirmDelete"
          >
            {{ deleting ? copy.deleting : copy.confirm }}
          </button>
        </footer>
      </div>
    </div>
    <notifications group="project-actions" />
  </div>
</template>

<script>
import { apiErrorMessage } from '@/utils/task-workflow'
import { projectCode, projectCopy } from '@/utils/project-copy'

export default {
  name: 'ProjectSubgroupActions',
  props: {
    pmp: { type: Object, required: true },
    remote: { type: Object, required: true },
  },
  data() {
    return {
      renaming: false,
      saving: false,
      form: { group_name: '', remote_number_name: '' },
      fieldErrors: { group_name: '', remote_number_name: '' },
      renameError: '',
      removing: false,
      checking: false,
      deleting: false,
      preview: null,
      deleteError: '',
    }
  },
  computed: {
    locale() {
      return String(this.$i18n?.locale || 'hy').split('-')[0]
    },
    copy() {
      return projectCopy(this.locale)
    },
    canRename() {
      return this.$can('pmp.update')
    },
    // Deleting also removes the subgroup's files.
    canDelete() {
      return this.$can('pmp.update') && this.$can('pmp_files.delete')
    },
    groupCode() {
      return projectCode(this.pmp.group, 3)
    },
    subgroupCode() {
      return projectCode(this.remote.remote_number, 2)
    },
    groupLabel() {
      return `${this.groupCode} — ${this.pmp.group_name || ''}`
    },
    names() {
      return {
        group_name: String(this.form.group_name || '').trim(),
        remote_number_name: String(this.form.remote_number_name || '').trim(),
      }
    },
    changed() {
      return (
        this.names.group_name !== String(this.pmp.group_name || '').trim() ||
        this.names.remote_number_name !==
          String(this.remote.remote_number_name || '').trim()
      )
    },
    canSave() {
      return (
        !this.saving &&
        this.changed &&
        Boolean(this.names.group_name) &&
        Boolean(this.names.remote_number_name)
      )
    },
    hiddenTasks() {
      if (!this.preview) return 0
      return Math.max(
        0,
        Number(this.preview.tasks_total || 0) -
          (this.preview.tasks || []).length
      )
    },
  },
  methods: {
    url() {
      return `/api/engineers/pmps/remote-number/${this.remote.id}`
    },
    // Server texts are Armenian; other languages get the matching local text.
    serverText(error, field, fallback) {
      const message = error?.response?.data?.errors?.[field]?.[0]
      if (!message) return ''
      return this.locale === 'hy' ? message : fallback
    },
    openRename() {
      this.form = {
        group_name: this.pmp.group_name || '',
        remote_number_name: this.remote.remote_number_name || '',
      }
      this.fieldErrors = { group_name: '', remote_number_name: '' }
      this.renameError = ''
      this.renaming = true
      this.$nextTick(() => this.$refs.groupInput?.focus())
    },
    closeRename() {
      if (this.saving) return
      this.renaming = false
      this.$nextTick(() => this.$refs.renameButton?.focus())
    },
    async saveNames() {
      if (!this.canSave) return
      this.saving = true
      this.renameError = ''
      try {
        const data = await this.$axios.$put(this.url(), this.names)
        this.$emit('renamed', data?.pmp || data)
        this.saving = false
        this.closeRename()
        this.$notify({
          group: 'project-actions',
          type: 'success',
          text: this.copy.saved,
        })
      } catch (error) {
        const group = this.serverText(error, 'group_name', this.copy.groupTaken)
        const subgroup = this.serverText(
          error,
          'remote_number_name',
          this.copy.subgroupTaken
        )
        this.fieldErrors = { group_name: group, remote_number_name: subgroup }
        if (!group && !subgroup)
          this.renameError = apiErrorMessage(error, this.copy.saveFailed)
      } finally {
        this.saving = false
      }
    },
    openDelete() {
      this.removing = true
      this.preview = null
      this.deleteError = ''
      this.$nextTick(() => this.$refs.deleteClose?.focus())
      return this.loadPreview()
    },
    closeDelete() {
      if (this.deleting) return
      this.removing = false
      this.$nextTick(() => this.$refs.deleteButton?.focus())
    },
    async loadPreview() {
      this.checking = true
      this.deleteError = ''
      try {
        this.preview = await this.$axios.$get(`${this.url()}/deletion`)
      } catch (error) {
        this.preview = null
        this.deleteError = apiErrorMessage(error, this.copy.previewFailed)
      } finally {
        this.checking = false
      }
    },
    async confirmDelete() {
      if (!this.preview?.can_delete || this.deleting) return
      this.deleting = true
      this.deleteError = ''
      try {
        const data = await this.$axios.$delete(this.url())
        this.deleting = false
        this.removing = false
        this.$emit('deleted', { groupDeleted: Boolean(data?.group_deleted) })
      } catch (error) {
        this.deleting = false
        // A task may have taken the subgroup meanwhile: show what holds it now.
        if (error?.response?.data?.errors?.project) await this.loadPreview()
        else this.deleteError = apiErrorMessage(error, this.copy.deleteFailed)
      } finally {
        this.deleting = false
      }
    },
  },
}
</script>

<style scoped>
.project-action {
  @apply inline-flex h-8 min-w-[2rem] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 2xl:px-3;
}
.project-action--danger {
  @apply text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30;
}
.project-input {
  @apply mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white;
}
</style>
