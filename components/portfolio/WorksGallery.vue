<template>
  <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
    <!-- Title (optional) -->
    <h2
      class="text-2xl sm:text-3xl font-serif font-bold italic text-neutral-900 mb-6"
    >
      Մեր Աշխատանքները
    </h2>

    <!-- Responsive Grid -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 lg:gap-8"
    >
      <article
        v-for="(work, i) in workData"
        :key="work.id"
        class="group rounded-2xl bg-white border border-neutral-200/70 shadow-sm hover:shadow-lg hover:border-neutral-300 transition-all duration-300 overflow-hidden"
      >
        <!-- Cover -->
        <div class="relative">
          <div class="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
            <img
              :src="cover(work)"
              :alt="work.title || ''"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              role="button"
              tabindex="0"
              @click="open(i)"
              @keyup.enter.space="open(i)"
            />
          </div>

          <!-- subtle gradient & CTA -->
          <div
            class="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          ></div>
          <button
            class="absolute bottom-3 right-3 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-sm font-medium text-neutral-900 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @click.stop="open(i)"
          >
            Դիտել
          </button>
        </div>

        <!-- Content -->
        <div class="p-4 sm:p-5">
          <h3
            class="text-lg sm:text-xl font-semibold text-neutral-900 line-clamp-2"
          >
            {{ work.title }}
          </h3>
          <p class="mt-2 text-sm text-neutral-600 line-clamp-3">
            {{ work.description }}
          </p>

          <!-- Tags (optional) -->

          <!--          <div class="mt-3 flex flex-wrap gap-2">-->
          <!--            <span-->
          <!--              class="px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-700"-->
          <!--              >Tag</span-->
          <!--            >-->
          <!--          </div>-->
        </div>
      </article>
    </div>

    <!-- Lightbox -->
    <transition name="fade">
      <div
        v-if="expandedIndex !== null"
        ref="overlay"
        class="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        tabindex="0"
        aria-modal="true"
        role="dialog"
        @click.self="close"
      >
        <div class="relative w-full max-w-6xl pt-5">
          <!-- Close -->
          <button
            class="absolute top-0 -right-10 text-white/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1 w-8 h-8"
            aria-label="Փակել"
            @click="close"
          >
            ✕
          </button>

          <!-- Frame -->
          <div class="relative rounded-2xl overflow-hidden bg-black">
            <!-- Counter -->
            <div
              class="absolute top-3 left-3 text-xs sm:text-sm text-white/90 bg-white/10 backdrop-blur rounded-full px-2 py-1"
            >
              {{ currentImageIndex + 1 }} / {{ imagesOfSelectedWork.length }}
            </div>

            <!-- Image -->
            <div class="w-full">
              <img
                :src="currentImageUrl"
                class="w-full h-auto max-h-[72vh] sm:max-h-[78vh] object-contain select-none"
                draggable="false"
                alt=""
                @touchstart="onTouchStart"
                @touchend="onTouchEnd"
              />
            </div>

            <!-- Nav Buttons -->
            <button
              class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 hover:bg-white/25 text-white p-3 sm:p-4 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Previous"
              @click.stop="prev"
            >
              ‹
            </button>
            <button
              class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 hover:bg-white/25 text-white p-3 sm:p-4 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Next"
              @click.stop="next"
            >
              ›
            </button>
          </div>

          <!-- Thumbnails -->
          <div
            class="mt-3 flex gap-2 sm:gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-500/40 scrollbar-track-transparent py-1"
          >
            <button
              v-for="(src, idx) in imagesOfSelectedWork"
              :key="src + '_' + idx"
              class="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-lg ring-2 transition-all duration-200"
              :class="
                idx === currentImageIndex
                  ? 'ring-white'
                  : 'ring-transparent opacity-70 hover:opacity-100'
              "
              @click="go(idx)"
            >
              <img :src="src" alt="" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

<script>
export default {
  name: 'WorksGallery',
  props: {
    workData: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      expandedIndex: null,
      currentImageIndex: 0,
      touchStartX: 0,
      touchEndX: 0,
    }
  },
  computed: {
    selectedWork() {
      return this.expandedIndex !== null
        ? this.workData[this.expandedIndex]
        : null
    },
    imagesOfSelectedWork() {
      if (!this.selectedWork) return []
      const cover = this.cover(this.selectedWork)
      const others = (this.selectedWork.images || [])
        .map((img) => this.galleryCover(img))
        .filter(Boolean)
      const set = new Set([cover, ...others])
      return Array.from(set)
    },
    currentImageUrl() {
      return this.imagesOfSelectedWork[this.currentImageIndex] || ''
    },
  },
  mounted() {
    window.addEventListener('keydown', this.onKeydown)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onKeydown)
    this.lockScroll(false)
  },
  methods: {
    cover(it = {}) {
      return it.image_url || it.image || it.cover_image_url || '/logo.png'
    },
    galleryCover(img = {}) {
      return img.url || img.image || img.cover_url || '/logo.png'
    },

    open(workIndex) {
      this.expandedIndex = workIndex
      this.currentImageIndex = 0
      this.lockScroll(true)
      this.$nextTick(() => this.$refs.overlay?.focus())
    },
    close() {
      this.expandedIndex = null
      this.currentImageIndex = 0
      this.lockScroll(false)
    },

    next() {
      const total = this.imagesOfSelectedWork.length
      if (!total) return
      this.currentImageIndex = (this.currentImageIndex + 1) % total
    },
    prev() {
      const total = this.imagesOfSelectedWork.length
      if (!total) return
      this.currentImageIndex = (this.currentImageIndex - 1 + total) % total
    },
    go(idx) {
      this.currentImageIndex = idx
    },

    onTouchStart(e) {
      this.touchStartX = e.changedTouches[0].clientX
    },
    onTouchEnd(e) {
      this.touchEndX = e.changedTouches[0].clientX
      const dx = this.touchEndX - this.touchStartX
      if (Math.abs(dx) > 40) (dx < 0 ? this.next : this.prev)()
    },

    lockScroll(lock) {
      document.documentElement.style.overflow = lock ? 'hidden' : ''
      document.body.style.overflow = lock ? 'hidden' : ''
    },

    onKeydown(e) {
      if (this.expandedIndex === null) return
      if (e.key === 'Escape') this.close()
      if (e.key === 'ArrowRight') this.next()
      if (e.key === 'ArrowLeft') this.prev()
    },
  },
}
</script>

<style scoped>
/* Fade for overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@supports (scrollbar-color: auto) {
  .scrollbar-thin {
    scrollbar-width: thin;
  }
}
</style>
