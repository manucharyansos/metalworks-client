<template>
  <div class="w-full h-full relative">
    <!-- Close button -->
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

    <!-- DXF canvas -->
    <canvas ref="canvas" class="w-full h-full block"></canvas>

    <!-- Laser info (optional) -->
    <div
      v-if="showLaserInfo && laserLengthMmRounded > 0"
      class="absolute left-2 top-2 px-3 py-1.5 rounded-lg bg-black/70 text-[11px] text-white backdrop-blur-sm flex flex-col gap-0.5 max-w-[280px]"
    >
      <div v-if="materialInfo" class="font-medium truncate">
        {{ materialInfo }}
      </div>
      <div class="opacity-80">
        Գծամետրում՝
        <span class="font-semibold">{{ laserLengthMmRounded }}</span>
        մմ
      </div>
    </div>

    <!-- Error badge -->
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

    // Ֆայլի օբյեկտը՝ նյութի, հաստության և այլ դաշտերով
    fileMeta: {
      type: Object,
      default: null,
    },

    // Կարել է անջատել, եթե չեք ուզում գծամետրի ինֆո ցույց տալ
    showLaserInfo: {
      type: Boolean,
      default: true,
    },
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

      // Լազերային կտրման ընդհանուր երկարությունը մմ-ով
      laserLengthMm: 0,
    }
  },
  computed: {
    // Կլորացրած գծամետրը մմ-ով (1 տասնորդական)
    laserLengthMmRounded() {
      if (!this.laserLengthMm) return 0
      return Number(this.laserLengthMm.toFixed(1))
    },
    // Նյութի ինֆո ֆայլից
    materialInfo() {
      if (!this.fileMeta) return ''
      const mat =
        this.fileMeta.material_type ||
        this.fileMeta.material ||
        this.fileMeta.materialType ||
        ''
      const th = this.fileMeta.thickness || ''
      if (mat && th) return `${mat} (${th})`
      return mat || th || ''
    },
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
      this.renderer.setPixelRatio(window.devicePixelRatio || 1)
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
      this.controls?.dispose?.()
      this.renderer?.dispose?.()

      if (this.dxfGroup) {
        this.dxfGroup.traverse((obj) => {
          obj.geometry?.dispose?.()
          if (Array.isArray(obj.material))
            obj.material.forEach((m) => m?.dispose?.())
          else obj.material?.dispose?.()
        })
      }

      this.scene =
        this.camera =
        this.renderer =
        this.controls =
        this.dxfGroup =
          null

      this.laserLengthMm = 0
    },

    async loadDxfFile() {
      try {
        this.error = null
        this.cleanupThree()
        this.initThree()
        this.laserLengthMm = 0

        const { data, status } = await this.$axios.get(
          `/api/factories/getFile/${this.dxfUrl}`
        )
        if (status !== 200) throw new Error(`HTTP ${status}`)

        let dxfText = atob(data.content)
        try {
          const parsed = JSON.parse(dxfText)
          dxfText = parsed?.content ? atob(parsed.content) : dxfText
        } catch {
          // ուղիղ base64
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

        this.laserLengthMm = 0

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 })
        const blueMaterial = new THREE.LineBasicMaterial({ color: 0x1e40af })

        // Ֆունկցիա՝ entity-ներ ավելացնելու և միաժամանակ գծամետրը հաշվելու համար
        const addEntity = (
          ent,
          targetGroup = this.dxfGroup,
          scaleFactor = 1
        ) => {
          try {
            // LINE
            if (ent.type === 'LINE') {
              const v1 = ent.vertices?.[0] || ent.start
              const v2 = ent.vertices?.[1] || ent.end
              if (!v1 || !v2) return

              const p1 = new THREE.Vector3(v1.x, v1.y, 0)
              const p2 = new THREE.Vector3(v2.x, v2.y, 0)

              const geom = new THREE.BufferGeometry().setFromPoints([p1, p2])
              targetGroup.add(new THREE.Line(geom, lineMaterial))

              this.laserLengthMm += p1.distanceTo(p2) * scaleFactor

              // LWPOLYLINE & POLYLINE
            } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
              if (!ent.vertices || ent.vertices.length < 2) return
              const pts = ent.vertices.map(
                (v) => new THREE.Vector3(v.x, v.y, 0)
              )
              if (ent.closed || ent.shape) pts.push(pts[0])
              const geom = new THREE.BufferGeometry().setFromPoints(pts)
              targetGroup.add(new THREE.Line(geom, lineMaterial))

              for (let i = 1; i < pts.length; i++) {
                this.laserLengthMm +=
                  pts[i].distanceTo(pts[i - 1]) * scaleFactor
              }

              // CIRCLE
            } else if (ent.type === 'CIRCLE') {
              const geom = new THREE.CircleGeometry(ent.radius, 64)
              geom.translate(ent.center.x, ent.center.y, 0)
              const edges = new THREE.EdgesGeometry(geom)
              targetGroup.add(new THREE.LineSegments(edges, lineMaterial))

              // Շրջագիծ՝ 2πR
              this.laserLengthMm += 2 * Math.PI * ent.radius * scaleFactor

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

              for (let i = 1; i < pts.length; i++) {
                this.laserLengthMm +=
                  pts[i].distanceTo(pts[i - 1]) * scaleFactor
              }

              // SPLINE
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

              for (let i = 1; i < splinePts.length; i++) {
                this.laserLengthMm +=
                  splinePts[i].distanceTo(splinePts[i - 1]) * scaleFactor
              }

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

              for (let i = 1; i < pts.length; i++) {
                this.laserLengthMm +=
                  pts[i].distanceTo(pts[i - 1]) * scaleFactor
              }

              // INSERT — block
            } else if (ent.type === 'INSERT' && dxf.blocks?.[ent.name]) {
              const block = dxf.blocks[ent.name]
              const blockGroup = new THREE.Group()

              const sx = ent.scale?.x || ent.xScale || 1
              const sy = ent.scale?.y || ent.yScale || 1
              const s = (sx + sy) / 2 || 1

              block.entities?.forEach((subEnt) =>
                addEntity(subEnt, blockGroup, scaleFactor * s)
              )

              if (ent.position)
                blockGroup.position.set(ent.position.x, ent.position.y, 0)
              if (ent.rotation)
                blockGroup.rotation.z = THREE.MathUtils.degToRad(ent.rotation)

              blockGroup.scale.set(sx || 1, sy || 1, 1)
              targetGroup.add(blockGroup)
            }
          } catch (e) {
            console.warn('Entity error:', ent.type, e)
          }
        }

        // 1. Model space entities
        dxf.entities?.forEach((ent) => addEntity(ent))

        // 2. Եթե model space-ում ոչինչ չկա → *Model_Space կամ *Paper_Space
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
