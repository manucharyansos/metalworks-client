<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 px-4"
  >
    <div class="w-full max-w-md text-center">
      <!-- Warning Icon -->
      <div
        class="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100/80 shadow-lg ring-8 ring-red-50/50"
      >
        <svg
          class="h-14 w-14 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <!-- Title -->
      <h2 class="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
        Արգելված է
      </h2>

      <!-- Description -->
      <p class="mb-10 text-base leading-relaxed text-gray-600 sm:text-lg">
        Դուք չունեք հասանելիություն։<br />
        <span class="font-medium text-gray-700"
          >Խնդրում ենք դիմել ադմինիստրատորին</span
        >
        օգնության համար։
      </p>

      <button
        class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-95"
        @click="$router.push('/engineer')"
      >
        <svg
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d=" HygieneM10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Վերադառնալ
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PermissionDenied',
}
</script>

<style scoped>
/* Subtle animation for icon */
.h-24.w-24 {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}
</style>
