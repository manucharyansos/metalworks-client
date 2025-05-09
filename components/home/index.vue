<template>
  <div>
    <header-layout class="page-header">
      <!-- Commented search input remains unchanged -->
    </header-layout>
    <div
      class="home_component flex flex-col m-0 p-0 min-h-screen w-full h-full items-center"
      :class="{ activeScroll: isActiveBg }"
    >
      <div
        class="container flex bg-none items-center justify-center md:mt-44 mt-24 px-4"
      >
        <div class="flex flex-col items-center justify-center">
          <h1
            class="xl:text-7xl lg:text-7xl md:text-6xl sm:text-5xl text-2xl text-neutral-700 z-10 leading-loose font-sans font-bold italic mx-auto text-center my-4"
          >
            Պատվերով թիթեղյա մասեր
          </h1>

          <div
            class="flex flex-row flex-wrap lg:flex-nowrap items-center justify-center mx-auto z-10 w-full my-12"
          >
            <p
              class="lg:text-xl text-base font-mono italic flex font-bold mx-4"
            >
              <svg
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 64 64"
                style="enable-background: new 0 0 64 64"
                xml:space="preserve"
                class="w-7 h-7 mx-4"
              >
                <path
                  d="M63.6,34.6c0.3-0.4,0.4-0.9,0.4-1.4c0-0.5-0.1-1-0.4-1.4l0.1-0.1l-0.3-0.2c-0.2-0.3-0.5-0.6-0.9-0.7l-5.4-4.6l5.3-2.8 c0.5-0.3,0.9-0.7,1.1-1.1c0.3-0.5,0.4-0.9,0.4-1.4c0-0.6-0.1-1.1-0.4-1.5c-0.3-0.5-0.7-0.8-1.1-0.9L47.1,10 c-2.5-5.6-8.1-9.5-14.7-9.5c-6.5,0-12.1,3.9-14.6,9.4l-16.1,9c-0.5,0.2-0.9,0.6-1.1,1.1c-0.3,0.5-0.4,1-0.4,1.5 c0,0.6,0.1,1.1,0.4,1.5c0.3,0.5,0.7,0.8,1.1,0.9L7,26.7l-6,5c0,0,0,0,0,0l0,0l0,0c-0.2,0.2-0.3,0.4-0.5,0.6c-0.3,0.5-0.4,1-0.4,1.5 c0,0.6,0.1,1.1,0.4,1.5c0.3,0.4,0.7,0.8,1.1,1L7,39l-5.8,4.8l0,0c-0.3,0.3-0.5,0.5-0.7,0.8c-0.3,0.5-0.4,0.9-0.4,1.4 c0,0.6,0.1,1.1,0.4,1.6c0.3,0.4,0.7,0.8,1.1,1l28.1,14.5c0.4,0.2,0.7,0.4,1.1,0.5c0.4,0.1,0.8,0.2,1.2,0.2c0.4,0,0.8-0.1,1.2-0.2 c0.4-0.1,0.8-0.3,1.1-0.5l28.1-15.1c0.5-0.2,0.9-0.5,1.1-0.9c0.3-0.5,0.4-1,0.4-1.5c0-0.6-0.1-1.1-0.4-1.6c0,0-0.1-0.1-0.1-0.1 l0-0.1l-0.4-0.3c-0.1-0.1-0.1-0.1-0.2-0.2l-5.8-4.8l5.2-2.8C62.9,35.4,63.3,35,63.6,34.6z M25,18.8c-1.3,0-2.3-1-2.3-2.3 s1-2.3,2.3-2.3h5.1v-5c0-1.3,1-2.3,2.3-2.3c1.3,0,2.3,1,2.3,2.3v5.1h5.1c1.3,0,2.3,1,2.3,2.3c-0.1,1.2-1.1,2.2-2.3,2.2h-5.1v5.2 c0,1.3-1,2.3-2.3,2.3c-1.3,0-2.3-1-2.3-2.3v-5.2H25z M2.1,21.8c0-0.2-0.1-0.3-0.1-0.4c0-0.1,0-0.3,0.1-0.4c0-0.2,0.2-0.3,0.5-0.5 l14.2-7.9c-0.3,1.3-0.5,2.6-0.5,4c0,8.9,7.2,16.1,16.1,16.1c8.9,0,16.1-7.2,16.1-16.1c0-1.4-0.2-2.7-0.5-3.9l13.5,7.2 c0.3,0.2,0.5,0.4,0.5,0.6c0,0.2,0.1,0.3,0.1,0.4c0,0.1,0,0.3-0.1,0.4c0,0.2-0.2,0.3-0.5,0.5L33.4,36.9c-0.2,0.1-0.4,0.2-0.6,0.2 c-0.3,0.1-0.5,0.1-0.7,0.1s-0.4,0-0.7-0.1c-0.3-0.1-0.5-0.2-0.6-0.2L2.7,22.2C2.3,22.1,2.2,21.9,2.1,21.8z M61.3,44.6 c0,0.1,0.1,0.1,0.1,0.2c0.2,0.1,0.4,0.2,0.5,0.5c0.1,0.2,0.2,0.4,0.2,0.5c0,0.1,0,0.2-0.1,0.4c0,0.2-0.2,0.4-0.5,0.6L33.4,61.9 C33,62,32.6,62.1,32,62.1c-0.5,0-1-0.1-1.3-0.2L2.7,47.1c-0.3-0.2-0.5-0.3-0.5-0.5c0-0.2-0.1-0.3-0.1-0.5c0-0.1,0-0.2,0.1-0.4 c0-0.1,0.2-0.3,0.3-0.4l0,0L8.9,40l20.9,10.8c0.4,0.2,0.7,0.4,1.1,0.5C31.3,51.4,31.6,51.5,32,51.5c0.4,0,0.8,0,1.2-0.2 c0.4-0.1,0.8-0.3,1.1-0.5l20.9-11.2L61.3,44.6z M62,33.6c0,0.2-0.2,0.4-0.5,0.6L33.4,49.3c-0.4,0.2-0.8,0.2-1.3,0.2 c-0.5,0-1-0.1-1.3-0.2L2.7,34.5c-0.3-0.1-0.5-0.2-0.5-0.4c0-0.2-0.1-0.3-0.1-0.4c0-0.1,0-0.3,0.1-0.5c0-0.1,0.1-0.1,0.1-0.2l0.1,0.1 l6.6-5.6l20.8,10.8c0.4,0.2,0.7,0.4,1.1,0.5C31.3,39,31.6,39,32,39c0.4,0,0.8,0,1.2-0.2c0.4-0.1,0.8-0.3,1.1-0.5l20.9-11.2l6.8,5.7 c0,0.1,0,0.2,0,0.3C62,33.3,62,33.4,62,33.6z"
                ></path>
              </svg>
              Նվազագույն քանակություն չկա
            </p>
            <p
              class="lg:text-xl Bender text-base font-mono italic flex font-bold my-2 mx-4 lg:my-12"
            >
              <svg
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 64 64"
                style="enable-background: new 0 0 64 64"
                xml:space="preserve"
                class="w-7 h-7 mx-4"
              >
                <g>
                  <path
                    d="M63,12.7L36.9,0.3c-0.3-0.1-0.6-0.1-0.9,0L9.9,12.7c0,0,0,0,0,0l0,0c0,0-0.1,0-0.1,0.1c-0.1,0-0.1,0.1-0.2,0.2  c0,0-0.1,0.1-0.1,0.1c0,0.1-0.1,0.1-0.1,0.2c0,0.1,0,0.1,0,0.2c0,0.1,0,0.1,0,0.1v11.3c0,0.6,0.5,1,1,1c0.6,0,1-0.4,1-1v-9.6  l6.9,3.5c0.1,0,0.1,0,0.2,0.1v6c0,0.4,0.2,0.7,0.6,0.9l6.8,3.4c0.1,0.1,0.3,0.1,0.5,0.1c0.2,0,0.4,0,0.5-0.1  c0.3-0.2,0.5-0.5,0.5-0.9v-5.3l8.2,3.7v35L11.3,50.2v-7.7c0-0.6-0.5-1-1-1c-0.6,0-1,0.4-1,1v8.3c0,0.4,0.2,0.7,0.6,0.9L36,64.1  c0.1,0.1,0.3,0.1,0.4,0.1s0.3,0,0.4-0.1L63,51.7c0.4-0.2,0.6-0.5,0.6-0.9V13.6C63.6,13.2,63.4,12.8,63,12.7z M36.4,24.8l-7.6-3.4  l24-11.3l7.5,3.5L36.4,24.8z M12.6,13.6L36.4,2.4l6.9,3.3L19.2,17c0,0-0.1-0.1-0.1-0.1L12.6,13.6z M25.8,20.6  c-0.4,0.2-0.6,0.5-0.6,0.9v5.1l-4.8-2.4v-5.5L45.6,6.8l4.5,2.3L25.8,20.6z M36.2,61.9h0.6l-0.3,0.1L36.2,61.9z M37.4,61.6v-35  l24.1-11.4v35L37.4,61.6z"
                  ></path>
                  <path
                    d="M16.4,29.1c0-0.6-0.5-1-1-1H1.1c-0.6,0-1,0.4-1,1c0,0.6,0.5,1,1,1h14.2C15.9,30.1,16.4,29.7,16.4,29.1z"
                  ></path>
                  <path
                    d="M4.9,33.9c0,0.6,0.5,1,1,1H19c0.6,0,1-0.4,1-1c0-0.6-0.5-1-1-1H5.9C5.4,32.9,4.9,33.4,4.9,33.9z"
                  ></path>
                  <path
                    d="M17.5,38.6c0-0.6-0.5-1-1-1H3.3c-0.6,0-1,0.4-1,1c0,0.6,0.5,1,1,1h13.2C17,39.6,17.5,39.1,17.5,38.6z"
                  ></path>
                  <path
                    d="M57.9,46.4h-0.2c-0.6,0-1,0.4-1,1c0,0.6,0.5,1,1,1h0.2c0.6,0,1-0.4,1-1C58.9,46.8,58.5,46.4,57.9,46.4z"
                  ></path>
                  <path
                    d="M53.5,48.1c-0.2,0.2-0.3,0.5-0.3,0.7c0,0.1,0,0.3,0.1,0.4c0.1,0.1,0.1,0.2,0.2,0.3c0.1,0.1,0.2,0.2,0.3,0.2  c0.1,0,0.3,0.1,0.4,0.1c0.3,0,0.5-0.1,0.7-0.3c0.1-0.1,0.2-0.2,0.2-0.3c0.1-0.1,0.1-0.3,0.1-0.4c0-0.3-0.1-0.5-0.3-0.7  C54.6,47.7,53.9,47.7,53.5,48.1z"
                  ></path>
                </g></svg
              >Առաքում
            </p>
            <p
              class="lg:text-xl text-base font-mono italic flex font-bold my-2 mx-4"
            >
              <svg
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                class="w-7 h-7 mx-4"
                x="0px"
                y="0px"
                viewBox="0 0 360 360"
                style="enable-background: new 0 0 360 360"
                xml:space="preserve"
              >
                <g>
                  <path
                    d="M356.3,58.8c-1.9-1.9-4.5-3-7.2-3H10.9C5.3,55.8,0.7,60.4,0.7,66v231.2c0,5.6,4.6,10.2,10.2,10.2H349  c5.6,0,10.2-4.6,10.2-10.2V66C359.2,63.3,358.2,60.7,356.3,58.8z M135,94.2c0,2,1.6,3.6,3.6,3.6h213.6v27.8H138.6  c-2,0-3.6,1.6-3.6,3.6s1.6,3.6,3.6,3.6h213.6v27.8H7.9V66c0-1.7,1.4-3,3-3h338.2c1.7,0,3,1.4,3,3v24.6H138.6  C136.6,90.6,135,92.2,135,94.2z M352.1,195.4H7.9v-27.8h344.3V195.4z M352.1,230.3H7.9v-27.7h344.3V230.3z M352.1,265.4H7.9v-27.7  h344.3V265.4z M352.1,272.4v24.8c0,1.7-1.4,3-3,3H10.9c-1.7,0-3-1.4-3-3v-24.8H352.1z"
                  ></path>
                  <path
                    d="M101.9,94.3l-19-2.7l-8.5-17.1c-0.8-1.6-2.5-2.7-4.5-2.7c-2.1,0-3.9,1-4.7,2.7l-8.3,17.1l-19,2.7c-1.9,0.3-3.6,1.7-4.1,3.6  c-0.6,1.9-0.1,3.9,1.3,5.2l13.6,13.3l-3.3,18.8c-0.3,1.9,0.5,3.8,2,5c0.9,0.7,2,1,3,1c0.8,0,1.6-0.2,2.4-0.6l16.9-8.9l17,8.9  c0.7,0.4,1.6,0.6,2.4,0.6c1,0,2-0.3,3-1c1.6-1.1,2.4-3.1,2-5.1l-3.3-18.8l13.7-13.3c1.4-1.3,1.9-3.4,1.4-5.3  C105.5,96,103.9,94.6,101.9,94.3z M56,116.7c0.3-1.7-0.3-3.4-1.5-4.5l-11.5-11.4l16-2.3l0,0c1.6-0.3,3.1-1.3,3.9-2.8L70,81.2  l7.1,14.5c0.8,1.5,2.2,2.6,3.8,2.8l16,2.4l-11.5,11.2c-1.3,1.2-1.8,2.9-1.5,4.6l2.7,15.9l-14.3-7.5c-1.5-0.8-3.2-0.8-4.8,0  l-14.3,7.5L56,116.7z"
                  ></path>
                </g></svg
              >Արտադրված է ՀՀ
            </p>
          </div>
        </div>
      </div>
      <!-- Section upload -->
      <div
        class="bg-white hidden md:flex flex-col items-center justify-center rounded-3xl shadow-2xl z-10"
      >
        <h2
          class="text-xl text-neutral-700 font-bold font-sans italic m-8 w-2/3"
        >
          Վերբեռնեք ձեր STEP, DXF կամ EPS ֆայլը ակնթարթային գնի համար!
        </h2>
        <nuxt-link
          to="/register"
          class="get_started_button text-sm xl:text-base flex items-center justify-content-center text-white border bg-red-700 border-red-500 mx-2 rounded-xl shadow-2xl hover:translate-y-0.5 hover:shadow-2xl duration-300 py-2 px-7 my-4"
        >
          ՍԿՍԵԼ
        </nuxt-link>

        <p class="text-base font-sans italic my-4">
          CAD չկա՞ Սկսեք ձևանմուշից <span class="font-bold">կաղապար</span> կամ
          ուղարկեք մեզ <span class="font-bold">ուրվագիծ</span>.
        </p>
      </div>

      <!-- Video -->
      <div class="my-20 hidden sm:flex shadow-3xl rounded-3xl z-10">
        <video
          src="/new-home-vid.mp4"
          autoplay
          muted
          loop
          playsinline
          class="video-player rounded-3xl"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      <!-- Upload configure -->
      <div
        class="flex flex-col items-center justify-center w-full bg-gradient-to-b from-[#f5f5f5] md:my-16"
      >
        <div class="flex w-full bg-white">
          <div
            class="w-full md:h-24 h-8 bg-gradient-to-b bg-[#f5f5f5] rounded-tr-3xl"
          ></div>
          <div
            class="w-full md:h-24 h-8 bg-gradient-to-b bg-[#f5f5f5] rounded-tl-3xl"
          ></div>
        </div>
        <h2
          class="2xl:text-7xl lg:text-5xl md:text-4xl text-2xl font-sans font-bold italic text-neutral-700 text-center md:w-2/3"
        >
          Վերբեռնել. Կարգավորել. Ավելացնել զամբյուղի մեջ.
          <span class="text-red-600">Կատարված է:</span>
        </h2>
        <p
          class="md:text-xl text-lg text-neutral-700 text-center italic font-sans m-12 leading-loose"
        >
          Վերբեռնումից մինչև գնում հաշված րոպեների ընթացքում
        </p>
        <div
          class="container flex flex-col lg:flex-row flex-wrap items-center justify-center"
        >
          <UploadConfigure image="/upload-277x300.webp">
            <template #title>
              <p
                class="mb-2 xl:text-2xl lg:text-xl text-sm font-normal tracking-tight text-gray-900 dark:text-white"
              >
                Վերբեռնեք ձեր
                <span class="underline decoration-dotted">CAD ֆայլ</span>
              </p>
            </template>
            <template #description>
              <p
                class="mb-3 text-sm text-gray-700 dark:text-gray-400 font-light"
              >
                CAD չկա՞ Անհատականացրեք ձեր ձևանմուշը՝ օգտագործելով մեր
                <span class="font-bold">Մասերի կառուցող</span>, կամ ուղարկել
                էսքիզ մեր
                <span class="font-bold">Դիզայնի ծառայություններ</span> թիմին։
              </p>
            </template>
          </UploadConfigure>

          <UploadConfigure image="/quote-277x300.webp">
            <template #title>
              <p
                class="mb-2 xl:text-2xl lg:text-xl text-sm font-normal tracking-tight text-gray-900 dark:text-white"
              >
                Ստացեք ակնթարթային գներ
              </p>
            </template>
            <template #description>
              <p
                class="mb-3 text-sm text-gray-700 dark:text-gray-400 font-light"
              >
                Գները սկսվում են $39-ից պակասից։
                <span class="font-bold">Ունենք առաքում</span>
              </p>
            </template>
          </UploadConfigure>

          <UploadConfigure image="/larger-package-277x300.webp">
            <template #title>
              <p
                class="mb-2 xl:text-2xl lg:text-xl text-sm font-normal tracking-tight text-gray-900 dark:text-white"
              >
                Պահեստամասերը ձեր դռան մոտ օրերի ընթացքում
              </p>
            </template>
            <template #description>
              <p
                class="mb-3 text-sm text-gray-700 dark:text-gray-400 font-light"
              >
                Ստանդարտ լազերային կտրման պատվերները դուրս են գալիս
                <span class="font-bold">2-4 օրվա ընթացքում:</span>. Սպասվում է
                <span class="font-bold">1-3 օր առաքում</span>
                Հայաստանի ցանկացած վայր
              </p>
            </template>
          </UploadConfigure>
        </div>
      </div>

      <!-- Materials -->
      <div
        class="container mx-auto ld:px-0 flex flex-col items-center justify-center my-10"
      >
        <h2
          class="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-sans leading-loose italic text-neutral-700"
        >
          <span class="text-red-600">{{ totalMaterialsCount }}+</span> նյութեր
          պահեստում
        </h2>

        <div
          class="flex flex-row flex-wrap items-center justify-center my-10 w-5/6"
        >
          <nuxt-link
            exact-active-class="active-link"
            to="/"
            class="px-5 py-1 text-xs font-medium text-center text-indigo-400 hover:text-indigo-800 bg-indigo-100 rounded-2xl focus:outline-none dark:bg-neutral-600 dark:hover:bg-neutral-800 border border-indigo-400 m-2"
            @click.native="selectCategory(null)"
          >
            Բոլորը
          </nuxt-link>
          <div
            v-for="category in categories"
            :key="category.id"
            class="flex items-center justify-center"
          >
            <button
              class="px-3 py-1 text-xs text-center text-neutral-700 font-sans font-bold italic hover:text-indigo-800 bg-indigo-100 rounded-2xl focus:outline-none dark:bg-neutral-600 dark:hover:bg-neutral-800 border border-indigo-400 m-2"
              :class="{
                'bg-indigo-400 text-white': selectedCategory === category.id,
              }"
              @click="selectCategory(category.id)"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <div
          class="container flex flex-row flex-wrap items-center justify-center md:px-8 px-2 place-items-center gap-4"
        >
          <div
            v-for="(material, index) in filteredMaterials"
            :key="index"
            class="flex items-center justify-center my-3 cursor-pointer"
          >
            <div
              class="materials flex m-2 p-3 w-80 rounded-2xl border border-neutral-400 dark:bg-neutral-800 dark:border-gray-800"
            >
              <div class="for_material_image size-16">
                <img
                  class="rounded-xl"
                  :src="getImage(material.image)"
                  alt=""
                />
              </div>
              <div
                class="w-full flex flex-col items-start justify-start mx-2 h-24"
              >
                <p class="font-sans italic font-bold">
                  {{ material.description }}
                </p>
                <p class="font-sans italic">
                  {{ material.thickness }} մմ հաստություն
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Controls for Materials -->
        <div v-if="materialPagination" class="flex items-center justify-center my-8">
          <button
            :disabled="!materialPagination.prev_page_url"
            class="px-4 py-2 mx-1 text-sm font-medium text-neutral-700 bg-indigo-100 border border-indigo-400 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="changePage(materialPagination.current_page - 1)"
          >
            Նախորդ
          </button>
          <button
            v-for="page in materialPagination.last_page"
            :key="page"
            class="px-4 py-2 mx-1 text-sm font-medium rounded-lg"
            :class="{
              'bg-indigo-400 text-white': materialPagination.current_page === page,
              'bg-indigo-100 text-neutral-700 hover:bg-indigo-200':
                materialPagination.current_page !== page,
            }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button
            :disabled="!materialPagination.next_page_url"
            class="px-4 py-2 mx-1 text-sm font-medium text-neutral-700 bg-indigo-100 border border-indigo-400 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="changePage(materialPagination.current_page + 1)"
          >
            Հաջորդ
          </button>
        </div>
      </div>

      <!-- Products -->
      <div
        class="container mx-auto ld:px-0 flex flex-col items-center justify-center my-10"
      >
        <h2
          class="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-sans leading-loose italic text-neutral-700"
        >
          Մեր արտադրանքը
        </h2>
        <div
          class="container flex flex-row flex-wrap items-center justify-center md:px-8 px-2 place-items-center gap-4"
        >
          <div
            v-for="(product, index) in products"
            :key="index"
            class=" p-4"
          >
            <ProductCard
              :price="product.price"
              :name="product.name"
              :img-url="getImage(product.image)"
            />
          </div>
        </div>

        <!-- Pagination Controls for Products -->
        <div
          v-if="productPagination"
          class="flex items-center justify-center my-8"
        >
          <button
            :disabled="!productPagination.prev_page_url"
            class="px-4 py-2 mx-1 text-sm font-medium text-neutral-700 bg-indigo-100 border border-indigo-400 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="changeProductPage(productPagination.current_page - 1)"
          >
            Նախորդ
          </button>
          <button
            v-for="page in productPagination.last_page"
            :key="page"
            class="px-4 py-2 mx-1 text-sm font-medium rounded-lg"
            :class="{
              'bg-indigo-400 text-white': productPagination.current_page === page,
              'bg-indigo-100 text-neutral-700 hover:bg-indigo-200':
                productPagination.current_page !== page,
            }"
            @click="changeProductPage(page)"
          >
            {{ page }}
          </button>
          <button
            :disabled="!productPagination.next_page_url"
            class="px-4 py-2 mx-1 text-sm font-medium text-neutral-700 bg-indigo-100 border border-indigo-400 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="changeProductPage(productPagination.current_page + 1)"
          >
            Հաջորդ
          </button>
        </div>
      </div>

      <!-- Services -->
      <div class="container flex items-center justify-center flex-col my-12">
        <div class="flex flex-col items-center justify-center">
          <h2
            class="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-sans leading-loose italic text-neutral-700 md:mx-32 mx-4 text-center"
          >
            Ճկում, փոշի ծածկույթ, PEM սարքավորում և այլն
          </h2>
          <p
            class="md:text-xl text-lg text-neutral-700 text-center italic font-sans my-12 px-12"
          >
            Այն չի ավարտվում լազերային կտրված մասերով: Մենք առաջարկում ենք մի
            շարք հետմշակման ծառայություններ:
          </p>
        </div>
        <div
          class="container mx-auto px-4 2xl:px-24 grid grid-cols-1 md:grid-cols-2 gap-2 font-sans italic font-light md:text-base text-sm"
        >
          <div class="grid gap-6">
            <div
              class="services cursor-pointer isPrecisionCutting flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-200 w-full"
              @mouseover="activateService('PrecisionCutting')"
            >
              <div
                class="size-16 md:hidden flex items-center justify-center w-1/5"
              >
                <img src="/materials/cut-home-img.webp" alt="" />
              </div>
              <div
                class="flex flex-col md:items-start items-center justify-center w-3/5 mx-2 text-center"
              >
                <h2>Ճշգրիտ կտրման մեթոդներ</h2>
                <p>2-4 օր ստանդարտ արտադրություն</p>
              </div>
              <div class="flex flex-col items-center justify-center w-1/5">
                39$
              </div>
            </div>
            <div class="grid lg:grid-cols-2 grid-cols-1 gap-6">
              <div
                class="services cursor-pointer flex items-center justify-between size-20 p-4 border border-gray-200 rounded-lg hover:border-blue-200 w-full"
                @mouseover="activateService('Bending')"
              >
                <div class="size-16 md:hidden flex items-center">
                  <img src="/materials/bend-home-img-1.webp" alt="" />
                </div>
                <h2>Ճկում</h2>
                <p>+1-2 օր</p>
              </div>
              <div
                class="services cursor-pointer flex items-center justify-between size-20 p-4 border border-gray-200 rounded-lg hover:border-blue-200 w-full"
                @mouseover="activateService('PowderCoating')"
              >
                <div class="size-16 md:hidden flex items-center">
                  <img src="/materials/pow-home-img-1.webp" alt="" />
                </div>
                <h2>Փոշի ծածկույթ</h2>
                <p>+1-3 օր</p>
              </div>
              <div
                class="services cursor-pointer flex items-center justify-between size-20 p-4 border border-gray-200 rounded-lg hover:border-blue-200 w-full"
                @mouseover="activateService('DimpleForming')"
              >
                <div class="size-16 md:hidden flex items-center">
                  <img src="/materials/dimple-home-img-1.jpg" alt="" />
                </div>
                <h2>Փորվածքների ձևավորում</h2>
                <p>+1-3 օր</p>
              </div>
              <div
                class="services cursor-pointer flex items-center justify-between size-20 p-4 border border-gray-200 rounded-lg hover:border-blue-200 w-full"
                @mouseover="activateService('HdwInserting')"
              >
                <div class="size-16 md:hidden flex items-center">
                  <img src="/materials/hdw-home-img-2.webp" alt="" />
                </div>
                <h2>Սարքավորումների տեղադրում</h2>
                <p>+1-3 օր</p>
              </div>
              <div
                class="services cursor-pointer flex items-center justify-between size-20 p-4 border border-gray-200 rounded-lg hover:border-blue-200 w-full"
                @mouseover="activateService('Tapping')"
              >
                <div class="size-16 md:hidden flex items-center">
                  <img src="/materials/tap-home-img-2.webp" alt="" />
                </div>
                <h2>Թակել</h2>
                <p>+1-3 օր</p>
              </div>
              <div
                class="services cursor-pointer flex items-center justify-between size-20 p-4 border border-gray-200 rounded-lg hover:border-blue-200 w-full"
                @mouseover="activateService('Anodizing')"
              >
                <div class="size-16 md:hidden flex items-center">
                  <img src="/materials/ano-home-img-1.webp" alt="" />
                </div>
                <h2>Անոդացում</h2>
                <p>+1-3 օր</p>
              </div>
            </div>
          </div>
          <div
            class="md:flex hidden items-center justify-between relative overflow-y-hidden"
          >
            <!-- Images -->
            <div
              class="w-full h-full flex items-center justify-center precision_image"
              :class="{
                show_precision_image: activeService === 'PrecisionCutting',
              }"
            >
              <img src="/materials/cut-home-img.webp" alt="" />
            </div>
            <div
              class="w-full h-full flex flex-col items-center justify-center bending_image"
              :class="{ show_bending_image: activeService === 'Bending' }"
            >
              <img src="/materials/bend-home-img-1.webp" alt="" />
              <div>
                <h2>CNC Ճկում և ձևավորում</h2>
                <p>Հասանելի է 9 մետաղի և 1 պլաստիկի համար</p>
              </div>
            </div>
            <div
              class="w-full h-full flex flex-col items-center justify-center powder_cutting"
              :class="{
                show_powder_cutting: activeService === 'PowderCoating',
              }"
            >
              <img src="/materials/pow-home-img-1.webp" alt="" />
              <div>
                <h2>Փոշի ծածկույթ</h2>
                <p>Հասանելի է 9 մետաղի և 1 պլաստիկի համար</p>
              </div>
            </div>
            <div
              class="w-full h-full flex flex-col items-center justify-center dimple_forming"
              :class="{
                show_dimple_forming: activeService === 'DimpleForming',
              }"
            >
              <img src="/materials/dimple-home-img-1.jpg" alt="" />
              <div>
                <h2>Փորվածքների ձևավորում</h2>
                <p>Հասանելի է 7 մետաղների համար</p>
              </div>
            </div>
            <div
              class="w-full h-full flex items-center justify-center hdw_inserting"
              :class="{ show_hdw_inserting: activeService === 'HdwInserting' }"
            >
              <img src="/materials/hdw-home-img-2.webp" alt="" />
            </div>
            <div
              class="w-full h-full flex flex-col items-center justify-center anodizing"
              :class="{ show_anodizing: activeService === 'Anodizing' }"
            >
              <img src="/materials/ano-home-img-1.webp" alt="" />
              <div>
                <h2>Սարքավորումների տեղադրում</h2>
              </div>
            </div>
            <div
              class="w-full h-full flex items-center justify-center tapping"
              :class="{ show_tapping: activeService === 'Tapping' }"
            >
              <img src="/materials/tap-home-img-2.webp" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import UploadConfigure from '~/components/pages/home/UploadConfigure.vue'
