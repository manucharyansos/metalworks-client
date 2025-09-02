<template>
  <nav
    class="flex items-center justify-center gap-1"
    role="navigation"
    aria-label="Էջավորում"
  >
    <!-- Prev -->
    <button
      class="px-2 py-1 mx-1 text-sm font-medium rounded-lg border transition bg-indigo-50 text-neutral-700 border-indigo-200 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="!canPrev"
      @click="$emit('change', meta.current_page - 1)"
    >
      Նախորդ
    </button>

    <!-- Pages -->
    <div v-for="(p, i) in pages" :key="`${i}-${p}`">
      <span v-if="p === '…'" class="px-2 py-1 mx-1 text-sm text-neutral-500"
        >…</span
      >
      <button
        v-else
        class="px-3 py-1 mx-1 text-sm font-medium rounded-lg transition"
        :class="
          p === meta.current_page
            ? 'bg-indigo-500 text-white'
            : 'bg-indigo-50 text-neutral-700 hover:bg-indigo-100 border border-indigo-200'
        "
        @click="go(p)"
      >
        {{ p }}
      </button>
    </div>

    <!-- Next -->
    <button
      class="px-2 py-1 mx-1 text-sm font-medium rounded-lg border transition bg-indigo-50 text-neutral-700 border-indigo-200 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="!canNext"
      @click="$emit('change', meta.current_page + 1)"
    >
      Հաջորդ
    </button>
  </nav>
</template>

<script>
export default {
  name: 'PaginationUi',
  props: {
    meta: {
      type: Object,
      required: true, // սպասում է backend-ի meta-ին՝ {current_page, last_page, next_page_url, prev_page_url, ...}
    },
  },
  computed: {
    canPrev() {
      const cur = Number(this.meta?.current_page || 1)
      return cur > 1 && this.meta?.prev_page_url !== null
    },
    canNext() {
      const cur = Number(this.meta?.current_page || 1)
      const last = Number(this.meta?.last_page || 1)
      return cur < last && this.meta?.next_page_url !== null
    },
    pages() {
      const cur = Number(this.meta?.current_page || 1)
      const last = Number(this.meta?.last_page || 1)
      const out = []
      if (last <= 7) {
        for (let i = 1; i <= last; i++) out.push(i)
      } else {
        out.push(1)
        if (cur > 4) out.push('…')
        const start = Math.max(2, cur - 1)
        const end = Math.min(last - 1, cur + 1)
        for (let i = start; i <= end; i++) out.push(i)
        if (cur < last - 3) out.push('…')
        out.push(last)
      }
      return out
    },
  },
  methods: {
    go(p) {
      if (p === '…' || p === this.meta?.current_page) return
      this.$emit('change', p)
    },
  },
}
</script>
