<template>
  <div
    class="flex flex-col lg:flex-row gap-5 mb-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5"
  >
    <div class="flex-1 space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Պատվերներ
        </h1>
      </div>

      <!-- Ֆիլտրերի տող -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Search -->
        <input
          v-model="localFilters.search"
          type="text"
          placeholder="Որոնել..."
          class="input-style"
        />

        <!-- Factory status -->
        <select v-model="localFilters.factoryStatus" class="input-style">
          <option :value="null">Գործարանի ստատուսները</option>
          <option
            v-for="(status, index) in factoryStatuses"
            :key="index"
            :value="status.value"
          >
            {{ status.label }}
          </option>
        </select>

        <!-- ՕՊԵՐԱՏՈՐ -->
        <select v-model="localFilters.operatorId" class="input-style">
          <option :value="null">Բոլոր օպերատորները</option>
          <option v-for="op in operators" :key="op.id" :value="op.id">
            {{ op.name }}
            <span v-if="op.factory_name"> — {{ op.factory_name }}</span>
          </option>
        </select>

        <!-- Time Range -->
        <select v-model="localFilters.timeRange" class="input-style">
          <option :value="null">Բոլոր ժամկետները</option>
          <option value="today">Այսօր</option>
          <option value="tomorrow">Վաղը</option>
          <option value="this_week">Այս շաբաթ</option>
          <option value="overdue">Ժամկետն անցած</option>
          <option value="no_deadline">Առանց ժամկետի</option>
        </select>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400">
        Ընդհանուր՝ <strong>{{ total }}</strong>
        <span v-if="filtered < total">
          | Ցուցադրվում է՝ <strong>{{ filtered }}</strong></span
        >
      </p>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.last_page > 1" class="flex items-end">
      <Pagination :meta="pagination" @change="$emit('change-page', $event)" />
    </div>
  </div>
</template>

<script>
import Pagination from '~/components/ui/Pagination.vue'

export default {
  components: { Pagination },

  props: {
    total: Number,
    filtered: Number,
    pagination: Object,
    // eslint-disable-next-line vue/require-default-prop
    selectedFactory: Object,
    operators: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      localFilters: {
        search: '',
        overallStatus: null,
        operatorId: null,
        timeRange: null,
        factoryStatus: null,
      },
      factoryStatuses: [],
      localFactory: this.selectedFactory || null,
    }
  },

  watch: {
    localFilters: {
      deep: true,
      handler() {
        this.$emit('update:filters', { ...this.localFilters })
      },
    },

    localFactory(val) {
      this.$emit('update:factory', val)
    },

    selectedFactory: {
      immediate: true,
      handler(val) {
        this.localFactory = val || null
        this.localFilters.operatorId = null
      },
    },
  },

  async mounted() {
    await this.fetchFactoryStatuses()
  },

  methods: {
    async fetchFactoryStatuses() {
      try {
        const res = await this.$axios.get(
          '/api/factories/factory-order-filters'
        )
        this.factoryStatuses = res.data
      } catch (e) {
        console.error('Failed to load factory statuses', e)
      }
    },
  },
}
</script>

<style scoped>
.input-style {
  @apply rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition;
}
</style>
