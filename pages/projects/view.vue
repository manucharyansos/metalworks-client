<template>
  <div class="min-h-screen bg-white">
    <!-- HERO -->
    <header class="relative">
      <div class="relative h-[38vh] sm:h-[46vh] lg:h-[56vh] overflow-hidden">
        <img
          :src="hero"
          :alt="item?.title || ''"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
        ></div>
        <div
          class="absolute inset-x-0 bottom-0 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
        >
          <div class="text-white">
            <p class="text-xs uppercase tracking-wider opacity-90">Project</p>
            <h1
              class="text-2xl sm:text-3xl md:text-5xl font-serif font-extrabold italic"
            >
              {{ item?.title || 'Project' }}
            </h1>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="(t, i) in item?.tags || []"
                :key="i"
                class="rounded-md bg-white/20 border border-white/30 text-xs px-2 py-1"
              >
                #{{ t }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- BODY -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Content -->
        <div class="lg:col-span-8">
          <!-- description -->
          <section class="prose max-w-none prose-neutral">
            <p
              v-if="item?.description"
              class="text-lg text-neutral-700 leading-relaxed"
            >
              {{ item.description }}
            </p>
          </section>

          <!-- gallery -->
          <section v-if="gallery.length" class="mt-8">
            <h3 class="text-lg font-semibold mb-3">Պատկերասրահ</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                v-for="(g, idx) in gallery"
                :key="g.id || idx"
                class="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100"
                @click="open(idx)"
              >
                <img
                  :src="g.url"
                  alt=""
                  class="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <span
                  class="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5"
                ></span>
              </button>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <aside class="lg:col-span-4">
          <div class="rounded-2xl border bg-white p-5 shadow-sm">
            <h4 class="font-semibold">Նախագծի տվյալներ</h4>
            <dl class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-neutral-500">Հրատարակված</dt>
                <dd class="text-neutral-900">
                  {{ item?.is_published ? 'Այո' : 'Ոչ' }}
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-neutral-500">Սորտավորում</dt>
                <dd class="text-neutral-900">{{ item?.sort_order ?? '—' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-neutral-500">Ստեղծվել է</dt>
                <dd class="text-neutral-900">{{ createdAt }}</dd>
              </div>
            </dl>

            <div class="mt-6 flex gap-2">
              <nuxt-link
                to="/projects"
                class="px-3 py-2 rounded-lg border hover:bg-neutral-50"
              >
                ← Վերադառնալ
              </nuxt-link>
              <button
                class="px-3 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
                @click="share"
              >
                Կիսվել
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <!-- Lightbox -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
        @keydown.esc="close"
        @click.self="close"
      >
        <div class="relative max-w-6xl w-full">
          <button
            class="absolute -top-10 right-0 text-white/90 hover:text-white"
            aria-label="Փակել"
            @click="close"
          >
            ✕
          </button>

          <div class="relative rounded-xl overflow-hidden bg-black">
            <img
              :src="gallery[currentIndex]?.url"
              class="w-full h-auto max-h-[80vh] object-contain select-none"
              draggable="false"
              alt=""
              @touchstart="onTouchStart"
              @touchend="onTouchEnd"
            />
            <button
              class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 hover:bg-white/30 text-white p-2"
              @click.stop="prev"
            >
              ‹
            </button>
            <button
              class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 hover:bg-white/30 text-white p-2"
              @click.stop="next"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'WorkDetail',
  data() {
    return {
      isOpen: false,
      currentIndex: 0,
      touchStartX: 0,
      touchEndX: 0,
      gallery: [],
    }
  },
  head() {
    const title = this.item?.title ? `${this.item.title} — Project` : 'Project'
    const desc = this.item?.description || 'Մետաղամշակման նախագիծ'
    const img = this.hero
    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: desc },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:description', property: 'og:description', content: desc },
        { hid: 'og:image', property: 'og:image', content: img },
      ],
    }
  },
  computed: {
    ...mapGetters('works', ['items', 'item', 'loading', 'error']),
    hero() {
      const raw =
        this.item?.image_url ||
        (Array.isArray(this.item?.images) && this.item.images[0]?.url) ||
        '/logo.png'
      return raw ? encodeURI(raw) : ''
    },
    createdAt() {
      if (!this.item?.created_at) return '—'
      const d = new Date(this.item.created_at)
      return d.toLocaleDateString()
    },
  },
  async mounted() {
    await this.loadItemFromRoute()
    document.addEventListener('keydown', this.onKey)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.onKey)
  },
  watch: {
    '$route.query.id': {
      immediate: false,
      async handler() {
        await this.loadItemFromRoute()
      },
    },
  },
  methods: {
    ...mapActions('works', ['fetchWorks', 'fetchItem']), // <-- используем экшены стора
    async loadItemFromRoute() {
      const id = this.$route.query.id
      if (!id) return
      try {
        const res = await this.fetchItem(id)
        const data = res?.data?.data || res?.data || this.item
        this.gallery = (data?.images || []).map((g) => ({
          ...g,
          url: encodeURI(g.url),
        }))
      } catch (e) {
        // уже залогировано в сторе
        this.gallery = []
      }
    },
    share() {
      const url = window.location.href
      if (navigator.share) {
        navigator
          .share({ title: this.item?.title || 'Project', url })
          .catch(() => {})
      } else {
        navigator.clipboard?.writeText(url)
        alert('Հղումը պատճենվել է')
      }
    },
    open(i) {
      this.currentIndex = i
      this.isOpen = true
      document.documentElement.classList.add('overflow-hidden')
    },
    close() {
      this.isOpen = false
      document.documentElement.classList.remove('overflow-hidden')
    },
    prev() {
      const n = this.gallery.length
      if (!n) return
      this.currentIndex = (this.currentIndex - 1 + n) % n
    },
    next() {
      const n = this.gallery.length
      if (!n) return
      this.currentIndex = (this.currentIndex + 1) % n
    },
    onKey(e) {
      if (e.key === 'ArrowLeft') this.prev()
      if (e.key === 'ArrowRight') this.next()
      if (e.key === 'Escape') this.close()
    },
    onTouchStart(e) {
      this.touchStartX = e.changedTouches[0].screenX
    },
    onTouchEnd(e) {
      this.touchEndX = e.changedTouches[0].screenX
      const dx = this.touchEndX - this.touchStartX
      if (Math.abs(dx) > 40) dx < 0 ? this.next() : this.prev()
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
