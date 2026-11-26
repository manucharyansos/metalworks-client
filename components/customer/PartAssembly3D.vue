<template>
  <div
    ref="box"
    class="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-950"
    data-part-assembly
  >
    <canvas
      ref="canvas"
      class="block h-full w-full touch-none"
      @pointerdown="pressed = { x: $event.clientX, y: $event.clientY }"
      @pointerup="pick($event)"
    />
    <span
      v-for="label in labels"
      :key="label.index"
      class="pointer-events-none absolute flex h-6 min-w-[1.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-1.5 text-[11px] font-bold shadow"
      :class="
        label.index === selected
          ? 'bg-blue-600 text-white'
          : 'bg-white/90 text-slate-700 dark:bg-slate-800/90 dark:text-slate-100'
      "
      :style="{ left: `${label.x}px`, top: `${label.y}px` }"
      :data-assembly-label="label.index"
    >
      {{ label.index + 1 }}
    </span>
    <p
      v-if="message"
      class="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-slate-500 dark:text-slate-400"
      role="status"
    >
      {{ message }}
    </p>
    <p
      v-else
      class="pointer-events-none absolute bottom-2 left-3 right-3 text-[11px] text-slate-500 dark:text-slate-400"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { MAX_3D_HOLES } from '@/utils/part-patterns'
import { partModel, surface } from '@/utils/part-mesh'
import { assemble } from '@/utils/part-assembly'

