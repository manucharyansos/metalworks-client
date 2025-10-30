<template>
  <div class="w-full h-full relative">
    <canvas ref="canvas" class="w-full h-full block"></canvas>
    <div
      v-if="error"
      class="absolute inset-x-0 bottom-2 text-center text-red-600 text-sm"
    >
      DXF ֆայլը բեռնելիս սխալ՝ {{ error }}
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import DxfParser from 'dxf-parser'

export default {
  name: 'DxfCanvas',
  props: {
    // ENCODED path (we encode in caller)
    dxfUrl: { type: String, required: true },
  },
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      dxfGroup: null,
      error: null,
      raf: null,
      onResizeHandler: null,
    }
  },
  watch: {
    dxfUrl() {
      this.loadDxfFile()
    },
  },
  mounted() {
    this.initThreeJS()
    this.loadDxfFile()
    this.onResizeHandler = () => this.resizeRenderer()
    window.addEventListener('resize', this.onResizeHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResizeHandler)
    cancelAnimationFrame(this.raf)
    this.cleanupThreeJS()
  },
  methods: {
    initThreeJS() {
      const canvas = this.$refs.canvas
      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)

      const dpr = window.devicePixelRatio || 1
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      this.renderer.setPixelRatio(dpr)

      this.resizeRenderer()
      this.renderer.setClearColor(0xffffff, 1)
    },
    resizeRenderer() {
      const canvas = this.$refs.canvas
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(200, rect.width)
      const height = Math.max(200, rect.height)
      this.renderer.setSize(width, height, false)
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderOnce()
    },
    cleanupThreeJS() {
      if (this.renderer) this.renderer.dispose()
      if (this.scene) {
        this.scene.traverse((obj) => {
          if (obj.isMesh || obj.isLine) {
            obj.geometry?.dispose?.()
            if (Array.isArray(obj.material))
              obj.material.forEach((m) => m.dispose())
            else obj.material?.dispose?.()
          }
        })
        this.scene.clear()
      }
      if (this.dxfGroup) {
        this.dxfGroup.traverse((obj) => {
          obj.geometry?.dispose?.()
          if (Array.isArray(obj.material))
            obj.material.forEach((m) => m.dispose())
          else obj.material?.dispose?.()
        })
        this.dxfGroup.clear()
      }
    },
    async loadDxfFile() {
      try {
        // encoded path comes from parent
        const url = `/api/factories/getFile/${this.dxfUrl}`
        const response = await this.$axios.get(url)
        if (response.status !== 200)
          throw new Error(`HTTP սխալ ${response.status}`)

        const fileData = response.data
        if (!fileData || !fileData.content)
          throw new Error('Ֆայլի տվյալները բացակայում են։')

        // try to extract plain DXF text from nested base64/json
        let dxfText
        try {
          const jsonData = atob(fileData.content)
          const parsed = JSON.parse(jsonData)
          dxfText = parsed.content ? atob(parsed.content) : jsonData
        } catch {
          dxfText = atob(fileData.content)
        }
        this.parseDxf(dxfText)
        this.error = null
      } catch (e) {
        console.error('DXF load error:', e)
        this.error = e.message
      }
    },
    parseDxf(dxfText) {
      try {
        const parser = new DxfParser()
        const dxf = parser.parseSync(dxfText)
        if (!dxf || !dxf.entities)
          throw new Error('Տվյալներ չեն գտնվել DXF-ում')

        if (this.dxfGroup) this.scene.remove(this.dxfGroup)
        this.dxfGroup = new THREE.Group()

        dxf.entities.forEach((entity) => {
          if (entity.type === 'LINE' && entity.vertices?.length >= 2) {
            const material = new THREE.LineBasicMaterial({ color: 0x000000 })
            const geometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(entity.vertices[0].x, entity.vertices[0].y, 0),
              new THREE.Vector3(entity.vertices[1].x, entity.vertices[1].y, 0),
            ])
            this.dxfGroup.add(new THREE.LineSegments(geometry, material))
          } else if (entity.type === 'LWPOLYLINE' && entity.vertices?.length) {
            const material = new THREE.LineBasicMaterial({ color: 0x0000ff })
            const geometry = new THREE.BufferGeometry().setFromPoints(
              entity.vertices.map((v) => new THREE.Vector3(v.x, v.y, 0))
            )
            this.dxfGroup.add(new THREE.Line(geometry, material))
          }
          // (կարող ենք ավելացնել CIRCLE/ARC/SPLINE ըստ անհրաժեշտության)
        })

        this.scene.add(this.dxfGroup)

        // fit to view
        const box = new THREE.Box3().setFromObject(this.dxfGroup)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        this.dxfGroup.position.set(-center.x, -center.y, 0)

        const maxDim = Math.max(size.x || 1, size.y || 1)
        const fov = this.camera.fov * (Math.PI / 180)
        const cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)))
        this.camera.position.set(0, 0, cameraZ + 10)
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))

        this.renderOnce()
      } catch (e) {
        this.error = e.message
      }
    },
    renderOnce() {
      if (!this.renderer || !this.scene || !this.camera) return
      this.renderer.render(this.scene, this.camera)
    },
  },
}
</script>

<style scoped>
/* canvas inherits container size */
</style>
