<template>
  <div class="min-w-0">
    <p
      class="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white"
      :title="displayName"
    >
      {{ displayName }}
    </p>
    <p
      v-if="email"
      class="truncate text-[11px] leading-4 text-slate-500 dark:text-slate-400"
      :title="email"
    >
      {{ email }}
    </p>
    <p
      v-if="phone"
      class="truncate text-[11px] leading-4 text-slate-500 dark:text-slate-400"
      :title="phone"
    >
      {{ phone }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'WorkspaceIdentity',
  data() {
    return {
      identity: null,
    }
  },
  computed: {
    authUser() {
      return this.$auth?.user || {}
    },
    displayName() {
      const serverName = String(this.identity?.display_name || '').trim()
      if (serverName) return serverName

      const fallback = [this.authUser.name, this.authUser.last_name]
        .filter(Boolean)
        .join(' ')
        .trim()

      return fallback || this.email || 'MetalWorks'
    },
    email() {
      return String(this.identity?.email || this.authUser.email || '').trim()
    },
    phone() {
      return String(this.identity?.phone || this.authUser.phone || '').trim()
    },
  },
  watch: {
    '$auth.user.id': {
      immediate: true,
      handler() {
        this.loadIdentity()
      },
    },
  },
  methods: {
    async loadIdentity() {
      if (!process.client || !this.$auth?.loggedIn) return

      try {
        this.identity = await this.$axios.$get('/api/profile/identity')
      } catch (_) {
        this.identity = null
      }
    },
  },
}
</script>
