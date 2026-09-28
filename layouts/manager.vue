<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div v-if="isSidebarOpen" class="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm lg:hidden" @click="closeSidebar"></div>

    <aside class="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 lg:shadow-none" :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'">
      <div class="flex h-20 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
        <nuxt-link :to="localePath('/manager')" class="flex min-w-0 items-center gap-3" @click.native="closeSidebar"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">MW</div><p class="truncate text-sm font-black tracking-tight">MetalWorks</p></nuxt-link>
        <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800" @click="closeSidebar">✕</button>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-5">
        <p class="px-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{{ $t('workspace_layout.management') }}</p>
        <nav class="mt-3 space-y-1.5">
          <nuxt-link v-for="item in visibleNavItems" :key="item.to" :to="localePath(item.to)" class="nav-item" active-class="!bg-slate-950 !text-white shadow-sm dark:!bg-white dark:!text-slate-950" :exact="item.exact" @click.native="closeSidebar">
            <span class="nav-icon"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="iconPath(item.icon)" /></svg></span><span class="min-w-0 flex-1 truncate">{{ $t(item.labelKey) }}</span>
          </nuxt-link>
        </nav>

        <div class="mt-7">
          <p class="px-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{{ productionTitle }}</p>
          <nav class="mt-3 space-y-1.5">
            <nuxt-link v-for="item in productionItems" :key="item.to" :to="localePath(item.to)" class="nav-item" active-class="!bg-slate-950 !text-white shadow-sm dark:!bg-white dark:!text-slate-950" @click.native="closeSidebar">
              <span class="nav-icon"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 20V9l5-3v4l5-3v4l6-3v12H4Zm4 0v-4h3v4m3 0v-5h3v5" /></svg></span><span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
            </nuxt-link>
          </nav>
        </div>

        <div v-if="quickActions.length" class="mt-7">
          <p class="px-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{{ $t('workspace_layout.quick_actions') }}</p>
          <div class="mt-3 space-y-1.5"><nuxt-link v-for="item in quickActions" :key="item.to" :to="localePath(item.to)" class="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-500 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" @click.native="closeSidebar"><span class="text-base leading-none">+</span>{{ $t(item.labelKey) }}</nuxt-link></div>
        </div>
      </div>

      <div class="border-t border-slate-100 p-4 dark:border-slate-800">
        <nuxt-link :to="localePath('/profile')" class="mb-2 flex items-center gap-3 rounded-2xl p-3 transition hover:bg-slate-100 dark:hover:bg-slate-800" @click.native="closeSidebar"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /></svg></div><div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold">{{ $t('workspace_layout.settings') }}</p><p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ $t('workspace_layout.account_settings') }}</p></div></nuxt-link>
        <button type="button" class="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-slate-700 dark:text-rose-300 dark:hover:bg-rose-950/20" @click="logout">{{ $t('logout') }}</button>
      </div>
    </aside>

    <div class="min-h-screen lg:pl-72">
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3"><button type="button" class="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" @click="toggleSidebar">☰</button><div class="min-w-0"><p class="truncate text-sm font-semibold text-slate-900 dark:text-white">{{ pageTitle }}</p><p class="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">{{ accessSummary }}</p></div></div>
        <div class="flex items-center gap-2"><div data-language-switcher class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><language-dropdown /></div><nuxt-link :to="localePath('/profile')" class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><span class="hidden sm:inline">{{ $t('workspace_layout.settings') }}</span></nuxt-link></div>
      </header>
      <Nuxt />
    </div>
  </div>
</template>

<script>
const PRODUCTION_COPY = {
  hy: { title: 'Արտադրամասեր', laser: 'Լազերային կտրում', bend: 'Կռում', powder: 'Փոշեներկում' },
  ru: { title: 'Цеха', laser: 'Лазерная резка', bend: 'Гибка', powder: 'Порошковая покраска' },
  en: { title: 'Workshops', laser: 'Laser cutting', bend: 'Bending', powder: 'Powder coating' },
}

export default {
  name: 'ManagerLayout',
  data() {
    return {
      isSidebarOpen: false,
      navItems: [
        { to: '/manager', labelKey: 'workspace_layout.orders', permission: 'orders.view', icon: 'orders', exact: true },
        { to: '/manager/clients', labelKey: 'workspace_layout.clients', permission: 'clients.view', icon: 'clients' },
        { to: '/manager/workers', labelKey: 'workspace_layout.employees', permission: 'workers.view', icon: 'workers' },
        { to: '/manager/users', labelKey: 'workspace_layout.access_users', permission: null, icon: 'workers' },
        { to: '/manager/materials', labelKey: 'workspace_layout.materials', permission: 'materials.view', icon: 'materials' },
      ],
      actionItems: [
        { to: '/manager/clients?create=1', labelKey: 'workspace_layout.new_client', permission: 'clients.create' },
        { to: '/manager/workers?create=1', labelKey: 'workspace_layout.new_employee', permission: 'workers.create' },
        { to: '/manager/materials?create=1', labelKey: 'workspace_layout.new_material', permission: 'materials.create' },
      ],
    }
  },
  computed: {
    currentUser() { return this.$auth.user || {} },
    locale() { const code=String(this.$i18n?.locale||'hy').toLowerCase().split('-')[0]; return ['hy','ru','en'].includes(code)?code:'hy' },
    productionCopy() { return PRODUCTION_COPY[this.locale] || PRODUCTION_COPY.hy },
    productionTitle() { return this.productionCopy.title },
    productionItems() { return [ { to:'/manager/factories/laser', label:this.productionCopy.laser }, { to:'/manager/factories/bend', label:this.productionCopy.bend }, { to:'/manager/factories/powder', label:this.productionCopy.powder } ] },
    visibleNavItems() { return this.navItems.filter((item) => !item.permission || this.$can(item.permission)) },
    quickActions() { return this.actionItems.filter((item) => this.$can(item.permission)) },
    accessSummary() { return this.$t('workspace_layout.full_access') },
    pageTitle() {
      const production = this.productionItems.find((item) => this.$route.path.startsWith(item.to))
      if (production) return production.label
      const found = this.navItems.find((item) => item.exact ? this.$route.path === item.to : this.$route.path.startsWith(item.to))
      return found ? this.$t(found.labelKey) : this.$t('workspace_layout.workspace')
    },
  },
  watch: { '$route.fullPath'() { this.closeSidebar() } },
  methods: {
    toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen }, closeSidebar() { this.isSidebarOpen = false },
    iconPath(icon) { if(icon==='orders') return 'M7 4h10a2 2 0 012 2v14H5V6a2 2 0 012-2Zm2 4h6M9 12h6M9 16h4'; if(icon==='clients') return 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m7-10a4 4 0 100-8 4 4 0 000 8Z'; if(icon==='materials') return 'm12 3 8 4-8 4-8-4 8-4Zm-8 9 8 4 8-4M4 17l8 4 8-4'; return 'M12 12a4 4 0 100-8 4 4 0 000 8Zm-7 9a7 7 0 0114 0' },
    async logout() { await this.$auth.logout() },
  },
}
</script>

<style scoped>
.nav-item{@apply group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white}.nav-icon{@apply flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-white dark:bg-slate-800 dark:text-slate-300}
</style>
