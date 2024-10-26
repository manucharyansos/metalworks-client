<template>
  <div>
    <nav class="bg-transparent px-4 py-2.5 fixed left-0 right-0 top-0 z-50">
      <div class="flex flex-wrap justify-between items-center">
        <NuxtLink
          to="/"
          class="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img
            src="/WhatsApp%20Image%202024-08-24%20at%2013.01.26_24d3ab90.jpg"
            class="h-8 w-8 rounded-full"
            alt="Flow bite Logo"
          />
          <span
            class="self-center text-lg lg:text-xl font-semibold italic font-sans whitespace-nowrap text-white"
            >Metalwork's</span
          >
        </NuxtLink>
        <div
          class="flex items-center ml-auto justify-content-between lg:order-2 space-x-4 lg:space-x-3 rtl:space-x-reverse"
        >
          <div class="flex items-center gap-4 relative">
            <img
              type="button"
              src="~/static/profile-picture-5.jpg"
              class="w-10 h-10 rounded-full cursor-pointer"
              alt="User dropdown"
              @click="openDropdown = !openDropdown"
            />

            <!-- Dropdown menu -->
            <div
              v-if="openDropdown"
              class="absolute bg-neutral-500 top-14 right-2 z-10 divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
            >
              <div class="px-4 py-3 text-sm text-white">
                <div>{{ $auth.user.name }}</div>
                <div class="font-medium truncate">{{ $auth.user.email }}</div>
              </div>
              <ul
                class="py-2 text-sm text-gray-200"
                aria-labelledby="avatarButton"
              >
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-600 text-white"
                    >Dashboard</a
                  >
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-600 text-white"
                    >Settings</a
                  >
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-600 text-white"
                    >Earnings</a
                  >
                </li>
              </ul>
              <div class="py-1">
                <button
                  class="block w-full px-4 py-2 text-sm hover:bg-gray-600 text-white"
                  @click="$auth.logout()"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            @click="openNavbar = !openNavbar"
          >
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
    <!-- Sidebar -->
    <main
      class="creator bg-white dark:bg-gray-700 h-full flex items-center justify-center"
    >
      <Nuxt />
    </main>
  </div>
</template>

<script>
export default {
  name: 'FactoryLayout',
  data() {
    return {
      openDropdown: false,
      openNavbar: false,
      openDrawer: false,
    }
  },
  watch: {
    scrollX: {
      immediate: true,
      deep: true,
      handler(val) {
        this.openNavbar = val > 1024
      },
    },
  },
  mounted() {
    window.addEventListener('resize', this.handleScroll)
    this.handleScroll()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleScroll)
  },
  methods: {
    handleScroll() {
      this.scrollX = window.innerWidth
    },
  },
}
</script>
<style scoped>
.creator {
  background-image: url('/WhatsApp Image 2024-08-24 at 13.01.26_24d3ab90.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  object-fit: cover;
}
</style>
