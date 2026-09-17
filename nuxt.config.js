const PRODUCTION_API_BASE_URL = 'https://api.metalworks.am'
const configuredApiBaseURL = process.env.API_BASE_URL || process.env.BASE_URL || ''
const configuredApiIsLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(
  configuredApiBaseURL
)
const isProduction = process.env.NODE_ENV === 'production'
const apiBaseURL = isProduction
  ? configuredApiIsLocal || !configuredApiBaseURL
    ? PRODUCTION_API_BASE_URL
    : configuredApiBaseURL
  : configuredApiBaseURL || 'http://localhost:8000'

export default {
  ssr: false,
  head: {
    title: 'MetalWorks',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'MetalWorks production management workspace',
      },
      { name: 'format-detection', content: 'telephone=no' },
      {
        name: 'keywords',
        content: "metalwork's, MetalWorks, production, manufacturing, metalworking",
      },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'MetalWorks' },
      { property: 'og:title', content: 'MetalWorks' },
      {
        property: 'og:description',
        content: 'MetalWorks production management workspace',
      },
      { property: 'og:url', content: 'https://metalworks.am' },
      { property: 'og:type', content: 'website' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  css: ['~/assets/css/main.css', 'leaflet/dist/leaflet.css'],
  router: {
    base: process.env.NUXT_ROUTER_BASE || '/',
    middleware: ['roleRedirect', 'permission-guard'],
  },

  axios: {
    baseURL: apiBaseURL,
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
        url: apiBaseURL,
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
      apiBase: apiBaseURL,
    },
  },

  publicRuntimeConfig: {
    baseURL: apiBaseURL,
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
    { src: '~/plugins/password-visibility.client.js', mode: 'client' },
    { src: '~/plugins/notifications-ssr', ssr: true },
    { src: '~/plugins/notifications-client', ssr: false },
    { src: '~/plugins/leaflet.js', mode: 'client' },
    { src: '~/plugins/formatDate' },
    { src: '~/plugins/vue-carousel.js', mode: 'client' },
    { src: '~/plugins/axios-locale.js' },
    { src: '~/plugins/locale-utils.js' },
    { src: '~/plugins/locale-date-runtime.client.js', mode: 'client' },
    { src: '~/plugins/ui-i18n-bridge.client.js', mode: 'client' },
    { src: '~/plugins/ui-i18n-extended.client.js', mode: 'client' },
    { src: '~/plugins/global-language-switcher.client.js', mode: 'client' },
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

  pwa: {
    manifest: {
      name: 'MetalWorks',
      short_name: 'MetalWorks',
      lang: 'hy',
    },
    workbox: {
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
    },
  },

  generate: {
    fallback: true,
  },

  build: {
    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },
  },
}
