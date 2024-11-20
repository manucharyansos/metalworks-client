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
        class="mt-2 ms-3 p-4 float-right text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none"
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
      <div class="relative h-full px-3 py-4 overflow-y-auto">
        <ul class="mt-6 space-y-2">
          <li>
            <nuxt-link
              to="/creator"
              class="flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
              @click="closeSidebar"
            >
              <svg
                class="w-8 h-8"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
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
          </li>
          <li class="text-white">
            <button
              type="button"
              class="flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700 w-full"
              @click="toggleDrawer"
            >
              <svg
                class="w-8 h-8 fill-white"
                viewBox="0 0 384 512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                <path
                  d="M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H282.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM72 272a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm104-16H304c8.8 0 16 7.2 16 16s-7.2 16-16 16H176c-8.8 0-16-7.2-16-16s7.2-16 16-16zM72 368a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm88 0c0-8.8 7.2-16 16-16H304c8.8 0 16 7.2 16 16s-7.2 16-16 16H176c-8.8 0-16-7.2-16-16z"
                ></path>
              </svg>

              <span class="flex-1 ml-3 text-left whitespace-nowrap text-white"
                >Պատվերներ</span
              >
              <svg
                aria-hidden="true"
                class="w-6 h-6 float-right"
                fill="white"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
            <ul v-if="isDrawerOpen" class="pl-6 mt-2 space-y-2">
              <li @click="closeSidebar">
                <nuxt-link
                  to="/creator/orders"
                  class="hover:bg-gray-700 py-1 px-2.5 rounded-xl"
                >
                  Պատվերը
                </nuxt-link>
              </li>
              <li @click="closeSidebar">
                <nuxt-link
                  to="/creator/create/order"
                  class="hover:bg-gray-700 py-1 px-2.5 rounded-xl"
                >
                  Նոր Պատվեր
                </nuxt-link>
              </li>
              <li @click="closeSidebar">
                <nuxt-link
                  to="/creator/update/order"
                  class="hover:bg-gray-700 py-1 px-2.5 rounded-xl"
                >
                  Թարմացնել Պատվերը
                </nuxt-link>
              </li>
            </ul>
          </li>
          <li>
            <button
              type="button"
              class="flex items-center p-2 w-full text-base font-medium cursor-pointer text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-700 dark:text-white dark:hover:bg-gray-700"
              @click="openUserDrawer = !openUserDrawer"
            >
              <svg
                class="h-8 w-8 text-white"
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
                <circle cx="9" cy="7" r="4" />
                <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
              </svg>
              <span class="flex-1 ml-3 text-left whitespace-nowrap text-white"
                >Օգտատերեր</span
              >
              <svg
                aria-hidden="true"
                class="w-6 h-6"
                fill="white"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
            <ul
              v-if="openUserDrawer"
              id="dropdown-pages"
              class="py-2 space-y-2 text-white"
            >
              <li
                class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"
                @click="closeSidebar"
              >
                <nuxt-link
                  to="/creator/users"
                  class="flex items-center space-x-3 rtl:space-x-reverse"
                  >Օգտատերեր</nuxt-link
                >
              </li>
              <li
                class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"
                @click="closeSidebar"
              >
                <nuxt-link
                  to="/creator/create/users"
                  class="flex items-center space-x-3 rtl:space-x-reverse"
                  >Նոր Օգտատերեր</nuxt-link
                >
              </li>
              <li
                class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"
                @click="closeSidebar"
              >
                <nuxt-link
                  to="/creator/update/users"
                  class="flex items-center space-x-3 rtl:space-x-reverse"
                  >Օգտատերի թարմացում</nuxt-link
                >
              </li>
            </ul>
          </li>
        </ul>
        <button
          type="button"
          class="absolute bottom-6 left-6 flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
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
      isDrawerOpen: false,
      openUserDrawer: false,
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },
    closeSidebar() {
      this.isSidebarOpen = false
    },
    toggleDrawer() {
      this.isDrawerOpen = !this.isDrawerOpen
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
