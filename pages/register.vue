<template>
  <div class="register_page flex w-full items-center justify-center lg:p-0 p-6">
    <div class="flex flex-col md:flex-row items-center justify-center w-full mx-auto font-roboto bg-white rounded-3xl dark:bg-gray-700 md:mt-0 sm:max-w-4xl xl:p-0">
      <!-- Close Button -->
      <div class="absolute top-4 right-4 md:top-12 md:right-12">
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
      <div class="flex flex-col items-center justify-center dark:bg-gray-800 mx-auto md:p-7 p-3 w-full md:order-1 order-2">
        <h2 class="text-black font-bold text-2xl">Sign up</h2>

        <!-- Name Input -->
        <div class="md:mb-6 mb-4 w-full">
          <div class="relative z-0 w-full group">
            <input-with-label-icon
              v-model="name"
              type="text"
              name="name"
              :class="{ active: fieldName }"
              label="Name"
              label_-id="name-label"
              for_-l-abel="name-label"
            />
          </div>
          <template v-if="fieldName">
            <p class="text-red-500 text-xs italic">Please enter your name</p>
          </template>
        </div>

        <!-- Email Input -->
        <div class="md:mb-6 mb-4 w-full">
          <div class="relative z-0 w-full group">
            <input-with-label-icon
              v-model="email"
              type="email"
              name="email"
              placeholder=" "
              :class="{ active: fieldEmail }"
              :label="label.email"
              label_-id="email-label"
              for_-l-abel="email-label"
              label_class="label"
            />
          </div>
          <!-- Uncomment if email validation message is needed -->
          <!-- <template v-if="fieldEmail">
            <p class="text-red-500 text-xs italic">Please choose an email address.</p>
          </template> -->
        </div>

        <!-- Password Input -->
        <div class="md:mb-6 mb-4 w-full">
          <div class="relative z-0 w-full group">
            <input-with-label-icon
              v-model="password"
              type="password"
              name="password"
              placeholder=" "
              :class="{ active: fieldEmail }"
              label="Password"
              label_-id="password"
              for_-l-abel="password"
            />
          </div>
          <template v-if="fieldPassword">
            <p class="text-red-500 text-xs italic">Please choose a password.</p>
          </template>
          <template v-for="error of errorMessages">
            <p
              v-if="getErrorMessage"
              :key="error"
              class="text-red-500 text-xs italic"
            >
              {{ error }}
            </p>
          </template>
        </div>

        <!-- Confirm Password Input -->
        <div class="md:mb-6 mb-4 w-full">
          <div class="relative z-0 w-full group">
            <input-with-label-icon
              v-model="password_confirmation"
              type="password"
              name="password_confirmation"
              :class="{ active: fieldConfirmPassword }"
              label="Confirm Password"
              label_-id="password_confirmation"
              for_-l-abel="password_confirmation"
            />
          </div>
          <template v-if="fieldConfirmPassword">
            <p class="text-red-500 text-xs italic">Please confirm your password.</p>
          </template>
          <template v-for="error of errorMessages">
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
            class="w-full bg-red-600 rounded-2xl hover:bg-red-800 text-white font-bold py-2 px-4 md:my-10 my-4 focus:outline-none focus:shadow-outline"
            @click="sendRegister"
          >
            Sign Up
          </button>
          <div class="flex flex-col items-center justify-center md:mt-4 mt-2">
          <span class="font-roboto text-lg m-2 md:mt-4 mt-2 text-gray-800 font-mono dark:text-indigo-50">
            Already have an account?
          </span>
            <nuxt-link
              to="/login"
              class="text-xl font-bold font-sans italic m-2 text-cyan-800 dark:text-indigo-300"
            >
              Sign in
            </nuxt-link>
          </div>
        </div>
      </div>

      <!-- Side Banner -->
      <div class="flex flex-col w-full h-full rounded-br-none md:rounded-br-3xl rounded-tr-3xl md:rounded-tl-none rounded-tl-3xl items-start justify-between py-6 md:py-40 bg-black px-6 md:order-2 order-1">
        <div class="flex flex-col items-start mb-6">
          <h2 class="text-2xl md:text-4xl font-bold text-stone-400">We gotta</h2>
          <h2 class="text-white font-bold text-4xl">hole</h2>
          <h2 class="text-stone-500 md:text-4xl text-2xl font-bold">lotta options</h2>
        </div>
        <div class="flex flex-col items-start">
          <h2 class="text-white text-base md:text-2xl my-2 font-bold">COUNTERS</h2>
          <h2 class="text-white text-base md:text-2xl my-2 font-bold">HARDWARE INSERTION</h2>
          <h2 class="text-white text-base md:text-2xl my-2 font-bold">TAPPING</h2>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import inputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
export default {
  name: 'Register',
  components: { inputWithLabelIcon },
  layout: 'authLayout',
  middleware: 'auth',
  auth: 'guest',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      fieldName: false,
      fieldEmail: false,
      fieldPassword: false,
      fieldConfirmPassword: false,
      errorMessages: {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      },
      label: {
        email: 'Email Address',
      },
    }
  },
  computed: {
    ...mapGetters('authCustom', ['getErrorMessage']),
  },
  watch: {
    name(val) {
      if (`${val.length}` >= 3) {
        this.fieldName = false
      }
    },
    email(val) {
      if (val) {
        this.fieldEmail = false
      }
    },
    fieldEmail(val) {
      if (val) {
        this.label.email = 'Please choose a email address.'
      }
    },
    password(val) {
      if (`${val.length}` >= 6) {
        this.fieldPassword = false
      }
    },
    password_confirmation(val) {
      if (`${val.length}` >= 6) {
        this.fieldConfirmPassword = false
      }
    },
  },
  methods: {
    ...mapActions('authCustom', ['registerUser']),
    async sendRegister({ commit }, userData) {
      if (
        this.name &&
        this.email &&
        this.password &&
        this.password === this.password_confirmation
      ) {
        const response = await this.registerUser({
          name: this.name,
          email: this.email,
          password: this.password,
          password_confirmation: this.password_confirmation,
        })
        if (response) {
          this.name = ''
          this.email = ''
          this.password = ''
          this.password_confirmation = ''
          await this.$router.push('/login')
        } else {
          this.errorMessages = this.getErrorMessage
        }
      } else {
        if (this.name === '') {
          this.fieldName = true
          if (!this.email) {
            this.fieldEmail = true
          }
          if (!this.password) {
            this.fieldPassword = true
          }
          if (!this.password_confirmation) {
            this.fieldConfirmPassword = true
          }
        }
        if (this.email === '') {
          this.fieldEmail = true
          if (!this.password) {
            this.fieldPassword = true
          }
          if (!this.password_confirmation) {
            this.fieldConfirmPassword = true
          }
        }
        if (this.password === '') {
          this.fieldPassword = true
          if (!this.email) {
            this.fieldEmail = true
          }
        }
      }
    },
  },
}
</script>

<style scoped>
.active {
  border-bottom: 1px solid red;
}
.label {
  color: red;
}
a.sign_in_here {
  /*color: #1a202c !important;*/
}

.register_page {
  background: rgba(64, 64, 64, 1);
  height: 100vh;
}

.hole {
  font-size: 170px;
  line-height: 130px;
}
@media screen and (max-width: 768px) {
  .hole {
    font-size: 100px;
    line-height: 100px;
  }
}
</style>
