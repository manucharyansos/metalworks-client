<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div v-if="isSidebarOpen" class="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm lg:hidden" @click="closeSidebar"></div>

    <aside class="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 lg:shadow-none" :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'">
      <div class="flex h-20 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
        <nuxt-link :to="localePath(dashboardPath)" class="flex min-w-0 items-center gap-3" @click.native="closeSidebar">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">MW</div>
          <WorkspaceIdentity />
        </nuxt-link>
        <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800" :aria-label="$t('workspace_layout.close_navigation')" @click="closeSidebar"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18 18 6M6 6l12 12" /></svg></button>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-5">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p class="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">{{ roleTitle }}</p>
          <p class="mt-2 text-sm font-black text-slate-900 dark:text-white">{{ currentUser.factory?.name || factoryLabel }}</p>
          <p class="mt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-400">{{ workspaceDescription }}</p>
        </div>

        <p class="mt-6 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{{ $t('workspace_layout.work_sections') }}</p>
        <nav class="mt-3 space-y-1.5">
          <nuxt-link :to="localePath(dashboardPath)" class="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" active-class="!bg-slate-950 !text-white shadow-sm dark:!bg-white dark:!text-slate-950" @click.native="closeSidebar">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-white dark:bg-slate-800 dark:text-slate-300"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 20V9l5-3v4l5-3v4l6-3v12H4Zm4 0v-4h3v4m3 0v-5h3v5" /></svg></span>
            <span class="min-w-0 flex-1">{{ $t('workspace_layout.workshop_orders') }}</span>
            <svg v-if="!$can('factory.view')" class="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 17v.01M8 10V8a4 4 0 118 0v2m-9 0h10v9H7v-9Z" /></svg>
          </nuxt-link>

          <nuxt-link :to="localePath('/profile')" class="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" active-class="!bg-slate-950 !text-white shadow-sm dark:!bg-white dark:!text-slate-950" @click.native="closeSidebar">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-white dark:bg-slate-800 dark:text-slate-300"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 21a8 8 0 10-16 0m8-10a4 4 0 100-8 4 4 0 000 8Z" /></svg></span>
            {{ $t('workspace_layout.profile') }}
          </nuxt-link>
        </nav>

        <div class="mt-7 grid grid-cols-2 gap-2">
          <div class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"><p class="text-[9px] font-bold text-slate-400">{{ $t('workspace_layout.files') }}</p><p class="mt-1 text-xs font-black" :class="$can('factory.download') ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-400'">{{ $can('factory.download') ? $t('workspace_layout.allowed') : $t('workspace_layout.blocked') }}</p></div>
          <div class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"><p class="text-[9px] font-bold text-slate-400">{{ $t('workspace_layout.update') }}</p><p class="mt-1 text-xs font-black" :class="$can('factory.order_update') ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-400'">{{ $can('factory.order_update') ? $t('workspace_layout.allowed') : $t('workspace_layout.blocked') }}</p></div>
        </div>
      </div>

      <div class="border-t border-slate-100 p-4 dark:border-slate-800">
        <nuxt-link :to="localePath('/profile')" class="mb-2 flex items-center gap-3 rounded-2xl p-3 transition hover:bg-slate-100 dark:hover:bg-slate-800" @click.native="closeSidebar">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /></svg></div>
          <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold">{{ $t('workspace_layout.settings') }}</p><p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ $t('workspace_layout.account_settings') }}</p></div>
        </nuxt-link>
        <button type="button" class="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-slate-700 dark:text-rose-300 dark:hover:bg-rose-950/20" @click="logout"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10 17l5-5-5-5M15 12H3m8-8h7a2 2 0 012 2v12a2 2 0 01-2 2h-7" /></svg>{{ $t('logout') }}</button>
      </div>
    </aside>

    <div class="min-h-screen lg:pl-72">
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <button type="button" class="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" :aria-label="$t('workspace_layout.open_navigation')" @click="toggleSidebar"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 7h16M4 12h16M4 17h16" /></svg></button>
          <div class="min-w-0"><p class="truncate text-sm font-semibold text-slate-900 dark:text-white">{{ roleTitle }}</p><p class="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">{{ currentUser.factory?.name || factoryLabel }}</p></div>
        </div>
        <div class="flex items-center gap-2">
          <div data-language-switcher class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><language-dropdown /></div>
          <nuxt-link :to="localePath('/profile')" class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /></svg><span class="hidden sm:inline">{{ $t('workspace_layout.settings') }}</span></nuxt-link>
        </div>
      </header>
      <Nuxt />
    </div>
  </div>
</template>

<script>
import WorkspaceIdentity from '@/components/layout/WorkspaceIdentity.vue'

const COPY = {
  hy: { laser: 'Լազերային կտրում', bend: 'Կռում', powder_catting: 'Փոշեներկում', operator: 'Արտադրամաս', workshop: 'Արտադրամաս', description: 'Ձեր հաստիքին և թույլտվություններին համապատասխան աշխատանքային տարածք։' },
  ru: { laser: 'Лазерная резка', bend: 'Гибка', powder_catting: 'Порошковая покраска', operator: 'Цех', workshop: 'Цех', description: 'Рабочая область в соответствии с вашей должностью и разрешениями.' },
  en: { laser: 'Laser cutting', bend: 'Bending', powder_catting: 'Powder coating', operator: 'Workshop', workshop: 'Workshop', description: 'Workspace based on your position and assigned permissions.' },
}

export default {
  name: 'FactoryLayout',
  components: { WorkspaceIdentity },
  data() { return { isSidebarOpen: false } },
  computed: {
    currentUser() { return this.$auth.user || {} },
    roleName() { return this.currentUser?.role?.name || this.currentUser?.role || '' },
    locale() { const code = String(this.$i18n?.locale || 'hy').toLowerCase().split('-')[0]; return ['hy', 'ru', 'en'].includes(code) ? code : 'hy' },
    copy() { return COPY[this.locale] || COPY.hy },
    roleTitle() { return this.copy[this.roleName] || this.copy.workshop },
    workspaceDescription() { return this.copy.description },
    dashboardPath() {
      if (this.roleName === 'bend') return '/factory/bend'
      if (this.roleName === 'laser') return '/factory/laser'
      if (this.roleName === 'powder_catting') return '/factory/powder'
      return '/factory/workspace'
    },
    factoryLabel() { return this.currentUser?.factory?.name || this.copy.workshop },
  },
  watch: { '$route.fullPath'() { this.closeSidebar() } },
  methods: {
    toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen },
    closeSidebar() { this.isSidebarOpen = false },
    async logout() { await this.$auth.logout() },
  },
}
</script>
