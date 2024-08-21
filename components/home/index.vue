<template>
  <div
    class="home_component flex flex-col m-0 p-0 min-h-screen w-full h-full items-center justify-center"
    :class="{ activeScroll: isActiveBg }"
  >
    <div class="flex items-center justify-center w-5/6 mt-48">
      <div class="flex flex-col items-center justify-center">
        <h2
          class="2xl:text-7xl text-6xl text-neutral-700 z-10 font-sans font-extrabold italic mx-auto text-center leading-loose my-4"
        >
          Custom sheet metal parts in as little as
          <span class="text-red-700">2 days</span>
        </h2>
        <div
          class="flex flex-wrap lg:flex-nowrap items-center mx-auto z-10 xl:w-5/6 w-full my-10"
        >
          <p
            class="text-xl flex items-center justify-center w-full my-2 lg:my-12"
          >
            <svg
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              viewBox="0 0 64 64"
              style="enable-background: new 0 0 64 64"
              xml:space="preserve"
              class="w-7 h-7 mx-4"
            >
              <path
                d="M63.6,34.6c0.3-0.4,0.4-0.9,0.4-1.4c0-0.5-0.1-1-0.4-1.4l0.1-0.1l-0.3-0.2c-0.2-0.3-0.5-0.6-0.9-0.7l-5.4-4.6l5.3-2.8 c0.5-0.3,0.9-0.7,1.1-1.1c0.3-0.5,0.4-0.9,0.4-1.4c0-0.6-0.1-1.1-0.4-1.5c-0.3-0.5-0.7-0.8-1.1-0.9L47.1,10 c-2.5-5.6-8.1-9.5-14.7-9.5c-6.5,0-12.1,3.9-14.6,9.4l-16.1,9c-0.5,0.2-0.9,0.6-1.1,1.1c-0.3,0.5-0.4,1-0.4,1.5 c0,0.6,0.1,1.1,0.4,1.5c0.3,0.5,0.7,0.8,1.1,0.9L7,26.7l-6,5c0,0,0,0,0,0l0,0l0,0c-0.2,0.2-0.3,0.4-0.5,0.6c-0.3,0.5-0.4,1-0.4,1.5 c0,0.6,0.1,1.1,0.4,1.5c0.3,0.4,0.7,0.8,1.1,1L7,39l-5.8,4.8l0,0c-0.3,0.3-0.5,0.5-0.7,0.8c-0.3,0.5-0.4,0.9-0.4,1.4 c0,0.6,0.1,1.1,0.4,1.6c0.3,0.4,0.7,0.8,1.1,1l28.1,14.5c0.4,0.2,0.7,0.4,1.1,0.5c0.4,0.1,0.8,0.2,1.2,0.2c0.4,0,0.8-0.1,1.2-0.2 c0.4-0.1,0.8-0.3,1.1-0.5l28.1-15.1c0.5-0.2,0.9-0.5,1.1-0.9c0.3-0.5,0.4-1,0.4-1.5c0-0.6-0.1-1.1-0.4-1.6c0,0-0.1-0.1-0.1-0.1 l0-0.1l-0.4-0.3c-0.1-0.1-0.1-0.1-0.2-0.2l-5.8-4.8l5.2-2.8C62.9,35.4,63.3,35,63.6,34.6z M25,18.8c-1.3,0-2.3-1-2.3-2.3 s1-2.3,2.3-2.3h5.1v-5c0-1.3,1-2.3,2.3-2.3c1.3,0,2.3,1,2.3,2.3v5.1h5.1c1.3,0,2.3,1,2.3,2.3c-0.1,1.2-1.1,2.2-2.3,2.2h-5.1v5.2 c0,1.3-1,2.3-2.3,2.3c-1.3,0-2.3-1-2.3-2.3v-5.2H25z M2.1,21.8c0-0.2-0.1-0.3-0.1-0.4c0-0.1,0-0.3,0.1-0.4c0-0.2,0.2-0.3,0.5-0.5 l14.2-7.9c-0.3,1.3-0.5,2.6-0.5,4c0,8.9,7.2,16.1,16.1,16.1c8.9,0,16.1-7.2,16.1-16.1c0-1.4-0.2-2.7-0.5-3.9l13.5,7.2 c0.3,0.2,0.5,0.4,0.5,0.6c0,0.2,0.1,0.3,0.1,0.4c0,0.1,0,0.3-0.1,0.4c0,0.2-0.2,0.3-0.5,0.5L33.4,36.9c-0.2,0.1-0.4,0.2-0.6,0.2 c-0.3,0.1-0.5,0.1-0.7,0.1s-0.4,0-0.7-0.1c-0.3-0.1-0.5-0.2-0.6-0.2L2.7,22.2C2.3,22.1,2.2,21.9,2.1,21.8z M61.3,44.6 c0,0.1,0.1,0.1,0.1,0.2c0.2,0.1,0.4,0.2,0.5,0.5c0.1,0.2,0.2,0.4,0.2,0.5c0,0.1,0,0.2-0.1,0.4c0,0.2-0.2,0.4-0.5,0.6L33.4,61.9 C33,62,32.6,62.1,32,62.1c-0.5,0-1-0.1-1.3-0.2L2.7,47.1c-0.3-0.2-0.5-0.3-0.5-0.5c0-0.2-0.1-0.3-0.1-0.5c0-0.1,0-0.2,0.1-0.4 c0-0.1,0.2-0.3,0.3-0.4l0,0L8.9,40l20.9,10.8c0.4,0.2,0.7,0.4,1.1,0.5c0.4,0.1,0.8,0.2,1.2,0.2c0.4,0,0.8,0,1.2-0.2 c0.4-0.1,0.8-0.3,1.1-0.5l20.9-11.2L61.3,44.6z M62,33.6c0,0.2-0.2,0.4-0.5,0.6L33.4,49.3c-0.4,0.2-0.8,0.2-1.3,0.2 c-0.5,0-1-0.1-1.3-0.2L2.7,34.5c-0.3-0.1-0.5-0.2-0.5-0.4c0-0.2-0.1-0.3-0.1-0.4c0-0.1,0-0.3,0.1-0.5c0-0.1,0.1-0.1,0.1-0.2l0.1,0.1 l6.6-5.6l20.8,10.8c0.4,0.2,0.7,0.4,1.1,0.5C31.3,39,31.6,39,32,39c0.4,0,0.8,0,1.2-0.2c0.4-0.1,0.8-0.3,1.1-0.5l20.9-11.2l6.8,5.7 c0,0.1,0,0.2,0,0.3C62,33.3,62,33.4,62,33.6z"
              ></path>
            </svg>
            No minimum quantities
          </p>
          <p
            class="text-xl flex items-center justify-center w-full my-2 lg:my-12"
          >
            <svg
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
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
            >Free shipping
          </p>
          <p
            class="text-xl flex items-center justify-center w-full my-2 lg:my-12"
          >
            <svg
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              class="w-7 h-7 mx-4"
              x="0px"
              y="0px"
              viewBox="0 0 360 360"
              style="enable-background: new 0 0 360 360"
              xml:space="preserve"
            >
              <g>
                <path
                  d="M356.3,58.8c-1.9-1.9-4.5-3-7.2-3H10.9C5.3,55.8,0.7,60.4,0.7,66v231.2c0,5.6,4.6,10.2,10.2,10.2H349  c5.6,0,10.2-4.6,10.2-10.2V66C359.2,63.3,358.2,60.7,356.3,58.8z M135,94.2c0,2,1.6,3.6,3.6,3.6h213.6v27.8H138.6  c-2,0-3.6,1.6-3.6,3.6s1.6,3.6,3.6,3.6h213.6v27.8H7.9V66c0-1.7,1.4-3,3-3h338.2c1.7,0,3,1.4,3,3v24.6H138.6  C136.6,90.6,135,92.2,135,94.2z M352.1,195.4H7.9v-27.8h344.3V195.4z M352.1,230.3H7.9v-27.7h344.3V230.3z M352.1,265.2H7.9v-27.7  h344.3V265.2z M352.1,272.4v24.8c0,1.7-1.4,3-3,3H10.9c-1.7,0-3-1.4-3-3v-24.8H352.1z"
                ></path>
                <path
                  d="M101.9,94.3l-19-2.7l-8.5-17.1c-0.8-1.6-2.5-2.7-4.5-2.7c-2.1,0-3.9,1-4.7,2.7l-8.3,17.1l-19,2.7c-1.9,0.3-3.6,1.7-4.1,3.6  c-0.6,1.9-0.1,3.9,1.3,5.2l13.6,13.3l-3.3,18.8c-0.3,1.9,0.5,3.8,2,5c0.9,0.7,2,1,3,1c0.8,0,1.6-0.2,2.4-0.6l16.9-8.9l17,8.9  c0.7,0.4,1.6,0.6,2.4,0.6c1,0,2-0.3,3-1c1.6-1.1,2.4-3.1,2-5.1l-3.3-18.8l13.7-13.3c1.4-1.3,1.9-3.4,1.4-5.3  C105.5,96,103.9,94.6,101.9,94.3z M56,116.7c0.3-1.7-0.3-3.4-1.5-4.5l-11.5-11.4l16-2.3l0,0c1.6-0.3,3.1-1.3,3.9-2.8L70,81.2  l7.1,14.5c0.8,1.5,2.2,2.6,3.8,2.8l16,2.4l-11.5,11.2c-1.3,1.2-1.8,2.9-1.5,4.6l2.7,15.9l-14.3-7.5c-1.5-0.8-3.2-0.8-4.8,0  l-14.3,7.5L56,116.7z"
                ></path>
              </g></svg
            >Made in the USA
          </p>
        </div>
      </div>
    </div>
    <!--    section upload-->
    <div class="bg-white flex flex-col items-center justify-center rounded-2xl">
      <h2 class="text-xl text-neutral-700 font-bold font-sans italic m-8">
        Upload your STEP, DXF or EPS file for instant pricing!
      </h2>
      <button
        class="get_started_button text-sm xl:text-base flex items-center justify-content-center text-white border bg-red-700 border-red-500 mx-2 rounded-xl shadow-2xl hover:translate-y-0.5 hover:shadow-2xl duration-300 py-2 px-7 my-4"
      >
        GET STARTED
      </button>

      <div class="flex items-center justify-center my-4 shadow-gray-400">
        <div class="flex -space-x-4 rtl:space-x-reverse">
          <img
            class="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
            src="/profile-picture-5.jpg"
            alt=""
          />
          <img
            class="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
            src="/picture2.jpg"
            alt=""
          />
          <img
            class="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
            src="/profile-picture-3.jpg"
            alt=""
          />
          <img
            class="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
            src="/profile-picture-4.jpg"
            alt=""
          />
        </div>
        <div>
          <p class="text-neutral-700 text-xl font-bold font-sans italic">
            JOIN 100,000+ Customers
          </p>
        </div>
      </div>
      <p class="text-base font-sans italic my-4">
        No CAD? Start with a <span class="font-bold">template</span> or send us
        a <span class="font-bold">sketch</span>.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeComponent',
  data() {
    return {
      isActiveBg: false,
      scrollY: 0,
    }
  },
  watch: {
    scrollY(val) {
      if (val > 1200) {
        this.isActiveBg = true
      } else {
        this.isActiveBg = false
      }
    },
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      this.scrollY = window.scrollY
    },
  },
}
</script>
<style>
.home_component {
  background-color: #f5f5f5;
  background-image: url('@/static/lines-bg.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.get_started_button {
  box-shadow: rgba(80, 20, 20, 0.04) 0 0 1px 0, rgba(66, 6, 6, 0.87) 0 5px 8px 0;
}
.get_started_button:hover {
  box-shadow: rgba(80, 20, 20, 0.04) 0 0 1px 0, rgba(72, 7, 7, 0.87) 0 2px 4px 0;
}

.activeScroll {
  background: none;
  transition-duration: 2s;
}
</style>
