<template>
  <header
    class="sticky top-0 z-50 bg-stone-200/80 backdrop-blur supports-[backdrop-filter]:bg-stone-200/70"
  >
    <nav
      class="bg-transparent dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm"
    >
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between gap-4 py-2">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <NuxtLink to="/" class="flex items-center gap-2 group">
              <img
                src="/logo.png"
                class="size-12 sm:size-16 rounded-full border-2 border-red-500 group-hover:border-red-600 transition-colors duration-200"
                alt="Metalwork's Logo"
              />
              <span class="hidden sm:block font-semibold tracking-wide"
                >MetalWorks</span
              >
            </NuxtLink>
          </div>
          <div class="flex items-center justify-center">
            <NuxtLink
              :to="localePath('index')"
              class="nav-link"
              exact-active-class="active-link"
              exact
              >{{ $t('nav.home') }}</NuxtLink
            >
            <NuxtLink
              :to="localePath('about')"
              class="nav-link"
              exact-active-class="active-link"
              exact
              >{{ $t('nav.about') }}</NuxtLink
            >
            <NuxtLink
              :to="localePath('services')"
              class="nav-link"
              exact-active-class="active-link"
              exact
              >{{ $t('nav.services') }}</NuxtLink
            >
            <NuxtLink
              :to="localePath('products')"
              class="nav-link"
              exact-active-class="active-link"
              exact
              >{{ $t('nav.products') }}</NuxtLink
            >
            <NuxtLink
              :to="localePath('contact')"
              class="nav-link"
              exact-active-class="active-link"
              exact
              >{{ $t('nav.contact') }}</NuxtLink
            >
          </div>

          <!-- Language selector (always visible) -->
          <div class="flex items-center gap-3">
            <LanguageDropdown />
          </div>

          <!-- Right side elements -->
          <div class="flex items-center">
            <template v-if="$auth && $auth.loggedIn">
              <BasketButton />
              <BasketModal :is-open="isBasketOpen" @close="closeBasket" />

              <BaseModal :is-open="openDropdown" @close="openDropdown = false">
                <div
                  class="rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/10 divide-y divide-gray-100 dark:divide-gray-700 w-56"
                >
                  <div class="px-4 py-3">
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ $auth.user && $auth.user.name }}
                    </p>
                    <p
                      class="text-sm text-gray-500 dark:text-gray-400 truncate"
                    >
                      {{ $auth.user && $auth.user.email }}
                    </p>
                  </div>
                  <div class="py-1">
                    <NuxtLink
                      to="/"
                      class="dropdown-item"
                      @click.native="openDropdown = false"
                      >Dashboard</NuxtLink
                    >
                    <NuxtLink
                      to="/#"
                      class="dropdown-item"
                      @click.native="openDropdown = false"
                      >Settings</NuxtLink
                    >
                  </div>
                  <div class="py-1">
                    <button
                      class="dropdown-item text-left w-full"
                      @click="$auth.logout()"
                    >
                      Դուրս գալ
                    </button>
                  </div>
                </div>
              </BaseModal>

              <button
                class="hidden sm:flex items-center focus:outline-none"
                aria-label="User menu"
                @click="openDropdown = !openDropdown"
              >
                <div class="relative">
                  <img
                    src="/User-avatar.svg.png"
                    class="w-8 h-8 rounded-full border-2 border-transparent hover:border-red-500 transition-all duration-200"
                    alt="User avatar"
                  />
                  <span
                    class="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900"
                  ></span>
                </div>
              </button>
            </template>

            <template v-else>
              <div class="hidden lg:flex lg:gap-3">
                <NuxtLink to="/login" class="auth-link login">{{
                  $t('nav.login')
                }}</NuxtLink>
                <NuxtLink to="/register" class="auth-button">{{
                  $t('nav.register')
                }}</NuxtLink>
              </div>
            </template>

            <!-- Mobile menu button -->
            <button
              class="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors duration-200"
              aria-label="Menu"
              @click="openNavbar = !openNavbar"
            >
              <svg
                class="w-6 h-6"
                :class="{ hidden: openNavbar, block: !openNavbar }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                class="w-6 h-6"
                :class="{ hidden: !openNavbar, block: openNavbar }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Nav -->
        <transition name="slide-down">
          <div
            v-if="openNavbar"
            class="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-4 space-y-1"
          >
            <NuxtLink
              :to="localePath('index')"
              class="mobile-link"
              exact-active-class="active-link"
              @click.native="openNavbar = false"
              >{{ $t('nav.home') }}</NuxtLink
            >
            <NuxtLink
              :to="localePath('services')"
              class="mobile-link"
              exact-active-class="active-link"
              @click.native="openNavbar = false"
              >{{ $t('nav.services') }}</NuxtLink
            >
            <NuxtLink
              :to="localePath('products')"
              class="mobile-link"
              exact-active-class="active-link"
              @click.native="openNavbar = false"
              >{{ $t('nav.products') }}</NuxtLink
            >
            <NuxtLink
              :to="localePath('contact')"
              class="mobile-link"
              exact-active-class="active-link"
              @click.native="openNavbar = false"
              >{{ $t('nav.contact') }}</NuxtLink
            >
            <div v-if="!$auth || !$auth.loggedIn" class="mt-4">
              <NuxtLink to="/login" class="mobile-link block text-center">{{
                $t('nav.login')
              }}</NuxtLink>
              <NuxtLink
                to="/register"
                class="mobile-link block text-center border-red-600 text-white mt-2 py-2 rounded-md"
                >{{ $t('nav.register') }}</NuxtLink
              >
            </div>
          </div>
        </transition>
      </div>
    </nav>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import BasketButton from '~/components/basket/BasketButton'
