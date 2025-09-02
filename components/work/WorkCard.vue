<template>
  <article
    class="group relative rounded-2xl overflow-hidden bg-white border shadow-sm hover:shadow-md transition cursor-pointer"
    @click="$emit('open')"
  >
    <div class="relative aspect-[4/3] overflow-hidden">
      <img
        :src="cover"
        :alt="work.title || ''"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
    <div class="p-4">
      <h3 class="text-base font-semibold text-neutral-900 line-clamp-2">
        {{ work.title }}
      </h3>
      <p
        v-if="work.description"
        class="mt-1 text-sm text-neutral-600 line-clamp-2"
      >
        {{ work.description }}
      </p>
      <div class="mt-3 flex flex-wrap gap-1.5">
        <span
          v-for="(t, i) in work.tags || []"
          :key="i"
          class="rounded-md bg-neutral-100 text-xs px-2 py-1"
        >
          #{{ t }}
        </span>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: 'WorkCard',
  props: {
    work: { type: Object, required: true },
  },
  computed: {
    cover() {
      const raw =
        this.work._cover ||
        this.work.image_url ||
        (this.work.images && this.work.images[0]?.url) ||
        '/logo.png'
      return raw ? encodeURI(raw) : ''
    },
  },
}
</script>
