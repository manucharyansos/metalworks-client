<template>
  <div class="relative min-h-screen">
    <!-- Mobile toggle -->
    <button
      type="button"
      class="fixed top-3 right-3 z-50 p-2 rounded-lg lg:hidden bg-white/90 text-gray-700 shadow hover:bg-white focus:outline-none"
      :aria-expanded="isSidebarOpen"
      :aria-label="isSidebarOpen ? 'Close sidebar' : 'Open sidebar'"
      @click="toggleSidebar"
    >
      <svg
        v-if="!isSidebarOpen"
        class="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
        />
      </svg>
      <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        />
      </svg>
    </button>

    <!-- Backdrop (mobile) -->
    <div
      v-if="isSidebarOpen && !isDesktop"
      class="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
      @click="closeSidebar"
    />

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 w-72 lg:w-64 bg-gray-900 text-gray-50 transform-gpu transition-transform duration-300 ease-out lg:translate-x-0 will-change-transform"
      :class="{
        '-translate-x-full': !isSidebarOpen && !isDesktop,
        'translate-x-0': isSidebarOpen || isDesktop,
      }"
      aria-label="Sidebar"
      :aria-hidden="!isSidebarOpen && !isDesktop"
    >
      <div class="relative h-full px-4 py-6 overflow-y-auto">
        <ul class="mt-2 space-y-2">
          <!-- Dashboard -->
          <li>
            <nuxt-link
              ref="firstLink"
              to="/manager"
              exact-active-class="manager-active-link"
              class="flex items-center p-2 rounded-lg hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
              @click.native="onNavClick"
            >
              Գլխավոր
            </nuxt-link>
          </li>

          <!-- Users -->
          <li>
            <nuxt-link
              to="/manager/clients"
              exact-active-class="manager-active-link"
              class="flex items-center p-2 rounded-lg hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
              @click.native="onNavClick"
            >
              Հաճախորդներ
            </nuxt-link>
          </li>

          <!-- Workers -->
          <li>
            <nuxt-link
              to="/manager/workers"
              exact-active-class="manager-active-link"
              class="flex items-center p-2 rounded-lg hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
              @click.native="onNavClick"
            >
              Աշխատակիցներ
            </nuxt-link>
          </li>

          <!-- Materials -->
          <li>
            <nuxt-link
              to="/manager/materials"
              exact-active-class="manager-active-link"
              class="flex items-center p-2 rounded-lg hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
              @click.native="onNavClick"
            >
              Նյութեր
            </nuxt-link>
          </li>
        </ul>

        <!-- Logout -->
        <button
          type="button"
          class="absolute bottom-6 left-4 right-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-100 w-auto"
          @click="logout"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M3 4.75A1.75 1.75 0 014.75 3h5.5A1.75 1.75 0 0112 4.75V7a.75.75 0 01-1.5 0V4.75a.25.25 0 00-.25-.25h-5.5a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h5.5a.25.25 0 00.25-.25V13a.75.75 0 011.5 0v2.25A1.75 1.75 0 0110.25 17h-5.5A1.75 1.75 0 013 15.25V4.75zM13.47 10.53a.75.75 0 010-1.06l2-2a.75.75 0 111.06 1.06L15.81 9.25H8.75a.75.75 0 000 1.5h7.06l.72.72a.75.75 0 001.06-1.06l-2-2z"
            />
          </svg>
          <span>Log out</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="lg:ml-64 transition-[margin] duration-300 ease-out">
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
      isDesktop: false,
      openLang: false,
    }
  },
  computed: {
    locales() {
      const base =
        this.$i18n && this.$i18n.locales && this.$i18n.locales.length
          ? this.$i18n.locales
          : [
              { code: 'hy', name: 'Հայերեն' },
              { code: 'ru', name: 'Русский' },
              { code: 'en', name: 'English' },
            ]
      const flags = { hy: '🇦🇲', ru: '🇷🇺', en: '🇬🇧' }
      return base.map((l) => ({ ...l, flag: flags[l.code] || '🏳️' }))
    },
    currentLocaleCode() {
      return this.$i18n && this.$i18n.locale ? this.$i18n.locale : 'hy'
    },
    activeLocale() {
      return (
        this.locales.find((l) => l.code === this.currentLocaleCode) || {
          code: 'hy',
          name: 'Հայերեն',
          flag: '🇦🇲',
        }
      )
    },
  },
  mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })
    document.addEventListener('keydown', this.onKeydown)
    document.addEventListener('click', this.onDocumentClick)

    this._unwatch = this.$watch(
      () => this.$route.fullPath,
      () => {
        if (!this.isDesktop) this.closeSidebar()
      }
    )
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('keydown', this.onKeydown)
    document.removeEventListener('click', this.onDocumentClick)
    if (this._unwatch) this._unwatch()
  },
  methods: {
    onResize() {
      this.isDesktop = window.matchMedia('(min-width: 1024px)').matches
      if (this.isDesktop) {
        this.unlockScroll()
      } else if (!this.isSidebarOpen) {
        this.unlockScroll()
      }
    },
    onKeydown(e) {
      if (e.key === 'Escape' && this.isSidebarOpen && !this.isDesktop) {
        this.closeSidebar()
      }
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
      if (this.isSidebarOpen && !this.isDesktop) {
        this.$nextTick(() => {
          this.$refs.firstLink && this.$refs.firstLink.$el?.focus?.()
        })
        this.lockScroll()
      } else {
        this.unlockScroll()
      }
    },
    closeSidebar() {
      this.isSidebarOpen = false
      this.unlockScroll()
    },
    onNavClick() {
      if (!this.isDesktop) this.closeSidebar()
    },
    lockScroll() {
      document.documentElement.classList.add('overflow-hidden')
    },
    unlockScroll() {
      document.documentElement.classList.remove('overflow-hidden')
    },
    logout() {
      this.$auth.logout()
    },
    onDocumentClick(e) {
      const asideEl = this.$el.querySelector('aside')
      if (!asideEl) return
      const clickInside = asideEl.contains(e.target)
      if (!clickInside) this.openLang = false
    },

    async changeLocale(code) {
      if (!this.$i18n || !code || code === this.currentLocaleCode) {
        this.openLang = false
        return
      }
      await this.$i18n.setLocale(code)
      this.openLang = false
    },
  },
}
</script>

<style scoped>
aside {
  will-change: transform;
}

.manager-active-link {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