import BasketModal from '~/components/basket/BasketModal'
import BaseModal from '~/components/modals/ui/BaseModal.vue'
import LanguageDropdown from '@/components/language/LanguageDropdown.vue'

export default {
  components: { LanguageDropdown, BasketButton, BasketModal, BaseModal },
  data() {
    return {
      openDropdown: false,
      openNavbar: false,
    }
  },
  computed: {
    ...mapGetters('basket', ['isBasketOpen']),
  },
  watch: {
    isBasketOpen(val) {
      if (val) this.openDropdown = false
    },
    openDropdown(val) {
      if (val && this.isBasketOpen) this.closeBasket()
    },
  },
  methods: {
    ...mapActions('basket', ['closeBasket']),
  },
}
</script>

<style scoped>
/* ---- global helpers ---- */
.logo-img {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* ---- desktop links ---- */
.nav-link {
  @apply px-3 py-2
  text-gray-700 dark:text-gray-300
  hover:text-red-600 dark:hover:text-red-400
  rounded-md transition duration-200;
  font-family: 'Montserrat', sans-serif;
  font-weight: 200; /* ExtraLight */
  font-size: 1.125rem; /* text-lg default */
  line-height: 1.75rem;
}

/* ---- dropdown items ---- */
.dropdown-item {
  @apply block px-4 py-2
  text-gray-700 dark:text-gray-300
  hover:bg-gray-100 dark:hover:bg-gray-700 transition;
  font-family: 'Montserrat', sans-serif;
  font-weight: 200;
  font-size: 1.125rem; /* text-lg default */
  line-height: 1.75rem;
}

/* ---- auth links/buttons ---- */
.auth-link {
  @apply px-4 py-2
  text-red-600 hover:text-red-700
  transition-colors duration-200;
  font-family: 'Montserrat', sans-serif;
  font-weight: 200;
  font-size: 1.125rem; /* text-lg default */
  line-height: 1.75rem;
}
.login {
  color: black;
}

.auth-button {
  @apply px-4 py-2
  text-red-600 bg-white border border-red-600
  hover:text-white hover:bg-red-600
  rounded-2xl shadow transition-colors duration-200;
  font-family: 'Montserrat', sans-serif;
  font-weight: 200;
  font-size: 1.125rem; /* text-lg default */
  line-height: 1.75rem;
}

/* ---- mobile links ---- */
.mobile-link {
  @apply block px-4 py-2 rounded-md
  text-gray-700 dark:text-gray-300
  hover:text-red-600 dark:hover:text-red-400
  hover:bg-gray-100 dark:hover:bg-gray-800
  transition duration-200;
  font-family: 'Montserrat', sans-serif;
  font-weight: 200;
  font-size: 1.125rem; /* text-lg default */
  line-height: 1.75rem;
}

/* only the active link is red (desktop + mobile) */
.active-link {
  @apply text-red-600 dark:text-red-400;
}

/* size rule: from 1180px and up → text-xl */
@media (min-width: 1180px) {
  .nav-link,
  .dropdown-item,
  .auth-link,
  .auth-button,
  .mobile-link {
    font-size: 1.25rem; /* text-xl */
    line-height: 1.75rem;
  }
}

/* mobile menu transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
