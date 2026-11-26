<template>
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
        @click="$emit('select', index)"
      >
        {{ index + 1 }}. {{ label(pattern) }} · {{ count(index) }}
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
    <div v-if="picking" class="space-y-2">
      <p class="builder-label">{{ m.single }}</p>
      <ul class="grid grid-cols-3 gap-2">
        <li v-for="kind in elements" :key="kind">
          <button
            type="button"
            class="pattern-kind"
            :data-part-element-kind="kind"
            @click="addElement(kind)"
          >
            <span class="block h-10">
              <PartShape :part="elementThumbs[kind]" class="h-full w-full" />
            </span>
            <span class="mt-1 block text-[11px] font-semibold leading-4">{{
              m.elements[kind]
            }}</span>
          </button>
        </li>
      </ul>
      <p class="builder-label pt-2">{{ m.fill }}</p>
      <ul class="grid grid-cols-3 gap-2">
        <li v-for="kind in kinds" :key="kind.id">
          <button
            type="button"
            class="pattern-kind"
            :data-part-pattern-kind="kind.id"
            @click="addFill(kind.id)"
          >
            <span class="block h-10">
              <PartShape :part="fillThumbs[kind.id]" class="h-full w-full" />
            </span>
            <span class="mt-1 block text-[11px] font-semibold leading-4">{{
              b.patterns.kinds[kind.id]
            }}</span>
          </button>
        </li>
      </ul>
    </div>

    <div
      v-if="current"
      class="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/60 dark:bg-amber-950/10"
      data-part-pattern-editor
    >
      <template v-if="current.mode === 'array'">
        <label class="builder-field">
          <span class="builder-label">{{ b.patterns.kind }}</span>
          <select
            v-model="current.kind"
            class="builder-select"
            data-pattern-field="kind"
          >
            <option v-for="kind in elements" :key="kind" :value="kind">
              {{ m.elements[kind] }}
            </option>
          </select>
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="layout in layouts"
            :key="layout"
            type="button"
            class="builder-chip"
            :class="{ 'builder-chip--on': current.layout === layout }"
            :data-pattern-layout="layout"
            @click="current.layout = layout"
          >
            {{ m.layouts[layout] }}
          </button>
        </div>
      </template>
      <template v-else>
        <label class="builder-field">
          <span class="builder-label">{{ b.patterns.kind }}</span>
          <select
            v-model="current.kind"
            class="builder-select"
            data-pattern-field="kind"
          >
            <option v-for="kind in kinds" :key="kind.id" :value="kind.id">
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
      </template>
      <div class="grid grid-cols-2 gap-3">
        <label v-for="field in fields" :key="field.key" class="builder-field">
          <span class="builder-label">{{ field.label }}</span>
          <span class="builder-input">
            <input
              v-model.number="current[field.key]"
              type="number"
              :step="field.step"
              :min="field.min"
              inputmode="decimal"
              :data-pattern-field="field.key"
            />
            <em>{{ field.unit }}</em>
          </span>
        </label>
      </div>
      <label
        v-if="current.mode === 'array' && current.layout === 'circle'"
        class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
      >
        <input
          v-model="current.follow"
          type="checkbox"
          class="h-4 w-4"
          data-pattern-field="follow"
        />
        {{ m.array.follow }}
      </label>
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
          @click="$emit('remove', selected)"
        >
          {{ b.patterns.remove }}
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import PartShape from '@/components/customer/PartShape.vue'
import { buildPart, templateById } from '@/utils/part-templates'
import {
  ARRAY_LAYOUTS,
  ELEMENTS,
  PATTERNS,
  layPatterns,
  newElement,
  newPattern,
} from '@/utils/part-patterns'

