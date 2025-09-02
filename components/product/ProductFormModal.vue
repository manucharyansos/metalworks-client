<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center p-4 sm:p-6"
    @click.self="$emit('close')"
  >
    <!-- Wrapper panel -->
    <div
      class="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-none sm:rounded-2xl shadow-xl h-full sm:h-auto max-h-full sm:max-h-[90vh] flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      <!-- Sticky Header -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b bg-white/90 dark:bg-gray-900/90 backdrop-blur"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ isEdit ? 'Խմբագրել ապրանքը' : 'Ստեղծել նոր ապրանք' }}
        </h3>
        <button
          class="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Փակել մոդալը"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Scrollable Content -->
      <form
        id="productForm"
        class="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5"
        @submit.prevent="submit"
      >
        <!-- Name -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Անուն *</label
          >
          <input
            v-model.trim="form.name"
            type="text"
            :disabled="submitting"
            class="mt-1 w-full rounded-lg border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            :class="{ 'border-red-500': errors.name }"
            placeholder="Օր․ «Մետաղական դետալ №5»"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">
            {{ errors.name }}
          </p>
        </div>

        <!-- Description -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Նկարագրություն *</label
          >
          <textarea
            v-model.trim="form.description"
            rows="3"
            :disabled="submitting"
            class="mt-1 w-full rounded-lg border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            :class="{ 'border-red-500': errors.description }"
            placeholder="Կարճ նկարագրություն…"
          ></textarea>
          <p v-if="errors.description" class="mt-1 text-sm text-red-600">
            {{ errors.description }}
          </p>
        </div>

        <!-- Price -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Արժեք (֏) *</label
          >
          <div class="mt-1 relative">
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="1"
              :disabled="submitting"
              class="w-full rounded-lg border-gray-300 pr-12 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              :class="{ 'border-red-500': errors.price }"
              placeholder="Օր․ 120000"
            />
            <span
              class="absolute inset-y-0 right-3 flex items-center text-gray-400 select-none"
              >֏</span
            >
          </div>
          <p v-if="errors.price" class="mt-1 text-sm text-red-600">
            {{ errors.price }}
          </p>
        </div>

        <!-- Main Image: Dropzone -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Հիմնական պատկեր *</label
          >
          <div
            class="mt-2 flex items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors"
            :class="[
              isDraggingMain
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-gray-300 dark:border-gray-700',
              errors.image ? 'border-red-500' : '',
            ]"
            @dragover.prevent="isDraggingMain = true"
            @dragleave.prevent="isDraggingMain = false"
            @drop.prevent="onDropMain"
          >
            <div v-if="!mainPreview" class="space-y-2">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Քաշեք & թողեք պատկերը այստեղ կամ
                <button
                  type="button"
                  class="text-blue-600 font-medium hover:underline"
                  @click="$refs.mainInput.click()"
                >
                  ընտրեք ֆայլ
                </button>
              </p>
              <p class="text-xs text-gray-400">
                Մինչև {{ MAX_MB }}MB, τύպերը՝ jpeg/png/webp/gif
              </p>
              <input
                ref="mainInput"
                type="file"
                accept="image/*"
                class="hidden"
                :disabled="submitting"
                @change="onMainChange"
              />
            </div>

            <div v-else class="w-full sm:w-auto">
              <div class="relative inline-block">
                <img
                  :src="mainPreview"
                  alt="Main preview"
                  class="w-40 h-40 object-cover rounded-xl border"
                />
                <div class="absolute -top-2 -right-2 flex gap-2">
                  <button
                    type="button"
                    class="px-2 py-1 rounded-md bg-white/90 border text-xs hover:bg-white shadow"
                    @click="$refs.mainInput.click()"
                  >
                    Փոխել
                  </button>
                  <button
                    type="button"
                    class="px-2 py-1 rounded-md bg-red-600 text-white text-xs hover:bg-red-700 shadow"
                    @click="clearMainImage"
                  >
                    Հեռացնել
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p v-if="errors.image" class="mt-2 text-sm text-red-600">
            {{ errors.image }}
          </p>
        </div>

        <!-- Gallery -->
        <div>
          <div class="flex items-center justify-between">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Գալերեայի նկարներ</label
            >
            <div class="text-xs text-gray-500">
              {{ totalGalleryCount }}/{{ GALLERY_MAX }}
            </div>
          </div>

          <div
            class="mt-2 rounded-xl border-2 border-dashed p-4 transition-colors"
            :class="
              isDraggingGallery
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-gray-300 dark:border-gray-700'
            "
            @dragover.prevent="isDraggingGallery = true"
            @dragleave.prevent="isDraggingGallery = false"
            @drop.prevent="onDropGallery"
          >
            <div class="flex flex-wrap gap-3">
              <!-- Existing (edit) -->
              <div
                v-for="(img, i) in existingGallery"
                :key="'ex-' + img.id"
                class="relative group"
              >
                <img
                  :src="img.url"
                  class="w-24 h-24 object-cover rounded-lg border"
                />
                <div
                  class="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <button
                    type="button"
                    class="px-1.5 py-0.5 rounded bg-white text-xs border hover:bg-gray-50 shadow"
                    title="Դնել որպես հիմնական"
                    @click="setMainFromExisting(i)"
                  >
                    ★
                  </button>
                  <button
                    type="button"
                    class="px-1.5 py-0.5 rounded text-white text-xs shadow"
                    :class="
                      deletedIds.includes(img.id)
                        ? 'bg-gray-500 hover:bg-gray-600'
                        : 'bg-red-600 hover:bg-red-700'
                    "
                    :title="
                      deletedIds.includes(img.id) ? 'Չեղարկել ջնջումը' : 'Ջնջել'
                    "
                    @click="toggleDelete(img.id)"
                  >
                    ×
                  </button>
                </div>
                <span
                  v-if="deletedIds.includes(img.id)"
                  class="absolute inset-0 bg-red-500/25 rounded-lg border border-red-500 pointer-events-none"
                  title="Will be deleted"
                />
              </div>

              <!-- New -->
              <div
                v-for="(p, i) in galleryPreviews"
                :key="'new-' + i"
                class="relative group"
              >
                <img
                  :src="p"
                  class="w-24 h-24 object-cover rounded-lg border"
                />
                <div
                  class="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <button
                    type="button"
                    class="px-1.5 py-0.5 rounded bg-white text-xs border hover:bg-gray-50 shadow"
                    title="Դնել որպես հիմնական"
                    @click="setMainFromNew(i)"
                  >
                    ★
                  </button>
                  <button
                    type="button"
                    class="px-1.5 py-0.5 rounded bg-red-600 text-white text-xs hover:bg-red-700 shadow"
                    title="Հեռացնել"
                    @click="removeNew(i)"
                  >
                    ×
                  </button>
                </div>
              </div>

              <!-- Add more -->
              <label
                class="w-24 h-24 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 text-gray-400"
                :class="{
                  'pointer-events-none opacity-40':
                    totalGalleryCount >= GALLERY_MAX,
                }"
              >
                <span class="text-3xl leading-none">+</span>
                <input
                  ref="galleryInput"
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  :disabled="submitting || totalGalleryCount >= GALLERY_MAX"
                  @change="onGalleryChange"
                />
              </label>
            </div>
            <p class="mt-2 text-xs text-gray-400">
              Առավելագույնը {{ GALLERY_MAX }} պատկեր (յուրաքանչյուրն մինչև
              {{ MAX_MB }}MB)
            </p>
          </div>

          <p v-if="errors.gallery" class="mt-2 text-sm text-red-600">
            {{ errors.gallery }}
          </p>
        </div>
      </form>

      <!-- Sticky Footer -->
      <div
        class="sticky bottom-0 z-10 px-5 sm:px-6 py-4 border-t bg-white/90 dark:bg-gray-900/90 backdrop-blur flex flex-col sm:flex-row gap-3 justify-end"
      >
        <button
          type="button"
          class="px-4 py-2 rounded-lg border hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          :disabled="submitting"
          @click="resetLocal"
        >
          Սկսել զրոյից
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          :disabled="submitting"
          @click="$emit('close')"
        >
          Փակել
        </button>
        <!-- submit button targets the form by id -->
        <button
          type="submit"
          form="productForm"
          class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 inline-flex items-center gap-2"
          :disabled="submitting || !canSubmit"
        >
          <svg
            v-if="submitting"
            class="w-4 h-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>{{
            submitting ? 'Պահպանում…' : isEdit ? 'Պահպանել' : 'Ստեղծել'
          }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductFormModal',
  props: {
    visible: { type: Boolean, default: false },
    product: { type: Object, default: null },
    submitting: { type: Boolean, default: false },
  },
  data() {
    return {
      MAX_MB: 4,
      GALLERY_MAX: 5,

      form: { name: '', description: '', price: null },
      errors: {},

      isDraggingMain: false,
      mainFile: null,
      mainPreview: null,

      isDraggingGallery: false,
      newGallery: [],
      galleryPreviews: [],

      existingGallery: [],
      deletedIds: [],
    }
  },
  computed: {
    isEdit() {
      return !!(this.product && this.product.id)
    },
    totalGalleryCount() {
      return (
        this.existingGallery.length -
        this.deletedIds.length +
        this.newGallery.length
      )
    },
    canSubmit() {
      const hasMain = !!(this.mainFile || this.mainPreview)
      return (
        this.form.name.trim() &&
        this.form.description.trim() &&
        this.form.price !== null &&
        Number(this.form.price) >= 0 &&
        hasMain &&
        !this.submitting
      )
    },
  },
  watch: {
    visible(v) {
      // lock background scroll
      document.documentElement.classList.toggle('overflow-hidden', v)
      if (v) this.bootstrap()
      else this.resetLocal()
    },
  },
  beforeDestroy() {
    document.documentElement.classList.remove('overflow-hidden')
  },
  methods: {
    bootstrap() {
      this.errors = {}
      if (this.isEdit) {
        this.form.name = this.product.name || ''
        this.form.description = this.product.description || ''
        this.form.price = this.product.price ?? 0
        this.mainPreview = this.product.image_url || null
        this.existingGallery = Array.isArray(this.product.images)
          ? this.product.images.map((g) => ({ id: g.id, url: g.url }))
          : []
      } else {
        this.resetLocal()
      }
    },
    resetLocal() {
      this.form = { name: '', description: '', price: null }
      this.errors = {}
      this.mainFile = null
      this.mainPreview = null
      this.isDraggingMain = false

      this.newGallery = []
      this.galleryPreviews = []
      this.isDraggingGallery = false

      this.existingGallery = []
      this.deletedIds = []

      if (this.$refs.mainInput) this.$refs.mainInput.value = ''
      if (this.$refs.galleryInput) this.$refs.galleryInput.value = ''
    },

    validateImage(file) {
      if (!file) return 'Պատկեր չի ընտրվել'
      const okType = /image\/(jpeg|jpg|png|webp|gif)/i.test(file.type)
      if (!okType) return 'Ֆայլի տիպը պետք է լինի jpeg/png/webp/gif'
      const maxBytes = this.MAX_MB * 1024 * 1024
      if (file.size > maxBytes)
        return `Պատկերը չպետք է գերազանցի ${this.MAX_MB}MB`
      return null
    },
    previewFile(file, cb) {
      const r = new FileReader()
      r.onload = (e) => cb(e.target.result)
      r.readAsDataURL(file)
    },

    onMainChange(e) {
      const f = e.target.files?.[0]
      this.addMainImage(f)
      e.target.value = ''
    },
    onDropMain(e) {
      this.isDraggingMain = false
      const f = e.dataTransfer?.files?.[0]
      this.addMainImage(f)
    },
    addMainImage(file) {
      const err = this.validateImage(file)
      if (err) {
        this.errors.image = err
        return
      }
      this.mainFile = file
      this.previewFile(file, (src) => (this.mainPreview = src))
      this.errors.image = null
    },
    clearMainImage() {
      this.mainFile = null
      if (!this.isEdit) this.mainPreview = null
      else if (!this.product?.image_url) this.mainPreview = null
    },

    onGalleryChange(e) {
      const files = Array.from(e.target.files || [])
      this.addGalleryFiles(files)
      e.target.value = ''
    },
    onDropGallery(e) {
      this.isDraggingGallery = false
      const files = Array.from(e.dataTransfer?.files || [])
      this.addGalleryFiles(files)
    },
    addGalleryFiles(files) {
      const available = this.GALLERY_MAX - this.totalGalleryCount
      if (available <= 0) {
        this.errors.gallery = `Առավելագույնը ${this.GALLERY_MAX} պատկեր`
        return
      }
      for (const f of files.slice(0, available)) {
        const err = this.validateImage(f)
        if (err) {
          this.errors.gallery = err
          return
        }
        this.newGallery.push(f)
        this.previewFile(f, (src) => this.galleryPreviews.push(src))
      }
      this.errors.gallery = null
    },
    removeNew(i) {
      this.newGallery.splice(i, 1)
      this.galleryPreviews.splice(i, 1)
      if (this.totalGalleryCount < this.GALLERY_MAX) this.errors.gallery = null
    },
    toggleDelete(id) {
      const i = this.deletedIds.indexOf(id)
      if (i === -1) this.deletedIds.push(id)
      else this.deletedIds.splice(i, 1)
    },
    setMainFromExisting(i) {
      const ex = this.existingGallery[i]
      if (!ex || !ex.url) return
      this.mainFile = null
      this.mainPreview = ex.url
    },
    setMainFromNew(i) {
      const f = this.newGallery[i]
      const p = this.galleryPreviews[i]
      if (!f) return
      this.mainFile = f
      this.mainPreview = p
      this.removeNew(i)
      this.errors.image = null
    },

    validateForm() {
      this.errors = {}
      let ok = true
      if (!this.form.name.trim()) {
        this.errors.name = 'Անունը պարտադիր է'
        ok = false
      }
      if (!this.form.description.trim()) {
        this.errors.description = 'Նկարագրությունը պարտադիր է'
        ok = false
      }
      if (this.form.price == null || Number(this.form.price) < 0) {
        this.errors.price = 'Արժեքը պետք է լինի 0 կամ ավելի'
        ok = false
      }

      const hasMain = !!(this.mainFile || this.mainPreview)
      if (!hasMain) {
        this.errors.image = 'Հիմնական պատկերը պարտադիր է'
        ok = false
      }

      if (this.totalGalleryCount > this.GALLERY_MAX) {
        this.errors.gallery = `Առավելագույնը ${this.GALLERY_MAX} պատկեր`
        ok = false
      }
      return ok
    },
    submit() {
      if (!this.validateForm()) return

      const fd = new FormData()
      fd.append('name', this.form.name)
      fd.append('description', this.form.description)
      fd.append('price', String(this.form.price))

      if (this.mainFile) fd.append('image', this.mainFile)
      this.newGallery.forEach((f, i) => fd.append(`gallery[${i}]`, f))
      this.deletedIds.forEach((id, i) =>
        fd.append(`deleted_gallery_images[${i}]`, id)
      )

      this.$emit('submit', {
        asFormData: fd,
        isEdit: this.isEdit,
        id: this.product?.id,
      })
    },
  },
}
</script>
