<template>
  <div v-if="$store.state.workspace && $store.state.workspace.switching" class="fixed inset-0 z-[3000] flex items-center justify-center bg-white text-sm font-semibold text-slate-700 dark:bg-slate-950 dark:text-white" role="status" aria-live="polite">
    <span class="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700"></span>{{ message }}
  </div>
</template>
<script>
import { workspaceCopy } from '~/utils/company-copy'
export default { computed: { message() { return workspaceCopy(this.$i18n?.locale).switching } } }
</script>
