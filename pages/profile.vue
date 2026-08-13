<template>
  <div class="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto">
      <div class="bg-gray-900 text-white rounded-3xl p-6 md:p-8 shadow-xl">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-2xl font-bold">
              {{ initials }}
            </div>
            <div>
              <p class="text-sm text-gray-400">{{ $t('profile.title') }}</p>
              <h1 class="text-2xl md:text-3xl font-bold">{{ profileUser.name || '—' }}</h1>
              <p class="text-gray-300 mt-1">{{ profileUser.email || '' }}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1.5 rounded-full bg-white/10 text-sm">
              {{ roleLabel }}
            </span>
            <span v-if="profileUser.factory" class="px-3 py-1.5 rounded-full bg-red-600/20 text-red-200 text-sm">
              {{ profileUser.factory.name }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="px-4 py-2.5 rounded-xl font-medium transition"
          :class="activeTab === tab.key ? 'bg-gray-900 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-50'"
          @click="selectTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="loading" class="mt-6 bg-white rounded-3xl p-10 text-center shadow-sm">
        <p class="text-gray-500">{{ $t('profile.loading') }}</p>
      </div>

      <template v-else>
        <div v-if="activeTab === 'settings'" class="mt-6 grid lg:grid-cols-2 gap-6">
          <form class="bg-white rounded-3xl p-6 shadow-sm" @submit.prevent="saveProfile">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900">{{ $t('profile.personal_data') }}</h2>
              <p class="text-sm text-gray-500 mt-1">{{ $t('profile.personal_data_help') }}</p>
            </div>

            <div class="space-y-4">
              <label class="block">
                <span class="text-sm font-medium text-gray-700">{{ $t('common.name') }}</span>
                <input v-model.trim="form.name" required class="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" type="text" />
              </label>
              <label class="block">
                <span class="text-sm font-medium text-gray-700">{{ $t('common.email') }}</span>
                <input v-model.trim="form.email" required class="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" type="email" />
              </label>

              <label v-if="emailChanged" class="block rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <span class="text-sm font-medium text-gray-800">{{ $t('profile.current_password') }}</span>
                <p class="text-xs text-gray-600 mt-1">{{ $t('profile.email_change_password_help') }}</p>
                <input
                  v-model="form.current_password"
                  required
                  class="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  type="password"
                  autocomplete="current-password"
                />
              </label>

              <template v-if="isClient">
                <label class="block">
                  <span class="text-sm font-medium text-gray-700">{{ $t('common.phone') }}</span>
                  <input v-model.trim="form.client.phone" class="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" type="tel" />
                </label>
                <label class="block">
                  <span class="text-sm font-medium text-gray-700">{{ $t('common.address') }}</span>
                  <input v-model.trim="form.client.address" class="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" type="text" />
                </label>
              </template>
            </div>

            <p v-if="profileMessage" class="mt-4 text-sm" :class="profileError ? 'text-red-600' : 'text-green-600'">
              {{ profileMessage }}
            </p>

            <button :disabled="savingProfile" class="mt-6 w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-3 px-4" type="submit">
              {{ savingProfile ? $t('profile.saving') : $t('profile.save') }}
            </button>
          </form>

          <form class="bg-white rounded-3xl p-6 shadow-sm" @submit.prevent="changePassword">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900">{{ $t('common.password') }}</h2>
              <p class="text-sm text-gray-500 mt-1">{{ $t('profile.password_help') }}</p>
            </div>

            <div class="space-y-4">
              <label class="block">
                <span class="text-sm font-medium text-gray-700">{{ $t('profile.current_password') }}</span>
                <input v-model="passwordForm.current_password" required class="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" type="password" autocomplete="current-password" />
              </label>
              <label class="block">
                <span class="text-sm font-medium text-gray-700">{{ $t('profile.new_password') }}</span>
                <input v-model="passwordForm.password" required minlength="8" class="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" type="password" autocomplete="new-password" />
              </label>
              <label class="block">
                <span class="text-sm font-medium text-gray-700">{{ $t('profile.confirm_new_password') }}</span>
                <input v-model="passwordForm.password_confirmation" required minlength="8" class="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" type="password" autocomplete="new-password" />
              </label>
            </div>

            <p v-if="passwordMessage" class="mt-4 text-sm" :class="passwordError ? 'text-red-600' : 'text-green-600'">
              {{ passwordMessage }}
            </p>

            <button :disabled="savingPassword" class="mt-6 w-full rounded-xl bg-gray-900 hover:bg-black disabled:opacity-60 text-white font-semibold py-3 px-4" type="submit">
              {{ savingPassword ? $t('profile.changing') : $t('profile.change_password') }}
            </button>
          </form>
        </div>

        <div v-else class="mt-6">
          <div class="bg-white rounded-3xl p-5 md:p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 class="text-xl font-bold text-gray-900">{{ activityTitle }}</h2>
                <p class="text-sm text-gray-500 mt-1">{{ activitySubtitle }}</p>
              </div>
              <span class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">{{ activityData.total || 0 }}</span>
            </div>

            <div v-if="activityLoading" class="py-12 text-center text-gray-500">{{ $t('profile.loading') }}</div>
            <div v-else-if="!activityData.data || !activityData.data.length" class="py-12 text-center">
              <div class="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">📋</div>
              <p class="mt-3 font-medium text-gray-700">{{ $t('profile.no_data') }}</p>
            </div>
            <div v-else class="space-y-3">
              <article v-for="item in activityData.data" :key="activityKey(item)" class="border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="font-bold text-gray-900">{{ activityName(item) }}</h3>
                      <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{{ activityStatus(item) }}</span>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">{{ activityNumber(item) }}</p>
                    <p v-if="activityDescription(item)" class="text-sm text-gray-700 mt-3 whitespace-pre-line">
                      {{ activityDescription(item) }}
                    </p>
                    <p v-if="activityFactory(item)" class="text-sm text-gray-600 mt-2">
                      {{ $t('profile.factory') }}: {{ activityFactory(item) }}
                    </p>
                    <p v-if="activityFinishDate(item)" class="text-sm text-gray-600 mt-1">
                      {{ $t('profile.finish_date') }}: {{ activityFinishDate(item) }}
                    </p>
                  </div>
                  <div class="text-sm text-gray-500 md:text-right whitespace-nowrap">
                    <p>{{ activityDate(item) }}</p>
                  </div>
                </div>
              </article>
            </div>

            <div v-if="activityData.last_page > 1" class="mt-6 flex items-center justify-center gap-3">
              <button type="button" :disabled="activityData.current_page <= 1" class="px-4 py-2 rounded-xl bg-gray-100 disabled:opacity-40" @click="loadActivity(activityData.current_page - 1)">
                {{ $t('pagination.previous') }}
              </button>
              <span class="text-sm text-gray-600">{{ activityData.current_page }} / {{ activityData.last_page }}</span>
              <button type="button" :disabled="activityData.current_page >= activityData.last_page" class="px-4 py-2 rounded-xl bg-gray-100 disabled:opacity-40" @click="loadActivity(activityData.current_page + 1)">
                {{ $t('pagination.next') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
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