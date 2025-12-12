<template>
  <div class="m-0 p-0 relative min-h-screen bg-gray-100">
    <!-- Mobile Sidebar Toggle Button -->
    <button
      type="button"
      class="fixed top-4 right-4 z-50 p-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-200 focus:outline-none transition-colors duration-200"
      @click="toggleSidebar"
    >
      <span class="sr-only">Open sidebar</span>
      <svg
        class="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clip-rule="evenodd"
        ></path>
      </svg>
    </button>

    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 z-40 w-64 h-screen bg-gray-800 shadow-xl transition-all duration-300 lg:translate-x-0"
      :class="{ '-translate-x-full': !isSidebarOpen }"
      aria-label="Sidebar"
    >
      <!-- Sidebar Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-700"
      >
        <div class="flex items-center space-x-3">
          <svg
            class="w-8 h-8 text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z"
            />
          </svg>
          <span class="text-xl font-semibold text-white">Admin Panel</span>
        </div>
        <button
          class="p-1 rounded-lg lg:hidden text-gray-400 hover:text-white hover:bg-gray-700"
          @click="toggleSidebar"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Sidebar Content -->
      <div class="h-full px-3 py-4 overflow-y-auto relative">
        <ul class="space-y-2">
          <!-- Dashboard Link -->
          <li>
            <nuxt-link
              to="/admin"
              exact-active-class="active-link"
              class="flex items-center p-3 text-gray-300 rounded-lg hover:bg-gray-700 group transition-colors duration-200"
              active-class="bg-gray-700 text-white"
              @click="closeSidebar"
            >
              <svg
                class="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-200"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
              </svg>
              <span class="ml-3">Պատվերներ</span>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              to="/admin/file-extension"
              exact-active-class="active-link"
              class="flex items-center p-3 text-gray-300 rounded-lg hover:bg-gray-700 group transition-colors duration-200"
              active-class="bg-gray-700 text-white"
              @click="closeSidebar"
            >
              <svg
                class="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-200"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
              </svg>
              <span class="ml-3">Ֆայլերի ընդլայնում</span>
            </nuxt-link>
          </li>
          <!-- Users -->
          <li>
            <nuxt-link
              to="/admin/users"
              exact-active-class="active-link"
              class="flex items-center p-3 text-gray-300 rounded-lg hover:bg-gray-700 group transition-colors duration-200"
              active-class="bg-gray-700 text-white"
              @click="closeSidebar"
            >
              <svg
                class="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-200"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="6"
                  r="4"
                  stroke="#1C274C"
                  stroke-width="1.5"
                />
                <path
                  d="M18 9C19.6569 9 21 7.88071 21 6.5C21 5.11929 19.6569 4 18 4"
                  stroke="#1C274C"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M6 9C4.34315 9 3 7.88071 3 6.5C3 5.11929 4.34315 4 6 4"
                  stroke="#1C274C"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M17.1973 15C17.7078 15.5883 18 16.2714 18 17C18 19.2091 15.3137 21 12 21C8.68629 21 6 19.2091 6 17C6 14.7909 8.68629 13 12 13C12.3407 13 12.6748 13.0189 13 13.0553"
                  stroke="#1C274C"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M20 19C21.7542 18.6153 23 17.6411 23 16.5C23 15.3589 21.7542 14.3847 20 14"
                  stroke="#1C274C"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M4 19C2.24575 18.6153 1 17.6411 1 16.5C1 15.3589 2.24575 14.3847 4 14"
                  stroke="#1C274C"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
              <span class="ml-3">Օգտատերեր</span>
            </nuxt-link>
          </li>
        </ul>

        <!-- Logout Button -->
        <button
          class="flex items-center justify-center p-3 w-full mt-auto text-gray-300 rounded-lg hover:bg-gray-700 absolute bottom-20 left-0 right-0 transition-colors duration-200"
          @click="logout"
        >
          <svg
            class="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            ></path>
          </svg>
          <span class="ml-3">Դուրս գալ</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="lg:ml-64 transition-all duration-300">
      <Nuxt />
    </div>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
  data() {
    return {
      isSidebarOpen: false,
    }
  },
  mounted() {
    document.addEventListener('click', (e) => {
      const sidebar = document.querySelector('aside')
      const toggleBtn = document.querySelector('button[aria-expanded]')

      if (
        this.isSidebarOpen &&
        !sidebar.contains(e.target) &&
        !toggleBtn.contains(e.target)
      ) {
        this.closeSidebar()
      }
    })
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },
    closeSidebar() {
      this.isSidebarOpen = false
    },
    logout() {
      this.$auth.logout()
    },
  },
}
</script>

<style scoped>
/* Smooth transitions */
aside {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Active link styling */
.router-link-exact-active {
  @apply bg-gray-700 text-white;
}
.router-link-exact-active svg {
  @apply text-white;
}

/* Better scrollbar for sidebar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  @apply bg-gray-700;
}
::-webkit-scrollbar-thumb {
  @apply bg-gray-600 rounded-full;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}
</style>
