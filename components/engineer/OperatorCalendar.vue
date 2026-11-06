<template>
  <section
    class="space-y-5"
    :class="{ 'app-surface rounded-3xl p-4 sm:p-6': !picker }"
    data-operator-calendar
  >
    <header v-if="!picker" class="max-w-4xl">
      <h2
        class="text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl"
      >
        {{ t.title }}
      </h2>
      <p class="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {{ t.help }}
      </p>
    </header>

    <div
      class="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/40"
    >
      <div class="min-w-0">
        <span class="calendar-label">{{ c[period] }}</span>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="calendar-icon-button"
            :aria-label="c.previous"
            :title="c.previous"
            :disabled="loading"
            @click="shiftDate(-1)"
          >
            ‹
          </button>
          <input
            v-model="date"
            type="date"
            class="app-control !w-auto !py-2.5"
            :aria-label="c[period]"
            @change="refresh"
          />
          <button
            type="button"
            class="calendar-icon-button"
            :aria-label="c.next"
            :title="c.next"
            :disabled="loading"
            @click="shiftDate(1)"
          >
            ›
          </button>
          <button
            type="button"
            class="app-button-secondary !rounded-xl !px-3 !py-2.5"
            :disabled="loading || days.includes(today)"
            @click="goToday"
          >
            {{ c.today }}
          </button>
        </div>
      </div>
      <div>
        <span :id="periodLabelId" class="calendar-label">{{ c.period }}</span>
        <div
          class="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
          role="group"
          :aria-labelledby="periodLabelId"
        >
          <button
            v-for="key in ['day', 'week', 'month']"
            :key="key"
            type="button"
            class="calendar-segment"
            :aria-pressed="String(period === key)"
            @click="setPeriod(key)"
          >
            {{ c[key] }}
          </button>
        </div>
      </div>
      <label class="min-w-[10rem] flex-1 sm:flex-none">
        <span class="calendar-label">{{ c.operator }}</span>
        <select v-model="operatorFilter" class="app-control !py-2.5">
          <option value="">{{ c.all }}</option>
          <option v-for="op in roster" :key="op.id" :value="String(op.id)">
            {{ op.name }}
          </option>
        </select>
      </label>
      <label class="min-w-[12rem] flex-1 sm:flex-none">
        <span class="calendar-label">{{ c.workshop }}</span>
        <select v-model="factoryId" class="app-control !py-2.5">
          <option value="">{{ t.all }}</option>
          <option v-for="f in data.factories" :key="f.id" :value="String(f.id)">
            {{ f.name }}
          </option>
        </select>
      </label>
      <button
        type="button"
        :disabled="loading || busy"
        class="app-button-primary gap-2 !rounded-xl !py-2.5"
        @click="refresh"
      >
        <svg
          class="h-4 w-4"
          :class="{ 'animate-spin': loading }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4m-4 5a8 8 0 0 0 14.9 3M20 20v-4h-4"
          />
        </svg>
        {{ t.refresh }}
      </button>
    </div>

    <p v-if="error" role="alert" class="calendar-alert">
      {{ error }}
    </p>
    <p v-if="actionError" role="alert" class="calendar-alert">
      {{ actionError }}
    </p>
    <p
      v-if="loading"
      role="status"
      class="text-xs font-semibold text-slate-500 dark:text-slate-400"
    >
      {{ t.loading }}
    </p>
    <template v-if="!error">
      <div v-if="period === 'month'" class="space-y-2">
        <div
          class="hidden grid-cols-7 gap-2 px-1 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400 sm:grid"
          aria-hidden="true"
        >
          <span v-for="name in weekdayNames" :key="name">{{ name }}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-7">
          <span
            v-for="n in monthLead"
            :key="'lead' + n"
            class="hidden sm:block"
            aria-hidden="true"
          ></span>
          <button
            v-for="day in days"
            :key="day"
            type="button"
            class="calendar-month-day"
            :data-level="monthLevel(day)"
            :data-today="String(day === today)"
            :aria-current="day === today ? 'date' : null"
            :aria-label="monthDayLabel(day)"
            @click="openDay(day)"
          >
            <strong class="block text-sm sm:hidden">{{ labelDay(day) }}</strong>
            <strong class="hidden text-base sm:block">{{
              Number(day.slice(8, 10))
            }}</strong>
            <span class="mt-1 block text-[11px] font-semibold">{{
              monthText(day)
            }}</span>
            <span
              v-if="dayTotals[day].due"
              class="calendar-count mt-1 inline-block"
              data-tone="amber"
              :title="c.due"
              >● {{ dayTotals[day].due }}</span
            >
          </button>
        </div>
      </div>
      <div
        v-else
        class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800"
        tabindex="0"
        :aria-label="t.title"
      >
        <div :style="{ minWidth: timelineWidth }">
          <div class="calendar-row calendar-row--head">
            <div class="calendar-person calendar-person--head">
              {{ t.operator }}
            </div>
            <div class="calendar-days" :style="dayColumns">
              <div
                v-for="day in days"
                :key="day"
                class="calendar-day-head"
                :data-today="String(day === today)"
                :aria-current="day === today ? 'date' : null"
              >
                <span class="block font-bold"
                  >{{ labelDay(day)
                  }}<span v-if="day === today" class="calendar-today-badge">{{
                    c.today
                  }}</span></span
                >
                <span
                  class="mt-0.5 block font-semibold"
                  :class="
                    dayTotals[day].free
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-400'
                  "
                  >{{ dayTotals[day].free }} {{ t.freeShort }}</span
                >
              </div>
            </div>
          </div>
          <p
            v-if="!operators.length"
            class="p-6 text-center text-sm text-slate-500 dark:text-slate-400"
          >
            {{ loading ? t.loading : t.noOperators }}
          </p>
          <div
            v-for="row in timelineRows"
            :key="row.operator.id"
            class="calendar-row"
            data-operator-row
          >
            <div class="calendar-person">
              <strong
                class="block truncate text-sm text-slate-900 dark:text-white"
                >{{ row.operator.name }}</strong
              >
              <span
                class="mt-1 block font-semibold"
                :class="
                  !row.jobs.length
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : row.busyUntil
                    ? 'text-slate-700 dark:text-slate-200'
                    : 'text-rose-600 dark:text-rose-300'
                "
                >{{ summary(row) }}</span
              >
              <span class="mt-1 block text-slate-500 dark:text-slate-400"
                >{{ t.openJobs }} · {{ row.jobs.length }}</span
              >
              <span
                v-if="row.upcomingDays"
                class="mt-0.5 block text-slate-500 dark:text-slate-400"
                >{{ t.freeDays }} · {{ row.freeDays }}/{{
                  row.upcomingDays
                }}</span
              >
              <span
                v-if="row.late"
                class="mt-0.5 block font-semibold text-rose-600 dark:text-rose-300"
                >{{ t.late }} · {{ row.late }}</span
              >
              <span v-if="row.undated" class="mt-0.5 block text-slate-500"
                >{{ t.undated }} · {{ row.undated }}</span
              >
              <span v-if="row.minutes" class="mt-0.5 block text-slate-500"
                >{{ t.estimate }} · {{ hoursText(row.minutes) }}</span
              >
            </div>
            <div
              class="calendar-days calendar-lanes"
              :style="{ ...dayColumns, '--days': days.length }"
            >
              <span
                v-if="todayIndex >= 0"
                class="calendar-today-column"
                :style="todayColumnStyle"
                aria-hidden="true"
              ></span>
              <component
                :is="slotOpen(row, day) ? 'button' : 'span'"
                v-for="(day, index) in days"
                :key="'load-' + day"
                :type="slotOpen(row, day) ? 'button' : null"
                class="calendar-load"
                :data-level="loadLevelOf(row.counts[day])"
                :data-slot="String(slotOpen(row, day))"
                :title="slotOpen(row, day) ? t.pickHint : null"
                :style="{ gridColumn: index + 1, gridRow: 1 }"
                @click="openSlot(row, day)"
                >{{ loadText(row.counts[day])
                }}<span v-if="slotOpen(row, day)" aria-hidden="true">
                  +</span
                ></component
              >
              <component
                :is="bar.job.can_edit ? 'button' : 'div'"
                v-for="bar in row.lanes"
                :key="'bar-' + bar.job.id + (bar.job.helper ? '-helper' : '')"
                :type="bar.job.can_edit ? 'button' : null"
                class="calendar-bar"
                :data-state="barState(bar.job)"
                :data-cut-start="String(bar.continuesBefore)"
                :data-cut-end="String(bar.continuesAfter)"
                :style="{
                  gridColumn: bar.from + 1 + ' / ' + (bar.to + 2),
                  gridRow: bar.lane + 2,
                }"
                :title="jobTooltip(bar.job)"
                @click="openBar(bar)"
              >
                <span class="block truncate font-bold">{{
                  jobTitle(bar.job)
                }}</span>
                <span class="block truncate opacity-80"
                  >{{ bar.job.workshop
                  }}<template v-if="bar.job.helper"> · {{ c.helper }}</template
                  ><template v-if="bar.job.blocked">
                    · {{ t.waiting }}</template
                  ></span
                >
                <span class="block truncate font-semibold">{{
                  barDue(bar.job)
                }}</span>
              </component>
              <div
                v-for="cell in row.reservations"
                :key="'reserved-' + cell.day"
                class="space-y-1 px-1"
                :style="{
                  gridColumn: cell.index + 1,
                  gridRow: row.laneCount + 2,
                }"
              >
                <div
                  v-for="reservation in cell.items"
                  :key="reservation.id"
                  class="calendar-item"
                  data-tone="blue"
                >
                  <strong class="block"
                    >{{ time(reservation.starts_at) }}–{{
                      time(reservation.ends_at)
                    }}</strong
                  >
                  <span class="block break-words">{{
                    bookingTitle(reservation)
                  }}</span>
                  <span
                    v-if="reservation.is_helper"
                    class="block font-semibold"
                    >{{ c.helper }}</span
                  >
                  <span
                    v-if="reservation.assignment_changed"
                    class="block font-semibold text-rose-600 dark:text-rose-300"
                    >{{ t.changed }}</span
                  >
                  <button
                    v-if="reservation.can_edit"
                    type="button"
                    :disabled="busy"
                    class="calendar-item__action !text-rose-600 dark:!text-rose-300"
                    @click="remove('bookings', reservation.id)"
                  >
                    {{ t.remove }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="period !== 'month'"
        class="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
      >
        <span>{{ t.legend }}:</span>
        <span class="calendar-load" data-level="free">{{ t.freeDay }}</span>
        <span class="calendar-load" data-level="light">{{ loadText(1) }}</span>
        <span class="calendar-load" data-level="busy">{{ loadText(2) }}</span>
        <span class="calendar-load" data-level="heavy">{{
          loadText(3).replace('3', '3+')
        }}</span>
        <span class="calendar-key" data-state="late">{{ t.late }}</span>
        <span class="calendar-key" data-state="waiting">{{ t.waiting }}</span>
        <span class="calendar-key" data-state="helper">{{ c.helper }}</span>
        <span v-if="canPlace || canCreate || picker" class="basis-full">{{
          t.pickHint
        }}</span>
      </div>

      <p
        v-if="placedText"
        role="status"
        class="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
      >
        {{ placedText }}
      </p>

      <div
        v-if="slot"
        class="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-sm sm:items-center"
        data-free-slot
        @click.self="closeSlot"
      >
        <section
          ref="slotDialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="slotTitleId"
          tabindex="-1"
          class="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl outline-none dark:bg-slate-900 sm:p-6"
          @keydown.esc="closeSlot"
        >
          <p class="calendar-label">{{ t.slotTitle }}</p>
          <h3
            :id="slotTitleId"
            class="text-lg font-black text-slate-950 dark:text-white"
          >
            {{ slot.operator.name }}
          </h3>
          <p
            class="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
          >
            {{ formatDay(slot.start) }} – {{ formatDay(slot.end) }}
          </p>

          <section
            v-if="canPlace"
            class="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">
              {{ t.placeExisting }}
            </h4>
            <p
              class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400"
            >
              {{ t.placeHelp }}
            </p>
            <p
              v-if="!slotCandidates.length"
              class="mt-3 text-sm text-slate-500 dark:text-slate-400"
            >
              {{ t.noCandidates }}
            </p>
            <form v-else class="mt-3 space-y-3" @submit.prevent="placeStage">
              <label class="block">
                <span class="calendar-label">{{ t.chooseWork }}</span>
                <select
                  v-model="slot.stageId"
                  required
                  class="app-control !py-2.5"
                  @change="syncSlotDeadline"
                >
                  <option disabled value="">{{ t.chooseWork }}</option>
                  <option
                    v-for="task in slotCandidates"
                    :key="task.id"
                    :value="task.id"
                  >
                    {{ jobTitle(task) }} · {{ task.workshop }}
                  </option>
                </select>
              </label>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="block">
                  <span class="calendar-label">{{ t.start }}</span>
                  <input
                    v-model="slot.startsOn"
                    required
                    type="date"
                    class="app-control !py-2.5"
                    :min="today"
                    :max="slot.deadline || null"
                  />
                </label>
                <label class="block">
                  <span class="calendar-label">{{ t.stageDue }}</span>
                  <input
                    v-model="slot.deadline"
                    required
                    type="date"
                    class="app-control !py-2.5"
                    :min="slot.startsOn || today"
                    :max="slotStageLimit || null"
                  />
                </label>
              </div>
              <p
                v-if="slotError"
                role="alert"
                class="text-sm font-semibold text-rose-600 dark:text-rose-300"
              >
                {{ slotError }}
              </p>
              <button
                type="submit"
                class="app-button-primary w-full !rounded-xl !py-2.5"
                :disabled="placing || !slot.stageId || !slot.deadline"
              >
                {{ t.place }}
              </button>
            </form>
          </section>

          <section
            v-if="canCreate"
            class="mt-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">
              {{ t.createNew }}
            </h4>
            <p
              class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400"
            >
              {{ t.createHelp }}
            </p>
            <button
              type="button"
              class="app-button-secondary mt-3 w-full !rounded-xl !py-2.5"
              @click="createFromSlot"
            >
              {{ t.createNew }}
            </button>
          </section>

          <button
            type="button"
            class="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="closeSlot"
          >
            {{ t.close }}
          </button>
        </section>
      </div>

      <details v-if="!picker" ref="planner" class="calendar-panel">
        <summary class="calendar-panel__summary">{{ t.plan }}</summary>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {{ c.hours }}
        </p>
        <form class="mt-4 space-y-4" @submit.prevent="book">
          <label class="block max-w-2xl">
            <span class="calendar-label">{{ c.existing }}</span>
            <select
              v-model="booking.factory_order_id"
              required
              class="app-control !py-2.5"
              @change="selectTask"
            >
              <option disabled value="">
                {{ c.choose }} ({{ editableTasks.length }})
              </option>
              <option
                v-for="task in editableTasks"
                :key="task.id"
                :value="task.id"
              >
                {{ jobTitle(task) }} · {{ task.workshop }}
              </option>
            </select>
          </label>
          <TaskTeamEditor
            v-if="selectedStage"
            :key="selectedStage.id"
            class="w-full"
            :step="selectedStage"
            :workers="data.workers || []"
            :disabled="busy || loading"
            @saved="teamSaved"
            @dirty="teamDirty = $event"
          />
          <p
            v-if="selectedStage"
            class="text-sm text-slate-600 dark:text-slate-300"
          >
            {{ c.primary }}:
            <strong>{{ selectedStage.operator_name || t.unassigned }}</strong>
          </p>
          <div class="flex flex-wrap items-end gap-3">
            <label>
              <span class="calendar-label">{{ t.day }}</span>
              <input
                v-model="booking.day"
                required
                type="date"
                class="app-control !py-2.5"
                :min="today"
                @change="syncBookingDay"
              />
            </label>
            <label>
              <span class="calendar-label">{{ t.start }}</span>
              <input
                v-model="booking.start"
                required
                type="time"
                class="app-control !py-2.5"
              />
            </label>
            <label>
              <span class="calendar-label">{{ t.end }}</span>
              <input
                v-model="booking.end"
                required
                type="time"
                class="app-control !py-2.5"
                :min="booking.start || null"
              />
            </label>
            <button
              :disabled="
                busy ||
                loading ||
                teamDirty ||
                !selectedStage ||
                !booking.operator_id
              "
              type="submit"
              class="app-button-primary !rounded-xl !py-2.5"
            >
              {{ t.save }}
            </button>
          </div>
        </form>
        <p
          v-if="bookingSaved"
          role="status"
          class="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          {{ t.confirmed }} · {{ bookingSaved }}
        </p>
        <p
          v-if="!editableTasks.length"
          class="mt-3 text-sm text-slate-500 dark:text-slate-400"
        >
          {{ c.none }} {{ c.readOnly }}
        </p>
      </details>
    </template>
  </section>
</template>
<script>
import TaskTeamEditor from '@/components/order/TaskTeamEditor.vue'
import { planningCopy } from '@/utils/planning-copy'
import {
  calendarCopy,
  calendarDays,
  freeSegment,
  jobCount,
  jobLanes,
  jobWindow,
  loadLevel,
} from '@/utils/operator-calendar'
import {
  calendarDayLabel,
  formatWallDate,
  formatWallDateTime,
  isDateOnly,
} from '@/utils/wall-time'

// Moves a "YYYY-MM-DD" day by whole days or months without touching time zones.
function moveDay(day, { days = 0, months = 0 }) {
  const date = new Date(`${day}T12:00:00Z`)
  if (Number.isNaN(date.getTime())) return day
  if (months) {
    date.setUTCDate(1)
    date.setUTCMonth(date.getUTCMonth() + months)
  }
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
const yerevanToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Yerevan' }).format(
    new Date()
  )
let calendarIds = 0
const empty = () => ({
  factories: [],
  workers: [],
  shifts: [],
  bookings: [],
  tasks: [],
  can_manage_shifts: false,
})
export default {
  components: { TaskTeamEditor },
  props: {
    // Embedded in a form: a free day is reported with "pick" instead of a dialog.
    picker: Boolean,
    // Where "Create a new task" leads from a free day; empty hides the choice.
    createPath: { type: String, default: '' },
  },
  data: () => ({
    data: empty(),
    date: yerevanToday(),
    factoryId: '',
    period: 'week',
    operatorFilter: '',
    actionError: '',
    bookingSaved: '',
    slot: null,
    slotError: '',
    placing: false,
    placedText: '',
    teamDirty: false,
    loading: false,
    busy: false,
    error: '',
    request: 0,
    timer: null,
    uid: ++calendarIds,
    booking: {
      operator_id: '',
      factory_order_id: '',
      day: '',
      start: '',
      end: '',
    },
  }),
  computed: {
    c() {
      return planningCopy[this.$i18n?.locale] || planningCopy.hy
    },
    t() {
      return calendarCopy[this.$i18n?.locale] || calendarCopy.hy
    },
    locale() {
      return this.$i18n?.locale || 'hy'
    },
    today() {
      return this.data.today || yerevanToday()
    },
    days() {
      return calendarDays(this.date, this.period)
    },
    // Blank cells before the 1st so month days sit under their weekday.
    monthLead() {
      if (this.period !== 'month' || !this.days.length) return 0
      return (new Date(`${this.days[0]}T12:00:00Z`).getUTCDay() + 6) % 7
    },
    weekdayNames() {
      // 2026-11-02 is a Monday; the labels follow the interface language.
      return Array.from(
        { length: 7 },
        (_, index) =>
          this.labelDay(moveDay('2026-11-02', { days: index })).split(',')[0]
      )
    },
    periodLabelId() {
      return `calendar-period-${this.uid}`
    },
    scope() {
      return `${this.$auth?.user?.id}:${this.$store?.state?.workspace?.company?.id}`
    },
    roster() {
      const rows = this.data.factories
        .filter((f) => !this.factoryId || String(f.id) === this.factoryId)
        .flatMap((f) => f.operators)
      const map = new Map(rows.map((op) => [Number(op.id), op]))
      if (!this.factoryId)
        for (const worker of this.data.workers || [])
          map.set(Number(worker.id), worker)
      for (const job of this.data.tasks.filter(
        (j) => !this.factoryId || String(j.factory_id) === this.factoryId
      ))
        for (const helper of job.helpers || [])
          map.set(Number(helper.id), helper)
      for (const job of this.data.tasks) {
        if (
          !job.operator_id ||
          (this.factoryId && String(job.factory_id) !== this.factoryId)
        )
          continue
        if (!map.has(Number(job.operator_id)))
          map.set(Number(job.operator_id), {
            id: job.operator_id,
            name: job.operator_name || '#' + job.operator_id,
          })
      }
      if (!this.factoryId)
        for (const row of this.data.bookings)
          if (!map.has(Number(row.operator_id)))
            map.set(Number(row.operator_id), {
              id: row.operator_id,
              name: `${this.t.unknown} #${row.operator_id}`,
            })
      return [...map.values()]
    },
    operators() {
      return this.roster.filter(
        (op) => !this.operatorFilter || String(op.id) === this.operatorFilter
      )
    },
    // Open jobs per person (primary operator or helper) with the days they span.
    // Work in every workshop counts: the workshop filter only picks operators.
    groupedJobs() {
      const groups = new Map()
      for (const job of this.data.tasks) {
        if (!job.operator_id) continue
        const window = jobWindow(job, this.today)
        const people = [
          { id: job.operator_id, helper: false },
          ...(job.helpers || []).map((h) => ({ id: h.id, helper: true })),
        ]
        for (const person of people) {
          const id = Number(person.id)
          if (!id) continue
          if (!groups.has(id)) groups.set(id, [])
          groups.get(id).push({ ...job, helper: person.helper, window })
        }
      }
      for (const jobs of groups.values())
        jobs.sort(
          (a, b) =>
            (a.due_date || '9999').localeCompare(b.due_date || '9999') ||
            a.id - b.id
        )
      return groups
    },
    // Per operator: job rows for the visible days, jobs per day and a summary.
    timelineRows() {
      const upcoming = this.days.filter((day) => day >= this.today)
      return this.operators.map((operator) => {
        const jobs = this.assignments(operator.id)
        const counts = {}
        for (const day of this.days)
          counts[day] = jobs.filter(
            (job) =>
              job.window && job.window.start <= day && day <= job.window.end
          ).length
        const lanes = jobLanes(jobs, this.days)
        return {
          operator,
          jobs,
          counts,
          lanes,
          laneCount: lanes.reduce((max, bar) => Math.max(max, bar.lane + 1), 0),
          // Overdue work has no known end, so it is reported separately.
          busyUntil: jobs.reduce(
            (last, job) =>
              job.window && !job.window.overdue && job.window.end > last
                ? job.window.end
                : last,
            ''
          ),
          late: jobs.filter((job) => job.window?.overdue).length,
          undated: jobs.filter((job) => !job.window).length,
          minutes: jobs
            .filter((job) => !job.helper)
            .reduce(
              (sum, job) => sum + (Number(job.estimated_minutes) || 0),
              0
            ),
          upcomingDays: upcoming.length,
          freeDays: upcoming.filter((day) => !counts[day]).length,
          reservations: this.days
            .map((day, index) => ({
              day,
              index,
              items: this.bookingsFor(operator.id, day),
            }))
            .filter((cell) => cell.items.length),
        }
      })
    },
    dayTotals() {
      const totals = {}
      for (const day of this.days) {
        const due = new Set()
        let free = 0
        for (const row of this.timelineRows) {
          if (!row.counts[day]) free++
          for (const job of row.jobs) if (job.due_date === day) due.add(job.id)
        }
        totals[day] = {
          free,
          busy: this.timelineRows.length - free,
          due: due.size,
        }
      }
      return totals
    },
    dayColumns() {
      return {
        gridTemplateColumns: `repeat(${this.days.length}, minmax(0, 1fr))`,
      }
    },
    timelineWidth() {
      const column = this.days.length === 1 ? 320 : 120
      return `${220 + this.days.length * column}px`
    },
    todayIndex() {
      return this.days.indexOf(this.today)
    },
    todayColumnStyle() {
      const width = 100 / this.days.length
      return { left: `${this.todayIndex * width}%`, width: `${width}%` }
    },
    editableTasks() {
      return this.data.tasks.filter(
        (t) =>
          t.can_edit &&
          (!this.factoryId || String(t.factory_id) === this.factoryId)
      )
    },
    selectedStage() {
      return this.editableTasks.find(
        (t) => Number(t.id) === Number(this.booking.factory_order_id)
      )
    },
    slotTitleId() {
      return `calendar-slot-${this.uid}`
    },
    canCreate() {
      return (
        !this.picker &&
        Boolean(this.createPath) &&
        typeof this.$can === 'function' &&
        this.$can('orders.create')
      )
    },
    // Unassigned work the viewer may plan can be placed into free days.
    canPlace() {
      return !this.picker && this.data.tasks.some((t) => t.can_edit)
    },
    slotCandidates() {
      if (!this.slot) return []
      return this.data.tasks.filter(
        (t) =>
          t.can_edit &&
          !t.operator_id &&
          this.slot.factoryIds.includes(Number(t.factory_id))
      )
    },
    slotStage() {
      return this.slotCandidates.find(
        (t) => Number(t.id) === Number(this.slot?.stageId)
      )
    },
    // A workshop deadline cannot pass the task's overall deadline.
    slotStageLimit() {
      return this.slotStage?.order_due_at
        ? String(this.slotStage.order_due_at).slice(0, 10)
        : ''
    },
  },
  watch: {
    factoryId() {
      this.operatorFilter = ''
      this.booking.factory_order_id = ''
      this.booking.operator_id = ''
    },
    scope() {
      ++this.request
      this.factoryId =
        this.operatorFilter =
        this.actionError =
        this.bookingSaved =
        this.placedText =
          ''
      this.slot = null
      this.busy = false
      this.data = empty()
      this.booking = {
        operator_id: '',
        factory_order_id: '',
        day: '',
        start: '',
        end: '',
      }
      this.refresh()
    },
  },
  mounted() {
    this.refresh()
    this.timer = setInterval(() => {
      if (!document.hidden && !this.busy && !this.loading) this.refresh()
    }, 30000)
  },
  beforeDestroy() {
    ++this.request
    clearInterval(this.timer)
  },
  methods: {
    slotOpen(row, day) {
      return (
        (this.picker || this.canPlace || this.canCreate) &&
        day >= this.today &&
        !row.counts[day]
      )
    },
    operatorFactoryIds(id) {
      return this.data.factories
        .filter((f) =>
          (f.operators || []).some((op) => Number(op.id) === Number(id))
        )
        .map((f) => Number(f.id))
    },
    openSlot(row, day) {
      if (!this.slotOpen(row, day)) return
      const range = freeSegment(row.jobs, day, this.today)
      if (!range) return
      const slot = {
        operator: { id: Number(row.operator.id), name: row.operator.name },
        factoryIds: this.operatorFactoryIds(row.operator.id),
        start: range.start,
        end: range.end,
      }
      if (this.picker) {
        this.$emit('pick', slot)
        return
      }
      this.placedText = this.slotError = ''
      this.slot = {
        ...slot,
        stageId: '',
        startsOn: range.start,
        deadline: range.end,
      }
      this.$nextTick(() => this.$refs.slotDialog?.focus())
    },
    closeSlot() {
      if (!this.placing) this.slot = null
    },
    syncSlotDeadline() {
      const limit = this.slotStageLimit
      if (limit && this.slot.deadline > limit)
        this.slot.deadline = limit < this.today ? this.today : limit
      if (this.slot.startsOn > this.slot.deadline)
        this.slot.startsOn = this.slot.deadline
    },
    async placeStage() {
      const slot = this.slot
      const stage = this.slotStage
      if (this.placing || !slot || !stage) return
      this.placing = true
      this.slotError = ''
      try {
        await this.$axios.$post('/api/operator-calendar/place', {
          factory_order_id: stage.id,
          operator_id: slot.operator.id,
          starts_on: slot.startsOn || null,
          deadline: slot.deadline,
        })
        if (this._isDestroyed) return
        this.placedText = `${this.t.placed}: ${this.jobTitle(stage)} · ${
          stage.workshop
        } → ${slot.operator.name}, ${this.formatDay(
          slot.startsOn
        )} – ${this.formatDay(slot.deadline)}`
        this.slot = null
        await this.refresh()
      } catch (e) {
        if (this.slot === slot) this.slotError = this.message(e)
      } finally {
        this.placing = false
      }
    },
    createFromSlot() {
      const slot = this.slot
      if (!slot) return
      const filtered = Number(this.factoryId)
      const factory = slot.factoryIds.includes(filtered)
        ? filtered
        : slot.factoryIds[0]
      const query = {
        operator_id: String(slot.operator.id),
        start: slot.start,
        end: slot.end,
      }
      if (factory) query.factory_id = String(factory)
      this.slot = null
      const path = this.localePath
        ? this.localePath(this.createPath)
        : this.createPath
      this.$router.push({ path, query })
    },
    setPeriod(period) {
      if (this.period === period) return
      this.period = period
      this.refresh()
    },
    shiftDate(direction) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(this.date)) this.date = this.today
      this.date =
        this.period === 'month'
          ? moveDay(this.date, { months: direction })
          : moveDay(this.date, {
              days: direction * (this.period === 'day' ? 1 : 7),
            })
      this.refresh()
    },
    goToday() {
      this.date = this.today
      this.refresh()
    },
    formatDay(day) {
      return day ? formatWallDate(day) : ''
    },
    loadLevelOf(count) {
      return loadLevel(count || 0)
    },
    loadText(count) {
      return count ? jobCount(count, this.locale) : this.t.freeDay
    },
    hoursText(minutes) {
      return `${Math.round((minutes / 60) * 10) / 10} ${this.t.hours}`
    },
    summary(row) {
      if (!row.jobs.length) return this.t.available
      if (row.busyUntil)
        return `${this.t.busyUntil} ${this.formatDay(row.busyUntil)}`
      return row.late ? this.t.lateWork : this.t.undated
    },
    // One operator: their own load; several: the share of busy operators.
    monthLevel(day) {
      const rows = this.timelineRows
      if (!rows.length) return 'free'
      if (rows.length === 1) return loadLevel(rows[0].counts[day] || 0)
      const share = this.dayTotals[day].busy / rows.length
      if (!share) return 'free'
      if (share <= 1 / 3) return 'light'
      return share <= 2 / 3 ? 'busy' : 'heavy'
    },
    monthText(day) {
      const rows = this.timelineRows
      if (rows.length === 1) return this.loadText(rows[0].counts[day])
      const { free, busy } = this.dayTotals[day]
      return `${free} ${this.t.freeShort} · ${busy} ${this.t.busyOperators}`
    },
    monthDayLabel(day) {
      return `${this.labelDay(day)} · ${this.monthText(day)} · ${this.c.due}: ${
        this.dayTotals[day].due
      }`
    },
    barState(job) {
      if (job.window.overdue) return 'late'
      if (job.blocked) return 'waiting'
      return job.helper ? 'helper' : 'active'
    },
    // An order deadline can carry a time of day; a workshop deadline is a date.
    dueText(job) {
      if (
        job.deadline_source === 'order' &&
        job.order_due_at &&
        !isDateOnly(job.order_due_at) &&
        !String(job.order_due_at).includes(' 00:00')
      )
        return formatWallDateTime(job.order_due_at)
      return this.formatDay(job.due_date)
    },
    barDue(job) {
      return job.window.overdue
        ? `${this.t.late} · ${this.formatDay(job.due_date)}`
        : `${this.deadlineLabel(job)}: ${this.dueText(job)}`
    },
    jobTooltip(job) {
      return [
        this.jobTitle(job),
        job.workshop,
        job.engineer,
        job.stage_due_date
          ? `${this.t.stageDue}: ${this.formatDay(job.stage_due_date)}`
          : '',
        job.order_due_at
          ? `${this.t.orderDue}: ${formatWallDateTime(job.order_due_at)}`
          : '',
        job.blocked ? this.t.waiting : '',
        job.helper ? this.c.helper : '',
      ]
        .filter(Boolean)
        .join('\n')
    },
    openBar(bar) {
      if (!bar.job.can_edit) return
      this.planJob(
        bar.job,
        bar.job.window.start > this.today ? bar.job.window.start : this.today
      )
    },
    // Tasks are named by their visible order number, like the task list.
    jobTitle(job) {
      return `#${job.order_number || job.order_id} · ${job.name}`
    },
    bookingTitle(booking) {
      return `#${booking.order_number || booking.order_id} · ${booking.task}`
    },
    planJob(job, day) {
      this.booking.factory_order_id = job.id
      this.selectTask()
      this.booking.day = day < this.today ? this.today : day
      this.syncBookingDay()
      this.$refs.planner.open = true
      this.$refs.planner.scrollIntoView({ behavior: 'smooth', block: 'center' })
    },
    async teamSaved() {
      await this.refresh()
      this.booking.operator_id = this.selectedStage?.operator_id || ''
    },
    syncBookingDay() {
      if (this.booking.day && !this.days.includes(this.booking.day)) {
        this.date = this.booking.day
        this.refresh()
      }
    },
    selectTask() {
      this.teamDirty = false
      this.bookingSaved = ''
      this.booking.operator_id = this.selectedStage?.operator_id || ''
      this.booking.day = this.date < this.today ? this.today : this.date
      this.booking.start = this.booking.end = ''
      this.syncBookingDay()
      this.actionError = ''
    },
    openDay(day) {
      this.date = day
      this.period = 'day'
      this.refresh()
    },
    time(v) {
      return String(v).slice(11, 16)
    },
    labelDay(day) {
      return calendarDayLabel(day, this.locale)
    },
    assignments(id) {
      return this.groupedJobs.get(Number(id)) || []
    },
    deadlineLabel(job) {
      return !job.due_date
        ? this.t.undated
        : job.deadline_source === 'stage'
        ? this.t.stageDue
        : this.t.orderDue
    },
    bookingsFor(id, day) {
      return this.data.bookings.filter(
        (b) =>
          Number(b.operator_id) === Number(id) &&
          b.starts_at.slice(0, 10) === day
      )
    },
    message(e) {
      return (
        Object.values(e.response?.data?.errors || {}).flat()[0] ||
        e.response?.data?.message ||
        this.t.fail
      )
    },
    async refresh() {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(this.date)) return
      const request = ++this.request
      this.loading = true
      this.error = ''
      try {
        const data = await this.$axios.$get('/api/operator-calendar', {
          params: { from: this.days[0], to: this.days[this.days.length - 1] },
        })
        if (request === this.request) this.data = data
      } catch (e) {
        if (request === this.request) this.error = this.message(e)
      } finally {
        if (request === this.request) this.loading = false
      }
    },
    async mutate(fn) {
      if (this.busy) return
      const scope = this.scope
      this.busy = true
      this.actionError = ''
      try {
        await fn()
        if (scope === this.scope && !this._isDestroyed) await this.refresh()
      } catch (e) {
        if (scope === this.scope && !this._isDestroyed)
          this.actionError = this.message(e)
      } finally {
        if (scope === this.scope && !this._isDestroyed) this.busy = false
      }
    },
    book() {
      if (this.teamDirty || this.loading || !this.selectedStage?.operator_id)
        return
      const scope = this.scope
      this.bookingSaved = ''
      return this.mutate(async () => {
        await this.$axios.$post('/api/operator-calendar/bookings', {
          allow_without_shift: true,
          team_version: this.selectedStage.team_version,
          assign_if_unassigned:
            !!this.selectedStage && !this.selectedStage.operator_id,
          factory_order_id: this.booking.factory_order_id,
          operator_id: this.booking.operator_id,
          starts_at: `${this.booking.day} ${this.booking.start}`,
          ends_at: `${this.booking.day} ${this.booking.end}`,
        })
        if (scope === this.scope)
          this.bookingSaved =
            this.booking.day + ' ' + this.booking.start + '–' + this.booking.end
      })
    },
    remove(kind, id) {
      if (window.confirm(this.t.confirm))
        return this.mutate(() =>
          this.$axios.$delete(`/api/operator-calendar/${kind}/${id}`)
        )
    },
  },
}
</script>
<style scoped>
.calendar-label {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.calendar-icon-button {
  display: inline-flex;
  width: 40px;
  height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  color: #334155;
  font-size: 20px;
  line-height: 1;
}
.calendar-icon-button:hover:not(:disabled) {
  background: #f8fafc;
}
.calendar-icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.calendar-segment {
  padding: 6px 12px;
  border-radius: 9px;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}
.calendar-segment[aria-pressed='true'] {
  background: #0f172a;
  color: #fff;
}
.calendar-icon-button:focus-visible,
.calendar-segment:focus-visible,
.calendar-month-day:focus-visible,
.calendar-bar:focus-visible,
.calendar-item__action:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}
.calendar-alert {
  padding: 12px 16px;
  border: 1px solid #fecdd3;
  border-radius: 16px;
  background: #fff1f2;
  color: #be123c;
  font-size: 14px;
  font-weight: 600;
}
.calendar-row {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
}
.calendar-row:last-child {
  border-bottom: 0;
}
.calendar-person {
  position: sticky;
  left: 0;
  z-index: 3;
  width: 220px;
  flex-shrink: 0;
  padding: 12px;
  background: #fff;
  box-shadow: 1px 0 0 #e2e8f0;
  font-size: 12px;
  line-height: 1.5;
}
.calendar-person--head {
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.calendar-days {
  position: relative;
  display: grid;
  min-width: 0;
  flex: 1;
}
.calendar-day-head {
  padding: 10px 8px;
  border-left: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
}
.calendar-day-head[data-today='true'] {
  background: #eff6ff;
  color: #1d4ed8;
}
.calendar-today-badge {
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  font-size: 10px;
}
.calendar-lanes {
  align-content: start;
  row-gap: 6px;
  padding: 8px 0 10px;
  background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px);
  background-size: calc(100% / var(--days, 7)) 100%;
}
.calendar-today-column {
  position: absolute;
  top: 0;
  bottom: 0;
  background: rgb(37 99 235 / 6%);
  pointer-events: none;
}
.calendar-load {
  position: relative;
  z-index: 1;
  overflow: hidden;
  margin: 0 4px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.calendar-load[data-level='free'] {
  background: #ecfdf5;
  color: #047857;
}
.calendar-load[data-slot='true'] {
  cursor: pointer;
  box-shadow: inset 0 0 0 1px #6ee7b7;
}
.calendar-load[data-slot='true']:hover {
  background: #d1fae5;
}
.calendar-load[data-slot='true']:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 1px;
}
.calendar-load[data-level='light'] {
  background: #eff6ff;
  color: #1d4ed8;
}
.calendar-load[data-level='busy'] {
  background: #fffbeb;
  color: #b45309;
}
.calendar-load[data-level='heavy'] {
  background: #fff1f2;
  color: #be123c;
}
.calendar-bar,
.calendar-key {
  position: relative;
  z-index: 1;
  min-width: 0;
  border-left: 4px solid #2563eb;
  border-radius: 10px;
  background: #e8f0fe;
  color: #1e3a8a;
  font-size: 11px;
  line-height: 1.45;
  text-align: left;
}
.calendar-bar {
  margin: 0 4px;
  padding: 6px 9px;
}
.calendar-key {
  padding: 2px 8px;
}
button.calendar-bar:hover {
  box-shadow: 0 4px 12px -6px rgb(30 58 138 / 45%);
}
.calendar-bar[data-state='helper'],
.calendar-key[data-state='helper'] {
  border-left-color: #7c3aed;
  background: #f3efff;
  color: #4c1d95;
}
.calendar-bar[data-state='late'],
.calendar-key[data-state='late'] {
  border-left-color: #e11d48;
  background: #ffe4e6;
  color: #9f1239;
}
.calendar-bar[data-state='waiting'],
.calendar-key[data-state='waiting'] {
  border: 1px dashed #94a3b8;
  border-left: 4px dashed #94a3b8;
  background: #f8fafc;
  color: #475569;
}
.calendar-bar[data-cut-start='true'] {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.calendar-bar[data-cut-end='true'] {
  margin-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.calendar-item {
  display: block;
  padding: 7px 9px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 11px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.calendar-item[data-tone='blue'] {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1e3a8a;
}
.calendar-item__action {
  margin-top: 6px;
  color: #1d4ed8;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.calendar-month-day {
  min-width: 0;
  min-height: 76px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  color: #0f172a;
  text-align: left;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.calendar-month-day:hover {
  border-color: #94a3b8;
  box-shadow: 0 4px 14px -8px rgb(15 23 42 / 35%);
}
.calendar-month-day[data-level='free'] {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #065f46;
}
.calendar-month-day[data-level='light'] {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1e3a8a;
}
.calendar-month-day[data-level='busy'] {
  border-color: #fde68a;
  background: #fffbeb;
  color: #92400e;
}
.calendar-month-day[data-level='heavy'] {
  border-color: #fecdd3;
  background: #fff1f2;
  color: #9f1239;
}
.calendar-month-day[data-today='true'] {
  box-shadow: inset 0 0 0 2px #2563eb;
}
.calendar-count {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
.calendar-count[data-tone='amber'] {
  background: #fef3c7;
  color: #b45309;
}
.calendar-panel {
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
}
.calendar-panel__summary {
  cursor: pointer;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}
@media (max-width: 640px) {
  .calendar-person {
    width: 150px;
  }
}
/* The app switches themes with a .dark class, like assets/css/main.css. */
.dark .calendar-label {
  color: #94a3b8;
}
.dark .calendar-icon-button,
.dark .calendar-month-day,
.dark .calendar-panel,
.dark .calendar-person {
  border-color: #334155;
  background: #0f172a;
  color: #e2e8f0;
}
.dark .calendar-person,
.dark .calendar-row {
  box-shadow: 1px 0 0 #1e293b;
  border-color: #1e293b;
}
.dark .calendar-person--head,
.dark .calendar-day-head {
  border-color: #1e293b;
  background: #111c30;
  color: #cbd5e1;
}
.dark .calendar-day-head[data-today='true'] {
  background: #172554;
  color: #bfdbfe;
}
.dark .calendar-lanes {
  background-image: linear-gradient(to right, #1e293b 1px, transparent 1px);
}
.dark .calendar-segment {
  color: #cbd5e1;
}
.dark .calendar-segment[aria-pressed='true'] {
  background: #f8fafc;
  color: #020617;
}
.dark .calendar-alert {
  border-color: #881337;
  background: #4c0519;
  color: #fecdd3;
}
.dark .calendar-load[data-level='free'],
.dark .calendar-month-day[data-level='free'] {
  border-color: #065f46;
  background: #052e2b;
  color: #6ee7b7;
}
.dark .calendar-load[data-level='light'],
.dark .calendar-month-day[data-level='light'] {
  border-color: #1e3a8a;
  background: #172554;
  color: #bfdbfe;
}
.dark .calendar-load[data-level='busy'],
.dark .calendar-month-day[data-level='busy'] {
  border-color: #78350f;
  background: #422006;
  color: #fde68a;
}
.dark .calendar-load[data-level='heavy'],
.dark .calendar-month-day[data-level='heavy'] {
  border-color: #881337;
  background: #4c0519;
  color: #fecdd3;
}
.dark .calendar-bar,
.dark .calendar-key,
.dark .calendar-item[data-tone='blue'] {
  background: #172554;
  color: #bfdbfe;
}
.dark .calendar-bar[data-state='helper'],
.dark .calendar-key[data-state='helper'] {
  background: #2e1065;
  color: #ddd6fe;
}
.dark .calendar-bar[data-state='late'],
.dark .calendar-key[data-state='late'] {
  background: #4c0519;
  color: #fecdd3;
}
.dark .calendar-bar[data-state='waiting'],
.dark .calendar-key[data-state='waiting'] {
  background: #0f172a;
  color: #cbd5e1;
}
.dark .calendar-item__action {
  color: #93c5fd;
}
.dark .calendar-panel__summary {
  color: #f8fafc;
}
</style>
