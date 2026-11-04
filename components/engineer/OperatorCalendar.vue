<template>
  <section
    class="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
    data-operator-calendar
  >
    <h2 class="text-xl font-bold">{{ t.title }}</h2>
    <p class="text-sm text-slate-500">{{ t.help }}</p>
    <div class="flex flex-wrap items-end gap-3">
      <label class="text-sm"
        >{{ t.date
        }}<input
          v-model="date"
          type="date"
          class="calendar-control"
          @change="refresh"
      /></label>
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
    <p v-if="loading" role="status">{{ $t('file_details.loading') }}</p>
    <template v-if="!error">
      <div class="overflow-x-auto" tabindex="0" :aria-label="t.title">
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
                {{ operator.name }}
                <p class="mt-2 font-normal text-amber-700">
                  {{ t.queue }}: {{ unplannedFor(operator.id) }}
                </p>
              </th>
              <td v-for="day in days" :key="day" class="border p-2 align-top">
                <p
                  v-if="!shiftsFor(operator.id, day).length"
                  class="text-slate-500"
                >
                  {{ t.empty }}
                </p>
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
      <details class="rounded-lg border p-3">
        <summary class="cursor-pointer font-semibold">{{ t.plan }}</summary>
        <p class="my-2 text-xs text-slate-500">
          {{ t.queueHelp }} {{ t.partial }}
        </p>
        <form class="flex flex-wrap items-end gap-3" @submit.prevent="book">
          <label
            >{{ t.operator
            }}<select
              v-model="booking.operator_id"
              required
              class="calendar-control"
              @change="booking.factory_order_id = ''"
            >
              <option disabled value="">—</option>
              <option v-for="op in operators" :key="op.id" :value="op.id">
                {{ op.name }}
              </option>
            </select></label
          >
          <label class="min-w-0 max-w-full"
            >{{ t.task
            }}<select
              v-model="booking.factory_order_id"
              required
              class="calendar-control max-w-full"
            >
              <option disabled value="">—</option>
              <option
                v-for="task in editableTasks"
                :key="task.id"
                :value="task.id"
              >
                #{{ task.id }} · {{ task.name }} · {{ task.workshop }}
              </option>
            </select></label
          >
          <label
            >{{ t.day
            }}<input
              v-model="booking.day"
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
            :disabled="busy || !booking.factory_order_id"
            type="submit"
            class="calendar-button"
          >
            {{ t.save }}
          </button>
        </form>
        <p v-if="!editableTasks.length" class="mt-2 text-sm text-slate-500">
          {{ t.noOptions }}
        </p>
      </details>
      <section>
        <h3 class="font-semibold">{{ t.queue }} ({{ queue.length }})</h3>
        <p class="text-xs text-slate-500">{{ t.queueHelp }}</p>
        <p v-if="!queue.length" class="mt-2 text-sm">{{ t.noTasks }}</p>
        <ul class="mt-3 grid gap-2 sm:grid-cols-2">
          <li
            v-for="task in queue"
            :key="task.id"
            class="rounded-lg border p-3 text-sm"
          >
            <strong>#{{ task.id }} · {{ task.name }}</strong>
            <p>{{ task.workshop }} · {{ task.engineer }}</p>
            <p>{{ operatorName(task.operator_id) }}</p>
            <p v-if="task.blocked" class="text-amber-700">{{ t.pending }}</p>
          </li>
        </ul>
      </section>
    </template>
  </section>
</template>
<script>
import {
  calendarCopy,
  freeIntervals,
  weekDates,
} from '@/utils/operator-calendar'
const empty = () => ({
  factories: [],
  shifts: [],
  bookings: [],
  tasks: [],
  can_manage_shifts: false,
})
export default {
  data: () => ({
    data: empty(),
    date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Yerevan' }).format(
      new Date()
    ),
    factoryId: '',
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
    t() {
      return calendarCopy[this.$i18n?.locale] || calendarCopy.hy
    },
    days() {
      return weekDates(this.date)
    },
    scope() {
      return `${this.$auth?.user?.id}:${this.$store?.state?.workspace?.company?.id}`
    },
    operators() {
      const rows = this.data.factories
        .filter((f) => !this.factoryId || String(f.id) === this.factoryId)
        .flatMap((f) => f.operators)
      const map = new Map(rows.map((op) => [Number(op.id), op]))
      if (!this.factoryId)
        for (const row of [...this.data.bookings, ...this.data.shifts])
          if (!map.has(Number(row.operator_id)))
            map.set(Number(row.operator_id), {
              id: row.operator_id,
              name: `${this.t.unknown} #${row.operator_id}`,
            })
      return [...map.values()]
    },
    queue() {
      return this.data.tasks.filter(
        (t) =>
          !t.planned &&
          (!this.factoryId || String(t.factory_id) === this.factoryId)
      )
    },
    editableTasks() {
      return this.data.tasks.filter(
        (t) =>
          t.can_edit &&
          Number(t.operator_id) === Number(this.booking.operator_id) &&
          this.booking.operator_id
      )
    },
  },
  watch: {
    scope() {
      ++this.request
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
    unplannedFor(id) {
      return this.data.tasks.filter(
        (t) => !t.planned && Number(t.operator_id) === Number(id)
      ).length
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
          params: { from: this.days[0], to: this.days[6] },
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
      this.error = ''
      try {
        await fn()
        if (scope === this.scope && !this._isDestroyed) await this.refresh()
      } catch (e) {
        if (scope === this.scope && !this._isDestroyed)
          this.error = this.message(e)
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
      return this.mutate(() =>
        this.$axios.$post('/api/operator-calendar/bookings', {
          factory_order_id: this.booking.factory_order_id,
          operator_id: this.booking.operator_id,
          starts_at: `${this.booking.day} ${this.booking.start}`,
          ends_at: `${this.booking.day} ${this.booking.end}`,
        })
      )
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
