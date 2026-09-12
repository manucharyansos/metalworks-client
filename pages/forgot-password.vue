<template>
  <main class="min-h-screen bg-slate-100 px-4 py-8 dark:bg-slate-950 sm:px-6">
    <div class="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center justify-center">
      <section class="w-full rounded-[30px] border border-white/70 bg-white p-6 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900 sm:p-9">
        <div class="mb-8 flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">MW</div>
          <div>
            <p class="text-sm font-black tracking-tight text-slate-950 dark:text-white">MetalWorks</p>
            <p class="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Account recovery</p>
          </div>
        </div>

        <nuxt-link
          :to="localePath('/login')"
          class="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
        >
          <span>←</span> Վերադառնալ մուտքի էջ
        </nuxt-link>

        <div class="mt-7">
          <p class="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Վերականգնում</p>
          <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Մոռացե՞լ եք գաղտնաբառը</h1>
          <p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Մուտքագրեք ձեր էլ․ փոստի հասցեն։ Եթե այդ հասցեով հաշիվ կա, կստանաք գաղտնաբառը փոխելու անվտանգ հղում։
          </p>
        </div>

        <div
          v-if="successMessage"
          class="mt-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
        >
          <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m5 12 4 4L19 6" /></svg>
          <span>{{ successMessage }}</span>
        </div>

        <form class="mt-7 space-y-5" @submit.prevent="submit">
          <label class="block">
            <span class="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Էլ․ փոստ</span>
            <input
              v-model.trim="email"
              type="email"
              autocomplete="email"
              required
              class="app-control"
              placeholder="name@company.am"
            />
          </label>

          <p v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
            {{ errorMessage }}
          </p>

          <button type="submit" :disabled="loading || !email" class="app-button-primary w-full gap-2">
            <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" />
              <path class="opacity-75" fill="currentColor" d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z" />
            </svg>
            {{ loading ? 'Ուղարկվում է...' : 'Ուղարկել վերականգնման հղումը' }}
          </button>
        </form>

        <p class="mt-7 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-400 dark:border-slate-800">
          Անվտանգության համար համակարգը չի հայտնում՝ նշված հասցեով հաշիվ գոյություն ունի, թե ոչ։
        </p>
      </section>
    </div>
  </main>
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
