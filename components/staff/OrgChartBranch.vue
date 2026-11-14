<template>
  <div
    class="org-branch"
    :class="{ 'org-branch--group': node.children.length }"
    :data-tone="tone"
  >
    <article class="org-card" :data-org-position="node.id">
      <div class="org-card__head">
        <h3 class="org-card__name">{{ node.name }}</h3>
        <div v-if="editable" class="org-card__tools">
          <button
            type="button"
            class="org-tool"
            :title="t.addChild"
            :aria-label="`${t.addChild} · ${node.name}`"
            data-org-add-child
            @click="$emit('add-child', node)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-width="2"
                d="M12 5v14M5 12h14"
              />
            </svg>
          </button>
          <button
            type="button"
            class="org-tool"
            :title="t.edit"
            :aria-label="`${t.edit} · ${node.name}`"
            data-org-edit
            @click="$emit('edit', node)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
                d="m4 20 4.2-1 10-10a2 2 0 0 0-2.8-2.8l-10 10L4 20Z"
              />
            </svg>
          </button>
          <button
            v-if="!node.members.length"
            type="button"
            class="org-tool org-tool--danger"
            :title="t.remove"
            :aria-label="`${t.remove} · ${node.name}`"
            data-org-remove
            @click="$emit('remove', node)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
                d="M5 7h14M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
              />
            </svg>
          </button>
        </div>
      </div>
      <p class="org-card__access">{{ access }}</p>

      <ul class="org-card__people">
        <li v-for="member in node.members" :key="member.assignment_id">
          <button
            type="button"
            class="org-person"
            :data-org-member="member.user_id"
            @click="$emit('member', { position: node, member })"
          >
            <span class="org-avatar" aria-hidden="true">{{
              initials(member.name)
            }}</span>
            <span class="min-w-0 truncate">{{ member.name }}</span>
            <svg
              v-if="member.locked"
              class="ml-auto h-3.5 w-3.5 shrink-0 opacity-60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              :aria-label="t.locked"
            >
              <rect
                x="5"
                y="11"
                width="14"
                height="9"
                rx="2"
                stroke-width="1.8"
              />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke-width="1.8" />
            </svg>
          </button>
        </li>
        <li v-if="!node.members.length">
          <button
            type="button"
            class="org-vacant"
            :disabled="!editable"
            data-org-vacant
            @click="$emit('add-member', node)"
          >
            {{ t.vacant }}
          </button>
        </li>
      </ul>

      <p
        v-if="node.description"
        class="org-card__duties"
        :title="node.description"
      >
        {{ node.description }}
      </p>

      <button
        v-if="editable && node.members.length"
        type="button"
        class="org-card__add"
        data-org-add-member
        @click="$emit('add-member', node)"
      >
        + {{ t.addEmployee }}
      </button>
    </article>

    <!-- Units with their own subordinates sit side by side; plain positions
         line up under their head. -->
    <div
      v-if="node.children.length"
      class="org-children"
      :class="nested ? 'org-children--row' : 'org-children--stack'"
    >
      <OrgChartBranch
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :tones="tones"
        :role-names="roleNames"
        :editable-roles="editableRoles"
        :t="t"
        v-on="$listeners"
      />
    </div>
  </div>
</template>

<script>
import { accessText, initials } from '@/utils/org-chart'

export default {
  name: 'OrgChartBranch',
  props: {
    node: { type: Object, required: true },
    tones: { type: Map, default: () => new Map() },
    roleNames: { type: Object, default: () => ({}) },
    // Access levels this person may hand out; other positions are read-only.
    editableRoles: { type: Array, default: () => [] },
    t: { type: Object, required: true },
  },
  computed: {
    tone() {
      const tone = this.tones.get(this.node.id)
      return tone === null || tone === undefined ? 'top' : String(tone)
    },
    // Departments under the top of the chart stand side by side, and so do
    // units that have their own subordinates; plain positions inside a
    // department line up under its head.
    nested() {
      return (
        this.tone === 'top' ||
        this.node.children.some((child) => child.children.length)
      )
    },
    access() {
      return accessText(
        this.node.role,
        this.node.factory,
        this.roleNames,
        this.t.accessNone
      )
    },
    // A position that leaves access alone is anyone's to edit; the others
    // only for those who may hand out their access level.
    editable() {
      return (
        !this.node.role ||
        this.editableRoles.includes(Number(this.node.role.id))
      )
    },
  },
  methods: { initials },
}
</script>

