<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div v-if="isSidebarOpen" class="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm lg:hidden" @click="closeSidebar"></div>

    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 lg:shadow-none"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-20 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
        <nuxt-link to="/engineer" class="flex min-w-0 items-center gap-3" @click.native="closeSidebar">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">MW</div>
          <div class="min-w-0">
            <p class="truncate text-sm font-black tracking-tight">MetalWorks</p>
            <p class="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Engineer workspace</p>
          </div>
        </nuxt-link>
        <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800" @click="closeSidebar">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-5">
        <p class="px-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Աշխատանքային բաժիններ</p>
        <nav class="mt-3 space-y-1.5">
          <nuxt-link
            v-for="item in visibleNavItems"
            :key="item.to"
            :to="item.to"
            class="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            active-class="!bg-slate-950 !text-white shadow-sm dark:!bg-white dark:!text-slate-950"
            :exact="item.exact"
            @click.native="closeSidebar"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700" :class="isRouteActive(item) ? '!bg-white/15 !text-current dark:!bg-slate-200' : ''">
              <svg v-if="item.icon === 'orders'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 4h10a2 2 0 012 2v14H5V6a2 2 0 012-2Zm2 4h6M9 12h6M9 16h4" /></svg>
              <svg v-else-if="item.icon === 'files'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2Zm7 0v6h5M9 13h6M9 17h5" /></svg>
              <svg v-else-if="item.icon === 'plus'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 5v14M5 12h14" /></svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 21a8 8 0 10-16 0m8-10a4 4 0 100-8 4 4 0 000 8Z" /></svg>
            </span>
            <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
          </nuxt-link>
        </nav>
      </div>

      <div class="border-t border-slate-100 p-4 dark:border-slate-800">
        <div class="mb-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/50">
          <p class="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{{ currentUser.name || 'Engineer' }}</p>
          <p class="mt-1 truncate text-[10px] text-slate-400">{{ currentUser.email || '' }}</p>
        </div>
        <button type="button" class="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-slate-700 dark:text-rose-300 dark:hover:bg-rose-950/20" @click="logout">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10 17l5-5-5-5M15 12H3m8-8h7a2 2 0 012 2v12a2 2 0 01-2 2h-7" /></svg>
          Դուրս գալ
        </button>
      </div>
    </aside>

    <div class="min-h-screen lg:pl-72">
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <button type="button" class="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" @click="toggleSidebar">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <div>
            <p class="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Engineer</p>
            <p class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ pageTitle }}</p>
          </div>
        </div>
        <div class="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 sm:flex dark:bg-slate-800 dark:text-slate-300">{{ grantedCount }} ֆունկցիա հասանելի</div>
      </header>
      <Nuxt />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EngineerLayout',
  data() {
    return {
      isSidebarOpen: false,
      navItems: [
        { to: '/engineer', label: 'Պատվերներ', permission: 'orders.view', icon: 'orders', exact: true },
        { to: '/engineer/files', label: 'Ֆայլեր և PMP', permission: 'pmp.view', icon: 'files', exact: false },
        { to: '/engineer/orders/create', label: 'Ստեղծել պատվեր', permission: 'orders.create', icon: 'plus', exact: true },
        { to: '/profile', label: 'Անձնական էջ', permission: null, icon: 'profile', exact: true },
      ],
    }
  },
  computed: {
    currentUser() { return this.$auth.user || {} },
    visibleNavItems() { return this.navItems.filter((item) => !item.permission || this.$can(item.permission)) },
    grantedCount() { return Array.isArray(this.currentUser.permissions) ? this.currentUser.permissions.length : 0 },
    pageTitle() {
      const found = this.navItems.find((item) => this.isRouteActive(item))
      return found ? found.label : 'Աշխատանքային տարածք'
    },
  },
  watch: { '$route.fullPath'() { this.closeSidebar() } },
  methods: {
    toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen },
    closeSidebar() { this.isSidebarOpen = false },
    isRouteActive(item) { return item.exact ? this.$route.path === item.to : this.$route.path.startsWith(item.to) },
    async logout() { await this.$auth.logout() },
  },
}
</script>
