<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      @click.self="$emit('close')"
    >
      <div class="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <header class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-7">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Access control</p>
              <span class="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">Անհատական</span>
            </div>
            <h2 class="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">Ֆունկցիաների հասանելիություն</h2>
            <p v-if="user" class="mt-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {{ user.name }} · {{ user.email }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-xl p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Փակել"
            @click="$emit('close')"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <div v-if="loading" class="flex min-h-[320px] items-center justify-center">
            <div class="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
              <span class="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white"></span>
              Բեռնվում է...
            </div>
          </div>

          <div v-else class="space-y-5">
            <section class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Ընդհանուր</p>
                <p class="mt-2 text-2xl font-black text-slate-950 dark:text-white">{{ totalPermissions }}</p>
                <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">հասանելի ֆունկցիա</p>
              </div>
              <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/25">
                <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">Տրված է</p>
                <p class="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-300">{{ selectedCount }}</p>
                <p class="mt-1 text-[11px] text-emerald-700/70 dark:text-emerald-300/70">այս աշխատակցին</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Սկզբունք</p>
                <p class="mt-2 text-xs font-bold leading-5 text-slate-700 dark:text-slate-200">Միացված է միայն նշվածը</p>
                <p class="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">Role-ի permissions-ը այստեղ չեն օգտագործվում։</p>
              </div>
            </section>

            <div
              v-if="!permissionGroupsKeys.length"
              class="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-10 text-center dark:border-amber-900/60 dark:bg-amber-950/20"
            >
              <p class="text-sm font-bold text-amber-800 dark:text-amber-200">Թույլտվությունների ցանկը դատարկ է։</p>
              <p class="mt-2 text-xs leading-5 text-amber-700/80 dark:text-amber-300/80">Server-ում permission catalog-ը պետք է համաժամացված լինի։</p>
            </div>

            <section
              v-for="groupKey in permissionGroupsKeys"
              :key="groupKey"
              class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              <button
                type="button"
                class="flex w-full items-center justify-between gap-4 bg-slate-50 px-4 py-3.5 text-left transition hover:bg-slate-100 dark:bg-slate-950/50 dark:hover:bg-slate-950 sm:px-5"
                @click="$emit('toggle-group', groupKey)"
              >
                <div>
                  <p class="text-xs font-black text-slate-800 dark:text-slate-100">{{ groupLabel(groupKey) }}</p>
                  <p class="mt-0.5 text-[10px] font-medium text-slate-400">{{ selectedInGroup(groupKey) }} / {{ (permissionGroups[groupKey] || []).length }} միացված</p>
                </div>
                <svg
                  class="h-4 w-4 text-slate-400 transition-transform"
                  :class="{ 'rotate-180': openGroups.includes(groupKey) }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m19 9-7 7-7-7" />
                </svg>
              </button>

              <transition name="fade">
                <div v-if="openGroups.includes(groupKey)" class="grid gap-2 p-3 sm:grid-cols-2 sm:p-4">
                  <label
                    v-for="perm in permissionGroups[groupKey]"
                    :key="perm.id"
                    class="group flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition"
                    :class="isSelected(perm.id)
                      ? 'border-emerald-200 bg-emerald-50/70 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-950/40'"
                  >
                    <input
                      type="checkbox"
                      class="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      :checked="isSelected(perm.id)"
                      @change="$emit('toggle-permission', perm.id)"
                    />
                    <span class="min-w-0 flex-1">
                      <span class="block text-sm font-bold text-slate-900 dark:text-white">{{ perm.name }}</span>
                      <code class="mt-1.5 inline-block break-all rounded-lg bg-slate-100 px-2 py-1 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-300">{{ perm.slug }}</code>
                    </span>
                    <span
                      class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black"
                      :class="isSelected(perm.id) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'"
                    >
                      {{ isSelected(perm.id) ? '✓' : '–' }}
                    </span>
                  </label>
                </div>
              </transition>
            </section>
          </div>
        </div>

        <footer class="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p class="max-w-xl text-[10px] leading-4 text-slate-400">Չնշված ֆունկցիաները աշխատակցի համար փակ են։ Փոփոխությունը գործում է պահպանելուց և օգտատիրոջ տվյալները թարմացնելուց հետո։</p>
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" @click="$emit('close')">Փակել</button>
            <button
              type="button"
              class="inline-flex items-center rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              :disabled="saving || !permissionGroupsKeys.length"
              @click="$emit('save')"
            >
              <span v-if="saving" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Պահպանել
            </button>
          </div>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'UserPermissionsModal',
  props: {
    show: { type: Boolean, default: false },
    user: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    saving: { type: Boolean, default: false },
    permissionGroups: { type: Object, default: () => ({}) },
    permissionGroupsKeys: { type: Array, default: () => [] },
    userPermissionIds: { type: Array, default: () => [] },
    openGroups: { type: Array, default: () => [] },
  },
  computed: {
    totalPermissions() {
      return this.permissionGroupsKeys.reduce(
        (total, key) => total + (this.permissionGroups[key] || []).length,
        0
      )
    },
    selectedCount() {
      return this.userPermissionIds.length
    },
  },
  methods: {
    isSelected(permissionId) {
      return this.userPermissionIds.map(Number).includes(Number(permissionId))
    },
    selectedInGroup(groupKey) {
      return (this.permissionGroups[groupKey] || []).filter((permission) =>
        this.isSelected(permission.id)
      ).length
    },
    groupLabel(groupKey) {
      const labels = {
        pmp: 'PMP կառավարում',
        pmp_group: 'PMP խմբեր',
        pmp_files: 'PMP ֆայլեր',
        orders: 'Պատվերներ',
        clients: 'Հաճախորդներ',
        workers: 'Աշխատակիցներ',
        materials: 'Նյութեր',
        material_categories: 'Նյութերի կատեգորիաներ',
        roles: 'Role-երի դիտում',
        factory: 'Արտադրամաս',
        general: 'Ընդհանուր',
      }
      return labels[groupKey] || groupKey
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
