<template>
  <svg
    :viewBox="view.box"
    class="part-shape"
    role="img"
    :aria-label="label || null"
    :aria-hidden="label ? null : 'true'"
    preserveAspectRatio="xMidYMid meet"
    data-part-shape
    @pointermove="drag && dragTo($event)"
    @pointerup="drag = null"
    @pointercancel="drag = null"
  >
    <!-- The geometry is in drawing coordinates (y up): flipped once here. -->
    <g ref="geo" :transform="`matrix(1 0 0 -1 0 ${part.height})`">
      <path
        :d="path"
        fill-rule="evenodd"
        class="part-shape__body"
        :class="{ 'part-shape__body--bad': invalid }"
        :style="invalid ? null : paintStyle"
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
      <g
        v-for="region in regions"
        :key="region.index"
        class="part-shape__region"
        :class="{ 'part-shape__region--on': region.index === selected }"
        tabindex="0"
        role="button"
        :aria-label="regionLabel"
        :data-part-pattern="region.index"
        @pointerdown.stop.prevent="start('move', region.index, $event)"
        @keydown="nudge(region.index, $event)"
        @focus="$emit('select', region.index)"
      >
        <circle
          v-if="region.circle"
          :cx="region.circle.cx"
          :cy="region.circle.cy"
          :r="region.circle.r"
          vector-effect="non-scaling-stroke"
        />
        <polygon
          v-else
          :points="region.corners.map((p) => p.join(',')).join(' ')"
          vector-effect="non-scaling-stroke"
        />
      </g>
      <g v-if="handle" class="part-shape__handle">
        <line
          :x1="handle.from[0]"
          :y1="handle.from[1]"
          :x2="handle.at[0]"
          :y2="handle.at[1]"
          vector-effect="non-scaling-stroke"
        />
        <circle
          :cx="handle.at[0]"
          :cy="handle.at[1]"
          :r="handle.r"
          vector-effect="non-scaling-stroke"
          data-part-rotate
          @pointerdown.stop.prevent="start('rotate', selected, $event)"
        />
      </g>
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
import { patternRegion } from '@/utils/part-patterns'
import { isDark } from '@/utils/ral-colors'

export default {
  name: 'PartShape',
  props: {
    // A part from buildPart(): outline, holes and bends from the origin, in mm.
    part: { type: Object, required: true },
    dimensions: Boolean,
    unit: { type: String, default: 'mm' },
    invalid: Boolean,
    label: { type: String, default: '' },
    // The powder coat colour (#rrggbb) to show the part in, if any.
    paint: { type: String, default: '' },
    // Patterns whose areas can be dragged, and turned by their handle.
    patterns: { type: Array, default: () => [] },
    selected: { type: Number, default: -1 },
    regionLabel: { type: String, default: '' },
  },
  data: () => ({ drag: null }),
  computed: {
    path() {
      return svgPath(this.part)
    },
    paintStyle() {
      if (!this.paint) return null
      return {
        fill: this.paint,
        stroke: isDark(this.paint) ? '#cbd5e1' : '#334155',
      }
    },
    scale() {
      return Math.max(this.part.width, this.part.height, 1)
    },
    regions() {
      return this.patterns.map((pattern, index) => ({
        index,
        ...patternRegion(pattern),
      }))
    },
    // The round handle above the chosen area: drag it to turn the pattern.
    handle() {
      const pattern = this.patterns[this.selected]
      if (!pattern) return null
      const turn = ((Number(pattern.angle) || 0) * Math.PI) / 180
      const up = [-Math.sin(turn), Math.cos(turn)]
      const off = this.scale * 0.06
      // From the middle of the area's top side (or the top of its circle), straight up.
      const region = patternRegion(pattern)
      let from
      if (region.circle) {
        const { cx, cy, r } = region.circle
        from = [cx + up[0] * r, cy + up[1] * r]
      } else {
        const [, , c, d] = region.corners
        from = [(c[0] + d[0]) / 2, (c[1] + d[1]) / 2]
      }
      return {
        from,
        at: [from[0] + up[0] * off, from[1] + up[1] * off],
        r: this.scale * 0.018,
      }
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
      // Room above the part for the turning handle of a pattern near its top.
      const top = this.patterns.length ? s * 0.1 : pad
      return {
        box: `${-pad} ${-top} ${x + font * 1.4 + pad} ${y + font * 1.6 + top}`,
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
    // A pointer position in part coordinates (mm, y up).
    local(event) {
      const matrix = this.$refs.geo?.getScreenCTM()
      if (!matrix) return null
      const point = this.$el.createSVGPoint()
      point.x = event.clientX
      point.y = event.clientY
      const p = point.matrixTransform(matrix.inverse())
      return [p.x, p.y]
    },
    start(kind, index, event) {
      const at = this.local(event)
      const pattern = this.patterns[index]
      if (!at || !pattern) return
      this.$emit('select', index)
      event.target.setPointerCapture?.(event.pointerId)
      this.drag = {
        kind,
        index,
        from: at,
        cx: Number(pattern.cx) || 0,
        cy: Number(pattern.cy) || 0,
      }
    },
    dragTo(event) {
      const at = this.local(event)
      const drag = this.drag
      if (!at || !drag) return
      if (drag.kind === 'move') {
        this.$emit('move', {
          index: drag.index,
          cx: Math.round((drag.cx + at[0] - drag.from[0]) * 10) / 10,
          cy: Math.round((drag.cy + at[1] - drag.from[1]) * 10) / 10,
        })
        return
      }
      let angle =
        (Math.atan2(at[1] - drag.cy, at[0] - drag.cx) * 180) / Math.PI - 90
      // Shift turns in 15° steps.
      if (event.shiftKey) angle = Math.round(angle / 15) * 15
      angle = (((Math.round(angle) % 360) + 540) % 360) - 180
      this.$emit('rotate', { index: drag.index, angle })
    },
    // Arrows move a millimetre (ten with Shift); [ and ] turn by 5°.
    nudge(index, event) {
      const pattern = this.patterns[index]
      if (!pattern) return
      const step = event.shiftKey ? 10 : 1
      const moves = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, step],
        ArrowDown: [0, -step],
      }
      if (moves[event.key]) {
        event.preventDefault()
        const [dx, dy] = moves[event.key]
        this.$emit('move', {
          index,
          cx: (Number(pattern.cx) || 0) + dx,
          cy: (Number(pattern.cy) || 0) + dy,
        })
      } else if (event.key === '[' || event.key === ']') {
        event.preventDefault()
        this.$emit('rotate', {
          index,
          angle: (Number(pattern.angle) || 0) + (event.key === ']' ? 5 : -5),
        })
      }
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
.part-shape__region {
  cursor: move;
  outline: none;
  touch-action: none;
}
.part-shape__region circle,
.part-shape__region polygon {
  fill: rgb(245 158 11 / 0.04);
  stroke: #94a3b8;
  stroke-width: 1.25px;
  stroke-dasharray: 5 4;
}
.part-shape__region--on circle,
.part-shape__region--on polygon,
.part-shape__region:focus-visible circle,
.part-shape__region:focus-visible polygon {
  fill: rgb(245 158 11 / 0.08);
  stroke: #f59e0b;
  stroke-width: 2px;
}
.part-shape__handle line {
  stroke: #f59e0b;
  stroke-width: 1.5px;
}
.part-shape__handle circle {
  fill: #fff;
  stroke: #f59e0b;
  stroke-width: 2px;
  cursor: grab;
  touch-action: none;
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
