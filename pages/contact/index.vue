<template>
  <div class="flex items-center justify-between w-full mt-32 flex-col">
    <h1>Create Order</h1>
    <form @submit.prevent="submitOrder">
      <div class="flex flex-col items-center justify-between">
        <h2>Description</h2>
        <label for="description">Type</label>
        <input v-model="order.details.type" type="text" required />
        <label for="description_qt">Quantity</label>
        <input v-model="order.details.quantity" type="number" required />
        <label for="description">Description</label>
        <textarea v-model="order.details.description"></textarea>
      </div>

      <!--      <div class="flex flex-col items-center justify-between">-->
      <!--        <label>Roles:</label>-->
      <!--&lt;!&ndash;        <div v-for="role in roles" :key="role.id">&ndash;&gt;-->
      <!--&lt;!&ndash;          <input v-model="selectedRoles" type="checkbox" :value="role.id" />&ndash;&gt;-->
      <!--&lt;!&ndash;          <label>{{ role.name }}</label>&ndash;&gt;-->
      <!--&lt;!&ndash;        </div>&ndash;&gt;-->
      <!--      </div>-->

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
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      order: {
        user_id: '',
        order_number: '',
        details: [
          // Change this to an array
          {
            description: '',
            quantity: '',
            type: '',
          },
        ],
        store_link: {
          url: '',
        },
        status_id: null,
      },
      roles: [],
      // selectedRoles: [],
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
    ...mapActions('orders', ['createOrder']),
    async fetchRoles() {
      try {
        const response = await this.$axios.get('/api/roles')
        this.roles = response.data
      } catch (error) {
        // console.error('Failed to fetch roles:', error)
      }
    },
    async submitOrder() {
      const orderData = {
        user_id: this.$auth.user.id,
        details: [
          {
            description: this.order.details.description,
            quantity: this.order.details.quantity,
            type: this.order.details.type,
          },
        ],
        store_link: {
          url: this.order.store_link.url,
        },
        status_id: this.order.status_id,
      }

      try {
        await this.createOrder(orderData)
      } catch (error) {
        console.error('Error creating order:', error.response.data)
      }
    },
  },
}
</script>
