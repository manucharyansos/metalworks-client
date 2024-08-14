
<template>
  <div>Login
    <form-base-input v-model="form.email" label="Email" placeholder="Email" type="email"></form-base-input>
    <form-base-input v-model="form.password" label="Password" placeholder="password" type="email"></form-base-input>

    <button @click="sendLogin">Login</button>
  </div>
</template>

<script>

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
    sendLogin () {
      this.$auth.loginWith('laravelSanctum', {
        data: {
          email: this.form.email,
          password: this.form.password,
        }
      })
    }
  }
}
</script>


<style>
</style>
