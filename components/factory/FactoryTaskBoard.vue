<template>
  <section class="mx-auto space-y-5" data-factory-board>
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div class="min-w-0">
        <h1
          class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl"
        >
          {{ copy.title }}
        </h1>
        <p
          class="mt-1 text-sm text-slate-500 dark:text-slate-400"
          data-board-retention
        >
          {{ subtitle }}
        </p>
      </div>
      <slot name="actions" />
    </header>

    <nav
      class="chip-row -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5"
      :aria-label="copy.status"
    >
      <button
        type="button"
        class="stage-chip"
        data-tone="all"
        :aria-pressed="String(!selected.length)"
        @click="$emit('update:selected', [])"
      >
        <span class="whitespace-nowrap">{{ copy.all }}</span>
        <span class="stage-chip__count">{{ total }}</span>
      </button>
      <button
        v-for="column in chips"
        :key="column.id"
        type="button"
        class="stage-chip"
        :data-tone="tone(column)"
        :data-stage="column.value"
        :aria-pressed="String(selected.includes(column.value))"
        @click="toggleStage(column.value)"
      >
        <span class="stage-chip__dot" aria-hidden="true"></span>
        <span class="whitespace-nowrap">{{ label(column) }}</span>
        <span class="stage-chip__count">{{ column.orders.length }}</span>
      </button>
    </nav>

    <section
      class="app-surface flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center sm:p-5"
    >
      <label class="min-w-0 flex-1">
        <span class="sr-only">{{ copy.search }}</span>
        <span class="relative block">
          <svg
            class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke-width="1.8" />
            <path
              stroke-linecap="round"
              stroke-width="1.8"
              d="m20 20-3.5-3.5"
            />
          </svg>
          <input
            :value="search"
            type="search"
            maxlength="120"
            class="app-control !pl-11"
            :placeholder="copy.search"
            data-board-search
            @input="$emit('update:search', $event.target.value)"
          />
        </span>
      </label>
      <button
        v-if="hasFilters"
        type="button"
        class="shrink-0 text-sm font-bold text-slate-600 underline-offset-4 transition hover:text-slate-950 hover:underline dark:text-slate-300 dark:hover:text-white"
        data-clear-board-filters
        @click="clearFilters"
      >
        {{ copy.clear }}
      </button>
    </section>

    <div
      v-if="!loaded"
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      role="status"
      data-board-loading
    >
      <span class="sr-only">{{ copy.loading }}</span>
      <div
        v-for="n in 4"
        :key="n"
        class="animate-pulse space-y-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div class="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div class="h-32 rounded-2xl bg-white dark:bg-slate-800"></div>
        <div class="h-32 rounded-2xl bg-white/70 dark:bg-slate-800/70"></div>
      </div>
    </div>

    <div
      v-else-if="loadFailed && !hasTasks"
      role="alert"
      class="app-surface flex flex-col items-center gap-3 rounded-3xl px-6 py-12 text-center"
    >
      <p class="text-sm font-semibold text-rose-600 dark:text-rose-300">
        {{ copy.loadFailed }}
      </p>
      <button
        type="button"
        class="app-button-secondary !py-2"
        @click="$emit('retry')"
      >
        {{ copy.retry }}
      </button>
    </div>

    <div
      v-else-if="!hasResults"
      class="app-surface flex flex-col items-center gap-3 rounded-3xl px-6 py-14 text-center"
      data-board-empty
    >
      <span
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800"
      >
        <svg
          class="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.7"
            d="M7 4h10a2 2 0 012 2v14H5V6a2 2 0 012-2Zm2 4h6M9 12h6M9 16h4"
          />
        </svg>
      </span>
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {{ hasTasks ? copy.noResults : copy.empty }}
      </p>
      <p
        v-if="!hasTasks"
        class="max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400"
      >
        {{ copy.emptyHelp }}
      </p>
      <button
        v-if="hasFilters"
        type="button"
        class="app-button-secondary !py-2"
        @click="clearFilters"
      >
        {{ copy.clear }}
      </button>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="column in columns"
        :key="column.id"
        :data-board-column="column.value"
        :data-tone="tone(column)"
        class="work-board-column board-column flex h-[calc(100vh-300px)] min-h-[420px] flex-col rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60"
        @dragover.prevent
        @drop.prevent="$emit('drop', column)"
      >
        <div class="mb-3 flex shrink-0 items-center justify-between gap-2 px-1">
          <h2
            class="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100"
          >
            <span class="board-column__dot" aria-hidden="true"></span>
            <span class="truncate">{{ label(column) }}</span>
          </h2>
          <span
            class="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300"
          >
            {{ column.orders.length }}
          </span>
        </div>

        <div class="flex-1 space-y-3 overflow-y-auto pr-1">
          <transition-group
            name="fade-list"
            tag="div"
            class="flex flex-col gap-3"
          >
            <OrderCard
              v-for="order in column.orders"
              :key="order.id"
              compact
              :order="order"
              :factory-id="factoryId"
              :current-user-id="currentUserId"
              :status-options="statusOptions"
              :saving="saving"
              @drag-start="$emit('drag-start', order, column)"
              @drag-end="$emit('drag-end')"
              @view-details="$emit('view-details', $event)"
              @edit="$emit('edit', $event)"
            />
          </transition-group>

          <div
            v-if="!column.orders.length"
            class="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/60 p-3 text-center text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500"
          >
            {{ copy.dropHere }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="pagination.total > perPage" class="flex justify-center">
      <Pagination :meta="pagination" @change="$emit('page', $event)" />
    </div>
  </section>
</template>

<script>
import OrderCard from '@/components/factory/OrderCard.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { boardCopy } from '@/utils/task-board'
import {
  columnLabel,
  columnTone,
  factoryBoardCopy,
} from '@/utils/factory-board-copy'

// The board of a workshop's tasks: title, stage filters, search, columns and
// states. Pages keep the data and actions; this only shows them.
export default {
  name: 'FactoryTaskBoard',
  components: { OrderCard, Pagination },
  props: {
    subtitle: { type: String, default: '' },
    // Columns over the search matches, used for the stage button counts.
    chips: { type: Array, default: () => [] },
    total: { type: Number, default: 0 },
    selected: { type: Array, default: () => [] },
    search: { type: String, default: '' },
    columns: { type: Array, default: () => [] },
    loaded: { type: Boolean, default: false },
    loadFailed: { type: Boolean, default: false },
    hasTasks: { type: Boolean, default: false },
    hasResults: { type: Boolean, default: false },
    factoryId: { type: [Number, String], default: null },
    currentUserId: { type: [Number, String], default: null },
    statusOptions: { type: Array, default: () => [] },
    saving: { type: Boolean, default: false },
    pagination: { type: Object, default: () => ({ total: 0 }) },
    perPage: { type: Number, default: 12 },
  },
  computed: {
    copy() {
      return factoryBoardCopy[this.$i18n?.locale] || factoryBoardCopy.hy
    },
    boardText() {
      return boardCopy[this.$i18n?.locale] || boardCopy.hy
    },
    hasFilters() {
      return Boolean(String(this.search || '').trim() || this.selected.length)
    },
  },
  methods: {
    tone(column) {
      return columnTone(column)
    },
    label(column) {
      return columnLabel(column, this.boardText)
    },
    toggleStage(value) {
      this.$emit(
        'update:selected',
        this.selected.includes(value)
          ? this.selected.filter((item) => item !== value)
          : [...this.selected, value]
      )
    },
    clearFilters() {
      this.$emit('update:search', '')
      this.$emit('update:selected', [])
    },
  },
}
</script>

<style scoped>
.chip-row {
  scrollbar-width: none;
}
.chip-row::-webkit-scrollbar {
  display: none;
}
/* Stage colours match the engineer task list: grey, blue, amber, red. */
[data-tone='created'] {
  --tone: #94a3b8;
}
[data-tone='accepted'] {
  --tone: #3b82f6;
}
[data-tone='in_progress'] {
  --tone: #f59e0b;
}
[data-tone='rejected'] {
  --tone: #f43f5e;
}
.stage-chip {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 8px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
  transition: background 150ms ease, border-color 150ms ease;
}
.stage-chip:hover {
  border-color: #cbd5e1;
}
.stage-chip:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}
.stage-chip__dot,
.board-column__dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--tone, #94a3b8);
}
.stage-chip__count {
  min-width: 22px;
  padding: 1px 7px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  text-align: center;
}
.stage-chip[aria-pressed='true'] {
  border-color: #020617;
  background: #020617;
  color: #fff;
}
.stage-chip[aria-pressed='true'] .stage-chip__count {
  background: rgb(255 255 255 / 18%);
  color: #fff;
}
.board-column {
  border-top: 3px solid var(--tone, #94a3b8);
}
.dark .stage-chip {
  border-color: #334155;
  background: #0f172a;
  color: #e2e8f0;
}
.dark .stage-chip__count {
  background: #1e293b;
  color: #cbd5e1;
}
.dark .stage-chip[aria-pressed='true'] {
  border-color: #f8fafc;
  background: #f8fafc;
  color: #020617;
}
.dark .stage-chip[aria-pressed='true'] .stage-chip__count {
  background: #e2e8f0;
  color: #020617;
}
.fade-list-enter-active,
.fade-list-leave-active {
  transition: all 0.2s ease;
}
.fade-list-enter,
.fade-list-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
