<template>
  <div class="m-0 p-0 relative">
    <!-- Sidebar Toggle Button -->
    <button
      type="button"
      class="fixed top-0 right-0 p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none"
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
      <div class="h-full px-3 py-4 overflow-y-auto relative">
        <ul class="mt-6 space-y-2">
          <!-- Dashboard -->
          <li>
            <nuxt-link
              to="/admin"
              class="flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
              @click="closeSidebar"
            >
              <svg
                class="w-8 h-8"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 22 21"
                fill="white"
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
            <nuxt-link
              to="/admin/engineering"
              class="flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
              @click="closeSidebar"
            >
              <svg
                class="w-8 h-8"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 22 21"
                fill="white"
              >
                <path
                  d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"
                />
                <path
                  d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"
                />
              </svg>
              <span class="ms-3">Engineering</span>
            </nuxt-link>
          </li>
        </ul>
        <!-- Logout -->
        <button
          type="button"
          class="flex items-center bottom-6 left-6 p-2 text-gray-50 rounded-lg hover:bg-gray-700 absolute"
          @click="logout"
        >
          <svg
            class="h-8 w-8 text-red-500"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" />
            <path
              d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"
            />
            <path d="M7 12h14l-3 -3m0 6l3 -3" />
          </svg>
          <span class="ms-3">Log out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="lg:ml-64">
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