export default {
  name: 'PartPatternEditor',
  components: { PartShape },
  props: {
    patterns: { type: Array, required: true },
    selected: { type: Number, default: -1 },
    counts: { type: Array, default: () => [] },
    wanted: { type: Array, default: () => [] },
    // The part the patterns go on, before them: new ones are placed on it.
    part: { type: Object, default: null },
    thickness: { type: Number, default: 0 },
    t: { type: Object, required: true },
    b: { type: Object, required: true },
    m: { type: Object, required: true },
  },
  data: () => ({ picking: false }),
  computed: {
    kinds() {
      return PATTERNS
    },
    elements() {
      return ELEMENTS
    },
    layouts() {
      return ARRAY_LAYOUTS
    },
    current() {
      return this.patterns[this.selected] || null
    },
    // Each kind on a small sheet, for the picker.
    fillThumbs() {
      const base = buildPart(templateById('blank'), {
        width: 60,
        height: 40,
        radius: 0,
      })
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
    elementThumbs() {
      const base = buildPart(templateById('blank'), {
        width: 40,
        height: 40,
        radius: 0,
      })
      return Object.freeze(
        Object.fromEntries(
          ELEMENTS.map((kind) => [
            kind,
            Object.freeze(
              layPatterns(base, [
                {
                  mode: 'array',
                  kind,
                  cx: 20,
                  cy: 20,
                  w: 28,
                  h: kind === 'slot' ? 12 : 28,
                  radius: kind === 'rect' ? 5 : 0,
                  count: 1,
                  gap: 2,
                },
              ]).part
            ),
          ])
        )
      )
    },
    fields() {
      const p = this.b.patterns
      const a = this.m.array
      const mm = this.t.mm
      const c = this.current
      if (!c) return []
      if (c.mode === 'array') {
        const list = [
          { key: 'w', label: a.w, unit: mm, step: 'any', min: 0 },
          { key: 'h', label: a.h, unit: mm, step: 'any', min: 0 },
        ]
        if (c.kind === 'rect')
          list.push({
            key: 'radius',
            label: a.radius,
            unit: mm,
            step: 0.5,
            min: 0,
          })
        list.push({ key: 'spin', label: a.spin, unit: '°', step: 1 })
        if (c.layout === 'grid')
          list.push(
            { key: 'rows', label: a.rows, unit: '', step: 1, min: 1 },
            { key: 'cols', label: a.cols, unit: '', step: 1, min: 1 },
            { key: 'dx', label: a.dx, unit: mm, step: 'any', min: 0 },
            { key: 'dy', label: a.dy, unit: mm, step: 'any', min: 0 }
          )
        else {
          list.push({ key: 'count', label: a.count, unit: '', step: 1, min: 1 })
          if (c.layout === 'circle')
            list.push({
              key: 'ring',
              label: a.ring,
              unit: mm,
              step: 'any',
              min: 0,
            })
          else
            list.push({ key: 'dx', label: a.dx, unit: mm, step: 'any', min: 0 })
        }
        list.push(
          { key: 'gap', label: p.gap, unit: mm, step: 0.5, min: 0 },
          { key: 'angle', label: a.angle, unit: '°', step: 1 },
          { key: 'cx', label: p.cx, unit: mm, step: 'any' },
          { key: 'cy', label: p.cy, unit: mm, step: 'any' }
        )
        return list
      }
      const round = c.shape === 'circle'
      return [
        {
          key: 'width',
          label: round ? p.diameter : p.width,
          unit: mm,
          step: 'any',
          min: 0,
        },
        ...(round
          ? []
          : [
              { key: 'height', label: p.height, unit: mm, step: 'any', min: 0 },
            ]),
        { key: 'size', label: p.size, unit: mm, step: 0.5, min: 0 },
        { key: 'gap', label: p.gap, unit: mm, step: 0.5, min: 0 },
        { key: 'angle', label: p.angle, unit: '°', step: 1 },
        { key: 'cx', label: p.cx, unit: mm, step: 'any' },
        { key: 'cy', label: p.cy, unit: mm, step: 'any' },
      ]
    },
  },
  methods: {
    label(pattern) {
      return pattern.mode === 'array'
        ? this.m.elements[pattern.kind]
        : this.b.patterns.kinds[pattern.kind]
    },
    count(index) {
      const kept = this.counts[index] || 0
      const pattern = this.patterns[index]
      if (pattern?.mode === 'array')
        return this.m.array.fitted(kept, this.wanted[index] || 0)
      return this.b.patterns.count(kept)
    },
    addElement(kind) {
      if (!this.part) return
      this.$emit('add', newElement(this.part, kind, this.thickness))
      this.picking = false
    },
    addFill(kind) {
      if (!this.part) return
      this.$emit('add', newPattern(this.part, kind, this.thickness))
      this.picking = false
    },
    turn(step) {
      const c = this.current
      if (!c) return
      c.angle =
        (((Math.round((Number(c.angle) || 0) + step) % 360) + 540) % 360) - 180
    },
    centre() {
      if (!this.current || !this.part) return
      this.current.cx = Math.round(this.part.width * 5) / 10
      this.current.cy = Math.round(this.part.height * 5) / 10
    },
  },
}
</script>
