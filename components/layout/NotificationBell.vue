<template>
  <div v-if="enabled" ref="root" class="relative" data-notification-bell>
    <button
      type="button"
      class="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      :aria-label="unread ? `${t.title}: ${unread}` : t.title"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="true"
      @click="toggle"
    >
      <svg
        class="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"
          d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
        />
      </svg>
      <span
        v-if="unread"
        data-notification-count
        class="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-none text-white"
        >{{ unread > 99 ? '99+' : unread }}</span
      >
    </button>

    <div
      v-if="open"
      role="dialog"
      :aria-label="t.title"
      class="fixed inset-x-3 top-[4.25rem] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
    >
      <div
        class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800"
      >
        <p class="text-sm font-bold text-slate-900 dark:text-white">
          {{ t.title }}
        </p>
        <button
          v-if="unread"
          type="button"
          class="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
          @click="markAll"
        >
          {{ t.markAll }}
        </button>
      </div>
      <p v-if="error" role="alert" class="px-4 py-3 text-xs text-rose-600">
        {{ error }}
      </p>
      <ul
        v-if="rows.length"
        class="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800"
      >
        <li v-for="row in rows" :key="row.id">
          <button
            type="button"
            data-notification-item
            :data-notification-id="row.id"
            class="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
            :class="row.read_at ? '' : 'bg-indigo-50/60 dark:bg-indigo-950/20'"
            @click="go(row)"
          >
            <span
              class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              :class="row.read_at ? 'bg-transparent' : 'bg-indigo-600'"
              aria-hidden="true"
            ></span>
            <span class="min-w-0 flex-1">
              <span
                v-if="row.view.ref"
                class="block text-xs font-bold text-slate-500 dark:text-slate-400"
                >{{ t.task }} {{ row.view.ref }}</span
              >
              <span
                class="mt-0.5 block break-words text-sm text-slate-800 dark:text-slate-100"
                >{{ row.view.text }}</span
              >
              <span class="mt-1 block text-[11px] text-slate-400">{{
                when(row.created_at)
              }}</span>
            </span>
          </button>
        </li>
      </ul>
      <p
        v-else
        class="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
      >
        {{ t.empty }}
      </p>
    </div>

    <transition name="bell-toast">
      <button
        v-if="toast"
        type="button"
        role="status"
        data-notification-toast
        class="fixed right-4 top-20 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-indigo-200 bg-white p-4 text-left shadow-xl dark:border-indigo-900 dark:bg-slate-900"
        @click="openFromToast"
      >
        <span
          v-if="toast.view.ref"
          class="block text-xs font-bold text-slate-500 dark:text-slate-400"
          >{{ t.task }} {{ toast.view.ref }}</span
        >
        <span
          class="mt-0.5 block break-words text-sm text-slate-800 dark:text-slate-100"
          >{{ toast.view.text }}</span
        >
      </button>
    </transition>
  </div>
</template>

<script>
import {
  describeNotification,
  notificationCopy,
  notificationTarget,
} from '@/utils/task-notifications'

const POLL_MS = 30000

