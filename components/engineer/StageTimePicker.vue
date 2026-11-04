<template>
  <section
    v-if="operatorId"
    class="my-2 space-y-2 rounded-lg border p-3 text-sm"
  >
    <strong>{{ factory.name }} · {{ operatorName }}</strong>
    <div class="flex flex-wrap items-end gap-2">
      <label
        >{{ t.duration
        }}<input
          :value="row.estimated_minutes"
          type="number"
          min="1"
          max="10080"
          :disabled="disabled"
          class="field"
          @input="estimate($event.target.value)"
      /></label>
      <label
        >{{ t.searchFrom
        }}<input
          v-model="from"
          type="date"
          :disabled="disabled"
          class="field"
          @change="clearOffer"
      /></label>
      <button
        type="button"
        class="button"
        :disabled="disabled || busy || !validDuration"
        @click="suggest"
      >
        {{ t.findSlot }}
      </button>
    </div>
    <div
      v-if="offered && !row.starts_at"
      class="flex flex-wrap items-end gap-2"
    >
      <label
        >{{ t.suggested
        }}<input
          v-model="offered"
          type="datetime-local"
          :disabled="disabled"
          class="field"
      /></label>
      <button
        type="button"
        class="button"
        :disabled="disabled || !offered"
        @click="confirm"
      >
        {{ t.confirmSlot }}
      </button>
    </div>
    <p v-if="row.starts_at">
      {{ t.confirmed }} · {{ row.starts_at }} –
      {{ end(row.starts_at, row.estimated_minutes).slice(11) }}
      <button
        type="button"
        :disabled="disabled"
        class="ml-2 underline"
        @click="changeTime"
      >
        {{ t.change }}
      </button>
    </p>
    <p v-if="message" role="status">{{ message }}</p>
  </section>
</template>
<script>
import {
  calendarCopy,
  firstStageSlot,
  endOfSlot,
} from '@/utils/operator-calendar'
export default {
  props: {
    factory: { type: Object, required: true },
    operatorId: { type: [Number, String], default: null },
    schedule: { type: Object, required: true },
    stage: { type: Object, required: true },
    disabled: Boolean,
  },
  data: () => ({
    from: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Yerevan' }).format(
      new Date()
    ),
    offered: '',
    busy: false,
    message: '',
    sequence: 0,
  }),
  computed: {
    t() {
      return calendarCopy[this.$i18n?.locale] || calendarCopy.hy
    },
    row() {
      const row = this.schedule[this.factory.id]
      return Number(row?.operator_id) === Number(this.operatorId) && row
        ? row
        : {}
    },
    operatorName() {
      return (
        this.factory.operators?.find(
          (op) => Number(op.id) === Number(this.operatorId)
        )?.name || '#' + this.operatorId
      )
    },
    validDuration() {
      const n = Number(this.row.estimated_minutes)
      return Number.isInteger(n) && n > 0 && n <= 10080
    },
  },
  beforeDestroy() {
    ++this.sequence
  },
  methods: {
    end: endOfSlot,
    write(minutes, start) {
      this.$emit('update', {
        factory_id: Number(this.factory.id),
        operator_id: Number(this.operatorId),
        estimated_minutes: minutes,
        starts_at: start,
      })
    },
    clearOffer() {
      ++this.sequence
      this.busy = false
      this.offered = ''
      this.message = ''
    },
    estimate(raw) {
      this.clearOffer()
      this.write(Number(raw), null)
    },
    changeTime() {
      this.offered = this.row.starts_at.replace(' ', 'T')
      this.write(this.row.estimated_minutes, null)
    },
    confirm() {
      this.write(this.row.estimated_minutes, this.offered.replace('T', ' '))
      this.offered = ''
      this.message = ''
    },
    async suggest() {
      this.clearOffer()
      if (!this.from || !this.validDuration) return
      const predecessors = (this.stage.predecessor_factory_ids || []).map(
        (id) => this.schedule[id]
      )
      if (predecessors.some((p) => !p?.starts_at)) {
        this.message = this.t.predecessor
        return
      }
      const request = this.sequence
      const startDay = new Date(this.from + 'T12:00:00Z')
      startDay.setUTCDate(startDay.getUTCDate() + 30)
      this.busy = true
      try {
        const data = await this.$axios.$get('/api/operator-calendar', {
          params: { from: this.from, to: startDay.toISOString().slice(0, 10) },
        })
        if (request !== this.sequence) return
        const now = new Intl.DateTimeFormat('sv-SE', {
          timeZone: 'Asia/Yerevan',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
        }).format(new Date())
        const earliest = [
          this.from + ' 00:00',
          endOfSlot(now, 1),
          ...predecessors.map((p) =>
            endOfSlot(p.starts_at, p.estimated_minutes)
          ),
        ]
          .sort()
          .pop()
        const mine = (row) =>
          Number(row.operator_id) === Number(this.operatorId)
        const drafts = Object.values(this.schedule)
          .filter(
            (p) => mine(p) && p.factory_id !== this.factory.id && p.starts_at
          )
          .map((p) => ({
            starts_at: p.starts_at + ':00',
            ends_at: endOfSlot(p.starts_at, p.estimated_minutes) + ':00',
          }))
        const slot = firstStageSlot(
          data.shifts.filter(mine),
          [...data.bookings.filter(mine), ...drafts],
          this.row.estimated_minutes,
          earliest
        )
        this.offered = slot?.replace(' ', 'T') || ''
        if (!slot) this.message = this.t.noSlot
        else if (this.row.starts_at)
          this.write(this.row.estimated_minutes, null)
      } catch (e) {
        if (request === this.sequence)
          this.message = e.response?.data?.message || this.t.fail
      } finally {
        if (request === this.sequence) this.busy = false
      }
    },
  },
}
</script>
<style scoped>
.field {
  display: block;
  max-width: 100%;
  min-height: 40px;
  padding: 6px;
  border: 1px solid #94a3b8;
  border-radius: 6px;
  background: transparent;
}
.button {
  padding: 10px;
  border: 1px solid #94a3b8;
  border-radius: 6px;
}
.button:disabled {
  opacity: 0.5;
}
</style>
