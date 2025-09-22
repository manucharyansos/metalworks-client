<template>
  <!-- Overlay -->
  <div
    v-if="visible"
    class="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <!-- Card -->
    <div
      class="w-full max-w-3xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh] pb-[env(safe-area-inset-bottom)]"
      @keydown.esc="$emit('close')"
      tabindex="0"
      ref="card"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h3 class="text-lg font-semibold">
          {{ isEdit ? 'Խմբագրել ծառայություն' : 'Նոր ծառայություն' }}
        </h3>
        <button
          class="text-gray-500 hover:text-gray-800"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Body (scrollable) -->
      <div class="p-5 space-y-5 overflow-y-auto">
        <!-- Locale tabs -->
        <div>
          <div class="flex gap-2 mb-3">
            <button
              v-for="code in locales"
              :key="code"
              class="px-3 py-1.5 rounded border text-sm"
              :class="
                code === active
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white hover:bg-gray-50'
              "
              @click="active = code"
              type="button"
            >
              {{ mapNames[code] }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-medium">
                Վերնագիր ({{ active.toUpperCase() }})
              </label>
              <input
                v-model="form.title[active]"
                type="text"
                class="w-full rounded-lg border px-3 py-2"
                @input="maybeAutoslug(active)"
              />
            </div>
            <div>
              <label class="text-sm font-medium">
                Slug ({{ active.toUpperCase() }})
              </label>
              <input
                v-model="form.slug[active]"
                type="text"
                class="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label class="text-sm font-medium">
              Նկարագրություն ({{ active.toUpperCase() }})
            </label>
            <textarea
              v-model="form.description[active]"
              rows="4"
              class="w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <!-- Media -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium">Նկարը</label>
            <input
              type="file"
              accept="image/*"
              class="block w-full mt-1"
              @change="onFile($event, 'image')"
            />
            <div v-if="preview.image || service?.image_url" class="mt-2">
              <img
                :src="preview.image || service?.image_url"
                alt=""
                class="h-24 w-full object-cover rounded border"
              />
            </div>
          </div>
          <div>
            <label class="text-sm font-medium">Վիդեո (mp4/webm/ogg)</label>
            <input
              type="file"
              accept="video/*"
              class="block w-full mt-1"
              @change="onFile($event, 'video')"
            />
            <p class="text-xs text-gray-500 mt-1">Մաքս. 50ՄԲ</p>
          </div>
          <div>
            <label class="text-sm font-medium">Վիդեո պոստեր</label>
            <input
              type="file"
              accept="image/*"
              class="block w-full mt-1"
              @change="onFile($event, 'video_poster')"
            />
            <div
              v-if="preview.video_poster || service?.video_poster_url"
              class="mt-2"
            >
              <img
                :src="preview.video_poster || service?.video_poster_url"
                alt=""
                class="h-24 w-full object-cover rounded border"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer (sticky) -->
      <div
        class="px-5 py-4 border-t mt-auto bg-white sticky bottom-0 pb-[env(safe-area-inset-bottom)]"
      >
        <div class="flex items-center justify-end gap-3">
          <button
            class="px-4 py-2 rounded-lg border"
            :disabled="submitting"
            @click="$emit('close')"
            type="button"
          >
            Չեղարկել
          </button>
          <button
            class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            :disabled="submitting"
            @click="submit"
            type="button"
          >
            {{ submitting ? 'Պահպանում…' : isEdit ? 'Պահպանել' : 'Ավելացնել' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const slugify = (v = '') =>
  v
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-zA-Z0-9\u0561-\u0587\u0531-\u0556\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()

export default {
  name: 'ServiceFormModal',
  props: {
    visible: { type: Boolean, default: false },
    // Եթե onEdit-ում քաշում ես ?full=1, այստեղ կգա translations map-ը
    service: { type: Object, default: null },
    submitting: { type: Boolean, default: false },
  },
  data() {
    return {
      locales: ['hy', 'ru', 'en'],
      mapNames: { hy: 'HY', ru: 'RU', en: 'EN' },
      active: 'hy',
      form: {
        title: { hy: '', ru: '', en: '' },
        slug: { hy: '', ru: '', en: '' },
        description: { hy: '', ru: '', en: '' },
      },
      files: { image: null, video: null, video_poster: null },
      preview: { image: '', video_poster: '' },
    }
  },
  computed: {
    isEdit() {
      return !!this.service?.id
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.hydrate()
        this.$nextTick(() => this.$refs.card?.focus?.())
      } else {
        this.reset()
      }
    },
    service() {
      if (this.visible) this.hydrate()
    },
  },
  methods: {
    hydrate() {
      // Եթե backend-ը վերադարձնում է translations (full=1), լցնենք բոլոր լեզուները
      const t = this.service?.translations || null
      if (t) {
        this.form.title = {
          hy: t.title?.hy || '',
          ru: t.title?.ru || '',
          en: t.title?.en || '',
        }
        this.form.slug = {
          hy: t.slug?.hy || '',
          ru: t.slug?.ru || '',
          en: t.slug?.en || '',
        }
        this.form.description = {
          hy: t.description?.hy || '',
          ru: t.description?.ru || '',
          en: t.description?.en || '',
        }
      } else if (this.service) {
        // Այլապես՝ fallback՝ միայն ընթացիկ locale (հաճախ HY) դաշտերը
        this.form.title.hy = this.service.title || ''
        this.form.slug.hy = this.service.slug || ''
        this.form.description.hy = this.service.description || ''
      }

      this.preview.image = this.service?.image_url || ''
      this.preview.video_poster = this.service?.video_poster_url || ''
      this.active = 'hy'
    },

    reset() {
      this.form = {
        title: { hy: '', ru: '', en: '' },
        slug: { hy: '', ru: '', en: '' },
        description: { hy: '', ru: '', en: '' },
      }
      this.files = { image: null, video: null, video_poster: null }
      this.preview = { image: '', video_poster: '' }
      this.active = 'hy'
    },

    maybeAutoslug(code) {
      if (!this.form.slug[code]) {
        this.form.slug[code] = slugify(this.form.title[code] || '')
      }
    },

    onFile(e, key) {
      const f = e.target.files?.[0]
      if (!f) return
      this.files[key] = f
      if (key === 'image' || key === 'video_poster') {
        const reader = new FileReader()
        reader.onload = (ev) => (this.preview[key] = ev.target.result)
        reader.readAsDataURL(f)
      }
    },

    submit() {
      const fd = new FormData()
      // translations → title[hy], slug[ru], description[en], ...
      for (const code of this.locales) {
        const t = this.form.title[code]
        const s = this.form.slug[code]
        const d = this.form.description[code]
        if (t) fd.append(`title[${code}]`, t)
        if (s) fd.append(`slug[${code}]`, s)
        if (d) fd.append(`description[${code}]`, d)
      }
      // files
      if (this.files.image) fd.append('image', this.files.image)
      if (this.files.video) fd.append('video', this.files.video)
      if (this.files.video_poster)
        fd.append('video_poster', this.files.video_poster)

      this.$emit('submit', {
        asFormData: fd,
        isEdit: this.isEdit,
        id: this.service?.id,
      })
    },
  },
}
</script>

<style scoped>
/* ոչ պարտադիր, բայց լավ smoothness */
</style>
