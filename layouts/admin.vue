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
          <!-- Permission Link -->
          <li>
            <nuxt-link
              to="/admin/permission"
              exact-active-class="active-link"
              class="flex items-center p-3 text-gray-300 rounded-lg hover:bg-gray-700 group transition-colors duration-200"
              active-class="bg-gray-700 text-white"
              @click="closeSidebar"
            >
              <svg
                fill="currentColor"
                class="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-200"
                viewBox="0 0 1920 1920"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1707 1760c0 29.44-23.893 53.333-53.333 53.333h-320c-29.44 0-53.334-23.893-53.334-53.333v-266.667H1707V1760ZM213.667 1484.053V1337.6c0-86.613 56.426-162.133 140.48-187.947 182.826-56 373.12-82.24 562.346-82.986 146.88.746 292.8 19.413 436.267 54.4-44.053 39.04-72.427 95.466-72.427 158.933v106.667h-106.666v288.32c-87.467 20.266-176.96 31.68-266.667 31.68-144.427 0-423.467-29.334-693.333-222.614ZM1387 1280c0-58.773 47.893-106.667 106.667-106.667 58.773 0 106.666 47.894 106.666 106.667v106.667H1387V1280ZM899.533 106.667h14.934c174.08 0 322.346 122.56 357.653 290.24-30.187 17.493-61.44 29.76-115.52 29.76-69.547 0-101.12-19.947-141.227-45.227-45.653-28.8-97.28-61.44-196.906-61.44-100.374 0-152.32 32.747-198.187 61.653-26.773 16.96-49.813 31.467-82.987 39.147 25.28-177.28 178.134-314.133 362.24-314.133Zm807.467 1280V1280c0-61.653-26.667-116.8-68.587-155.733l.107-.107c-37.867-43.733-123.093-69.76-146.88-76.267-100.373-30.826-202.88-53.013-306.453-67.626C1306.893 894.72 1387 753.813 1387 594.133h-106.667c0 201.707-164.16 365.867-365.866 365.867h-14.934c-201.706 0-365.866-164.16-365.866-365.867v-64.32c66.24-9.173 106.88-34.773 143.573-57.92 40.107-25.28 71.787-45.226 141.227-45.226 68.693 0 100.16 19.84 139.946 45.013 45.867 28.907 97.814 61.653 198.187 61.653 100.373 0 152.533-33.066 202.453-64.746l28.267-18.027-3.84-33.28C1355.427 179.413 1153.72 0 914.467 0h-14.934C638.947 0 427 211.947 427 480v114.133c0 159.787 80.107 300.694 201.92 386.24-103.36 14.507-205.653 36.587-306.133 67.307C193.72 1087.36 107 1203.84 107 1337.6v200.213l21.333 15.894C429.453 1779.627 745.4 1813.333 907 1813.333c90.453 0 180.48-11.52 268.907-30.506 11.306 77.333 77.333 137.173 157.76 137.173h320c88.213 0 160-71.787 160-160v-373.333H1707Z"
                  fill-rule="evenodd"
                />
              </svg>
              <span class="ml-3">Թույլտվություններ</span>
            </nuxt-link>
          </li>

          <!-- You can add more menu items here following the same pattern -->
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
    // Close sidebar when clicking outside on mobile
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
