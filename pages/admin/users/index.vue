<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section class="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Access & people</p>
          <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Աշխատակիցների կառավարում</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Աշխատակիցների role-եր և անհատական թույլտվություններ։ Հաճախորդների հաշիվները այս բաժնում չեն ցուցադրվում։
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="refreshUsers"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 6v5h-5M4 18v-5h5m10.5-2a8 8 0 00-13.8-3M4.5 14a8 8 0 0013.8 3" />
          </svg>
          Թարմացնել
        </button>
      </section>

      <section class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div v-for="stat in stats" :key="stat.label" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{{ stat.label }}</p>
          <p class="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{{ stat.value }}</p>
          <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{{ stat.hint }}</p>
        </div>
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div class="relative md:col-span-2">
              <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input v-model="search" type="text" class="control pl-10" placeholder="Որոնել աշխատակցի անունով կամ email-ով" />
            </div>
            <select v-model="roleFilter" class="control">
              <option value="">Բոլոր role-երը</option>
              <option v-for="role in staffRoles" :key="role.id || role.name" :value="role.name">{{ role.value || role.name }}</option>
            </select>
          </div>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Ցուցադրվում է {{ filteredUsers.length }} / {{ normalizedUsers.length }} աշխատակից</span>
            <button v-if="search || roleFilter" class="font-semibold text-rose-600 hover:underline dark:text-rose-300" @click="resetFilters">Մաքրել ֆիլտրերը</button>
          </div>
        </div>

        <div class="hidden overflow-x-auto md:block">
          <table class="w-full min-w-[900px] text-left">
            <thead class="bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-950/40">
              <tr>
                <th class="px-6 py-3.5">Աշխատակից</th>
                <th class="px-4 py-3.5">Role</th>
                <th class="px-4 py-3.5">Արտադրամաս</th>
                <th class="px-4 py-3.5">Email</th>
                <th class="px-6 py-3.5 text-right">Թույլտվություններ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="user in filteredUsers" :key="user.id" class="transition hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ initials(user.name) }}</div>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-bold text-slate-900 dark:text-white">{{ user.name }}</p>
                      <p class="mt-0.5 text-[10px] text-slate-400">ID {{ user.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ user.roleLabel || 'Առանց role' }}</span>
                </td>
                <td class="px-4 py-4">
                  <span v-if="user.factoryName" class="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{{ user.factoryName }}</span>
                  <span v-else class="text-xs text-slate-400">—</span>
                </td>
                <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{{ user.email }}</td>
                <td class="px-6 py-4 text-right">
                  <span v-if="user.roleName === 'admin'" class="inline-flex rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300">
                    Լիարժեք մուտք
                  </span>
                  <button
                    v-else
                    type="button"
                    class="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    @click="openPermissionModal(user)"
                  >
                    Կառավարել
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="space-y-3 p-4 md:hidden">
          <article v-for="user in filteredUsers" :key="user.id" class="w-full rounded-2xl border border-slate-200 p-4 shadow-sm dark:border-slate-800">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ initials(user.name) }}</div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="truncate text-sm font-bold text-slate-900 dark:text-white">{{ user.name }}</p>
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ user.roleLabel || 'Առանց role' }}</span>
                </div>
                <p class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{{ user.email }}</p>
                <p class="mt-2 text-[10px] font-semibold text-slate-400">{{ user.factoryName || 'Արտադրամաս նշված չէ' }}</p>
              </div>
            </div>
            <div class="mt-4 flex justify-end">
              <span v-if="user.roleName === 'admin'" class="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300">Լիարժեք մուտք</span>
              <button v-else type="button" class="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-950" @click="openPermissionModal(user)">Կառավարել իրավունքները</button>
            </div>
          </article>
        </div>

        <div v-if="!filteredUsers.length" class="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg font-black text-slate-400 dark:bg-slate-800">0</div>
          <p class="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">Աշխատակից չի գտնվել</p>
          <p class="mt-1 text-xs text-slate-400">Փոխեք որոնումը կամ role-ի ֆիլտրը։</p>
        </div>
      </section>
    </div>

    <UserPermissionsModal
      :show="showPermissionModal"
      :user="selectedUser"
      :loading="permissionLoading"
      :saving="permissionSaving"
      :permission-groups="permissionGroups"
      :permission-groups-keys="permissionGroupsKeys"
      :user-permission-ids="userPermissionIds"
      :denied-permission-ids="deniedPermissionIds"
      :open-groups="openPermissionGroups"
      @close="closePermissionModal"
      @toggle-group="togglePermissionGroup"
      @set-permission-override="setPermissionOverride"
      @save="savePermissions"
    />
  </main>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import UserPermissionsModal from '@/components/users/UserPermissionsModal.vue'

