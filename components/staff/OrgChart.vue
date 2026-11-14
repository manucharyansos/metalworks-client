<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8" data-org-chart>
    <div class="mx-auto space-y-5">
      <section
        class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="flex items-center gap-2">
          <h1
            class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl"
          >
            {{ t.title }}
          </h1>
          <InfoTooltip>{{ t.help }}</InfoTooltip>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div
            v-if="tree.length"
            class="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <button
              type="button"
              class="org-zoom"
              :aria-label="t.zoomOut"
              :disabled="zoom <= 0.5"
              @click="setZoom(zoom - 0.1)"
            >
              −
            </button>
            <button
              type="button"
              class="w-14 text-center text-xs font-bold text-slate-600 dark:text-slate-300"
              @click="setZoom(1)"
            >
              {{ Math.round(zoom * 100) }}%
            </button>
            <button
              type="button"
              class="org-zoom"
              :aria-label="t.zoomIn"
              :disabled="zoom >= 1.5"
              @click="setZoom(zoom + 0.1)"
            >
              +
            </button>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            :disabled="busy || !loaded"
            data-org-new
            @click="openPosition(null)"
          >
            <span class="text-lg leading-none">+</span> {{ t.addTop }}
          </button>
        </div>
      </section>

      <div
        v-if="error"
        role="alert"
        class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
      >
        {{ error }}
        <button type="button" class="ml-2 underline" @click="load">
          {{ t.retry }}
        </button>
      </div>

      <section
        v-if="unplaced.length"
        class="work-card rounded-3xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/20"
        data-org-unplaced
      >
        <h2 class="text-sm font-black text-slate-900 dark:text-white">
          {{ t.unplaced }}
          <span
            class="ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200 dark:bg-slate-900 dark:text-amber-300 dark:ring-amber-900"
            >{{ unplaced.length }}</span
          >
        </h2>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="row in unplaced"
            :key="row.assignment_id"
            type="button"
            class="flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-2.5 py-1.5 text-left text-xs shadow-sm transition hover:border-amber-400 dark:border-amber-900/60 dark:bg-slate-900"
            :data-org-unplaced-row="row.assignment_id"
            @click="openPerson(row.user_id, row.assignment_id)"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white"
              aria-hidden="true"
              >{{ initials(row.name) }}</span
            >
            <span class="min-w-0">
              <span
                class="block font-bold text-slate-800 dark:text-slate-100"
                >{{ row.name }}</span
              >
              <span
                class="block text-[11px] text-slate-500 dark:text-slate-400"
                >{{ accessText(row.role, row.factory, roleNames) }}</span
              >
            </span>
          </button>
        </div>
      </section>

      <div
        v-if="loading && !loaded"
        class="flex min-h-[320px] items-center justify-center"
      >
        <span
          class="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 dark:border-slate-700 dark:border-t-white"
        ></span>
      </div>

      <section
        v-else-if="loaded && !tree.length"
        class="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900"
        data-org-empty
      >
        <h2 class="text-lg font-black text-slate-900 dark:text-white">
          {{ t.empty }}
        </h2>
        <p
          class="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400"
        >
          {{ t.emptyHint }}
        </p>
        <div class="mt-5 flex flex-wrap justify-center gap-2">
          <button
            v-if="unplaced.length"
            type="button"
            class="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
            :disabled="busy"
            data-org-generate
            @click="generate"
          >
            {{ t.generate }}
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
            :disabled="busy"
            @click="openPosition(null)"
          >
            + {{ t.addTop }}
          </button>
        </div>
      </section>

      <section
        v-else-if="tree.length"
        class="org-canvas"
        :aria-busy="busy ? 'true' : 'false'"
      >
        <div class="org-forest" :style="{ zoom }">
          <OrgChartBranch
            v-for="node in tree"
            :key="node.id"
            :node="node"
            :tones="tones"
            :role-names="roleNames"
            :editable-roles="editableRoles"
            :t="t"
            @add-child="openPosition(null, $event)"
            @edit="openPosition($event)"
            @remove="removePosition"
            @add-member="openToPosition"
            @member="
              openPerson($event.member.user_id, $event.member.assignment_id)
            "
          />
        </div>
      </section>
    </div>

    <!-- A position: its name, place in the chart, access and duties. -->
    <div
      v-if="draft"
      class="work-modal-backdrop fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      @click.self="draft = null"
      @keydown.esc="draft = null"
    >
      <form
        data-work-modal
        role="dialog"
        aria-modal="true"
        class="work-modal w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        data-org-position-form
        @submit.prevent="savePosition"
      >
        <h2 class="text-lg font-black text-slate-950 dark:text-white">
          {{ draft.id ? t.editPosition : t.newPosition }}
        </h2>
        <div class="mt-5 space-y-4">
          <label class="org-field">
            <span>{{ t.name }}</span>
            <input
              ref="name"
              v-model="draft.name"
              type="text"
              maxlength="150"
              required
              class="app-control"
            />
          </label>
          <label class="org-field">
            <span>{{ t.parent }}</span>
            <select v-model="draft.parent_id" class="app-control">
              <option :value="null">{{ t.noParent }}</option>
              <option
                v-for="row in parentChoices"
                :key="row.id"
                :value="row.id"
              >
                {{ indent(row.depth) }}{{ row.name }}
              </option>
            </select>
          </label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="org-field">
              <span>{{ t.access }}</span>
              <select
                v-model.number="draft.role_id"
                required
                class="app-control"
              >
                <option
                  v-for="role in chart.roles"
                  :key="role.id"
                  :value="role.id"
                >
                  {{ roleNames[role.name] || role.value || role.name }}
                </option>
              </select>
            </label>
            <label v-if="draftIsProduction" class="org-field">
              <span>{{ t.workshop }}</span>
              <select
                v-model.number="draft.factory_id"
                required
                class="app-control"
              >
                <option :value="null" disabled>{{ t.chooseWorkshop }}</option>
                <option
                  v-for="factory in chart.factories"
                  :key="factory.id"
                  :value="factory.id"
                >
                  {{ factory.name }}
                </option>
              </select>
            </label>
          </div>
          <label class="org-field">
            <span>{{ t.duties }}</span>
            <textarea
              v-model="draft.description"
              rows="3"
              maxlength="2000"
              class="app-control"
              :placeholder="t.dutiesPlaceholder"
            ></textarea>
          </label>
          <p
            v-if="draft.id && draftAccessChanged && draftHolders"
            class="org-note"
          >
            {{ t.accessNote }}
          </p>
          <p v-if="dialogError" role="alert" class="org-error">
            {{ dialogError }}
          </p>
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="org-secondary"
            :disabled="busy"
            @click="draft = null"
          >
            {{ t.cancel }}
          </button>
          <button
            type="submit"
            class="org-primary"
            :disabled="busy || !draft.name.trim()"
          >
            {{ t.save }}
          </button>
        </div>
      </form>
    </div>

    <!-- An employee: put them in a position, move them, or take them out of one. -->
    <div
      v-if="placing"
      class="work-modal-backdrop fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      @click.self="placing = null"
      @keydown.esc="placing = null"
    >
      <form
        data-work-modal
        role="dialog"
        aria-modal="true"
        class="work-modal w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        data-org-place-form
        @submit.prevent="place"
      >
        <h2 class="text-lg font-black text-slate-950 dark:text-white">
          {{
            placing.fixedPosition
              ? placing.fixedPosition.name
              : person
              ? person.name
              : t.employee
          }}
        </h2>
        <p
          v-if="placing.fixedPosition"
          class="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400"
        >
          {{
            accessText(
              placing.fixedPosition.role,
              placing.fixedPosition.factory,
              roleNames
            )
          }}
        </p>

        <p v-if="person && person.locked" class="org-note mt-5">
          {{ t.locked }}
        </p>
        <div v-else class="mt-5 space-y-4">
          <label v-if="placing.fixedPosition" class="org-field">
            <span>{{ t.employee }}</span>
            <select
              v-model.number="placing.user_id"
              class="app-control"
              @change="pickDefaultReplace"
            >
              <option :value="null" disabled>{{ t.chooseEmployee }}</option>
              <option
                v-for="row in candidates"
                :key="row.user_id"
                :value="row.user_id"
              >
                {{ row.name }}
              </option>
            </select>
          </label>
          <label v-else class="org-field">
            <span>{{ t.position }}</span>
            <select v-model.number="placing.position_id" class="app-control">
              <option :value="null" disabled>{{ t.choosePosition }}</option>
              <option
                v-for="row in targetChoices"
                :key="row.id"
                :value="row.id"
              >
                {{ indent(row.depth) }}{{ row.name }}
              </option>
            </select>
          </label>

          <fieldset
            v-if="person && person.assignments.length"
            class="space-y-2"
          >
            <label
              v-for="row in person.assignments"
              :key="row.assignment_id"
              class="org-choice"
            >
              <input
                v-model="placing.replace"
                type="radio"
                :value="row.assignment_id"
              />
              <span>
                {{ t.instead }} ·
                <strong>{{
                  row.position
                    ? row.position.name
                    : accessText(row.role, row.factory, roleNames)
                }}</strong>
              </span>
            </label>
            <label class="org-choice">
              <input v-model="placing.replace" type="radio" :value="null" />
              <span>{{ t.extra }}</span>
            </label>
          </fieldset>
          <p v-if="targetPosition" class="org-note">
            {{ t.accessNote }}
            <strong>{{
              accessText(targetPosition.role, targetPosition.factory, roleNames)
            }}</strong>
          </p>
          <p v-if="dialogError" role="alert" class="org-error">
            {{ dialogError }}
          </p>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-2">
          <button
            v-if="
              placedAssignment &&
              placedAssignment.position &&
              person &&
              !person.locked
            "
            type="button"
            class="text-xs font-bold text-rose-600 hover:underline disabled:opacity-50 dark:text-rose-300"
            :disabled="busy"
            data-org-remove-member
            @click="removeMember"
          >
            {{ t.removeFrom }}
          </button>
          <span v-else></span>
          <div class="flex gap-2">
            <button
              type="button"
              class="org-secondary"
              :disabled="busy"
              @click="placing = null"
            >
              {{ t.cancel }}
            </button>
            <button
              v-if="!(person && person.locked)"
              type="submit"
              class="org-primary"
              :disabled="busy || !placing.user_id || !targetPosition"
            >
              {{ placing.fixedPosition ? t.place : t.move }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<script>
import OrgChartBranch from '@/components/staff/OrgChartBranch.vue'
import {
  PRODUCTION_ROLES,
  accessText,
  buildTree,
  departmentTones,
  flatPositions,
  initials,
  orgChartCopy,
  parentOptions,
  peopleOf,
} from '@/utils/org-chart'
import { membershipCopy } from '@/utils/membership-copy'
import { apiErrorMessage } from '@/utils/task-workflow'

const ZOOM_KEY = 'metalworks.orgChart.zoom'

export default {
  name: 'OrgChart',
  components: { OrgChartBranch },
  data: () => ({
    chart: { positions: [], unplaced: [], roles: [], factories: [] },
    loading: false,
    loaded: false,
    busy: false,
    error: '',
    dialogError: '',
    draft: null,
    placing: null,
    zoom: 1,
    request: 0,
  }),
  computed: {
    locale() {
      const code = String(this.$i18n?.locale || 'hy').split('-')[0]
      return ['hy', 'ru', 'en'].includes(code) ? code : 'hy'
    },
    t() {
      return orgChartCopy[this.locale] || orgChartCopy.hy
    },
    roleNames() {
      return membershipCopy(this.locale).roles || {}
    },
    scope() {
      return `${this.$store.state.auth?.user?.id || ''}:${
        this.$store.state.workspace?.company?.id || ''
      }`
    },
    tree() {
      return buildTree(this.chart.positions)
    },
    tones() {
      return departmentTones(this.tree)
    },
    unplaced() {
      return this.chart.unplaced || []
    },
    people() {
      return peopleOf(this.chart)
    },
    // The access levels this person may hand out; positions with others are read-only.
    editableRoles() {
      return (this.chart.roles || []).map((role) => Number(role.id))
    },
    parentChoices() {
      return parentOptions(this.chart.positions, this.draft?.id ?? null)
    },
    draftIsProduction() {
      const role = this.chart.roles.find(
        (row) => row.id === this.draft?.role_id
      )
      return PRODUCTION_ROLES.includes(role?.name)
    },
    draftHolders() {
      const position = this.chart.positions.find(
        (row) => row.id === this.draft?.id
      )
      return position?.members?.length || 0
    },
    draftAccessChanged() {
      const position = this.chart.positions.find(
        (row) => row.id === this.draft?.id
      )
      if (!position) return false
      return (
        Number(position.role?.id) !== Number(this.draft.role_id) ||
        Number(position.factory?.id || 0) !==
          Number((this.draftIsProduction && this.draft.factory_id) || 0)
      )
    },
    person() {
      return (
        this.people.find((row) => row.user_id === this.placing?.user_id) || null
      )
    },
    // People who may go into the chosen position: not already there, not locked.
    candidates() {
      const target = this.placing?.fixedPosition?.id
      return this.people.filter(
        (row) =>
          !row.locked &&
          !row.assignments.some((item) => item.position?.id === target)
      )
    },
    placedAssignment() {
      return (
        this.person?.assignments.find(
          (row) => row.assignment_id === this.placing?.from
        ) || null
      )
    },
    targetChoices() {
      const from = this.placedAssignment?.position?.id
      return flatPositions(this.chart.positions).filter(
        (row) =>
          row.id !== from && this.editableRoles.includes(Number(row.role?.id))
      )
    },
    targetPosition() {
      const id = this.placing?.fixedPosition?.id || this.placing?.position_id
      return this.chart.positions.find((row) => row.id === id) || null
    },
  },
  watch: {
    scope() {
      this.chart = { positions: [], unplaced: [], roles: [], factories: [] }
      this.loaded = false
      this.draft = null
      this.placing = null
      this.load()
    },
  },
  created() {
    this.load()
  },
  mounted() {
    try {
      const saved = Number(window.localStorage.getItem(ZOOM_KEY))
      if (saved >= 0.5 && saved <= 1.5) this.zoom = saved
    } catch (_) {}
  },
  methods: {
    accessText,
    initials,
    // Nested positions in a select, indented by an em space per level.
    indent(depth) {
      return '\u2003'.repeat(depth)
    },
    setZoom(value) {
      this.zoom = Math.min(1.5, Math.max(0.5, Math.round(value * 10) / 10))
      try {
        window.localStorage.setItem(ZOOM_KEY, String(this.zoom))
      } catch (_) {}
    },
    async load() {
      const request = ++this.request
      this.loading = true
      this.error = ''
      try {
        const data = await this.$axios.$get('/api/org-chart')
        if (request !== this.request) return
        this.chart = data
        this.loaded = true
      } catch (error) {
        if (request === this.request)
          this.error = apiErrorMessage(error, this.t.loadFailed)
      } finally {
        if (request === this.request) this.loading = false
      }
    },
    // Every change answers with the whole chart, so the page shows what was saved.
    async send(action) {
      if (this.busy) return false
      this.busy = true
      this.dialogError = ''
      try {
        const response = await action()
        this.chart = response.data
        return true
      } catch (error) {
        this.dialogError = apiErrorMessage(error, this.t.loadFailed)
        return false
      } finally {
        this.busy = false
      }
    },
    openPosition(position, parent = null) {
      this.dialogError = ''
      this.draft = position
        ? {
            id: position.id,
            name: position.name,
            parent_id: position.parent_id ?? null,
            role_id: position.role?.id ?? null,
            factory_id: position.factory?.id ?? null,
            description: position.description || '',
          }
        : {
            id: null,
            name: '',
            parent_id: parent?.id ?? null,
            role_id:
              parent?.role?.id &&
              this.editableRoles.includes(Number(parent.role.id))
                ? parent.role.id
                : this.chart.roles[0]?.id ?? null,
            factory_id: parent?.factory?.id ?? null,
            description: '',
          }
      this.$nextTick(() => this.$refs.name?.focus())
    },
    async savePosition() {
      const draft = this.draft
      const body = {
        name: draft.name.trim(),
        parent_id: draft.parent_id,
        role_id: draft.role_id,
        factory_id: this.draftIsProduction ? draft.factory_id : null,
        description: draft.description?.trim() || null,
      }
      const saved = await this.send(() =>
        draft.id
          ? this.$axios.put(`/api/org-chart/positions/${draft.id}`, body)
          : this.$axios.post('/api/org-chart/positions', body)
      )
      if (saved) this.draft = null
    },
    async removePosition(position) {
      if (
        !window.confirm(this.t.confirmRemove.replace('{name}', position.name))
      )
        return
      const removed = await this.send(() =>
        this.$axios.delete(`/api/org-chart/positions/${position.id}`)
      )
      if (!removed && this.dialogError) {
        this.$notify?.({ type: 'error', text: this.dialogError })
        this.dialogError = ''
      }
    },
    async generate() {
      const done = await this.send(() =>
        this.$axios.post('/api/org-chart/generate')
      )
      if (!done && this.dialogError) {
        this.error = this.dialogError
        this.dialogError = ''
      }
    },
    // From a position: choose who goes there.
    openToPosition(position) {
      this.dialogError = ''
      this.placing = {
        fixedPosition: position,
        user_id: null,
        position_id: null,
        replace: null,
        from: null,
      }
    },
    // From an employee: choose where they go.
    openPerson(userId, assignmentId) {
      this.dialogError = ''
      this.placing = {
        fixedPosition: null,
        user_id: userId,
        position_id: null,
        replace: assignmentId,
        from: assignmentId,
      }
    },
    // A newly chosen employee moves out of the place they have outside the chart.
    pickDefaultReplace() {
      const rows = this.person?.assignments || []
      const outside = rows.find((row) => !row.position)
      this.placing.replace = (outside || rows[0])?.assignment_id ?? null
    },
    async place() {
      const target = this.targetPosition
      if (!target || !this.placing.user_id) return
      const placed = await this.send(() =>
        this.$axios.post(`/api/org-chart/positions/${target.id}/members`, {
          user_id: this.placing.user_id,
          replace_assignment_id: this.placing.replace || null,
        })
      )
      if (placed) this.placing = null
    },
    async removeMember() {
      const position = this.placedAssignment?.position
      if (!position) return
      const removed = await this.send(() =>
        this.$axios.delete(
          `/api/org-chart/positions/${position.id}/members/${this.placing.user_id}`
        )
      )
      if (removed) this.placing = null
    },
  },
}
</script>

<style scoped>
.org-canvas {
  @apply overflow-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/60;
}
.org-forest {
  @apply flex w-max min-w-full items-start gap-4;
}
.org-zoom {
  @apply flex h-8 w-8 items-center justify-center rounded-lg text-base font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800;
}
.org-field {
  @apply block text-xs font-bold text-slate-600 dark:text-slate-300;
}
.org-field > span {
  @apply mb-1.5 block;
}
.org-choice {
  @apply flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200;
}
.org-choice input {
  @apply mt-1;
}
.org-note {
  @apply rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300;
}
.org-error {
  @apply rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300;
}
.org-primary {
  @apply rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200;
}
.org-secondary {
  @apply rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800;
}
</style>
