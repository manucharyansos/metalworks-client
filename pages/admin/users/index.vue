<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="px-4 sm:px-6 lg:px-8 py-6 border-b bg-white">
      <div
        class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
            Օգտատերերի կառավարում
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Դիտիր, ֆիլտրիր և կառավարիր բոլոր օգտատերերին՝ աշխատակիցներ և
            հաճախորդներ։
          </p>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="px-4 sm:px-6 lg:px-8 py-6">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Filters -->
        <div
          class="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div class="flex-1 flex flex-col sm:flex-row gap-4">
            <!-- Search -->
            <div class="flex-1">
              <label class="block text-xs font-medium text-gray-500 mb-1">
                Փնտրել (անուն / email)
              </label>
              <div class="relative">
                <input
                  v-model="search"
                  type="text"
                  class="block w-full rounded-xl border-gray-300 pr-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  placeholder="օրինակ՝ Admin, client@mail.com"
                />
                <div
                  class="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                >
                  <svg
                    class="h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Type filter -->
            <div class="w-full sm:w-44">
              <label class="block text-xs font-medium text-gray-500 mb-1">
                Տեսակ
              </label>
              <select
                v-model="typeFilter"
                class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                <option value="">Բոլորը</option>
                <option value="worker">Աշխատակից</option>
                <option value="client">Հաճախորդ</option>
              </select>
            </div>

            <!-- Role filter -->
            <div class="w-full sm:w-56">
              <label class="block text-xs font-medium text-gray-500 mb-1">
                Ռոլ
              </label>
              <select
                v-model="roleFilter"
                class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                <option value="">Բոլորը</option>
                <option
                  v-for="role in roles || []"
                  :key="role.id || role.name"
                  :value="role.name"
                >
                  {{ role.value || role.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs sm:text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              @click="applyFilters"
            >
              Կիրառել
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs sm:text-sm font-medium border border-transparent text-gray-500 hover:text-gray-700"
              @click="resetFilters"
            >
              Մաքրել
            </button>
          </div>
        </div>

        <!-- Users table -->
        <div
          class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden relative"
        >
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Անուն
                  </th>
                  <th
                    class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Տեսակ
                  </th>
                  <th
                    class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Ռոլ
                  </th>
                  <th
                    class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Գործողություններ
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-if="!filteredUsers.length">
                  <td
                    colspan="5"
                    class="px-4 sm:px-6 py-6 text-center text-gray-400 text-sm"
                  >
                    Օգտատերեր չեն գտնվել։
                  </td>
                </tr>

                <tr
                  v-for="user in filteredUsers"
                  :key="`${user.type}-${user.id}`"
                  class="hover:bg-gray-50 transition"
                >
                  <td class="px-4 sm:px-6 py-3 whitespace-nowrap">
                    <div class="font-medium text-gray-900">
                      {{ user.name }}
                    </div>
                  </td>
                  <td class="px-4 sm:px-6 py-3 whitespace-nowrap">
                    <div class="text-sm text-gray-700">
                      {{ user.email }}
                    </div>
                  </td>
                  <td class="px-4 sm:px-6 py-3 whitespace-nowrap">
                    <span
                      class="inline-flex items-center rounded-full text-xs px-2 py-0.5"
                      :class="
                        user.type === 'worker'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-emerald-50 text-emerald-700'
                      "
                    >
                      {{ user.type === 'worker' ? 'Աշխատակից' : 'Հաճախորդ' }}
                    </span>
                  </td>
                  <td class="px-4 sm:px-6 py-3 whitespace-nowrap">
                    <span
                      v-if="user.roleLabel"
                      class="inline-flex items-center rounded-full bg-gray-100 text-gray-700 text-xs px-2 py-0.5"
                    >
                      {{ user.roleLabel }}
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center rounded-full bg-gray-100 text-gray-400 text-xs px-2 py-0.5"
                    >
                      Առանց role
                    </span>
                  </td>
                  <td
                    class="px-4 sm:px-6 py-3 whitespace-nowrap text-right text-sm"
                  >
                    <div class="inline-flex items-center gap-2">
                      <button
                        type="button"
                        class="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border border-indigo-100 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                        @click="openPermissionModal(user)"
                      >
                        Կառավարել թույլտվությունները
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Permission Modal -->
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
  </div>
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
    await Promise.all([
      store.dispatch('users/fetchUsers'),
      store.dispatch('roles/fetchRoles'),
    ])
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
    ...mapGetters('users', {
      users: 'allUsers',
    }),
    ...mapGetters('roles', {
      roles: 'roles',
    }),

    normalizedUsers() {
      return (this.users || []).map((u) => {
        const isClient =
          (u.role && u.role.name === 'authenticatedUser') || !!u.client

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
      const type = this.typeFilter
      const role = this.roleFilter

      return this.normalizedUsers.filter((u) => {
        const matchSearch =
          !term ||
          (u.name && u.name.toLowerCase().includes(term)) ||
          (u.email && u.email.toLowerCase().includes(term))

        const matchType = !type || u.type === type
        const matchRole = !role || (u.roleName && u.roleName === role)

        return matchSearch && matchType && matchRole
      })
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

    applyFilters() {
      // client-side filter already works
    },

    resetFilters() {
      this.search = ''
      this.typeFilter = ''
      this.roleFilter = ''
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
        console.error(e)
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
        await this.$axios.$put(
          `/api/users/${this.selectedUser.id}/permissions`,
          {
            permissions: this.userPermissionIds,
          }
        )
      } catch (e) {
        console.error(e)
      } finally {
        this.permissionSaving = false
      }
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
