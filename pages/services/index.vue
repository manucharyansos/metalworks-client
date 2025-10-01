<template>
  <section
    class="relative w-full py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-stone-50 via-white to-stone-50"
  >
    <!-- subtle decorative blobs -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute -top-24 -left-16 h-56 w-56 rounded-full bg-red-500/10 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl"
      ></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-10 sm:mb-12">
        <p
          class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-red-600"></span>
          ԾԱՌԱՅՈՒԹՅՈՒՆՆԵՐ
        </p>
        <h2
          class="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold italic text-neutral-800"
        >
          Մետաղամշակման ամբողջական ցիկլ
        </h2>
        <p class="mt-3 text-sm sm:text-base text-neutral-600">
          Լազեր, ճկում, զոդում, փոշեներկում — մեկ հարթակում, բարձր ճշգրտությամբ։
        </p>
      </div>

      <!-- Loading skeleton -->
      <div
        v-if="loading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="n in 4"
          :key="n"
          class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse"
        >
          <div class="h-36 w-full rounded-lg bg-gray-200"></div>
          <div class="mt-4 h-4 w-3/5 rounded bg-gray-200"></div>
          <div class="mt-2 h-4 w-4/5 rounded bg-gray-100"></div>
          <div class="mt-4 flex gap-2">
            <div class="h-6 w-20 rounded bg-gray-100"></div>
            <div class="h-6 w-16 rounded bg-gray-100"></div>
          </div>
        </div>
      </div>

      <!-- Services grid -->
      <div
        v-else-if="services && services.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <ServiceCard
          v-for="service in services"
          :key="service.id"
          :image="service.image_url || '/services/bend.jpg'"
          :video="service.video_url"
          :poster="service.video_poster_url"
          :title="service.title"
          :description="service.description"
          :to="
            localePath({ path: '/services/view', query: { id: service.id } })
          "
          action-button-text="Դիտել"
          class="w-full"
        >
          <template v-if="service.is_new" #badge>
            <span
              class="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 shadow-sm"
              >Նոր</span
            >
          </template>

          <template #meta>
            <span
              class="rounded-lg bg-indigo-50 px-2 py-1 text-xs text-indigo-700"
            >
              {{ priceText(service) }}
            </span>
            <span
              class="rounded-lg bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
            >
              {{ leadTimeText(service) }}
            </span>
          </template>
        </ServiceCard>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="mx-auto max-w-xl text-center rounded-2xl border border-dashed border-gray-300 p-10 bg-white/60"
      >
        <p class="text-lg font-semibold text-neutral-800">
          Այս պահին ծառայություններ չեն գտնվել
        </p>
        <p class="mt-2 text-neutral-600">
          Կապվեք մեզ հետ՝ ստանալու անհատական առաջարկներ և ժամկետներ։
        </p>
        <NuxtLink
          :to="localePath('/contact')"
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition"
        >
          Կապ մեզ հետ
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

      <!-- CTA -->
      <div class="mt-10 text-center">
        <NuxtLink
          :to="localePath('/services')"
          class="inline-flex items-center gap-2 rounded-full ring-1 ring-gray-300 px-4 py-2 text-sm hover:ring-red-400 hover:text-red-600 transition"
        >
          Տեսնել բոլորը
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ServiceCard from '~/components/pages/services/ServiceCard.vue'

export default {
  components: { ServiceCard },
  computed: {
    ...mapGetters('services', ['getServices', 'isLoading', 'error']),
    currentLocale() {
      return this.$i18n?.locale || 'hy'
    },
    services() {
      return this.getServices || []
    },
    loading() {
      return this.isLoading
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
    priceText(s) {
      const p = s.price_from
      return p ? `Սկս. ${Number(p).toLocaleString()}֏` : 'Սկս. 80,000֏'
    },
    leadTimeText(s) {
      const d = s.lead_time_days || s.lead_time
      if (!d) return '5–10 օր'
      return typeof d === 'number' ? `${d} օր` : d
    },
  },
}
</script>

<style scoped></style>
