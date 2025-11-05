<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 relative"
      >
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          {{ isEditMode ? 'Խմբագրել թույլտվությունը' : 'Նոր թույլտվություն' }}
        </h2>

        <form class="space-y-4" @submit.prevent="submit">
          <!-- Անուն -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">
              Անուն (ցուցադրվող)
            </label>
            <input
              v-model="localForm.name"
              type="text"
              class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Օրինակ՝ Տեսնել պատվերները"
            />
            <p v-if="errors.name" class="mt-1 text-xs text-red-500">
              {{ errors.name[0] }}
            </p>
          </div>

          <!-- Module + Action ընտրություն -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Մոդուլ
              </label>
              <select
                v-model="selectedModule"
                class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                @change="onModuleChange"
              >
                <option value="">Ընտրել մոդուլ</option>
                <option
                  v-for="(actions, moduleKey) in permissionsMap"
                  :key="moduleKey"
                  :value="moduleKey"
                >
                  {{ moduleKey }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Գործողություն
              </label>
              <select
                v-model="selectedAction"
                class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                :disabled="!selectedModule"
                @change="onActionChange"
              >
                <option value="">Ընտրել գործողություն</option>
                <option
                  v-for="(label, actionKey) in permissionsMap[selectedModule] ||
                  {}"
                  :key="actionKey"
                  :value="actionKey"
                >
                  {{ label }} ({{ selectedModule }}.{{ actionKey }})
                </option>
              </select>
            </div>
          </div>

          <!-- Slug preview (read-only) -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">
              Slug (ավտոմատ)
            </label>
            <input
              v-model="localForm.slug"
              type="text"
              class="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-700 text-sm"
              readonly
            />
            <p v-if="errors.slug" class="mt-1 text-xs text-red-500">
              {{ errors.slug[0] }}
            </p>
          </div>

          <!-- Group (read-only՝ module) -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">
              Խումբ (module)
            </label>
            <input
              v-model="localForm.group"
              type="text"
              class="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-700 text-sm"
              readonly
            />
            <p v-if="errors.group" class="mt-1 text-xs text-red-500">
              {{ errors.group[0] }}
            </p>
          </div>

          <div class="text-[11px] text-gray-400">
            <p>
              Slug-ը կազմվում է <code>module.action</code> ձևով, օրինակ՝
              <code>orders.view</code>։ Չես կարող ստեղծել այնպիսի slug, որը
              դուրս է նախօրոք նշված ցանկից։
            </p>
          </div>

          <!-- Footer -->
          <div class="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              class="inline-flex items-center rounded-xl px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
              @click="$emit('close')"
            >
              Չեղարկել
            </button>
            <button
              type="submit"
              class="inline-flex items-center rounded-xl px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              :disabled="loading"
            >
              <span
                v-if="loading"
                class="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></span>
              Պահպանել
            </button>
          </div>
        </form>

        <!-- Close icon -->
        <button
          type="button"
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="$emit('close')"
        >
          <span class="sr-only">Փակել</span>
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
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    show: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    errors: { type: Object, default: () => ({}) },
    initialPermission: { type: Object, default: null },
  },

  data() {
    return {
      localForm: {
        id: null,
        name: '',
        slug: '',
        group: '',
      },
      permissionsMap: {}, // { orders: { view: '...', create: '...' }, ... }
      selectedModule: '',
      selectedAction: '',
      mapLoading: false,
    }
  },

  computed: {
    isEditMode() {
      return !!this.localForm.id
    },
  },

  watch: {
    show(val) {
      if (val) {
        this.bootstrap()
      }
    },
    initialPermission: {
      immediate: true,
      handler(val) {
        // bootstrap-ը կանենք show watch-ում,
        // բայց եթե արդեն բացված է, կարող է պետք լինի refresh
        if (this.show) {
          this.bootstrap()
        }
      },
    },
  },

  async created() {
    await this.fetchPermissionMap()
  },

  methods: {
    async fetchPermissionMap() {
      try {
        this.mapLoading = true
        const res = await this.$axios.$get('/api/permissions/map/all')
        this.permissionsMap = res || {}
      } catch (e) {
        console.error('Failed to load permission map', e)
      } finally {
        this.mapLoading = false
      }
    },

    bootstrap() {
      if (this.initialPermission) {
        // Edit mode
        this.localForm = {
          id: this.initialPermission.id,
          name: this.initialPermission.name || '',
          slug: this.initialPermission.slug || '',
          group: this.initialPermission.group || '',
        }

        const [module, action] = (this.initialPermission.slug || '').split('.')
        this.selectedModule = module || ''
        this.selectedAction = action || ''
      } else {
        // Create mode
        this.localForm = {
          id: null,
          name: '',
          slug: '',
          group: '',
        }
        this.selectedModule = ''
        this.selectedAction = ''
      }
    },

    onModuleChange() {
      // Մոդուլը փոխվել է → action-ը reset
      this.selectedAction = ''
      this.updateSlugGroup()
    },

    onActionChange() {
      this.updateSlugGroup()
    },

    updateSlugGroup() {
      if (this.selectedModule && this.selectedAction) {
        this.localForm.slug = `${this.selectedModule}.${this.selectedAction}`
        this.localForm.group = this.selectedModule
      } else {
        this.localForm.slug = ''
        this.localForm.group = this.selectedModule || ''
      }
    },

    submit() {
      this.$emit('save', { ...this.localForm })
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease-out;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
