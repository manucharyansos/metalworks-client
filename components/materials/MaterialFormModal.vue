<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>
      <div
        class="relative bg-white dark:bg-gray-900 rounded-xl p-6 w-[95%] max-w-2xl shadow-xl"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">
            {{ isEdit ? 'Փոփոխել նյութը' : 'Նոր նյութ' }}
          </h3>
          <button class="text-gray-500" @click="$emit('close')">✕</button>
        </div>

        <form
          @submit.prevent="submit"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div class="md:col-span-2">
            <label class="block text-sm mb-1">Նկարագրություն</label>
            <textarea
              v-model="form.description"
              class="w-full border rounded-lg px-3 py-2 dark:bg-gray-800"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm mb-1">Լայնություն</label>
            <input
              v-model.number="form.width"
              type="number"
              step="0.01"
              class="w-full border rounded-lg px-3 py-2 dark:bg-gray-800"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Երկարություն</label>
            <input
              v-model.number="form.length"
              type="number"
              step="0.01"
              class="w-full border rounded-lg px-3 py-2 dark:bg-gray-800"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Բարձրություն</label>
            <input
              v-model.number="form.height"
              type="number"
              step="0.01"
              class="w-full border rounded-lg px-3 py-2 dark:bg-gray-800"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Հաստություն</label>
            <input
              v-model.number="form.thickness"
              type="number"
              step="0.01"
              class="w-full border rounded-lg px-3 py-2 dark:bg-gray-800"
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm mb-1">Կատեգորիա</label>
            <select
              v-model="form.material_category_id"
              required
              class="w-full border rounded-lg px-3 py-2 dark:bg-gray-800"
            >
              <option :value="null" disabled>Ընտրել…</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm mb-1">Նկար (ըստ ցանկության)</label>
            <input
              type="file"
              accept="image/*"
              @change="onFile"
              class="w-full border rounded-lg px-3 py-2 dark:bg-gray-800"
            />
          </div>

          <div class="md:col-span-2 flex justify-end gap-3 mt-2">
            <button
              type="button"
              class="px-5 py-2 rounded bg-gray-200 dark:bg-gray-700"
              @click="$emit('close')"
            >
              Փակել
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded bg-blue-600 text-white"
              :disabled="submitting"
            >
              {{ submitting ? 'Պահվում է…' : isEdit ? 'Պահպանել' : 'Ստեղծել' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    visible: { type: Boolean, default: false },
    item: { type: Object, default: null },
    categories: { type: Array, default: () => [] },
    submitting: { type: Boolean, default: false },
  },
  data() {
    return { form: this.makeForm(this.item) }
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
      if (v && this.item) this.form = this.makeForm(this.item)
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
    submit() {
      this.$emit('submit', {
        isEdit: this.isEdit,
        id: this.item?.id,
        data: { ...this.form },
      })
    },
  },
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
