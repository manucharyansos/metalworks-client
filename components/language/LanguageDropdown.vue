<template>
  <div
    class="relative inline-block text-left"
    @keydown.esc.stop.prevent="close"
  >
    <!-- Trigger -->
    <button
      type="button"
      class="w-full min-w-[140px] lg:min-w-[200px] flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-neutral-800 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      :aria-expanded="open.toString()"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <span class="inline-flex items-center gap-2">
        <span class="text-base lg:text-lg">{{ activeLocale.flag }}</span>
        <!-- On small screens only show code; on lg show full name -->
        <span class="hidden sm:inline font-medium">{{
          activeLocale.name
        }}</span>
        <span class="sm:hidden text-xs uppercase opacity-80">{{
          activeLocale.code
        }}</span>
        <span class="hidden lg:inline text-xs text-gray-400"
          >({{ activeLocale.code.toUpperCase() }})</span
        >
      </span>
      <svg
        class="w-4 h-4 opacity-80"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
        />
      </svg>
    </button>
    <!-- Dropdown -->
    <transition name="fade-scale">
      <ul
        v-if="open"
        ref="list"
        class="absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-lg bg-white p-1 text-sm focus:outline-none"
        role="listbox"
        :aria-activedescendant="activeId"
        tabindex="-1"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="selectActive()"
      >
        <li
          v-for="(l, idx) in locales"
          :id="`lang-opt-${l.code}`"
          :key="l.code"
          class="flex items-center justify-between gap-2 px-3 py-2 rounded cursor-pointer hover:bg-gray-600 hover:text-gray-100"
          :class="l.code === currentLocaleCode ? 'bg-gray-700 text-white' : ''"
          role="option"
          :aria-selected="(l.code === currentLocaleCode).toString()"
          @click="changeLocale(l.code)"
          @mousemove="hoverIndex = idx"
        >
          <span class="inline-flex items-center gap-2">
            <!--            <span class="text-base">{{ l.flag }}</span>-->
            <img :src="l.flag" alt="" />
            <span>{{ l.name }}</span>
            <span class="ml-1 text-[10px] uppercase text-gray-400">{{
              l.code
            }}</span>
          </span>
          <svg
            v-if="l.code === currentLocaleCode"
            class="w-4 h-4 text-emerald-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.42 0l-3.2-3.2a1 1 0 111.42-1.42l2.49 2.49 6.49-6.49a1 1 0 011.42 0z"
            />
          </svg>
        </li>
      </ul>
    </transition>
  </div>
</template>
<script>
export default {
  name: 'LanguageDropdown',
  data() {
    return {
      open: false,
      hoverIndex: -1,
    }
  },
  computed: {
    // Safe locales from i18n, fallback to three
    locales() {
      const base =
        this.$i18n && this.$i18n.locales && this.$i18n.locales.length
          ? this.$i18n.locales
          : [
              { code: 'hy', name: 'Հայերեն' },
              { code: 'ru', name: 'Русский' },
              { code: 'en', name: 'English' },
            ]
      const flags = { hy: '🇦🇲', ru: '🇷🇺', en: 'US' }
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
    activeId() {
      const cur = this.locales[this.hoverIndex]
      return cur ? `lang-opt-${cur.code}` : null
    },
  },
  mounted() {
    // Close on outside click
    this._onBody = (e) => {
      if (!this.$el.contains(e.target)) this.close()
    }
    document.addEventListener('click', this._onBody)
  },
  beforeDestroy() {
    document.removeEventListener('click', this._onBody)
  },
  methods: {
    toggle() {
      this.open = !this.open
      this.$nextTick(() => {
        if (this.open && this.$refs.list) this.$refs.list.focus()
      })
    },
    close() {
      this.open = false
    },
    move(step) {
      const len = this.locales.length
      if (!len) return
      if (this.hoverIndex === -1) {
        this.hoverIndex = this.locales.findIndex(
          (l) => l.code === this.currentLocaleCode
        )
      } else {
        this.hoverIndex = (this.hoverIndex + step + len) % len
      }
    },
    selectActive() {
      const cur = this.locales[this.hoverIndex]
      if (cur) this.changeLocale(cur.code)
    },
    async changeLocale(code) {
      if (!this.$i18n || !code || code === this.currentLocaleCode) {
        this.close()
        return
      }
      try {
        // Nuxt i18n will handle cookie; we also store to localStorage as fallback
        await this.$i18n.setLocale(code)
        if (process.client && window && window.localStorage) {
          localStorage.setItem('locale', code)
        }
      } finally {
        this.close()
      }
    },
  },
}
</script>
<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.12s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
