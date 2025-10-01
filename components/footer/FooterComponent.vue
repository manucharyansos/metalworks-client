<template>
  <footer
    class="relative bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 mt-12"
  >
    <!-- subtle gradient top border -->
    <div
      class="h-1 w-full bg-gradient-to-r from-red-500/70 via-rose-500/70 to-orange-400/70"
    ></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div class="grid gap-10 lg:gap-12 md:grid-cols-12">
        <!-- Map card -->
        <section class="md:col-span-5">
          <div
            class="rounded-2xl overflow-hidden ring-1 ring-gray-200/70 dark:ring-white/10 shadow-sm bg-white/70 dark:bg-white/5 backdrop-blur"
          >
            <div class="aspect-video sm:aspect-[4/3]">
              <MapComponent />
            </div>
          </div>
        </section>

        <!-- Links + Info -->
        <section
          class="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <!-- Resources -->
          <div>
            <h2
              class="mb-4 text-xs font-montserrat uppercase tracking-wider text-gray-900 dark:text-white"
            >
              {{ $t('footer.resources') }}
            </h2>
            <ul
              v-for="service in services"
              :key="service.id"
              class="space-y-2.5"
            >
              <li>
                <NuxtLink
                  :to="
                    localePath({
                      path: '/services/view',
                      query: { id: service.id },
                    })
                  "
                  class="group inline-flex items-center hover:text-red-600 dark:hover:text-red-400 transition"
                >
                  <span>{{ service.title }}</span>
                  <svg
                    class="ml-1.5 h-4 w-4 opacity-0 group-hover:opacity-100 transition"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.8"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- About -->
          <div>
            <h2
              class="mb-4 text-xs font-semibold font-montserrat uppercase tracking-wider text-gray-900 dark:text-white"
            >
              {{ $t('footer.about') }}
            </h2>
            <ul class="space-y-2.5">
              <li>
                <NuxtLink
                  to="/about"
                  class="hover:text-red-600 dark:hover:text-red-400 transition"
                >
                  Metalwork's
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/contact"
                  class="hover:text-red-600 dark:hover:text-red-400 transition"
                >
                  {{ $t('footer.contact') }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h2
              class="mb-4 text-xs font-semibold font-montserrat uppercase tracking-wider text-gray-900 dark:text-white"
            >
              {{ $t('footer.contact') }}
            </h2>
            <ul class="space-y-2.5">
              <li class="text-sm leading-6">
                {{ $t('footer.address') }}<br />
                <span class="text-gray-500 dark:text-gray-400">{{
                  $t('footer.address_val')
                }}</span>
              </li>
              <li>
                <a
                  href="tel:+37498025044"
                  class="hover:text-red-600 dark:hover:text-red-400 transition"
                >
                  +37498025044
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@metalworks.am"
                  class="hover:text-red-600 dark:hover:text-red-400 transition"
                >
                  info@metalworks.am
                </a>
              </li>
              <li class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t('footer.times') }}
              </li>
            </ul>
            <div class="mt-4">
              <NuxtLink
                to="/contact"
                class="inline-flex items-center gap-2 text-sm font-montserrat font-medium px-3.5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
              >
                {{ $t('footer.write_to_us') }}
                <svg
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 12h14M13 5l7 7-7 7"
                  />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </section>
      </div>

      <!-- Divider -->
      <div class="my-10 border-t border-gray-200 dark:border-white/10"></div>

      <!-- Bottom row -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="order-2 sm:order-1 text-sm text-gray-600 dark:text-gray-400">
          © 2024
          <NuxtLink to="/" class="hover:underline">Metalwork's™</NuxtLink>.
          {{ $t('footer.all_rights_reserved') }}
        </p>

        <ul class="order-1 sm:order-2 flex items-center gap-3">
          <!-- Facebook -->
          <li>
            <a
              href="https://www.facebook.com/people/Metal-Works/61558844766402/"
              target="_blank"
              rel="noopener"
              class="group inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-gray-200 dark:ring-white/10 hover:ring-red-500/50 transition"
              aria-label="Facebook"
            >
              <svg
                class="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M22 12.06C22 6.53 17.52 2 12 2S2 6.53 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.78 8.44-4.93 8.44-9.94Z"
                />
              </svg>
            </a>
          </li>
          <!-- Instagram -->
          <li>
            <a
              href="https://www.instagram.com/metalworks_co"
              target="_blank"
              rel="noopener"
              class="group inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-gray-200 dark:ring-white/10 hover:ring-red-500/50 transition"
              aria-label="Instagram"
            >
              <svg
                class="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="3.2" />
                <circle
                  cx="17.2"
                  cy="6.8"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import MapComponent from '~/components/map/MapComponent.vue'

export default {
  name: 'FooterComponent',
  components: { MapComponent },
  computed: {
    ...mapGetters('services', ['getServices', 'isLoading', 'error']),
    currentLocale() {
      return this.$i18n?.locale || 'hy'
    },
    services() {
      return this.getServices || []
    },
  },
  watch: {
    currentLocale: {
      immediate: false,
      async handler() {
        await this.fetchServices({ simple: true })
        this.$store.commit('services/SET_LAST_LOCALE', this.currentLocale)
      },
    },
  },
  async mounted() {
    if (!this.services.length) {
      await this.fetchServices({ simple: true })
      this.$store.commit('services/SET_LAST_LOCALE', this.currentLocale)
    } else if (
      this.$store.state.services.lastLoadedLocale !== this.currentLocale
    ) {
      await this.fetchServices({ simple: true })
      this.$store.commit('services/SET_LAST_LOCALE', this.currentLocale)
    }
  },
  methods: {
    ...mapActions('services', ['fetchServices']),
  },
}
</script>

<style scoped></style>
