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
      const w = canvas.clientWidth || 960
      const h = canvas.clientHeight || 600

      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 50000)
      this.camera.position.set(0, 0, 500)

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      this.renderer.setClearColor(0xffffff, 1)
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(w, h, false)

      this.controls = new OrbitControls(this.camera, canvas)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.08

      this.scene.add(new THREE.AmbientLight(0xffffff, 1))

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
      const w = canvas.clientWidth || 960
      const h = canvas.clientHeight || 600
      this.camera.aspect = w / h
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(w, h, false)
    },

    cleanupThree() {
      if (this.raf) cancelAnimationFrame(this.raf)
      this.controls?.dispose()
      this.renderer?.dispose()
      if (this.dxfGroup) {
        this.dxfGroup.traverse((obj) => {
          obj.geometry?.dispose()
          if (Array.isArray(obj.material))
            obj.material.forEach((m) => m?.dispose())
          else obj.material?.dispose()
        })
      }
      this.scene =
        this.camera =
        this.renderer =
        this.controls =
        this.dxfGroup =
          null
    },

    async loadDxfFile() {
      try {
        this.error = null
        this.cleanupThree()
        this.initThree() // կրկին ստեղծում ենք scene-ը

        const { data, status } = await this.$axios.get(
          `/api/factories/getFile/${this.dxfUrl}`
        )
        if (status !== 200) throw new Error(`HTTP ${status}`)

        let dxfText = atob(data.content)
        try {
          const parsed = JSON.parse(dxfText)
          dxfText = parsed?.content ? atob(parsed.content) : dxfText
        } catch {
          /* ուղիղ base64 */
        }

        this.parseDxf(dxfText)
      } catch (e) {
        console.error(e)
        this.error = e.message || 'Չհաջողվեց բեռնել DXF-ը'
        this.$notify({ text: this.error, type: 'error', duration: 4000 })
      }
    },

    parseDxf(dxfText) {
      try {
        const parser = new DxfParser()
        const dxf = parser.parseSync(dxfText)

        if (this.dxfGroup) this.scene.remove(this.dxfGroup)
        this.dxfGroup = new THREE.Group()

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 })
        const blueMaterial = new THREE.LineBasicMaterial({ color: 0x1e40af })

        // Հիմնական ֆունկցիա՝ ցանկացած entity ավելացնելու համար
        const addEntity = (ent, targetGroup = this.dxfGroup) => {
          try {
            // LINE
            if (ent.type === 'LINE') {
              const pts = [
                new THREE.Vector3(ent.vertices[0].x, ent.vertices[0].y, 0),
                new THREE.Vector3(ent.vertices[1].x, ent.vertices[1].y, 0),
              ]
              const geom = new THREE.BufferGeometry().setFromPoints(pts)
              targetGroup.add(new THREE.Line(geom, lineMaterial))

              // LWPOLYLINE & POLYLINE
            } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
              if (!ent.vertices || ent.vertices.length < 2) return
              const pts = ent.vertices.map(
                (v) => new THREE.Vector3(v.x, v.y, 0)
              )
              if (ent.closed || ent.shape) pts.push(pts[0])
              const geom = new THREE.BufferGeometry().setFromPoints(pts)
              targetGroup.add(new THREE.Line(geom, lineMaterial))

              // CIRCLE
            } else if (ent.type === 'CIRCLE') {
              const geom = new THREE.CircleGeometry(ent.radius, 64)
              geom.translate(ent.center.x, ent.center.y, 0)
              const edges = new THREE.EdgesGeometry(geom)
              targetGroup.add(new THREE.LineSegments(edges, lineMaterial))

              // ARC
            } else if (ent.type === 'ARC') {
              const start = THREE.MathUtils.degToRad(ent.startAngle)
              const end = THREE.MathUtils.degToRad(ent.endAngle)
              const curve = new THREE.ArcCurve(
                ent.center.x,
                ent.center.y,
                ent.radius,
                start,
                end,
                end < start
              )
              const pts = curve
                .getPoints(64)
                .map((p) => new THREE.Vector3(p.x, p.y, 0))
              const geom = new THREE.BufferGeometry().setFromPoints(pts)
              targetGroup.add(new THREE.Line(geom, lineMaterial))

              // SPLINE — շատ կարևոր է
            } else if (
              ent.type === 'SPLINE' &&
              ent.controlPoints?.length >= 2
            ) {
              const pts = ent.controlPoints.map(
                (p) => new THREE.Vector3(p.x, p.y, 0)
              )
              const curve = new THREE.CatmullRomCurve3(pts)
              curve.tension = 0.5
              const splinePts = curve.getPoints(100)
              const geom = new THREE.BufferGeometry().setFromPoints(splinePts)
              targetGroup.add(new THREE.Line(geom, blueMaterial))

              // ELLIPSE
            } else if (ent.type === 'ELLIPSE') {
              const curve = new THREE.EllipseCurve(
                ent.center.x,
                ent.center.y,
                ent.majorRadius,
                ent.minorRadius,
                ent.startAngle || 0,
                ent.endAngle || Math.PI * 2,
                false,
                0
              )
              const pts = curve
                .getPoints(100)
                .map((p) => new THREE.Vector3(p.x, p.y, 0))
              const geom = new THREE.BufferGeometry().setFromPoints(pts)
              targetGroup.add(new THREE.Line(geom, lineMaterial))

              // INSERT — ամենակարևորը!!!
            } else if (ent.type === 'INSERT' && dxf.blocks?.[ent.name]) {
              const block = dxf.blocks[ent.name]
              const blockGroup = new THREE.Group()

              block.entities?.forEach((subEnt) => addEntity(subEnt, blockGroup))

              // Դիրք, ռոտացիա, սկեյլ
              if (ent.position)
                blockGroup.position.set(ent.position.x, ent.position.y, 0)
              if (ent.rotation)
                blockGroup.rotation.z = THREE.MathUtils.degToRad(ent.rotation)
              if (ent.scale) {
                blockGroup.scale.set(
                  ent.scale.x || 1,
                  ent.scale.y || 1,
                  ent.scale.z || 1
                )
              }

              targetGroup.add(blockGroup)
            }

            // Եթե ուզում ես նաև TEXT տեսնել (ոչ պարտադիր)
            // } else if (ent.type === 'TEXT' || ent.type === 'MTEXT') {
            //   // կարող ես ավելացնել sprite կամ canvas texture
            //   // բայց սկզբում բավական է անտեսել
            // }
          } catch (e) {
            console.warn('Entity error:', ent.type, e)
          }
        }

        // 1. Model space entities
        dxf.entities?.forEach((ent) => addEntity(ent))

        // 2. Եթե model space-ում ոչինչ չկա → *Model_Space block-ը
        if (this.dxfGroup.children.length === 0) {
          const modelBlock =
            dxf.blocks?.['*Model_Space'] || dxf.blocks?.['*Paper_Space']
          modelBlock?.entities?.forEach((ent) => addEntity(ent))
        }

        this.scene.add(this.dxfGroup)

        // Auto zoom
        if (this.dxfGroup.children.length > 0) {
          const box = new THREE.Box3().setFromObject(this.dxfGroup)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())
          this.dxfGroup.position.sub(center)

          const maxDim = Math.max(size.x, size.y) || 100
          const dist =
            (maxDim / (2 * Math.tan((this.camera.fov * Math.PI) / 180 / 2))) *
            1.4
          this.camera.position.set(0, 0, Math.max(dist, 50))
          this.camera.lookAt(0, 0, 0)
          this.controls.target.set(0, 0, 0)
          this.controls.update()
        } else {
          this.error = 'DXF-ը դատարկ է կամ չի պարունակում գծագրեր'
        }
      } catch (e) {
        console.error('DXF parse error:', e)
        this.error = e.message || 'DXF-ը չի կարող մշակվել'
        this.$notify({ text: this.error, type: 'error', duration: 5000 })
      }
    },
  },
}
</script>
