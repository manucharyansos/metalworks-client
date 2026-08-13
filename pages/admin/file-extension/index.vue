<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">File policy</p>
          <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Ֆայլերի տեսակներ</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Կառավարեք յուրաքանչյուր արտադրամասի թույլատրելի ֆայլերի format-ները առանձին։ Factory-ի ցուցակում արված փոփոխությունը անմիջապես կիրառվում է PMP upload validation-ի վրա։
          </p>
        </div>

        <label class="relative block w-full xl:w-80">
          <span class="sr-only">Փնտրել արտադրամաս</span>
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
          </svg>
          <input
            v-model="factorySearch"
            type="search"
            class="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            placeholder="Փնտրել factory անունով կամ code-ով"
          />
        </label>
      </section>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="metric-card">
          <p class="metric-label">Արտադրամասեր</p>
          <p class="metric-value">{{ factoryGroups.length }}</p>
          <p class="metric-note">բոլորը տեսանելի են այստեղ</p>
        </div>
        <div class="metric-card">
          <p class="metric-label">Կարգավորված</p>
          <p class="metric-value">{{ configuredFactoriesCount }}/{{ factoryGroups.length }}</p>
          <p class="metric-note">առնվազն մեկ format</p>
        </div>
        <div class="metric-card">
          <p class="metric-label">Factory format-ներ</p>
          <p class="metric-value">{{ totalFactoryExtensions }}</p>
          <p class="metric-note">բոլոր արտադրամասերում</p>
        </div>
        <div class="metric-card">
          <p class="metric-label">Ընդհանուր պատվեր</p>
          <p class="metric-value">{{ globalExtensions.length }}</p>
          <p class="metric-note">factory-ից անկախ</p>
        </div>
      </section>

      <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Factory formats</p>
            <h2 class="mt-1 text-lg font-black text-slate-950 dark:text-white">Արտադրամասերի format-ներ</h2>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ filteredFactories.length }} արտադրամաս
          </p>
        </div>

        <div v-if="loading" class="grid gap-4 pt-5 md:grid-cols-2 2xl:grid-cols-3">
          <div v-for="n in 6" :key="n" class="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"></div>
        </div>

        <div v-else-if="filteredFactories.length" class="grid gap-4 pt-5 md:grid-cols-2 2xl:grid-cols-3">
          <div v-for="factory in filteredFactories" :key="factory.id" class="min-w-0">
            <div class="mb-2 flex items-center justify-between gap-3 px-1">
              <div class="min-w-0">
                <p class="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{{ factory.name }}</p>
                <p class="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{{ factory.value || `Factory #${factory.id}` }}</p>
              </div>
              <span
                class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
                :class="factory.extensions.length ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'"
              >
                {{ factory.extensions.length ? `${factory.extensions.length} format` : 'Format չկա' }}
              </span>
            </div>

            <FileExtension
              :extensions="factory.extensions"
              :paragraph="`${factory.name} (${factory.value || factory.id})`"
              @update-extension="updateFactoryExtension(factory, $event)"
              @delete-extension="deleteFactoryExtension(factory, $event)"
            >
              <template #custom>
                <div class="flex w-full gap-2">
                  <div class="relative min-w-0 flex-1">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">.</span>
                    <input
                      :value="newFactoryExtensions[factory.id] || ''"
                      class="format-input"
                      placeholder="dxf"
                      :disabled="savingFactoryId === factory.id"
                      @input="setFactoryDraft(factory.id, $event.target.value)"
                      @keyup.enter="addFactoryExtension(factory)"
                    />
                  </div>
                  <button
                    class="add-btn"
                    :disabled="savingFactoryId === factory.id || !normalize(newFactoryExtensions[factory.id]).length"
                    @click="addFactoryExtension(factory)"
                  >
                    {{ savingFactoryId === factory.id ? '...' : 'Ավելացնել' }}
                  </button>
                </div>
              </template>
            </FileExtension>
          </div>
        </div>

        <div v-else class="mt-5 rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400 dark:border-slate-800">
          Այս որոնմամբ արտադրամաս չի գտնվել։
        </div>
      </section>

      <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div class="mb-4">
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Global order formats</p>
          <h2 class="mt-1 text-lg font-black text-slate-950 dark:text-white">Ընդհանուր պատվերի format-ներ</h2>
          <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Այս ցուցակը պահվում է առանձին՝ այն ֆայլերի համար, որոնք կապված չեն կոնկրետ արտադրամասի PMP upload-ի հետ։
          </p>
        </div>

        <div class="max-w-2xl">
          <FileExtension
            :extensions="globalExtensions"
            paragraph="Factory-ից անկախ ընդհանուր թույլատրելի format-ներ"
            @update-extension="updateGlobalExtension"
            @delete-extension="deleteGlobalExtension"
          >
            <template #custom>
              <div class="flex w-full gap-2">
                <div class="relative min-w-0 flex-1">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">.</span>
                  <input v-model="newGlobalExtension" class="format-input" placeholder="jpg" @keyup.enter="addGlobalExtension" />
                </div>
                <button class="add-btn" :disabled="!normalize(newGlobalExtension)" @click="addGlobalExtension">Ավելացնել</button>
              </div>
            </template>
          </FileExtension>
        </div>
      </section>

      <section class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800 dark:border-amber-950/60 dark:bg-amber-950/20 dark:text-amber-200">
        <strong>Անվտանգության նշում.</strong> Executable/active-web format-ները server-ի global security middleware-ը շարունակում է արգելել՝ անկախ այս կարգավորումներից։ Եթե որևէ factory-ի ցուցակը դատարկ է, այդ factory-ի PMP upload-ը ֆայլ չի ընդունի մինչև format ավելացվի։
      </section>

      <notifications />
    </div>
  </main>
