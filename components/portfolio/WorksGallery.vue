<template>
  <section class="w-full">
    <!-- Header -->
    <div class="mb-6 flex items-end justify-between">
      <div>
        <h2
          class="text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold italic text-neutral-900"
        >
          {{ title }}
        </h2>
        <p v-if="subtitle" class="mt-2 text-neutral-600">{{ subtitle }}</p>
      </div>

      <!-- optional slot for actions (e.g. "Դիտել բոլորը") -->
      <div>
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Tags filter (optional) -->
    <div
      v-if="showFilters && computedTags.length"
      class="mb-5 flex flex-wrap gap-2"
    >
      <button
        class="px-3 py-1 rounded-full border text-sm"
        :class="
          activeTag === null
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'hover:bg-indigo-50'
        "
        @click="setTag(null)"
      >
        Բոլորը
      </button>
      <button
        v-for="tag in computedTags"
        :key="tag"
        class="px-3 py-1 rounded-full border text-sm"
        :class="
          activeTag === tag
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'hover:bg-indigo-50'
        "
        @click="setTag(tag)"
      >
        {{ tag }}
      </button>
    </div>

    <!-- Grid -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <article
        v-for="(item, idx) in filteredItems"
        :key="item.id || idx"
        class="group relative rounded-2xl overflow-hidden bg-white border shadow-sm hover:shadow-md transition"
      >
        <button
          class="block w-full h-full text-left"
          :aria-label="`Բացել՝ ${item.title}`"
          @click="open(idx)"
        >
          <div class="relative aspect-[4/3] overflow-hidden">
            <img
              :src="imgSrc(item)"
              :alt="item.title || ''"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <div
              class="pointer-events-none absolute bottom-0 left-0 right-0 p-3 flex flex-wrap items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span
                v-for="(t, i) in item.tags || []"
                :key="i"
                class="rounded-md bg-white/90 text-xs px-2 py-1"
              >
                {{ t }}
              </span>
            </div>
          </div>
          <div class="p-3">
            <h3 class="text-base font-semibold text-neutral-900 line-clamp-2">
              {{ item.title }}
            </h3>
            <p
              v-if="item.description"
              class="mt-1 text-sm text-neutral-600 line-clamp-2"
            >
              {{ item.description }}
            </p>
          </div>
        </button>

        <!-- Optional external/internal link -->
        <nuxt-link
          v-if="item.to"
          :to="item.to"
          class="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-neutral-900 shadow-sm hover:bg-white"
          @click.stop
        >
          Մանրամասն
        </nuxt-link>
        <a
          v-else-if="item.link"
          :href="item.link"
          target="_blank"
          rel="noopener"
          class="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-neutral-900 shadow-sm hover:bg-white"
          @click.stop
        >
          Լինք
        </a>
      </article>
    </div>

    <!-- Modal Viewer -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
        @keydown.esc="close"
        @click.self="close"
      >
        <div class="relative max-w-6xl w-full mt-12">
          <button
            class="absolute -top-10 right-0 text-white/90 hover:text-white"
            aria-label="Փակել"
            @click="close"
          >
            ✕
          </button>

          <div class="relative rounded-xl overflow-hidden bg-black">
            <img
              :src="imgSrc(activeItem)"
              :alt="activeItem.title || ''"
              class="w-full h-auto max-h-[80vh] object-contain select-none"
              draggable="false"
              @touchstart="onTouchStart"
              @touchend="onTouchEnd"
            />
            <!-- Nav -->
            <button
              class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 hover:bg-white/30 text-white p-2"
              aria-label="Նախորդ"
              @click.stop="prev"
            >
              ‹
            </button>
            <button
              class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 hover:bg-white/30 text-white p-2"
              aria-label="Հաջորդ"
              @click.stop="next"
            >
              ›
            </button>
          </div>

          <div class="mt-4 flex items-start justify-between gap-3 text-white">
            <div>
              <h3 class="text-lg font-semibold">{{ activeItem.title }}</h3>
              <p
                v-if="activeItem.description"
                class="text-sm text-white/80 mt-1"
              >
                {{ activeItem.description }}
              </p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="(t, i) in activeItem.tags || []"
                  :key="i"
                  class="rounded-md bg-white/10 border border-white/20 text-xs px-2 py-1"
                >
                  {{ t }}
                </span>
              </div>
            </div>
            <div class="shrink-0 flex items-center gap-2">
              <nuxt-link
                v-if="activeItem.to"
                :to="activeItem.to"
                class="rounded-lg bg-white text-neutral-900 px-3 py-1.5 text-sm font-medium hover:bg-white/90"
              >
                Դիտել էջը
              </nuxt-link>
              <a
                v-else-if="activeItem.link"
                :href="activeItem.link"
                target="_blank"
                rel="noopener"
                class="rounded-lg bg-white text-neutral-900 px-3 py-1.5 text-sm font-medium hover:bg-white/90"
              >
                Արտաքին հղում
              </a>
            </div>
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
    items: { type: Array, required: true },
    title: { type: String, default: 'Մեր կատարված աշխատանքները' },
    subtitle: { type: String, default: '' },
    showFilters: { type: Boolean, default: true },
  },
  data() {
    return {
      isOpen: false,
      currentIndex: 0,
      activeTag: null,
      touchStartX: 0,
      touchEndX: 0,
    }
  },
  computed: {
    computedTags() {
      const set = new Set()
      for (const it of this.items || []) {
        ;(it?.tags || []).forEach((t) => set.add(t))
      }
      return Array.from(set)
    },
    filteredItems() {
      if (!this.activeTag) return this.items || []
      return (this.items || []).filter((it) =>
        (it?.tags || []).includes(this.activeTag)
      )
    },
    activeItem() {
      return (this.filteredItems && this.filteredItems[this.currentIndex]) || {}
    },
  },
  watch: {
    filteredItems(list) {
      if (!list.length) this.currentIndex = 0
      else if (this.currentIndex >= list.length) this.currentIndex = 0
    },
  },
  methods: {
    setTag(tag) {
      this.activeTag = tag
      this.currentIndex = 0
    },
    open(idx) {
      this.currentIndex = idx
      this.isOpen = true
      document.addEventListener('keydown', this.onKey)
      document.documentElement.classList.add('overflow-hidden')
    },
    close() {
      this.isOpen = false
      document.removeEventListener('keydown', this.onKey)
      document.documentElement.classList.remove('overflow-hidden')
    },
    prev() {
      const len = this.filteredItems.length
      if (!len) return
      this.currentIndex = (this.currentIndex - 1 + len) % len
    },
    next() {
      const len = this.filteredItems.length
      if (!len) return
      this.currentIndex = (this.currentIndex + 1) % len
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
    imgSrc(it = {}) {
      return it.image_url || it.image || it.cover_image_url || '/logo.png'
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
