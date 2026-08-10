<template>
  <div class="auth-page flex min-h-screen items-center justify-center p-6">
    <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-800 md:p-8">
      <nuxt-link
        :to="localePath('/login')"
        class="mb-6 inline-flex items-center text-sm font-semibold text-cyan-800 hover:underline dark:text-indigo-300"
      >
        ← Վերադառնալ մուտքի էջ
      </nuxt-link>

      <h1 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
        Նոր գաղտնաբառ
      </h1>
      <p class="mb-6 text-sm leading-6 text-gray-600 dark:text-gray-300">
        Ստեղծեք նոր գաղտնաբառ։ Այն պետք է պարունակի առնվազն 8 նիշ։
      </p>

      <div
        v-if="successMessage"
        class="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
      >
        {{ successMessage }}
      </div>

      <div
        v-if="!token || !email"
        class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        Վերականգնման հղումը թերի է։ Խնդրում ենք նոր հղում պահանջել։
      </div>

      <form v-else @submit.prevent="submit">
        <label class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
          Նոր գաղտնաբառ
        </label>
        <input
          v-model="password"
          type="password"
          autocomplete="new-password"
          required
          minlength="8"
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />

        <label class="mb-2 mt-5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
          Կրկնեք գաղտնաբառը
        </label>
        <input
          v-model="passwordConfirmation"
          type="password"
          autocomplete="new-password"
          required
          minlength="8"
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />

        <p v-if="localError" class="mt-3 text-sm text-red-600">
          {{ localError }}
        </p>
        <p v-else-if="errorMessage" class="mt-3 text-sm text-red-600">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="loading || successMessage"
          class="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? 'Պահպանվում է...' : 'Փոխել գաղտնաբառը' }}
        </button>
      </form>

      <nuxt-link
        v-if="successMessage"
        :to="localePath('/login')"
        class="mt-5 block text-center font-semibold text-cyan-800 hover:underline dark:text-indigo-300"
      >
        Մուտք գործել նոր գաղտնաբառով
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'ResetPassword',
  layout: 'default',
  data() {
    return {
      password: '',
      passwordConfirmation: '',
      loading: false,
      successMessage: '',
      localError: '',
    }
  },
  computed: {
    ...mapGetters('authCustom', ['getErrorMessage']),
    token() {
      return this.$route.query.token || ''
    },
    email() {
      return this.$route.query.email || ''
    },
    errorMessage() {
      return this.successMessage ? '' : this.getErrorMessage
    },
  },
  methods: {
    ...mapActions('authCustom', ['resetPassword']),
    async submit() {
      this.localError = ''
      this.successMessage = ''

      if (this.password.length < 8) {
        this.localError = 'Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։'
        return
      }

      if (this.password !== this.passwordConfirmation) {
        this.localError = 'Գաղտնաբառերը չեն համընկնում։'
        return
      }

      if (this.loading) return
      this.loading = true

      try {
        const result = await this.resetPassword({
          token: this.token,
          email: this.email,
          password: this.password,
          password_confirmation: this.passwordConfirmation,
        })

        if (result?.message) {
          this.successMessage = result.message
          this.password = ''
          this.passwordConfirmation = ''
        }
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.auth-page {
  background: rgb(226, 234, 238);
}
</style>
