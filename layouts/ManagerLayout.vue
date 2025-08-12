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
      <div class="relative h-full px-3 py-4 overflow-y-auto">
        <ul class="mt-6 space-y-2">
          <!-- Dashboard -->
          <li>
            <nuxt-link
              to="/manager"
              exact-active-class="manager-active-link"
              class="flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
            >
              <!-- ... (Dashboard icon) ... -->
              Dashboard
            </nuxt-link>
          </li>

          <!-- Messages -->
          <li>
            <nuxt-link
              to="/messages"
              exact-active-class="manager-active-link"
              class="flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
            >
              Հաղորդագրություն
            </nuxt-link>
          </li>

          <!-- Orders -->
          <li class="text-white">
            <nuxt-link
              to="/manager/orders"
              exact-active-class="manager-active-link"
              class="flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
            >
              Պատվերը
            </nuxt-link>
            <!--            <transition name="slide-fade">-->
            <!--              <ul v-if="activeDrawer === 'orders'" class="pl-6 mt-2 space-y-2">-->
            <!--                <li @click="closeSidebar()">-->

            <!--                </li>-->
            <!--                <li @click="closeSidebar()">-->
            <!--                  <nuxt-link-->
            <!--                    to="/manager/create/order"-->
            <!--                    exact-active-class="manager-active-link"-->
            <!--                    class="hover:bg-gray-700 py-1 px-2.5 rounded-xl"-->
            <!--                  >-->
            <!--                    Նոր Պատվեր-->
            <!--                  </nuxt-link>-->
            <!--                </li>-->
            <!--                <li @click="closeSidebar()">-->
            <!--                  <nuxt-link-->
            <!--                    to="/manager/update/order"-->
            <!--                    exact-active-class="manager-active-link"-->
            <!--                    class="hover:bg-gray-700 py-1 px-2.5 rounded-xl"-->
            <!--                  >-->
            <!--                    Թարմացնել Պատվերը-->
            <!--                  </nuxt-link>-->
            <!--                </li>-->
            <!--              </ul>-->
            <!--            </transition>-->
          </li>

          <!-- Products -->
          <li class="text-white">
            <nuxt-link
              to="/manager/products"
              exact-active-class="manager-active-link"
              class="flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
            >
              Ապրանք
            </nuxt-link>
            <!--            <transition name="slide-fade">-->
            <!--              <ul-->
            <!--                v-if="activeDrawer === 'products'"-->
            <!--                class="pl-6 mt-2 space-y-2"-->
            <!--              >-->
            <!--                <li @click="closeSidebar()">-->
            <!--                  <nuxt-link-->
            <!--                    to="/manager/products"-->
            <!--                    exact-active-class="manager-active-link"-->
            <!--                    class="hover:bg-gray-700 py-1 px-2.5 rounded-xl"-->
            <!--                  >-->
            <!--                    Ապրանք-->
            <!--                  </nuxt-link>-->
            <!--                </li>-->
            <!--                <li @click="closeSidebar()">-->
            <!--                  <nuxt-link-->
            <!--                    to="/manager/create/products"-->
            <!--                    exact-active-class="manager-active-link"-->
            <!--                    class="hover:bg-gray-700 py-1 px-2.5 rounded-xl"-->
            <!--                  >-->
            <!--                    Նոր Ապրանք-->
            <!--                  </nuxt-link>-->
            <!--                </li>-->
            <!--              </ul>-->
            <!--            </transition>-->
          </li>

          <!-- Users -->
          <li class="text-white">
            <nuxt-link
              to="/manager/users"
              exact-active-class="manager-active-link"
              class="flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
              >Օգտատերեր</nuxt-link
            >
            <!--            <transition name="slide-fade">-->
            <!--              <ul-->
            <!--                v-if="activeDrawer === 'users'"-->
            <!--                class="py-2 space-y-2 text-white"-->
            <!--              >-->
            <!--                <li-->
            <!--                  class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"-->
            <!--                  @click="closeSidebar()"-->
            <!--                >-->
            <!--                  <nuxt-link-->
            <!--                    to="/manager/users"-->
            <!--                    exact-active-class="manager-active-link"-->
            <!--                    class="flex items-center space-x-3 rtl:space-x-reverse"-->
            <!--                    >Օգտատերեր</nuxt-link-->
            <!--                  >-->
            <!--                </li>-->
            <!--                <li-->
            <!--                  class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"-->
            <!--                  @click="closeSidebar()"-->
            <!--                >-->
            <!--                  <nuxt-link-->
            <!--                    to="/manager/create/users"-->
            <!--                    exact-active-class="manager-active-link"-->
            <!--                    class="flex items-center space-x-3 rtl:space-x-reverse"-->
            <!--                    >Նոր Օգտատերեր</nuxt-link-->
            <!--                  >-->
            <!--                </li>-->
            <!--                <li-->
            <!--                  class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"-->
            <!--                  @click="closeSidebar()"-->
            <!--                >-->
            <!--                  <nuxt-link-->
            <!--                    to="/manager/update/users"-->
            <!--                    exact-active-class="manager-active-link"-->
            <!--                    class="flex items-center space-x-3 rtl:space-x-reverse"-->
            <!--                    >Օգտատերի թարմացում</nuxt-link-->
            <!--                  >-->
            <!--                </li>-->
            <!--              </ul>-->
            <!--            </transition>-->
          </li>

          <!-- Workers -->
          <li class="text-white">
            <nuxt-link
              to="/manager/workers"
              exact-active-class="manager-active-link"
              class="flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
              >Աշխատակիցներ</nuxt-link
            >
            <!--            <transition name="slide-fade">-->
            <!--              <ul-->
            <!--                v-if="activeDrawer === 'workers'"-->
            <!--                class="py-2 space-y-2 text-white"-->
            <!--              >-->
            <!--                <li-->
            <!--                  class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"-->
            <!--                  @click="closeSidebar()"-->
            <!--                >-->
            <!--                  <nuxt-link-->
            <!--                    to="/manager/workers"-->
            <!--                    exact-active-class="manager-active-link"-->
            <!--                    class="flex items-center space-x-3 rtl:space-x-reverse"-->
            <!--                    >Աշխատակիցներ</nuxt-link-->
            <!--                  >-->
            <!--                </li>-->
            <!--                <li-->
            <!--                  class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"-->
            <!--                  @click="closeSidebar()"-->
            <!--                >-->
            <!--                  <nuxt-link-->
            <!--                    to="/manager/create/workers"-->
            <!--                    exact-active-class="manager-active-link"-->
            <!--                    class="flex items-center space-x-3 rtl:space-x-reverse"-->
            <!--                    >Նոր Աշխատակից</nuxt-link-->
            <!--                  >-->
            <!--                </li>-->
            <!--                <li-->
            <!--                  class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"-->
            <!--                  @click="closeSidebar()"-->
            <!--                >-->
            <!--                  <nuxt-link-->
            <!--                    to="/manager/update/workers"-->
            <!--                    exact-active-class="manager-active-link"-->
            <!--                    class="flex items-center space-x-3 rtl:space-x-reverse"-->
            <!--                    >Թարմացում</nuxt-link-->
            <!--                  >-->
            <!--                </li>-->
            <!--              </ul>-->
            <!--            </transition>-->
          </li>

          <!-- Materials -->
          <li class="text-white">
            <nuxt-link
              to="/manager/materials"
              exact-active-class="manager-active-link"
              class="flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
              >Նյութեր</nuxt-link
            >
            <!--            <transition name="slide-fade">-->
            <!--              <ul-->
            <!--                v-if="activeDrawer === 'materials'"-->
            <!--                class="py-2 space-y-2 text-white"-->
            <!--              >-->
            <!--                <li-->
            <!--                  class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"-->
            <!--                  @click="closeSidebar()"-->
            <!--                >-->
            <!--                  <nuxt-link-->
            <!--                    to="/manager/materials"-->
            <!--                    exact-active-class="manager-active-link"-->
            <!--                    class="flex items-center space-x-3 rtl:space-x-reverse"-->
            <!--                    >Նյութեր</nuxt-link-->
            <!--                  >-->
            <!--                </li>-->
            <!--                <li-->
            <!--                  class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"-->
            <!--                  @click="closeSidebar()"-->
            <!--                >-->
            <!--                  <nuxt-link-->
            <!--                    to="/manager/create/materials"-->
            <!--                    exact-active-class="manager-active-link"-->
            <!--                    class="flex items-center space-x-3 rtl:space-x-reverse"-->
            <!--                    >Նոր Նյութեր</nuxt-link-->
            <!--                  >-->
            <!--                </li>-->
            <!--                <li-->
            <!--                  class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"-->
            <!--                  @click="closeSidebar()"-->
            <!--                >-->
            <!--                  <nuxt-link-->
            <!--                    to="/manager/update/materials"-->
            <!--                    exact-active-class="manager-active-link"-->
            <!--                    class="flex items-center space-x-3 rtl:space-x-reverse"-->
            <!--                    >Նյութերի թարմացում</nuxt-link-->
            <!--                  >-->
            <!--                </li>-->
            <!--              </ul>-->
            <!--            </transition>-->
          </li>
        </ul>

        <!-- Logout Button -->
        <button
          type="button"
          class="absolute bottom-6 left-6 flex items-center p-2 text-gray-50 rounded-lg hover:bg-gray-700"
          @click="logout"
        >
          <!-- ... (Logout icon) ... -->
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
      activeDrawer: null,
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },
    closeSidebar() {
      this.isSidebarOpen = false
    },
    closeAllDrawers() {
      this.activeDrawer = null
    },
    toggleDrawer(drawerName) {
      this.activeDrawer = this.activeDrawer === drawerName ? null : drawerName
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

/* Ենթամենյուների անիմացիա */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Սլաքի պտույտի անիմացիա */
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}
</style>
