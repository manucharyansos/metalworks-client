<template>
  <div class="antialiased bg-gray-50 dark:bg-gray-900">
    <main
      class="creator p-6 flex items-center justify-center fixed top-20 left-0 right-0 z-10 w-full overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full"
    >
      <!--      create dropdown-->
    </main>
  </div>
</template>
<script>
export default {
  name: 'CreatorPage',
  layout: 'creatorLayout',
  middleware: 'creator',
}
</script>

<style scoped></style>
