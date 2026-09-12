<template>
  <main class="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-6xl space-y-6">
      <section class="relative overflow-hidden rounded-[30px] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div class="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/5 blur-2xl"></div>
        <div class="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-slate-700/30 blur-3xl"></div>

        <div class="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div class="flex min-w-0 items-center gap-4">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-black shadow-inner backdrop-blur sm:h-20 sm:w-20 sm:text-2xl">
              {{ initials }}
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ $t('profile.title') }}</p>
              <h1 class="mt-1 truncate text-2xl font-black tracking-tight sm:text-3xl">{{ profileUser.name || '—' }}</h1>
              <p class="mt-1 truncate text-sm text-slate-400">{{ profileUser.email || '' }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <span class="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
              {{ roleLabel }}
            </span>
            <span v-if="profileUser.factory" class="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
              {{ profileUser.factory.name }}
            </span>
          </div>
        </div>
      </section>

      <nav class="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Profile sections">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="rounded-xl px-4 py-2.5 text-sm font-bold transition"
          :class="activeTab === tab.key ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'"
          @click="selectTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div v-if="loading" class="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 dark:border-slate-700 dark:border-t-white"></div>
        <p class="mt-4 text-sm font-semibold text-slate-400">{{ $t('profile.loading') }}</p>
      </div>

      <template v-else>
        <div v-if="activeTab === 'settings'" class="grid gap-6 lg:grid-cols-2">
          <form class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6" @submit.prevent="saveProfile">
            <div class="mb-6 flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 21a8 8 0 1 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /></svg>
              </div>
              <div>
                <h2 class="text-lg font-black text-slate-950 dark:text-white">{{ $t('profile.personal_data') }}</h2>
                <p class="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{{ $t('profile.personal_data_help') }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <label class="block">
                <span class="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{{ $t('common.name') }}</span>
                <input v-model.trim="form.name" required class="app-control" type="text" />
              </label>
              <label class="block">
                <span class="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{{ $t('common.email') }}</span>
                <input v-model.trim="form.email" required class="app-control" type="email" />
              </label>

              <label v-if="emailChanged" class="block rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <span class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ $t('profile.current_password') }}</span>
                <p class="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">{{ $t('profile.email_change_password_help') }}</p>
                <input v-model="form.current_password" required class="app-control mt-3" type="password" autocomplete="current-password" />
              </label>

              <template v-if="isClient">
                <label class="block">
                  <span class="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{{ $t('common.phone') }}</span>
                  <input v-model.trim="form.client.phone" class="app-control" type="tel" />
                </label>
                <label class="block">
                  <span class="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{{ $t('common.address') }}</span>
                  <input v-model.trim="form.client.address" class="app-control" type="text" />
                </label>
              </template>
            </div>

            <p v-if="profileMessage" class="mt-4 rounded-2xl p-3 text-sm font-semibold" :class="profileError ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200'">
              {{ profileMessage }}
            </p>

            <button :disabled="savingProfile" class="app-button-primary mt-6 w-full" type="submit">
              {{ savingProfile ? $t('profile.saving') : $t('profile.save') }}
            </button>
          </form>

          <form class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6" @submit.prevent="changePassword">
            <div class="mb-6 flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 11V8a4 4 0 1 1 8 0v3m-9 0h10a2 2 0 0 1 2 2v7H5v-7a2 2 0 0 1 2-2Z" /></svg>
              </div>
              <div>
                <h2 class="text-lg font-black text-slate-950 dark:text-white">{{ $t('common.password') }}</h2>
                <p class="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{{ $t('profile.password_help') }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <label class="block">
                <span class="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{{ $t('profile.current_password') }}</span>
                <input v-model="passwordForm.current_password" required class="app-control" type="password" autocomplete="current-password" />
              </label>
              <label class="block">
                <span class="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{{ $t('profile.new_password') }}</span>
                <input v-model="passwordForm.password" required minlength="8" class="app-control" type="password" autocomplete="new-password" />
              </label>
              <label class="block">
                <span class="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{{ $t('profile.confirm_new_password') }}</span>
                <input v-model="passwordForm.password_confirmation" required minlength="8" class="app-control" type="password" autocomplete="new-password" />
              </label>
            </div>

            <p v-if="passwordMessage" class="mt-4 rounded-2xl p-3 text-sm font-semibold" :class="passwordError ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200'">
              {{ passwordMessage }}
            </p>

            <button :disabled="savingPassword" class="app-button-secondary mt-6 w-full" type="submit">
              {{ savingPassword ? $t('profile.changing') : $t('profile.change_password') }}
            </button>
          </form>
        </div>

        <section v-else class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Activity</p>
              <h2 class="mt-1 text-xl font-black text-slate-950 dark:text-white">{{ activityTitle }}</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ activitySubtitle }}</p>
            </div>
            <span class="self-start rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ activityData.total || 0 }}</span>
          </div>

          <div v-if="activityLoading" class="py-12 text-center text-sm font-semibold text-slate-400">{{ $t('profile.loading') }}</div>
          <div v-else-if="!activityData.data || !activityData.data.length" class="rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl dark:bg-slate-800">📋</div>
            <p class="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">{{ $t('profile.no_data') }}</p>
          </div>
          <div v-else class="space-y-3">
            <article v-for="item in activityData.data" :key="activityKey(item)" class="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700">
              <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="font-black text-slate-900 dark:text-white">{{ activityName(item) }}</h3>
                    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ activityStatus(item) }}</span>
                  </div>
                  <p class="mt-1 text-xs font-semibold text-slate-400">{{ activityNumber(item) }}</p>
                  <p v-if="activityDescription(item)" class="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">{{ activityDescription(item) }}</p>
                  <p v-if="activityFactory(item)" class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ $t('profile.factory') }}: {{ activityFactory(item) }}</p>
                  <p v-if="activityFinishDate(item)" class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ $t('profile.finish_date') }}: {{ activityFinishDate(item) }}</p>
                </div>
                <div class="whitespace-nowrap text-xs font-semibold text-slate-400 md:text-right">{{ activityDate(item) }}</div>
              </div>
            </article>
          </div>

          <div v-if="activityData.last_page > 1" class="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button type="button" :disabled="activityData.current_page <= 1" class="app-button-secondary !px-4 !py-2 text-xs" @click="loadActivity(activityData.current_page - 1)">{{ $t('pagination.previous') }}</button>
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ activityData.current_page }} / {{ activityData.last_page }}</span>
            <button type="button" :disabled="activityData.current_page >= activityData.last_page" class="app-button-secondary !px-4 !py-2 text-xs" @click="loadActivity(activityData.current_page + 1)">{{ $t('pagination.next') }}</button>
          </div>
        </section>
      </template>
    </div>
  </main>
