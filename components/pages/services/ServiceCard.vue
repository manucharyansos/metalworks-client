<template>
  <div
    class="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-transform duration-300 overflow-hidden w-full"
  >
    <!-- Media area -->
    <div class="w-full aspect-[4/3] md:aspect-[16/9] relative bg-neutral-100">
      <!-- Image -->
      <img
        v-if="image && !video"
        :src="image"
        alt="service image"
        class="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <!-- Video (ըստ ցանկության) -->
      <video
        v-else-if="video"
        :poster="poster || ''"
        class="absolute inset-0 w-full h-full object-cover"
        controls
        playsinline
      >
        <source :src="video" type="video/mp4" />
        Ձեր browser-ը չի աջակցում video tag-ին։
      </video>
    </div>

    <!-- Body -->
    <div class="p-4 md:p-6">
      <h2
        class="text-lg md:text-2xl font-sans italic mb-2 md:mb-3 text-gray-800 text-center md:text-left"
      >
        {{ title }}
      </h2>

      <p class="hidden md:block text-gray-600 font-sans italic leading-relaxed">
        {{ description }}
      </p>

      <!-- Meta slot -->
      <div class="mt-3 flex items-center gap-2 flex-wrap">
        <slot name="meta" />
      </div>

      <!-- Action -->
      <div v-if="to" class="mt-4">
        <nuxt-link
          :to="to"
          class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
        >
          {{ actionButtonText }}
        </nuxt-link>
      </div>

      <!-- Badge slot -->
      <div class="absolute top-2 left-2">
        <slot name="badge" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    video: { type: String, default: '' },
    poster: { type: String, default: '' },
    to: { type: String, default: '' },
    actionButtonText: { type: String, default: 'Դիտել' },
  },
}
</script>
