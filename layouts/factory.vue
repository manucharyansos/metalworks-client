<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div v-if="isSidebarOpen" class="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm lg:hidden" @click="closeSidebar"></div>

    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 lg:shadow-none"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-20 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
        <nuxt-link :to="dashboardPath" class="flex min-w-0 items-center gap-3" @click.native="closeSidebar">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">MW</div>
          <div class="min-w-0">
            <p class="truncate text-sm font-black tracking-tight">MetalWorks</p>
            <p class="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{{ factoryLabel }}</p>
          </div>
        </nuxt-link>
        <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800" @click="closeSidebar">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-5">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p class="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Արտադրամաս</p>
          <p class="mt-2 text-sm font-black text-slate-900 dark:text-white">{{ currentUser.factory?.name || factoryLabel }}</p>
          <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Անհատական ֆունկցիաներով վերահսկվող աշխատանքային տարածք</p>
        </div>

        <p class="mt-6 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Աշխատանք</p>
        <nav class="mt-3 space-y-1.5">
          <nuxt-link
            v-if="$can('factory.view')"
            :to="dashboardPath"
            class="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            active-class="!bg-slate-950 !text-white shadow-sm dark:!bg-white dark:!text-slate-950"
            @click.native="closeSidebar"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-white dark:bg-slate-800 dark:text-slate-300">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 20V9l5-3v4l5-3v4l6-3v12H4Zm4 0v-4h3v4m3 0v-5h3v5" /></svg>
            </span>
            Պատվերներ և ընթացք
          </nuxt-link>

          <nuxt-link
            to="/profile"
            class="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            active-class="!bg-slate-950 !text-white shadow-sm dark:!bg-white dark:!text-slate-950"
            @click.native="closeSidebar"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-white dark:bg-slate-800 dark:text-slate-300">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 21a8 8 0 10-16 0m8-10a4 4 0 100-8 4 4 0 000 8Z" /></svg>
            </span>
            Անձնական էջ
          </nuxt-link>
        </nav>

        <div class="mt-7 grid grid-cols-2 gap-2">
          <div class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <p class="text-[9px] font-bold text-slate-400">Ֆայլեր</p>
            <p class="mt-1 text-xs font-black" :class="$can('factory.download') ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-400'">{{ $can('factory.download') ? 'Թույլատրված' : 'Փակ' }}</p>
          </div>
          <div class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <p class="text-[9px] font-bold text-slate-400">Թարմացում</p>
            <p class="mt-1 text-xs font-black" :class="$can('factory.order_update') ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-400'">{{ $can('factory.order_update') ? 'Թույլատրված' : 'Փակ' }}</p>
          </div>
        </div>
      </div>

      <div class="border-t border-slate-100 p-4 dark:border-slate-800">
        <div class="mb-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/50">
          <p class="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{{ currentUser.name || 'Operator' }}</p>
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
            <p class="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Production</p>
            <p class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ factoryLabel }}</p>
          </div>
        </div>
        <span class="hidden rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 sm:block dark:bg-slate-800 dark:text-slate-300">{{ grantedCount }} ֆունկցիա հասանելի</span>
      </header>
      <Nuxt />
    </div>
  </div>
</template>

<script>
export default {
  name: 'FactoryLayout',
  data() {
    return { isSidebarOpen: false }
  },
  computed: {
    currentUser() {
      return this.$auth.user || {}
    },
    roleName() {
      return this.currentUser?.role?.name || this.currentUser?.role || ''
    },
    dashboardPath() {
      if (this.roleName === 'bend') return '/factory/bend'
      if (this.roleName === 'laser') return '/factory/laser'
      if (this.$route.path.startsWith('/factory/')) return this.$route.path
      return '/profile'
    },
    factoryLabel() {
      return this.currentUser?.factory?.name || this.roleName || 'Factory'
    },
    grantedCount() {
      return Array.isArray(this.currentUser.permissions) ? this.currentUser.permissions.length : 0
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
    async logout() {
      await this.$auth.logout()
    },
  },
}
</script>
