<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-3xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
    >
      <!-- header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold">
          {{ isEdit ? 'Խմբագրել աշխատանքը' : 'Ստեղծել նոր աշխատանք' }}
        </h3>
        <button
          class="rounded-lg p-1 hover:bg-gray-100"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- body (scrollable) -->
      <form class="p-5 overflow-y-auto" @submit.prevent="submit">
        <!-- title + slug -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm mb-1">Անուն</label>
            <input
              v-model.trim="form.title"
              type="text"
              class="w-full rounded-lg border px-3 py-2"
              @blur="autoFillSlug"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Slug</label>
            <input
              v-model.trim="form.slug"
              type="text"
              class="w-full rounded-lg border px-3 py-2"
              placeholder="օր. laser-cucadrakan-ashxatak"
            />
          </div>
        </div>

        <!-- description -->
        <div class="mt-4">
          <label class="block text-sm mb-1">Նկարագրություն</label>
          <textarea
            v-model.trim="form.description"
            rows="3"
            class="w-full rounded-lg border px-3 py-2"
          ></textarea>
        </div>

        <!-- tags + published + sort -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div class="sm:col-span-2">
            <label class="block text-sm mb-1">Tags (սեպարատ՝ comma)</label>
            <input
              v-model.trim="form.tagsText"
              type="text"
              class="w-full rounded-lg border px-3 py-2"
              placeholder="laser, bend, welding"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.is_published" />
              Հրատարակված
            </label>
            <div>
              <label class="block text-sm mb-1">Sort order</label>
              <input
                v-model.number="form.sort_order"
                type="number"
                min="0"
                class="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>
        </div>

        <!-- main image + gallery -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div>
            <label class="block text-sm mb-1">Հիմնական պատկեր</label>
            <input
              ref="mainInput"
              type="file"
              accept="image/*"
              class="block w-full"
              @change="onMainChange"
            />
            <div v-if="mainPreview" class="mt-3">
              <img
                :src="mainPreview"
                class="w-28 h-28 object-cover rounded-lg border"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm mb-2">Գալերեա (մինչև 5)</label>
            <div class="flex flex-wrap gap-3">
              <!-- existing -->
              <div
                v-for="img in existingGallery"
                :key="'ex-' + img.id"
                class="relative"
              >
                <img
                  :src="img.url"
                  class="w-20 h-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-sm"
                  title="Remove"
                  @click="toggleDelete(img.id)"
                >
                  ×
                </button>
                <span
                  v-if="deletedIds.includes(img.id)"
                  class="absolute inset-0 bg-red-500/30 rounded-lg border border-red-500"
                  title="Will be deleted"
                />
              </div>

              <!-- new -->
              <div
                v-for="(p, i) in galleryPreviews"
                :key="'new-' + i"
                class="relative"
              >
                <img
                  :src="p"
                  class="w-20 h-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-sm"
                  title="Remove"
                  @click="removeNew(i)"
                >
                  ×
                </button>
              </div>

              <!-- add -->
              <label
                class="w-20 h-20 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500"
              >
                <span class="text-2xl text-gray-400">+</span>
                <input
                  ref="galleryInput"
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="onGalleryChange"
                />
              </label>
            </div>
          </div>
        </div>
      </form>

      <!-- footer -->
      <div class="flex justify-end gap-3 p-4 border-t">
        <button
          type="button"
          class="px-4 py-2 rounded-lg border"
          @click="$emit('close')"
        >
          Փակել
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? 'Պահպանում…' : isEdit ? 'Պահպանել' : 'Ստեղծել' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkFormModal',
  props: {
    visible: { type: Boolean, default: false },
    work: { type: Object, default: null },
    submitting: { type: Boolean, default: false },
  },
  data() {
    return {
      form: {
        title: '',
        slug: '',
        description: '',
        tagsText: '',
        is_published: true,
        sort_order: 100,
      },
      mainFile: null,
      mainPreview: null,
      newGallery: [],
      galleryPreviews: [],
      existingGallery: [], // [{id,url}]
      deletedIds: [],
    }
  },
  computed: {
    isEdit() {
      return !!(this.work && this.work.id)
    },
  },
  watch: {
    visible(v) {
      if (v) this.bootstrap()
      else this.reset()
    },
  },
  methods: {
    bootstrap() {
      if (this.isEdit) {
        const w = this.work
        this.form.title = w.title || ''
        this.form.slug = w.slug || ''
        this.form.description = w.description || ''
        this.form.tagsText = (w.tags || []).join(', ')
        this.form.is_published = !!w.is_published
        this.form.sort_order = w.sort_order ?? 100

        this.mainPreview =
          w.image_url ||
          (Array.isArray(w.images) && w.images.length ? w.images[0].url : null)

        this.existingGallery = Array.isArray(w.images)
          ? w.images.map((g) => ({ id: g.id, url: g.url }))
          : []
      } else {
        this.reset()
      }
    },
    reset() {
      this.form = {
        title: '',
        slug: '',
        description: '',
        tagsText: '',
        is_published: true,
        sort_order: 100,
      }
      this.mainFile = null
      this.mainPreview = null
      this.newGallery = []
      this.galleryPreviews = []
      this.existingGallery = []
      this.deletedIds = []
      if (this.$refs.mainInput) this.$refs.mainInput.value = ''
      if (this.$refs.galleryInput) this.$refs.galleryInput.value = ''
    },
    autoFillSlug() {
      if (!this.form.slug && this.form.title) {
        this.form.slug = this.slugify(this.form.title)
      }
    },
    slugify(s) {
      return s
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-\u0531-\u0587]+/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
    },
    onMainChange(e) {
      const f = e.target.files?.[0]
      if (!f) return
      this.mainFile = f
      this.previewFile(f, (src) => (this.mainPreview = src))
    },
    onGalleryChange(e) {
      const files = Array.from(e.target.files || [])
      for (const f of files) {
        const total = this.newGallery.length + this.existingGallery.length
        if (total >= 5) break
        this.newGallery.push(f)
        this.previewFile(f, (src) => this.galleryPreviews.push(src))
      }
      e.target.value = ''
    },
    removeNew(i) {
      this.newGallery.splice(i, 1)
      this.galleryPreviews.splice(i, 1)
    },
    toggleDelete(id) {
      const i = this.deletedIds.indexOf(id)
      if (i === -1) this.deletedIds.push(id)
      else this.deletedIds.splice(i, 1)
    },
    previewFile(file, cb) {
      const r = new FileReader()
      r.onload = (e) => cb(e.target.result)
      r.readAsDataURL(file)
    },
    submit() {
      if (!this.form.title.trim()) return alert('Անունը պարտադիր է')
      if (!this.form.slug.trim()) return alert('Slug-ը պարտադիր է')

      const tags = this.form.tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const fd = new FormData()
      const add = (k, v) => {
        if (v === undefined || v === null) return
        if (typeof v === 'string' && v.trim() === '') return
        fd.append(k, v)
      }

      add('title', this.form.title)
      add('slug', this.form.slug)
      add('description', this.form.description)
      add('is_published', this.form.is_published ? 1 : 0)
      if (tags.length) tags.forEach((t, i) => add(`tags[${i}]`, t))
      if (this.form.sort_order !== undefined && this.form.sort_order !== null)
        add('sort_order', this.form.sort_order)

      if (this.mainFile) fd.append('image', this.mainFile)
      this.newGallery.forEach((f, i) => fd.append(`gallery[${i}]`, f))
      this.deletedIds.forEach((id, i) =>
        fd.append(`deleted_gallery_images[${i}]`, id)
      )

      this.$emit('submit', {
        asFormData: fd,
        isEdit: this.isEdit,
        id: this.work?.id,
      })
    },
  },
}
</script>
