<template>
  <div class="w-full flex flex-wrap items-center gap-3">
    <!-- search -->
    <div class="flex-1 min-w-[240px] relative">
      <input
        :value="search"
        class="w-full rounded-xl border px-4 py-2.5 dark:bg-gray-800 dark:text-gray-100"
        :placeholder="
          $t?.('search') || 'Որոնել պատվեր… (անուն, նկարագրություն, համար, կոդ)'
        "
        @input="onSearchInput"
      />
      <button
        v-if="search?.length"
        class="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        aria-label="Մաքրել"
        @click="$emit('update:search', '')"
      >
        ✕
      </button>
      <div
        class="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
          />
        </svg>
      </div>
    </div>

    <!-- per page -->
    <div class="flex items-center gap-2">
      <label class="text-sm opacity-80">Էջում</label>

      <select
        v-if="!showCustom"
        :value="selectValue"
        class="rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-gray-100"
        @change="onSelectChange"
      >
        <option :value="4">4</option>
        <option :value="12">12</option>
        <option :value="24">24</option>
        <option value="custom">Այլ…</option>
      </select>

      <!-- custom input only when 'custom' -->
      <input
        v-if="showCustom"
        v-model.number="customPage"
        type="number"
        inputmode="numeric"
        min="1"
        max="500"
        class="w-20 rounded-lg border px-2 py-2 dark:bg-gray-800 dark:text-gray-100"
        placeholder="qty"
        @keyup.enter="applyCustom"
        @blur="applyCustom"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrdersToolbar',
  props: {
    search: { type: String, default: '' },
    perPage: { type: Number, default: 12 },
  },
  data() {
    return {
      tmr: null,
      showCustom: false,
      customPage: this.perPage,
    }
  },
  computed: {
    // եթե perPage-ը 4/12/24-ից է՝ select-ը ցույց է տալիս թիվը,
    // հակառակ դեպքում՝ “custom”
    selectValue() {
      return [4, 12, 24].includes(this.perPage) ? this.perPage : 'custom'
    },
  },
  watch: {
    perPage(n) {
      // եթե դրսից փոխվեց, պահպանում ենք custom ինպուտի արժեքը սենխρον
      if (![4, 12, 24].includes(n)) {
        this.showCustom = true
        this.customPage = n
      } else {
        this.showCustom = false
      }
    },
  },
  methods: {
    onSearchInput(e) {
      const val = e.target.value
      clearTimeout(this.tmr)
      this.tmr = setTimeout(() => this.$emit('update:search', val), 300)
    },
    onSelectChange(e) {
      const val = e.target.value
      if (val === 'custom') {
        this.showCustom = true
        this.$nextTick(() => {
          // focus custom input, եթե պետք է՝ կարող ես ավելացնել ref
        })
      } else {
        this.showCustom = false
        this.$emit('update:per-page', Number(val))
      }
    },
    applyCustom() {
      let v = Number(this.customPage)
      if (!Number.isFinite(v)) return
      v = Math.max(1, Math.min(500, Math.floor(v)))
      this.customPage = v
      this.$emit('update:per-page', v)
    },
  },
}
</script>
