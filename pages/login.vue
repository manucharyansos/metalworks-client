<template>
  <div
    class="login_page flex w-full min-h-screen items-center justify-center lg:p-0 p-6"
  >
    <div
      class="grid grid-cols-1 md:grid-cols-2 items-center justify-center w-full mx-auto font-roboto dark:bg-gray-700 md:mt-0 sm:max-w-4xl xl:p-0"
    >
      <!-- Form Container -->
      <div
        class="flex flex-col items-center justify-center md:rounded-tl-3xl rounded-bl-3xl md:rounded-br-none rounded-br-3xl bg-white w-full h-full dark:bg-gray-800 mx-auto md:p-7 p-3 md:order-1 order-2"
      >
        <h2 class="text-black font-bold font-montserrat text-2xl py-8">
          Մուտք գործել
        </h2>

        <!-- Wrap in a form tag -->
        <form class="w-full" @submit.prevent="login">
          <!-- Email Input -->
          <div class="md:mb-6 mb-4 w-full">
            <div class="relative z-0 w-full group">
              <input-with-label-icon
                v-model="email"
                type="email"
                name="email"
                placeholder=" "
                :class="{ 'border-red-500': fieldEmail }"
                label="Էլ․ փոստ"
                label_-id="email-label"
                for_-l-abel="email-label"
              />
            </div>
            <template v-if="fieldEmail">
              <p class="text-red-500 text-xs font-montserrat">
                Խնդրում ենք մուտքագրեկ էլփոստի հասցե:
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
                :class="{ 'border-red-500': fieldPassword }"
                label="Գախտնաբառ"
                label_-id="password"
                for_-l-abel="password"
              />
            </div>
            <template v-if="fieldPassword">
              <p class="text-red-500 text-xs font-montserrat">
                Խնդրում ենք մուտքագրեկ գաղտնաբառ:
              </p>
            </template>
            <p v-if="errors" class="text-red-500 text-xs font-montserrat">
              {{ errors }}
            </p>
          </div>

          <!-- Submit Button and Links -->
          <div class="flex flex-col w-full items-center justify-between">
            <button
              v-if="!loading"
              class="w-full bg-red-600 rounded-2xl hover:bg-red-800 text-white font-bold py-2 px-4 md:my-8 my-4 focus:outline-none focus:shadow-outline"
            >
              Մուտք գործեք
            </button>
            <button
              v-if="loading"
              type="submit"
              disabled
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
              Բեռնվում է...
            </button>
            <div class="flex flex-col items-center justify-center md:mt-4 mt-2">
              <span
                class="font-roboto text-lg m-2 md:mt-4 mt-2 text-gray-800 font-mono dark:text-indigo-50"
              >
                Դեռ գրանցված չե՞ք:
              </span>
              <nuxt-link
                to="/register"
                class="text-xl font-bold font-montserrat m-2 text-cyan-800 dark:text-indigo-300"
              >
                Գրանցվեք
              </nuxt-link>
            </div>
          </div>
        </form>
      </div>

      <!-- Introduction Section -->
      <div
        class="introduction_section flex flex-col w-full md:h-full h-64 rounded-br-none md:rounded-br-3xl rounded-tr-3xl md:rounded-tl-none rounded-tl-3xl items-start justify-between py-6 md:py-40 bg-black px-6 md:order-2 order-1"
      ></div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import inputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
export default {
  name: 'Login',
  components: { inputWithLabelIcon },
  layout: 'default',
  data() {
    return {
      email: '',
      password: '',
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
    ...mapGetters('authCustom', ['getError', 'getErrorMessage']),
    errors() {
      return this.getErrorMessage
    },
  },
  watch: {
    email(val) {
      this.fieldEmail = !val
      this.errorMessage.email = val ? '' : 'Էլ․ հասցեն պարտադիր է։'
    },
    password(val) {
      this.fieldPassword = val.length < 6
      this.errorMessage.password =
        val.length >= 6 ? '' : 'Գաղտնաբառը պետք է լինի առնվազն 6 նիշ:'
    },
  },
  methods: {
    ...mapActions('authCustom', ['loginUser']),
    async login({ commit }, userData) {
      this.loading = true
      try {
        if (this.email && this.password.length >= 6) {
          const response = await this.loginUser(
            {
              data: {
                email: this.email,
                password: this.password,
              },
            },
            userData
          )

          if (response) {
            this.email = ''
            this.password = ''
          } else if (typeof this.getErrorMessage === 'string') {
            this.errorMessage.general = this.getErrorMessage
          } else {
            this.errorMessage = { ...this.getErrorMessage }
          }
        } else {
          this.fieldEmail = !this.email
          this.fieldPassword = this.password.length < 6
        }
      } catch (error) {
        this.errorMessage.general =
          'Մուտք գործելու ժամանակ սխալ է տեղի ունեցել: Խնդրում ենք կրկին փորձել:'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.login_page {
  background: rgb(226, 234, 238);
}
.introduction_section {
  background-color: #f5f5f5;
  background-image: url('@/static/metalworks-logo.jpg');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
</style>
