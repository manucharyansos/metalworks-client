export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'metalworks',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'csrf-token', content: '{{ csrf_token() }}' },
      {
        rel: 'icon',
        type: 'image/png',
        href: '~/WhatsApp Image 2024-08-24 at 13.01.26_24d3ab90.jpg',
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/png',
        href: '/WhatsApp Image 2024-08-24 at 13.01.26_24d3ab90.jpg',
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/assets/css/main.css'],

  router: {
    middleware: ['auth'],
  },

  auth: {
    strategies: {
      laravelSanctum: {
        provider: 'laravel/sanctum',
        url: 'http://localhost:8000',
        endpoints: {
          login: { url: '/api/login', method: 'post' },
          logout: { url: '/api/logout', method: 'post' },
          // register: { url: '/api/register', method: 'post' },
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
    creatorRole: process.env.CREATOR_ROLE || 'creator',
    adminRole: process.env.ADMIN_ROLE || 'admin',
    laserRole: process.env.LASER_ROLE || 'laser',
    bendRole: process.env.BEND_ROLE || 'bend',
  },

  plugins: [
    { src: '~/plugins/flowbite.js', mode: 'client' },
    { src: '~/plugins/notifications-ssr', ssr: true },
    { src: '~/plugins/notifications-client', ssr: false },
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
    baseURL: 'http://localhost:8000',
    credentials: true,
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
