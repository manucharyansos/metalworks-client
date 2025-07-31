<template>
  <div class="mx-auto py-16 md:py-24 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Մոբայլ պատկեր -->
      <div class="flex lg:hidden justify-center">
        <img
          class="w-full h-auto object-contain rounded-xl shadow-md"
          src="/servicesImg/services-mobile-1-768x244.webp"
          alt="Մոբայլ պատկեր"
        />
      </div>

      <!-- Վերնագիր -->
      <h1
        class="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-sans italic font-bold leading-tight text-center text-gray-800 mt-10 sm:mt-12 mb-8 sm:mb-12"
      >
        Մետաղական դետալների և նախագծերի հարդարման ծառայություններ
      </h1>

      <!-- Տեքստ + Լուսանկար -->
      <div class="grid lg:grid-cols-2 grid-cols-1 gap-8">
        <div
          class="flex flex-col items-center justify-center py-6 px-4 sm:px-8"
        >
          <p
            class="text-sm sm:text-base md:text-lg text-neutral-700 font-sans italic text-center"
          >
            Մենք գիտենք, որ նախագիծը հազվադեպ է ավարտվում կտրվածքով: Անկախ
            նրանից, թե դուք փնտրում եք հարդարման գործընթացներ, անցքերի
            գործառնություններ կամ ծալում, մենք ձեզ ապահովում ենք:
          </p>
        </div>
        <div class="hidden lg:flex items-center justify-center">
          <img
            class="w-full max-w-md h-auto object-contain rounded-xl shadow-md"
            src="/servicesImg/service-parts-straight.webp"
            alt="Հարդարման ծառայություններ"
          />
        </div>
      </div>

      <!-- Նավիգացիոն հղումներ -->
      <div
        class="flex flex-wrap justify-center items-center text-red-700 font-bold font-sans italic text-sm sm:text-base gap-4 mt-12 mb-8"
      >
        <h2
          id="holeOperations"
          class="cursor-pointer hover:text-red-800 hover:underline transition"
        >
          Փոսային գործողություններ
        </h2>
        <h2
          id="bending"
          class="cursor-pointer hover:text-red-800 hover:underline transition"
        >
          Կռում
        </h2>
        <h2
          id="finishingOperations"
          class="cursor-pointer hover:text-red-800 hover:underline transition"
        >
          Հարդարման ընտրանքներ
        </h2>
        <h2
          id="cuttingMethods"
          class="cursor-pointer hover:text-red-800 hover:underline transition"
        >
          Կտրման մեթոդներ
        </h2>
      </div>
    </div>

    <!-- Սպիտակ հատված և ծառայությունների ցուցակ -->
    <div
      class="flex flex-col items-center justify-center w-full bg-gradient-to-b from-[#f5f5f5] to-white py-12"
    >
      <!-- Սլայդներ/ծառայություններ -->
      <div class="container px-4 sm:px-6 lg:px-8">
        <h2
          class="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-sans italic font-bold leading-snug text-center text-gray-800 mt-8 md:mt-12 mb-8 sm:mb-12"
        >
          Մետաղական թիթեղների պատրաստում, ներառյալ հակահարվածումը, փորվածքների
          ձևավորումը և սարքավորումը
        </h2>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12"
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
/* Բութոնի ստվեր՝ եթե որոշես օգտագործել */
.get_started_button {
  box-shadow: rgba(80, 20, 20, 0.04) 0 0 1px 0, rgba(66, 6, 6, 0.87) 0 5px 8px 0;
}
.get_started_button:hover {
  box-shadow: rgba(80, 20, 20, 0.04) 0 0 1px 0, rgba(72, 7, 7, 0.87) 0 2px 4px 0;
}
</style>
