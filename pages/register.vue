<template>
  <div
    class="register_page flex w-full h-full items-center justify-center lg:p-0 p-6"
  >
    <div
      class="grid grid-cols-1 md:grid-cols-2 items-center justify-center w-full mx-auto font-roboto dark:bg-gray-700 md:mt-0 sm:max-w-4xl xl:p-0"
    >
      <!-- Close Button -->
      <div class="absolute top-4 right-4 md:top-12 md:right-12">
        <NuxtLink
          to="/"
          class="flex items-center justify-center rounded-full hover:border-2 border-red-400"
        >
          <svg
            class="w-6 h-6 text-white dark:text-gray-800"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="red"
            viewBox="0 0 24 24"
          >
            <path
              stroke="red"
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
        class="flex flex-col items-center justify-center md:rounded-tl-3xl rounded-bl-3xl md:rounded-br-none rounded-br-3xl bg-white w-full h-full dark:bg-gray-800 mx-auto md:p-7 p-3 md:order-1 order-2"
      >
        <h2 class="text-black font-bold italic text-2xl py-8">ԳՐԱՆՑՎԵԼ</h2>

        <!-- Wrap in a form tag for Enter key submission -->
        <form @submit.prevent="sendRegister" class="w-full">
          <!-- Name Input -->
          <div class="md:mb-6 mb-4 w-full">
            <div class="relative z-0 w-full group">
              <input-with-label-icon
                v-model="name"
                type="text"
                name="name"
                :class="{ 'border-red-500': fieldErrors.name }"
                label_class="err"
                :label="label.name"
                label_-id="name-label"
                for_-l-abel="name-label"
              />
              <p v-if="fieldErrors.name" class="text-red-500 text-xs italic">
                {{ fieldErrors.name }}
              </p>
            </div>
          </div>

          <!-- Email Input -->
          <div class="md:mb-6 mb-4 w-full">
            <div class="relative z-0 w-full group">
              <input-with-label-icon
                v-model="email"
                type="email"
                name="email"
                placeholder=" "
                :class="{ 'border-red-500': fieldErrors.email }"
                :label="label.email"
                label_-id="email-label"
                for_-l-abel="email-label"
                label_class="label"
              />
              <p v-if="fieldErrors.email" class="text-red-500 text-xs italic">
                {{ fieldErrors.email }}
              </p>
            </div>
          </div>

          <!-- Password Input -->
          <div class="md:mb-6 mb-4 w-full">
            <div class="relative z-0 w-full group">
              <input-with-label-icon
                v-model="password"
                type="password"
                肢
                name="password"
                placeholder=" "
                :class="{ 'border-red-500': fieldErrors.password }"
                :label="label.password"
                label_-id="password"
                for_-l-abel="password"
              />
              <p
                v-if="fieldErrors.password"
                class="text-red-500 text-xs italic"
              >
                {{ fieldErrors.password }}
              </p>
            </div>
          </div>

          <!-- Confirm Password Input -->
          <div class="md:mb-6 mb-4 w-full">
            <div class="relative z-0 w-full group">
              <input-with-label-icon
                v-model="password_confirmation"
                type="password"
                name="password_confirmation"
                :class="{ 'border-red-500': fieldErrors.password_confirmation }"
                :label="label.confirmPassword"
                label_-id="password_confirmation"
                for_-l-abel="password_confirmation"
              />
              <p
                v-if="fieldErrors.password_confirmation"
                class="text-red-500 text-xs italic"
              >
                {{ fieldErrors.password_confirmation }}
              </p>
            </div>
          </div>

          <!-- Display General Error and Specific Message -->
          <div v-if="error || errorMessage" class="w-full mb-4">
            <p v-if="error" class="text-red-500 text-xs italic">{{ error }}</p>
            <p v-if="errorMessage" class="text-red-500 text-xs italic">
              {{ errorMessage }}
            </p>
          </div>

          <!-- Submit Button and Links -->
          <div class="flex flex-col w-full items-center justify-between">
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-red-600 rounded-2xl hover:bg-red-800 text-white font-bold py-2 px-4 md:my-10 my-4 focus:outline-none focus:shadow-outline"
            >
              {{ loading ? 'Բեռնվում է...' : 'Գրանցվել' }}
            </button>
            <div class="flex flex-col items-center justify-center md:mt-4 mt-2">
              <span
                class="font-roboto text-lg m-2 md:mt-4 mt-2 text-gray-800 font-mono dark:text-indigo-50"
              >
                Արդեն ունե՞ք հաշիվ:
              </span>
              <nuxt-link
                to="/login"
                class="text-xl font-bold font-sans italic m-2 text-cyan-800 dark:text-indigo-300"
              >
                Մուտք գործեք
              </nuxt-link>
            </div>
          </div>
        </form>
      </div>

      <!-- Side Banner -->
      <div
        class="side_banner flex flex-col w-full md:h-full h-64 rounded-br-none md:rounded-br-3xl rounded-tr-3xl md:rounded-tl-none rounded-tl-3xl items-start justify-between py-6 md:py-40 bg-black px-6 md:order-2 order-1"
      ></div>
    </div>
    <!-- Notifications -->
    <notifications />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import inputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'

