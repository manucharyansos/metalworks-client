<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div v-if="isSidebarOpen" class="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm lg:hidden" @click="closeSidebar"></div>

    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 lg:shadow-none"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-20 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
        <nuxt-link to="/manager" class="flex min-w-0 items-center gap-3" @click.native="closeSidebar">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">MW</div>
          <div class="min-w-0">
            <p class="truncate text-sm font-black tracking-tight">MetalWorks</p>
            <p class="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Manager workspace</p>
          </div>
        </nuxt-link>
        <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800" @click="closeSidebar">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-5">
        <p class="px-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Կառավարում</p>
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
              <svg v-else-if="item.icon === 'clients'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m7-10a4 4 0 100-8 4 4 0 000 8Zm13 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
              <svg v-else-if="item.icon === 'workers'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 12a4 4 0 100-8 4 4 0 000 8Zm-7 9a7 7 0 0114 0m2-8v6m-3-3h6" /></svg>
              <svg v-else-if="item.icon === 'materials'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m12 3 8 4-8 4-8-4 8-4Zm-8 9 8 4 8-4M4 17l8 4 8-4" /></svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 21a8 8 0 10-16 0m8-10a4 4 0 100-8 4 4 0 000 8Z" /></svg>
            </span>
            <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
          </nuxt-link>
        </nav>

        <div v-if="quickActions.length" class="mt-7">
          <p class="px-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Արագ գործողություններ</p>
          <div class="mt-3 space-y-1.5">
            <nuxt-link
              v-for="item in quickActions"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-500 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              @click.native="closeSidebar"
            >
              <span class="text-base leading-none">+</span>{{ item.label }}
            </nuxt-link>
          </div>
        </div>
      </div>

      <div class="border-t border-slate-100 p-4 dark:border-slate-800">
        <div class="mb-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/50">
          <p class="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{{ currentUser.name || 'Manager' }}</p>
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
            <p class="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Manager</p>
            <p class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ pageTitle }}</p>
          </div>
        </div>
        <div class="hidden rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 sm:block dark:bg-slate-800 dark:text-slate-300">{{ grantedCount }} ֆունկցիա հասանելի</div>
      </header>
      <Nuxt />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ManagerLayout',
  data() {
    return {
      isSidebarOpen: false,
      navItems: [
        { to: '/manager', label: 'Պատվերներ', permission: 'orders.view', icon: 'orders', exact: true },
        { to: '/manager/clients', label: 'Հաճախորդներ', permission: 'clients.view', icon: 'clients', exact: false },
        { to: '/manager/workers', label: 'Աշխատակիցներ', permission: 'workers.view', icon: 'workers', exact: false },
        { to: '/manager/materials', label: 'Նյութեր', permission: 'materials.view', icon: 'materials', exact: false },
        { to: '/profile', label: 'Անձնական էջ', permission: null, icon: 'profile', exact: true },
      ],
      actionItems: [
        { to: '/manager/create/users', label: 'Նոր հաճախորդ', permission: 'clients.create' },
        { to: '/manager/create/workers', label: 'Նոր աշխատակից', permission: 'workers.create' },
        { to: '/manager/create/materials', label: 'Նոր նյութ', permission: 'materials.create' },
      ],
    }
  },
  computed: {
    currentUser() {
      return this.$auth.user || {}
    },
    visibleNavItems() {
      return this.navItems.filter((item) => !item.permission || this.$can(item.permission))
    },
    quickActions() {
      return this.actionItems.filter((item) => this.$can(item.permission))
    },
    grantedCount() {
      return Array.isArray(this.currentUser.permissions) ? this.currentUser.permissions.length : 0
    },
    pageTitle() {
      const found = this.navItems.find((item) => this.isRouteActive(item))
      return found ? found.label : 'Կառավարման տարածք'
    },
  },
  watch: {
    '$route.fullPath'() {
      this.closeSidebar()
    },
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },
    closeSidebar() {
      this.isSidebarOpen = false
    },
    isRouteActive(item) {
      return item.exact ? this.$route.path === item.to : this.$route.path.startsWith(item.to)
    },
    async logout() {
      await this.$auth.logout()
    },
  },
}
</script>
