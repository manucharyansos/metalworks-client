<template>
  <TaskCard :order="order" @open="$emit('edit', $event)" />
</template>

<script>
import { workshopSteps } from '@/utils/task-board'
import TaskCard from '@/components/engineer/OrderCard.vue'
import { isStepCompleted } from '@/utils/task-workflow'
export default {
  components: { TaskCard },
  props: { order: { type: Object, required: true } },

  computed: {
    factoryOrders() {
      return workshopSteps(this.order)
    },
    factoryCount() {
      return this.factoryOrders.length
    },

    finishDate() {
      return this.order.dates?.finish_date
        ? new Date(this.order.dates.finish_date)
        : null
    },

    hasCanceled() {
      return this.factoryOrders.some(
        (fo) => this.normalizeStatus(fo.status) === 'canceled'
      )
    },

    hasDateChanged() {
      return this.factoryOrders.some(
        (fo) => this.normalizeStatus(fo.status) === 'date_changed'
      )
    },

    isAllCompleted() {
      const fos = this.factoryOrders
      if (!fos.length) return false

      return fos.every((fo) => {
        const code = this.normalizeStatus(fo.status)

        if (code === 'canceled') return false

        if (code === 'finished') return isStepCompleted(fo)

        return false
      })
    },

    isOverdue() {
      return (
        this.finishDate &&
        this.finishDate < new Date() &&
        !this.isAllCompleted &&
        !this.hasCanceled
      )
    },

    isNearDeadline() {
      if (!this.finishDate || this.isAllCompleted) return false
      const hoursLeft = (this.finishDate - Date.now()) / 36e5
      return hoursLeft > 0 && hoursLeft <= 24
    },

    isInProgress() {
      return (
        this.factoryOrders.length > 0 &&
        !this.isAllCompleted &&
        !this.hasCanceled
      )
    },

    overallStatusText() {
      if (this.hasCanceled) return 'Չեղարկված'
      if (this.hasDateChanged) return 'Ժամկետը փոփոխված'
      if (this.isAllCompleted) return 'Ավարտված'
      if (this.isOverdue) return 'Ժամկետն անցել է'
      if (this.isInProgress || this.factoryOrders.length > 0) return 'Ընթացքում'
      return 'Սպասում է'
    },

    overallStatusClass() {
      if (this.hasCanceled) return 'bg-rose-600 text-white'
      if (this.hasDateChanged) return 'bg-orange-500 text-white'
      if (this.isAllCompleted) return 'bg-emerald-600 text-white'
      if (this.isOverdue) return 'bg-red-600 text-white'
      if (this.isInProgress) return 'bg-amber-600 text-white'
      return 'bg-gray-500 text-white'
    },
  },

  methods: {
    normalizeStatus(raw) {
      if (!raw) return 'pending'
      const s = raw.toString().toLowerCase()
      if (s === 'finished' || s.includes('ավարտ')) return 'finished'
      if (s === 'canceled' || s === 'cancelled' || s.includes('մերժ'))
        return 'canceled'
      if (s === 'confirmed' || s.includes('հաստատ')) return 'confirmed'
      if (s === 'date_changed' || s.includes('ժամկետ')) return 'date_changed'
      if (s === 'pending' || s === '0' || s === 'null' || s === '-') {
        return 'pending'
      }
      return s
    },

    formatDeadline(date) {
      if (!date) return '—'
      const d = new Date(date)
      const daysLeft = Math.floor((d - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysLeft < 0) return 'Անցել է'
      if (daysLeft === 0) return 'Այսօր'
      if (daysLeft === 1) return 'Վաղը'
      return `${daysLeft} օր հետո`
    },
  },
}
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg;
}
.btn-view {
  @apply px-4 py-2 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition;
}
.badge {
  @apply rounded-full;
}
</style>
