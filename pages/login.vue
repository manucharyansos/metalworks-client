
<template>
  <div>Login
    <form-base-input label="Email" placeholder="Email" v-model="form.email" type="email"></form-base-input>
    <form-base-input label="Password" placeholder="password" v-model="form.password" type="email"></form-base-input>

    <button @click="send">Login</button>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data () {
    return {
      form: {
        email: "",
        password: ""
      }
    }
  },
  methods: {
    ...mapActions('auth', ["login"]),
    send () {
      // this.login({ commit }, this.form)
    }
  }
}
</script>


<style>
</style>
