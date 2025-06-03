<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
      <!-- Action & Search Section -->
      <div class="flex flex-col sm:flex-row items-center justify-between p-6 gap-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <!-- Action Button -->
        <div class="relative">
          <button
            id="dropdownActionButton"
            data-dropdown-toggle="dropdownAction"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-blue-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 dark:focus:ring-blue-500 transition-all duration-200"
            type="button"
          >
            Action
            <svg
              class="w-4 h-4 ml-2"
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
            class="z-20 hidden absolute mt-2 w-48 bg-white rounded-lg shadow-lg dark:bg-gray-700 dark:divide-gray-600 ring-1 ring-black ring-opacity-5"
          >
            <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
              <li>
                <a
                  href="#"
                  class="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 dark:hover:text-white transition-colors duration-150"
                >
                  Reward
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 dark:hover:text-white transition-colors duration-150"
                >
                  Promote
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 dark:hover:text-white transition-colors duration-150"
                >
                  Activate account
                </a>
              </li>
            </ul>
            <div class="py-1 border-t border-gray-100 dark:border-gray-600">
              <a
                href="#"
                class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-600 dark:text-red-400 dark:hover:text-white transition-colors duration-150"
              >
                Delete User
              </a>
            </div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="w-full sm:w-auto">
          <input-with-label-icon
            v-model="searchable"
            label="Որոնել"
            type="text"
            label_class="pl-8"
            classes="block w-full sm:w-64 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <template #label_svg>
              <svg
                class="w-5 h-5 text-gray-500 dark:text-gray-400"
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
      </div>

      <!-- Orders Table -->
      <div class="overflow-x-auto">
        <table
          class="w-full text-sm text-left text-gray-600 dark:text-gray-300"
        >
          <!-- Table Headers -->
          <thead
            class="text-xs uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
          >
            <tr>
              <th scope="col" class="px-6 py-4 font-semibold">NAME</th>
              <th scope="col" class="px-6 py-4 font-semibold">PHONE</th>
              <th scope="col" class="px-6 py-4 font-semibold">EMAIL ADDRESS</th>
              <th scope="col" class="px-6 py-4 font-semibold">ADDRESS</th>
            </tr>
          </thead>
          <tbody>
            <!-- Dynamic Rows -->
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150"
            >
              <td class="px-6 py-4">{{ user.name }}</td>
              <td class="px-6 py-4">{{ user?.client?.phone || 'N/A' }}</td>
              <td class="px-6 py-4">{{ user.email || 'N/A' }}</td>
              <td class="px-6 py-4">{{ user?.client?.address || 'Unknown' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
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
      workersData: [],
    }
  },
  computed: {
    ...mapGetters('users', ['getWorkers']),
    filteredUsers() {
      if (!this.searchable) {
        return this.workersData
      }
      const searchTerm = this.searchable.toLowerCase()
      return this.workersData.filter((user) => {
        return (
          (user.name || '').toLowerCase().includes(searchTerm) ||
          (user?.client?.phone || '').toLowerCase().includes(searchTerm) ||
          (user.email || '').toLowerCase().includes(searchTerm)
        )
      })
    },
  },
  watch: {
    getWorkers: {
      handler(newWorks) {
        this.workersData = newWorks
      },
      immediate: true,
    },
  },
  mounted() {
    this.fetchWorkers()
  },
  methods: {
    ...mapActions('users', ['fetchWorkers']),
  },
}
</script>

<style scoped>
/* Add custom styles for enhanced animations or specific tweaks */
table {
  border-collapse: separate;
  border-spacing: 0;
}

th, td {
  min-width: 120px;
}

@media (max-width: 640px) {
  th, td {
    font-size: 0.75rem;
    padding: 0.5rem;
  }
}
</style>
