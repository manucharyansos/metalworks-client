<template>
  <div class="min-w-0">
    <p class="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white" :title="displayName">
      {{ displayName }}
    </p>
    <p class="truncate text-xs text-slate-500 dark:text-slate-400" :title="secondary">
      {{ secondary }}
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

      return fallback || this.authUser.email || 'MetalWorks'
    },
    secondary() {
      return String(
        this.identity?.phone ||
          this.authUser.phone ||
          this.identity?.email ||
          this.authUser.email ||
          ''
      ).trim()
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
