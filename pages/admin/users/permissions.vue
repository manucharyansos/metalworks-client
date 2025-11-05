<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-white border-b shadow-sm">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
            Օգտատիրոջ թույլտվություններ
          </h1>
          <p
            v-if="user"
            class="mt-1 text-sm text-gray-500 flex items-center gap-2"
          >
            <span>{{ user.name }}</span>
            <span class="text-gray-400">·</span>
            <span>{{ user.email }}</span>
            <span
              v-if="user.role"
              class="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5"
            >
              {{ user.role.value }}
            </span>
          </p>
        </div>

        <div class="flex items-center gap-3">
          <nuxt-link
            to="/admin/users/view"
            class="inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          >
            ← Վերադառնալ
          </nuxt-link>

          <button
            type="button"
            class="inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
            :disabled="isSaving"
            @click="save"
          >
            <span
              v-if="isSaving"
              class="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            Պահպանել փոփոխությունները
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          v-if="isLoading"
          class="text-center py-16 text-gray-400 animate-pulse"
        >
          Բեռնվում է թույլտվությունները...
        </div>

        <div v-else>
          <div
            v-if="!groupedKeys.length"
            class="py-10 text-center text-gray-400"
          >
            Թույլտվություններ չկան։
          </div>

          <div
            v-for="groupKey in groupedKeys"
            :key="groupKey"
            class="mb-4 border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden"
          >
            <!-- Group Header -->
            <button
              type="button"
              class="w-full flex justify-between items-center px-5 py-3 bg-gray-50 hover:bg-gray-100 text-left text-sm font-semibold text-gray-700"
              @click="toggleGroup(groupKey)"
            >
              <div class="flex items-center gap-2">
                <span class="uppercase tracking-wide text-[11px] text-gray-600">
                  {{ groupKey || 'general' }}
                </span>
                <span class="text-xs text-gray-400">
                  ({{ grouped[groupKey].length }})
                </span>
              </div>
              <svg
                class="w-4 h-4 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': openGroups.includes(groupKey) }"
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

            <!-- Group Body -->
            <transition name="fade">
              <div
                v-if="openGroups.includes(groupKey)"
                class="divide-y divide-gray-100"
              >
                <div
                  v-for="perm in grouped[groupKey]"
                  :key="perm.id"
                  class="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-gray-50 transition"
                >
                  <!-- Left -->
                  <div class="flex flex-col">
                    <span
                      class="text-sm font-medium text-gray-900 flex items-center gap-2"
                    >
                      {{ perm.name }}
                      <span
                        v-if="perm.via_role"
                        class="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5"
                      >
                        Role-ից
                      </span>
                    </span>
                    <code
                      class="text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5 w-fit mt-1"
                    >
                      {{ perm.slug }}
                    </code>
                  </div>

                  <!-- Right -->
                  <div class="flex items-center gap-3 sm:gap-6">
                    <label
                      class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        :checked="selectedUserPermissionIds.includes(perm.id)"
                        @change="
                          togglePermission(perm.id, $event.target.checked)
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

          <p class="text-xs text-gray-400 mt-4">
            Checkbox-ներն управляում են միայն
            <strong>օգտատիրոջ անհատական թույլտվությունները</strong>։ Role-ից
            եկող իրավունքները չեն կորչի, եթե տակից հանես նշումը։
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },

  async asyncData({ $axios, route, redirect }) {
    const id = route.query.id

    if (!id) {
      // եթե id չկա, հետ գնանք users list
      return redirect('/admin/users/view')
    }

    const res = await $axios.$get(`/api/users/${id}/permissions`)

    return {
      user: res.user,
      permissionsRaw: res.permissions || [],
      selectedUserPermissionIds: res.user_permission_ids || [],
    }
  },

  data() {
    return {
      isLoading: false,
      isSaving: false,
      openGroups: [],
    }
  },

  computed: {
    grouped() {
      const g = {}
      this.permissionsRaw.forEach((perm) => {
        const key = perm.group || 'general'
        if (!g[key]) g[key] = []
        g[key].push(perm)
      })
      return g
    },
    groupedKeys() {
      return Object.keys(this.grouped)
    },
  },

  methods: {
    toggleGroup(group) {
      const idx = this.openGroups.indexOf(group)
      if (idx === -1) this.openGroups.push(group)
      else this.openGroups.splice(idx, 1)
    },

    togglePermission(id, checked) {
      const set = new Set(this.selectedUserPermissionIds)
      if (checked) set.add(id)
      else set.delete(id)
      this.selectedUserPermissionIds = Array.from(set)
    },

    async save() {
      if (!this.user) return
      this.isSaving = true
      try {
        await this.$axios.$put(`/api/users/${this.user.id}/permissions`, {
          permissions: this.selectedUserPermissionIds,
        })
        // այստեղ կարող ես success toast մտցնել, եթե ունես notification համակարգ
      } finally {
        this.isSaving = false
      }
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
