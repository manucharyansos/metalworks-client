<template>
  <div class="w-full mx-auto font-roboto bg-white dark:bg-gray-700 md:mt-0 sm:max-w-md xl:p-0">
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg shadow p-14">
      <div class="mb-6">
        <div class="relative z-0 w-full mb-6 group">
          <input
            id="email"
            v-model="email"
            type="email"
            name="email"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-0 focus:border-indigo-800 peer"
            placeholder=" "
            :class="{ active: fieldEmail }"
          />
          <label
            for="email"
            class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-indigo-800 peer-focus:dark:text-indigo-800 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >Email address
          </label>
        </div>
        <template v-if="fieldEmail">
          <p class="text-red-500 text-xs italic">Please choose a email address.</p>
        </template>
      </div>
      <div class="mb-6">
        <div class="relative z-0 w-full mb-6 group">
          <input
            id="password"
            v-model="password"
            type="password"
            name="password"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-0 focus:border-indigo-800 peer"
            :class="{ active: fieldPassword }"
            placeholder=" "
          />
          <label
            for="password"
            class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-indigo-800 peer-focus:dark:text-indigo-800 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Password
          </label>
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
          class="block w-full bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: "Login",
  layout: 'default',
  data(){
    return {
      email: 'admin@gmail.com',
      password: '123456',
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


      // }
    }
  }
}
</script>

<style scoped>
.active{
  border-bottom: 1px solid red;
}
</style>
