<template>
  <svg
    :viewBox="view.box"
    class="part-shape"
    role="img"
    :aria-label="label || null"
    :aria-hidden="label ? null : 'true'"
    preserveAspectRatio="xMidYMid meet"
    data-part-shape
  >
    <!-- The geometry is in drawing coordinates (y up): flipped once here. -->
    <g :transform="`matrix(1 0 0 -1 0 ${part.height})`">
      <path
        :d="path"
        fill-rule="evenodd"
        class="part-shape__body"
        :class="{ 'part-shape__body--bad': invalid }"
        vector-effect="non-scaling-stroke"
      />
      <line
        v-for="(bend, index) in part.bends"
        :key="index"
        :x1="bend.x1"
        :y1="bend.y1"
        :x2="bend.x2"
        :y2="bend.y2"
        class="part-shape__bend"
        vector-effect="non-scaling-stroke"
      />
    </g>
    <g v-if="dimensions" class="part-shape__dims">
      <path :d="view.lines" vector-effect="non-scaling-stroke" />
      <text
        :x="part.width / 2"
        :y="view.widthText"
        :font-size="view.font"
        text-anchor="middle"
        data-part-width
      >
        {{ size(part.width) }}
      </text>
      <text
        :transform="`translate(${view.heightText} ${
          part.height / 2
        }) rotate(-90)`"
        :font-size="view.font"
        text-anchor="middle"
        data-part-height
      >
        {{ size(part.height) }}
      </text>
    </g>
  </svg>
</template>

<script>
import { svgPath } from '@/utils/part-templates'
import { mm } from '@/utils/part-template-copy'

export default {
  name: 'PartShape',
  props: {
    // A part from buildPart(): outline, holes and bends from the origin, in mm.
    part: { type: Object, required: true },
    dimensions: Boolean,
    unit: { type: String, default: 'mm' },
    invalid: Boolean,
    label: { type: String, default: '' },
  },
  computed: {
    path() {
      return svgPath(this.part)
    },
    view() {
      const { width: w, height: h } = this.part
      const s = Math.max(w, h, 1)
      if (!this.dimensions) {
        const pad = s * 0.04
        return { box: `${-pad} ${-pad} ${w + 2 * pad} ${h + 2 * pad}` }
      }
      // Overall width under the part and height to its right, in screen
      // coordinates (y down), sized from the larger side so text stays legible.
      const font = s * 0.05
      const gap = s * 0.07
      const tick = font * 0.35
      const pad = s * 0.03
      const y = h + gap
      const x = w + gap
      const slash = (px, py) =>
        `M${px - tick} ${py + tick}L${px + tick} ${py - tick}`
      const lines = [
        `M0 ${h + gap * 0.25}V${y + tick}M${w} ${h + gap * 0.25}V${y + tick}`,
        `M${-tick} ${y}H${w + tick}`,
        slash(0, y),
        slash(w, y),
        `M${w + gap * 0.25} 0H${x + tick}M${w + gap * 0.25} ${h}H${x + tick}`,
        `M${x} ${-tick}V${h + tick}`,
        slash(x, 0),
        slash(x, h),
      ].join('')
      return {
        box: `${-pad} ${-pad} ${x + font * 1.4 + pad} ${y + font * 1.6 + pad}`,
        lines,
        font,
        widthText: y + font * 1.25,
        heightText: x + font * 1.1,
      }
    },
  },
  methods: {
    size(value) {
      return `${mm(value)} ${this.unit}`
    },
  },
}
</script>

<style scoped>
.part-shape {
  display: block;
  overflow: visible;
}
.part-shape__body {
  fill: rgb(37 99 235 / 12%);
  stroke: #2563eb;
  stroke-width: 1.5px;
  stroke-linejoin: round;
}
.part-shape__body--bad {
  fill: rgb(225 29 72 / 10%);
  stroke: #e11d48;
}
.part-shape__bend {
  stroke: #dc2626;
  stroke-width: 1.5px;
  stroke-dasharray: 6 4;
}
.part-shape__dims {
  color: #64748b;
  fill: none;
  stroke: currentColor;
  stroke-width: 1px;
}
.part-shape__dims text {
  fill: currentColor;
  stroke: none;
  font-weight: 600;
}
/* The app's dark theme is a .dark class on the page, as for the Tailwind dark: classes. */
.dark .part-shape__body {
  fill: rgb(96 165 250 / 14%);
  stroke: #60a5fa;
}
.dark .part-shape__body--bad {
  fill: rgb(251 113 133 / 12%);
  stroke: #fb7185;
}
.dark .part-shape__dims {
  color: #94a3b8;
}
</style>
