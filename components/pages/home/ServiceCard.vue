<template>
  <component
    :is="wrapperTag"
    :to="to || null"
    :href="href || null"
    :target="target"
    :rel="computedRel"
    class="group relative w-full max-w-[22rem] sm:max-w-[24rem] cursor-pointer focus:outline-none"
    :aria-label="ariaLabel || title || 'Service card'"
    @keydown.enter="$emit('action')"
  >
    <div
      class="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
    >
      <!-- Media -->
      <div class="relative overflow-hidden">
        <!-- Skeleton -->
        <img
          :src="image"
          :alt="title || 'Service image'"
          loading="lazy"
          decoding="async"
          class="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <!-- Overlay -->
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80"
        />
        <!-- Icon / Badge -->
        <div class="absolute right-4 top-4 flex items-center gap-2">
          <slot name="badge"></slot>
          <component
            :is="icon"
            v-if="icon"
            class="h-7 w-7 rounded-full bg-white/90 p-1.5 text-indigo-600 shadow-md dark:bg-gray-900/80 dark:text-indigo-300"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="flex flex-1 flex-col p-5">
        <h3
          class="mb-2 line-clamp-2 font-sans text-lg font-bold text-gray-900 md:text-xl dark:text-white"
        >
          <slot name="title">{{ title }}</slot>
        </h3>

        <p
          class="mb-4 flex-1 text-sm leading-relaxed text-gray-600 line-clamp-3 dark:text-gray-300/90"
        >
          <slot name="description">{{ description }}</slot>
        </p>

        <!-- Meta row -->
        <div class="mt-1 flex flex-wrap items-center gap-2">
          <slot name="meta"></slot>
        </div>

        <!-- Actions -->
        <div
          class="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-700/60"
        >
          <button
            v-if="showActionButton"
            type="button"
            class="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-transform duration-200 hover:translate-x-0.5 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            @click.stop="$emit('action')"
          >
            {{ actionButtonText }}
            <svg
              class="ml-0.5 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>

          <button
            v-if="showDetailsButton"
            type="button"
            class="ml-auto inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            @click.stop="$emit('details')"
          >
            Մանրամասն
          </button>
        </div>
      </div>
    </div>
  </component>
</template>

<script>
export default {
  name: 'ServiceCard',
  props: {
    image: { type: String, required: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    icon: { type: [Object, String], default: null }, // component or class name
    showActionButton: { type: Boolean, default: true },
    showDetailsButton: { type: Boolean, default: false },
    actionButtonText: { type: String, default: 'Իմանալ ավելին' },

    /* Linkable */
    to: { type: [String, Object], default: null }, // nuxt-link / vue-router
    href: { type: String, default: null }, // external link
    target: { type: String, default: null },
    ariaLabel: { type: String, default: '' },
  },
  emits: ['action', 'details'],
  computed: {
    wrapperTag() {
      if (this.to) return 'nuxt-link' // or 'router-link' if not using Nuxt
      if (this.href) return 'a'
      return 'div'
    },
    computedRel() {
      if (!this.href) return null
      // add noopener for external targets
      return (
        this.rel || (this.target === '_blank' ? 'noopener noreferrer' : null)
      )
    },
  },
}
</script>

<style scoped>
/* Line clamp for older Tailwind setups */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
