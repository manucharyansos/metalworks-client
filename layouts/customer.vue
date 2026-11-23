<template>
  <div
    class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
    data-customer-layout
  >
    <WorkspaceTransition />
    <header
      class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"
    >
      <div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <nuxt-link
          :to="localePath('/customer')"
          class="min-w-0 max-w-[16rem] flex-1 sm:flex-none"
        >
          <WorkspaceIdentity class="min-w-0" />
        </nuxt-link>
        <nav
          class="hidden flex-1 items-center justify-center gap-1 md:flex"
          :aria-label="t.nav.requests"
        >
          <nuxt-link
            v-for="item in items"
            :key="item.to"
            :to="localePath(item.to)"
            class="customer-nav"
            :class="{ 'customer-nav--on': active(item) }"
          >
            {{ item.label }}
          </nuxt-link>
        </nav>
        <div class="ml-auto flex shrink-0 items-center gap-2">
          <NotificationBell />
          <div
            data-language-switcher
            class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <LanguageDropdown />
          </div>
          <button
            type="button"
            class="hidden rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:text-rose-300 dark:hover:bg-rose-950/20 sm:inline-flex"
            @click="logout"
          >
            {{ t.nav.logout }}
          </button>
        </div>
      </div>
      <nav
        class="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 dark:border-slate-800 md:hidden"
        :aria-label="t.nav.requests"
      >
        <nuxt-link
          v-for="item in items"
          :key="'m-' + item.to"
          :to="localePath(item.to)"
          class="customer-nav shrink-0"
          :class="{ 'customer-nav--on': active(item) }"
        >
          {{ item.label }}
        </nuxt-link>
        <button
          type="button"
          class="customer-nav shrink-0 text-rose-600 dark:text-rose-300"
          @click="logout"
        >
          {{ t.nav.logout }}
        </button>
      </nav>
    </header>
    <Nuxt />
    <notifications group="workspace" />
  </div>
</template>

<script>
import WorkspaceIdentity from '@/components/layout/WorkspaceIdentity.vue'
import WorkspaceTransition from '@/components/layout/WorkspaceTransition.vue'
import NotificationBell from '@/components/layout/NotificationBell.vue'
import LanguageDropdown from '@/components/language/LanguageDropdown.vue'
import { quoteCopy } from '@/utils/quote-copy'

export default {
  name: 'CustomerLayout',
  components: {
    WorkspaceIdentity,
    WorkspaceTransition,
    NotificationBell,
    LanguageDropdown,
  },
  computed: {
    t() {
      return quoteCopy(this.$i18n?.locale)
    },
    items() {
      return [
        { to: '/customer', label: this.t.nav.create, exact: true },
        { to: '/customer/requests', label: this.t.nav.requests },
        { to: '/profile', label: this.t.nav.profile },
      ]
    },
  },
  methods: {
    active(item) {
      const path =
        this.$route.path
          .replace(/^\/(hy|ru|en)(?=\/|$)/, '')
          .replace(/\/+$/, '') || '/'
      return item.exact
        ? path === item.to
        : path === item.to || path.startsWith(item.to + '/')
    },
    async logout() {
      await this.$auth.logout()
    },
  },
}
</script>

<style scoped>
.customer-nav {
  @apply rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white;
}
.customer-nav--on {
  @apply bg-slate-900 text-white hover:bg-slate-900 hover:text-white dark:bg-white dark:text-slate-900;
}
</style>
