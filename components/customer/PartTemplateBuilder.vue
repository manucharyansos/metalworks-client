<template>
  <div
    class="work-modal-backdrop fixed inset-0 z-[1000]"
    @click.self="$emit('close')"
  >
    <section
      ref="dialog"
      class="work-modal flex w-full max-w-6xl flex-col focus:outline-none"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
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
            v-if="step !== 'material'"
            type="button"
            class="builder-back"
            :title="t.back"
            :aria-label="t.back"
            data-part-builder-back
            @click="back"
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
            <h2 class="truncate text-base font-bold">{{ title }}</h2>
            <p
              v-if="step === 'config' && template"
              class="truncate text-xs text-slate-500 dark:text-slate-400"
            >
              {{ description(template) }}
            </p>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <button
            v-if="step !== 'material' && materialReady"
            type="button"
            class="material-chip"
            :title="b.material.change"
            data-part-material-chip
            @click="step = 'material'"
          >
            <span class="truncate">{{ materialLabel }}</span>
            <span class="hidden text-blue-600 dark:text-blue-300 sm:inline">{{
              b.material.change
            }}</span>
          </button>
          <button
            type="button"
            class="work-modal__close"
            :aria-label="t.close"
            @click="$emit('close')"
          >
            ×
          </button>
        </div>
      </header>

      <div class="work-modal__body">
        <div v-if="step === 'material'" data-part-material>
          <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">
            {{ b.material.lead }}
          </p>
          <ul
            v-if="materials.length"
            class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <li
              v-for="item in materials"
              :key="item.id"
              class="material-card"
              :class="{ 'material-card--on': materialId === String(item.id) }"
              :data-part-material-id="item.id"
            >
              <p class="text-sm font-bold text-slate-900 dark:text-white">
                {{ item.name }}
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  v-for="choice in item.thicknesses"
                  :key="choice.id"
                  type="button"
                  class="builder-chip"
                  :class="{
                    'builder-chip--on':
                      materialId === String(item.id) &&
                      Number(thicknessId) === Number(choice.id),
                  }"
                  :data-part-thickness="choice.thickness"
                  @click="chooseThickness(item, choice)"
                >
                  {{ mm(choice.thickness) }} {{ t.mm }}
                </button>
              </div>
            </li>
            <li
              class="material-card"
              :class="{ 'material-card--on': materialId === 'other' }"
            >
              <button
                type="button"
                class="block w-full text-left"
                data-part-material-other
                @click="materialId = 'other'"
              >
                <span
                  class="block text-sm font-bold text-slate-900 dark:text-white"
                  >{{ b.material.other }}</span
                >
                <span
                  class="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400"
                  >{{ b.material.otherLead }}</span
                >
              </button>
            </li>
          </ul>
          <div
            v-if="custom"
            class="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]"
          >
            <label class="builder-field">
              <span class="builder-label">{{ b.material.name }}</span>
              <span class="builder-input">
                <input
                  v-model="customMaterial"
                  type="text"
                  maxlength="255"
                  :placeholder="b.material.placeholder"
                  data-part-material-text
                />
              </span>
            </label>
            <label class="builder-field">
              <span class="builder-label">{{ b.material.thickness }}</span>
              <span class="builder-input">
                <input
                  v-model="customThickness"
                  type="number"
                  min="0.5"
                  max="50"
                  step="0.5"
                  inputmode="decimal"
                  data-part-material-thickness
                />
                <em>{{ t.mm }}</em>
              </span>
            </label>
          </div>
        </div>

        <div v-else-if="step === 'gallery'" data-part-gallery>
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
                :class="{ 'builder-card--start': item.id === 'blank' }"
                :data-part-template="item.id"
                @click="pick(item)"
              >
                <span class="builder-thumb">
                  <PartShape :part="thumbs[item.id]" class="h-full w-full" />
                </span>
                <span
                  v-if="item.id === 'blank'"
                  class="mt-3 inline-flex w-fit rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white"
                  >{{ b.blank }}</span
                >
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
          v-else-if="template"
          class="grid gap-6 lg:grid-cols-[21rem_minmax(0,1fr)]"
          data-part-config
        >
          <form class="space-y-6" novalidate @submit.prevent="add">
            <section class="space-y-3">
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
            </section>

            <section v-if="angleField" class="space-y-3" data-part-bend>
              <p class="builder-legend">{{ b.bend.title }}</p>
              <label class="builder-field">
                <span class="builder-label">{{ angleField.label }}</span>
                <span
                  class="builder-input"
                  :class="{
                    'builder-input--bad': issue && issue.param === 'angle',
                  }"
                >
                  <input
                    v-model="values.angle"
                    type="number"
                    :min="angleField.min"
                    :max="angleField.max"
                    step="1"
                    inputmode="numeric"
                    data-part-param="angle"
                  />
                  <em>°</em>
                </span>
              </label>
              <input
                v-model="values.angle"
                type="range"
                :min="angleField.min"
                :max="angleField.max"
                step="1"
                class="w-full accent-blue-600"
                :aria-label="angleField.label"
                data-part-angle-range
              />
              <small class="builder-hint">{{ b.bend.lead }}</small>
            </section>

            <section class="space-y-3" data-part-patterns>
              <p class="builder-legend">{{ b.patterns.title }}</p>
              <p class="builder-hint">{{ b.patterns.lead }}</p>
              <div v-if="patterns.length" class="flex flex-wrap gap-2">
                <button
                  v-for="(pattern, index) in patterns"
                  :key="index"
                  type="button"
                  class="builder-chip"
                  :class="{ 'builder-chip--on': selected === index }"
                  :data-part-pattern-chip="index"
                  @click="selected = index"
                >
                  {{ index + 1 }}. {{ b.patterns.kinds[pattern.kind] }} ·
                  {{ b.patterns.count(cellCount(index)) }}
                </button>
              </div>
              <button
                type="button"
                class="work-button w-full"
                data-variant="open"
                :aria-expanded="picking ? 'true' : 'false'"
                data-part-pattern-add
                @click="picking = !picking"
              >
                + {{ b.patterns.add }}
              </button>
              <ul v-if="picking" class="grid grid-cols-3 gap-2">
                <li v-for="kind in kinds" :key="kind.id">
                  <button
                    type="button"
                    class="pattern-kind"
                    :data-part-pattern-kind="kind.id"
                    @click="addPattern(kind.id)"
                  >
                    <span class="block h-10">
                      <PartShape
                        :part="kindThumbs[kind.id]"
                        class="h-full w-full"
                      />
                    </span>
                    <span
                      class="mt-1 block text-[11px] font-semibold leading-4"
                      >{{ b.patterns.kinds[kind.id] }}</span
                    >
                  </button>
                </li>
              </ul>
              <div
                v-if="current"
                class="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/60 dark:bg-amber-950/10"
                data-part-pattern-editor
              >
                <label class="builder-field">
                  <span class="builder-label">{{ b.patterns.kind }}</span>
                  <select
                    v-model="current.kind"
                    class="builder-select"
                    data-pattern-field="kind"
                  >
                    <option
                      v-for="kind in kinds"
                      :key="kind.id"
                      :value="kind.id"
                    >
                      {{ b.patterns.kinds[kind.id] }}
                    </option>
                  </select>
                </label>
                <div>
                  <span class="builder-label">{{ b.patterns.area }}</span>
                  <div class="flex gap-2">
                    <button
                      v-for="shape in ['rect', 'circle']"
                      :key="shape"
                      type="button"
                      class="builder-chip"
                      :class="{ 'builder-chip--on': current.shape === shape }"
                      :data-pattern-shape="shape"
                      @click="current.shape = shape"
                    >
                      {{ b.patterns[shape] }}
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <label
                    v-for="field in patternFields"
                    :key="field.key"
                    class="builder-field"
                  >
                    <span class="builder-label">{{ field.label }}</span>
                    <span class="builder-input">
                      <input
                        v-model.number="current[field.key]"
                        type="number"
                        :step="field.step"
                        inputmode="decimal"
                        :data-pattern-field="field.key"
                      />
                      <em>{{ field.unit }}</em>
                    </span>
                  </label>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    class="work-button"
                    data-pattern-turn="-15"
                    @click="turn(-15)"
                  >
                    ↺ 15°
                  </button>
                  <button
                    type="button"
                    class="work-button"
                    data-pattern-turn="15"
                    @click="turn(15)"
                  >
                    ↻ 15°
                  </button>
                  <button
                    type="button"
                    class="work-button"
                    data-pattern-center
                    @click="centre"
                  >
                    {{ b.patterns.center }}
                  </button>
                  <button
                    type="button"
                    class="work-button ml-auto"
                    data-variant="danger"
                    data-pattern-remove
                    @click="removePattern(selected)"
                  >
                    {{ b.patterns.remove }}
                  </button>
                </div>
              </div>
            </section>

            <section v-if="powder" class="space-y-3" data-part-paint>
              <p class="builder-legend">{{ b.paint.title }}</p>
              <label
                class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                <input
                  v-model="paint"
                  type="checkbox"
                  class="h-4 w-4"
                  data-part-paint-on
                />
                {{ b.paint.on }}
              </label>
              <template v-if="paint">
                <p class="builder-label">
                  {{ b.paint.color }}:
                  <strong class="text-slate-900 dark:text-white">{{
                    paintLabel
                  }}</strong>
                </p>
                <div class="grid grid-cols-9 gap-1.5">
                  <button
                    v-for="colour in ralColors"
                    :key="colour.code"
                    type="button"
                    class="ral-swatch"
                    :class="{
                      'ral-swatch--on': !customRal && ral === colour.code,
                    }"
                    :style="{ background: colour.hex }"
                    :title="`RAL ${colour.code} · ${ralName(colour)}`"
                    :aria-label="`RAL ${colour.code} ${ralName(colour)}`"
                    :aria-pressed="
                      !customRal && ral === colour.code ? 'true' : 'false'
                    "
                    :data-part-ral="colour.code"
                    @click="pickRal(colour.code)"
                  />
                </div>
                <label class="builder-field">
                  <span class="builder-label">{{ b.paint.custom }}</span>
                  <span class="builder-input">
                    <input
                      v-model="customRal"
                      type="text"
                      maxlength="40"
                      placeholder="RAL 7016"
                      data-part-ral-custom
                    />
                  </span>
                </label>
                <label
                  class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                >
                  <input
                    v-model="primer"
                    type="checkbox"
                    class="h-4 w-4"
                    data-part-primer
                  />
                  {{ b.paint.primer }}
                </label>
                <small class="builder-hint">{{
                  paintKnown ? b.paint.approx : b.paint.unknown
                }}</small>
              </template>
            </section>

            <label
              class="builder-field border-t border-slate-100 pt-4 dark:border-slate-800"
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

          <div
            class="order-first min-w-0 space-y-4 lg:sticky lg:top-0 lg:order-none lg:self-start"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="builder-legend">
                {{ template.bends ? t.flat : t.preview }}
              </p>
              <div class="view-tabs" role="tablist">
                <button
                  v-for="mode in ['flat', 'solid']"
                  :key="mode"
                  type="button"
                  role="tab"
                  class="view-tab"
                  :class="{ 'view-tab--on': view === mode }"
                  :aria-selected="view === mode ? 'true' : 'false'"
                  :data-part-view="mode"
                  @click="view = mode"
                >
                  {{ b.view[mode] }}
                </button>
              </div>
            </div>
            <figure class="builder-preview h-72 sm:h-[26rem]">
              <PartShape
                v-if="view === 'flat' && finalPart"
                :part="finalPart"
                dimensions
                :unit="t.mm"
                :invalid="Boolean(blocking)"
                :label="name(template)"
                :paint="paintHex"
                :patterns="patterns"
                :selected="selected"
                :region-label="b.patterns.title"
                class="h-full w-full"
                @select="selected = $event"
                @move="movePattern"
                @rotate="rotatePattern"
              />
              <PartPreview3D
                v-else-if="finalPart"
                :part="finalPart"
                :thickness="thickness"
                :paint="paintHex"
                :metal="metal"
                :hint="b.view.hint"
                :unavailable="b.view.unavailable"
                :too-many="b.view.tooMany(max3d)"
                class="h-full w-full"
              />
            </figure>
            <p
              v-if="blocking"
              role="alert"
              class="builder-problem"
              data-part-problem
            >
              {{ blockingText }}
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
                  :style="paintHex ? { stroke: paintHex } : null"
                />
                <text
                  v-for="label in profile.labels"
                  :key="label.key"
                  :x="label.x"
                  :y="label.y"
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
                  {{ t.bentNote(mm(thickness), Math.round(values.angle)) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer
        v-if="step === 'material'"
        class="work-modal__footer flex flex-wrap items-center justify-end gap-2"
      >
        <button
          type="button"
          class="work-button"
          data-variant="primary"
          :disabled="!materialReady"
          data-part-material-next
          @click="materialDone"
        >
          {{ b.material.next }}
        </button>
      </footer>
      <footer
        v-else-if="step === 'config'"
        class="work-modal__footer flex flex-wrap items-center justify-end gap-2"
      >
        <!-- On a phone the arrow in the header already leads back. -->
        <span class="hidden sm:inline-flex">
          <button type="button" class="work-button" @click="back">
            {{ t.back }}
          </button>
        </span>
        <button
          type="button"
          class="work-button"
          data-variant="primary"
          :disabled="Boolean(blocking) || !finalPart || !materialReady"
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
import PartPreview3D from '@/components/customer/PartPreview3D.vue'
import { measureDxf } from '@/utils/dxf-measure'
import {
  ANGLES,
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
import {
  MAX_3D_HOLES,
  PATTERNS,
  layPatterns,
  newPattern,
} from '@/utils/part-patterns'
import { RAL_COLORS, ralCode, ralColor, ralName } from '@/utils/ral-colors'
import { builderCopy } from '@/utils/part-builder-copy'

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
// Set by the material step, not typed with the other dimensions.
const SHOWN_APART = ['thickness', ...ANGLES]
// A phone keyboard would cover the preview, so fields take focus on wide screens only.
const wide = () =>
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.('(min-width: 1024px)').matches)

export default {
  name: 'PartTemplateBuilder',
  components: { PartShape, PartPreview3D },
  props: {
    // A template to open after the material instead of the gallery.
    start: { type: String, default: '' },
    workshops: { type: Array, default: () => [] },
    materials: { type: Array, default: () => [] },
    // The material chosen the last time the builder was open.
    initialMaterial: { type: Object, default: null },
  },
  data() {
    const last = this.initialMaterial || {}
    return {
      step: 'material',
      materialId: last.materialId || '',
      thicknessId: last.thicknessId || null,
      customMaterial: last.customMaterial || '',
      customThickness: last.customThickness || '',
      category: 'all',
      query: '',
      template: null,
      values: {},
      quantity: 1,
      part: null,
      metrics: null,
      patterns: [],
      selected: -1,
      picking: false,
      paint: false,
      ral: '9005',
      customRal: '',
      primer: false,
      view: 'flat',
    }
  },
  computed: {
    t() {
      return templateCopy(this.$i18n?.locale)
    },
    b() {
      return builderCopy(this.$i18n?.locale)
    },
    title() {
      if (this.step === 'material') return this.b.material.title
      if (this.step === 'config' && this.template)
        return this.name(this.template)
      return this.t.title
    },
    categories() {
      return CATEGORIES
    },
    kinds() {
      return PATTERNS
    },
    ralColors() {
      return RAL_COLORS
    },
    max3d() {
      return MAX_3D_HOLES
    },
    custom() {
      return this.materialId === 'other' || !this.materials.length
    },
    chosenMaterial() {
      return (
        this.materials.find((m) => String(m.id) === this.materialId) || null
      )
    },
    thickness() {
      if (this.custom) return Number(this.customThickness) || 0
      const choice = (this.chosenMaterial?.thicknesses || []).find(
        (item) => Number(item.id) === Number(this.thicknessId)
      )
      return choice ? Number(choice.thickness) : 0
    },
    materialName() {
      return this.custom
        ? this.customMaterial.trim()
        : this.chosenMaterial?.name || ''
    },
    materialReady() {
      return Boolean(this.materialName) && this.thickness > 0
    },
    materialLabel() {
      return `${this.materialName} · ${mm(this.thickness)} ${this.t.mm}`
    },
    // How the bare metal looks in 3D.
    metal() {
      const name = this.materialName
      if (/aisi|inox|stainless|нерж|չժանգ/i.test(name)) return 'stainless'
      if (/amg|алюм|ալյում|alum|\bal\b/i.test(name)) return 'aluminium'
      return 'steel'
    },
    powder() {
      return this.workshops.find((w) => w.powder) || null
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
    // Each pattern kind on a small sheet, for the picker.
    kindThumbs() {
      const sheet = templateById('blank')
      const base = buildPart(sheet, { width: 60, height: 40, radius: 0 })
      return Object.freeze(
        Object.fromEntries(
          PATTERNS.map((kind) => [
            kind.id,
            Object.freeze(
              layPatterns(base, [
                {
                  kind: kind.id,
                  shape: 'rect',
                  cx: 30,
                  cy: 20,
                  width: 56,
                  height: 36,
                  angle: 0,
                  size: 9,
                  gap: 2.5,
                },
              ]).part
            ),
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
      return this.template.params
        .filter(([key]) => !SHOWN_APART.includes(key))
        .map(([key, , min, max]) => ({
          key,
          min,
          max,
          label: paramLabel(this.t, this.template, key),
          count: COUNTS.includes(key),
          step: COUNTS.includes(key) ? 1 : STEPS[key] || 'any',
          zero: min === 0 ? this.t.zeros[key] || '' : '',
        }))
    },
    angleField() {
      const param = this.template?.params.find(([key]) => key === 'angle')
      if (!param) return null
      return {
        label: paramLabel(this.t, this.template, 'angle'),
        min: param[2],
        max: param[3],
      }
    },
    issue() {
      return this.template ? problem(this.template, this.values) : null
    },
    issueText() {
      return problemText(this.t, this.template, this.issue)
    },
    // The part with its patterns cut in.
    laid() {
      if (!this.part) return null
      return Object.freeze(
        layPatterns(this.part, this.patterns, this.thickness)
      )
    },
    finalPart() {
      return this.laid ? this.laid.part : this.part
    },
    patternIssue() {
      return this.laid?.issues[0] || null
    },
    blocking() {
      return this.issue || this.patternIssue
    },
    blockingText() {
      if (this.issue) return this.issueText
      const issue = this.patternIssue
      if (!issue) return ''
      if (issue.key === 'tooManyHoles') return this.t.problems.tooManyHoles
      const text = this.b.patterns.problems[issue.key]
      const prefix = this.patterns.length > 1 ? `${issue.index + 1}. ` : ''
      return prefix + (typeof text === 'function' ? text(mm(issue.min)) : text)
    },
    current() {
      return this.patterns[this.selected] || null
    },
    patternFields() {
      const p = this.b.patterns
      const round = this.current?.shape === 'circle'
      return [
        {
          key: 'width',
          label: round ? p.diameter : p.width,
          unit: this.t.mm,
          step: 'any',
        },
        ...(round
          ? []
          : [{ key: 'height', label: p.height, unit: this.t.mm, step: 'any' }]),
        { key: 'size', label: p.size, unit: this.t.mm, step: 0.5 },
        { key: 'gap', label: p.gap, unit: this.t.mm, step: 0.5 },
        { key: 'angle', label: p.angle, unit: '°', step: 1 },
        { key: 'cx', label: p.cx, unit: this.t.mm, step: 'any' },
        { key: 'cy', label: p.cy, unit: this.t.mm, step: 'any' },
      ]
    },
    paintEntry() {
      return ralColor(this.customRal.trim() || this.ral)
    },
    paintKnown() {
      return !this.customRal.trim() || Boolean(this.paintEntry)
    },
    // The colour the part is shown in; an unknown code shows a neutral grey.
    paintHex() {
      if (!this.paint) return ''
      return this.paintEntry ? this.paintEntry.hex : '#9aa3ab'
    },
    paintCode() {
      const typed = this.customRal.trim()
      if (typed) return ralCode(typed) ? `RAL ${ralCode(typed)}` : typed
      return `RAL ${this.ral}`
    },
    paintLabel() {
      const name = this.paintEntry
        ? ralName(this.paintEntry, this.$i18n?.locale)
        : ''
      return name ? `${this.paintCode} · ${name}` : this.paintCode
    },
    // A side view of a bent part at its angle, with its outside dimensions.
    profile() {
      if (!this.template?.bends || !this.part) return null
      const v = this.values
      const t = Math.max(Number(this.thickness) || 1, 0.5)
      const alpha = ((Number(v.angle) || 90) * Math.PI) / 180
      let points
      let sides
      if (this.template.id === 'bent-u') {
        const base = Number(v.base)
        const side = Number(v.side)
        const left = [side * Math.cos(alpha), side * Math.sin(alpha)]
        const right = [base - side * Math.cos(alpha), side * Math.sin(alpha)]
        points = [left, [0, 0], [base, 0], right]
        sides = [
          [0, 1, side],
          [1, 2, base],
        ]
      } else {
        const a = Number(v.legA)
        const b = Number(v.legB)
        const turn = Math.PI / 2 - alpha
        points = [
          [0, a],
          [0, 0],
          [b * Math.cos(turn), b * Math.sin(turn)],
        ]
        sides = [
          [0, 1, a],
          [1, 2, b],
        ]
      }
      const xs = points.map((p) => p[0])
      const ys = points.map((p) => p[1])
      const s = Math.max(
        Math.max(...xs) - Math.min(...xs),
        Math.max(...ys) - Math.min(...ys),
        1
      )
      const stroke = Math.max(t, s * 0.035)
      const font = s * 0.14
      const middle = [
        xs.reduce((sum, x) => sum + x, 0) / xs.length,
        ys.reduce((sum, y) => sum + y, 0) / ys.length,
      ]
      // Each size beside its leg, on the side away from the middle of the part.
      const labels = sides.map(([i, j, size], index) => {
        const [p, q] = [points[i], points[j]]
        const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
        const length = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1
        let normal = [-(q[1] - p[1]) / length, (q[0] - p[0]) / length]
        if (
          (mid[0] - middle[0]) * normal[0] + (mid[1] - middle[1]) * normal[1] <
          0
        )
          normal = [-normal[0], -normal[1]]
        const reach = stroke + font * 0.9
        return {
          key: index,
          text: mm(size),
          x: mid[0] + normal[0] * reach,
          y: -(mid[1] + normal[1] * reach),
        }
      })
      const allX = [...xs, ...labels.map((l) => l.x)]
      const allY = [...ys.map((y) => -y), ...labels.map((l) => l.y)]
      const pad = font + stroke
      const minX = Math.min(...allX) - pad
      const minY = Math.min(...allY) - pad
      return {
        d: points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${-y}`).join(''),
        stroke,
        font,
        labels,
        box: `${minX} ${minY} ${Math.max(...allX) + pad - minX} ${
          Math.max(...allY) + pad - minY
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
    // A bent part folds as thick as the material chosen.
    thickness(value) {
      if (
        this.template?.params.some(([key]) => key === 'thickness') &&
        value > 0
      )
        this.$set(this.values, 'thickness', value)
    },
    finalPart() {
      this.measureSoon()
    },
    blocking() {
      this.measureSoon()
    },
  },
  mounted() {
    if (this.materialReady) {
      this.materialDone()
      return
    }
    this.$nextTick(() => this.focus(null))
  },
  beforeDestroy() {
    clearTimeout(this.measureTimer)
  },
  methods: {
    name(item) {
      return this.t.templates[item.id]?.[0] || item.id
    },
    description(item) {
      return this.t.templates[item.id]?.[1] || ''
    },
    ralName(colour) {
      return ralName(colour, this.$i18n?.locale)
    },
    chooseThickness(material, choice) {
      this.materialId = String(material.id)
      this.thicknessId = choice.id
    },
    materialDone() {
      if (!this.materialReady) return
      this.$emit('material', {
        materialId: this.materialId,
        thicknessId: this.thicknessId,
        customMaterial: this.customMaterial,
        customThickness: this.customThickness,
      })
      if (this.template) {
        this.step = 'config'
        return
      }
      const first = this.start ? templateById(this.start) : null
      if (first) this.pick(first)
      else {
        this.step = 'gallery'
        this.$nextTick(() => this.focus(this.$refs.search))
      }
    },
    back() {
      if (this.step === 'config') {
        this.step = 'gallery'
        this.template = null
        this.$nextTick(() => this.focus(this.$refs.search))
      } else this.step = 'material'
    },
    pick(item) {
      this.template = item
      this.step = 'config'
      this.part = null
      this.metrics = null
      this.quantity = 1
      this.patterns = []
      this.selected = -1
      this.picking = false
      const values = { ...defaults(item) }
      if ('thickness' in values && this.thickness > 0)
        values.thickness = this.thickness
      this.values = values
      this.refresh()
      this.$nextTick(() => {
        const first = this.$refs.first
        this.focus(Array.isArray(first) ? first[0] : first)
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
    // The same numbers the server prices with, measured from the DXF itself;
    // a moment after the last change, so dragging a pattern stays smooth.
    measureSoon() {
      clearTimeout(this.measureTimer)
      this.measureTimer = setTimeout(() => {
        const part = this.finalPart
        if (!part || this.blocking) {
          this.metrics = null
          return
        }
        try {
          this.metrics = Object.freeze(measureDxf(toDxf(part)))
        } catch (_) {
          this.metrics = null
        }
      }, 150)
    },
    cellCount(index) {
      return this.laid?.counts[index] || 0
    },
    addPattern(kind) {
      if (!this.part) return
      this.patterns.push(newPattern(this.part, kind, this.thickness))
      this.selected = this.patterns.length - 1
      this.picking = false
    },
    removePattern(index) {
      this.patterns.splice(index, 1)
      this.selected = this.patterns.length
        ? Math.min(index, this.patterns.length - 1)
        : -1
    },
    movePattern({ index, cx, cy }) {
      const pattern = this.patterns[index]
      if (!pattern) return
      pattern.cx = Math.round(cx * 10) / 10
      pattern.cy = Math.round(cy * 10) / 10
    },
    rotatePattern({ index, angle }) {
      const pattern = this.patterns[index]
      if (pattern)
        pattern.angle = (((Math.round(angle) % 360) + 540) % 360) - 180
    },
    turn(step) {
      if (this.current)
        this.rotatePattern({
          index: this.selected,
          angle: (Number(this.current.angle) || 0) + step,
        })
    },
    centre() {
      if (!this.current || !this.part) return
      this.current.cx = Math.round(this.part.width * 5) / 10
      this.current.cy = Math.round(this.part.height * 5) / 10
    },
    pickRal(code) {
      this.ral = code
      this.customRal = ''
    },
    // What the engineer reads: the template's dimensions, then each pattern.
    note(part) {
      const lines = [partNote(this.t, this.template, this.values, part)]
      this.patterns.forEach((pattern, index) => {
        const count = this.cellCount(index)
        if (!count) return
        const round = pattern.shape === 'circle'
        lines.push(
          this.b.patterns.note(index + 1, this.b.patterns.kinds[pattern.kind], {
            size: mm(pattern.size),
            gap: mm(pattern.gap),
            area: round
              ? `Ø${mm(pattern.width)}`
              : `${mm(pattern.width)} × ${mm(pattern.height)}`,
            cx: mm(pattern.cx),
            cy: mm(pattern.cy),
            angle: Math.round(Number(pattern.angle) || 0),
            count,
          })
        )
      })
      return lines.join(' ').slice(0, 2000)
    },
    workshop(code) {
      return this.workshops.find(
        (w) =>
          String(w.value || '')
            .trim()
            .toUpperCase() === code
      )?.id
    },
    add() {
      const part = this.finalPart
      if (this.blocking || !part || !this.materialReady) return
      const file = new File(
        [toDxf(part)],
        partFileName(this.t, this.template, part),
        {
          type: 'application/dxf',
        }
      )
      const fields = {
        quantity: Math.min(
          1000000,
          Math.max(1, Math.round(Number(this.quantity) || 1))
        ),
        note: this.note(part),
      }
      if (this.custom) {
        fields.material = this.materialName
        fields.thickness = this.thickness
      } else fields.pricing_thickness_id = Number(this.thicknessId)
      // Cut on the sheet laser; bent parts are bent and painted ones powder coated too.
      const ids = [
        this.workshop('DXF'),
        this.template.bends ? this.workshop('DLD') : null,
        this.paint && this.powder ? this.powder.id : null,
      ].filter(Boolean)
      if (ids.length) fields.workshop_ids = ids
      if (this.paint && this.powder) {
        fields.paint_ral = this.paintCode
        fields.primer_required = this.primer ? 1 : 0
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
.material-chip {
  @apply inline-flex max-w-[16rem] items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800;
}
.material-card {
  @apply rounded-2xl border border-slate-200 bg-white p-4 transition dark:border-slate-800 dark:bg-slate-900;
}
.material-card--on {
  @apply border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-500;
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
.builder-select {
  @apply block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white;
}
.builder-card {
  @apply flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500;
}
.builder-card--start {
  @apply border-blue-300 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20;
}
.builder-thumb {
  @apply block h-24 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/40;
}
.pattern-kind {
  @apply block w-full rounded-xl border border-slate-200 bg-white p-2 text-center text-slate-600 transition hover:border-amber-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300;
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
  @apply mt-1 block text-[11px] leading-4 text-slate-400;
}
.builder-preview {
  @apply overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900;
}
.view-tabs {
  @apply inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-950/40;
}
.view-tab {
  @apply rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition dark:text-slate-300;
}
.view-tab--on {
  @apply bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white;
}
.ral-swatch {
  @apply aspect-square w-full rounded-lg border border-black/10 shadow-sm transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500;
}
.ral-swatch--on {
  @apply ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900;
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
