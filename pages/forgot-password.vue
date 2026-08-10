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
        Գաղտնաբառի վերականգնում
      </h1>
      <p class="mb-6 text-sm leading-6 text-gray-600 dark:text-gray-300">
        Մուտքագրեք ձեր էլ․ փոստի հասցեն։ Եթե այդ հասցեով հաշիվ կա, կստանաք գաղտնաբառը փոխելու անվտանգ հղում։
      </p>

      <div
        v-if="successMessage"
        class="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
      >
        {{ successMessage }}
      </div>

      <form @submit.prevent="submit">
        <label class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
          Էլ․ փոստ
        </label>
        <input
          v-model.trim="email"
          type="email"
          autocomplete="email"
          required
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="name@example.com"
        />

        <p v-if="errorMessage" class="mt-3 text-sm text-red-600">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="loading || !email"
          class="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? 'Ուղարկվում է...' : 'Ուղարկել վերականգնման հղումը' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'ForgotPassword',
  layout: 'default',
  data() {
    return {
      email: '',
      loading: false,
      successMessage: '',
    }
  },
  computed: {
    ...mapGetters('authCustom', ['getErrorMessage']),
    errorMessage() {
      return this.successMessage ? '' : this.getErrorMessage
    },
  },
  methods: {
    ...mapActions('authCustom', ['forgotPassword']),
    async submit() {
      if (!this.email || this.loading) return

      this.loading = true
      this.successMessage = ''

      try {
        const result = await this.forgotPassword(this.email)
        if (result?.message) {
          this.successMessage = result.message
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
