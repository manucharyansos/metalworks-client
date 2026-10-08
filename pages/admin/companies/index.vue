<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div><h1 class="text-2xl font-bold">{{ t.title }}</h1><p class="mt-2 max-w-xl text-sm leading-6 text-slate-500">{{ t.description }}</p></div>
        <button class="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950" @click="open(null)">+ {{ t.add }}</button>
      </div>
      <p v-if="error" role="alert" class="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{{ error }}</p>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="company in companies" :key="company.id" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center gap-3">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-1">
              <img v-if="logo(company)" :src="logo(company)" :alt="company.name" class="h-full w-full object-contain" />
              <span v-else class="text-lg font-bold text-slate-700">{{ company.name.slice(0, 2).toUpperCase() }}</span>
            </div>
            <div class="min-w-0"><h2 class="break-words font-bold">{{ company.name }}</h2><span class="mt-1 inline-block text-xs" :class="company.is_active ? 'text-emerald-600' : 'text-slate-400'">{{ company.is_active ? t.active : t.inactive }}</span></div>
          </div>
          <div class="mt-5 flex flex-wrap gap-2">
            <button class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700" @click="open(company)">{{ t.edit }}</button>
            <button v-if="company.is_active && String(company.id) !== String(currentId)" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold dark:bg-slate-800" @click="$workspace.switchCompany(company.id)">{{ t.select }}</button>
          </div>
        </article>
      </div>
      <p v-if="!loading && !companies.length" class="text-sm text-slate-500">{{ t.empty }}</p>
    </div>
    <div v-if="formOpen" class="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 p-4" @click.self="close">
      <form class="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900" @submit.prevent="save">
        <h2 class="text-xl font-bold">{{ editing ? t.edit : t.add }}</h2>
        <label class="block text-sm">{{ t.name }}<input v-model.trim="form.name" required maxlength="255" class="field mt-1" /></label>
        <label class="block text-sm">{{ t.logo }}<input type="file" accept="image/png,image/jpeg,image/webp" class="mt-2 block w-full text-xs" @change="chooseLogo" /></label>
        <p class="text-xs text-slate-500">{{ t.logoHint }}</p>
        <img v-if="preview" :src="preview" :alt="form.name" class="h-20 w-20 rounded-xl bg-white object-contain p-1" />
        <label v-if="editing" class="flex items-center gap-2 text-sm"><input v-model="form.is_active" type="checkbox" :disabled="String(editing.id) === String(currentId)" />{{ t.active }}</label>
        <p v-else class="text-xs leading-5 text-slate-500">{{ t.newHint }}</p>
        <p v-if="formError" role="alert" class="text-sm text-rose-600">{{ formError }}</p>
        <div class="flex justify-end gap-3">
          <button type="button" class="rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700" :disabled="saving" @click="close">{{ t.cancel }}</button>
          <button type="submit" :disabled="saving" class="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950">{{ saving ? t.saving : t.save }}</button>
        </div>
      </form>
    </div>
  </main>
</template>
<script>
import { workspaceCopy } from '~/utils/company-copy'
export default {
  layout: 'admin', middleware: ['role-guard'], meta: { role: 'admin' },
  data() { return { companies: [], loading: true, error: '', formOpen: false, editing: null, form: { name: '', slug: '', is_active: true }, image: null, preview: '', formError: '', saving: false } },
  computed: {
    t() { return workspaceCopy(this.$i18n?.locale) },
    currentId() { return this.$auth.user?.company?.id },
  },
  async mounted() {
    if (!this.$auth.user?.is_platform_admin) { await this.$router.replace(this.localePath('/admin')); return }
    await this.load()
  },
  beforeDestroy() { this.releasePreview() },
  methods: {
    logo(company) {
      if (company.logo) return /^https?:\/\//i.test(company.logo) ? company.logo : `${String(this.$axios.defaults.baseURL).replace(/\/+$/, '')}${company.logo}`
      return company.slug === 'metalworks' ? `${this.$router.options.base || '/'}logo.png` : null
    },
    async load() {
      this.loading = true
      try { const data = await this.$axios.$get('/api/companies'); this.companies = data.companies || [] }
      catch (_) { this.error = this.t.error }
      finally { this.loading = false }
    },
    releasePreview() { if (this.preview.startsWith('blob:')) URL.revokeObjectURL(this.preview); this.preview = '' },
    open(company) {
      this.releasePreview(); this.editing = company; this.image = null; this.formError = ''
      this.form = company ? { name: company.name, slug: company.slug, is_active: company.is_active } : { name: '', slug: `company-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`, is_active: true }
      this.preview = company ? this.logo(company) || '' : ''; this.formOpen = true
    },
    close() { if (this.saving) return; this.formOpen = false; this.releasePreview(); this.$workspace.setDirty(false) },
    chooseLogo(event) {
      this.releasePreview(); this.image = event.target.files[0] || null
      if (this.image && this.image.size > 2 * 1024 * 1024) { this.formError = this.t.logoHint; this.image = null; event.target.value = ''; return }
      this.formError = ''; if (this.image) this.preview = URL.createObjectURL(this.image)
    },
    async save() {
      if (this.saving) return
      this.saving = true; this.formError = ''
      const payload = new FormData()
      payload.append('name', this.form.name); payload.append('slug', this.form.slug.toLowerCase())
      if (this.image) payload.append('logo', this.image)
      if (this.editing) { payload.append('_method', 'PUT'); payload.append('is_active', this.form.is_active ? '1' : '0') }
      try {
        await this.$axios.$post(this.editing ? `/api/companies/${this.editing.id}` : '/api/companies', payload)
        await this.$auth.fetchUser(); await this.load()
        this.saving = false; this.close()
      } catch (error) { this.formError = Object.values(error.response?.data?.errors || {}).flat().join(' ') || this.t.error }
      finally { this.saving = false }
    },
  },
}
</script>
<style scoped>.field { @apply w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white; }</style>
