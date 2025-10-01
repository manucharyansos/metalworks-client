<template>
  <div class="bg-stone-100">
    <!-- Hero -->
    <HeroCarousel :videos="videos" :autoplay="true" :interval="7000" />

    <!-- News / Products -->
    <section
      class="flex flex-col mx-auto gap-6 md:gap-8 lg:gap-10 md:p-10 lg:p-16 rounded-xl shadow-xl bg-gradient-to-br from-stone-100 via-stone-50 to-white w-full"
      aria-labelledby="news-heading"
    >
      <header v-if="products && products.length">
        <h2
          id="news-heading"
          class="mt-3 mx-12 text-2xl sm:text-3xl md:text-4xl font-extrabold font-montserrat text-neutral-800"
        >
          {{ $t('news') }}
        </h2>
      </header>

      <div
        v-if="!products || products.length === 0"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <div
          v-for="n in 4"
          :key="'prod-skel-' + n"
          class="h-48 rounded-xl bg-neutral-200 animate-pulse"
        />
      </div>

      <client-only v-if="products && products.length">
        <product-slider :products="products" />
      </client-only>
    </section>

    <!-- Works / Portfolio -->
    <section
      class="p-6 md:p-10 lg:p-16 w-full mx-auto"
      aria-labelledby="works-heading"
    >
      <!-- Skeleton -->
      <div
        v-if="!works || works.length === 0"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <div
          v-for="n in 8"
          :key="'work-skel-' + n"
          class="h-40 rounded-xl bg-neutral-200 animate-pulse"
        />
      </div>

      <WorksGallery :work-data="works" @openDetails="openDetails" />

      <PaginationUi
        v-if="pagination"
        :meta="pagination"
        @change="(p) => fetchWorks({ page: p, perPage })"
      />
    </section>

    <!-- Partners -->
    <section
      class="flex flex-col m-0 p-0 min-h-screen w-full h-full items-center"
      :class="{ activeScroll: isActiveBg }"
      aria-labelledby="partners-heading"
    >
      <h2 id="partners-heading" class="sr-only">Գործընկերներ</h2>
      <PartnersCarousel :logos="partnerLogos" />
    </section>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import HeroCarousel from '~/components/carousel/HeroCarousel.vue'
import PartnersCarousel from '@/components/carousel/PartnersCarousel.vue'
import PaginationUi from '@/components/ui/Pagination.vue'
import WorksGallery from '@/components/portfolio/WorksGallery.vue'

