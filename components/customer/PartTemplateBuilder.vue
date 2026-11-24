<template>
  <div
    class="work-modal-backdrop fixed inset-0 z-[1000]"
    @click.self="$emit('close')"
  >
    <section
      ref="dialog"
      class="work-modal flex w-full max-w-5xl flex-col focus:outline-none"
      role="dialog"
      aria-modal="true"
      :aria-label="template ? name(template) : t.title"
      tabindex="-1"
      data-work-modal
      data-part-builder
      @keydown.esc="$emit('close')"
    >
      <header
        class="work-modal__header flex items-center justify-between gap-3"
      >
        <div class="flex min-w-0 items-center gap-3">
          <button
            v-if="template"
            type="button"
            class="builder-back"
            :title="t.back"
            :aria-label="t.back"
            data-part-builder-back
            @click="pick(null)"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 18l-6-6 6-6"
              />
            </svg>
          </button>
          <div class="min-w-0">
            <h2 class="truncate text-base font-bold">
              {{ template ? name(template) : t.title }}
            </h2>
            <p
              v-if="template"
              class="truncate text-xs text-slate-500 dark:text-slate-400"
            >
              {{ description(template) }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="work-modal__close"
          :aria-label="t.close"
          @click="$emit('close')"
        >
          ×
        </button>
      </header>

      <div class="work-modal__body">
        <div v-if="!template" data-part-gallery>
          <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">
            {{ t.lead }}
          </p>
          <div
            class="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
          >
            <div class="flex flex-wrap gap-2">
              <button
                v-for="key in categories"
                :key="key"
                type="button"
                class="builder-chip"
                :class="{ 'builder-chip--on': category === key }"
                :aria-pressed="category === key ? 'true' : 'false'"
                :data-part-category="key"
                @click="category = key"
              >
                {{ t.categories[key] }}
              </button>
            </div>
            <input
              ref="search"
              v-model="query"
              type="search"
              class="builder-search lg:w-60"
              :placeholder="t.search"
              :aria-label="t.search"
              data-part-search
            />
          </div>
          <ul
            v-if="visible.length"
            class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            <li v-for="item in visible" :key="item.id">
              <button
                type="button"
                class="builder-card"
                :data-part-template="item.id"
                @click="pick(item)"
              >
                <span class="builder-thumb">
                  <PartShape :part="thumbs[item.id]" class="h-full w-full" />
                </span>
                <span
                  class="mt-3 block text-sm font-bold text-slate-900 dark:text-white"
                  >{{ name(item) }}</span
                >
                <span
                  class="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400"
                  >{{ description(item) }}</span
                >
              </button>
            </li>
          </ul>
          <p v-else class="mt-8 text-center text-sm text-slate-500">
            {{ t.nothing }}
          </p>
        </div>

        <div
          v-else
          class="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]"
          data-part-config
        >
          <form class="space-y-3" novalidate @submit.prevent="add">
            <p class="builder-legend">{{ t.dimensions }}</p>
            <label
              v-for="(field, index) in fields"
              :key="field.key"
              class="builder-field"
            >
              <span class="builder-label">{{ field.label }}</span>
              <span
                class="builder-input"
                :class="{
                  'builder-input--bad': issue && issue.param === field.key,
                }"
              >
                <input
                  :ref="index === 0 ? 'first' : null"
                  v-model="values[field.key]"
                  type="number"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step"
                  :inputmode="field.count ? 'numeric' : 'decimal'"
                  :list="
                    field.key === 'thickness' && sheetThicknesses.length
                      ? listId
                      : null
                  "
                  :aria-invalid="
                    issue && issue.param === field.key ? 'true' : 'false'
                  "
                  :data-part-param="field.key"
                />
                <em v-if="!field.count">{{ t.mm }}</em>
              </span>
              <small v-if="field.zero" class="builder-hint"
                >0 — {{ field.zero }}</small
              >
            </label>
            <datalist v-if="sheetThicknesses.length" :id="listId">
              <option
                v-for="value in sheetThicknesses"
                :key="value"
                :value="value"
              />
            </datalist>
            <label
              class="builder-field border-t border-slate-100 pt-3 dark:border-slate-800"
            >
              <span class="builder-label">{{ t.quantity }}</span>
              <span class="builder-input">
                <input
                  v-model="quantity"
                  type="number"
                  min="1"
                  max="1000000"
                  step="1"
                  inputmode="numeric"
                  data-part-quantity
                />
              </span>
            </label>
            <button type="submit" class="sr-only" tabindex="-1">
              {{ t.add }}
            </button>
          </form>

          <div class="order-first min-w-0 space-y-4 lg:order-none">
            <figure class="builder-preview">
              <figcaption class="builder-legend">
                {{ template.bends ? t.flat : t.preview }}
              </figcaption>
              <PartShape
                v-if="part"
                :part="part"
                dimensions
                :unit="t.mm"
                :invalid="Boolean(issue)"
                :label="name(template)"
                class="mx-auto h-64 w-full sm:h-80"
              />
            </figure>
            <p
              v-if="issue"
              role="alert"
              class="builder-problem"
              data-part-problem
            >
              {{ issueText }}
            </p>
            <dl v-else-if="metrics" class="builder-metrics" data-part-metrics>
              <div>
                <dt>{{ t.metrics.size }}</dt>
                <dd>
                  {{ mm(metrics.widthMm) }} × {{ mm(metrics.heightMm) }}
                  {{ t.mm }}
                </dd>
              </div>
              <div>
                <dt>{{ t.metrics.cut }}</dt>
                <dd>{{ (metrics.cutLengthMm / 1000).toFixed(2) }} m</dd>
              </div>
              <div>
                <dt>{{ t.metrics.pierces }}</dt>
                <dd>{{ metrics.pierces }}</dd>
              </div>
              <div v-if="metrics.bends">
                <dt>{{ t.metrics.bends }}</dt>
                <dd>{{ metrics.bends }}</dd>
              </div>
              <div v-if="metrics.areaMm2">
                <dt>{{ t.metrics.area }}</dt>
                <dd>{{ area(metrics.areaMm2) }}</dd>
              </div>
            </dl>
            <div
              v-if="profile"
              class="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/40"
              data-part-profile
            >
              <svg
                :viewBox="profile.box"
                class="h-28 w-28 shrink-0 text-slate-700 dark:text-slate-200"
                role="img"
                :aria-label="t.profile"
              >
                <path
                  :d="profile.d"
                  fill="none"
                  stroke="currentColor"
                  :stroke-width="profile.stroke"
                  stroke-linejoin="round"
                />
                <text
                  v-for="label in profile.labels"
                  :key="label.key"
                  :transform="label.transform"
                  :font-size="profile.font"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="fill-slate-500 font-semibold dark:fill-slate-400"
                >
                  {{ label.text }}
                </text>
              </svg>
              <div class="min-w-0">
                <p class="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {{ t.profile }}
                </p>
                <p
                  class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400"
                >
                  {{ t.bentNote(mm(values.thickness)) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer
        v-if="template"
        class="work-modal__footer flex flex-wrap items-center justify-end gap-2"
      >
        <!-- On a phone the arrow in the header already leads back. -->
        <span class="hidden sm:inline-flex">
          <button type="button" class="work-button" @click="pick(null)">
            {{ t.back }}
          </button>
        </span>
        <button
          type="button"
          class="work-button"
          data-variant="primary"
          :disabled="Boolean(issue) || !part"
          data-part-add
          @click="add"
        >
          {{ t.add }}
        </button>
      </footer>
    </section>
  </div>
</template>

<script>
import PartShape from '@/components/customer/PartShape.vue'
import { measureDxf } from '@/utils/dxf-measure'
import {
  COUNTS,
  TEMPLATES,
  buildPart,
  defaults,
  problem,
  templateById,
  toDxf,
} from '@/utils/part-templates'
import {
  mm,
  paramLabel,
  partFileName,
  partNote,
  problemText,
  templateCopy,
} from '@/utils/part-template-copy'

const CATEGORIES = [
  'all',
  'plates',
  'flanges',
  'brackets',
  'bent',
  'gears',
  'shapes',
]
const STEPS = { module: 0.5, thickness: 0.5 }
// A phone keyboard would cover the preview, so fields take focus on wide screens only.
const wide = () =>
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.('(min-width: 1024px)').matches)

export default {
  name: 'PartTemplateBuilder',
  components: { PartShape },
  props: {
    // A template to open straight away instead of the gallery.
    start: { type: String, default: '' },
    workshops: { type: Array, default: () => [] },
    materials: { type: Array, default: () => [] },
  },
  data() {
    return {
      category: 'all',
      query: '',
      template: null,
      values: {},
      quantity: 1,
      part: null,
      listId: `part-thickness-${Math.random().toString(36).slice(2)}`,
    }
  },
  computed: {
    t() {
      return templateCopy(this.$i18n?.locale)
    },
    categories() {
      return CATEGORIES
    },
    // Every template once with its own defaults, for the gallery.
    thumbs() {
      return Object.freeze(
        Object.fromEntries(
          TEMPLATES.map((item) => [
            item.id,
            Object.freeze(buildPart(item, defaults(item))),
          ])
        )
      )
    },
    visible() {
      const words = this.query
        .trim()
        .toLocaleLowerCase()
        .split(/\s+/)
        .filter(Boolean)
      return TEMPLATES.filter((item) => {
        if (this.category !== 'all' && item.category !== this.category)
          return false
        if (!words.length) return true
        const text = [
          ...(this.t.templates[item.id] || []),
          this.t.categories[item.category],
        ]
          .join(' ')
          .toLocaleLowerCase()
        return words.every((word) => text.includes(word))
      })
    },
    fields() {
      if (!this.template) return []
      return this.template.params.map(([key, , min, max]) => ({
        key,
        min,
        max,
        label: paramLabel(this.t, this.template, key),
        count: COUNTS.includes(key),
        step: COUNTS.includes(key) ? 1 : STEPS[key] || 'any',
        zero: min === 0 ? this.t.zeros[key] || '' : '',
      }))
    },
    issue() {
      return this.template ? problem(this.template, this.values) : null
    },
    issueText() {
      return problemText(this.t, this.template, this.issue)
    },
    // The same numbers the server prices with: measured from the DXF itself.
    metrics() {
      if (!this.part || this.issue) return null
      try {
        return measureDxf(toDxf(this.part))
      } catch (_) {
        return null
      }
    },
    // The thicknesses the company cuts, offered for bent parts.
    sheetThicknesses() {
      const all = this.materials.flatMap((m) =>
        (m.thicknesses || []).map((t) => Number(t.thickness))
      )
      return [...new Set(all.filter((value) => value > 0))].sort(
        (a, b) => a - b
      )
    },
    // A side view of a bent part with its outside dimensions.
    profile() {
      if (!this.template?.bends || !this.part) return null
      const v = this.values
      const thickness = Number(v.thickness) || 1
      let d
      let w
      let h
      if (this.template.id === 'bent-u') {
        w = Number(v.base)
        h = Number(v.side)
        d = `M0 0V${h}H${w}V0`
      } else {
        w = Number(v.legB)
        h = Number(v.legA)
        d = `M0 0V${h}H${w}`
      }
      const s = Math.max(w, h, 1)
      const stroke = Math.max(thickness, s * 0.035)
      const font = s * 0.14
      const pad = font * 1.3 + stroke
      // The outside sizes the customer typed: the upright leg and the bottom.
      const labels = [
        {
          key: 'up',
          text: mm(h),
          transform: `translate(${-stroke - font * 0.75} ${h / 2}) rotate(-90)`,
        },
        {
          key: 'bottom',
          text: mm(w),
          transform: `translate(${w / 2} ${h + stroke + font * 0.75})`,
        },
      ]
      return {
        d,
        stroke,
        font,
        labels,
        box: `${-pad} ${-stroke - font * 0.5} ${w + 2 * pad} ${
          h + pad + stroke + font * 0.5
        }`,
      }
    },
  },
  watch: {
    values: {
      deep: true,
      handler() {
        this.refresh()
      },
    },
  },
  mounted() {
    const first = this.start ? templateById(this.start) : null
    if (first) this.pick(first)
    else this.$nextTick(() => this.focus(this.$refs.search))
  },
  methods: {
    name(item) {
      return this.t.templates[item.id]?.[0] || item.id
    },
    description(item) {
      return this.t.templates[item.id]?.[1] || ''
    },
    pick(item) {
      this.template = item
      this.part = null
      this.quantity = 1
      this.values = item ? { ...defaults(item) } : {}
      if (item) this.refresh()
      this.$nextTick(() => {
        const first = this.$refs.first
        this.focus(
          item ? (Array.isArray(first) ? first[0] : first) : this.$refs.search
        )
      })
    },
    focus(field) {
      ;(wide() && field ? field : this.$refs.dialog)?.focus()
    },
    // Keeps the last drawable part on screen while a field is being retyped.
    refresh() {
      if (!this.template) return
      const issue = this.issue
      if (issue && issue.key === 'range') return
      try {
        this.part = Object.freeze(buildPart(this.template, this.values))
      } catch (_) {}
    },
    add() {
      if (this.issue || !this.part) return
      const file = new File(
        [toDxf(this.part)],
        partFileName(this.t, this.template, this.part),
        { type: 'application/dxf' }
      )
      const fields = {
        quantity: Math.min(
          1000000,
          Math.max(1, Math.round(Number(this.quantity) || 1))
        ),
        note: partNote(this.t, this.template, this.values, this.part),
      }
      // A bent part is cut and bent; its bend lines give the number of bends.
      if (this.template.bends) {
        fields.thickness = Number(this.values.thickness)
        const ids = ['DXF', 'DLD']
          .map(
            (code) =>
              this.workshops.find(
                (w) =>
                  String(w.value || '')
                    .trim()
                    .toUpperCase() === code
              )?.id
          )
          .filter(Boolean)
        if (ids.length) fields.workshop_ids = ids
      }
      this.$emit('add', { file, fields })
    },
    mm(value) {
      return mm(value)
    },
    area(value) {
      return value >= 1000000
        ? `${(value / 1000000).toFixed(3)} m²`
        : `${(value / 100).toFixed(1)} cm²`
    },
  },
}
</script>

<style scoped>
.builder-back {
  @apply inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800;
}
.builder-chip {
  @apply rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-300;
}
.builder-chip--on {
  @apply border-blue-600 bg-blue-600 text-white hover:border-blue-700 dark:border-blue-500 dark:bg-blue-600 dark:text-white;
}
.builder-search {
  @apply block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white;
}
.builder-card {
  @apply flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500;
}
.builder-thumb {
  @apply block h-24 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/40;
}
.builder-legend {
  @apply text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400;
}
.builder-field {
  @apply block;
}
.builder-label {
  @apply mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300;
}
.builder-input {
  @apply flex items-center overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900;
}
.builder-input--bad {
  @apply border-rose-400 ring-2 ring-rose-500/15 dark:border-rose-500;
}
.builder-input input {
  @apply min-w-0 flex-1 border-0 bg-transparent px-3 text-sm font-semibold text-slate-900 shadow-none outline-none ring-0 focus:ring-0 dark:text-white;
}
.builder-input em {
  @apply shrink-0 pr-3 text-xs font-semibold not-italic text-slate-400;
}
.builder-hint {
  @apply mt-1 block text-[11px] text-slate-400;
}
.builder-preview {
  @apply rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900;
}
.builder-preview > figcaption {
  @apply mb-2;
}
.builder-problem {
  @apply rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200;
}
.builder-metrics {
  @apply grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-950/40 sm:grid-cols-5;
}
.builder-metrics dt {
  @apply text-slate-500 dark:text-slate-400;
}
.builder-metrics dd {
  @apply mt-0.5 font-bold text-slate-900 dark:text-white;
}
</style>