export default {
  name: 'PartAssembly3D',
  props: {
    // Each part as built: { part, thickness, paint, metal }.
    items: { type: Array, required: true },
    placements: { type: Array, default: () => [] },
    mode: { type: String, default: 'edge' },
    selected: { type: Number, default: -1 },
    tool: { type: String, default: 'translate' },
    hint: { type: String, default: '' },
    unavailable: { type: String, default: '' },
    tooMany: { type: String, default: '' },
  },
  data: () => ({ message: '', labels: [], pressed: null }),
  watch: {
    items() {
      this.schedule()
    },
    placements: {
      deep: true,
      handler() {
        this.place()
      },
    },
    mode() {
      this.place(true)
    },
    selected() {
      this.focusSelected()
    },
    tool() {
      this.focusSelected()
    },
  },
  mounted() {
    this.setup()
    this.schedule()
  },
  beforeDestroy() {
    clearTimeout(this.timer)
    const g = this.gl
    if (!g) return
    g.observer?.disconnect()
    g.transform.detach()
    g.transform.dispose()
    g.controls.dispose()
    this.clear()
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
      // Free placement: arrows to move, rings to turn, in 10 mm and 15° steps.
      const transform = new TransformControls(camera, this.$refs.canvas)
      transform.setTranslationSnap(10)
      transform.setRotationSnap(THREE.MathUtils.degToRad(15))
      transform.addEventListener('dragging-changed', (event) => {
        controls.enabled = !event.value
        this.dragging = event.value
      })
      transform.addEventListener('change', () => this.render())
      transform.addEventListener('objectChange', () => {
        const holder = this.gl?.holders[this.selected]
        if (!holder) return
        holder.updateMatrix()
        this.$emit('place', {
          index: this.selected,
          matrix: holder.matrix.toArray(),
        })
      })
      scene.add(transform.getHelper())
      this.gl = {
        renderer,
        scene,
        camera,
        controls,
        transform,
        environment,
        holders: [],
        models: [],
        materials: [],
        boxes: [],
      }
      const observer = new ResizeObserver(() => this.resize())
      observer.observe(this.$refs.box)
      this.gl.observer = observer
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
      if (!g) return
      g.renderer.render(g.scene, g.camera)
      // Numbers over the parts, in screen pixels.
      const box = this.$refs.box
      if (!box) return
      const [w, h] = [box.clientWidth, box.clientHeight]
      this.labels = g.holders.map((holder, index) => {
        const centre = new THREE.Box3()
          .setFromObject(holder)
          .getCenter(new THREE.Vector3())
          .project(g.camera)
        return {
          index,
          x: ((centre.x + 1) / 2) * w,
          y: ((1 - centre.y) / 2) * h,
        }
      })
    },
    clear() {
      const g = this.gl
      if (!g) return
      g.transform.detach()
      for (const holder of g.holders) g.scene.remove(holder)
      for (const model of g.models) model.dispose()
      for (const material of g.materials) material.dispose()
      Object.assign(g, { holders: [], models: [], materials: [], boxes: [] })
    },
    build() {
      const g = this.gl
      if (!g) return
      this.clear()
      if (this.items.some((item) => item.part.holes.length > MAX_3D_HOLES)) {
        this.message = this.tooMany
        this.render()
        return
      }
      this.message = ''
      for (const item of this.items) {
        const material = surface(
          new THREE.MeshStandardMaterial({ side: THREE.DoubleSide }),
          item
        )
        const model = partModel(item.part, item.thickness, material)
        model.pose(1)
        const holder = new THREE.Group()
        holder.add(model.group)
        holder.updateMatrixWorld(true)
        g.boxes.push(new THREE.Box3().setFromObject(holder))
        g.scene.add(holder)
        g.holders.push(holder)
        g.models.push(model)
        g.materials.push(material)
      }
      this.place(true)
    },
    // Each part where its placement puts it; `fit` aims the camera at them all.
    place(fit = false) {
      const g = this.gl
      if (!g || !g.holders.length || this.dragging) return
      const matrices = assemble(
        g.boxes,
        this.items.map((item) => item.thickness),
        this.placements,
        this.mode
      )
      g.holders.forEach((holder, i) => {
        matrices[i].decompose(holder.position, holder.quaternion, holder.scale)
        holder.updateMatrixWorld(true)
      })
      if (fit) this.fit()
      this.focusSelected()
    },
    fit() {
      const g = this.gl
      const bounds = new THREE.Box3()
      for (const holder of g.holders)
        bounds.union(new THREE.Box3().setFromObject(holder))
      if (bounds.isEmpty()) return
      // Far enough back for the whole assembly (its bounding sphere) to fit
      // the narrower of the two view angles, so walls are never cut off.
      const sphere = bounds.getBoundingSphere(new THREE.Sphere())
      const radius = sphere.radius || 1
      const vertical = THREE.MathUtils.degToRad(g.camera.fov)
      const horizontal =
        2 * Math.atan(Math.tan(vertical / 2) * (g.camera.aspect || 1))
      const distance = radius / Math.sin(Math.min(vertical, horizontal) / 2)
      g.camera.near = distance / 100
      g.camera.far = distance * 100
      g.camera.position
        .copy(sphere.center)
        .add(
          new THREE.Vector3(0.6, 0.8, 1).normalize().multiplyScalar(distance)
        )
      g.camera.updateProjectionMatrix()
      g.controls.target.copy(sphere.center)
      g.controls.update()
    },
    // The chosen part glows a little; in free mode it carries the handles.
    focusSelected() {
      const g = this.gl
      if (!g) return
      g.materials.forEach((material, i) => {
        material.emissive = new THREE.Color(
          i === this.selected ? 0x1d4ed8 : 0x000000
        )
        material.emissiveIntensity = i === this.selected ? 0.25 : 0
      })
      const holder = g.holders[this.selected]
      if (this.mode === 'free' && holder) {
        g.transform.setMode(this.tool === 'rotate' ? 'rotate' : 'translate')
        g.transform.attach(holder)
      } else g.transform.detach()
      this.render()
    },
    // A click (not a drag) on a part picks it.
    pick(event) {
      const g = this.gl
      const start = this.pressed
      this.pressed = null
      if (!g || !start || this.dragging) return
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4)
        return
      const rect = this.$refs.canvas.getBoundingClientRect()
      const pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      )
      const ray = new THREE.Raycaster()
      ray.setFromCamera(pointer, g.camera)
      const hit = ray.intersectObjects(g.holders, true)[0]
      if (!hit) return
      const index = g.holders.findIndex((holder) => {
        let node = hit.object
        while (node && node !== holder) node = node.parent
        return node === holder
      })
      if (index >= 0) this.$emit('select', index)
    },
  },
}
</script>
