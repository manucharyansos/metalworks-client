<template>
  <div>
    <aside
      id="drawer-navigation"
      class="fixed top-0 left-0 z-40 w-64 h-screen pt-14 transition-transform -translate-x-full bg-transparent border-r border-neutral-700 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
      aria-label="Sidenav"
    >
      <div
        class="overflow-y-auto py-5 px-3 h-screen bg-transparent dark:bg-gray-800"
      >
        <ul class="space-y-2">
          <li>
            <button
              type="button"
              class="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-700 dark:text-white dark:hover:bg-gray-700"
              @click="openDrawer = !openDrawer"
            >
              <svg
                aria-hidden="true"
                class="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span class="flex-1 ml-3 text-left whitespace-nowrap text-white"
                >Create</span
              >
              <svg
                aria-hidden="true"
                class="w-6 h-6"
                fill="currentColor"
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
              v-if="openDrawer"
              id="dropdown-pages"
              class="py-2 space-y-2 text-white"
            >
              <li
                class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"
              >
                <nuxt-link
                  to="/creator/create/client"
                  class="flex items-center space-x-3 rtl:space-x-reverse"
                  >Clients</nuxt-link
                >
              </li>
              <li
                class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"
              >
                <nuxt-link
                  to="/creator/create/order"
                  class="flex items-center space-x-3 rtl:space-x-reverse"
                  >Orders</nuxt-link
                >
              </li>
            </ul>
          </li>
          <li>
            <a
              href="#"
              class="flex items-center p-2 text-base font-medium text-white rounded-lg hover:bg-gray-700 group"
            >
              <svg
                aria-hidden="true"
                class="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z"
                ></path>
                <path
                  d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
                ></path>
              </svg>
              <span class="flex-1 ml-3 whitespace-nowrap">Messages</span>
              <span
                class="inline-flex justify-center items-center w-5 h-5 text-xs font-semibold rounded-full text-primary-800 bg-primary-100 dark:bg-primary-200 dark:text-primary-800"
              >
                4
              </span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
    <main
      class="creator bg-white dark:bg-gray-700 w-full h-screen flex items-start justify-start"
    >
      <Nuxt />
    </main>
  </div>
</template>
<script>
export default {
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
  //width: 100%;
  //height: 100%;
}
</style>
