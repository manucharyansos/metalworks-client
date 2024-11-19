<template>
  <div class="mx-auto py-24">
    <div class="container mx-auto px-6">
      <div class="flex lg:hidden">
        <img src="/servicesImg/services-mobile-1-768x244.webp" alt="" />
      </div>
      <h1
        class="md:text-5xl text-xl font-sans italic font-bold leading-10 text-center mb-12 text-gray-800 mt-12"
      >
        Մետաղական դետալների և նախագծերի հարդարման ծառայություններ
      </h1>
      <div class="grid lg:grid-cols-2 grid-cols-1">
        <div class="flex flex-col items-center justify-center py-6">
          <p class="text-neutral-700 font-sans italic p-6 text-center">
            Մենք գիտենք, որ նախագիծը հազվադեպ է ավարտվում կտրվածքով: Անկախ
            նրանից, թե դուք փնտրում եք հարդարման գործընթացներ, անցքերի
            գործառնություններ կամ ծալում, մենք ձեզ ապահովում ենք:
          </p>
          <!--        <NuxtLink-->
          <!--          to="/register"-->
          <!--          class="get_started_button text-sm xl:text-base flex items-center justify-content-center text-white border bg-red-700 border-red-500 mx-2 rounded-xl shadow-2xl hover:translate-y-0.5 hover:shadow-2xl duration-300 py-0.5 px-3"-->
          <!--        >ՍԿՍԵԼ</NuxtLink-->
          <!--        >-->
        </div>
        <div class="hidden lg:flex items-center justify-center">
          <img src="/servicesImg/service-parts-straight.webp" alt="" />
        </div>
      </div>
      <div
        class="flex flex-wrap justify-center items-center text-primary-400 font-bold font-sans italic lg:p-12"
      >
        <h2 id="holeOperations" class="mx-4 cursor-pointer">
          Փոսային գործողություններ
        </h2>
        <h2 id="bending" class="mx-4 cursor-pointer">Կռում</h2>
        <h2 id="finishingOperations" class="mx-4 cursor-pointer">
          Հարդարման ընտրանքներ
        </h2>
        <h2 id="cuttingMethods" class="mx-4 cursor-pointer">Կտրման մեթոդներ</h2>
      </div>
    </div>
    <div
      class="flex flex-col items-center justify-center w-full bg-gradient-to-b from-[#f5f5f5] my-16"
    >
      <div class="flex w-full bg-white">
        <div
          class="w-full md:h-24 h-12 bg-gradient-to-b bg-[#f5f5f5] rounded-tr-3xl"
        ></div>
        <div
          class="w-full md:h-24 h-12 bg-gradient-to-b bg-[#f5f5f5] rounded-tl-3xl"
        ></div>
      </div>

      <div
        class="w-full bg-gradient-to-b bg-[#f5f5f5] flex items-center justify-center mx-auto"
      >
        <div class="container flex flex-col items-center justify-center">
          <h2
            class="md:text-5xl text-xl font-sans italic font-bold leading-loose text-center mb-12 text-gray-800 md:mt-12"
          >
            Մետաղական թիթեղների պատրաստում, ներառյալ հակահարվածումը, փորվածքների
            ձևավորումը և սարքավորումը
          </h2>
          <div
            class="flex flex-row flex-wrap items-center justify-center md:my-24 my-12"
          >
            <service-card
              title="Խորացումներ"
              image="/servicesImg/countersink-parts-300x193.webp"
              description="Հնարավորություն տվեք հարմարանքներին տեղադրվել ձեր մասերի վրա այնպես, որ դրանք դառնան հարթ՝ մաշվածությունն ու վնասվածքները նվազեցնելու համար։"
            ></service-card>
            <service-card
              title="Փորվածքների ձևավորում"
              image="/servicesImg/dimple-hero-300x206.jpg"
              description="Ամրացրեք նյութը՝ ավելացնելով էսթետիկ գեղեցիկ խոռոչներ։"
            ></service-card>
            <service-card
              title="Տեղադրում"
              image="/servicesImg/powder-hardware-top-300x193.webp"
              description="Ընտրեք մեր PEM մամլիչ հարմարանքների կատալոգից՝ ձեր մասերին ընկույզներ, շպիլկաներ և բաժանարարներ ավելացնելու համար։"
            ></service-card>
            <service-card
              title="Թելատում"
              image="/servicesImg/tap-tile-white-300x180.webp"
              description="Արագ և հեշտ կերպով ավելացրեք թելավորումներ՝ ձեր մասերին հարմարանքներ միացնելու համար։"
            ></service-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ServiceCard from '~/components/pages/services/ServiceCard.vue'

export default {
  components: {
    ServiceCard,
  },
  middleware: ['publicPage'],
}
</script>

<style scoped>
.get_started_button {
  box-shadow: rgba(80, 20, 20, 0.04) 0 0 1px 0, rgba(66, 6, 6, 0.87) 0 5px 8px 0;
}
.get_started_button:hover {
  box-shadow: rgba(80, 20, 20, 0.04) 0 0 1px 0, rgba(72, 7, 7, 0.87) 0 2px 4px 0;
}
</style>
