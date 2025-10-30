<template>
  <main class="flex flex-row flex-wrap p-4 h-auto pt-20">
    <template v-if="searchFilter">
      <table
        class="w-full text-sm bg-amber-50 border-b-gray-500 text-left rtl:text-right text-gray-500 dark:text-gray-400"
      >
        <thead
          class="text-xs text-gray-700 bg-gray-300 uppercase dark:text-gray-400"
        >
          <tr class="border-b-neutral-700">
            <th scope="col" class="px-3 py-3">Id</th>
            <th scope="col" class="px-3 py-3">Ստեղծման ամսաթիվը</th>
            <th scope="col" class="px-3 py-3">Անհրաժեշտ ավարտի ժամանակը</th>
            <th scope="col" class="px-3 py-3">Պատվերի համարը</th>
            <th scope="col" class="px-3 py-3">Prefix code</th>
            <th scope="col" class="px-3 py-3">Կարգավիճակ</th>
            <th scope="col" class="px-3 py-3">Անուն</th>
            <th scope="col" class="px-3 py-3">Քանակ</th>
            <th scope="col" class="px-3 py-3"></th>
          </tr>
        </thead>
        <tbody
          v-for="(order, index) in searchFilter"
          :key="index"
          class="bg-amber-50"
        >
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th
              v-if="order.id"
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800"
            >
              {{ order?.id }}
            </th>
            <td v-if="order.created_at" class="px-6 py-4">
              {{ order?.created_at }}
            </td>
            <td class="px-6 py-4">
              {{ order?.dates?.finish_date ? order.dates.finish_date : 'null' }}
            </td>
            <td v-if="order.order_number" class="px-6 py-4">
              {{ order?.order_number?.number }}
            </td>
            <td v-if="order.prefix_code" class="px-6 py-4">
              {{ order?.prefix_code?.code }}
            </td>
            <td v-if="order.status" class="px-6 py-4">
              {{ order?.status }}
            </td>
            <td v-if="order.name" class="px-6 py-4">
              {{ order?.name }}
            </td>
            <td v-if="order?.store_link" class="px-12">
              <a class="hover:!text-blue-700" :href="order.store_link?.url"
                >Link</a
              >
            </td>
            <td
              class="px-12 text-indigo-500 border-indigo-500 hover:bg-indigo-500 hover:text-indigo-50 cursor-pointer"
              @click="editOrder(order)"
            >
              Դիտել
            </td>
          </tr>
        </tbody>
      </table>
      <!--      </div>-->
    </template>
  </main>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'AdminPage',
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
  data() {
    return {
      searchable: '',
    }
  },
  computed: {
    ...mapGetters('orders', ['orders']),
    allOrders() {
      return this.orders
    },
    searchFilter() {
      const searchTerm = this.searchable.trim().toLowerCase()
      if (searchTerm === '') {
        return this.allOrders
      }
      return this.allOrders.filter((order) => {
        const orderNumber =
          order.order_number && typeof order.order_number.number === 'string'
            ? order.order_number.number.toLowerCase()
            : ''
        const name =
          order.name && typeof order.name === 'string'
            ? order.name.toLowerCase()
            : ''
        const description =
          order.details && typeof order.description === 'string'
            ? order.description.toLowerCase()
            : ''
        const prefixCode =
          order.prefix_code && typeof order.prefix_code.code === 'string'
            ? order.prefix_code.code.toLowerCase()
            : ''
        return (
          orderNumber.includes(searchTerm) ||
          description.includes(searchTerm) ||
          name.includes(searchTerm) ||
          prefixCode.includes(searchTerm)
        )
      })
    },
  },
  created() {
    this.fetchOrders()
  },
  methods: {
    ...mapActions('orders', ['fetchOrders']),
    editOrder(order) {
      this.$router.push(`/admin/${order.id}`)
    },
  },
}
</script>
