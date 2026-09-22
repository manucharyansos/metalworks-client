<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" @click="$emit('close')"></div>
      <div
        class="relative w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        style="max-height: 92vh"
      >
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 class="mt-1 text-xl font-black text-slate-950 dark:text-white">
              {{ isEdit ? 'Փոփոխել նյութը' : 'Նոր նյութ' }}
            </h3>
          </div>
          <button type="button" class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" @click="$emit('close')">✕</button>
        </div>

        <form @submit.prevent="submit" class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Նկարագրություն</label>
            <textarea v-model="form.description" class="field min-h-[96px] resize-y"></textarea>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Լայնություն</label>
            <input v-model.number="form.width" type="number" step="0.01" class="field" />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Երկարություն</label>
            <input v-model.number="form.length" type="number" step="0.01" class="field" />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Բարձրություն</label>
            <input v-model.number="form.height" type="number" step="0.01" class="field" />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Հաստություն</label>
            <input v-model.number="form.thickness" type="number" step="0.01" class="field" />
          </div>

          <div class="md:col-span-2">
            <div class="mb-1.5 flex items-center justify-between gap-3">
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-300">Կատեգորիա <span class="text-rose-500">*</span></label>
              <button
                type="button"
                class="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-300"
                @click="openCategoryManager"
              >
                + Նոր կատեգորիա
              </button>
            </div>

            <select v-model="form.material_category_id" required class="field">
              <option :value="null" disabled>{{ categories.length ? 'Ընտրել…' : 'Կատեգորիա դեռ չկա' }}</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>

            <div v-if="!categories.length" class="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
              Համակարգում դեռ նյութի կատեգորիա չկա։ Սեղմեք «Նոր կատեգորիա» և ստեղծեք առաջին խումբն ու կատեգորիան։
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Նկար (ըստ ցանկության)</label>
            <input type="file" accept="image/*" class="field file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-bold dark:file:bg-slate-800" @change="onFile" />
          </div>

          <div class="mt-2 flex justify-end gap-3 md:col-span-2">
            <button type="button" class="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="$emit('close')">Փակել</button>
            <button type="submit" class="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" :disabled="submitting || !categories.length">
              {{ submitting ? 'Պահվում է…' : isEdit ? 'Պահպանել' : 'Ստեղծել' }}
            </button>
          </div>
        </form>

        <div v-if="categoryManagerOpen" class="absolute inset-0 z-20 flex items-center justify-center rounded-[28px] bg-slate-950/50 p-4 backdrop-blur-sm" @click.self="closeCategoryManager">
          <div class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-lg font-black text-slate-950 dark:text-white">Նյութի խումբ և կատեգորիա</h4>
                  <InfoTooltip>Եթե խումբ չկա՝ նախ ստեղծեք խումբ, հետո դրա ներսում կատեգորիա։</InfoTooltip>
                </div>
              </div>
              <button type="button" class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 dark:border-slate-700" @click="closeCategoryManager">✕</button>
            </div>

            <div v-if="catalogError" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-300">{{ catalogError }}</div>

            <div class="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <label class="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Նոր խմբի անուն</label>
              <div class="flex gap-2">
                <input v-model.trim="newGroupName" type="text" class="field flex-1" placeholder="Օր. Մետաղներ" @keyup.enter.prevent="createGroup" />
                <button type="button" class="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white disabled:opacity-40 dark:bg-white dark:text-slate-950" :disabled="catalogSaving || !newGroupName" @click="createGroup">Ավելացնել</button>
              </div>
            </div>

            <div class="mt-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <label class="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Խումբ</label>
              <select v-model="selectedGroupId" class="field" :disabled="!groups.length">
                <option :value="null" disabled>{{ groups.length ? 'Ընտրել խումբ…' : 'Խումբ դեռ չկա' }}</option>
                <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
              </select>

              <label class="mb-1.5 mt-3 block text-xs font-bold text-slate-600 dark:text-slate-300">Նոր կատեգորիայի անուն</label>
              <input v-model.trim="newCategoryName" type="text" class="field" placeholder="Օր. Չժանգոտվող պողպատ" @keyup.enter.prevent="createCategory" />

              <button type="button" class="mt-3 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40" :disabled="catalogSaving || !selectedGroupId || !newCategoryName" @click="createCategory">
                {{ catalogSaving ? 'Պահվում է…' : 'Ստեղծել կատեգորիա' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    item: { type: Object, default: null },
    categories: { type: Array, default: () => [] },
    submitting: Boolean,
  },
  data() {
    return {
      form: this.makeForm(this.item),
      categoryManagerOpen: false,
      groups: [],
      newGroupName: '',
      selectedGroupId: null,
      newCategoryName: '',
      catalogSaving: false,
      catalogError: '',
    }
  },
  computed: {
    isEdit() {
      return !!(this.item && this.item.id)
    },
  },
  watch: {
    item: {
      deep: true,
      immediate: true,
      handler(v) {
        this.form = this.makeForm(v)
      },
    },
    visible(v) {
      if (v) {
        this.form = this.makeForm(this.item)
        this.categoryManagerOpen = false
        this.catalogError = ''
      }
    },
  },
  methods: {
    makeForm(v) {
      return {
        description: v?.description || '',
        width: v?.width ?? null,
        length: v?.length ?? null,
        height: v?.height ?? null,
        thickness: v?.thickness ?? null,
        material_category_id: v?.material_category_id ?? null,
        image: null,
      }
    },
    onFile(e) {
      this.form.image = e.target.files?.[0] || null
    },
    async openCategoryManager() {
      this.categoryManagerOpen = true
      this.catalogError = ''
      await this.loadGroups()
    },
    closeCategoryManager() {
      this.categoryManagerOpen = false
      this.catalogError = ''
      this.newGroupName = ''
      this.newCategoryName = ''
    },
    async loadGroups() {
      try {
        const response = await this.$axios.get('/api/categories/materialGroup')
        this.groups = Array.isArray(response.data) ? response.data : []
        if (!this.selectedGroupId && this.groups.length) this.selectedGroupId = this.groups[0].id
      } catch (error) {
        this.catalogError = error.response?.data?.message || 'Չհաջողվեց բեռնել նյութերի խմբերը։'
      }
    },
    async createGroup() {
      if (!this.newGroupName || this.catalogSaving) return
      this.catalogSaving = true
      this.catalogError = ''
      try {
        const response = await this.$axios.post('/api/categories/materialGroup', { name: this.newGroupName })
        const created = response.data?.data
        this.newGroupName = ''
        await this.loadGroups()
        if (created?.id) this.selectedGroupId = created.id
        this.$notify?.({ type: 'success', text: 'Նյութի խումբը ստեղծվեց' })
      } catch (error) {
        this.catalogError = error.response?.data?.message || 'Չհաջողվեց ստեղծել նյութի խումբը։'
      } finally {
        this.catalogSaving = false
      }
    },
    async createCategory() {
      if (!this.selectedGroupId || !this.newCategoryName || this.catalogSaving) return
      this.catalogSaving = true
      this.catalogError = ''
      try {
        const response = await this.$axios.post('/api/categories/materialCategories', {
          name: this.newCategoryName,
          material_group_id: this.selectedGroupId,
        })
        const created = response.data?.data
        this.newCategoryName = ''
        this.$emit('category-created', created || null)
        if (created?.id) this.form.material_category_id = created.id
        this.categoryManagerOpen = false
        this.$notify?.({ type: 'success', text: 'Նյութի կատեգորիան ստեղծվեց' })
      } catch (error) {
        this.catalogError = error.response?.data?.message || 'Չհաջողվեց ստեղծել նյութի կատեգորիան։'
      } finally {
        this.catalogSaving = false
      }
    },
    submit() {
      if (!this.form.material_category_id) return
      this.$emit('submit', {
        isEdit: this.isEdit,
        id: this.item?.id,
        data: { ...this.form },
      })
    },
  },
}
</script>

<style scoped>
.field {
  @apply w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
