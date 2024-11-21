<template>
  <header class="justify-center">
    <nav
      class="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600"
    >
      <div class="max-w-screen-3xl flex flex-wrap items-center mx-auto p-4">
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
            class="self-center text-lg lg:text-xl font-semibold italic font-sans whitespace-nowrap dark:text-white"
            >Metalwork's</span
          >
        </NuxtLink>
        <div
          class="flex items-center ml-auto justify-content-between lg:order-2 space-x-4 lg:space-x-3 rtl:space-x-reverse"
        >
          <div
            v-if="openSearchInput"
            class="hidden lg:flex"
            :class="{ activeInputStyle: openSearchInput }"
          >
            <input-with-icon
              type="text"
              placeholder="Փնտրել"
              label_class="mb-2 text-sm font-medium text-gray-900 sr-only"
              label="Փնտրել"
            >
              <template #label_svg>
                <svg
                  class="w-5 h-5 text-gray-900 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="red"
                  viewBox="0 0 24 24"
                  :class="{ isActiveInputStyle: openSearchInput }"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-width="2"
                    d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                  />
                </svg>
              </template>
            </input-with-icon>
          </div>
          <div
            class="lg:hidden flex cursor-pointer"
            @click="openSearchInput = !openSearchInput"
          >
            <svg
              class="w-5 h-5 text-gray-900 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="2"
                d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>

          <div v-if="$auth.loggedIn" class="flex items-center gap-4 relative">
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
              class="absolute top-14 right-2 z-10 bg-neutral-100 divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
            >
              <div
                v-if="$auth.user"
                class="px-4 py-3 text-sm text-gray-900 dark:text-white"
              >
                <div>{{ $auth.user.name }}</div>
                <div class="font-medium truncate">{{ $auth.user.email }}</div>
              </div>
              <ul
                class="py-2 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="avatarButton"
              >
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >Dashboard</a
                  >
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >Settings</a
                  >
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >Earnings</a
                  >
                </li>
              </ul>
              <div class="py-1">
                <button
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  @click="$auth.logout()"
                >
                  Դուրս գալ
                </button>
              </div>
            </div>
          </div>
          <div v-else class="lg:flex hidden">
            <NuxtLink
              to="/register"
              class="get_started_button text-sm xl:text-base flex items-center justify-content-center text-white border bg-red-700 border-red-500 mx-2 rounded-xl shadow-2xl hover:translate-y-0.5 hover:shadow-2xl duration-300 py-0.5 px-3"
              >ՍԿՍԵԼ</NuxtLink
            >
            <NuxtLink
              to="/login"
              class="login_button text-sm xl:text-base flex items-center justify-content-center text-red-600 border bg-white border-red-500 rounded-xl mx-2 shadow-2xl hover:translate-y-0.5 hover:shadow-2xl duration-300 py-0.5 px-3"
              >ՄՈՒՏՔ</NuxtLink
            >
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
        <div
          v-if="openNavbar"
          class="items-center duration-700 justify-between w-full lg:flex lg:w-auto lg:order-1 z-50"
        >
          <ul
            class="flex flex-col p-4 lg:p-2 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 lg:space-x-3 rtl:space-x-reverse lg:flex-row lg:mt-0 lg:border-0 lg:bg-white dark:bg-gray-800 lg:dark:bg-gray-900 dark:border-gray-700"
          >
            <!--            <li>-->
            <!--              <NuxtLink-->
            <!--                exact-active-class="active-link"-->
            <!--                class="block uppercase xl:text-base text-sm font-bold py-2 px-2 xl:px-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"-->
            <!--                to="/materials"-->
            <!--              >-->
            <!--                Materials-->
            <!--              </NuxtLink>-->
            <!--            </li>-->
            <li @click="closeNav">
              <NuxtLink
                exact-active-class="active-link"
                class="block uppercase xl:text-base text-sm font-bold py-2 px-2 xl:px-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
                to="/services"
              >
                Ծառայություններ
              </NuxtLink>
            </li>
            <!--            <li>-->
            <!--              <NuxtLink-->
            <!--                exact-active-class="active-link"-->
            <!--                class="block uppercase xl:text-base text-sm font-bold py-2 px-2 xl:px-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"-->
            <!--                to="/resources"-->
            <!--              >-->
            <!--                Resources-->
            <!--              </NuxtLink>-->
            <!--            </li>-->
            <!--            <li>-->
            <!--              <NuxtLink-->
            <!--                exact-active-class="active-link"-->
            <!--                class="block uppercase xl:text-base text-sm font-bold py-2 px-2 xl:px-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"-->
            <!--                to="/examples"-->
            <!--              >-->
            <!--                Examples-->
            <!--              </NuxtLink>-->
            <!--            </li>-->
            <li @click="closeNav">
              <NuxtLink
                exact-active-class="active-link"
                class="block uppercase xl:text-base text-sm font-bold py-2 px-2 xl:px-4 text-gray-700 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
                to="/contact"
              >
                Կոնտակտ
              </NuxtLink>
            </li>
            <li>
              <div
                v-if="!$auth.loggedIn"
                class="lg:hidden flex flex-col"
                @click="closeNav"
              >
                <NuxtLink
                  to="/register"
                  class="get_started_button text-sm xl:text-base flex items-center justify-content-center text-white bg-black p-1.5 w-full my-2"
                  >ՍԿՍԵԼ</NuxtLink
                >
                <NuxtLink
                  to="/login"
                  class="login_button text-sm xl:text-base flex items-center justify-content-center text-red-600 bg-white duration-300 p-1.5 w-full my-2"
                  >ՄՈՒՏՔ</NuxtLink
                >
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>
<script>
import InputWithIcon from '~/components/form/InputWithIcon.vue'
export default {
  name: 'HeaderLayout',
  components: { InputWithIcon },
  data() {
    return {
      openDropdown: false,
      openNavbar: false,
      openSearchInput: false,
      scrollX: 0,
    }
  },
  watch: {
    scrollX: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val > 1024) {
          this.openNavbar = true
          this.openSearchInput = true
        } else {
          this.openNavbar = false
          this.openSearchInput = false
        }
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
    closeNav() {
      if (this.scrollX < 1024) {
        this.openNavbar = false
      }
    },
  },
}
</script>
<style>
.login_button {
  box-shadow: rgba(103, 29, 29, 0.04) 0 0 1px 0,
    rgba(166, 21, 21, 0.87) 0 5px 8px 0;
}
.login_button:hover {
  box-shadow: rgba(103, 29, 29, 0.04) 0 0 1px 0,
    rgba(148, 20, 20, 0.87) 0 2px 4px 0;
}
.get_started_button {
  box-shadow: rgba(80, 20, 20, 0.04) 0 0 1px 0, rgba(66, 6, 6, 0.87) 0 5px 8px 0;
}
.get_started_button:hover {
  box-shadow: rgba(80, 20, 20, 0.04) 0 0 1px 0, rgba(72, 7, 7, 0.87) 0 2px 4px 0;
}

input:focus-visible {
  outline-style: none;
}
.activeInputStyle {
  display: flex;
}
.isActiveInputStyle {
  display: none;
  transition-duration: 1s;
}
</style>