</template>

<script>
export default {
  name: 'ProfilePage',
  layout(context) {
    const role = context.$auth?.user?.role?.name
    if (role === 'admin') return 'admin'
    if (role === 'manager') return 'manager'
    if (role === 'engineer') return 'engineer'
    if (['laser', 'bend', 'powder_catting', 'operator'].includes(role)) return 'factory'
    return 'default'
  },
  data() {
    return {
      loading: true,
      activeTab: 'settings',
      profileUser: {},
      capabilities: {},
      form: {
        name: '',
        email: '',
        current_password: '',
        client: { phone: '', address: '' },
      },
      passwordForm: {
        current_password: '',
        password: '',
        password_confirmation: '',
      },
      savingProfile: false,
      savingPassword: false,
      profileMessage: '',
      profileError: false,
      passwordMessage: '',
      passwordError: false,
      activityLoading: false,
      activityData: { data: [], total: 0, current_page: 1, last_page: 1 },
    }
  },
  computed: {
    roleName() {
      return this.profileUser?.role?.name || this.$auth.user?.role?.name || ''
    },
    roleLabel() {
      if (this.$i18n?.locale === 'hy' && this.profileUser?.role?.value) {
        return this.profileUser.role.value
      }
      const labels = {
        admin: 'Admin',
        manager: 'Manager',
        engineer: 'Engineer',
        laser: 'Laser',
        bend: 'Bend',
        powder_catting: 'Powder coating',
        operator: 'Operator',
        authenticatedUser: this.$t('profile.user'),
      }
      return labels[this.roleName] || this.$t('profile.user')
    },
    initials() {
      return (this.profileUser.name || 'U')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
    },
    isClient() {
      return !!this.capabilities.client_orders
    },
    isFactory() {
      return !!this.capabilities.factory_work
    },
    emailChanged() {
      return (
        (this.form.email || '').trim().toLowerCase() !==
        (this.profileUser.email || '').trim().toLowerCase()
      )
    },
    tabs() {
      const result = [{ key: 'settings', label: this.$t('profile.settings') }]
      if (this.isClient) {
        result.push(
          { key: 'current', label: this.$t('profile.current_orders') },
          { key: 'history', label: this.$t('profile.order_history') }
        )
      } else if (this.isFactory) {
        result.push(
          { key: 'current', label: this.$t('profile.current_work') },
          { key: 'history', label: this.$t('profile.completed_work') }
        )
      }
      return result
    },
    activityTitle() {
      if (this.isFactory) {
        return this.activeTab === 'history'
          ? this.$t('profile.completed_work_title')
          : this.$t('profile.current_work_title')
      }
      return this.activeTab === 'history'
        ? this.$t('profile.past_orders_title')
        : this.$t('profile.current_orders_title')
    },
    activitySubtitle() {
      return this.isFactory
        ? this.$t('profile.factory_scope')
        : this.$t('profile.client_scope')
    },
  },
  async mounted() {
    await this.fetchProfile()
  },
  methods: {
    async fetchProfile() {
      this.loading = true
      try {
        const { data } = await this.$axios.get('/api/profile')
        this.profileUser = data.user || {}
        this.capabilities = data.capabilities || {}
        this.form.name = this.profileUser.name || ''
        this.form.email = this.profileUser.email || ''
        this.form.current_password = ''
        this.form.client = {
          phone: this.profileUser.client?.phone || '',
          address: this.profileUser.client?.address || '',
        }
      } finally {
        this.loading = false
      }
    },
    async selectTab(tab) {
      this.activeTab = tab
      if (tab !== 'settings') await this.loadActivity(1)
    },
    async saveProfile() {
      this.savingProfile = true
      this.profileMessage = ''
      this.profileError = false
      try {
        const payload = {
          name: this.form.name,
          email: this.form.email,
        }
        if (this.emailChanged) payload.current_password = this.form.current_password
        if (this.isClient) payload.client = this.form.client

        const { data } = await this.$axios.patch('/api/profile', payload)
        this.profileUser = data.user || this.profileUser
        this.capabilities = data.capabilities || this.capabilities
        this.form.email = this.profileUser.email || this.form.email
        this.form.current_password = ''
        await this.$auth.fetchUser()
        this.profileMessage = this.$t('profile.profile_saved')
      } catch (error) {
        this.profileError = true
        this.profileMessage = error?.response?.data?.message || this.$t('profile.profile_save_failed')
      } finally {
        this.savingProfile = false
      }
    },
    async changePassword() {
      this.passwordMessage = ''
      this.passwordError = false
      if (this.passwordForm.password !== this.passwordForm.password_confirmation) {
        this.passwordError = true
        this.passwordMessage = this.$t('profile.password_mismatch')
        return
      }
      this.savingPassword = true
      try {
        const { data } = await this.$axios.patch('/api/profile/password', this.passwordForm)
        this.passwordMessage = data.message || this.$t('profile.password_changed')
        this.passwordForm = { current_password: '', password: '', password_confirmation: '' }
        try {
          await this.$auth.logout()
        } catch (logoutError) {
          if (typeof this.$auth.reset === 'function') {
            await this.$auth.reset()
          }
        }
        await this.$router.replace(this.localePath('/login'))
      } catch (error) {
        this.passwordError = true
        this.passwordMessage = error?.response?.data?.message || this.$t('profile.password_change_failed')
      } finally {
        this.savingPassword = false
      }
    },
    async loadActivity(page = 1) {
      this.activityLoading = true
      try {
        const endpoint = this.isFactory ? '/api/profile/factory-work' : '/api/profile/orders'
        const { data } = await this.$axios.get(endpoint, {
          params: { scope: this.activeTab, page },
        })
        this.activityData = data
      } catch (error) {
        this.activityData = { data: [], total: 0, current_page: 1, last_page: 1 }
      } finally {
        this.activityLoading = false
      }
    },
    activityOrder(item) {
      return this.isFactory ? item.order || {} : item || {}
    },
    activityKey(item) {
      return this.isFactory ? `factory-${item.id}` : `order-${item.id}`
    },
    activityName(item) {
      const order = this.activityOrder(item)
      return order.name || `${this.$t('profile.order')} #${order.id || item.id}`
    },
    activityStatus(item) {
      return item.status || '—'
    },
    activityNumber(item) {
      const order = this.activityOrder(item)
      const number = order.order_number?.number
      const prefix = order.prefix_code?.code
      return [prefix, number].filter(Boolean).join(' / ') || `ID: ${order.id || item.id}`
    },
    activityDescription(item) {
      return this.activityOrder(item).description || ''
    },
    activityFactory(item) {
      if (this.isFactory) return item.factory?.name || this.profileUser.factory?.name || ''
      const factories = item.factory_orders || []
      return factories.map((fo) => fo.factory?.name).filter(Boolean).join(', ')
    },
    activityFinishDate(item) {
      return this.activityOrder(item).dates?.finish_date || ''
    },
    activityDate(item) {
      const order = this.activityOrder(item)
      return order.created_at || ''
    },
  },
}
</script>