export default {
  name: 'Register',
  components: { inputWithLabelIcon },
  layout: 'authLayout',
  middleware: ['guest'],
  data() {
    return {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      loading: false,
      fieldErrors: {}, // Store individual field errors here
      label: {
        name: 'Անուն',
        email: 'Էլ․ փոստ',
        password: 'Գախտնաբառ',
        confirmPassword: 'Հաստատեք գաղտնաբառը',
      },
    }
  },
  computed: {
    ...mapGetters('authCustom', ['getError', 'getErrorMessage', 'getUser']),
    error() {
      return this.getError
    },
    errorMessage() {
      return this.getErrorMessage
    },
  },
  methods: {
    ...mapActions('authCustom', ['registerUser']),
    async sendRegister() {
      this.clearErrors()

      if (!this.validateFields()) return

      this.loading = true
      try {
        const response = await this.registerUser({
          name: this.name,
          email: this.email,
          password: this.password,
          password_confirmation: this.password_confirmation,
        })

        if (response) {
          this.$notify({
            text: `Գրանցումը հաջողված է:`,
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'success',
          })
          this.$router.push('/login')
        }
      } catch (error) {
        this.$notify({
          text:
            this.error ||
            'Հաշվի ստեղծման ժամանակ սխալ է տեղի ունեցել: Խնդրում ենք կրկին փորձել:',
          type: 'error',
          duration: 3000,
        })
      } finally {
        this.loading = false
      }
    },
    validateFields() {
      this.fieldErrors = {}
      if (!this.name)
        this.fieldErrors.name = 'Խնդրում ենք մուտքագրել Ձեր անունը'
      if (!this.email)
        this.fieldErrors.email =
          'Խնդրում ենք մուտքագրել էլ․ փոստի հՀաշվի ստեղծման ժամանակ սխալ է տեղի ունեցել: Խնդրում ենք կրկին փորձել:'
      if (this.password.length < 6)
        this.fieldErrors.password = 'Գաղտնաբառը պետք է լինի առնվազն 6 նիշ'
      if (this.password !== this.password_confirmation) {
        this.fieldErrors.password_confirmation = 'Գաղտնաբառերը չեն համընկնում'
      }
      return Object.keys(this.fieldErrors).length === 0
    },
    clearErrors() {
      this.fieldErrors = {}
    },
  },
}
</script>

<style scoped>
.active {
  border-bottom: 2px solid red;
}
.err {
  color: red;
}
.register_page {
  background: rgb(226, 234, 238);
}
.side_banner {
  background-color: #f5f5f5;
  background-image: url('@/static/metalworks-logo.jpg');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
</style>
