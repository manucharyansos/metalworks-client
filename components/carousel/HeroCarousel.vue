<template>
  <div
    class="hero-vh relative w-full overflow-hidden flex items-center justify-center"
  >
    <client-only>
      <Carousel
        ref="heroCarousel"
        :per-page="1"
        :navigation-enabled="true"
        :navigation-prev-label="'‹'"
        :navigation-next-label="'›'"
        :navigation-click-target-size="8"
        :pagination-enabled="true"
        :scroll-per-page="true"
        :autoplay="true"
        :autoplay-timeout="3500"
        :loop="true"
        :mouse-drag="true"
        :touch-drag="true"
        :speed="450"
        class="w-full h-full"
        @page-change="onPageChange"
      >
        <Slide v-for="(slide, i) in items" :key="slide.url || i">
          <div class="relative w-full mt-1 min-h-[88svh]">
            <template v-if="slide.type === 'video'">
              <video
                v-if="isActive(i)"
                class="absolute inset-0 w-full h-full object-cover"
                autoplay
                loop
                muted
                playsinline
                preload="metadata"
                :poster="slide.poster || ''"
                @canplay="forcePlay"
                @loadedmetadata="forcePlay"
              >
                <source :src="encoded(slide.url)" type="video/mp4" />
              </video>
              <img
                v-else
                class="absolute inset-0 w-full h-full object-cover"
                :src="
                  encoded(
                    slide.poster || slide.fallback || '/static/images/logo.png'
                  )
                "
                alt=""
                loading="lazy"
                decoding="async"
              />
            </template>

            <!-- IMAGE slide -->
            <template v-else>
              <img
                class="absolute inset-0 w-full h-full object-cover"
                :src="encoded(slide.url)"
                :alt="slide.alt || ''"
                loading="lazy"
                decoding="async"
              />
            </template>

            <!-- Overlay text -->
            <div
              class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 text-center px-4"
            >
              <h3
                class="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold italic drop-shadow-lg"
              >
                {{ slide.text || text || '' }}
              </h3>
            </div>
          </div>
        </Slide>
      </Carousel>
    </client-only>
  </div>
</template>

<script>
import { Carousel, Slide } from 'vue-carousel'

export default {
  name: 'HeroCarousel',
  components: { Carousel, Slide },
  props: {
    videos: { type: Array, default: () => [] },
    text: { type: String, default: '' },
  },
  data() {
    return { activeIndex: 0 }
  },
  computed: {
    items() {
      return this.videos.map((v) => {
        if (typeof v === 'string') {
          return { type: 'image', url: v, text: '' }
        }
        // object
        const type =
          v.type || (v.url && /\.mp4($|\?)/i.test(v.url) ? 'video' : 'image')
        return { type, ...v }
      })
    },
  },
  mounted() {
    this.$nextTick(this.forcePlay)
  },
  methods: {
    isActive(i) {
      return i === this.activeIndex
    },
    onPageChange(i) {
      this.activeIndex = i
      this.$nextTick(this.forcePlay)
    },
    forcePlay() {
      const video = this.$el.querySelector('video')
      if (video && video.paused) {
        video.play().catch(() => {})
      }
    },
    encoded(u) {
      if (!u) return ''
      const base = u.startsWith('/') ? u : '/' + u
      const fixed = base
        .replace(/^\/static\/videos\//, '/videos/')
        .replace(/^\/static\/images\//, '/images/')

      const dev = process.client && process.env.NODE_ENV !== 'production'
      const bust = dev
        ? (fixed.includes('?') ? '&' : '?') + `_t=${Date.now()}`
        : ''
      return encodeURI(fixed) + bust
    },
  },
}
</script>

<style scoped>
.hero-vh {
  min-height: 80vh;
}

:deep(.VueCarousel-navigation-button) {
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  border-radius: 9999px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.VueCarousel-navigation-prev) {
  left: 3.5rem;
}
:deep(.VueCarousel-navigation-next) {
  right: 3.5rem;
}

@supports (min-height: 100svh) {
  .hero-vh {
    min-height: 80svh;
  }
}

@supports (min-height: 100dvh) {
  .hero-vh {
    min-height: 80dvh;
  }
}
</style>
