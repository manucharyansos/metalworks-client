<template>
  <section
    class="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
    data-operator-calendar
  >
    <h2 class="text-xl font-bold">{{ t.title }}</h2>
    <p class="text-sm text-slate-500">{{ t.help }}</p>
    <div class="flex flex-wrap items-end gap-3">
      <label class="text-sm"
        >{{ c[period]
        }}<input
          v-model="date"
          type="date"
          class="calendar-control"
          @change="refresh"
      /></label>
      <label
        >{{ c.period
        }}<select v-model="period" class="calendar-control" @change="refresh">
          <option
            v-for="key in ['day', 'week', 'month']"
            :key="key"
            :value="key"
          >
            {{ c[key] }}
          </option>
        </select></label
      >
      <label
        >{{ c.operator
        }}<select v-model="operatorFilter" class="calendar-control">
          <option value="">{{ c.all }}</option>
          <option v-for="op in roster" :key="op.id" :value="String(op.id)">
            {{ op.name }}
          </option>
        </select></label
      >
      <select v-model="factoryId" :aria-label="t.all" class="calendar-control">
        <option value="">{{ t.all }}</option>
        <option v-for="f in data.factories" :key="f.id" :value="String(f.id)">
          {{ f.name }}
        </option>
      </select>
      <button
        type="button"
        :disabled="loading || busy"
        class="calendar-button"
        @click="refresh"
      >
        {{ t.refresh }}
      </button>
    </div>
    <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
    <p v-if="actionError" role="alert" class="text-sm text-red-600">
      {{ actionError }}
    </p>
    <p v-if="loading" role="status">{{ $t('file_details.loading') }}</p>
    <template v-if="!error">
      <div
        v-if="period === 'month'"
        class="grid grid-cols-2 gap-1 sm:grid-cols-7"
      >
        <button
          v-for="day in days"
          :key="day"
          type="button"
          class="min-w-0 rounded-lg border p-2 text-left text-xs"
          @click="openDay(day)"
        >
          <strong>{{ labelDay(day) }}</strong>
          <p>{{ t.busy }} · {{ monthCount(day, 'booked') }}</p>
          <p>{{ c.due }} · {{ monthCount(day, 'due') }}</p>
        </button>
      </div>
      <div v-else class="overflow-x-auto" tabindex="0" :aria-label="t.title">
        <table class="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th class="min-w-[140px] p-2 text-left">{{ t.operator }}</th>
              <th v-for="day in days" :key="day" class="min-w-[180px] p-2">
                {{ labelDay(day) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="operator in operators" :key="operator.id">
              <th class="border p-2 text-left align-top">
                <details>
                  <summary class="cursor-pointer py-1">
                    <strong>{{ operator.name }}</strong>
                    <span class="mt-1 block font-normal"
                      >{{ t.openJobs }} ·
                      {{ assignments(operator.id).length }}</span
                    >
                    <span
                      v-if="overdueCount(operator.id)"
                      class="block text-rose-700"
                      >{{ t.late }} · {{ overdueCount(operator.id) }}</span
                    >
                    <span
                      v-if="undatedCount(operator.id)"
                      class="block text-slate-500"
                      >{{ t.undated }} · {{ undatedCount(operator.id) }}</span
                    >
                  </summary>
                  <ul class="mt-2 space-y-2 font-normal">
                    <li
                      v-for="job in assignments(operator.id)"
                      :key="job.id"
                      class="border-t pt-1"
                    >
                      <strong>{{ job.name }}</strong> · {{ job.workshop }}
                      <p>{{ job.engineer }}</p>
                      <p v-if="job.helper" class="font-semibold">
                        {{ c.helper }}
                      </p>
                      <p
                        :class="{
                          'text-rose-700': job.due_date && job.due_date < today,
                        }"
                      >
                        {{ deadlineLabel(job) }} {{ job.due_date }}
                      </p>
                      <p v-if="job.estimated_minutes">
                        {{ job.estimated_minutes }} {{ t.minutes }}
                      </p>
                    </li>
                  </ul>
                </details>
              </th>
              <td v-for="day in days" :key="day" class="border p-2 align-top">
                <article
                  v-for="job in dueOn(operator.id, day)"
                  :key="'due' + job.id"
                  class="mb-2 rounded-lg border border-amber-200 p-2"
                >
                  <strong>{{ deadlineLabel(job) }}</strong>
                  <p>{{ job.name }} · {{ job.workshop }}</p>
                  <p>{{ job.engineer }}</p>
                  <p v-if="job.helper" class="font-semibold">{{ c.helper }}</p>
                  <button
                    v-if="job.can_edit"
                    type="button"
                    class="mt-1 underline"
                    @click="planJob(job, day)"
                  >
                    {{ c.schedule }}
                  </button>
                  <p v-if="job.estimated_minutes">
                    {{ job.estimated_minutes }} {{ t.minutes }}
                  </p>
                </article>
                <span
                  v-if="
                    !dueOn(operator.id, day).length &&
                    !bookingsFor(operator.id, day).length &&
                    !shiftsFor(operator.id, day).length
                  "
                  class="text-slate-400"
                  :aria-label="t.empty"
                  >—</span
                >
                <div
                  v-for="shift in shiftsFor(operator.id, day)"
                  :key="'s' + shift.id"
                  class="mb-2 text-slate-500"
                >
                  {{ time(shift.starts_at) }}–{{ time(shift.ends_at) }}
                  <button
                    v-if="data.can_manage_shifts"
                    type="button"
                    :disabled="busy"
                    class="ml-1 underline"
                    :aria-label="t.remove + ' ' + time(shift.starts_at)"
                    @click="remove('shifts', shift.id)"
                  >
                    {{ t.remove }}
                  </button>
                </div>
                <div
                  v-for="booking in bookingsFor(operator.id, day)"
                  :key="booking.id"
                  class="mb-2 rounded-lg bg-blue-50 p-2 text-blue-900 dark:bg-blue-950 dark:text-blue-100"
                >
                  <strong
                    >{{ time(booking.starts_at) }}–{{
                      time(booking.ends_at)
                    }}</strong
                  >
                  <p class="break-words">
                    {{ booking.task }} · {{ booking.workshop }}
                  </p>
                  <p>{{ booking.engineer }}</p>
                  <p v-if="booking.is_helper" class="font-semibold">
                    {{ c.helper }}
                  </p>
                  <p v-if="booking.blocked" class="text-amber-700">
                    {{ t.pending }}
                  </p>
                  <p v-if="booking.assignment_changed" class="text-red-600">
                    {{ t.changed }}
                  </p>
                  <button
                    v-if="booking.can_edit"
                    type="button"
                    :disabled="busy"
                    class="mt-1 underline"
                    @click="remove('bookings', booking.id)"
                  >
                    {{ t.remove }}
                  </button>
                </div>
                <div
                  v-for="(gap, index) in gaps(operator.id, day)"
                  :key="'g' + index"
                  class="mb-1 rounded bg-green-50 p-2 text-green-800"
                >
                  {{ t.free }}: {{ time(gap.starts_at) }}–{{
                    time(gap.ends_at)
                  }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <details v-if="data.can_manage_shifts" class="rounded-lg border p-3">
        <summary class="cursor-pointer font-semibold">{{ t.shift }}</summary>
        <form class="mt-3 space-y-3" @submit.prevent="addShift">
          <div class="flex flex-wrap gap-2">
            <label
              >{{ t.operator
              }}<select
                v-model="shift.operator_id"
                required
                class="calendar-control"
              >
                <option disabled value="">—</option>
                <option v-for="op in operators" :key="op.id" :value="op.id">
                  {{ op.name }}
                </option>
              </select></label
            ><label
              >{{ t.start
              }}<input
                v-model="shift.start"
                required
                type="time"
                class="calendar-control" /></label
            ><label
              >{{ t.end
              }}<input
                v-model="shift.end"
                required
                type="time"
                class="calendar-control"
            /></label>
          </div>
          <div class="flex flex-wrap gap-3">
            <label v-for="day in days" :key="day" class="text-sm"
              ><input v-model="shift.dates" type="checkbox" :value="day" />
              {{ labelDay(day) }}</label
            >
          </div>
          <button
            :disabled="busy || !shift.dates.length"
            type="submit"
            class="calendar-button"
          >
            {{ t.addShift }}
          </button>
        </form>
      </details>
      <details ref="planner" class="rounded-lg border p-3">
        <summary class="cursor-pointer font-semibold">{{ t.plan }}</summary>
        <p class="my-2 text-xs text-slate-500">
          {{ c.hours }}
        </p>
        <form class="flex flex-wrap items-end gap-3" @submit.prevent="book">
          <label class="min-w-0 max-w-full"
            >{{ c.existing
            }}<select
              v-model="booking.factory_order_id"
              required
              class="calendar-control max-w-full"
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
                #{{ task.order_id }} · {{ task.name }} · {{ task.workshop }}
              </option>
            </select></label
          >
          <TaskTeamEditor
            class="w-full"
            v-if="selectedStage"
            :key="selectedStage.id"
            :step="selectedStage"
            :workers="data.workers || []"
            :disabled="busy || loading"
            @saved="teamSaved"
            @dirty="teamDirty = $event"
          />
          <p v-if="selectedStage" class="text-sm">
            {{ c.primary }}: {{ selectedStage.operator_name || t.unassigned }}
          </p>
          <label
            >{{ t.day
            }}<input
              v-model="booking.day"
              @change="syncBookingDay"
              required
              type="date"
              class="calendar-control" /></label
          ><label
            >{{ t.start
            }}<input
              v-model="booking.start"
              required
              type="time"
              class="calendar-control" /></label
          ><label
            >{{ t.end
            }}<input
              v-model="booking.end"
              required
              type="time"
              class="calendar-control"
          /></label>
          <button
            :disabled="
              busy ||
              loading ||
              teamDirty ||
              !selectedStage ||
              !booking.operator_id
            "
            type="submit"
            class="calendar-button"
          >
            {{ t.save }}
          </button>
        </form>

        <div
          v-if="
            booking.operator_id && booking.day && days.includes(booking.day)
          "
          class="mt-3 flex flex-wrap items-center gap-2 text-sm"
        >
          <span>{{ t.free }}</span>
          <button
            v-for="gap in gaps(booking.operator_id, booking.day)"
            :key="gap.starts_at"
            class="underline"
            type="button"
            @click="chooseGap(gap)"
          >
            {{ time(gap.starts_at) }}–{{ time(gap.ends_at) }}
          </button>
          <span v-if="!gaps(booking.operator_id, booking.day).length">{{
            shiftsFor(booking.operator_id, booking.day).length ? '—' : c.manual
          }}</span>
        </div>
        <p v-if="bookingSaved" role="status" class="mt-2 text-green-700">
          {{ t.confirmed }} · {{ bookingSaved }}
        </p>
        <p v-if="!editableTasks.length" class="mt-2 text-sm text-slate-500">
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
  freeIntervals,
  calendarDays,
} from '@/utils/operator-calendar'
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
  data: () => ({
    data: empty(),
    date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Yerevan' }).format(
      new Date()
    ),
    factoryId: '',
    period: 'week',
    operatorFilter: '',
    actionError: '',
    bookingSaved: '',
    teamDirty: false,
    loading: false,
    busy: false,
    error: '',
    request: 0,
    timer: null,
    shift: { operator_id: '', dates: [], start: '09:00', end: '18:00' },
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
    today() {
      return (
        this.data.today ||
        new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Yerevan' }).format(
          new Date()
        )
      )
    },
    days() {
      return calendarDays(this.date, this.period)
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
        for (const row of [...this.data.bookings, ...this.data.shifts])
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
    groupedJobs() {
      const groups = new Map()
      for (const job of this.data.tasks) {
        if (
          !job.operator_id ||
          (this.factoryId && String(job.factory_id) !== this.factoryId)
        )
          continue
        const people = [
          { id: job.operator_id, helper: false },
          ...(job.helpers || []).map((h) => ({ id: h.id, helper: true })),
        ]
        for (const person of people) {
          const id = Number(person.id)
          if (!id) continue
          if (!groups.has(id)) groups.set(id, [])
          groups.get(id).push({ ...job, helper: person.helper })
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
          ''
      this.busy = false
      this.data = empty()
      this.booking = {
        operator_id: '',
        factory_order_id: '',
        day: '',
        start: '',
        end: '',
      }
      this.shift = { operator_id: '', dates: [], start: '09:00', end: '18:00' }
      this.refresh()
    },
    date() {
      this.shift.dates = []
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
    chooseGap(gap) {
      this.booking.start = this.time(gap.starts_at)
      this.booking.end = this.time(gap.ends_at)
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
    monthCount(day, kind) {
      return this.operators.reduce(
        (sum, op) =>
          sum +
          (kind === 'due'
            ? this.dueOn(op.id, day)
            : this.bookingsFor(op.id, day)
          ).length,
        0
      )
    },
    time(v) {
      return String(v).slice(11, 16)
    },
    labelDay(day) {
      return new Intl.DateTimeFormat(
        this.$i18n?.locale === 'hy' ? 'hy-AM' : this.$i18n?.locale || 'en',
        { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }
      ).format(new Date(day + 'T12:00:00Z'))
    },
    operatorName(id) {
      return id
        ? this.operators.find((o) => Number(o.id) === Number(id))?.name ||
            `#${id}`
        : this.t.unassigned
    },
    assignments(id) {
      return this.groupedJobs.get(Number(id)) || []
    },
    overdueCount(id) {
      return this.assignments(id).filter(
        (j) => j.due_date && j.due_date < this.today
      ).length
    },
    undatedCount(id) {
      return this.assignments(id).filter((j) => !j.due_date).length
    },
    dueOn(id, day) {
      return this.assignments(id).filter((j) => j.due_date === day)
    },
    deadlineLabel(job) {
      return !job.due_date
        ? this.t.undated
        : job.deadline_source === 'stage'
        ? this.t.stageDue
        : this.t.orderDue
    },
    shiftsFor(id, day) {
      return this.data.shifts.filter(
        (s) =>
          Number(s.operator_id) === Number(id) &&
          s.starts_at.slice(0, 10) === day
      )
    },
    bookingsFor(id, day) {
      return this.data.bookings.filter(
        (b) =>
          Number(b.operator_id) === Number(id) &&
          b.starts_at.slice(0, 10) === day
      )
    },
    gaps(id, day) {
      return freeIntervals(this.shiftsFor(id, day), this.bookingsFor(id, day))
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
    addShift() {
      return this.mutate(() =>
        this.$axios.$post('/api/operator-calendar/shifts', this.shift)
      )
    },
    book() {
      if (this.teamDirty || this.loading || !this.selectedStage?.operator_id)
        return
      const scope = this.scope
      this.bookingSaved = ''
      return this.mutate(async () => {
        await this.$axios.$post('/api/operator-calendar/bookings', {
          allow_without_shift: !this.shiftsFor(
            this.booking.operator_id,
            this.booking.day
          ).length,
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
.calendar-control {
  display: block;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: transparent;
  min-height: 42px;
}
.calendar-button {
  padding: 10px 14px;
  border-radius: 8px;
  background: #2563eb;
  color: white;
}
.calendar-button:disabled {
  opacity: 0.5;
}
</style>
