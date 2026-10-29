<template>
  <div
    ref="root"
    class="image-viewer"
    :class="{ 'image-viewer--fullscreen': fullscreen }"
    data-image-viewer
  >
    <div class="image-viewer__toolbar">
      <button
        type="button"
        class="image-viewer__button"
        :aria-label="$t('image_preview.zoom_in')"
        :title="$t('image_preview.zoom_in')"
        @click="zoomBy(1.25)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path stroke-linecap="round" d="M11 8v6M8 11h6M20 20l-4-4" />
        </svg>
      </button>
      <button
        type="button"
        class="image-viewer__button"
        :aria-label="$t('image_preview.zoom_out')"
        :title="$t('image_preview.zoom_out')"
        @click="zoomBy(0.8)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path stroke-linecap="round" d="M8 11h6M20 20l-4-4" />
        </svg>
      </button>
      <button
        type="button"
        class="image-viewer__button"
        :aria-label="$t('image_preview.rotate')"
        :title="$t('image_preview.rotate')"
        @click="rotate"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />
        </svg>
      </button>
      <button
        type="button"
        class="image-viewer__button"
        :aria-label="$t('image_preview.reset')"
        :title="$t('image_preview.reset')"
        @click="reset"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
      </button>
      <span class="image-viewer__zoom" aria-live="polite">{{ Math.round(scale * 100) }}%</span>
      <span class="flex-1"></span>
      <button
        v-if="fullscreenSupported"
        type="button"
        class="image-viewer__button"
        :aria-label="$t(fullscreen ? 'image_preview.exit_fullscreen' : 'image_preview.fullscreen')"
        :title="$t(fullscreen ? 'image_preview.exit_fullscreen' : 'image_preview.fullscreen')"
        @click="toggleFullscreen"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path v-if="!fullscreen" stroke-linecap="round" stroke-linejoin="round" d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" d="M3 8h5V3m8 0v5h5M3 16h5v5m13-5h-5v5" />
        </svg>
      </button>
      <a
        :href="src"
        target="_blank"
        rel="noopener"
        class="image-viewer__button"
        :aria-label="$t('image_preview.open')"
        :title="$t('image_preview.open')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14 4h6v6m0-6-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        </svg>
      </a>
    </div>
    <div
      ref="stage"
      class="image-viewer__stage"
      :class="{ 'image-viewer__stage--dragging': dragging }"
      @wheel.prevent="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
      @dblclick="reset"
    >
      <img
        :src="src"
        :alt="alt"
        draggable="false"
        class="image-viewer__image"
        :style="{ transform }"
        @error="$emit('error')"
      />
    </div>
    <p class="image-viewer__hint">{{ $t('image_preview.hint') }}</p>
  </div>
</template>

<script>
const MIN_SCALE = 0.2
const MAX_SCALE = 8

export default {
  name: 'ImageZoomViewer',
  props: {
    src: { type: String, required: true },
    alt: { type: String, default: '' },
  },
  data: () => ({
    scale: 1,
    x: 0,
    y: 0,
    rotation: 0,
    dragging: false,
    pointers: {},
    pinchDistance: 0,
    fullscreen: false,
    fullscreenSupported: false,
  }),
  computed: {
    transform() {
      return `translate(${this.x}px, ${this.y}px) scale(${this.scale}) rotate(${this.rotation}deg)`
    },
  },
  watch: {
    src() {
      this.reset()
    },
  },
  mounted() {
    this.fullscreenSupported = !!document.fullscreenEnabled
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
  },
  beforeDestroy() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange)
  },
  methods: {
    reset() {
      this.scale = 1
      this.x = 0
      this.y = 0
      this.rotation = 0
    },
    rotate() {
      this.rotation = (this.rotation + 90) % 360
    },
    // Zooms around a point given relative to the stage centre, so the point
    // under the cursor stays in place.
    zoomAround(factor, px = 0, py = 0) {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, this.scale * factor))
      const k = next / this.scale
      this.x = px - (px - this.x) * k
      this.y = py - (py - this.y) * k
      this.scale = next
    },
    zoomBy(factor) {
      this.zoomAround(factor)
    },
    stagePoint(clientX, clientY) {
      const rect = this.$refs.stage.getBoundingClientRect()
      return [clientX - rect.left - rect.width / 2, clientY - rect.top - rect.height / 2]
    },
    onWheel(event) {
      const [px, py] = this.stagePoint(event.clientX, event.clientY)
      this.zoomAround(event.deltaY < 0 ? 1.15 : 1 / 1.15, px, py)
    },
    onPointerDown(event) {
      this.$refs.stage.setPointerCapture?.(event.pointerId)
      this.$set(this.pointers, event.pointerId, { x: event.clientX, y: event.clientY })
      const points = Object.values(this.pointers)
      if (points.length === 2) this.pinchDistance = this.distance(points)
      this.dragging = points.length === 1
    },
    onPointerMove(event) {
      const previous = this.pointers[event.pointerId]
      if (!previous) return
      const current = { x: event.clientX, y: event.clientY }
      const points = Object.values({ ...this.pointers, [event.pointerId]: current })
      if (points.length === 2) {
        const distance = this.distance(points)
        if (this.pinchDistance) {
          const [px, py] = this.stagePoint((points[0].x + points[1].x) / 2, (points[0].y + points[1].y) / 2)
          this.zoomAround(distance / this.pinchDistance, px, py)
        }
        this.pinchDistance = distance
      } else {
        this.x += current.x - previous.x
        this.y += current.y - previous.y
      }
      this.pointers[event.pointerId] = current
    },
    onPointerUp(event) {
      this.$delete(this.pointers, event.pointerId)
      this.pinchDistance = 0
      this.dragging = Object.keys(this.pointers).length === 1
    },
    distance([a, b]) {
      return Math.hypot(a.x - b.x, a.y - b.y)
    },
    async toggleFullscreen() {
      try {
        if (document.fullscreenElement) await document.exitFullscreen()
        else await this.$refs.root.requestFullscreen()
      } catch (_) {}
    },
    onFullscreenChange() {
      this.fullscreen = document.fullscreenElement === this.$refs.root
    },
  },
}
</script>

<style scoped>
.image-viewer {
  @apply flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900;
}
.image-viewer--fullscreen {
  @apply rounded-none border-0;
}
.image-viewer__toolbar {
  @apply flex items-center gap-1 border-b border-slate-200 px-2 py-1.5 dark:border-slate-700;
}
.image-viewer__button {
  @apply inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white;
}
.image-viewer__button svg {
  @apply h-4 w-4;
}
.image-viewer__zoom {
  @apply min-w-[3rem] text-center text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400;
}
.image-viewer__stage {
  @apply relative flex h-[60vh] min-h-[320px] cursor-grab touch-none select-none items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-950;
}
.image-viewer--fullscreen .image-viewer__stage {
  @apply h-auto flex-1;
}
.image-viewer__stage--dragging {
  @apply cursor-grabbing;
}
.image-viewer__image {
  @apply max-h-full max-w-full object-contain transition-transform duration-75;
  transform-origin: center center;
}
.image-viewer__hint {
  @apply px-3 py-1.5 text-center text-xs text-slate-500 dark:text-slate-400;
}
</style>