import HeaderLayout from '~/components/layouts/Header-layout.vue'
import ProductCard from '~/components/product/ProductCard.vue'

export default {
  name: 'HomeComponent',
  components: { HeaderLayout, UploadConfigure, ProductCard },
  data() {
    return {
      selectedCategory: null,
      isActiveBg: false,
      activeService: 'PrecisionCutting',
      scrollY: 0,
      perPage: 10, // Default items per page
    }
  },
  computed: {
    ...mapGetters('materials', ['getMaterials', 'getPagination']),
    ...mapGetters('categories', ['allMaterialGroups']),
    ...mapGetters('products', ['getProducts', 'getProductPagination']),
    materials() {
      return this.getMaterials || []
    },
    products() {
      return this.getProducts || []
    },
    materialPagination() {
      return this.getPagination || {}
    },
    productPagination() {
      return this.getProductPagination || {}
    },
    categories() {
      return (
        this.allMaterialGroups
          ?.flatMap((group) => group.categories)
          .filter((category) => category) || []
      )
    },
    filteredMaterials() {
      if (!this.selectedCategory) return this.materials
      return this.materials.filter(
        (material) => material.material_category_id === this.selectedCategory
      )
    },
    totalMaterialsCount() {
      return this.materialPagination.total || this.materials.length
    },
  },
  watch: {
    scrollY(val) {
      this.isActiveBg = val > 600
    },
    selectedCategory() {
      this.fetchMaterialsWithParams() // Re-fetch materials when category changes
    },
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
    if (this.getMaterials?.length === 0) {
      this.fetchMaterialsWithParams()
    }
    if (this.allMaterialGroups?.length === 0) {
      this.fetchMaterialGroups()
    }
    if (this.getProducts?.length === 0) {
      this.fetchProducts({ page: 1, perPage: this.perPage })
    }
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    ...mapActions('materials', ['fetchMaterials']),
    ...mapActions('categories', ['fetchMaterialGroups']),
    ...mapActions('products', ['fetchProducts']),
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
    },
    activateService(service) {
      this.activeService = service
    },
    handleScroll() {
      this.scrollY = window.scrollY
    },
    getImage(image) {
      if (image) {
        return `https://api.metalworks.am/storage/${image}`
      }
      return '/download.png' // Fallback image
    },
    async fetchMaterialsWithParams(page = 1) {
      await this.fetchMaterials({
        page,
        perPage: this.perPage,
      })
    },
    async changePage(page) {
      await this.fetchMaterialsWithParams(page)
    },
    async changeProductPage(page) {
      await this.fetchProducts({
        page,
        perPage: this.perPage,
      })
    },
  },
}
</script>

