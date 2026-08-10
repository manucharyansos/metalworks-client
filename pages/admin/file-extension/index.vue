<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section>
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">File policy</p>
        <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Ֆայլերի տեսակներ</h1>
        <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Կառավարեք լազերի, ճկման և ընդհանուր պատվերների համար թույլատրելի format-ները։ Փոփոխությունները ազդում են upload validation-ի վրա։
        </p>
      </section>

      <section class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Laser formats</p>
          <p class="mt-2 text-2xl font-black text-slate-950 dark:text-white">{{ laserExtensions.length }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Bend formats</p>
          <p class="mt-2 text-2xl font-black text-slate-950 dark:text-white">{{ bendExtensions.length }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Order formats</p>
          <p class="mt-2 text-2xl font-black text-slate-950 dark:text-white">{{ extensions.length }}</p>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <FileExtension
          :extensions="laserExtensions"
          paragraph="Լազերային մշակման թույլատրելի format-ներ"
          @update-extension="updateLaserExtension"
          @delete-extension="deleteLaserExtension"
        >
          <template #custom>
            <div class="flex w-full gap-2">
              <div class="relative min-w-0 flex-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">.</span>
                <input v-model="newLaserExtension" class="format-input" placeholder="dxf" @keyup.enter="addLaserFileExtension" />
              </div>
              <button class="add-btn" :disabled="!newLaserExtension.trim()" @click="addLaserFileExtension">Ավելացնել</button>
            </div>
          </template>
        </FileExtension>

        <FileExtension
          :extensions="bendExtensions"
          paragraph="Ճկման թույլատրելի format-ներ"
          @update-extension="updateBendExtension"
          @delete-extension="deleteBendExtension"
        >
          <template #custom>
            <div class="flex w-full gap-2">
              <div class="relative min-w-0 flex-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">.</span>
                <input v-model="newBendExtension" class="format-input" placeholder="pdf" @keyup.enter="addBendFileExtension" />
              </div>
              <button class="add-btn" :disabled="!newBendExtension.trim()" @click="addBendFileExtension">Ավելացնել</button>
            </div>
          </template>
        </FileExtension>

        <FileExtension
          :extensions="extensions"
          paragraph="Ընդհանուր պատվերի թույլատրելի format-ներ"
          @update-extension="updateAllExtension"
          @delete-extension="deleteAllExtension"
        >
          <template #custom>
            <div class="flex w-full gap-2">
              <div class="relative min-w-0 flex-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">.</span>
                <input v-model="newExtension" class="format-input" placeholder="jpg" @keyup.enter="addAllFileExtension" />
              </div>
              <button class="add-btn" :disabled="!newExtension.trim()" @click="addAllFileExtension">Ավելացնել</button>
            </div>
          </template>
        </FileExtension>
      </section>

      <section class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800 dark:border-amber-950/60 dark:bg-amber-950/20 dark:text-amber-200">
        <strong>Անվտանգության նշում.</strong> Executable/active-web format-ները server-ի global security middleware-ը շարունակում է արգելել, նույնիսկ եթե սխալմամբ որևէ ցուցակում ավելացվեն։
      </section>

      <notifications />
    </div>
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import FileExtension from '~/components/File/FileExtension/index.vue'

export default {
  components: { FileExtension },
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
  data() {
    return {
      newLaserExtension: '',
      newBendExtension: '',
      newExtension: '',
    }
  },
  computed: {
    ...mapGetters('fileExtension/laser', ['getLaserExtensions']),
    ...mapGetters('fileExtension/bend', ['getBendExtensions']),
    ...mapGetters('fileExtension', ['getExtensions']),
    laserExtensions() { return this.getLaserExtensions || [] },
    bendExtensions() { return this.getBendExtensions || [] },
    extensions() { return this.getExtensions || [] },
  },
  mounted() {
    this.refreshAll()
  },
  methods: {
    ...mapActions('fileExtension/laser', ['fetchLaserFileExtensions', 'createLaserFileExtension', 'updateLaserFileExtension', 'deleteLaserFileExtension']),
    ...mapActions('fileExtension/bend', ['fetchBendFileExtensions', 'createBendFileExtension', 'updateBendFileExtension', 'deleteBendFileExtension']),
    ...mapActions('fileExtension', ['createFileExtension', 'updateFileExtension', 'deleteFileExtension', 'fetchFileExtensions']),
    normalize(value) {
      return String(value || '').trim().replace(/^\./, '').toLowerCase()
    },
    async refreshAll() {
      await Promise.all([this.fetchLaserFileExtensions(), this.fetchBendFileExtensions(), this.fetchFileExtensions()])
    },
    notifySuccess(text) {
      this.$notify({ text, duration: 2500, position: 'top', type: 'success' })
    },
    async addLaserFileExtension() {
      const extension = this.normalize(this.newLaserExtension)
      if (!extension) return
      await this.createLaserFileExtension({ extension })
      this.newLaserExtension = ''
      await this.fetchLaserFileExtensions()
      this.notifySuccess('Լազերի format-ը ավելացվեց։')
    },
    async addBendFileExtension() {
      const extension = this.normalize(this.newBendExtension)
      if (!extension) return
      await this.createBendFileExtension({ extension })
      this.newBendExtension = ''
      await this.fetchBendFileExtensions()
      this.notifySuccess('Ճկման format-ը ավելացվեց։')
    },
    async addAllFileExtension() {
      const extension = this.normalize(this.newExtension)
      if (!extension) return
      await this.createFileExtension({ extension })
      this.newExtension = ''
      await this.fetchFileExtensions()
      this.notifySuccess('Ընդհանուր format-ը ավելացվեց։')
    },
    async updateLaserExtension({ id, value }) {
      const success = await this.updateLaserFileExtension({ id, extension: this.normalize(value) })
      if (success) {
        await this.fetchLaserFileExtensions()
        this.notifySuccess('Լազերի format-ը թարմացվեց։')
      }
    },
    async updateBendExtension({ id, value }) {
      const success = await this.updateBendFileExtension({ id, extension: this.normalize(value) })
      if (success) {
        await this.fetchBendFileExtensions()
        this.notifySuccess('Ճկման format-ը թարմացվեց։')
      }
    },
    async updateAllExtension({ id, value }) {
      const success = await this.updateFileExtension({ id, extension: this.normalize(value) })
      if (success) {
        await this.fetchFileExtensions()
        this.notifySuccess('Ընդհանուր format-ը թարմացվեց։')
      }
    },
    async deleteLaserExtension(id) {
      await this.deleteLaserFileExtension(id)
      await this.fetchLaserFileExtensions()
    },
    async deleteBendExtension(id) {
      await this.deleteBendFileExtension(id)
      await this.fetchBendFileExtensions()
    },
    async deleteAllExtension(id) {
      await this.deleteFileExtension(id)
      await this.fetchFileExtensions()
    },
  },
}
</script>

<style scoped>
.format-input {
  @apply w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-6 pr-3 font-mono text-xs font-bold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200;
}
.add-btn {
  @apply shrink-0 rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200;
}
</style>
