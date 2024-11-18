<template>
  <div>
    <!-- Sidebar Toggle Button -->
    <button
      type="button"
      class="p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none"
      :aria-expanded="isSidebarOpen"
      @click="toggleSidebar"
    >
      <span class="sr-only">Open sidebar</span>
      <svg
        class="w-6 h-6"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
        />
      </svg>
    </button>

    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 z-40 md:w-64 w-full h-screen bg-gray-900 transition-transform lg:translate-x-0"
      :class="{ '-translate-x-full': !isSidebarOpen }"
      aria-label="Sidebar"
    >
      <button
        type="button"
        class="p-2 mt-2 ms-3 float-right text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none"
        :aria-expanded="isSidebarOpen"
        @click="toggleSidebar"
      >
        <span class="sr-only">Open sidebar</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="20"
          height="20"
          viewBox="0 0 120 120"
        >
          <rect
            width="114.551"
            height="15"
            x="2.724"
            y="57.5"
            opacity=".35"
            transform="rotate(-45.001 60 65.001)"
          ></rect>
          <rect
            width="114.551"
            height="15"
            x="2.724"
            y="52.5"
            fill="#ff1200"
            transform="rotate(-45.001 60 60.001)"
          ></rect>
          <rect
            width="15"
            height="114.551"
            x="52.5"
            y="7.724"
            opacity=".35"
            transform="rotate(-45.001 60 65.001)"
          ></rect>
          <rect
            width="15"
            height="114.551"
            x="52.5"
            y="2.724"
            fill="#ff1200"
            transform="rotate(-45.001 60 60.001)"
          ></rect>
        </svg>
      </button>
      <div class="h-full px-3 py-4 overflow-y-auto">
        <ul class="mt-6 space-y-2">
          <!-- Dashboard -->
          <li>
            <nuxt-link
              to="/admin"
              class="flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
              @click="closeSidebar"
            >
              <svg
                class="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 22 21"
              >
                <path
                  d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"
                />
                <path
                  d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"
                />
              </svg>
              <span class="ms-3">Dashboard</span>
            </nuxt-link>
          </li>

          <!-- Logout -->
          <li>
            <button
              type="button"
              class="flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
              @click="logout"
            >
              <svg
                class="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z"
                />
                <path
                  d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z"
                />
              </svg>
              <span class="ms-3">Log out</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="p-4 lg:ml-64">
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
aside {
  transition: transform 0.3s ease-in-out;
}
</style>