export default {
  components: { UserPermissionsModal },
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
  async asyncData({ store }) {
    await Promise.all([store.dispatch('users/fetchUsers'), store.dispatch('roles/fetchRoles')])
  },
  data() {
    return {
      search: '',
      roleFilter: '',
      showPermissionModal: false,
      selectedUser: null,
      permissionLoading: false,
      permissionSaving: false,
      permissionsRaw: [],
      userPermissionIds: [],
      deniedPermissionIds: [],
      rolePermissionIds: [],
      openPermissionGroups: [],
    }
  },
  computed: {
    ...mapGetters('users', { users: 'allUsers' }),
    ...mapGetters('roles', { roles: 'roles' }),
    staffRoles() {
      return (this.roles || []).filter((role) => role.name !== 'authenticatedUser')
    },
    normalizedUsers() {
      return (this.users || [])
        .filter((u) => !u.client && (!u.role || u.role.name !== 'authenticatedUser'))
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          roleName: u.role ? u.role.name : null,
          roleLabel: u.role ? u.role.value || u.role.name : null,
          factoryName: u.factory ? u.factory.name || u.factory.value : null,
        }))
    },
    filteredUsers() {
      const term = this.search.toLowerCase().trim()
      return this.normalizedUsers.filter((user) => {
        const matchSearch = !term || (user.name && user.name.toLowerCase().includes(term)) || (user.email && user.email.toLowerCase().includes(term))
        const matchRole = !this.roleFilter || user.roleName === this.roleFilter
        return matchSearch && matchRole
      })
    },
    stats() {
      const admins = this.normalizedUsers.filter((u) => u.roleName === 'admin').length
      const assignedFactories = this.normalizedUsers.filter((u) => Boolean(u.factoryName)).length
      const rolesInUse = new Set(this.normalizedUsers.map((u) => u.roleName).filter(Boolean)).size
      return [
        { label: 'Աշխատակիցներ', value: this.normalizedUsers.length, hint: 'միայն staff հաշիվները' },
        { label: 'Admin', value: admins, hint: 'լիարժեք հասանելիություն' },
        { label: 'Արտադրամասով', value: assignedFactories, hint: 'factory նշանակված' },
        { label: 'Role-եր', value: rolesInUse, hint: 'օգտագործվող staff role-եր' },
      ]
    },
    permissionGroups() {
      const groups = {}
      this.permissionsRaw.forEach((permission) => {
        const key = permission.group || 'general'
        if (!groups[key]) groups[key] = []
        groups[key].push(permission)
      })
      return groups
    },
    permissionGroupsKeys() {
      return Object.keys(this.permissionGroups)
    },
  },
  methods: {
    ...mapActions('users', ['fetchUsers']),
    ...mapActions('roles', ['fetchRoles']),
    async refreshUsers() {
      await Promise.all([this.fetchUsers(), this.fetchRoles()])
    },
    resetFilters() {
      this.search = ''
      this.roleFilter = ''
    },
    initials(name) {
      return String(name || '?').split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')
    },
    async openPermissionModal(user) {
      if (!user || user.roleName === 'admin') return
      this.selectedUser = user
      this.showPermissionModal = true
      await this.loadSelectedPermissions()
    },
    async loadSelectedPermissions() {
      if (!this.selectedUser) return
      this.permissionLoading = true
      this.permissionsRaw = []
      this.userPermissionIds = []
      this.deniedPermissionIds = []
      this.rolePermissionIds = []
      this.openPermissionGroups = []
      try {
        const res = await this.$axios.$get(`/api/users/${this.selectedUser.id}/permissions`)
        this.permissionsRaw = res.permissions || []
        this.userPermissionIds = (res.user_permission_ids || []).map(Number)
        this.deniedPermissionIds = (res.user_denied_permission_ids || []).map(Number)
        this.rolePermissionIds = (res.role_permission_ids || []).map(Number)
        this.openPermissionGroups = this.permissionGroupsKeys.slice()
      } catch (error) {
        this.$notify?.({ type: 'error', text: 'Չհաջողվեց բեռնել աշխատակցի թույլտվությունները' })
      } finally {
        this.permissionLoading = false
      }
    },
    closePermissionModal() {
      this.showPermissionModal = false
      this.selectedUser = null
      this.permissionsRaw = []
      this.userPermissionIds = []
      this.deniedPermissionIds = []
      this.rolePermissionIds = []
      this.openPermissionGroups = []
    },
    togglePermissionGroup(groupKey) {
      const index = this.openPermissionGroups.indexOf(groupKey)
      if (index === -1) this.openPermissionGroups.push(groupKey)
      else this.openPermissionGroups.splice(index, 1)
    },
    setPermissionOverride(permissionId, state) {
      const id = Number(permissionId)
      const allowed = new Set(this.userPermissionIds.map(Number))
      const denied = new Set(this.deniedPermissionIds.map(Number))

      allowed.delete(id)
      denied.delete(id)

      if (state === 'allow') allowed.add(id)
      if (state === 'deny') denied.add(id)

      this.userPermissionIds = Array.from(allowed)
      this.deniedPermissionIds = Array.from(denied)
    },
    async savePermissions() {
      if (!this.selectedUser) return
      this.permissionSaving = true
      try {
        await this.$axios.$put(`/api/users/${this.selectedUser.id}/permissions`, {
          permissions: this.userPermissionIds,
          denied_permissions: this.deniedPermissionIds,
        })
        this.$notify?.({ type: 'success', text: 'Աշխատակցի թույլտվությունները պահպանվեցին' })
        await this.loadSelectedPermissions()
      } catch (error) {
        const message = error?.response?.data?.message || 'Չհաջողվեց պահպանել թույլտվությունները'
        this.$notify?.({ type: 'error', text: message })
      } finally {
        this.permissionSaving = false
      }
    },
  },
}
</script>

<style scoped>
.control {
  @apply w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-slate-600;
}
</style>