</template>

<script>
import FileExtension from '~/components/File/FileExtension/index.vue'

export default {
  components: { FileExtension },
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },

  data() {
    return {
      loading: true,
      factorySearch: '',
      factoryGroups: [],
      globalExtensions: [],
      newFactoryExtensions: {},
      newGlobalExtension: '',
      savingFactoryId: null,
    }
  },

  computed: {
    filteredFactories() {
      const query = this.factorySearch.trim().toLowerCase()
      if (!query) return this.factoryGroups

      return this.factoryGroups.filter((factory) => {
        return [factory.name, factory.value, String(factory.id)]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      })
    },
    configuredFactoriesCount() {
      return this.factoryGroups.filter((factory) => factory.extensions.length > 0).length
    },
    totalFactoryExtensions() {
      return this.factoryGroups.reduce((total, factory) => total + factory.extensions.length, 0)
    },
  },

  mounted() {
    this.refreshAll()
  },

  methods: {
    normalize(value) {
      return String(value || '').trim().replace(/^\./, '').toLowerCase()
    },
    setFactoryDraft(factoryId, value) {
      this.$set(this.newFactoryExtensions, factoryId, value)
    },
    notifySuccess(text) {
      this.$notify({ text, duration: 2500, position: 'top', type: 'success' })
    },
    notifyError(error, fallback = 'Գործողությունը չհաջողվեց։') {
      const data = error?.response?.data
      const validation = data?.errors ? Object.values(data.errors).flat()[0] : null
      this.$notify({
        text: validation || data?.message || fallback,
        duration: 3500,
        position: 'top',
        type: 'error',
      })
    },
    async refreshAll() {
      this.loading = true
      try {
        await Promise.all([this.fetchFactoryExtensions(), this.fetchGlobalExtensions()])
      } finally {
        this.loading = false
      }
    },
    async fetchFactoryExtensions() {
      const response = await this.$axios.get('/api/admin/factory-file-extensions')
      this.factoryGroups = Array.isArray(response.data?.data) ? response.data.data : []

      this.factoryGroups.forEach((factory) => {
        if (!Object.prototype.hasOwnProperty.call(this.newFactoryExtensions, factory.id)) {
          this.$set(this.newFactoryExtensions, factory.id, '')
        }
        if (!Array.isArray(factory.extensions)) {
          this.$set(factory, 'extensions', [])
        }
      })
    },
    async fetchGlobalExtensions() {
      const response = await this.$axios.get('/api/admin/file-extensions')
      this.globalExtensions = Array.isArray(response.data) ? response.data : []
    },
    async addFactoryExtension(factory) {
      const extension = this.normalize(this.newFactoryExtensions[factory.id])
      if (!extension || this.savingFactoryId === factory.id) return

      this.savingFactoryId = factory.id
      try {
        await this.$axios.post('/api/admin/factory-file-extensions', {
          factory_id: factory.id,
          extension,
        })
        this.$set(this.newFactoryExtensions, factory.id, '')
        await this.fetchFactoryExtensions()
        this.notifySuccess(`${factory.name} արտադրամասի .${extension} format-ը ավելացվեց։`)
      } catch (error) {
        this.notifyError(error, 'Factory format-ը չհաջողվեց ավելացնել։')
      } finally {
        this.savingFactoryId = null
      }
    },
    async updateFactoryExtension(factory, { id, value }) {
      const extension = this.normalize(value)
      if (!extension) return

      try {
        await this.$axios.put(`/api/admin/factory-file-extensions/${id}`, { extension })
        await this.fetchFactoryExtensions()
        this.notifySuccess(`${factory.name} արտադրամասի format-ը թարմացվեց։`)
      } catch (error) {
        this.notifyError(error, 'Factory format-ը չհաջողվեց թարմացնել։')
      }
    },
    async deleteFactoryExtension(factory, id) {
      try {
        await this.$axios.delete(`/api/admin/factory-file-extensions/${id}`)
        await this.fetchFactoryExtensions()
        this.notifySuccess(`${factory.name} արտադրամասի format-ը հեռացվեց։`)
      } catch (error) {
        this.notifyError(error, 'Factory format-ը չհաջողվեց հեռացնել։')
      }
    },
    async addGlobalExtension() {
      const extension = this.normalize(this.newGlobalExtension)
      if (!extension) return

      try {
        await this.$axios.post('/api/admin/file-extensions', { extension })
        this.newGlobalExtension = ''
        await this.fetchGlobalExtensions()
        this.notifySuccess(`Ընդհանուր .${extension} format-ը ավելացվեց։`)
      } catch (error) {
        this.notifyError(error, 'Ընդհանուր format-ը չհաջողվեց ավելացնել։')
      }
    },
    async updateGlobalExtension({ id, value }) {
      const extension = this.normalize(value)
      if (!extension) return

      try {
        await this.$axios.put(`/api/admin/file-extensions/${id}`, { extension })
        await this.fetchGlobalExtensions()
        this.notifySuccess('Ընդհանուր format-ը թարմացվեց։')
      } catch (error) {
        this.notifyError(error, 'Ընդհանուր format-ը չհաջողվեց թարմացնել։')
      }
    },
    async deleteGlobalExtension(id) {
      try {
        await this.$axios.delete(`/api/admin/file-extensions/${id}`)
        await this.fetchGlobalExtensions()
        this.notifySuccess('Ընդհանուր format-ը հեռացվեց։')
      } catch (error) {
        this.notifyError(error, 'Ընդհանուր format-ը չհաջողվեց հեռացնել։')
      }
    },
  },
}
</script>

<style scoped>
.metric-card {
  @apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900;
}
.metric-label {
  @apply text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400;
}
.metric-value {
  @apply mt-2 text-2xl font-black text-slate-950 dark:text-white;
}
.metric-note {
  @apply mt-1 text-[11px] text-slate-500 dark:text-slate-400;
}
.format-input {
  @apply w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-6 pr-3 font-mono text-xs font-bold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200;
}
.add-btn {
  @apply shrink-0 rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200;
}
</style>
