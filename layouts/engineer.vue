<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Mobile Toggle Button -->
    <button
      class="fixed top-4 right-4 z-50 p-2 rounded-lg lg:hidden bg-white shadow-md hover:bg-gray-200 transition-colors"
      :aria-expanded="isSidebarOpen"
      @click.stop="toggleSidebar"
    >
      <svg
        class="w-6 h-6 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 z-40 w-64 h-screen bg-gray-800 shadow-xl transition-transform duration-300 lg:translate-x-0"
      :class="{ '-translate-x-full': !isSidebarOpen }"
    >
      <!-- Sidebar Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-700"
      >
        <div class="flex items-center space-x-2">
          <svg
            class="w-8 h-8 text-blue-400"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            />
          </svg>
          <span class="text-xl font-semibold text-white">Engineer Panel</span>
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
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="h-full px-3 py-4 overflow-y-auto relative">
        <ul class="space-y-2">
          <!-- Dashboard -->
          <li>
            <nuxt-link
              to="/engineer"
              exact-active-class="engineer-active-link"
              class="flex items-center p-3 text-gray-300 rounded-lg hover:bg-gray-700 group transition-colors"
              active-class="bg-gray-700 text-white"
              @click.native="closeSidebar"
            >
              <svg
                class="w-6 h-6 text-gray-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="ml-3">Գլխավոր</span>
            </nuxt-link>
          </li>
          <!-- PMP Files Link -->
          <li>
            <nuxt-link
              to="/engineer/files"
              exact-active-class="engineer-active-link"
              class="flex items-center p-3 text-gray-300 rounded-lg hover:bg-gray-700 group transition-colors"
              active-class="bg-gray-700 text-white"
              @click.native="closeSidebar"
            >
              <svg
                class="w-6 h-6 text-gray-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="ml-3">Ֆայլեր</span>
            </nuxt-link>
          </li>

          <!-- Create Order Link -->
          <li>
            <nuxt-link
              to="/engineer/orders/create"
              exact-active-class="engineer-active-link"
              class="flex items-center p-3 text-gray-300 rounded-lg hover:bg-gray-700 group transition-colors"
              active-class="bg-gray-700 text-white"
              @click.native="closeSidebar"
            >
              <svg
                class="w-6 h-6 text-gray-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="ml-3">Ստեղծել նոր պատվեր</span>
            </nuxt-link>
          </li>
        </ul>

        <!-- Logout Button -->
        <button
          class="flex items-center justify-center w-full p-3 mt-auto text-gray-300 rounded-lg hover:bg-gray-700 absolute bottom-20 left-0 right-0 mb-4 transition-colors"
          @click.stop="logout"
        >
          <svg
            class="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
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
  data() {
    return {
      isSidebarOpen: false,
    }
  },
  mounted() {
    const handleClickOutside = (e) => {
      const sidebar = document.querySelector('aside')
      const toggleBtn = document.querySelector('[aria-expanded]')

      if (
        this.isSidebarOpen &&
        !sidebar.contains(e.target) &&
        e.target !== toggleBtn
      ) {
        this.closeSidebar()
      }
    }

    document.addEventListener('click', handleClickOutside)

    // Cleanup
    this.$once('hook:beforeDestroy', () => {
      document.removeEventListener('click', handleClickOutside)
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
  z-index: 40;
}

button.lg\:hidden {
  z-index: 50;
}

/* Active link styling */
.router-link-exact-active {
  background-color: #374151;
  color: white;
}
.router-link-exact-active svg {
  color: white;
}

/* Better scrollbar for sidebar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background-color: #374151;
}
::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}
</style>
