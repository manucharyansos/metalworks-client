<template>
  <main class="login-page min-h-screen bg-slate-100 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
    <div class="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
      <section
        class="grid w-full overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1.02fr_0.98fr]"
      >
        <div class="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div class="mb-10 flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black tracking-tight text-white shadow-sm dark:bg-white dark:text-slate-950">
              MW
            </div>
            <div>
              <p class="text-sm font-black tracking-tight text-slate-950 dark:text-white">MetalWorks</p>
              <p class="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Operations workspace</p>
            </div>
          </div>

          <div class="max-w-md">
            <p class="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Անվտանգ մուտք</p>
            <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">Բարի վերադարձ</h1>
            <p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Մուտք գործեք ձեր աշխատանքային հաշիվ՝ պատվերների, ֆայլերի և արտադրական գործընթացների հետ աշխատելու համար։
            </p>
          </div>

          <form class="mt-9 max-w-md space-y-5" @submit.prevent="login">
            <div>
              <input-with-label-icon
                v-model="email"
                type="email"
                name="email"
                placeholder="name@company.am"
                :classes="fieldEmail ? '!border-rose-400 !ring-4 !ring-rose-50 dark:!ring-rose-950/30' : ''"
                label="Էլ․ փոստ"
                label_-id="email"
                for_-l-abel="email"
              />
              <p v-if="fieldEmail" class="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">
                Խնդրում ենք մուտքագրեք էլ․ փոստի հասցեն։
              </p>
            </div>

            <div>
              <input-with-label-icon
                v-model="password"
                type="password"
                name="password"
                placeholder="••••••••"
                :classes="fieldPassword ? '!border-rose-400 !ring-4 !ring-rose-50 dark:!ring-rose-950/30' : ''"
                label="Գաղտնաբառ"
                label_-id="password"
                for_-l-abel="password"
              />
              <p v-if="fieldPassword" class="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">
                Խնդրում ենք մուտքագրեք գաղտնաբառը։
              </p>
            </div>

            <div
              v-if="errors || errorMessage.general"
              class="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
            >
              <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 9v4m0 4h.01M10.3 3.8 2.9 17a2 2 0 0 0 1.75 3h14.7A2 2 0 0 0 21.1 17L13.7 3.8a2 2 0 0 0-3.4 0Z" />
              </svg>
              <span>{{ errorMessage.general || errors }}</span>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label class="inline-flex cursor-pointer select-none items-center gap-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                <input
                  v-model="remember"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800"
                />
                <span>Հիշել ինձ</span>
              </label>

              <nuxt-link
                :to="localePath('/forgot-password')"
                class="text-sm font-bold text-slate-700 transition hover:text-slate-950 hover:underline dark:text-slate-300 dark:hover:text-white"
              >
                Մոռացե՞լ եք գաղտնաբառը
              </nuxt-link>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus:ring-slate-700"
            >
              <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" />
                <path class="opacity-75" fill="currentColor" d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z" />
              </svg>
              {{ loading ? 'Բեռնվում է...' : 'Մուտք գործել' }}
            </button>
          </form>

          <div class="mt-8 max-w-md border-t border-slate-100 pt-6 dark:border-slate-800">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Դեռ գրանցված չե՞ք։
              <nuxt-link
                :to="localePath('/register')"
                class="ml-1 font-black text-slate-900 transition hover:underline dark:text-white"
              >
                Գրանցվել
              </nuxt-link>
            </p>
          </div>
        </div>

        <aside class="login-visual relative hidden min-h-[720px] overflow-hidden lg:flex lg:flex-col lg:justify-between">
          <div class="absolute inset-0 bg-gradient-to-br from-slate-950/25 via-slate-950/45 to-slate-950/85"></div>
          <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

          <div class="relative z-10 flex items-center justify-between p-8">
            <span class="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-md">
              Internal system
            </span>
          </div>

          <div class="relative z-10 max-w-lg p-10">
            <p class="text-xs font-black uppercase tracking-[0.18em] text-white/60">MetalWorks</p>
            <h2 class="mt-3 text-3xl font-black leading-tight tracking-tight text-white">
              Միասնական աշխատանքային հարթակ ամբողջ արտադրական ընթացքի համար
            </h2>
            <p class="mt-4 max-w-md text-sm leading-6 text-white/70">
              Պատվերներ, ինժեներական ֆայլեր, արտադրամասեր, աշխատակիցներ և վերահսկողություն՝ մեկ համակարգում։
            </p>
            <div class="mt-7 grid grid-cols-3 gap-3">
              <div class="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                <p class="text-[10px] font-bold uppercase tracking-wide text-white/50">Հասանելիություն</p>
                <p class="mt-1 text-sm font-black text-white">Ըստ հաստիքի</p>
              </div>
              <div class="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                <p class="text-[10px] font-bold uppercase tracking-wide text-white/50">Ֆայլեր</p>
                <p class="mt-1 text-sm font-black text-white">Վերահսկվող</p>
              </div>
              <div class="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                <p class="text-[10px] font-bold uppercase tracking-wide text-white/50">Գործընթաց</p>
                <p class="mt-1 text-sm font-black text-white">Արտադրություն</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import inputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'

export default {
  name: 'Login',
  components: { inputWithLabelIcon },
  layout: 'default',
  data() {
    return {
      email: '',
      password: '',
      remember: false,
      fieldEmail: false,
      fieldPassword: false,
      errorMessage: {
        email: '',
        password: '',
        general: '',
      },
      loading: false,
    }
  },
  computed: {
    ...mapGetters('authCustom', ['getError', 'getErrorMessage']),
    errors() {
      return this.getErrorMessage
    },
  },
  watch: {
    email(val) {
      this.fieldEmail = !val
      this.errorMessage.email = val ? '' : 'Էլ․ հասցեն պարտադիր է։'
      if (val) this.errorMessage.general = ''
    },
    password(val) {
      this.fieldPassword = val.length < 6
      this.errorMessage.password =
        val.length >= 6 ? '' : 'Գաղտնաբառը պետք է լինի առնվազն 6 նիշ։'
      if (val) this.errorMessage.general = ''
    },
  },
  methods: {
    ...mapActions('authCustom', ['loginUser']),
    async login() {
      this.loading = true
      this.errorMessage.general = ''
      try {
        if (this.email && this.password.length >= 6) {
          const response = await this.loginUser({
            data: {
              email: this.email,
              password: this.password,
              remember: this.remember,
            },
          })

          if (response) {
            this.email = ''
            this.password = ''

            const role = this.$auth.user.role.name
            const map = {
              admin: '/admin',
              manager: '/manager',
              engineer: '/engineer',
              laser: '/factory/laser',
              bend: '/factory/bend',
              operator: '/factory/bend',
            }

            const target = this.localePath(map[role] || '/')
            await this.$router.replace(target)
          } else if (typeof this.getErrorMessage === 'string') {
            this.errorMessage.general = this.getErrorMessage
          } else {
            this.errorMessage = { ...this.errorMessage, ...this.getErrorMessage }
          }
        } else {
          this.fieldEmail = !this.email
          this.fieldPassword = this.password.length < 6
        }
      } catch (error) {
        this.errorMessage.general =
          'Մուտք գործելու ժամանակ սխալ է տեղի ունեցել։ Խնդրում ենք կրկին փորձել։'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.login-visual {
  background-color: #0f172a;
  background-image: url('/metalworks-logo.jpg');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
</style>
