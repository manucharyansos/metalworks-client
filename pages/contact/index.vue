<template>
  <div class="flex items-center justify-between w-full mt-32 flex-col">
    <h1>Create Order</h1>
    <form @submit.prevent="submitOrder">
      <div class="flex flex-col items-center justify-between">
        <h2>Description</h2>
        <label for="description_name">Name</label>
        <input v-model="order.description.name" type="text" required />
        <label for="description_name">type</label>
        <input v-model="order.description.type" type="text" required />
        <label for="description_details">Details</label>
        <textarea v-model="order.description.description"></textarea>
      </div>

      <div class="flex flex-col items-center justify-between">
        <label>Roles:</label>
        <div v-for="role in roles" :key="role.id">
          <input v-model="selectedRoles" type="checkbox" :value="role.id" />
          <label>{{ role.name }}</label>
        </div>
      </div>
      <div class="flex flex-col items-center justify-between">
        <h2>Prefix Code</h2>
        <label for="prefix_code">Code</label>
        <input v-model="order.prefix_code.code" type="text" required />
      </div>

      <div class="flex flex-col items-center justify-between">
        <h2>Store Link</h2>
        <label for="store_link_url">URL</label>
        <input v-model="order.store_link.url" type="url" required />
      </div>
      <button :disabled="isLoading" type="submit">Create Order</button>
    </form>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  data() {
    return {
      order: {
        order_number: '',
        description: {
          name: '',
          description: '',
          type: '',
        },
        prefix_code: {
          code: '',
        },
        creator: {
          name: this.$auth.user.name,
        },
        store_link: {
          url: '',
        },
        status_id: null,
      },
      roles: [],
      selectedRoles: [],
    }
  },
  computed: {
    ...mapState('orders', ['loading']),
    ...mapGetters('orders', ['error']),
    isLoading() {
      return this.loading
    },
  },
  async created() {
    await this.fetchRoles()
  },
  methods: {
    async fetchRoles() {
      try {
        const response = await this.$axios.get('/api/roles')
        this.roles = response.data
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      }
    },
    async submitOrder() {
      const orderData = {
        description: {
          name: this.order.description.name,
          type: this.order.description.type,
          description: this.order.description.description,
        },
        prefix_code: {
          code: this.order.prefix_code.code,
        },
        store_link: {
          url: this.order.store_link.url,
        },
        status_id: this.order.status_id,
        roles: this.selectedRoles,
      }

      try {
        await this.$store.dispatch('orders/createOrder', orderData)
      } catch (error) {
        console.error('Error creating order:', error.response.data)
      }
    },
  },
}
</script>
