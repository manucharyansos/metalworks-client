<template>
  <div>
    <form-base-input type="text" placeholder="Name" v-model="name" label="Name"></form-base-input>
    <form-base-input type="email" placeholder="Email" label="Email" v-model="email"></form-base-input>
    <form-base-input type="email" placeholder="Password" label="Password" v-model="password"></form-base-input>
    <form-base-input type="email" placeholder="Password Confirm" label="Password confirm" v-model="password_confirm"></form-base-input>
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
    ...mapActions('auth', ['registerUser']),
    async reg({commit}, userData) {
      await this.registerUser({
        name: this.name,
        email: this.email,
        password: this.password,
        password_confirmation: this.password_confirm
      })
    }
  }
}
</script>
