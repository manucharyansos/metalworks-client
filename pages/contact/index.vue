<template>
  <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
    <!-- Hero -->
    <section
      class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-stone-50 border"
    >
      <div class="absolute inset-0 pointer-events-none opacity-10">
        <img src="/80240729.jpg" alt="" class="w-full h-full object-cover" />
      </div>
      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">
        <div class="flex flex-col justify-center">
          <h1
            class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900"
          >
            Կապ մեզ հետ
          </h1>
          <p class="mt-4 text-neutral-600 leading-relaxed">
            Մեր գործարանը գտնվում է Երևանում։ Ուրախ կլինենք օգնել գնագոյացման,
            սարքավորումների, նյութերի և գործընթացների վերաբերյալ հարցերով։ Եկե՛ք
            միասին մի բան պատրաստենք։
          </p>

          <!-- Quick facts -->
          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div class="rounded-xl bg-white/70 backdrop-blur border p-4">
              <p class="font-semibold text-neutral-800">Աշխ. ժամեր</p>
              <p class="text-neutral-600">Երկուշաբթի–Ուրբաթ • 09:00–18:00</p>
            </div>
            <div class="rounded-xl bg-white/70 backdrop-blur border p-4">
              <p class="font-semibold text-neutral-800">Հասցե</p>
              <p class="text-neutral-600">Երևան, Ռաֆֆու 111</p>
            </div>
          </div>
        </div>

        <!-- Contact form (FIRST) -->
        <div class="relative">
          <div class="rounded-2xl bg-white border shadow-sm p-6 sm:p-8">
            <h2 class="text-xl font-semibold text-neutral-800 mb-4">
              Գրեք մեզ
            </h2>

            <form @submit.prevent="onSubmit" novalidate>
              <!-- Name -->
              <div class="mb-4">
                <label
                  for="name"
                  class="block text-sm font-medium text-neutral-700"
                >
                  Անուն <span class="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  v-model.trim="form.name"
                  type="text"
                  inputmode="text"
                  autocomplete="name"
                  :aria-invalid="Boolean(errors.name)"
                  :aria-describedby="errors.name ? 'name-error' : null"
                  class="mt-1 w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <p
                  v-if="errors.name"
                  id="name-error"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ errors.name }}
                </p>
              </div>

              <!-- Email -->
              <div class="mb-4">
                <label
                  for="email"
                  class="block text-sm font-medium text-neutral-700"
                >
                  Էլ․ փոստ <span class="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  v-model.trim="form.email"
                  type="email"
                  inputmode="email"
                  autocomplete="email"
                  :aria-invalid="Boolean(errors.email)"
                  :aria-describedby="errors.email ? 'email-error' : null"
                  class="mt-1 w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <p
                  v-if="errors.email"
                  id="email-error"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ errors.email }}
                </p>
              </div>

              <!-- Phone (optional) -->
              <div class="mb-4">
                <label
                  for="phone"
                  class="block text-sm font-medium text-neutral-700"
                >
                  Հեռախոս (ոչ պարտադիր)
                </label>
                <input
                  id="phone"
                  v-model.trim="form.phone"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel"
                  class="mt-1 w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+374 ..."
                />
              </div>

              <!-- Message -->
              <div class="mb-6">
                <label
                  for="message"
                  class="block text-sm font-medium text-neutral-700"
                >
                  Հաղորդագրություն <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  v-model.trim="form.message"
                  rows="5"
                  :aria-invalid="Boolean(errors.message)"
                  :aria-describedby="errors.message ? 'message-error' : null"
                  class="mt-1 w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
                <p
                  v-if="errors.message"
                  id="message-error"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ errors.message }}
                </p>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white font-semibold px-4 py-2 hover:bg-indigo-700 disabled:opacity-60"
              >
                <svg
                  v-if="isSubmitting"
                  class="animate-spin -ml-1 mr-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Ուղարկել
              </button>

              <!-- Fallback inline notice -->
              <p
                v-if="notice.text"
                :class="[
                  'mt-3 text-sm',
                  notice.type === 'success'
                    ? 'text-emerald-700'
                    : 'text-red-600',
                ]"
              >
                {{ notice.text }}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Info + Map -->
    <section class="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 rounded-2xl bg-white border shadow-sm p-6">
        <h3 class="text-lg font-semibold text-neutral-800 mb-4">
          Մեր մասին մի քիչ
        </h3>
        <p class="text-neutral-600 leading-relaxed">
          Մենք հավատարիմ ենք բացառիկ ծառայությանը և ձգտում ենք պատասխանել մինչև
          4 աշխատանքային ժամում։ Տեխնիկական հարցերի համար մեզ գրելն է ամենաարագ
          ճանապարհը։
        </p>

        <div class="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
          <div class="rounded-xl bg-stone-50 border p-4">
            <p class="font-semibold text-neutral-800">Էլ․ փոստ</p>
            <a
              href="mailto:info@metalworks.am"
              class="text-indigo-600 hover:underline"
              >info@metalworks.am</a
            >
          </div>
          <div class="rounded-xl bg-stone-50 border p-4">
            <p class="font-semibold text-neutral-800">Հեռախոս</p>
            <a href="tel:+37498025044" class="text-neutral-700 hover:underline"
              >+374 98 02 50 44</a
            >
          </div>
          <div class="rounded-xl bg-stone-50 border p-4">
            <p class="font-semibold text-neutral-800">Հասցե</p>
            <p class="text-neutral-700">Երևան, Ռաֆֆու 111</p>
          </div>
          <div class="rounded-xl bg-stone-50 border p-4">
            <p class="font-semibold text-neutral-800">Սոց․ ցանցեր</p>
            <div class="mt-2 flex items-center gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61558844766402/"
                class="inline-flex items-center rounded-lg border px-3 py-1.5 hover:bg-indigo-50"
                aria-label="Facebook"
              >
                FB
              </a>
              <a
                href="https://www.instagram.com/metalworks_co"
                class="inline-flex items-center rounded-lg border px-3 py-1.5 hover:bg-indigo-50"
                aria-label="Instagram"
              >
                IG
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Map -->
      <div class="rounded-2xl bg-white border shadow-sm p-4">
        <MapComponent />
      </div>
    </section>

    <!-- Note -->
    <section class="max-w-3xl mx-auto text-center mt-12">
      <p class="text-neutral-600 italic">
        Խնդրում ենք նկատի ունենալ, որ գնային, տեխնիկական և պատվերի կարգավիճակի
        հարցումները համակարգվում են էլ.փոստի/չաթի միջոցով։
      </p>
      <p class="mt-2 font-semibold italic text-neutral-800">
        *Ներկա պահին հեռախոսային աջակցություն չենք տրամադրում։
      </p>
    </section>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import MapComponent from '~/components/map/MapComponent.vue'

