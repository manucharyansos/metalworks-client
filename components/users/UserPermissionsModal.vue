<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6"
      @click.self="$emit('close')"
    >
      <div class="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div class="min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Access control</p>
            <h2 class="mt-1 text-lg font-bold text-slate-950 dark:text-white">Օգտատիրոջ թույլտվություններ</h2>
            <p v-if="user" class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{{ user.name }} · {{ user.email }}</p>
          </div>
          <button type="button" class="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white" @click="$emit('close')">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <div v-if="loading" class="flex min-h-[260px] items-center justify-center">
            <div class="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300"><span class="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white"></span>Բեռնվում է...</div>
          </div>

          <div v-else class="space-y-3">
            <div v-if="!permissionGroupsKeys.length" class="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400 dark:border-slate-800">Թույլտվություններ չկան։</div>

            <div v-for="groupKey in permissionGroupsKeys" :key="groupKey" class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <button type="button" class="flex w-full items-center justify-between gap-4 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100 dark:bg-slate-950/50 dark:hover:bg-slate-950" @click="$emit('toggle-group', groupKey)">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">{{ groupKey || 'general' }}</p>
                  <p class="mt-0.5 text-[10px] text-slate-400">{{ (permissionGroups[groupKey] || []).length }} permission</p>
                </div>
                <svg class="h-4 w-4 text-slate-400 transition-transform" :class="{ 'rotate-180': openGroups.includes(groupKey) }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m19 9-7 7-7-7" /></svg>
              </button>

              <transition name="fade">
                <div v-if="openGroups.includes(groupKey)" class="divide-y divide-slate-100 dark:divide-slate-800">
                  <div v-for="perm in permissionGroups[groupKey]" :key="perm.id" class="flex flex-col gap-3 px-4 py-3.5 transition hover:bg-slate-50/70 dark:hover:bg-slate-950/30 sm:flex-row sm:items-center sm:justify-between">
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ perm.name }}</p>
                        <span v-if="perm.via_role" class="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">Role-ից</span>
                      </div>
                      <code class="mt-1 inline-block rounded-lg bg-slate-100 px-2 py-1 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-300">{{ perm.slug }}</code>
                    </div>
                    <div class="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                      <label class="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400 dark:border-slate-700" :checked="userPermissionIds.includes(perm.id)" @change="$emit('toggle-permission', perm.id, $event.target.checked)" />
                        Անհատական իրավունք
                      </label>
                      <span class="rounded-full px-2.5 py-1 text-[9px] font-bold" :class="perm.effective ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'">{{ perm.effective ? 'Ակտիվ է' : 'Անջատված է' }}</span>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <div class="rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              Այստեղ փոխվում են միայն օգտատիրոջ անհատական իրավունքները։ Role-ից ժառանգված permission-ը checkbox-ից հանելով չի վերանա։
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">
          <button type="button" class="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" @click="$emit('close')">Փակել</button>
          <button type="button" class="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" :disabled="saving" @click="$emit('save')">
            <span v-if="saving" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
            Պահպանել փոփոխությունները
          </button>
        </div>
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
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter,
.fade-leave-to { opacity: 0; }
</style>