<style>
.home_component {
  background-color: #f5f5f5;
  background-image: url('@/static/lines-bg.svg');
}

.get_started_button {
  box-shadow: rgba(80, 20, 20, 0.04) 0 0 1px 0, rgba(66, 6, 6, 0.87) 0 5px 8px 0;
}
.get_started_button:hover {
  box-shadow: rgba(80, 20, 20, 0.04) 0 0 1px 0, rgba(72, 7, 7, 0.87) 0 2px 4px 0;
}
.materials {
  box-shadow: rgba(63, 33, 33, 0.04) 0 0 1px 0,
    rgba(131, 118, 118, 0.87) 0 5px 8px 0;
}
.services {
  box-shadow: rgba(63, 33, 33, 0.04) 0 0 1px 0,
    rgba(131, 118, 118, 0.87) 0 5px 8px 0;
}
.materials:hover {
  box-shadow: rgba(73, 67, 67, 0.04) 0 0 1px 0,
    rgba(73, 66, 66, 0.87) 0 2px 4px 0;
}
.services:hover {
  box-shadow: rgba(73, 67, 67, 0.04) 0 0 1px 0,
    rgba(73, 66, 66, 0.87) 0 2px 4px 0;
}

.activeScroll {
  background-color: white;
  transition-duration: 3s;
}

