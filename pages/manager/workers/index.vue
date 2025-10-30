<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div
      class="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6"
    >
      <h1 class="text-xl sm:text-2xl font-semibold">Աշխատակիցներ</h1>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Որոնել անուն / email / հեռ."
          class="w-full sm:w-64 rounded-lg border px-3 py-2"
        />
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
          @click="openCreate"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14m-7-7h14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          Նոր աշխատակից
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-700">
          <thead class="text-xs uppercase bg-gray-100">
            <tr>
              <th class="px-6 py-3">Անուն</th>
              <th class="px-6 py-3">Էլ․ փոստ</th>
              <th class="px-6 py-3">Հեռախոս</th>
              <th class="px-6 py-3">Հասցե</th>
              <th class="px-6 py-3 w-32 text-right">Գործողություններ</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in filtered"
              :key="u.id"
              class="bg-white border-b hover:bg-gray-50"
            >
              <td class="px-6 py-3">{{ u.name }}</td>
              <td class="px-6 py-3">{{ u.email || '—' }}</td>
              <td class="px-6 py-3">{{ u?.client?.phone || '—' }}</td>
              <td class="px-6 py-3">{{ u?.client?.address || '—' }}</td>
              <td class="px-6 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    class="px-3 py-1.5 rounded-lg border"
                    @click="openEdit(u)"
                  >
                    Խմբագրել
                  </button>
                  <button
                    class="px-3 py-1.5 rounded-lg border text-red-600 hover:bg-red-50"
                    :disabled="!canDelete"
                    title="Ջնջել"
                    @click="askDelete(u)"
                  >
                    Ջնջել
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!loading && filtered.length === 0">
              <td colspan="5" class="px-6 py-6 text-center text-gray-500">
                Աշխատակից չի գտնվել
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Form Modal -->
    <WorkerFormModal
      :visible="isFormOpen"
      :worker="selectedWorker"
      :roles="roles"
      :submitting="submitting"
      @close="closeForm"
      @submit="handleSubmit"
    />

    <!-- Delete confirm (backend destroy դեռ չունես, կթողնենք skeleton) -->
    <div
      v-if="confirmDelete"
      class="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4"
      @click.self="confirmDelete = null"
    >
      <div class="w-full max-w-md rounded-xl bg-white shadow-xl p-6">
        <h3 class="text-lg font-semibold mb-2">Ջնջե՞լ աշխատակցին</h3>
        <p class="text-gray-600 mb-6">
          Դուք պատրաստվում եք ջնջել «{{ confirmDelete?.name }}» աշխատակցին։
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 rounded-lg border"
            @click="confirmDelete = null"
          >
            Չեղարկել
          </button>
          <button
            class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            :disabled="submitting || !canDelete"
            @click="doDelete"
          >
            {{ submitting ? 'Կատարվում է…' : 'Ջնջել' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import WorkerFormModal from '~/components/users/WorkerFormModal.vue'

export default {
  components: { WorkerFormModal },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
  data() {
    return {
      loading: false,
      workers: [],
      searchQuery: '',
      isFormOpen: false,
      selectedWorker: null,
      submitting: false,
      confirmDelete: null,
    }
  },
  computed: {
    ...mapGetters('roles', ['roles']),
    filtered() {
      const q = (this.searchQuery || '').toLowerCase().trim()
      if (!q) return this.workers
      return this.workers.filter(
        (u) =>
          (u.name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u?.client?.phone || '').toLowerCase().includes(q)
      )
    },
    canDelete() {
      // enable when backend has destroy
      return false
    },
  },
  async mounted() {
    await this.fetchRoles()
    await this.loadWorkers()
  },
  methods: {
    ...mapActions('roles', ['fetchRoles']),
    async loadWorkers() {
      this.loading = true
      try {
        const { data } = await this.$axios.get('/api/workers')
        // controller հիմա վերադարձնում է array; եթե փոխես՝ հարմարեցնիր այստեղ
        this.workers = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : []
      } catch (e) {
        console.error('Failed to fetch workers', e)
      } finally {
        this.loading = false
      }
    },
    openCreate() {
      this.selectedWorker = null
      this.isFormOpen = true
      document.documentElement.classList.add('overflow-hidden')
    },
    openEdit(u) {
      this.selectedWorker = u
      this.isFormOpen = true
      document.documentElement.classList.add('overflow-hidden')
    },
    closeForm() {
      this.isFormOpen = false
      this.selectedWorker = null
      document.documentElement.classList.remove('overflow-hidden')
    },
    async handleSubmit({ payload, isEdit, id }) {
      this.submitting = true
      try {
        if (isEdit) {
          // PUT /api/workers/{id}
          const { data: res } = await this.$axios.put(
            `/api/workers/${id}`,
            payload
          )
          if (!res || res.status === false)
            throw new Error(res?.message || 'Update failed')
        } else {
          // POST /api/workers
          const { data: res } = await this.$axios.post('/api/workers', payload)
          if (!res || res.status === false)
            throw new Error(res?.message || 'Create failed')
        }
        this.closeForm()
        await this.loadWorkers()
      } catch (e) {
        console.error('Submit worker error:', e)
        alert(
          e.response?.data?.message || e.message || 'Սխալ՝ պահպանման ժամանակ'
        )
      } finally {
        this.submitting = false
      }
    },
    askDelete(u) {
      this.confirmDelete = u
    },
    doDelete() {
      this.confirmDelete = null
    },
  },
}
</script>
