<template>
  <div>
    <form-base-input v-model="name" type="text" placeholder="Name" label="Name"></form-base-input>
    <form-base-input v-model="email" type="email" placeholder="Email" label="Email"></form-base-input>
    <form-base-input v-model="password" type="email" placeholder="Password" label="Password"></form-base-input>
    <form-base-input v-model="password_confirm" type="email" placeholder="Password Confirm" label="Password confirm"></form-base-input>
    <button @click="register">Reg</button>
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
    async register() {
      try {
        await this.$axios.post('/register', {
          email: this.email,
          password: this.password
        },
        );
        this.$router.push('/login');
      } catch (error) {
        console.error('Registration failed:', error);
      }
    }
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
</script>
