<template>
  <div
    ref="box"
    class="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-950"
    data-part-3d
  >
    <canvas ref="canvas" class="block h-full w-full touch-none" />
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
import { samplePolygon } from '@/utils/part-templates'
import { MAX_3D_HOLES } from '@/utils/part-patterns'

// Unpainted metals: colour, how metallic and how rough the surface looks.
const METALS = {
  steel: { color: 0x8c949c, metalness: 0.7, roughness: 0.42 },
  stainless: { color: 0xc5cad0, metalness: 0.85, roughness: 0.28 },
  aluminium: { color: 0xd3d7db, metalness: 0.75, roughness: 0.35 },
}

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
  },
  data: () => ({ message: '' }),
  watch: {
    part() {
      this.schedule()
    },
    thickness() {
      this.schedule()
    },
    paint() {
      this.colour()
    },
    metal() {
      this.colour()
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
        group: null,
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
    colour() {
      const g = this.gl
      if (!g) return
      const look = this.paint
        ? {
            color: new THREE.Color(this.paint),
            metalness: 0.15,
            roughness: 0.55,
          }
        : { ...(METALS[this.metal] || METALS.steel) }
      g.material.color = new THREE.Color(look.color)
      g.material.metalness = look.metalness
      g.material.roughness = look.roughness
      g.material.needsUpdate = true
      this.render()
    },
    clear() {
      const g = this.gl
      if (!g?.group) return
      g.group.traverse((node) => node.geometry?.dispose())
      g.scene.remove(g.group)
      g.group = null
    },
    build() {
      const g = this.gl
      if (!g) return
      this.clear()
      if (this.part.holes.length > MAX_3D_HOLES) {
        this.message = this.tooMany
        this.render()
        return
      }
      this.message = ''
      const t = Math.max(
        0.5,
        Number(this.part.fold?.thickness || this.thickness) || 2
      )
      const group = new THREE.Group()
      const folding = this.part.fold?.bends?.length
        ? folded(this.part, t)
        : null
      const geometries = folding ? folding.geometries : [flat(this.part, t)]
      for (const geometry of geometries)
        group.add(new THREE.Mesh(geometry, g.material))
      // A bent part stands on its middle panel: the base of a channel, the
      // second flange of an angle, so it opens upwards.
      if (folding) group.rotation.z = -folding.level
      group.updateMatrixWorld(true)
      // Centred on the origin, then the camera looks at it from the front, a little above.
      const bounds = new THREE.Box3().setFromObject(group)
      const centre = bounds.getCenter(new THREE.Vector3())
      group.position.sub(centre)
      g.scene.add(group)
      g.group = group
      const size = bounds.getSize(new THREE.Vector3()).length() || 1
      g.camera.near = size / 100
      g.camera.far = size * 100
      g.camera.position
        .set(0.45, 0.85, 1)
        .normalize()
        .multiplyScalar(size * 1.2)
      g.camera.updateProjectionMatrix()
      g.controls.target.set(0, 0, 0)
      g.controls.update()
      this.render()
    },
  },
}

function shape(points) {
  const s = new THREE.Shape()
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
  s.closePath()
  return s
}

function path(points) {
  const p = new THREE.Path()
  points.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)))
  p.closePath()
  return p
}

// A flat part: the outline with its holes, as thick as the sheet, lying flat.
function flat(part, t) {
  const s = shape(samplePolygon(part.outline, 24))
  for (const hole of part.holes) s.holes.push(path(samplePolygon(hole, 10)))
  const geometry = new THREE.ExtrudeGeometry(s, {
    depth: t,
    bevelEnabled: false,
  })
  geometry.rotateX(-Math.PI / 2)
  return geometry
}

// A bent part: flat panels between the bends, each bend a curved strip, the
// profile walked from one end with every bend turning upwards.
function folded(part, t) {
  const { radius = t, bends } = part.fold
  const width = part.height
  const zones = [...bends].sort((a, b) => a.x - b.x)
  const holes = part.holes.map((hole) => samplePolygon(hole, 10))
  const out = []
  const headings = []
  let at = new THREE.Vector2(0, 0)
  let heading = 0
  let from = 0
  const panel = (u, v) => {
    const length = v - u
    if (length <= 1e-6) return
    const s = shape([
      [0, 0],
      [length, 0],
      [length, width],
      [0, width],
    ])
    for (const points of holes) {
      if (points.every(([x]) => x >= u - 1e-6 && x <= v + 1e-6))
        s.holes.push(path(points.map(([x, y]) => [x - u, y])))
    }
    const geometry = new THREE.ExtrudeGeometry(s, {
      depth: t,
      bevelEnabled: false,
    })
    const d = new THREE.Vector3(Math.cos(heading), Math.sin(heading), 0)
    const n = new THREE.Vector3(-Math.sin(heading), Math.cos(heading), 0)
    // Along the profile, across the width (into the screen) and through the thickness.
    const matrix = new THREE.Matrix4().makeBasis(
      d,
      new THREE.Vector3(0, 0, -1),
      n
    )
    matrix.setPosition(at.x - (n.x * t) / 2, at.y - (n.y * t) / 2, 0)
    geometry.applyMatrix4(matrix)
    out.push(geometry)
    headings.push(heading)
    at = at.clone().add(new THREE.Vector2(d.x * length, d.y * length))
  }
  for (const bend of zones) {
    panel(from, bend.x - bend.allowance / 2)
    const middle = radius + t / 2
    const centre = at
      .clone()
      .add(
        new THREE.Vector2(
          -Math.sin(heading) * middle,
          Math.cos(heading) * middle
        )
      )
    const a0 = heading - Math.PI / 2
    const a1 = a0 + bend.turn
    const s = new THREE.Shape()
    s.moveTo(
      centre.x + (radius + t) * Math.cos(a0),
      centre.y + (radius + t) * Math.sin(a0)
    )
    s.absarc(centre.x, centre.y, radius + t, a0, a1, false)
    s.lineTo(centre.x + radius * Math.cos(a1), centre.y + radius * Math.sin(a1))
    s.absarc(centre.x, centre.y, radius, a1, a0, true)
    s.closePath()
    const geometry = new THREE.ExtrudeGeometry(s, {
      depth: width,
      bevelEnabled: false,
      curveSegments: 24,
    })
    geometry.translate(0, 0, -width)
    out.push(geometry)
    at = new THREE.Vector2(
      centre.x + middle * Math.cos(a1),
      centre.y + middle * Math.sin(a1)
    )
    heading += bend.turn
    from = bend.x + bend.allowance / 2
  }
  panel(from, part.width)
  return {
    geometries: out,
    level: headings[Math.floor(headings.length / 2)] || 0,
  }
}
</script>
