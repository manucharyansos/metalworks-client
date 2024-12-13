export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title:
      'MetalwWrks - Մետաղի աշխատանքներ, լազերային եռակցում, փոշեմատտացնող ծածկույթ',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'MetalWorks-ը մասնագիտանում է մետաղի աշխատանքների ոլորտում, ներառյալ լազերային եռակցում, փոշեմատտացնող ծածկույթ, թեքում և բարձր որակի մետաղամշակում։',
      },
      { name: 'format-detection', content: 'telephone=no' },
      {
        name: 'keywords',
        content:
          'metalworks, MetalWorks, լազերային եռակցում, փոշեմատտացնող ծածկույթ, թեքում, մետաղամշակում',
      },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'MetalWorks' },
      { property: 'og:title', content: 'MetalWorks - Մետաղի աշխատանքներ' },
      {
        property: 'og:description',
        content:
          'Բարձր որակի մետաղամշակում, ներառյալ լազերային եռակցում, փոշեմատտացնող ծածկույթ և թեքում։',
      },
      { property: 'og:url', content: 'https://metalworks.am' },
      { property: 'og:type', content: 'website' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/assets/css/main.css', 'leaflet/dist/leaflet.css'],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: process.env.BASE_URL || 'http://localhost:8000',
    credentials: true,
  },

  auth: {
    strategies: {
      laravelSanctum: {
        provider: 'laravel/sanctum',
        url: process.env.BASE_URL || 'http://localhost:8000',
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
        token: {
          property: 'data.access_token',
          maxAge: 60 * 60,
        },
        tokenType: 'bearer',
      },
    },
  },

  publicRuntimeConfig: {
    baseURL: process.env.BASE_URL || 'http://localhost:8000',
    creatorRole: process.env.CREATOR_ROLE || 'creator',
    adminRole: process.env.ADMIN_ROLE || 'admin',
    laserRole: process.env.LASER_ROLE || 'laser',
    bendRole: process.env.BEND_ROLE || 'bend',
    dashboards: {
      creator: process.env.CREATOR_DASHBOARD || '/creator',
      admin: process.env.ADMIN_DASHBOARD || '/admin',
      laser: process.env.LASER_DASHBOARD || '/factory/laser',
      bend: process.env.BEND_DASHBOARD || '/factory/bend',
    },
  },

  plugins: [
    { src: '~/plugins/url-helper.js', mode: 'client' },
    { src: '~/plugins/base-url.js', mode: 'client' },
    { src: '~/plugins/notifications-ssr', ssr: true },
    { src: '~/plugins/notifications-client', ssr: false },
    { src: '~/plugins/leaflet.js', mode: 'client' },
  ],

  components: true,

  buildModules: ['@nuxtjs/eslint-module', '@nuxtjs/tailwindcss'],

  modules: ['@nuxtjs/pwa', '@nuxtjs/axios', '@nuxtjs/auth-next'],

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },
  },
}
