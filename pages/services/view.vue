<template>
  <div class="container mx-auto px-4 py-6">
    <div v-if="error" class="rounded-lg bg-red-50 text-red-700 p-4 mb-6">
      {{ error }}
    </div>

    <div v-else-if="!item" class="text-gray-600">Բեռնվում է…</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Media -->
      <div class="lg:col-span-2">
        <div
          class="w-full aspect-[16/9] relative bg-neutral-100 rounded-xl overflow-hidden shadow"
        >
          <video
            v-if="item.video_url"
            :poster="item.video_poster_url || ''"
            class="absolute inset-0 w-full h-full object-cover"
            controls
            playsinline
          >
            <source :src="item.video_url" type="video/mp4" />
            Ձեր browser-ը չի աջակցում video tag-ին։
          </video>

          <img
            v-else-if="item.image_url"
            :src="item.image_url"
            :alt="item.title"
            class="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />

          <div
            v-else
            class="absolute inset-0 flex items-center justify-center text-gray-400"
          >
            Մեդիա չկա
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="lg:col-span-1">
        <h1
          class="text-2xl md:text-3xl font-serif font-bold italic text-gray-900 mb-3"
        >
          {{ item.title }}
        </h1>

        <p class="text-gray-700 leading-relaxed whitespace-pre-line">
          {{ item.description }}
        </p>

        <div v-if="item.works?.length" class="mt-6">
          <h3 class="text-lg font-semibold mb-2">Կապված աշխատանքներ</h3>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="w in item.works"
              :key="w.id"
              class="rounded-lg overflow-hidden border bg-white"
            >
              <img
                v-if="w.image_url"
                :src="w.image_url"
                :alt="w.title"
                class="w-full h-28 object-cover"
              />
              <div class="p-2 text-sm font-medium line-clamp-2">
                {{ w.title }}
              </div>
            </div>
          </div>
        </div>

        <nuxt-link
          :to="localePath('/services')"
          class="inline-block mt-6 text-indigo-700 hover:underline"
        >
          ← Վերադառնալ ծառայությունների ցանկ
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ $axios, app, req, route, redirect }) {
    try {
      const seg1 = (route.path.split('/')[1] || '').toLowerCase()
      const locFromPath = ['hy', 'ru', 'en'].includes(seg1) ? seg1 : null

      const cookieLocale = process.server
        ? (req?.headers?.cookie || '').match(
            /(?:^|;\s*)i18n_redirected=([^;]+)/
          )?.[1]
        : app.$cookies
        ? app.$cookies.get('i18n_redirected')
        : null

      const loc = locFromPath || app.i18n?.locale || cookieLocale || 'hy'

      const localized = app.i18n?.localePath?.(
        { path: route.path, query: route.query },
        loc
      )
      if (localized && localized !== route.fullPath) {
        return redirect(localized)
      }

      const id = route.query.id
      if (!id)
        return redirect(app.i18n?.localePath('/services', loc) || '/services')

      const { data } = await $axios.get(`/api/services/${id}`, {
        params: { locale: loc },
        headers: {
          'X-Locale': loc,
          'Accept-Language': loc,
        },
      })

      if (!data?.status || !data?.data) {
        return { item: null, error: 'Ծառայությունը չի գտնվել' }
      }
      return { item: data.data, error: null }
    } catch (e) {
      return { item: null, error: 'Չհաջողվեց բեռնել տվյալ ծառայությունը' }
    }
  },

  data() {
    return { item: null, error: null }
  },

  head() {
    const title = this.item?.title
      ? `${this.item.title} — Services`
      : 'Service — View'
    const desc = this.item?.description || ''
    const image = this.item?.image_url || this.item?.video_poster_url || ''
    const ogLocale = (this.$i18n?.locale || 'ru').replace('_', '-')

    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: desc },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:description', property: 'og:description', content: desc },
        { hid: 'og:image', property: 'og:image', content: image },
        { hid: 'og:locale', property: 'og:locale', content: ogLocale },
      ],
    }
  },
}
</script>
