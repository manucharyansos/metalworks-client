<template>
  <section class="w-full bg-white rounded-3xl shadow-2xl px-4 sm:px-8 py-8">
    <div class="flex flex-col items-center text-center">
      <h2 class="text-xl text-neutral-700 font-bold font-sans italic my-6">
        ՄԵՐ ՀԱՃԱԽՈՐԴՆԵՐՆ ՈՒ ԳՈՐԾԸՆԿԵՐՆԵՐՆ ԵՆ
      </h2>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-base sm:text-lg mb-4 text-neutral-600 font-sans italic text-start"
      >
        <p>Քաղաքային և պետական կառույցներ</p>
        <p>Շինարարական ընկերություններ</p>
        <p>Ճարտարապետներ և դիզայներներ</p>
        <p>Կահույք արտադրողներ</p>
        <p>Արդյունաբերական ձեռնարկություններ</p>
        <p>Հանքարդյունաբերողներ</p>
      </div>
    </div>

    <client-only>
      <Carousel
        :per-page="perPage"
        :per-page-custom="perPageCustom"
        :loop="true"
        :autoplay="true"
        :autoplay-timeout="2800"
        :autoplay-hover-pause="true"
        :speed="500"
        :easing="'ease-in-out'"
        :navigation-enabled="true"
        :pagination-enabled="false"
        :mouse-drag="true"
        :touch-drag="true"
        :scroll-per-page="false"
        class="mt-8 mx-6"
      >
        <Slide v-for="(logo, i) in logos" :key="i">
          <div
            class="h-20 sm:h-24 md:h-28 flex items-center justify-center px-4"
          >
            <img
              :src="logo.src"
              :alt="logo.alt || 'logo'"
              class="w-full h-full object-contain opacity-80 hover:opacity-100 transition"
              loading="lazy"
              decoding="async"
            />
          </div>
        </Slide>
      </Carousel>
    </client-only>
  </section>
</template>

<script>
import { Carousel, Slide } from 'vue-carousel'

export default {
  name: 'PartnersCarousel',
  components: { Carousel, Slide },
  props: {
    logos: {
      type: Array,
      required: true, // [{src:'/logos/ecoville.svg', alt:'EcoVille'}, ...]
      default: () => [],
    },
    perPage: { type: Number, default: 5 },
    // [viewportWidth, perPage]
    perPageCustom: {
      type: Array,
      default: () => [
        [0, 2],
        [480, 3],
        [768, 4],
        [1024, 5],
        [1440, 6],
      ],
    },
  },
}
</script>
