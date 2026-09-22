<template>
  <main class="min-h-screen bg-slate-100 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
    <div class="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
      <section class="grid w-full overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1.02fr_0.98fr]">
        <div class="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div class="mb-9 flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">MW</div>
            <div>
              <p class="text-sm font-black tracking-tight text-slate-950 dark:text-white">MetalWorks</p>
              
            </div>
          </div>

          <div class="max-w-md">
            <p class="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Գրանցում</p>
            <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">Ստեղծեք ձեր հաշիվը</h1>
            <p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Լրացրեք տվյալները՝ համակարգում նոր հաշիվ ստեղծելու համար։
            </p>
          </div>

          <form class="mt-8 max-w-md space-y-5" @submit.prevent="sendRegister">
            <div>
              <input-with-label-icon
                v-model="name"
                type="text"
                name="name"
                placeholder="Անուն Ազգանուն"
                :classes="fieldErrors.name ? '!border-rose-400 !ring-4 !ring-rose-50 dark:!ring-rose-950/30' : ''"
                :label="label.name"
                label_-id="name-label"
                for_-l-abel="name-label"
              />
              <p v-if="fieldErrors.name" class="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">{{ fieldErrors.name }}</p>
            </div>

            <div>
              <input-with-label-icon
                v-model="email"
                type="email"
                name="email"
                placeholder="name@company.am"
                :classes="fieldErrors.email ? '!border-rose-400 !ring-4 !ring-rose-50 dark:!ring-rose-950/30' : ''"
                :label="label.email"
                label_-id="email-label"
                for_-l-abel="email-label"
              />
              <p v-if="fieldErrors.email" class="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">{{ fieldErrors.email }}</p>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <input-with-label-icon
                  v-model="password"
                  type="password"
                  name="password"
                  placeholder="Առնվազն 8 նիշ"
                  :classes="fieldErrors.password ? '!border-rose-400 !ring-4 !ring-rose-50 dark:!ring-rose-950/30' : ''"
                  :label="label.password"
                  label_-id="password"
                  for_-l-abel="password"
                />
                <p v-if="fieldErrors.password" class="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">{{ fieldErrors.password }}</p>
              </div>

              <div>
                <input-with-label-icon
                  v-model="password_confirmation"
                  type="password"
                  name="password_confirmation"
                  placeholder="Կրկին մուտքագրեք"
                  :classes="fieldErrors.password_confirmation ? '!border-rose-400 !ring-4 !ring-rose-50 dark:!ring-rose-950/30' : ''"
                  :label="label.confirmPassword"
                  label_-id="password_confirmation"
                  for_-l-abel="password_confirmation"
                />
                <p v-if="fieldErrors.password_confirmation" class="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">{{ fieldErrors.password_confirmation }}</p>
              </div>
            </div>

            <div v-if="error || errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
              <p v-if="error">{{ error }}</p>
              <p v-if="errorMessage">{{ errorMessage }}</p>
            </div>

            <button type="submit" :disabled="loading" class="app-button-primary w-full gap-2">
              <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" />
                <path class="opacity-75" fill="currentColor" d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z" />
              </svg>
              {{ loading ? 'Բեռնվում է...' : 'Գրանցվել' }}
            </button>
          </form>

          <p class="mt-7 max-w-md border-t border-slate-100 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Արդեն ունե՞ք հաշիվ։
            <nuxt-link :to="localePath('/login')" class="ml-1 font-black text-slate-900 hover:underline dark:text-white">Մուտք գործել</nuxt-link>
          </p>
        </div>

        <aside class="register-visual relative hidden min-h-[760px] overflow-hidden lg:flex lg:flex-col lg:justify-end">
          <div class="absolute inset-0 bg-gradient-to-br from-slate-950/20 via-slate-950/45 to-slate-950/90"></div>
          <div class="relative z-10 p-10">
            
            <h2 class="mt-3 max-w-lg text-3xl font-black leading-tight tracking-tight text-white">Մեկ հաշիվ՝ ձեր ամբողջ աշխատանքային միջավայրի համար</h2>
            <p class="mt-4 max-w-md text-sm leading-6 text-white/70">Հասանելիությունները վերահսկվում են հաստիքներով և թույլտվություններով, որպեսզի յուրաքանչյուր աշխատակից տեսնի միայն իր աշխատանքին անհրաժեշտը։</p>
          </div>
        </aside>
      </section>
    </div>
    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import inputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'

export default {
  name: 'Register',
  components: { inputWithLabelIcon },
  layout: 'default',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      loading: false,
      fieldErrors: {},
      label: {
        name: 'Անուն',
        email: 'Էլ․ փոստ',
        password: 'Գաղտնաբառ',
        confirmPassword: 'Հաստատեք գաղտնաբառը',
      },
    }
  },
  computed: {
    ...mapGetters('authCustom', ['getError', 'getErrorMessage', 'getUser']),
    error() {
      return this.getError
    },
    errorMessage() {
      return this.getErrorMessage
    },
  },
  methods: {
    ...mapActions('authCustom', ['registerUser']),
    async sendRegister() {
      this.clearErrors()

      if (!this.validateFields()) return

      this.loading = true
      try {
        const response = await this.registerUser({
          name: this.name.trim(),
          email: this.email.trim().toLowerCase(),
          password: this.password,
          password_confirmation: this.password_confirmation,
        })

        if (response) {
          this.$notify({
            text: 'Գրանցումը հաջողված է:',
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'success',
          })
          this.$router.push('/login')
        }
      } catch (error) {
        this.$notify({
          text:
            this.error ||
            'Հաշվի ստեղծման ժամանակ սխալ է տեղի ունեցել: Խնդրում ենք կրկին փորձել:',
          type: 'error',
          duration: 3000,
        })
      } finally {
        this.loading = false
      }
    },
    validateFields() {
      this.fieldErrors = {}
      if (!this.name.trim()) {
        this.fieldErrors.name = 'Խնդրում ենք մուտքագրել Ձեր անունը'
      }
      if (!this.email.trim()) {
        this.fieldErrors.email = 'Խնդրում ենք մուտքագրել էլ․ փոստի հասցեն'
      }
      if (this.password.length < 8) {
        this.fieldErrors.password = 'Գաղտնաբառը պետք է լինի առնվազն 8 նիշ'
      }
      if (this.password !== this.password_confirmation) {
        this.fieldErrors.password_confirmation = 'Գաղտնաբառերը չեն համընկնում'
      }
      return Object.keys(this.fieldErrors).length === 0
    },
    clearErrors() {
      this.fieldErrors = {}
    },
  },
}
</script>

<style scoped>
.register-visual {
  background-color: #0f172a;
  background-image: url('/metalworks-logo.jpg');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
</style>
