export default {
  ssr: false,
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title:
      'MetalWorks - Մետաղի աշխատանքներ, լազերային եռակցում, փոշեմատտացնող ծածկույթ',
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
          "metalwork's, MetalWorks, լազերային եռակցում, փոշեմատտացնող ծածկույթ, թեքում, մետաղամշակում",
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
  css: [
    '~/assets/css/main.css',
    'leaflet/dist/leaflet.css',
    // 'swiper/css/swiper.min.css',
  ],
  router: {
    // base: '/work/',
    middleware: ['roleRedirect'],
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // baseURL: process.env.BASE_URL,
    // baseURL: 'https://api.metalworks.am',
    baseURL: 'http://localhost:8000',
    credentials: true,
  },

  auth: {
    redirect: {
      login: '/login',
      logout: '/login',
      callback: false,
      home: false,
    },
    strategies: {
      laravelSanctum: {
        provider: 'laravel/sanctum',
        // url: process.env.BASE_URL,
        // url: 'https://api.metalworks.am',
        url: 'http://localhost:8000',
        endpoints: {
          csrf: { url: '/sanctum/csrf-cookie' },
          login: { url: '/api/login', method: 'post' },
          logout: { url: '/api/logout', method: 'post' },
          user: { url: '/api/user', method: 'get' },
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

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000',
      // apiBase: 'api.metalworks.am',
    },
  },

  publicRuntimeConfig: {
    baseURL: process.env.BASE_URL,
    managerRole: process.env.MANAGER_ROLE || 'manager',
    engineerRole: process.env.ENGINEER_ROLE || 'engineer',
    adminRole: process.env.ADMIN_ROLE || 'admin',
    laserRole: process.env.LASER_ROLE || 'laser',
    bendRole: process.env.BEND_ROLE || 'bend',
    dashboards: {
      manager: process.env.MANAGER_DASHBOARD || '/manager',
      engineer: process.env.ENGINEER_DASHBOARD || '/engineer',
      admin: process.env.ADMIN_DASHBOARD || '/admin',
      laser: process.env.LASER_DASHBOARD || '/factory/laser',
      bend: process.env.BEND_DASHBOARD || '/factory/bend',
    },
  },

  plugins: [
    { src: '~/plugins/url-helper.js', mode: 'client' },
    { src: '~/plugins/base-url.js', mode: 'client' },
    { src: '~/plugins/moment.js', mode: 'client' },
    { src: '~/plugins/can.js', mode: 'client' },
    { src: '~/plugins/notifications-ssr', ssr: true },
    { src: '~/plugins/notifications-client', ssr: false },
    { src: '~/plugins/leaflet.js', mode: 'client' },
    { src: '~/plugins/formatDate' },
    { src: '~/plugins/vue-carousel.js', mode: 'client' },
    { src: '~/plugins/axios-locale.js' },
  ],

  components: true,

  buildModules: ['@nuxtjs/eslint-module', '@nuxtjs/tailwindcss'],

  modules: [
    '@nuxtjs/pwa',
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/i18n',
  ],

  i18n: {
    locales: [
      { code: 'hy', iso: 'hy-AM', file: 'hy.json', name: 'Հայերեն' },
      { code: 'ru', iso: 'ru-RU', file: 'ru.json', name: 'Русский' },
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
    ],
    defaultLocale: 'hy',
    lazy: true,
    langDir: 'locales/',
    strategy: 'prefix_except_default',
    seo: true,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      fallbackLocale: 'hy',
    },
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  generate: {
    fallback: true,
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
