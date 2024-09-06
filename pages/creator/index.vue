<template>
  <div class="antialiased bg-gray-50 dark:bg-gray-900">
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

    <aside
      id="drawer-navigation"
      class="fixed top-0 left-0 z-40 w-64 h-screen pt-14 transition-transform -translate-x-full bg-transparent border-r border-neutral-700 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
      aria-label="Sidenav"
    >
      <div
        class="overflow-y-auto py-5 px-3 h-full bg-transparent dark:bg-gray-800"
      >
        <ul class="space-y-2">
          <li>
            <button
              type="button"
              class="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-700 dark:text-white dark:hover:bg-gray-700"
              aria-controls="dropdown-pages"
              data-collapse-toggle="dropdown-pages"
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
            <ul id="dropdown-pages" class="hidden py-2 space-y-2 text-white">
              <li
                class="cursor-pointer mx-6 hover:bg-gray-700 py-1 px-2.5 rounded-xl"
                @click="openTaskDrawer = !openTaskDrawer"
              >
                Task
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
      class="creator p-6 flex items-center justify-center fixed top-20 left-0 right-0 z-10 w-full overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full"
    >
      <!--      create dropdown-->
      <div
        class="relative bg-transparent w-full h-full max-w-md md:h-auto z-20"
      >
        <create-modal
          :open-modal="openTaskDrawer"
          @closeModal="closeModal"
          @addButton="addTask"
        >
          <template #title>
            <input-with-labels
              v-model="task.name"
              type="text"
              placeholder="Title"
              classes="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            />
          </template>
          <template #description>
            <textarea-with-label v-model="task.description" />
          </template>
          <template #check>
            <h3 class="mb-4 font-semibold text-gray-900 dark:text-white">
              Factory
            </h3>
            <ul
              class="w-48 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <li
                class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600"
              >
                <div class="flex items-center ps-3">
                  <input
                    id="laser"
                    v-model="task.role_ids"
                    type="checkbox"
                    :value="1"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  />
                  <label
                    for="laser"
                    class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >Laser</label
                  >
                </div>
              </li>
              <li
                class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600"
              >
                <div class="flex items-center ps-3">
                  <input
                    id="bend"
                    v-model="task.role_ids"
                    type="checkbox"
                    :value="2"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  />
                  <label
                    for="bend"
                    class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >Bend</label
                  >
                </div>
              </li>
              <li
                class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600"
              >
                <div class="flex items-center ps-3">
                  <input
                    id="cutting"
                    v-model="task.role_ids"
                    type="checkbox"
                    :value="3"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  />
                  <label
                    for="cutting"
                    class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >Cutting</label
                  >
                </div>
              </li>
            </ul>
          </template>
        </create-modal>
      </div>
    </main>
  </div>
</template>
<script>
import { mapActions } from 'vuex'
import CreateModal from '~/components/modals/CreateModal.vue'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'

export default {
  name: 'CreatorPage',
  components: { TextareaWithLabel, InputWithLabels, CreateModal },
  layout: 'authLayout',
  middleware: 'creator',
  data() {
    return {
      openTaskDrawer: false,
      task: {
        name: '',
        description: '',
        role_ids: [], // Array to store selected role IDs
      },
      openDropdown: false,
      openNavbar: false,
      scrollX: 0,
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
  // computed: {
  //   this.
  // },
  mounted() {
    window.addEventListener('resize', this.handleScroll)
    this.handleScroll()
    this.fetchOrders()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleScroll)
  },
  methods: {
    ...mapActions('creator', ['fetchOrders', 'createTask']),
    handleScroll() {
      this.scrollX = window.innerWidth
    },
    closeModal(val) {
      this.openTaskDrawer = false
    },
    addTask() {
      this.createTask({
        name: this.task.name,
        description: this.task.description,
        role_ids: this.task.role_ids,
      })
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
