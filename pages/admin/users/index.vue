<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section class="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Access & people</p>
          <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Օգտատերերի կառավարում</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Աշխատակիցներ, հաճախորդներ, role-եր և անհատական թույլտվություններ՝ մեկ տեղում։
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
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div class="relative md:col-span-2">
              <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input v-model="search" type="text" class="control pl-10" placeholder="Որոնել անունով կամ email-ով" />
            </div>
            <select v-model="typeFilter" class="control">
              <option value="">Բոլոր տեսակները</option>
              <option value="worker">Աշխատակիցներ</option>
              <option value="client">Հաճախորդներ</option>
            </select>
            <select v-model="roleFilter" class="control">
              <option value="">Բոլոր role-երը</option>
              <option v-for="role in roles || []" :key="role.id || role.name" :value="role.name">{{ role.value || role.name }}</option>
            </select>
          </div>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Ցուցադրվում է {{ filteredUsers.length }} / {{ normalizedUsers.length }}</span>
            <button v-if="search || typeFilter || roleFilter" class="font-semibold text-rose-600 hover:underline dark:text-rose-300" @click="resetFilters">Մաքրել ֆիլտրերը</button>
          </div>
        </div>

        <div class="hidden overflow-x-auto md:block">
          <table class="w-full min-w-[820px] text-left">
            <thead class="bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-950/40">
              <tr>
                <th class="px-6 py-3.5">Օգտատեր</th>
                <th class="px-4 py-3.5">Տեսակ</th>
                <th class="px-4 py-3.5">Role</th>
                <th class="px-4 py-3.5">Email</th>
                <th class="px-6 py-3.5 text-right">Թույլտվություններ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="user in filteredUsers" :key="`${user.type}-${user.id}`" class="transition hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
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
                  <span class="rounded-full px-2.5 py-1 text-[10px] font-bold" :class="user.type === 'worker' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'">
                    {{ user.type === 'worker' ? 'Աշխատակից' : 'Հաճախորդ' }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ user.roleLabel || 'Առանց role' }}</span>
                </td>
                <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{{ user.email }}</td>
                <td class="px-6 py-4 text-right">
                  <button type="button" class="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" @click="openPermissionModal(user)">
                    Կառավարել
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="space-y-3 p-4 md:hidden">
          <button v-for="user in filteredUsers" :key="`${user.type}-${user.id}`" type="button" class="w-full rounded-2xl border border-slate-200 p-4 text-left shadow-sm dark:border-slate-800" @click="openPermissionModal(user)">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ initials(user.name) }}</div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="truncate text-sm font-bold text-slate-900 dark:text-white">{{ user.name }}</p>
                  <span class="rounded-full px-2 py-0.5 text-[9px] font-bold" :class="user.type === 'worker' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'">{{ user.type === 'worker' ? 'Աշխատակից' : 'Հաճախորդ' }}</span>
                </div>
                <p class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{{ user.email }}</p>
                <p class="mt-2 text-[10px] font-semibold text-slate-400">{{ user.roleLabel || 'Առանց role' }}</p>
              </div>
            </div>
          </button>
        </div>

        <div v-if="!filteredUsers.length" class="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg font-black text-slate-400 dark:bg-slate-800">0</div>
          <p class="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">Օգտատեր չի գտնվել</p>
          <p class="mt-1 text-xs text-slate-400">Փոխեք որոնումը կամ ֆիլտրերը։</p>
        </div>
      </section>
    </div>

    <transition name="fade">
      <UserPermissionsModal
        :show="showPermissionModal"
        :user="selectedUser"
        :loading="permissionLoading"
        :saving="permissionSaving"
        :permission-groups="permissionGroups"
        :permission-groups-keys="permissionGroupsKeys"
        :user-permission-ids="userPermissionIds"
        :open-groups="openPermissionGroups"
        @close="closePermissionModal"
        @toggle-group="togglePermissionGroup"
        @toggle-permission="toggleUserPermission"
        @save="savePermissions"
      />
    </transition>
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
      typeFilter: '',
      roleFilter: '',
      showPermissionModal: false,
      selectedUser: null,
      permissionLoading: false,
      permissionSaving: false,
      permissionsRaw: [],
      userPermissionIds: [],
      rolePermissionIds: [],
      openPermissionGroups: [],
    }
  },
  computed: {
    ...mapGetters('users', { users: 'allUsers' }),
    ...mapGetters('roles', { roles: 'roles' }),
    normalizedUsers() {
      return (this.users || []).map((u) => {
        const isClient = (u.role && u.role.name === 'authenticatedUser') || !!u.client
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          type: isClient ? 'client' : 'worker',
          roleName: u.role ? u.role.name : null,
          roleLabel: u.role ? u.role.value || u.role.name : null,
        }
      })
    },
    filteredUsers() {
      const term = this.search.toLowerCase().trim()
      return this.normalizedUsers.filter((u) => {
        const matchSearch = !term || (u.name && u.name.toLowerCase().includes(term)) || (u.email && u.email.toLowerCase().includes(term))
        const matchType = !this.typeFilter || u.type === this.typeFilter
        const matchRole = !this.roleFilter || u.roleName === this.roleFilter
        return matchSearch && matchType && matchRole
      })
    },
    stats() {
      const workers = this.normalizedUsers.filter((u) => u.type === 'worker').length
      const clients = this.normalizedUsers.filter((u) => u.type === 'client').length
      return [
        { label: 'Ընդհանուր', value: this.normalizedUsers.length, hint: 'բոլոր հաշիվները' },
        { label: 'Աշխատակիցներ', value: workers, hint: 'staff accounts' },
        { label: 'Հաճախորդներ', value: clients, hint: 'client accounts' },
        { label: 'Role-եր', value: (this.roles || []).length, hint: 'մուտքի մակարդակներ' },
      ]
    },
    permissionGroups() {
      const groups = {}
      this.permissionsRaw.forEach((perm) => {
        const key = perm.group || 'general'
        if (!groups[key]) groups[key] = []
        groups[key].push(perm)
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
      this.typeFilter = ''
      this.roleFilter = ''
    },
    initials(name) {
      return String(name || '?').split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')
    },
    async openPermissionModal(user) {
      this.selectedUser = user
      this.showPermissionModal = true
      this.permissionLoading = true
      this.permissionsRaw = []
      this.userPermissionIds = []
      this.rolePermissionIds = []
      this.openPermissionGroups = []
      try {
        const res = await this.$axios.$get(`/api/users/${user.id}/permissions`)
        this.permissionsRaw = res.permissions || []
        this.userPermissionIds = res.user_permission_ids || []
        this.rolePermissionIds = res.role_permission_ids || []
        this.openPermissionGroups = this.permissionGroupsKeys.slice()
      } catch (e) {
        this.$notify?.({ type: 'error', text: 'Չհաջողվեց բեռնել թույլտվությունները' })
      } finally {
        this.permissionLoading = false
      }
    },
    closePermissionModal() {
      this.showPermissionModal = false
      this.selectedUser = null
      this.permissionsRaw = []
      this.userPermissionIds = []
      this.rolePermissionIds = []
      this.openPermissionGroups = []
    },
    togglePermissionGroup(groupKey) {
      const idx = this.openPermissionGroups.indexOf(groupKey)
      if (idx === -1) this.openPermissionGroups.push(groupKey)
      else this.openPermissionGroups.splice(idx, 1)
    },
    toggleUserPermission(id, checked) {
      const set = new Set(this.userPermissionIds)
      if (checked) set.add(id)
      else set.delete(id)
      this.userPermissionIds = Array.from(set)
    },
    async savePermissions() {
      if (!this.selectedUser) return
      this.permissionSaving = true
      try {
        await this.$axios.$put(`/api/users/${this.selectedUser.id}/permissions`, { permissions: this.userPermissionIds })
        this.$notify?.({ type: 'success', text: 'Թույլտվությունները պահպանվեցին' })
      } catch (e) {
        this.$notify?.({ type: 'error', text: 'Չհաջողվեց պահպանել թույլտվությունները' })
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
