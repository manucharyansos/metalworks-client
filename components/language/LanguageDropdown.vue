<template>
  <div
    class="relative inline-block text-left"
    @keydown.esc.stop.prevent="close"
  >
    <!-- Trigger: compact (flag + chevron + code) -->
    <button
      type="button"
      class="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-neutral-800 dark:text-neutral-100 hover:bg-gray-200/70 dark:hover:bg-gray-700 focus:outline-none focus:ring-0 focus-visible:outline-none min-w-[84px]"
      :aria-expanded="open.toString()"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <div class="inline-flex items-center gap-1">
        <FlagIcon :code="activeLocale.code" class="w-5 h-5 shrink-0" />
      </div>
      <div class="text-xs sm:text-[13px] uppercase opacity-80 tracking-wide">
        {{ activeLocale.code }}
      </div>
      <div>
        <svg
          class="w-3.5 h-3.5 opacity-80 transition-transform duration-200"
          :class="open ? 'rotate-180' : ''"
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
      </div>
    </button>

    <!-- Dropdown -->
    <transition name="fade-scale">
      <ul
        v-if="open"
        ref="list"
        class="absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-xl bg-white dark:bg-gray-900 p-1 text-sm shadow-lg ring-1 ring-black/10 focus:outline-none"
        role="listbox"
        :aria-activedescendant="activeId"
        tabindex="-1"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="selectActive()"
        @keydown.tab="close"
      >
        <li
          v-for="(l, idx) in locales"
          :id="`lang-opt-${l.code}`"
          :key="l.code"
          class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          :class="
            l.code === currentLocaleCode
              ? 'bg-gray-100 dark:bg-gray-700/70'
              : ''
          "
          role="option"
          :aria-selected="(l.code === currentLocaleCode).toString()"
          @click="changeLocale(l.code)"
          @mousemove="hoverIndex = idx"
        >
          <!-- left: flag + code (առանց անվան) -->
          <span class="inline-flex items-center gap-2">
            <FlagIcon :code="l.code" class="w-5 h-5 shrink-0" />
            <span
              class="text-[11px] sm:text-xs uppercase text-gray-600 dark:text-gray-300"
              >{{ l.code }}</span
            >
          </span>

          <!-- right: check ALWAYS at far right -->
          <span class="ml-auto inline-flex items-center">
            <svg
              v-if="l.code === currentLocaleCode"
              class="w-4 h-4 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.42 0l-3.2-3.2a1 1 0 111.42-1.42l2.49 2.49 6.49-6.49a1 1 0 011.42 0z"
              />
            </svg>
          </span>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script>
/* --- Inline SVG Flag component --- */
const FlagIcon = {
  name: 'FlagIcon',
  props: { code: { type: String, required: true } },
  computed: {
    svg() {
      const c = (this.code || '').toLowerCase()
      const svgs = {
        hy: `
      <svg viewBox="0 0 640 480" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <path fill="#d90012" d="M0 0h640v160H0z"/>
        <path fill="#0033a0" d="M0 160h640v160H0z"/>
        <path fill="#f2a800" d="M0 320h640v160H0z"/>
      </svg>`,
        ru: `
      <svg viewBox="0 0 640 480" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <path fill="#fff" d="M0 0h640v160H0z"/>
        <path fill="#0039a6" d="M0 160h640v160H0z"/>
        <path fill="#d52b1e" d="M0 320h640v160H0z"/>
      </svg>`,
        en: `
      <!-- normalized USA flag (simplified), same 640x480 viewBox -->
      <svg viewBox="0 0 640 480" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <!-- red background -->
        <path fill="#b22234" d="M0 0h640v480H0z"/>
        <!-- white stripes (6 of them) -->
        <g fill="#fff">
          <rect x="0" y="37"  width="640" height="37"/>
          <rect x="0" y="111" width="640" height="37"/>
          <rect x="0" y="185" width="640" height="37"/>
          <rect x="0" y="259" width="640" height="37"/>
          <rect x="0" y="333" width="640" height="37"/>
          <rect x="0" y="407" width="640" height="37"/>
        </g>
        <!-- canton -->
        <rect x="0" y="0" width="296" height="259" fill="#3c3b6e"/>
        <!-- simplified star field (dots) -->
        <g fill="#fff" opacity="0.9">
          <!-- 6×5 grid of small circles (just to look centered) -->
          <g transform="translate(20 20)">
            ${Array.from({ length: 5 })
              .map((_, r) =>
                Array.from({ length: 6 })
                  .map(
                    (__, c) => `<circle cx="${c * 46}" cy="${r * 46}" r="4"/>`
                  )
                  .join('')
              )
              .join('')}
          </g>
        </g>
      </svg>`,
      }
      return (
        svgs[c] ||
        `
    <svg viewBox="0 0 24 24" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="12" rx="2" ry="2" fill="#e5e7eb"/>
      <rect x="3" y="11" width="18" height="2" fill="#d1d5db"/>
    </svg>`
      )
    },
  },
  render(h) {
    return h('span', {
      class: this.$attrs.class || '',
      domProps: { innerHTML: this.svg },
      attrs: { 'aria-hidden': 'true' },
    })
  },
}

export default {
  name: 'LanguageDropdown',
  components: { FlagIcon },
  data() {
    return {
      open: false,
      hoverIndex: -1,
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
      return base.map((l) => ({ ...l, code: String(l.code).toLowerCase() }))
    },
    currentLocaleCode() {
      return (this.$i18n && String(this.$i18n.locale).toLowerCase()) || 'hy'
    },
    activeLocale() {
      return (
        this.locales.find((l) => l.code === this.currentLocaleCode) || {
          code: 'hy',
          name: 'Հայերեն',
        }
      )
    },
    activeId() {
      const cur = this.locales[this.hoverIndex]
      return cur ? `lang-opt-${cur.code}` : null
    },
  },
  mounted() {
    // outside click → close
    this._onBody = (e) => {
      if (!this.$el.contains(e.target)) this.close()
    }
    document.addEventListener('click', this._onBody, { passive: true })

    // start at current locale
    this.hoverIndex = this.locales.findIndex(
      (l) => l.code === this.currentLocaleCode
    )
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
      if (!code || code === this.currentLocaleCode) {
        this.close()
        return
      }

      try {
        const target =
          (this.switchLocalePath && this.switchLocalePath(code)) ||
          (this.localePath && this.localePath('/', code)) ||
          `/${code}`

        if (this.$cookies) {
          this.$cookies.set('i18n_redirected', code, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 տարի
            sameSite: 'lax',
          })
        }
        await this.$router.push(target)
        if (this.$i18n && this.$i18n.locale !== code) {
          await this.$i18n.setLocale(code)
        }
      } finally {
        this.close()
      }
    },
  },
}
</script>

<style scoped>
/* open/close animation */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: transform 120ms ease, opacity 120ms ease;
  transform-origin: top right;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

:deep(svg) {
  display: block;
}
</style>
