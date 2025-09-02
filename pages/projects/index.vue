<template>
  <div
    class="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50"
  >
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div
        class="absolute -top-24 -left-16 h-56 w-56 rounded-full bg-red-500/10 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl"
      ></div>

      <div
        class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
      >
        <div class="text-center">
          <p
            class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-red-600"></span>
            ՄԵՐ ԱՇԽԱՏԱՆՔՆԵՐԸ
          </p>
          <h1
            class="mt-3 text-2xl sm:text-4xl md:text-5xl font-serif font-extrabold italic text-neutral-800"
          >
            Projects / Case Studies
          </h1>
          <p class="mt-3 text-neutral-600">
            Թիթեղի լազեր, ճկում, զոդում և փոշեներկում՝ մեկ հարթակում։
          </p>
        </div>

        <!-- Controls -->
        <div
          class="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
        >
          <div class="relative w-full sm:w-80">
            <input
              v-model.trim="search"
              type="text"
              placeholder="Որոնել անուն/նկարագրություն…"
              class="w-full rounded-xl border px-4 py-2.5 pl-10 focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              @input="debouncedFetch"
            />
            <svg
              class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="m19 19-4-4m0-7a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <!-- Tag pills (client-side + URL sync) -->
          <div class="flex flex-wrap gap-2">
            <button
              class="px-3 py-1.5 rounded-full border text-sm transition"
              :class="
                activeTag === null
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'hover:bg-neutral-100'
              "
              @click="setTag(null)"
            >
              Բոլորը
            </button>
            <button
              v-for="t in tags"
              :key="t"
              class="px-3 py-1.5 rounded-full border text-sm transition"
              :class="
                activeTag === t
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'hover:bg-neutral-100'
              "
              @click="setTag(t)"
            >
              #{{ t }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Grid -->
    <section class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
      <!-- Loading skeleton -->
      <div
        v-if="loading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="n in 8"
          :key="n"
          class="rounded-2xl border bg-white p-4 shadow-sm animate-pulse"
        >
          <div class="h-40 w-full rounded-lg bg-gray-200"></div>
          <div class="mt-4 h-4 w-3/5 rounded bg-gray-200"></div>
          <div class="mt-2 h-4 w-4/5 rounded bg-gray-100"></div>
        </div>
      </div>

      <!-- Grid items -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <WorkCard
          v-for="w in filtered"
          :key="w.id"
          :work="w"
          @open="goDetail(w)"
        />
      </div>

      <!-- Empty -->
      <div v-if="!loading && filtered.length === 0" class="mt-8 text-center">
        <div
          class="inline-flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 bg-white/70"
        >
          <span class="text-lg font-semibold">Արդյունք չի գտնվել</span>
          <p class="text-neutral-600">Փոխեք որոնումը կամ թեգերի ﬁլտրերը։</p>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination && pagination.last_page > 1"
        class="mt-10 flex items-center justify-center gap-2"
      >
        <button
          class="px-3 py-2 rounded-lg border hover:bg-neutral-50 disabled:opacity-50"
          :disabled="page <= 1"
          @click="changePage(page - 1)"
        >
          ‹ Նախորդ
        </button>
        <span class="px-3 py-2 text-sm text-neutral-700">
          Էջ {{ page }} / {{ pagination.last_page }}
        </span>
        <button
          class="px-3 py-2 rounded-lg border hover:bg-neutral-50 disabled:opacity-50"
          :disabled="page >= pagination.last_page"
          @click="changePage(page + 1)"
        >
          Հաջորդ ›
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import WorkCard from '~/components/work/WorkCard.vue'

const unwrapItems = (res) => {
  const body = res && res.data ? res.data : res
  if (!body || typeof body !== 'object') return []
  if (Array.isArray(body.data)) return body.data
  if (body.data && Array.isArray(body.data.data)) return body.data.data
  return []
}
const unwrapPagination = (res) => {
  const body = res && res.data ? res.data : res
  if (!body || typeof body !== 'object') return null
  return body.pagination || (body.data && body.data.pagination) || null
}
const u = (url) => (url ? encodeURI(url) : '')

export default {
  name: 'WorksIndex',
  components: { WorkCard },

  data() {
    return {
      items: [],
      pagination: null,
      loading: false,

      page: 1,
      perPage: 12,
      search: '',
      activeTag: null,

      debounceId: null,
      lastReqId: 0, // պաշտպան race-ից
    }
  },

  head() {
    return {
      title: 'Մեր աշխատանքները',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Մետաղամշակման կատարված նախագծեր և օրինակներ',
        },
      ],
    }
  },

  async fetch() {
    // SSR ընթացքում քաշում ենք query-ից սկզբնական state-ը
    this.syncFromQuery()
    await this.load()
  },

  watch: {
    '$route.query': {
      deep: true,
      handler() {
        // Եթե արտաքինից փոխվել է URL-ը՝ համաժամեցնենք և բեռնենք
        this.syncFromQuery()
        this.load()
      },
    },
  },

  computed: {
    tags() {
      const set = new Set()
      for (const it of this.items) (it.tags || []).forEach((t) => set.add(t))
      return Array.from(set)
    },
    filtered() {
      if (!this.activeTag) return this.items
      return this.items.filter((it) => (it.tags || []).includes(this.activeTag))
    },
  },

  methods: {
    syncFromQuery() {
      const q = this.$route.query
      this.page = Number(q.page || 1)
      this.search = String(q.q || '')
      this.activeTag = q.tag ? String(q.tag) : null
    },

    pushQuery() {
      this.$router.replace({
        query: {
          ...this.$route.query,
          page: this.page > 1 ? this.page : undefined,
          q: this.search || undefined,
          tag: this.activeTag || undefined,
        },
      })
    },

    async load() {
      this.loading = true
      const reqId = ++this.lastReqId
      try {
        const res = await this.$axios.get('/api/works', {
          params: {
            page: this.page,
            per_page: this.perPage,
            search: this.search || undefined,
            // server-side tag filter (եթե ունես այդ աջակցությունը backend-ում)
            // tag: this.activeTag || undefined,
          },
        })
        if (reqId !== this.lastReqId) return // ավելի ուշ եկած հին պատասխանն այլևս պետք չէ

        const items = unwrapItems(res)
        this.items = items.map((w) => ({
          ...w,
          _cover: u(
            w.image_url ||
              (Array.isArray(w.images) && w.images[0]?.url) ||
              '/logo.png'
          ),
        }))
        this.pagination = unwrapPagination(res)
      } catch (e) {
        if (reqId !== this.lastReqId) return
        // fail-soft
        // console.error('fetch works error:', e)
        this.items = []
        this.pagination = null
      } finally {
        if (reqId === this.lastReqId) this.loading = false
      }
    },

    setTag(t) {
      this.activeTag = t
      this.page = 1
      this.pushQuery() // sync to URL (և load-ը կաշխատի watcher-ով)
    },

    changePage(p) {
      this.page = p
      this.pushQuery()
    },

    debouncedFetch() {
      if (this.debounceId) clearTimeout(this.debounceId)
      this.debounceId = setTimeout(() => {
        this.page = 1
        this.pushQuery() // watcher-ը կկանչի load()
      }, 400)
    },

    goDetail(w) {
      // ՏԱՐԲԵՐԱԿ A — դինամիկ ռոութ՝ /projects/:id
      // this.$router.push(`/projects/${w.id}`)

      // ՏԱՐԲԵՐԱԿ B — եթե detail-ը query-ով է
      this.$router.push({ path: '/projects/view', query: { id: w.id } })
    },
  },
}
</script>
