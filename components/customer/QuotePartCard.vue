<template>
  <article class="part-card" :data-quote-part="item.id">
    <header class="flex items-start gap-3">
      <span class="part-ext" aria-hidden="true">{{ extension }}</span>
      <div class="min-w-0 flex-1">
        <p
          class="break-words text-sm font-bold text-slate-900 dark:text-white"
          data-quote-part-name
        >
          {{ item.original_name }}
        </p>
        <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {{ sizeText }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <button
          type="button"
          class="part-icon-button"
          :title="t.view"
          :aria-label="t.view"
          data-quote-part-view
          @click="$emit('preview', item)"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <button
          type="button"
          class="part-icon-button part-icon-button--danger"
          :title="t.remove"
          :aria-label="t.remove"
          data-quote-part-remove
          @click="$emit('remove', item)"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
            />
          </svg>
        </button>
      </div>
    </header>

    <dl v-if="measured" class="part-metrics" data-quote-part-metrics>
      <div>
        <dt>{{ t.size }}</dt>
        <dd>
          {{ number(metrics.width_mm) }} × {{ number(metrics.height_mm) }} mm
        </dd>
      </div>
      <div>
        <dt>{{ t.cut }}</dt>
        <dd>{{ (metrics.cut_length_mm / 1000).toFixed(2) }} m</dd>
      </div>
      <div>
        <dt>{{ t.pierces }}</dt>
        <dd>{{ metrics.pierces }}</dd>
      </div>
      <div
        v-if="metrics.open_contours"
        class="part-metrics__open"
        data-quote-part-open
      >
        <dt>{{ t.openOutlines }}</dt>
        <dd>{{ metrics.open_contours }}</dd>
      </div>
      <div v-if="item.pricing && item.pricing.weight_kg">
        <dt>{{ t.weight }}</dt>
        <dd>{{ item.pricing.weight_kg.toFixed(2) }} kg</dd>
      </div>
    </dl>
    <p v-else-if="metrics.status === 'failed'" class="part-note">
      {{ t.notMeasured }}
    </p>

    <div
      class="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8.5rem]"
    >
      <label class="part-field">
        <span>{{ t.material }}</span>
        <select
          v-if="materials.length"
          v-model="materialChoice"
          class="part-control"
          data-quote-part-material
          @change="pickMaterial"
        >
          <option value="">{{ t.chooseMaterial }}</option>
          <option
            v-for="choice in materials"
            :key="choice.id"
            :value="String(choice.id)"
          >
            {{ choice.name }}
          </option>
          <option value="other">{{ t.otherMaterial }}</option>
        </select>
        <input
          v-if="custom"
          v-model="form.material"
          type="text"
          maxlength="255"
          class="part-control"
          :class="{ 'mt-2': materials.length }"
          :placeholder="t.materialPlaceholder"
          data-quote-part-material-text
          @input="changed"
        />
      </label>
      <label class="part-field">
        <span>{{ t.thickness }}</span>
        <select
          v-if="!custom"
          v-model="form.pricing_thickness_id"
          class="part-control"
          :disabled="!thicknesses.length"
          data-quote-part-thickness
          @change="changed"
        >
          <option :value="null">{{ t.chooseThickness }}</option>
          <option
            v-for="option in thicknesses"
            :key="option.id"
            :value="option.id"
          >
            {{ number(option.thickness) }}
          </option>
        </select>
        <input
          v-else
          v-model="form.thickness"
          type="number"
          min="0.1"
          max="300"
          step="0.1"
          inputmode="decimal"
          class="part-control"
          data-quote-part-thickness-text
          @input="changed"
        />
      </label>
      <div class="part-field">
        <span>{{ t.quantity }}</span>
        <div
          class="flex items-stretch overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700"
        >
          <button
            type="button"
            class="part-step"
            :aria-label="'−1'"
            :disabled="form.quantity <= 1"
            @click="step(-1)"
          >
            −
          </button>
          <input
            v-model.number="form.quantity"
            type="number"
            min="1"
            max="1000000"
            inputmode="numeric"
            class="min-w-0 flex-1 border-0 bg-white text-center text-sm font-bold text-slate-900 outline-none dark:bg-slate-900 dark:text-white"
            :aria-label="t.quantity"
            data-quote-part-quantity
            @input="changed"
          />
          <button
            type="button"
            class="part-step"
            :aria-label="'+1'"
            @click="step(1)"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <fieldset class="mt-4">
      <legend class="part-legend">{{ t.services }}</legend>
      <div class="flex flex-wrap gap-2">
        <label
          v-for="workshop in workshops"
          :key="workshop.id"
          class="part-chip"
          :class="{ 'part-chip--on': chosen(workshop.id) }"
        >
          <input
            type="checkbox"
            class="sr-only"
            :checked="chosen(workshop.id)"
            :data-quote-service="workshop.value"
            @change="toggle(workshop.id)"
          />
          {{ serviceName(workshop) }}
        </label>
      </div>
    </fieldset>

    <div v-if="bending || powder" class="mt-4 grid gap-3 sm:grid-cols-2">
      <label v-if="bending" class="part-field">
        <span
          >{{ t.bends
          }}<em v-if="metrics.bends" class="ml-1 not-italic text-slate-400"
            >({{ t.bendsFound(metrics.bends) }})</em
          ></span
        >
        <input
          v-model="form.bends"
          type="number"
          min="0"
          max="500"
          inputmode="numeric"
          class="part-control"
          :placeholder="metrics.bends ? String(metrics.bends) : ''"
          data-quote-part-bends
          @input="changed"
        />
      </label>
      <div v-if="powder" class="part-field">
        <span>{{ t.paint }}</span>
        <input
          v-model="form.paint_ral"
          type="text"
          maxlength="40"
          class="part-control"
          :placeholder="t.paintPlaceholder"
          data-quote-part-ral
          @input="changed"
        />
        <label
          class="mt-2 flex items-center gap-2 text-sm font-normal text-slate-600 dark:text-slate-300"
        >
          <input
            v-model="form.primer_required"
            type="checkbox"
            class="h-4 w-4"
            data-quote-part-primer
            @change="changed"
          />
          {{ t.primer }}
        </label>
      </div>
    </div>

    <label class="part-field mt-4">
      <span>{{ t.note }}</span>
      <textarea
        v-model="form.note"
        rows="2"
        maxlength="2000"
        class="part-control resize-y"
        :placeholder="t.notePlaceholder"
        data-quote-part-note
        @input="changed"
      />
    </label>

    <footer
      class="part-price"
      :class="priced ? 'part-price--on' : ''"
      data-quote-part-price
    >
      <template v-if="priced">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="text-sm text-slate-600 dark:text-slate-300">
            <strong
              class="text-base text-slate-900 dark:text-white"
              data-quote-part-unit
              >{{ money(item.pricing.unit) }}</strong
            >
            {{ t.unit }}
            <span
              v-if="item.pricing.discount_percent"
              class="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              >−{{ item.pricing.discount_percent }}%</span
            >
          </p>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            {{ t.line }}:
            <strong
              class="text-lg text-slate-950 dark:text-white"
              data-quote-part-line
              >{{ money(item.pricing.line) }}</strong
            >
          </p>
        </div>
        <p
          v-if="breaks.length > 1"
          class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400"
        >
          <span class="font-semibold">{{ t.breaks }}:</span>
          <span v-for="row in breaks" :key="row.quantity"
            >{{ t.fromQty(row.quantity) }} — {{ money(row.unit) }}</span
          >
        </p>
      </template>
      <ul
        v-else
        class="space-y-1 text-sm text-amber-800 dark:text-amber-200"
        data-quote-part-reasons
      >
        <li v-for="reason in reasons" :key="reason">{{ reason }}</li>
      </ul>
      <p v-if="saving" class="mt-2 text-xs text-slate-400" role="status">
        {{ t.saving }}
      </p>
      <p
        v-else-if="error"
        class="mt-2 text-xs text-rose-600 dark:text-rose-300"
        role="alert"
      >
        {{ error }}
      </p>
    </footer>
  </article>
</template>

<script>
import {
  fileSize,
  formatMoney,
  itemPayload,
  quoteCopy,
  reasonsText,
  serviceName,
} from '@/utils/quote-copy'

export default {
  name: 'QuotePartCard',
  props: {
    item: { type: Object, required: true },
    options: { type: Object, required: true },
    saving: Boolean,
    error: { type: String, default: '' },
  },
  data() {
    return { form: this.fresh(), materialChoice: '', custom: false }
  },
  computed: {
    locale() {
      return this.$i18n?.locale
    },
    t() {
      return quoteCopy(this.locale).create
    },
    workshops() {
      return this.options.workshops || []
    },
    materials() {
      return this.options.pricing?.materials || []
    },
    material() {
      return (
        this.materials.find(
          (m) => String(m.id) === String(this.materialChoice)
        ) || null
      )
    },
    thicknesses() {
      return this.material ? this.material.thicknesses : []
    },
    metrics() {
      return this.item.metrics || {}
    },
    measured() {
      return this.metrics.status === 'ok'
    },
    bending() {
      return this.workshops.some(
        (w) => String(w.value).toUpperCase() === 'DLD' && this.chosen(w.id)
      )
    },
    powder() {
      return this.workshops.some((w) => w.powder && this.chosen(w.id))
    },
    priced() {
      return this.item.pricing?.status === 'priced'
    },
    breaks() {
      return this.item.pricing?.breaks || []
    },
    reasons() {
      return reasonsText(this.item.pricing?.reasons, this.locale)
    },
    extension() {
      return String(this.item.original_name || '')
        .split('.')
        .pop()
        .toUpperCase()
        .slice(0, 6)
    },
    sizeText() {
      return fileSize(this.item.size)
    },
  },
  watch: {
    'item.id'() {
      this.form = this.fresh()
      this.syncMaterial()
    },
  },
  created() {
    this.syncMaterial()
  },
  methods: {
    fresh() {
      const item = this.item
      return {
        workshop_ids: [...(item.workshop_ids || [])],
        pricing_thickness_id: item.pricing_thickness_id || null,
        material: item.pricing_thickness_id ? '' : item.material || '',
        thickness: item.pricing_thickness_id ? '' : item.thickness ?? '',
        quantity: item.quantity || 1,
        bends: item.bends ?? '',
        paint_ral: item.paint_ral || '',
        primer_required: Boolean(item.primer_required),
        note: item.note || '',
      }
    },
    // A price-list thickness names its material; anything else is typed in.
    syncMaterial() {
      const id = this.form.pricing_thickness_id
      const owner = id
        ? this.materials.find((m) =>
            m.thicknesses.some((t) => Number(t.id) === Number(id))
          )
        : null
      this.materialChoice = owner
        ? String(owner.id)
        : this.item.material || !this.materials.length
        ? 'other'
        : ''
      this.custom = this.materialChoice === 'other' || !this.materials.length
    },
    pickMaterial() {
      this.custom = this.materialChoice === 'other'
      // A thickness already given (a template part's, or the previous
      // material's) stays when the new material has it.
      const wanted = Number(this.form.thickness) || Number(this.item.thickness)
      const same = this.thicknesses.find((t) => Number(t.thickness) === wanted)
      const only = this.thicknesses.length === 1 ? this.thicknesses[0].id : null
      this.form.pricing_thickness_id = this.custom ? null : same?.id ?? only
      this.changed()
    },
    chosen(id) {
      return this.form.workshop_ids.map(Number).includes(Number(id))
    },
    toggle(id) {
      const ids = this.form.workshop_ids.map(Number)
      this.form.workshop_ids = ids.includes(Number(id))
        ? ids.filter((value) => value !== Number(id))
        : [...ids, Number(id)]
      this.changed()
    },
    step(delta) {
      this.form.quantity = Math.max(
        1,
        (Number(this.form.quantity) || 1) + delta
      )
      this.changed()
    },
    changed() {
      this.$emit('change', {
        id: this.item.id,
        payload: itemPayload(this.form),
      })
    },
    serviceName(workshop) {
      return serviceName(workshop, this.locale)
    },
    money(value) {
      return formatMoney(value)
    },
    number(value) {
      return Number(value).toLocaleString('en-US', {
        maximumFractionDigits: 1,
        useGrouping: false,
      })
    },
  },
}
</script>

<style scoped>
.part-card {
  @apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5;
}
.part-ext {
  @apply flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-[10px] font-black tracking-wide text-white dark:bg-white dark:text-slate-900;
}
.part-icon-button {
  @apply inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white;
}
.part-icon-button--danger {
  @apply hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-300;
}
.part-metrics {
  @apply mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-950/40 sm:grid-cols-4;
}
.part-metrics dt {
  @apply text-slate-500 dark:text-slate-400;
}
.part-metrics dd {
  @apply mt-0.5 font-bold text-slate-900 dark:text-white;
}
.part-metrics .part-metrics__open dt,
.part-metrics .part-metrics__open dd {
  @apply text-amber-700 dark:text-amber-300;
}
.part-note {
  @apply mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200;
}
.part-field {
  @apply block text-xs font-bold text-slate-600 dark:text-slate-300;
}
.part-field > span {
  @apply mb-1.5 block;
}
.part-control {
  @apply block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white;
}
.part-step {
  @apply w-10 shrink-0 bg-slate-50 text-lg font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700;
}
.part-legend {
  @apply mb-2 text-xs font-bold text-slate-600 dark:text-slate-300;
}
.part-chip {
  @apply cursor-pointer select-none rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 focus-within:ring-2 focus-within:ring-blue-500/30 dark:border-slate-700 dark:text-slate-300;
}
.part-chip--on {
  @apply border-blue-600 bg-blue-600 text-white hover:border-blue-700 dark:border-blue-500 dark:bg-blue-600 dark:text-white;
}
.part-price {
  @apply mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/60 dark:bg-amber-950/20;
}
.part-price--on {
  @apply border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20;
}
</style>
