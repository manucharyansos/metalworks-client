<template>
  <div
    ref="box"
    class="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-950"
    data-part-3d
  >
    <canvas ref="canvas" class="block h-full w-full touch-none" />
    <div
      v-if="!message && stageList.length > 1"
      class="absolute left-2 top-2 inline-flex rounded-xl bg-white/85 p-0.5 shadow-sm backdrop-blur dark:bg-slate-900/80"
      role="tablist"
    >
      <button
        v-for="item in stageList"
        :key="item"
        type="button"
        role="tab"
        class="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition"
        :class="
          stage === item
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
            : 'text-slate-600 dark:text-slate-300'
        "
        :aria-selected="stage === item ? 'true' : 'false'"
        :data-part-stage="item"
        @click="go(item)"
      >
        {{ stages[item] }}
      </button>
    </div>
    <p
      v-if="message"
      class="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-slate-500 dark:text-slate-400"
      role="status"
    >
      {{ message }}
    </p>
    <p
      v-else
      class="pointer-events-none absolute bottom-2 left-3 text-[11px] text-slate-500 dark:text-slate-400"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { MAX_3D_HOLES } from '@/utils/part-patterns'
import { partModel, surface } from '@/utils/part-mesh'

export default {
  name: 'PartPreview3D',
  props: {
    // The flat part (holes and patterns included) and, for a bent one, part.fold.
    part: { type: Object, required: true },
    thickness: { type: Number, default: 2 },
    // A powder coat colour (#rrggbb), or nothing for bare metal.
    paint: { type: String, default: '' },
    metal: { type: String, default: 'steel' },
    hint: { type: String, default: '' },
    unavailable: { type: String, default: '' },
    tooMany: { type: String, default: '' },
    // Names of the steps the part goes through: cut, bent, painted.
    stages: {
      type: Object,
      default: () => ({ cut: 'Cut', bent: 'Bent', painted: 'Painted' }),
    },
  },
  data: () => ({ message: '', stage: '' }),
  computed: {
    stageList() {
      return [
        'cut',
        this.part.fold?.bends?.length ? 'bent' : null,
        this.paint ? 'painted' : null,
      ].filter(Boolean)
    },
  },
  watch: {
    part() {
      this.schedule()
    },
    thickness() {
      this.schedule()
    },
    paint() {
      this.settle()
    },
    metal() {
      this.colour()
    },
  },
  mounted() {
    this.stage = this.stageList[this.stageList.length - 1]
    this.setup()
    this.schedule()
  },
  beforeDestroy() {
    clearTimeout(this.timer)
    cancelAnimationFrame(this.frame)
    const g = this.gl
    if (!g) return
    g.observer?.disconnect()
    g.controls.dispose()
    this.clear()
    g.material.dispose()
    g.environment?.dispose()
    g.renderer.dispose()
    this.gl = null
  },
  methods: {
    setup() {
      let renderer
      try {
        renderer = new THREE.WebGLRenderer({
          canvas: this.$refs.canvas,
          antialias: true,
          alpha: true,
        })
      } catch (_) {
        this.message = this.unavailable
        return
      }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      // Neutral tone mapping keeps a RAL colour close to its sample.
      renderer.toneMapping =
        THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping
      const scene = new THREE.Scene()
      const pmrem = new THREE.PMREMGenerator(renderer)
      const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()
      scene.environment = environment
      scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 0.5))
      const sun = new THREE.DirectionalLight(0xffffff, 1.4)
      sun.position.set(1, 2, 1.5)
      scene.add(sun)
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100000)
      const controls = new OrbitControls(camera, this.$refs.canvas)
      controls.addEventListener('change', () => this.render())
      const material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
      })
      // Three.js objects stay outside Vue's reactivity.
      this.gl = {
        renderer,
        scene,
        camera,
        controls,
        material,
        environment,
        model: null,
        share: 1,
      }
      const observer = new ResizeObserver(() => this.resize())
      observer.observe(this.$refs.box)
      this.gl.observer = observer
      this.colour()
      this.resize()
    },
    schedule() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => this.build(), 120)
    },
    resize() {
      const g = this.gl
      const box = this.$refs.box
      if (!g || !box) return
      const { clientWidth: w, clientHeight: h } = box
      if (!w || !h) return
      g.renderer.setSize(w, h, false)
      g.camera.aspect = w / h
      g.camera.updateProjectionMatrix()
      this.render()
    },
    render() {
      const g = this.gl
      if (g) g.renderer.render(g.scene, g.camera)
    },
    // Paint shows only once the part is painted; before that it is bare metal.
    colour() {
      const g = this.gl
      if (!g) return
      surface(g.material, {
        paint: this.stage === 'painted' ? this.paint : '',
        metal: this.metal,
      })
      this.render()
    },
    // Paint switched on or off: show the part at its last step.
    settle() {
      this.stage = this.stageList[this.stageList.length - 1]
      this.colour()
      this.animate(this.stage === 'cut' ? 0 : 1)
    },
    go(stage) {
      this.stage = stage
      this.colour()
      this.animate(stage === 'cut' ? 0 : 1)
    },
    // Folds or unfolds the part over a moment.
    animate(target) {
      const g = this.gl
      if (!g?.model) return
      cancelAnimationFrame(this.frame)
      const from = g.share
      if (Math.abs(from - target) < 1e-6) return
      const started = performance.now()
      const step = (now) => {
        const k = Math.min(1, (now - started) / 700)
        const eased = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2
        g.share = from + (target - from) * eased
        g.model.pose(g.share)
        this.render()
        if (k < 1) this.frame = requestAnimationFrame(step)
      }
      this.frame = requestAnimationFrame(step)
    },
    clear() {
      const g = this.gl
      if (!g?.model) return
      g.scene.remove(g.model.group)
      g.model.dispose()
      g.model = null
    },
    build() {
      const g = this.gl
      if (!g) return
      cancelAnimationFrame(this.frame)
      this.clear()
      if (this.part.holes.length > MAX_3D_HOLES) {
        this.message = this.tooMany
        this.render()
        return
      }
      this.message = ''
      if (!this.stageList.includes(this.stage))
        this.stage = this.stageList[this.stageList.length - 1]
      const model = partModel(this.part, this.thickness, g.material)
      g.model = model
      g.scene.add(model.group)
      // The camera takes in the part flat and bent, so folding stays in view.
      const bounds = new THREE.Box3()
      model.pose(0)
      bounds.union(new THREE.Box3().setFromObject(model.group))
      model.pose(1)
      bounds.union(new THREE.Box3().setFromObject(model.group))
      g.share = this.stage === 'cut' ? 0 : 1
      model.pose(g.share)
      const centre = bounds.getCenter(new THREE.Vector3())
      const size = bounds.getSize(new THREE.Vector3()).length() || 1
      g.camera.near = size / 100
      g.camera.far = size * 100
      g.camera.position
        .copy(centre)
        .add(
          new THREE.Vector3(0.45, 0.85, 1)
            .normalize()
            .multiplyScalar(size * 1.2)
        )
      g.camera.updateProjectionMatrix()
      g.controls.target.copy(centre)
      g.controls.update()
      this.colour()
    },
  },
}
</script>
