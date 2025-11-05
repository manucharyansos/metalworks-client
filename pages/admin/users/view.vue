<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="px-4 sm:px-6 lg:px-8 py-6 border-b bg-white">
      <div
        class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
            Աշխատակիցներ
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Դիտիր, որոնիր և կառավարիր workers-ներին։
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
                  placeholder="օրինակ՝ Admin, manager@example.com"
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
                <tr v-if="!filteredWorkers.length">
                  <td
                    colspan="4"
                    class="px-4 sm:px-6 py-6 text-center text-gray-400 text-sm"
                  >
                    Աշխատակիցներ չեն գտնվել։
                  </td>
                </tr>

                <tr
                  v-for="user in filteredWorkers"
                  :key="user.id"
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
                      v-if="user.role"
                      class="inline-flex items-center rounded-full bg-gray-100 text-gray-700 text-xs px-2 py-0.5"
                    >
                      {{ user.role.value || user.role.name }}
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
      <div
        v-if="showPermissionModal"
        class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40"
      >
        <div
          class="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col"
        >
          <!-- Modal header -->
          <div
            class="px-5 py-4 border-b flex items-center justify-between bg-gray-50"
          >
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                Օգտատիրոջ թույլտվություններ
              </h2>
              <p
                v-if="selectedUser"
                class="mt-0.5 text-xs text-gray-500 flex items-center gap-2"
              >
                <span>{{ selectedUser.name }}</span>
                <span class="text-gray-300">·</span>
                <span>{{ selectedUser.email }}</span>
              </p>
            </div>

            <button
              type="button"
              class="text-gray-400 hover:text-gray-600"
              @click="closePermissionModal"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Modal body -->
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <div
              v-if="permissionLoading"
              class="py-10 text-center text-gray-400 text-sm"
            >
              Բեռնվում է թույլտվությունները...
            </div>

            <div v-else>
              <div
                v-if="!permissionGroupsKeys.length"
                class="py-10 text-center text-gray-400 text-sm"
              >
                Թույլտվություններ չկան։
              </div>

              <!-- Grouped permissions -->
              <div
                v-for="groupKey in permissionGroupsKeys"
                :key="groupKey"
                class="mb-4 border border-gray-200 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  class="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 text-left text-xs font-semibold text-gray-700"
                  @click="togglePermissionGroup(groupKey)"
                >
                  <span class="uppercase tracking-wide">
                    {{ groupKey || 'general' }}
                  </span>
                  <svg
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    :class="{
                      'rotate-180': openPermissionGroups.includes(groupKey),
                    }"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <transition name="fade">
                  <div
                    v-if="openPermissionGroups.includes(groupKey)"
                    class="divide-y divide-gray-100"
                  >
                    <div
                      v-for="perm in permissionGroups[groupKey]"
                      :key="perm.id"
                      class="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-gray-50"
                    >
                      <div>
                        <div
                          class="text-sm font-medium text-gray-900 flex items-center gap-2"
                        >
                          {{ perm.name }}
                          <span
                            v-if="perm.via_role"
                            class="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5"
                          >
                            Role-ից
                          </span>
                        </div>
                        <div class="mt-0.5 text-xs text-gray-500">
                          <code
                            class="bg-gray-100 rounded px-2 py-0.5 inline-block"
                          >
                            {{ perm.slug }}
                          </code>
                        </div>
                      </div>

                      <div class="flex items-center gap-3 sm:gap-5">
                        <label
                          class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            :checked="userPermissionIds.includes(perm.id)"
                            @change="
                              toggleUserPermission(
                                perm.id,
                                $event.target.checked
                              )
                            "
                          />
                          <span>Տալ անհատական իրավունք</span>
                        </label>

                        <span
                          class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                          :class="
                            perm.effective
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          "
                        >
                          {{ perm.effective ? 'Ակտիվ է' : 'Անջատված է' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>

              <p class="text-[11px] text-gray-400 mt-2">
                Այստեղ փոխում ես միայն
                <strong>օգտատիրոջ անհատական թույլտվությունները</strong>։ Role-ից
                եկող իրավունքները չեն ջնջվում, եթե տակից հանես նշումը։
              </p>
            </div>
          </div>

          <!-- Modal footer -->
          <div
            class="px-5 py-3 border-t bg-gray-50 flex items-center justify-end gap-3"
          >
            <button
              type="button"
              class="inline-flex items-center rounded-xl px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
              @click="closePermissionModal"
            >
              Փակել
            </button>
            <button
              type="button"
              class="inline-flex items-center rounded-xl px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
              :disabled="permissionSaving"
              @click="savePermissions"
            >
              <span
                v-if="permissionSaving"
                class="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></span>
              Պահպանել փոփոխությունները
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },

  async asyncData({ store, route }) {
    // Քաշում ենք աշխատակիցներին և roles-ին
    await Promise.all([
      store.dispatch('users/fetchWorkers'),
      store.dispatch('roles/fetchRoles'),
    ])

    return {
      // query-ից user_id ընդունելու հնարավորություն (եթե ուրիշ էջից գաս)
      initialUserId: route.query.user_id || null,
    }
  },

  data() {
    return {
      search: '',
      roleFilter: '',
      showPermissionModal: false,
      selectedUser: null,

      // permissions data
      permissionLoading: false,
      permissionSaving: false,
      permissionsRaw: [],
      userPermissionIds: [],
      rolePermissionIds: [],
      openPermissionGroups: [],

      initialUserId: null,
    }
  },

  computed: {
    ...mapGetters('workers', {
      workers: 'getWorkers',
    }),
    ...mapGetters('roles', {
      roles: 'roles',
    }),

    filteredWorkers() {
      const term = this.search.toLowerCase().trim()
      const role = this.roleFilter

      return (this.workers || []).filter((u) => {
        const matchSearch =
          !term ||
          (u.name && u.name.toLowerCase().includes(term)) ||
          (u.email && u.email.toLowerCase().includes(term))

        const matchRole =
          !role || (u.role && (u.role.name === role || u.role.slug === role))

        return matchSearch && matchRole
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

  mounted() {
    // Եթե եկել ես route-ով, օրինակ՝ /admin/users/view?user_id=5
    // կփորձենք ավտոմատ բացել նրա permissions-ը
    if (this.initialUserId && this.workers && this.workers.length) {
      const u = this.workers.find(
        (x) => String(x.id) === String(this.initialUserId)
      )
      if (u) {
        this.openPermissionModal(u)
      }
    }
  },

  methods: {
    ...mapActions('workers', ['fetchWorkers']),
    ...mapActions('roles', ['fetchRoles']),

    applyFilters() {
      // client-side filter already works
    },

    resetFilters() {
      this.search = ''
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

        // Բոլոր խմբերը սկզբում բացենք
        this.openPermissionGroups = this.permissionGroupsKeys.slice()
      } catch (e) {
        // error handling if needed
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
        // success toast կարող ես ավելացնել, եթե ունես notification սիստեմ
      } catch (e) {
        // error handling
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