export default {
  name: 'ContactPage',
  components: { MapComponent },
  data() {
    return {
      form: {
        name: '',
        email: '',
        phone: '',
        message: '',
      },
      errors: {
        name: '',
        email: '',
        message: '',
      },
      isSubmitting: false,
      notice: { type: '', text: '' },
    }
  },
  methods: {
    ...mapActions('contact', ['addMessage']),

    validate() {
      this.errors = { name: '', email: '', message: '' }
      let ok = true

      if (!this.form.name || this.form.name.length < 2) {
        this.errors.name = 'Խնդրում ենք գրել ձեր անունը (առնվազն 2 նիշ)'
        ok = false
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email || '')
      if (!emailOk) {
        this.errors.email = 'Մուտքագրեք վավեր էլ. փոստ'
        ok = false
      }

      if (!this.form.message || this.form.message.length < 10) {
        this.errors.message = 'Գրեք հաղորդագրություն (առնվազն 10 նիշ)'
        ok = false
      }

      return ok
    },

    async onSubmit() {
      if (!this.validate()) return
      this.isSubmitting = true
      this.notice = { type: '', text: '' }

      try {
        await this.addMessage(this.form)
        if (this.$toast?.success) {
          this.$toast.success('Հաղորդագրությունը հաջողությամբ ուղարկվեց', {
            position: 'top-right',
            duration: 3000,
          })
        } else {
          this.notice = {
            type: 'success',
            text: 'Հաղորդագրությունը հաջողությամբ ուղարկվեց',
          }
        }
        this.form = { name: '', email: '', phone: '', message: '' }
      } catch (e) {
        if (this.$toast?.error) {
          this.$toast.error('Չհաջողվեց ուղարկել, փորձեք կրկին')
        } else {
          this.notice = {
            type: 'error',
            text: 'Չհաջողվեց ուղարկել, փորձեք կրկին',
          }
        }
      } finally {
        this.isSubmitting = false
      }
    },
  },
}
</script>

<style scoped></style>
