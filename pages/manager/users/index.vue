<template>
  <AdminUsersPage />
</template>

<script>
import AdminUsersPage from '@/pages/admin/users/index.vue'

export default {
  name: 'ManagerUsersPage',
  components: { AdminUsersPage },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
  async asyncData({ store }) {
    await Promise.all([
      store.dispatch('users/fetchUsers'),
      store.dispatch('roles/fetchRoles'),
    ])
  },
}
</script>
