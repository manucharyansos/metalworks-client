<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col"
      >
        <!-- Header -->
        <div
          class="px-5 py-4 border-b flex items-center justify-between bg-gray-50"
        >
          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              Օգտատիրոջ թույլտվություններ
            </h2>
            <p
              v-if="user"
              class="mt-0.5 text-xs text-gray-500 flex items-center gap-2"
            >
              <span>{{ user.name }}</span>
              <span class="text-gray-300">·</span>
              <span>{{ user.email }}</span>
            </p>
          </div>

          <button
            type="button"
            class="text-gray-400 hover:text-gray-600"
            @click="$emit('close')"
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-5 py-4">
          <div v-if="loading" class="py-10 text-center text-gray-400 text-sm">
            Բեռնվում է թույլտվությունները...
          </div>

          <div v-else>
            <div
              v-if="!permissionGroupsKeys.length"
              class="py-10 text-center text-gray-400 text-sm"
            >
              Թույլտվություններ չկան։
            </div>

            <!-- Groups -->
            <div
              v-for="groupKey in permissionGroupsKeys"
              :key="groupKey"
              class="mb-4 border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                type="button"
                class="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 text-left text-xs font-semibold text-gray-700"
                @click="$emit('toggle-group', groupKey)"
              >
                <span class="uppercase tracking-wide">
                  {{ groupKey || 'general' }}
                </span>
                <svg
                  class="w-4 h-4 text-gray-400 transition-transform duration-200"
                  :class="{
                    'rotate-180': openGroups.includes(groupKey),
                  }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <transition name="fade">
                <div
                  v-if="openGroups.includes(groupKey)"
                  class="divide-y divide-gray-100"
                >
                  <div
                    v-for="perm in permissionGroups[groupKey]"
                    :key="perm.id"
                    class="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-gray-50"
                  >
                    <div>
                      <div
                        class="text-sm font-medium text-gray-900 flex items-center gap-2"
                      >
                        {{ perm.name }}
                        <span
                          v-if="perm.via_role"
                          class="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5"
                        >
                          Role-ից
                        </span>
                      </div>
                      <div class="mt-0.5 text-xs text-gray-500">
                        <code
                          class="bg-gray-100 rounded px-2 py-0.5 inline-block"
                        >
                          {{ perm.slug }}
                        </code>
                      </div>
                    </div>

                    <div class="flex items-center gap-3 sm:gap-5">
                      <label
                        class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          :checked="userPermissionIds.includes(perm.id)"
                          @change="
                            $emit(
                              'toggle-permission',
                              perm.id,
                              $event.target.checked
                            )
                          "
                        />
                        <span>Տալ անհատական իրավունք</span>
                      </label>

                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                        :class="
                          perm.effective
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        "
                      >
                        {{ perm.effective ? 'Ակտիվ է' : 'Անջատված է' }}
                      </span>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <p class="text-[11px] text-gray-400 mt-2">
              Այստեղ փոխում ես միայն
              <strong>օգտատիրոջ անհատական թույլտվությունները</strong>։ Role-ից
              եկող իրավունքները չեն ջնջվում, եթե տակից հանես նշումը։
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="px-5 py-3 border-t bg-gray-50 flex items-center justify-end gap-3"
        >
          <button
            type="button"
            class="inline-flex items-center rounded-xl px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
            @click="$emit('close')"
          >
            Փակել
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-xl px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
            :disabled="saving"
            @click="$emit('save')"
          >
            <span
              v-if="saving"
              class="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
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
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