.precision_image {
  position: absolute;
  bottom: -300px;
  opacity: 0;
  transition: bottom 0.5s ease, opacity 0.5s ease;
}

.show_precision_image {
  bottom: 0;
  opacity: 1;
}

.bending_image {
  position: absolute;
  bottom: -300px;
  opacity: 0;
  transition: bottom 0.5s ease, opacity 0.5s ease;
}

.show_bending_image {
  bottom: 0;
  opacity: 1;
}

.powder_cutting {
  position: absolute;
  bottom: -300px;
  opacity: 0;
  transition: bottom 0.5s ease, opacity 0.5s ease;
}

.show_powder_cutting {
  bottom: 0;
  opacity: 1;
}

.dimple_forming {
  position: absolute;
  bottom: -300px;
  opacity: 0;
  transition: bottom 0.5s ease, opacity 0.5s ease;
}

.show_dimple_forming {
  bottom: 0;
  opacity: 1;
}

.hdw_inserting {
  position: absolute;
  bottom: -300px;
  opacity: 0;
  transition: bottom 0.5s ease, opacity 0.5s ease;
}

.show_hdw_inserting {
  bottom: 0;
  opacity: 1;
}

.anodizing {
  position: absolute;
  bottom: -300px;
  opacity: 0;
  transition: bottom 0.5s ease, opacity 0.5s ease;
}

.show_anodizing {
  bottom: 0;
  opacity: 1;
}

.tapping {
  position: absolute;
  bottom: -300px;
  opacity: 0;
  transition: bottom 0.5s ease, opacity 0.5s ease;
}

.show_tapping {
  bottom: 0;
  opacity: 1;
}
</style>
