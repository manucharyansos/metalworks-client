<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <WorkspaceTransition />
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
      @click="closeSidebar"
    ></div>

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950/95 lg:translate-x-0 lg:shadow-none"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      :aria-label="$t('admin_layout.navigation')"
    >
      <div class="flex min-h-20 items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-900">
        <nuxt-link :to="localePath('/admin')" class="flex min-w-0 flex-1 items-center gap-3" @click.native="closeSidebar">
          <WorkspaceIdentity class="min-w-0 flex-1" />
        </nuxt-link>
        <button
          type="button"
          class="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white lg:hidden"
          :aria-label="$t('admin_layout.close_navigation')"
          @click="closeSidebar"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <CompanySelector />
      <nav class="flex-1 overflow-y-auto px-4 py-5">
        <p class="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {{ $t('admin_layout.management') }}
        </p>
        <div class="space-y-1">
          <nuxt-link
            v-for="item in navigation"
            :key="item.to"
            :to="localePath(item.to)"
            :exact="item.exact"
            class="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
            active-class="!bg-slate-950 !text-white shadow-sm dark:!bg-white dark:!text-slate-950"
            @click.native="closeSidebar"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500 transition group-hover:bg-white dark:bg-slate-900 dark:text-slate-300 dark:group-hover:bg-slate-800">
              {{ item.short }}
            </span>
            <span class="min-w-0 flex-1 truncate">{{ navigationLabel(item) }}</span>
          </nuxt-link>
        </div>
      </nav>

      <div class="border-t border-slate-100 p-4 dark:border-slate-900">
        <nuxt-link
          :to="localePath('/profile')"
          class="mb-2 flex items-center gap-3 rounded-2xl p-3 transition hover:bg-slate-100 dark:hover:bg-slate-900"
          @click.native="closeSidebar"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <WorkspaceSettingsIcon class="h-5 w-5 shrink-0" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">{{ $t('profile.settings') }}</p>
            <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ $t('admin_layout.account_settings') }}</p>
          </div>
        </nuxt-link>
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
          @click="logout"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3H9m9.75 0-3-3m3 3-3 3" />
          </svg>
          {{ $t('logout') }}
        </button>
      </div>
    </aside>

    <div class="min-h-screen lg:pl-72">
      <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div class="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              class="shrink-0 rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 lg:hidden"
              :aria-label="$t('admin_layout.open_navigation')"
              @click="toggleSidebar"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">{{ pageTitle }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <div data-language-switcher class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <language-dropdown />
            </div>
          </div>
        </div>
      </header>

      <Nuxt />
    </div>
  </div>
</template>

<script>
import WorkspaceIdentity from '@/components/layout/WorkspaceIdentity.vue'
import CompanySelector from '@/components/layout/CompanySelector.vue'
import WorkspaceTransition from '@/components/layout/WorkspaceTransition.vue'
import WorkspaceSettingsIcon from '@/components/layout/WorkspaceSettingsIcon.vue'
import { isWorkspaceRouteActive } from '@/utils/workspace-route'

export default {
  components: { WorkspaceIdentity, WorkspaceSettingsIcon, CompanySelector, WorkspaceTransition },
  middleware: ['role-guard'],
  meta: { role: 'admin' },
  data() {
    return {
      isSidebarOpen: false,
      navigation: [
        { to: '/admin', labelKey: 'admin_layout.dashboard', short: '01', exact: true },
        { to: '/admin/reports', labelKey: 'admin_layout.reports', short: '02', exact: false },
        { to: '/admin/workload', labelKey: 'admin_layout.workload', short: '03', exact: false },
        { to: '/admin/activity', label: { hy: 'Աշխատակիցների գործունեություն', ru: 'Активность сотрудников', en: 'Employee activity' }, short: '04', exact: false },
        { to: '/admin/users', label: { hy: 'Աշխատակիցների իրավունքներ', ru: 'Права сотрудников', en: 'Employee permissions' }, short: '05', exact: false },
        { to: '/admin/workers', label: { hy: 'Աշխատակիցներ', ru: 'Сотрудники', en: 'Employees' }, short: '06', exact: false },
        { to: '/admin/file-extension', labelKey: 'admin_layout.file_types', short: '07', exact: false },
      ],
    }
  },
  computed: {
    locale() {
      const code = String(this.$i18n?.locale || 'hy').toLowerCase().split('-')[0]
      return ['hy', 'ru', 'en'].includes(code) ? code : 'hy'
    },
    pageTitle() {
      const path = this.$route.path
      const item = this.navigation.find((entry) =>
        isWorkspaceRouteActive(path, entry)
      )
      return item ? this.navigationLabel(item) : this.$t('admin_layout.dashboard')
    },
  },
  watch: {
    '$route.fullPath'() {
      this.closeSidebar()
    },
  },
  methods: {
    navigationLabel(item) {
      if (item.label) return item.label[this.locale] || item.label.hy
      return this.$t(item.labelKey)
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },
    closeSidebar() {
      this.isSidebarOpen = false
    },
    async logout() {
      await this.$auth.logout()
    },
  },
}
</script>
