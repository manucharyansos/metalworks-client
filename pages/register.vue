<template>
  <div>
    <form-base-input v-model="name" type="text" placeholder="Name" label="Name"></form-base-input>
    <form-base-input v-model="email" type="email" placeholder="Email" label="Email"></form-base-input>
    <form-base-input v-model="password" type="email" placeholder="Password" label="Password"></form-base-input>
    <form-base-input v-model="password_confirm" type="email" placeholder="Password Confirm" label="Password confirm"></form-base-input>
    <button @click="reg">Reg</button>
  </div>
</template>
<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      password_confirm: '',
    }
  },
  methods: {
    ...mapActions('customAuth', ['registerUser']),
    reg () {
      this.registerUser({
          data: {
            name: this.name,
            email: this.email,
            password: this.password,
            password_confirm: this.password_confirm,
          }
      })
    }

    // async reg({ commit }, credentials) {
    //   await this.registerUser({
    //     name: this.name,
    //     email: this.email,
    //     password: this.password,
    //     password_confirmation: this.password_confirm
    //   }, credentials)
    // }
  }
}
</script>