export default {
  name: 'HomeComponent',
  components: { WorksGallery, HeroCarousel, PartnersCarousel, PaginationUi },

  fetchOnServer: true,

  data() {
    return {
      isActiveBg: false,
      scrollY: 0,
      perPage: 10,
      isOpenDetails: false,
      // eslint-disable-next-line vue/no-reserved-keys
      _raf: null,

      videos: [
        {
          type: 'video',
          url: '/videos/IMG_8887.MP4',
          text: 'ԹԻԹԵՂԱՎՈՐ ՄԵՏԱՂՆԵՐԻ, ՊՐՈՖԻԼԱՅԻՆ ԽՈՂՈՎԱԿՆԵՐԻ ՎԵՐԱՄՇԱԿՄԱՆ ԹՎԱՅԻՆ ԱՐՏԱԴՐՈՒԹՅՈՒՆ',
        },
        {
          type: 'video',
          url: '/videos/20250821_152207.mp4',
          text: 'ԹԻԹԵՂԱՎՈՐ ՄԵՏԱՂՆԵՐԻ, ՊՐՈՖԻԼԱՅԻՆ ԽՈՂՈՎԱԿՆԵՐԻ ՎԵՐԱՄՇԱԿՄԱՆ ԹՎԱՅԻՆ ԱՐՏԱԴՐՈՒԹՅՈՒՆ',
        },
        { type: 'jpg', url: '/laser.jpg', text: '' },
      ],

      partnerLogos: [
        { src: '/partners/team-telecom.jpg', alt: 'Team Telecom' },
        { src: '/partners/ecoville.png', alt: 'EcoVille' },
        { src: '/partners/solaron.png', alt: 'Solaron' },
        { src: '/partners/gazprom.png', alt: 'Gazprom Armenia' },
        { src: '/partners/teamSistems.png', alt: 'teamSystems' },
        { src: '/partners/ArmeniaWine.png', alt: 'Armenia Wine' },
        { src: '/partners/ohanyan.png', alt: 'Ohanyan' },
        {
          src: '/partners/nushikyan-association.png',
          alt: 'Nushikyan Association',
        },
        { src: '/partners/jspace.png', alt: 'Jspace' },
        { src: '/partners/citadeli.png', alt: 'Citadeli' },
        { src: '/partners/eco-agro.png', alt: 'Eco Agro' },
        { src: '/partners/mane-interior.png', alt: 'Mane Interior' },
        { src: '/partners/flash.png', alt: 'Flash' },
      ],
    }
  },
  async fetch() {
    const perPage = 10
    if (!this.$store.getters['products/getProducts']?.length) {
      await this.$store.dispatch('products/fetchProducts', { page: 1, perPage })
    }
    if (!this.$store.getters['works/works']?.length) {
      await this.$store.dispatch('works/fetchWorks', { page: 1, perPage })
    }
  },

  computed: {
    ...mapGetters('products', ['getProducts']),
    ...mapGetters('works', ['works', 'pagination']),
    products() {
      return this.getProducts || []
    },
  },

  watch: {
    scrollY(val) {
      this.isActiveBg = val > 600
    },
  },

  mounted() {
    this._onScroll = () => {
      if (this._raf) return
      this._raf = requestAnimationFrame(() => {
        this.scrollY = window.scrollY
        this._raf = null
      })
    }
    window.addEventListener('scroll', this._onScroll, { passive: true })

    if (!this.getProducts || this.getProducts.length === 0) {
      this.fetchProducts({ page: 1, perPage: this.perPage })
    }
    if (!this.works || this.works.length === 0) {
      this.fetchWorks({ page: 1, perPage: this.perPage })
    }
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this._onScroll)
    if (this._raf) cancelAnimationFrame(this._raf)
  },

  methods: {
    ...mapActions('products', ['fetchProducts']),
    ...mapActions('works', ['fetchWorks']),

    openDetails(work) {
      if (work.id) {
        this.isOpenDetails = !this.isOpenDetails
      }
    },

    goDetail(w) {
      this.$router.push({ path: '/projects/view', query: { id: w.id } })
    },

    handleScroll() {
      this._onScroll()
    },

    changeWorkPage(page) {
      this.fetchWorks({ page, perPage: this.perPage })
      if (process.client) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
  },
}
</script>

<style scoped>
.first_section {
  height: 350px;
  background-image: url('/laser.jpg'); /* static/ root-relative */
  background-position: 0 0;
  background-size: cover;
  position: relative;
}
.first_section::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.1);
  border-radius: inherit;
}
@media (min-width: 1024px) {
  .first_section {
    height: 350px;
  }
}

.get_started_button {
  box-shadow: rgba(80, 20, 20, 0.04) 0 0 1px 0, rgba(66, 6, 6, 0.87) 0 5px 8px 0;
}
.get_started_button:hover {
  box-shadow: rgba(80, 20, 20, 0.04) 0 0 1px 0, rgba(72, 7, 7, 0.87) 0 2px 4px 0;
}

/* Slide-in panel animations kept */
.basket-enter-from .basket-panel,
.basket-leave-to .basket-panel {
  transition: transform 0.6s ease, opacity 0.6s ease;
  transform: translateX(100%);
  opacity: 0;
}
.basket-enter-to .basket-panel,
.basket-leave-from .basket-panel {
  transform: translateX(0);
  opacity: 1;
}
.basket-panel {
  transition: transform 0.6s ease, opacity 0.6s ease;
  z-index: 1000;
}
.basket-enter-active .bg-opacity-50,
.basket-leave-active .bg-opacity-50 {
  transition: opacity 0.3s ease;
}
.basket-enter-from .bg-opacity-50,
.basket-leave-to .bg-opacity-50 {
  opacity: 0;
}
</style>
