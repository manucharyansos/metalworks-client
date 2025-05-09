<template>
  <main class="flex flex-row flex-wrap p-4 h-auto pt-20">
    <!-- Search Input -->
    <div class="w-full mb-4">
      <input
        v-model="searchable"
        type="text"
        placeholder="Փնտրել պատվերներ..."
        class="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <!-- Orders Table -->
    <template v-if="searchFilter.length">
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
            <th scope="col" class="px-3 py-3"></th>
            <th scope="col" class="px-3 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-amber-50">
          <tr
            v-for="(order, index) in searchFilter"
            :key="index"
            class="border-b border-gray-200 dark:border-gray-700"
          >
            <th
              v-if="order.id"
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800"
            >
              {{ order.id }}
            </th>
            <td v-if="order.created_at" class="px-6 py-4">
              {{ formatDate(order.created_at) }}
            </td>
            <td class="px-6 py-4">
              {{ order.dates?.finish_date ? formatDate(order.dates.finish_date) : 'null' }}
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
            <td v-if="order.store_link" class="px-12">
              <a class="hover:!text-blue-700" :href="order.store_link?.url">Link</a>
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
    </template>
    <div v-else class="w-full text-center text-gray-500 py-4">
      Պատվերներ չեն գտնվել
    </div>

    <!-- Pagination Controls -->
    <div v-if="pagination.total > 0" class="w-full mt-4 flex justify-between items-center">
      <div class="text-sm text-gray-600">
        Ցուցադրվում է {{ pagination.from }} - {{ pagination.to }} ընդհանուր {{ pagination.total }}-ից
      </div>
      <div class="flex space-x-2">
        <button
          :disabled="pagination.current_page === 1"
          class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          @click="changePage(pagination.current_page - 1)"
        >
          Նախորդ
        </button>
        <button
          v-for="page in paginationPages"
          :key="page"
          :class="[
            'px-3 py-1 rounded',
            pagination.current_page === page ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300',
          ]"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        <button
          :disabled="pagination.current_page === pagination.last_page"
          class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          @click="changePage(pagination.current_page + 1)"
        >
          Հաջորդ
        </button>
      </div>
    </div>
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'AdminPage',
  layout: 'EngineerLayout',
  middleware: ['engineer', 'roleRedirect'],
  data() {
    return {
      searchable: '',
      perPage: 10,
    }
  },
  computed: {
    ...mapGetters('engineer', ['getOrders', 'getPagination']),
    allOrders() {
      return this.getOrders || []
    },
    pagination() {
      return this.getPagination
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
          order.description && typeof order.description === 'string'
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
    paginationPages() {
      const pages = []
      const maxPagesToShow = 5
      let startPage = Math.max(1, this.pagination.current_page - Math.floor(maxPagesToShow / 2))
      const endPage = Math.min(this.pagination.last_page, startPage + maxPagesToShow - 1)

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1)
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      return pages
    },
  },
  watch: {
    searchable() {
      this.fetchOrders({ page: 1, perPage: this.perPage })
    },
  },
  created() {
    this.fetchOrders({ page: 1, perPage: this.perPage })
  },
  methods: {
    ...mapActions('engineer', ['fetchOrders']),
    editOrder(order) {
      this.$router.push(`/engineer/orders/${order.id}`)
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.fetchOrders({ page, perPage: this.perPage })
      }
    },
    formatDate(date) {
      if (!date) return 'null'
      return new Date(date).toLocaleString('hy-AM', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    calculateTotalQuantity(selectedFiles) {
      if (!selectedFiles || !Array.isArray(selectedFiles)) return 0
      return selectedFiles.reduce((total, file) => total + (file.quantity || 0), 0)
    },
  },
}
</script>

<style scoped>
main {
  min-height: calc(100vh - 5rem);
}
</style>
