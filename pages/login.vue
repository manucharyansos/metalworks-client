
<template>
  <div class="flex bg-neutral-500 w-full h-full items-center justify-center">
    <div class="flex items-center w-full h-4/5 mx-auto font-roboto bg-white rounded-2xl dark:bg-gray-700 md:mt-0 sm:max-w-4xl xl:p-0">
      <div class="flex rounded-3xl bg-white mx-auto flex-row items-center justify-center">
        <div class="flex flex-row items-center justify-between">

          <div class="flex flex-col items-center justify-center dark:bg-gray-800 mx-auto p-7 w-full">
            <h2 class="text-red-600 font-bold text-2xl">Login</h2>
            <div class="mb-6 w-full">
              <div class="relative z-0 w-full mb-6 group">
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
                <p class="text-red-500 text-xs italic">Please choose a email address.</p>
              </template>
            </div>
            <div class="mb-6 w-full">
              <div class="relative z-0 w-full mb-6 group">
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
              <template v-for="error of errorMessage">
                <p v-if="getErrorMessage" :key="error" class="text-red-500 text-xs italic">{{error}}</p>
              </template>
            </div>
            <div class="flex flex-col items-center justify-between" >
              <button
                class=" w-full bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                @click="login"
              >
                Sign In
              </button>
              <div class="flex flex-row items-center mt-4">
                <span class="font-roboto text-sm m-2 text-gray-800 dark:text-indigo-50">Don’t have an account yet?</span>
                <nuxt-link to="/register" class="sign_in_here m-2 text-indigo-800  dark:text-indigo-300"> Sign up </nuxt-link>
              </div>
            </div>
          </div>

          <div class="flex flex-col w-full items-center justify-between bg-neutral-200 rounded-r-3xl">
            <div class="introducing flex flex-col items-center justify-center border-2 m-4 border-red-600">
              <img class="my-10" src="~/static/dimples-1.png" alt="img">
              <p class="text-2xl text-black font-bold italic font-mono my-10">for your sheet metal parts</p>
              <img class="scale-105 my-12" src="~/static/dimple-wide.webp" alt="img">
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import inputWithLabelIcon from "~/components/form/InputWithLabelIcon.vue";
export default {
  name: "Login",
  components: {inputWithLabelIcon},
  layout: 'authLayout',
  data(){
    return {
      // email: 'admin@gmail.com',
      // password: '123456',
      email: "",
      password: "",
      fieldEmail: false,
      fieldPassword: false,
      errorMessage: {
        email: '',
        password: '',
      }
    }
  },
  computed: {
    ...mapGetters('customAuth', ['getErrorMessage'])
  },
  watch: {
    email(val){
      if (val){
        this.fieldEmail = false
      }
    },
    password(val){
      if (`${val.length}` >= 6){
        this.fieldPassword = false
      }
    }
  },
  methods: {
    ...mapActions('customAuth', ['loginUser']),
    async login({commit}, userData){
      if (this.email && this.password){
        const response = await this.loginUser({
          data: {
            email: this.email,
            password: this.password
          }
        }, userData)
        // await this.$auth.fetchUser()
        if (response){
          this.email = ''
          this.password = ''
        }else{
          this.errorMessage = this.getErrorMessage
        }
      }else{
        if (this.email === ''){
          this.fieldEmail = true
          if (this.password === ''){
            this.fieldPassword = true
          }
        }
        if (this.password === ''){
          this.fieldPassword = true
          if (this.email === ''){
            this.fieldEmail = true
          }
        }
      }

    }
  }
}
</script>

<style scoped>
.active{
  border-bottom: 1px solid red;
}
</style>
