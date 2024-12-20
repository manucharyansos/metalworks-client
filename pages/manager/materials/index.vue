<template>
  <div class="shadow-md sm:rounded-lg mt-8">
    <!-- Action & Search Section -->
    <div
      class="flex items-center justify-between flex-row flex-wrap my-8 space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900"
    >
      <!-- Action Button -->
      <div>
        <button
          id="dropdownActionButton"
          data-dropdown-toggle="dropdownAction"
          class="inline-flex items-center mt-12 text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          type="button"
        >
          Action
          <svg
            class="w-2.5 h-2.5 ms-2.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
            aria-hidden="true"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>
        <!-- Dropdown Menu -->
        <div
          id="dropdownAction"
          class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
        >
          <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
            <li>
              <a
                href="#"
                class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >Reward</a
              >
            </li>
            <li>
              <a
                href="#"
                class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >Promote</a
              >
            </li>
            <li>
              <a
                href="#"
                class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >Activate account</a
              >
            </li>
          </ul>
          <div class="py-1">
            <a
              href="#"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
              >Delete User</a
            >
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <input-with-label-icon
        v-model="searchable"
        label="Որոնել"
        type="text"
        label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-3 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
        classes="block px-2.5 mt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      >
        <template #label_svg>
          <svg
            class="w-4 h-4 text-gray-500 dark:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </template>
      </input-with-label-icon>
    </div>

    <!-- Orders Table -->
    <div class="overflow-x-auto">
      <table
        class="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
      >
        <!-- Table Headers -->
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">Name</th>
            <th scope="col" class="px-6 py-3">Start Date</th>
            <th scope="col" class="px-6 py-3">Status</th>
            <th scope="col" class="px-6 py-3">Finish Date</th>
            <th scope="col" class="px-6 py-3">ORDER NUMBER</th>
            <th scope="col" class="px-6 py-3">PREFIX CODE</th>
            <th scope="col" class="px-6 py-3">QUANTITY</th>
          </tr>
        </thead>
        <tbody>
          <!-- Dynamic Rows -->
          <tr
            v-for="material in filteredMaterials"
            :key="material.id"
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <td class="px-6 py-4">{{ material.name }}</td>
            <!--          <td class="px-6 py-4">{{ order.date?.created_at || 'N/A' }}</td>-->
            <!--          <td class="px-6 py-4">{{ order.status || 'Unknown' }}</td>-->
            <!--          <td class="px-6 py-4">{{ order.dates?.finish_date || 'N/A' }}</td>-->
            <!--          <td class="px-6 py-4">{{ order.order_number.number || 'N/A' }}</td>-->
            <!--          <td class="px-6 py-4">{{ order.prefix_code.code || 'N/A' }}</td>-->
            <!--          <td class="px-6 py-4">{{ order.quantity || 'N/A' }}</td>-->
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'

export default {
  components: { InputWithLabelIcon },
  layout: 'ManagerLayout',
  middleware: ['manager', 'roleRedirect'],
  data() {
    return {
      searchable: null,
      materialData: [],
    }
  },
  computed: {
    ...mapGetters('orders', ['orders']),
    filteredMaterials() {
      if (!this.searchable) {
        return this.materialData
      }
      const searchTerm = this.searchable.toLowerCase()
      return this.materialData.filter((material) => {
        return (material.name || '').toLowerCase().includes(searchTerm)
      })
    },
  },

  watch: {
    materials: {
      handler(newMaterials) {
        this.materialData = newMaterials
      },
      immediate: true,
    },
  },
  mounted() {
    this.fetchMaterials()
  },
  methods: {
    ...mapActions('materials', ['fetchMaterials']),
  },
}
</script>
