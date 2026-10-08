<template>
  <div class="flex min-w-0 items-center gap-3" translate="no">
    <div
      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-0.5 shadow-sm"
    >
      <WorkspaceLogo :brand="activeBrand" />
    </div>
    <div class="min-w-0 flex-1">
      <p
        class="break-words text-sm font-bold tracking-tight text-slate-900 dark:text-white"
        :title="activeBrand.name"
      >
        {{ activeBrand.name }}
      </p>
      <p
        class="break-words text-xs font-medium leading-4 text-slate-700 dark:text-slate-200"
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
    </div>
  </div>
</template>

<script>
import workspaceBrands from '~/config/workspace-brands'
import WorkspaceLogo from '~/components/auth/WorkspaceLogo.vue'

export default {
  name: 'WorkspaceIdentity',
  components: { WorkspaceLogo },
  props: {
    brand: { type: Object, default: null },
  },
  data() {
    return {
      identity: null,
      identityRequest: 0,
    }
  },
  computed: {
    activeBrand() {
      if (this.brand) return this.brand
      const company = this.$store?.state?.workspace?.company || this.authUser.company
      if (!company) return workspaceBrands[0]
      return { ...company, logo: company.logo || (company.slug === 'metalworks' ? workspaceBrands[0].logo : null) }
    },
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
