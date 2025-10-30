<template>
  <div class="w-full h-full relative">
    <button
      class="absolute top-3 right-3 flex items-center justify-center rounded-lg text-sm transition"
      @click="$emit('close')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="30"
        height="30"
        viewBox="0 0 48 48"
        class="hover:animate-pulse"
      >
        <path
          fill="#F44336"
          d="M21.5 4.5H26.501V43.5H21.5z"
          transform="rotate(45.001 24 24)"
        ></path>
        <path
          fill="#F44336"
          d="M21.5 4.5H26.5V43.501H21.5z"
          transform="rotate(135.008 24 24)"
        ></path>
      </svg>
    </button>

    <canvas ref="canvas" class="w-full h-full block"></canvas>

    <div
      v-if="error"
      class="absolute left-2 bottom-2 px-2 py-1 text-xs rounded bg-red-600 text-white"
    >
      DXF սխալ — {{ error }}
    </div>
    <notifications />
  </div>
</template>

<script>
import * as THREE from 'three'
import DxfParser from 'dxf-parser'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default {
  name: 'DxfCanvasViewer',
  props: {
    dxfUrl: { type: String, required: true },
  },
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      dxfGroup: null,
      error: null,
      raf: null,
    }
  },
  watch: {
    dxfUrl() {
      this.loadDxfFile()
    },
  },
  mounted() {
    this.initThree()
    this.loadDxfFile()
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
    this.cleanupThree()
  },
  methods: {
    initThree() {
      const canvas = this.$refs.canvas
      const w = canvas.clientWidth || canvas.parentElement.clientWidth || 960
      const h = canvas.clientHeight || 600
      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 50000)
      this.camera.position.set(0, 0, 500)
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      this.renderer.setClearColor(0xffffff, 1)
      this.renderer.setPixelRatio(window.devicePixelRatio || 1)
      this.renderer.setSize(w, h, false)
      this.controls = new OrbitControls(this.camera, canvas)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.08
      this.controls.enablePan = true
      this.controls.panSpeed = 1.0
      this.controls.screenSpacePanning = true
      const amb = new THREE.AmbientLight(0xffffff, 1)
      this.scene.add(amb)
      const animate = () => {
        this.raf = requestAnimationFrame(animate)
        this.controls.update()
        this.renderer.render(this.scene, this.camera)
      }
      animate()
    },

    onResize() {
      if (!this.renderer || !this.camera) return
      const canvas = this.$refs.canvas
      const w = canvas.clientWidth || canvas.parentElement.clientWidth || 960
      const h = canvas.clientHeight || 600
      this.camera.aspect = w / h
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(w, h, false)
    },

    cleanupThree() {
      if (this.raf) cancelAnimationFrame(this.raf)
      this.controls?.dispose?.()
      this.renderer?.dispose?.()
      if (this.scene) {
        this.scene.traverse((obj) => {
          obj.geometry?.dispose?.()
          if (Array.isArray(obj.material))
            obj.material.forEach((m) => m?.dispose?.())
          else obj.material?.dispose?.()
        })
      }
      this.scene = this.camera = this.renderer = this.controls = null
      this.dxfGroup = null
    },

    async loadDxfFile() {
      try {
        this.error = null
        const { data, status } = await this.$axios.get(
          `/api/factories/getFile/${this.dxfUrl}`
        )
        if (status !== 200) throw new Error(`HTTP ${status}`)
        if (!data || !data.content)
          throw new Error('Ֆայլի բովանդակությունը բացակայում է')
        let dxfText
        try {
          const jsonData = atob(data.content)
          const parsed = JSON.parse(jsonData)
          dxfText = parsed?.content ? atob(parsed.content) : jsonData
        } catch {
          dxfText = atob(data.content)
        }
        this.parseDxf(dxfText)
      } catch (e) {
        this.$notify({
          text: e,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        this.error = e?.message || 'Չհաջողվեց բեռնել'
      }
    },

    parseDxf(dxfText) {
      try {
        const parser = new DxfParser()
        const dxf = parser.parseSync(dxfText)
        if (!dxf?.entities?.length) throw new Error('Դատարկ կամ սխալ DXF')

        if (this.dxfGroup) this.scene.remove(this.dxfGroup)
        this.dxfGroup = new THREE.Group()

        const black = new THREE.LineBasicMaterial({ color: 0x111111 })
        const blue = new THREE.LineBasicMaterial({ color: 0x1e3a8a })

        dxf.entities.forEach((ent) => {
          try {
            if (ent.type === 'LINE' && ent.vertices?.length >= 2) {
              const g = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(ent.vertices[0].x, ent.vertices[0].y, 0),
                new THREE.Vector3(ent.vertices[1].x, ent.vertices[1].y, 0),
              ])
              this.dxfGroup.add(new THREE.LineSegments(g, black))
            } else if (
              (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') &&
              ent.vertices?.length
            ) {
              const pts = ent.vertices.map(
                (v) => new THREE.Vector3(v.x, v.y, 0)
              )
              const g = new THREE.BufferGeometry().setFromPoints(pts)
              this.dxfGroup.add(new THREE.Line(g, blue))
            } else if (ent.type === 'CIRCLE') {
              const geom = new THREE.CircleGeometry(ent.radius, 64)
              geom.translate(ent.center.x, ent.center.y, 0)
              const edges = new THREE.EdgesGeometry(geom)
              this.dxfGroup.add(new THREE.LineSegments(edges, black))
            } else if (ent.type === 'ARC') {
              const a1 = THREE.MathUtils.degToRad(ent.startAngle || 0)
              const a2 = THREE.MathUtils.degToRad(ent.endAngle || 360)
              const curve = new THREE.ArcCurve(
                ent.center.x,
                ent.center.y,
                ent.radius,
                a1,
                a2,
                false
              )
              const pts = curve
                .getPoints(64)
                .map((p) => new THREE.Vector3(p.x, p.y, 0))
              const g = new THREE.BufferGeometry().setFromPoints(pts)
              this.dxfGroup.add(new THREE.Line(g, black))
            }
          } catch {}
        })

        this.scene.add(this.dxfGroup)
        const box = new THREE.Box3().setFromObject(this.dxfGroup)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        this.dxfGroup.position.set(-center.x, -center.y, 0)
        const maxDim = Math.max(size.x, size.y) || 100
        const fov = (this.camera.fov * Math.PI) / 180
        const dist = Math.abs(maxDim / (2 * Math.tan(fov / 2)))
        this.camera.position.set(0, 0, dist * 1.2 + 10)
        this.camera.lookAt(0, 0, 0)
        this.controls?.update()
      } catch (e) {
        this.$notify({
          text: e,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        this.error = e?.message || 'Չհաջողվեց մշակել DXF-ը'
      }
    },
  },
}
</script>
