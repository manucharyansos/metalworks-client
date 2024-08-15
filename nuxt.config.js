export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'metalworks',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: "csrf-token", content: "{{ csrf_token() }}" }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      // { rel: 'stylesheet', href: '/https://cdn.jsdelivr.net/npm/flowbite@2.5.1/dist/flowbite.min.css' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/assets/css/main.css'],

  router: {
    middleware: ['auth']
  },

  auth: {
    strategies: {
      'laravelSanctum': {
        provider: 'laravel/sanctum',
        url: 'http://localhost:8000',
        endpoints: {
          login: { url: '/api/login', method: 'post' },
          logout: { url: '/api/logout', method: 'post' },
          register: { url: '/api/register', method: 'post' },
          user: { url: '/api/user', method: 'get' },
          // getProducts: { url: '/api/products', method: 'get'}
        },
        redirect: {
          login: '/login',
          register: '/',
          logout: '/',
          callback: '/login',
          // home: '/'
        },
        cookie: {
          name: 'XSRF-TOKEN'
        },
        token: {
          property: "data.access_token",
          maxAge: 60 * 60
        },
        tokenType: 'bearer'
      }
    }
  },

  // plugins: ['~/plugins/axios.js'],

  components: true,

  buildModules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/tailwindcss'
  ],

  modules: [
    '@nuxtjs/pwa',
    '@nuxtjs/axios',
    '@nuxtjs/auth-next'
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: "http://localhost:8000",
    credentials: true
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {}
}