export default {
  name: 'NotificationBell',
  data: () => ({
    items: [],
    unread: 0,
    open: false,
    error: '',
    toast: null,
    loading: false,
    lastSeenId: null,
    timer: null,
    toastTimer: null,
    refreshVersion: 0,
  }),
  computed: {
    locale() {
      return this.$i18n?.locale || 'hy'
    },
    t() {
      return notificationCopy[this.locale] || notificationCopy.hy
    },
    role() {
      return this.$auth?.user?.role?.name || ''
    },
    enabled() {
      return Boolean(this.$auth?.loggedIn && this.$auth?.user?.id)
    },
    companyId() {
      return this.$store?.state?.workspace?.company?.id || null
    },
    scopeKey() {
      return this.enabled ? `${this.$auth.user.id}:${this.companyId || ''}` : ''
    },
    rows() {
      return this.items.map((item) => ({
        ...item,
        view: describeNotification(item, this.locale),
      }))
    },
  },
  watch: {
    // Each company has its own notifications.
    scopeKey() {
      this.resetScope()
    },
    locale() {
      if (this.toast)
        this.toast = {
          ...this.toast,
          view: describeNotification(this.toast, this.locale),
        }
    },
  },
  mounted() {
    document.addEventListener('click', this.onOutside)
    document.addEventListener('keydown', this.onKey)
    window.addEventListener('focus', this.refresh)
    this.refresh()
    this.timer = setInterval(() => {
      if (!document.hidden) this.refresh()
    }, POLL_MS)
  },
  beforeDestroy() {
    this.refreshVersion++
    document.removeEventListener('click', this.onOutside)
    document.removeEventListener('keydown', this.onKey)
    window.removeEventListener('focus', this.refresh)
    clearInterval(this.timer)
    clearTimeout(this.toastTimer)
  },
  methods: {
    resetScope() {
      this.refreshVersion++
      clearTimeout(this.toastTimer)
      this.items = []
      this.unread = 0
      this.lastSeenId = null
      this.toast = null
      this.open = false
      this.error = ''
      this.loading = false
      return this.refresh()
    },
    async refresh() {
      if (!this.enabled || this.loading) return
      const version = ++this.refreshVersion
      const scope = this.scopeKey
      this.loading = true
      try {
        const { data } = await this.$axios.get('/api/notifications', {
          params: { limit: 30 },
        })
        if (version !== this.refreshVersion || scope !== this.scopeKey) return
        const rows = Array.isArray(data?.data) ? data.data : []
        const newest = rows.length ? Number(rows[0].id) : 0
        // Announce only what arrived after the first load.
        if (
          this.lastSeenId !== null &&
          newest > this.lastSeenId &&
          !this.open
        ) {
          const fresh = rows.find(
            (row) => !row.read_at && Number(row.id) > this.lastSeenId
          )
          if (fresh) this.showToast(fresh)
        }
        this.lastSeenId = Math.max(this.lastSeenId ?? 0, newest)
        this.items = rows
        this.unread = Number(data?.unread_count) || 0
        this.error = ''
      } catch (error) {
        // Polling stays silent; the panel shows a message only when it is open.
        if (
          version === this.refreshVersion &&
          scope === this.scopeKey &&
          this.open
        )
          this.error = this.t.loadFailed
      } finally {
        if (version === this.refreshVersion && scope === this.scopeKey)
          this.loading = false
      }
    },
    toggle() {
      this.open = !this.open
      this.toast = null
      if (this.open) this.refresh()
    },
    onOutside(event) {
      if (
        this.open &&
        this.$refs.root &&
        !this.$refs.root.contains(event.target)
      )
        this.open = false
    },
    onKey(event) {
      if (event.key === 'Escape') this.open = false
    },
    showToast(item) {
      this.toast = { ...item, view: describeNotification(item, this.locale) }
      clearTimeout(this.toastTimer)
      this.toastTimer = setTimeout(() => (this.toast = null), 8000)
    },
    openFromToast() {
      const item = this.toast
      this.toast = null
      if (item) this.go(item)
    },
    async markRead(ids) {
      const scope = this.scopeKey
      if (!scope) return false
      try {
        const { data } = await this.$axios.post(
          '/api/notifications/read',
          ids ? { ids } : {}
        )
        if (scope !== this.scopeKey || this._isDestroyed) return false
        const stamp = new Date().toISOString()
        this.items = this.items.map((item) =>
          !ids || ids.includes(item.id)
            ? { ...item, read_at: item.read_at || stamp }
            : item
        )
        this.unread = Number(data?.unread_count) || 0
        this.error = ''
        return true
      } catch (error) {
        if (scope === this.scopeKey && !this._isDestroyed)
          this.error = this.t.markFailed
        return false
      }
    },
    markAll() {
      return this.markRead(null)
    },
    go(item) {
      this.open = false
      if (!item.read_at) {
        this.markRead([item.id])
      }
      const target = notificationTarget(item, this.role)
      const result = this.$router.push({
        path: this.localePath(target.path),
        query: target.query,
      })
      if (result && result.catch) result.catch(() => {})
    },
    when(value) {
      const time = new Date(value).getTime()
      if (Number.isNaN(time)) return ''
      const seconds = Math.round((time - Date.now()) / 1000)
      if (this.locale === 'hy') {
        for (const [unit, size] of [
          ['օր', 86400],
          ['ժամ', 3600],
          ['րոպե', 60],
        ]) {
          if (Math.abs(seconds) >= size)
            return `${Math.round(Math.abs(seconds) / size)} ${unit} ${
              seconds > 0 ? 'հետո' : 'առաջ'
            }`
        }
        return 'Հիմա'
      }
      try {
        const rtf = new Intl.RelativeTimeFormat(
          this.locale === 'hy' ? 'hy-AM' : this.locale,
          { numeric: 'auto' }
        )
        for (const [unit, size] of [
          ['day', 86400],
          ['hour', 3600],
          ['minute', 60],
        ]) {
          if (Math.abs(seconds) >= size)
            return rtf.format(Math.round(seconds / size), unit)
        }
        return rtf.format(0, 'minute')
      } catch (error) {
        return new Date(time).toLocaleString()
      }
    },
  },
}
</script>

<style scoped>
.bell-toast-enter-active,
.bell-toast-leave-active {
  transition: opacity 0.2s ease;
}
.bell-toast-enter,
.bell-toast-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .bell-toast-enter-active,
  .bell-toast-leave-active {
    transition: none;
  }
}
</style>
