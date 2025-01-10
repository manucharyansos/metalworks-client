<template>
  <main class="flex flex-row flex-wrap p-4 h-auto pt-20">
    <template v-if="searchFilter">
<!--      <div-->
<!--        v-for="(order, index) in searchFilter"-->
<!--        :key="index"-->
<!--        class="m-3 flex items-start justify-between flex-wrap"-->
<!--      >-->
<!--        <div-->
<!--          class="border-2 border-dashed border-gray-300 rounded-lg p-4 dark:border-gray-600 h-64 cursor-pointer"-->
<!--        >-->
<!--          <p v-if="order.created_at">-->
<!--            <span class="font-bold">Start:</span> {{ order.created_at }}-->
<!--          </p>-->
<!--          <div @click="editOrder(order)">-->
<!--            <div>-->
<!--              <div>-->
<!--                <p v-if="order.status.status === 'in process'">-->
<!--                  <span class="font-bold">Status:</span>-->
<!--                  <span class="bg-blue-700 font-sans italic"-->
<!--                    >{{ order.status.status }}-->
<!--                  </span>-->
<!--                </p>-->
<!--                <p v-if="order.status.status === 'waiting'">-->
<!--                  <span class="font-bold">Status:</span>-->
<!--                  <span class="bg-yellow-700 font-sans italic">-->
<!--                    {{ order.status.status }}</span-->
<!--                  >-->
<!--                </p>-->
<!--              </div>-->
<!--              <div class="flex flex-col items-start justify-start">-->
<!--                <span class="font-bold">Մանրամասներ</span>-->
<!--                <p>Անուն: {{ order.name }}</p>-->
<!--                <p>Քանակ: {{ order.quantity }}</p>-->
<!--                <p class="will-change-auto">-->
<!--                  Նկարագրություն: {{ order.description }}-->
<!--                </p>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--          <p>-->
<!--            <span class="font-bold">Order number:</span>-->
<!--            {{ order.order_number.number }}-->
<!--          </p>-->
<!--          <a-->
<!--            v-if="order.store_link"-->
<!--            target="_blank"-->
<!--            :href="order.store_link.url"-->
<!--            class="font-medium text-blue-600 dark:text-blue-500 hover:underline"-->
<!--            >Read more</a-->
<!--          >-->
<!--        </div>-->
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
              {{ order.id }}
            </th>
            <td v-if="order.created_at" class="px-6 py-4">
              {{ order.created_at }}
            </td>
            <td class="px-6 py-4">
              {{ order.dates.finish_date ? order.dates.finish_date : 'null' }}
            </td>
            <td v-if="order.order_number" class="px-6 py-4">
              {{ order.order_number.number }}
            </td>
            <td v-if="order.prefix_code" class="px-6 py-4">
              {{ order.prefix_code.code }}
            </td>
            <td v-if="order.status" class="px-6 py-4">
              {{ order.status }}
            </td>
            <td v-if="order.name" class="px-6 py-4">
              {{ order.name }}
            </td>
            <td v-if="order.quantity" class="px-6 py-4">
              {{ order.quantity }}
            </td>
            <td v-if="order.store_link" class="px-12">
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
  layout: 'AdminLayout',
  middleware: ['admin', 'roleRedirect'],
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
