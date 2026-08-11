<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6"
      @click.self="$emit('close')"
    >
      <div class="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div class="min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Access control</p>
            <h2 class="mt-1 text-lg font-bold text-slate-950 dark:text-white">Աշխատակցի թույլտվություններ</h2>
            <p v-if="user" class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {{ user.name }} · {{ user.email }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
            @click="$emit('close')"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <div v-if="loading" class="flex min-h-[300px] items-center justify-center">
            <div class="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
              <span class="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white"></span>
              Բեռնվում է...
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Ըստ role-ի</p>
                <p class="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">Օգտագործվում է role-ի հիմնական իրավունքը։</p>
              </div>
              <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/25">
                <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">Թույլատրել</p>
                <p class="mt-1 text-xs leading-5 text-emerald-700/80 dark:text-emerald-200/80">Աշխատակցին տալիս է իրավունքը՝ անկախ role-ից։</p>
              </div>
              <div class="rounded-2xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/60 dark:bg-rose-950/25">
                <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-rose-700 dark:text-rose-300">Արգելել</p>
                <p class="mt-1 text-xs leading-5 text-rose-700/80 dark:text-rose-200/80">Արգելում է իրավունքը նույնիսկ եթե role-ը այն տալիս է։</p>
              </div>
            </div>

            <div
              v-if="!permissionGroupsKeys.length"
              class="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-10 text-center dark:border-amber-900/60 dark:bg-amber-950/20"
            >
              <p class="text-sm font-bold text-amber-800 dark:text-amber-200">Թույլտվությունների ցանկը դատարկ է։</p>
              <p class="mt-2 text-xs leading-5 text-amber-700/80 dark:text-amber-300/80">
                Server-ի նոր permission migration-ը պետք է կիրառված լինի։
              </p>
            </div>

            <div
              v-for="groupKey in permissionGroupsKeys"
              :key="groupKey"
              class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              <button
                type="button"
                class="flex w-full items-center justify-between gap-4 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100 dark:bg-slate-950/50 dark:hover:bg-slate-950"
                @click="$emit('toggle-group', groupKey)"
              >
                <div>
                  <p class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ groupLabel(groupKey) }}</p>
                  <p class="mt-0.5 text-[10px] font-medium text-slate-400">{{ (permissionGroups[groupKey] || []).length }} իրավունք</p>
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
                <div v-if="openGroups.includes(groupKey)" class="divide-y divide-slate-100 dark:divide-slate-800">
                  <div
                    v-for="perm in permissionGroups[groupKey]"
                    :key="perm.id"
                    class="grid gap-3 px-4 py-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-950/30 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                  >
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ perm.name }}</p>
                        <span
                          v-if="perm.via_role"
                          class="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                        >
                          Role-ից տրված է
                        </span>
                        <span
                          class="rounded-full px-2 py-0.5 text-[9px] font-bold"
                          :class="effectivePermission(perm) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'"
                        >
                          {{ effectivePermission(perm) ? 'Մուտքը ակտիվ է' : 'Մուտքն անջատված է' }}
                        </span>
                      </div>
                      <code class="mt-1.5 inline-block rounded-lg bg-slate-100 px-2 py-1 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-300">{{ perm.slug }}</code>
                    </div>

                    <div class="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950">
                      <button
                        type="button"
                        class="rounded-lg px-2.5 py-2 text-[10px] font-bold transition sm:px-3 sm:text-xs"
                        :class="overrideFor(perm.id) === 'inherit' ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'"
                        @click="$emit('set-permission-override', perm.id, 'inherit')"
                      >
                        Ըստ role-ի
                      </button>
                      <button
                        type="button"
                        class="rounded-lg px-2.5 py-2 text-[10px] font-bold transition sm:px-3 sm:text-xs"
                        :class="overrideFor(perm.id) === 'allow' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30'"
                        @click="$emit('set-permission-override', perm.id, 'allow')"
                      >
                        Թույլատրել
                      </button>
                      <button
                        type="button"
                        class="rounded-lg px-2.5 py-2 text-[10px] font-bold transition sm:px-3 sm:text-xs"
                        :class="overrideFor(perm.id) === 'deny' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30'"
                        @click="$emit('set-permission-override', perm.id, 'deny')"
                      >
                        Արգելել
                      </button>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <div class="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p class="text-[10px] leading-4 text-slate-400">Փոփոխությունները ուժի մեջ են մտնում «Պահպանել»-ից հետո։</p>
          <div class="flex items-center justify-end gap-2">
            <button
              type="button"
              class="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              @click="$emit('close')"
            >
              Փակել
            </button>
            <button
              type="button"
              class="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              :disabled="saving || !permissionGroupsKeys.length"
              @click="$emit('save')"
            >
              <span v-if="saving" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Պահպանել փոփոխությունները
            </button>
          </div>
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
    deniedPermissionIds: { type: Array, default: () => [] },
    openGroups: { type: Array, default: () => [] },
  },
  methods: {
    overrideFor(permissionId) {
      if (this.deniedPermissionIds.includes(permissionId)) return 'deny'
      if (this.userPermissionIds.includes(permissionId)) return 'allow'
      return 'inherit'
    },
    effectivePermission(permission) {
      const override = this.overrideFor(permission.id)
      if (override === 'deny') return false
      if (override === 'allow') return true
      return Boolean(permission.via_role)
    },
    groupLabel(groupKey) {
      const labels = {
        pmp: 'PMP',
        pmp_group: 'PMP խմբեր',
        pmp_files: 'PMP ֆայլեր',
        orders: 'Պատվերներ',
        clients: 'Հաճախորդներ',
        workers: 'Աշխատակիցներ',
        materials: 'Նյութեր',
        material_categories: 'Նյութերի կատեգորիաներ',
        roles: 'Role-եր',
        factory: 'Արտադրամաս',
        general: 'Ընդհանուր',
      }
      return labels[groupKey] || groupKey || 'Ընդհանուր'
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
