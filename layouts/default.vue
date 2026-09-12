<template>
  <main class="relative flex min-h-screen flex-col items-center justify-center">
    <div class="fixed right-4 top-4 z-[1200] rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 sm:right-6 sm:top-6">
      <LanguageDropdown />
    </div>
    <Nuxt />
  </main>
</template>

<script>
export default { name: 'DefaultLayout' }
</script>
