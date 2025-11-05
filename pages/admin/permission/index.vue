<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="px-4 sm:px-6 lg:px-8 py-6 border-b bg-white">
      <div
        class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
            Թույլտվությունների կառավարում
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Ստեղծիր, խմբագրիր և ջնջիր համակարգի permissions-ները։
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          @click="openCreateModal"
        >
          <span class="mr-2 text-lg leading-none">＋</span>
          Նոր թույլտվություն
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 sm:px-6 lg:px-8 py-6">
      <div class="max-w-7xl mx-auto space-y-6">
        <PermissionsToolbar
          :search="search"
          :loading="isLoading"
          @update:search="onUpdateSearch"
          @apply="applySearch"
          @reset="resetSearch"
        />

        <PermissionsTable
          :permissions="permissions"
          :meta="meta"
          :loading="isLoading"
          @edit="openEditModal"
          @delete="confirmDelete"
          @page-change="changePage"
        />
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <PermissionModal
      :show="isModalOpen"
      :loading="isSubmitting"
      :errors="errors"
      :initial-permission="editingPermission"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- Delete Confirm Modal -->
    <DeletePermissionModal
      :show="!!deleteTarget"
      :permission="deleteTarget"
      @cancel="deleteTarget = null"
      @confirm="deletePermission"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PermissionsToolbar from '@/components/permissions/PermissionsToolbar.vue'
import PermissionsTable from '@/components/permissions/PermissionsTable.vue'
import PermissionModal from '@/components/permissions/PermissionModal.vue'
import DeletePermissionModal from '@/components/permissions/DeletePermissionModal.vue'

export default {
  components: {
    PermissionsToolbar,
    PermissionsTable,
    PermissionModal,
    DeletePermissionModal,
  },
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },

  // server-side սկսենք store-ից
  async asyncData({ store, query }) {
    const page = query.page || 1
    const search = query.search || ''

    await store.dispatch('permissions/fetchPermissions', { page, search })
  },

  data() {
    return {
      isModalOpen: false,
      isSubmitting: false,
      editingPermission: null,
      errors: {},
      deleteTarget: null,
    }
  },

  computed: {
    ...mapGetters('permissions', {
      permissions: 'permissions',
      meta: 'permissionsMeta',
      search: 'permissionsSearch',
      isLoading: 'permissionsIsLoading',
    }),
  },

  methods: {
    ...mapActions('permissions', {
      fetchPermissionsAction: 'fetchPermissions',
      setSearch: 'setSearch',
      createPermissionAction: 'createPermission',
      updatePermissionAction: 'updatePermission',
      deletePermissionAction: 'deletePermission',
    }),

    async fetchPermissionsWithRouting(page = 1) {
      await this.fetchPermissionsAction({ page, search: this.search })

      // update URL query
      this.$router.replace({
        query: {
          ...this.$route.query,
          page,
          search: this.search || undefined,
        },
      })
    },

    applySearch() {
      this.fetchPermissionsWithRouting(1)
    },

    onUpdateSearch(value) {
      this.setSearch(value)
    },

    resetSearch() {
      this.setSearch('')
      this.fetchPermissionsWithRouting(1)
    },

    changePage(page) {
      if (this.meta && page === this.meta.current_page) return
      this.fetchPermissionsWithRouting(page)
    },

    openCreateModal() {
      this.editingPermission = null
      this.errors = {}
      this.isModalOpen = true
    },

    openEditModal(permission) {
      this.editingPermission = { ...permission }
      this.errors = {}
      this.isModalOpen = true
    },

    closeModal() {
      this.isModalOpen = false
      this.isSubmitting = false
      this.errors = {}
    },

    async handleSave(payload) {
      this.isSubmitting = true
      this.errors = {}

      try {
        if (payload.id) {
          await this.updatePermissionAction(payload)
        } else {
          await this.createPermissionAction(payload)
        }

        this.closeModal()
        const page = this.meta?.current_page || 1
        await this.fetchPermissionsWithRouting(page)
      } catch (e) {
        if (e.response && e.response.status === 422) {
          this.errors = e.response.data.errors || {}
        }
      } finally {
        this.isSubmitting = false
      }
    },

    confirmDelete(permission) {
      this.deleteTarget = permission
    },

    async deletePermission() {
      if (!this.deleteTarget) return
      try {
        await this.deletePermissionAction(this.deleteTarget.id)
        this.deleteTarget = null
        const page = this.meta?.current_page || 1
        await this.fetchPermissionsWithRouting(page)
      } catch (e) {
        // error handling if needed
      }
    },
  },
}
</script>
