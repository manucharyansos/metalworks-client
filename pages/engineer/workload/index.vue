<template>
  <main
    class="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6"
    data-engineer-workload
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold">{{ t.workload }}</h1>
        <p class="mt-2 max-w-3xl text-sm text-slate-500">
          {{ t.workloadHelp }}
        </p>
      </div>
      <button
        type="button"
        :disabled="loading"
        class="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        @click="refresh"
      >
        {{ loading ? t.loading : t.refresh }}
      </button>
    </div>
    <p v-if="error" role="alert" class="break-words text-sm text-red-600">
      {{ error }}
    </p>
    <div class="grid gap-3 sm:grid-cols-2">
      <input
        v-model="search"
        :placeholder="t.search"
        class="min-w-0 w-full rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
      /><select
        v-model="factoryId"
        class="min-w-0 w-full rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
      >
        <option value="">{{ t.allFactories }}</option>
        <option
          v-for="factory in factories"
          :key="factory.id"
          :value="String(factory.id)"
        >
          {{ factory.name }}
        </option>
      </select>
    </div>
    <section
      v-for="factory in filteredFactories"
      :key="factory.id"
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      :data-workload-factory="factory.id"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="font-bold">{{ factory.name }}</h2>
        <p class="text-sm text-slate-500">
          {{ t.unassigned }}՝ {{ factory.unassigned_tasks }}
        </p>
      </div>
      <div class="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="operator in factory.operators"
          :key="operator.id"
          class="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
          :data-workload-operator="operator.id"
        >
          <h3 class="break-words font-semibold">{{ operator.name }}</h3>
          <dl class="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div>
              <dt class="text-slate-500">{{ t.active }}</dt>
              <dd class="mt-1 text-lg font-bold" data-workload-active>
                {{ operator.active_tasks }}
              </dd>
            </div>
            <div>
              <dt class="text-slate-500">{{ t.overdue }}</dt>
              <dd
                class="mt-1 text-lg font-bold text-amber-700 dark:text-amber-300"
              >
                {{ operator.overdue_tasks }}
              </dd>
            </div>
            <div>
              <dt class="text-slate-500">{{ t.today }}</dt>
              <dd class="mt-1 text-lg font-bold">{{ operator.due_today }}</dd>
            </div>
          </dl>
          <p class="mt-3 text-xs text-slate-500">
            {{ t.review }}՝ {{ operator.awaiting_review }}
          </p>
        </article>
      </div>
      <p v-if="!factory.operators.length" class="mt-4 text-sm text-slate-500">
        {{ search ? t.noResults : t.noOperators }}
      </p>
    </section>
    <notifications />
  </main>
</template>
<script>
import { routingCopy } from '@/utils/task-routing'
export default {
  layout: 'engineer',
  middleware: ['role-guard'],
  meta: { role: 'engineer' },
  data: () => ({
    factories: [],
    loading: false,
    error: '',
    search: '',
    factoryId: '',
    refreshTimer: null,
  }),
  computed: {
    t() {
      return routingCopy[this.$i18n?.locale] || routingCopy.hy
    },
    filteredFactories() {
      const search = this.search.trim().toLowerCase()
      return this.factories
        .filter(
          (factory) => !this.factoryId || String(factory.id) === this.factoryId
        )
        .map((factory) => ({
          ...factory,
          operators: factory.operators.filter((operator) =>
            operator.name.toLowerCase().includes(search)
          ),
        }))
    },
  },
  mounted() {
    this.refresh()
    this.refreshTimer = setInterval(() => {
      if (!document.hidden && !this.loading) this.refresh()
    }, 30000)
    window.addEventListener('focus', this.refresh)
  },
  beforeDestroy() {
    clearInterval(this.refreshTimer)
    window.removeEventListener('focus', this.refresh)
  },
  methods: {
    async refresh() {
      this.loading = true
      this.error = ''
      try {
        const { data } = await this.$axios.get('/api/task-workload')
        this.factories = data.factories || []
      } catch (error) {
        this.error = error.response?.data?.message || this.t.loadFailed
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
