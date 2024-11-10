export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Metalworks - Մետաղի աշխատանքներ, լազերային եռակցում, փոշեմատտացնող ծածկույթ',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Metalworks-ը մասնագիտանում է մետաղի աշխատանքների ոլորտում, ներառյալ լազերային եռակցում, փոշեմատտացնող ծածկույթ, թեքում և բարձր որակի մետաղամշակում։' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'csrf-token', content: '{{ csrf_token() }}' },
      { name: 'keywords', content: 'metalworks, լազերային եռակցում, փոշեմատտացնող ծածկույթ, թեքում, մետաղամշակում' },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'Metalworks' },
      { property: 'og:title', content: 'Metalworks - Մետաղի աշխատանքներ' },
      { property: 'og:description', content: 'Բարձր որակի մետաղամշակում, ներառյալ լազերային եռակցում, փոշեմատտացնող ծածկույթ և թեքում։' },
      { property: 'og:url', content: 'https://metalworks.am' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Metalworks - Փորձագիտական մետաղների պատրաստում Հայաստանում' },
      { property: 'og:description', content: 'Մետաղագործության պրոֆեսիոնալ ծառայություններ Հայաստանում՝ մասնագիտացված լազերային եռակցման, փոշու ծածկույթի և ծռման մեջ։\n' },
      { property: 'og:url', content: 'ttps://www.facebook.com/people/Metal-Works/61558844766402/' },
      { property: 'og:type', content: 'website' },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/assets/css/main.css', 'leaflet/dist/leaflet.css'],

  router: {
    middleware: ['auth'],
  },

  auth: {
    strategies: {
      laravelSanctum: {
        provider: 'laravel/sanctum',
        url: 'https://api.metalworks.am',
        endpoints: {
          login: { url: '/api/login', method: 'post' },
          logout: { url: '/api/logout', method: 'post' },
          user: { url: '/api/user', method: 'get' },
        },
        redirect: {
          login: '/login',
          logout: '/',
          callback: '/login',
          home: '/',
        },
        cookie: {
          name: 'XSRF-TOKEN',
        },
      },
    },
  },


  publicRuntimeConfig: {
    creatorRole: process.env.CREATOR_ROLE || 'creator',
    adminRole: process.env.ADMIN_ROLE || 'admin',
    laserRole: process.env.LASER_ROLE || 'laser',
    bendRole: process.env.BEND_ROLE || 'bend',
  },

  plugins: [
    { src: '~/plugins/flowbite.js', mode: 'client' },
    { src: '~/plugins/notifications-ssr', ssr: true },
    { src: '~/plugins/notifications-client', ssr: false },
    { src: '~/plugins/leaflet.js', mode: 'client' },
  ],

  components: true,

  buildModules: ['@nuxtjs/eslint-module', '@nuxtjs/tailwindcss'],

  modules: ['@nuxtjs/pwa', '@nuxtjs/axios', '@nuxtjs/auth-next'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: 'https://api.metalworks.am',
    withCredentials: true,
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
}