<style scoped>
.org-branch {
  @apply flex flex-col items-start;
}
.org-branch--group {
  @apply rounded-3xl border p-3;
}
.org-branch--group > .org-card {
  @apply w-full;
}
.org-children {
  @apply mt-3 flex;
}
.org-children--row {
  @apply items-start gap-3;
}
.org-children--stack {
  @apply w-full flex-col gap-2;
}
.org-children--stack > .org-branch > .org-card {
  @apply w-full;
}
.org-card {
  @apply relative w-60 min-w-[15rem] rounded-2xl border border-slate-200 border-t-4 bg-white p-3 text-left shadow-sm dark:border-slate-700 dark:bg-slate-900;
}
.org-card__head {
  @apply flex items-start justify-between gap-2;
}
.org-card__name {
  @apply min-w-0 break-words text-sm font-black leading-5 text-slate-950 dark:text-white;
}
.org-card__tools {
  @apply -mr-1 -mt-1 flex shrink-0 items-center opacity-60 transition;
}
.org-card:hover .org-card__tools,
.org-card:focus-within .org-card__tools {
  @apply opacity-100;
}
.org-tool {
  @apply flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white;
}
.org-tool svg {
  @apply h-4 w-4;
}
.org-tool--danger {
  @apply hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300;
}
.org-card__access {
  @apply mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400;
}
.org-card__people {
  @apply mt-2 space-y-1;
}
.org-person {
  @apply flex w-full items-center gap-2 rounded-xl bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800;
}
.org-avatar {
  @apply flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white dark:bg-white dark:text-slate-900;
}
.org-vacant {
  @apply w-full rounded-xl border border-dashed border-slate-300 px-2 py-1.5 text-left text-xs font-semibold text-slate-400 transition enabled:hover:border-slate-500 enabled:hover:text-slate-700 dark:border-slate-600 dark:enabled:hover:text-slate-200;
}
.org-card__duties {
  @apply mt-2 line-clamp-3 whitespace-pre-line text-[11px] leading-4 text-slate-500 dark:text-slate-400;
}
.org-card__add {
  @apply mt-2 text-[11px] font-bold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white;
}

/* Each department keeps one colour; the top of the chart stays neutral. */
[data-tone='top'].org-branch--group {
  @apply border-slate-200 bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900/40;
}
[data-tone='top'] > .org-card {
  @apply border-t-slate-500;
}
[data-tone='0'].org-branch--group {
  @apply border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20;
}
[data-tone='0'] > .org-card {
  @apply border-t-amber-400;
}
[data-tone='1'].org-branch--group {
  @apply border-rose-200 bg-rose-50/70 dark:border-rose-900/50 dark:bg-rose-950/20;
}
[data-tone='1'] > .org-card {
  @apply border-t-rose-400;
}
[data-tone='2'].org-branch--group {
  @apply border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20;
}
[data-tone='2'] > .org-card {
  @apply border-t-emerald-400;
}
[data-tone='3'].org-branch--group {
  @apply border-sky-200 bg-sky-50/70 dark:border-sky-900/50 dark:bg-sky-950/20;
}
[data-tone='3'] > .org-card {
  @apply border-t-sky-400;
}
[data-tone='4'].org-branch--group {
  @apply border-violet-200 bg-violet-50/70 dark:border-violet-900/50 dark:bg-violet-950/20;
}
[data-tone='4'] > .org-card {
  @apply border-t-violet-400;
}
[data-tone='5'].org-branch--group {
  @apply border-orange-200 bg-orange-50/70 dark:border-orange-900/50 dark:bg-orange-950/20;
}
[data-tone='5'] > .org-card {
  @apply border-t-orange-400;
}
/* Units inside a department lighten so the nesting stays visible. */
.org-children .org-children .org-branch--group {
  @apply bg-white/60 dark:bg-slate-950/30;
}
</style>
