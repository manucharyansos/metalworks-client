<template>
  <div class="container mx-auto flex flex-col items-center justify-center">
    <!-- Hero Section -->
    <section class="first_section flex items-center justify-center">
      <h2
        class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-extrabold italic drop-shadow-lg text-center"
      >
        Մեր Մասին
      </h2>
    </section>

    <!-- Content Section -->
    <section
      class="second_section flex flex-col items-center justify-center mt-12 px-4 sm:px-8"
    >
      <h2
        class="text-center max-w-4xl mb-10 text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-neutral-800 tracking-tight font-serif font-bold italic"
      >
        ԹԻԹԵՂԱՎՈՐ ՄԵՏԱՂՆԵՐԻ, ՊՐՈՖԻԼԱՅԻՆ ԽՈՂՈՎԱԿՆԵՐԻ ՎԵՐԱՄՇԱԿՄԱՆ ԹՎԱՅԻՆ ԳՈՐԾԱՐԱՆ
      </h2>

      <h3
        class="tracking-tight font-serif font-light italic mt-6 sm:mt-10 text-xl sm:text-2xl md:text-3xl text-gray-700"
      >
        Նորարարական և Մասշտաբային
      </h3>

      <!-- Logo Image -->
      <div class="w-full max-w-md mt-8">
        <img
          class="w-full h-auto object-contain drop-shadow-md"
          src="/logo.png"
          alt="MetalWorks լոգո"
          loading="lazy"
        />
      </div>
    </section>

    <!-- About Text + Images -->
    <section class="w-full mt-12 px-4 sm:px-24">
      <div class="about_metalworks flex flex-col items-start justify-center">
        <h2 class="font-extrabold font-serif italic text-2xl sm:text-3xl">
          METALWORKS
        </h2>
        <p
          class="font-serif font-light italic text-lg sm:text-xl mt-2 text-gray-700"
        >
          ընկերությունը հանդիսանում է Հայաստանում մետաղամշակման ժամանակակից
          գործարան։
        </p>
      </div>

      <!-- Images Grid -->
      <div
        class="images_section grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8"
      >
        <div
          v-for="img in images"
          :key="img.id"
          class="rounded-lg overflow-hidden shadow hover:shadow-md transition"
        >
          <img
            :src="img.src"
            :alt="img.alt"
            class="w-full h-40 md:h-44 lg:h-48 object-cover"
            loading="lazy"
          />
        </div>
      </div>

      <!-- Extra text -->
      <p class="mt-8 text-base sm:text-lg text-gray-700 leading-relaxed">
        Աշխատանքային փուլերն իրականացվում են բարձր որակավորում ունեցող
        մասնագետների և ամբողջությամբ թվայնացված սարքավորումների շնորհիվ։
      </p>
    </section>

    <section class="w-full mt-16 px-4 sm:px-12 lg:px-24">
      <div
        class="our_mission flex flex-col items-center lg:items-start text-center lg:text-left"
      >
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <!-- Նկարը -->
          <div class="mission_image flex justify-center lg:justify-start">
            <img
              src="/robot.jpg"
              alt="Mission Image"
              class="w-full max-w-sm rounded-2xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
            />
          </div>

          <!-- Տեքստը -->
          <div class="col-span-2 flex flex-col gap-6">
            <h2
              class="font-extrabold font-serif italic text-2xl sm:text-3xl lg:text-4xl mb-8 text-gray-800"
            >
              ՄԵՐ ԱՌԱՔԵԼՈՒԹՅՈՒՆՆ Է
            </h2>
            <p class="text-base sm:text-lg text-gray-700 leading-relaxed">
              Առաջարկել լուծումներ սև ու գունավոր մետաղների մշակման ոլորտում՝
              ներկայիս գործող համաշխարհային ստանդարտներին համապատասխան, բարձր
              ճշտությամբ և կրկնելիությամբ։
            </p>
            <p class="text-base sm:text-lg text-gray-700 leading-relaxed">
              Թվայնացված արտադրական գործընթացների միջոցով նվազեցնել արտադրական
              սխալանքի ռիսկերն, ապահովել առավելագույն ճշգրտություն և միջազգային
              որակ։ Միջազգային ստանդարտները ներդնել Հայաստանում և վերափոխել
              մետաղամշակման որակի ընկալումը երկրում։
            </p>
          </div>
        </div>
      </div>
    </section>
    <!-- OUR VISION IS -->
    <section
      class="our_vision_section w-full mt-16 px-4 sm:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
    >
      <!-- Տեքստային բլոկ -->
      <div
        class="flex flex-col items-center lg:items-start text-center lg:text-left"
      >
        <h2
          class="font-extrabold font-serif italic text-2xl sm:text-3xl lg:text-4xl mb-6 text-gray-800"
        >
          ՄԵՐ ՏԵՍԼԱԿԱՆՆ Է
        </h2>

        <p class="text-base sm:text-lg text-gray-700 leading-relaxed max-w-xl">
          Դառնալ տարածաշրջանում առաջատար ճշգրիտ մետաղամշակման, բարդ մետաղական
          կոնստրուկցիաների, էլեմենտների և պատրաստվածքների արտադրության ոլորտում։
        </p>
      </div>

      <!-- Վիդեո -->
      <div class="w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
        <div class="aspect-video">
          <video
            class="h-full w-full object-cover"
            controls
            playsinline
            preload="metadata"
          >
            <source
              src="/videos/interview.mp4"
              type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
            />
            Ձեր browser-ը չի աջակցում video tag-ին։
          </video>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  data() {
    return {
      images: [
        { id: 1, src: '/about/image_1.jpg', alt: 'Արտադրական գոտի 1' },
        { id: 2, src: '/about/bending.jpg', alt: 'Արտադրական գոտի 2' },
        { id: 3, src: '/about/image_3.jpg', alt: 'Արտադրական գոտի 3' },
        { id: 4, src: '/about/image_4.jpg', alt: 'Արտադրական գոտի 4' },
      ],
    }
  },
}
</script>

<style scoped>
.first_section {
  width: 100%;
  height: 400px;
  background-image: url('/about_lser.jpg');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
}
.first_section::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4); /* մուգ filter, որ տեքստը միշտ կարդացվի */
}
</style>
