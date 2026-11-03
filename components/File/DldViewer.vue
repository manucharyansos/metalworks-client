<template>
  <section class="dld-viewer">
    <p v-if="failed" role="alert">{{ labels.error }}</p>
    <template v-else-if="drawing">
      <div class="dld-toolbar">
        <strong>{{ labels.title }}</strong>
        <div>
          <button type="button" :aria-label="labels.out" @click="zoom(1.4)">
            −
          </button>
          <button
            type="button"
            :aria-label="labels.into"
            @click="zoom(1 / 1.4)"
          >
            +
          </button>
          <button type="button" @click="reset">{{ labels.fit }}</button>
        </div>
      </div>
      <svg
        ref="canvas"
        :viewBox="viewBox"
        role="img"
        :aria-label="drawing.name || labels.title"
        @pointerdown="startPan"
        @pointermove="pan"
        @pointerup="stopPan"
        @pointercancel="stopPan"
        @lostpointercapture="stopPan"
        @wheel.prevent="zoom($event.deltaY > 0 ? 1.15 : 1 / 1.15)"
      >
        <title>{{ drawing.name }}</title>
        <path
          v-for="(part, index) in drawing.parts"
          :key="index"
          :d="part.path"
          fill-rule="evenodd"
        >
          <title>{{ part.name }}</title>
        </path>
      </svg>
      <p>
        {{ drawing.material
        }}<span v-if="drawing.thickness"> · {{ drawing.thickness }} mm</span>
      </p>
      <p class="dld-note">{{ labels.note }}</p>
      <details v-if="drawing.bends.length">
        <summary>{{ labels.bends }}</summary>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>{{ labels.angle }} (°)</th>
              <th>{{ labels.length }} (mm)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in drawing.bends" :key="row.step">
              <td>{{ row.step }}</td>
              <td>{{ row.angle }}</td>
              <td>{{ row.length }}</td>
            </tr>
          </tbody>
        </table>
      </details>
    </template>
  </section>
</template>
<script>
import { parseDld } from '~/utils/dld-preview'
const copy = {
  hy: {
    title: 'DLD · 2D գծագիր',
    fit: 'Ամբողջությամբ',
    into: 'Մեծացնել',
    out: 'Փոքրացնել',
    error:
      'Այս DLD ֆայլի գծագիրը հնարավոր չէ ցուցադրել։ Կարող եք ներբեռնել ֆայլը։',
    note: 'Ֆայլում պահված եզրագծերն ու անցքերը։ Կռված 3D տեսքը և կռման գոտիները չեն հաշվարկվում։ Տեղաշարժելու համար քաշեք պատկերը։',
    bends: 'Կռման քայլեր',
    angle: 'Անկյուն',
    length: 'Երկարություն',
  },
  ru: {
    title: 'DLD · 2D чертёж',
    fit: 'Вписать',
    into: 'Увеличить',
    out: 'Уменьшить',
    error: 'Не удалось показать чертёж DLD. Вы можете скачать файл.',
    note: 'Сохранённые контуры и отверстия. Согнутая 3D модель и зоны гибки не рассчитываются. Перетаскивайте изображение для перемещения.',
    bends: 'Шаги гибки',
    angle: 'Угол',
    length: 'Длина',
  },
  en: {
    title: 'DLD · 2D drawing',
    fit: 'Fit',
    into: 'Zoom in',
    out: 'Zoom out',
    error: 'This DLD drawing cannot be displayed. You can download the file.',
    note: 'Stored contours and holes. Folded 3D geometry and bend zones are not calculated. Drag to pan.',
    bends: 'Bend steps',
    angle: 'Angle',
    length: 'Length',
  },
}
export default {
  props: { text: { type: String, required: true } },
  data: () => ({ drawing: null, failed: false, box: null, drag: null }),
  computed: {
    labels() {
      return copy[this.$i18n?.locale] || copy.hy
    },
    viewBox() {
      return this.box
        ? [this.box.x, this.box.y, this.box.w, this.box.h].join(' ')
        : '0 0 1 1'
    },
  },
  watch: {
    text() {
      this.load()
    },
  },
  mounted() {
    this.load()
  },
  methods: {
    load() {
      this.drawing = null
      this.failed = false
      this.drag = null
      try {
        this.drawing = Object.freeze(parseDld(this.text))
        this.reset()
      } catch (_) {
        this.failed = true
      }
    },
    reset() {
      if (!this.drawing) return
      const b = this.drawing.bounds
      const w = Math.max(1, b.maxX - b.minX)
      const h = Math.max(1, b.maxY - b.minY)
      this.box = {
        x: b.minX - w * 0.05,
        y: b.minY - h * 0.05,
        w: w * 1.1,
        h: h * 1.1,
      }
      this.drag = null
    },
    zoom(factor) {
      if (!this.box) return
      const w = this.box.w * factor
      const h = this.box.h * factor
      const original =
        Math.max(1, this.drawing.bounds.maxX - this.drawing.bounds.minX) * 1.1
      if (w < original / 64 || w > original * 8) return
      this.box = {
        x: this.box.x + (this.box.w - w) / 2,
        y: this.box.y + (this.box.h - h) / 2,
        w,
        h,
      }
    },
    startPan(event) {
      if (this.drag || event.button !== 0) return
      const rect = this.$refs.canvas.getBoundingClientRect()
      this.drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        box: { ...this.box },
        scale: Math.max(this.box.w / rect.width, this.box.h / rect.height),
      }
      this.$refs.canvas.setPointerCapture(event.pointerId)
    },
    pan(event) {
      if (!this.drag || event.pointerId !== this.drag.id) return
      const d = this.drag
      this.box = {
        ...d.box,
        x: d.box.x - (event.clientX - d.x) * d.scale,
        y: d.box.y - (event.clientY - d.y) * d.scale,
      }
    },
    stopPan() {
      this.drag = null
    },
  },
}
</script>
<style scoped>
.dld-viewer {
  padding: 16px;
  min-width: 0;
  color: #334155;
  background: #f8fafc;
  border-radius: 12px;
}
.dld-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
button {
  min-width: 44px;
  min-height: 44px;
  margin: 2px;
  padding: 6px 10px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}
button:focus-visible {
  outline: 2px solid #2563eb;
}
svg {
  width: 100%;
  height: 440px;
  height: clamp(280px, 55vh, 540px);
  display: block;
  background: white;
  border: 1px solid #e2e8f0;
  margin: 12px 0;
  touch-action: none;
  cursor: grab;
}
svg:active {
  cursor: grabbing;
}
path {
  fill: #dbeafe;
  stroke: #1d4ed8;
  stroke-width: 1.25px;
  vector-effect: non-scaling-stroke;
}
p {
  overflow-wrap: anywhere;
  font-size: 13px;
  margin-top: 8px;
}
.dld-note {
  color: #64748b;
}
details {
  margin-top: 12px;
}
summary {
  cursor: pointer;
}
table {
  width: 100%;
  font-size: 13px;
  margin-top: 8px;
}
th,
td {
  padding: 6px;
  text-align: start;
  border-bottom: 1px solid #e2e8f0;
}
</style>
