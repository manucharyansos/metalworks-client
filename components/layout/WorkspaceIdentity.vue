<template>
  <div class="min-w-0" translate="no">
    <p
      class="break-words text-sm font-bold tracking-tight text-slate-900 dark:text-white"
      :title="displayName"
    >
      {{ displayName }}
    </p>
    <p
      v-if="email"
      class="break-all text-[11px] leading-4 text-slate-500 dark:text-slate-400"
      :title="email"
    >
      {{ email }}
    </p>
    <p
      class="break-words text-[11px] leading-4 text-slate-500 dark:text-slate-400"
      :title="phone"
    >
      {{ phone || $t('workspace_layout.phone_not_set') }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'WorkspaceIdentity',
  data() {
    return {
      identity: null,
      identityRequest: 0,
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

      return fallback || this.email
    },
    email() {
      return String(this.identity?.email || this.authUser.email || '').trim()
    },
    phone() {
      return String(this.identity?.phone || this.authUser.phone || '').trim()
    },
  },
  watch: {
    '$auth.user': {
      immediate: true,
      handler() {
        this.identity = null
        this.loadIdentity()
      },
    },
  },
  methods: {
    async loadIdentity() {
      const request = ++this.identityRequest
      const userId = this.authUser.id
      if (!process.client || !this.$auth?.loggedIn) return

      try {
        const identity = await this.$axios.$get('/api/profile/identity')
        if (request === this.identityRequest && userId === this.authUser.id) {
          this.identity = identity
        }
      } catch (_) {
        if (request === this.identityRequest) this.identity = null
      }
    },
  },
}
</script>
