<template>
  <div class="login_page flex w-full items-center justify-center lg:p-0 p-6 min-h-screen">
    <div class="flex flex-col md:flex-row items-center justify-center w-full mx-auto font-roboto bg-white rounded-3xl dark:bg-gray-700 md:mt-0 sm:max-w-4xl xl:p-0 relative">

      <!-- Close Button -->
      <div class="absolute top-4 right-4 md:top-12 md:right-12 z-10">
        <NuxtLink to="/">
          <svg
            class="w-6 h-6 text-white dark:text-gray-800"
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
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18 17.94 6M18 18 6.06 6"
            />
          </svg>
        </NuxtLink>
      </div>

      <!-- Form Container -->
      <div class="flex flex-col items-center justify-center dark:bg-gray-800 mx-auto md:p-7 p-4 w-full md:w-1/2 md:order-1 order-2">
        <h2 class="text-black font-bold text-2xl md:text-3xl">Login</h2>

        <!-- Email Input -->
        <div class="md:mb-6 mb-4 w-full">
          <div class="relative z-0 w-full group">
            <input-with-label-icon
              v-model="email"
              type="email"
              name="email"
              placeholder=" "
              :class="{ active: fieldEmail }"
              label="Email Address"
              label_-id="email-label"
              for_-l-abel="email-label"
            />
          </div>
          <template v-if="fieldEmail">
            <p class="text-red-500 text-xs italic">
              Please choose an email address.
            </p>
          </template>
        </div>

        <!-- Password Input -->
        <div class="md:mb-6 mb-4 w-full">
          <div class="relative z-0 w-full group">
            <input-with-label-icon
              v-model="password"
              type="password"
              name="password"
              placeholder=" "
              :class="{ active: fieldPassword }"
              label="Password"
              label_-id="password"
              for_-l-abel="password"
            />
          </div>
          <template v-if="fieldPassword">
            <p class="text-red-500 text-xs italic">Please choose a password.</p>
          </template>
          <template v-for="error of errorMessage">
            <p
              v-if="getErrorMessage"
              :key="error"
              class="text-red-500 text-xs italic"
            >
              {{ error }}
            </p>
          </template>
        </div>

        <!-- Submit Button and Links -->
        <div class="flex flex-col w-full items-center justify-between">
          <button
            class="w-full bg-red-600 rounded-2xl hover:bg-red-800 text-white font-bold py-2 px-4 md:my-8 my-4 focus:outline-none focus:shadow-outline"
            @click="login"
          >
            Sign In
          </button>
          <div class="flex flex-col items-center justify-center md:mt-4 mt-2">
          <span class="font-roboto text-lg m-2 md:mt-4 mt-2 text-gray-800 font-mono dark:text-indigo-50">
            Don’t have an account yet?
          </span>
            <nuxt-link
              to="/register"
              class="text-xl font-bold font-sans italic m-2 text-cyan-800 dark:text-indigo-300"
            >
              Sign up
            </nuxt-link>
          </div>
        </div>
      </div>

      <!-- Introduction Section -->
      <div class="flex flex-col w-full md:w-1/2 items-center justify-center bg-neutral-200 rounded-br-none md:rounded-br-3xl rounded-tr-3xl md:rounded-tl-none rounded-tl-3xl md:py-12 py-6 md:order-2 order-1">
        <div class="flex flex-col items-center justify-center border-4 border-red-600 rounded-2xl p-6 m-5 md:m-10">
          <img class="w-48 md:w-64 mb-4" src="~/static/dimples-1.png" alt="Dimples" />
          <p class="text-center text-xl md:text-2xl font-extrabold italic font-mono mb-4">
            for your sheet metal parts
          </p>
          <img class="transform scale-125 mb-4" src="~/static/dimple-wide.webp" alt="Dimple Wide" />
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import inputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
export default {
  name: 'Login',
  components: { inputWithLabelIcon },
  layout: 'authLayout',
  data() {
    return {
      email: 'admin@gmail.com',
      password: '123456',
      // email: '',
      // password: '',
      fieldEmail: false,
      fieldPassword: false,
      errorMessage: {
        email: '',
        password: '',
      },
    }
  },
  computed: {
    ...mapGetters('authCustom', ['getErrorMessage']),
  },
  watch: {
    email(val) {
      if (val) {
        this.fieldEmail = false
      }
    },
    password(val) {
      if (`${val.length}` >= 6) {
        this.fieldPassword = false
      }
    },
  },
  methods: {
    ...mapActions('authCustom', ['loginUser']),
    async login({ commit }, userData) {
      if (this.email && this.password) {
        const response = await this.loginUser(
          {
            data: {
              email: this.email,
              password: this.password,
            },
          },
          userData
        )
        // await this.$auth.fetchUser()
        if (response) {
          this.email = ''
          this.password = ''
        } else {
          this.errorMessage = this.getErrorMessage
        }
      } else {
        if (this.email === '') {
          this.fieldEmail = true
          if (this.password === '') {
            this.fieldPassword = true
          }
        }
        if (this.password === '') {
          this.fieldPassword = true
          if (this.email === '') {
            this.fieldEmail = true
          }
        }
      }
    },
  },
}
</script>

<style scoped>
.login_page {
  background: rgba(64, 64, 64, 1);
  height: 100vh;
}
.active {
  border-bottom: 1px solid red;
}
</style>
