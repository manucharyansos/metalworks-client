<template>
  <footer class="bg-white dark:bg-gray-900">
    <div class="mx-auto w-full p-4 py-6 lg:py-8">
      <div class="md:flex md:justify-between">
        <div class="z-10">
          <MapComponent />
        </div>
        <div class="grid grid-cols-2 my-4 gap-8 sm:gap-6 sm:grid-cols-2">
          <div>
            <h2
              class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white"
            >
              Ռեսուրսներ
            </h2>
            <ul class="text-gray-500 dark:text-gray-400 font-medium">
              <li class="mb-4">
                <a href="#" class="hover:underline">Solid Works</a>
              </li>
              <li>
                <a href="#" class="hover:underline">Laser cutting</a>
              </li>
              <li>
                <a href="#" class="hover:underline">Bending</a>
              </li>
            </ul>
          </div>
          <div>
            <h2
              class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white"
            >
              Մեր մասին
            </h2>
            <ul class="text-gray-500 dark:text-gray-400 font-medium">
              <li class="mb-4">
                <a href="#" class="hover:underline">Metalwork's</a>
              </li>
              <li>
                <a href="#" class="hover:underline">Terms &amp; Conditions</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <hr
        class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8"
      />
      <div class="sm:flex sm:items-center sm:justify-between">
        <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400"
          >© 2024 <a href="/" class="hover:underline">Metalwork's™</a>. All
          Բոլոր իրավունքները պաշտպանված են:
        </span>
        <div class="flex mt-4 sm:justify-center sm:mt-0">
          <a
            href="#"
            class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            <svg
              class="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 8 19"
            >
              <path
                fill-rule="evenodd"
                d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="sr-only">Facebook page</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import MapComponent from '~/components/map/MapComponent.vue'

export default {
  name: 'FooterComponent',
  components: { MapComponent },
}
</script>

<style scoped></style>
