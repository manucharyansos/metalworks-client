<template>
  <div
    class="login_page flex w-full items-center justify-center lg:p-0 p-6 min-h-screen"
  >
    <div
      class="flex flex-col md:flex-row items-center justify-center w-full mx-auto font-roboto bg-white rounded-3xl dark:bg-gray-700 md:mt-0 sm:max-w-4xl xl:p-0 relative"
    >
      <!-- Close Button -->
      <div class="absolute top-4 right-4 md:top-12 md:right-12 z-10">
        <NuxtLink to="/">
          <svg
            class="w-6 h-6 text-white dark:text-gray-800"
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
      <div
        class="flex flex-col items-center justify-center dark:bg-gray-800 mx-auto md:p-7 p-4 w-full md:w-1/2 md:order-1 order-2"
      >
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
          <template>
            <p v-if="errors" class="text-red-500 text-xs italic">
              {{ errors }}
            </p>
          </template>
        </div>

        <!-- Submit Button and Links -->
        <div class="flex flex-col w-full items-center justify-between">
          <button
            v-if="!loading"
            class="w-full bg-red-600 rounded-2xl hover:bg-red-800 text-white font-bold py-2 px-4 md:my-8 my-4 focus:outline-none focus:shadow-outline"
            @click="login"
          >
            Sign In
          </button>
          <button
            v-if="loading"
            class="w-full bg-red-600 rounded-2xl text-white font-bold py-2 px-4 md:my-8 my-4 focus:outline-none focus:shadow-outline"
          >
            <svg
              aria-hidden="true"
              role="status"
              class="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="#1C64F2"
              />
            </svg>
            Loading...
          </button>
          <div class="flex flex-col items-center justify-center md:mt-4 mt-2">
            <span
              class="font-roboto text-lg m-2 md:mt-4 mt-2 text-gray-800 font-mono dark:text-indigo-50"
            >
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
      <div
        class="flex flex-col w-full md:w-1/2 items-center justify-center bg-neutral-200 rounded-br-none md:rounded-br-3xl rounded-tr-3xl md:rounded-tl-none rounded-tl-3xl md:py-12 py-6 md:order-2 order-1"
      >
        <div
          class="flex flex-col items-center justify-center border-4 border-red-600 rounded-2xl p-6 m-5 md:m-10"
        >
          <img
            class="w-48 md:w-64 mb-4"
            src="~/static/dimples-1.png"
            alt="Dimples"
          />
          <p
            class="text-center text-xl md:text-2xl font-extrabold italic font-mono mb-4"
          >
            for your sheet metal parts
          </p>
          <img
            class="transform scale-125 mb-4"
            src="~/static/dimple-wide.webp"
            alt="Dimple Wide"
          />
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
      email: 'creator@example.com',
      password: 'password',
      middleware: 'redirectIfAuthenticated',
      fieldEmail: false,
      fieldPassword: false,
      errorMessage: {
        email: '',
        password: '',
      },
      loading: false,
    }
  },
  computed: {
    ...mapGetters('authCustom', ['getErrors', 'getErrorMessages']),
    errors() {
      return this.getErrorMessages
    },
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
    async login() {
      this.loading = true
      try {
        if (this.email && this.password) {
          const response = await this.loginUser({
            data: {
              email: this.email,
              password: this.password,
            },
          })

          if (response) {
            this.email = ''
            this.password = ''
          } else {
            this.errorMessage = this.getErrorMessages
          }
        } else {
          if (!this.email) {
            this.fieldEmail = true
          }

          if (!this.password) {
            this.fieldPassword = true
          }
        }
      } catch (error) {
        this.errorMessage = 'An error occurred during login. Please try again.'
      } finally {
        this.loading = false
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
