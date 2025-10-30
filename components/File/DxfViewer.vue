<template>
  <div
    class="relative w-full h-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden"
  >
    <canvas ref="canvas" class="w-full h-full"></canvas>
    <div
      v-if="error"
      class="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-black/90 p-4"
    >
      <p class="text-red-600 dark:text-red-400 text-center">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import DxfParser from 'dxf-parser'

export default {
  props: { dxfUrl: String },
  data: () => ({
    scene: null,
    camera: null,
    renderer: null,
    dxfGroup: null,
    error: null,
  }),

  watch: { dxfUrl: 'loadDxfFile' },

  mounted() {
    this.initThreeJS()
    this.loadDxfFile()
    window.addEventListener('resize', this.resize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
    this.cleanupThreeJS()
  },

  methods: {
    initThreeJS() {
      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.$refs.canvas,
        antialias: true,
        alpha: true,
      })
      this.renderer.setClearColor(0xffffff, 1)
      this.resize()
    },

    resize() {
      const rect = this.$refs.canvas.getBoundingClientRect()
      this.renderer.setSize(rect.width, rect.height)
      this.camera.aspect = rect.width / rect.height
      this.camera.updateProjectionMatrix()
    },

    async loadDxfFile() {
      try {
        this.error = null
        const { data } = await this.$axios.get(
          `/api/factories/getFile/${this.dxfUrl}`
        )
        const dxfText = atob(data.content)
        this.parseDxf(dxfText)
      } catch (err) {
        this.error = 'DXF-ը բեռնելիս սխալ'
      }
    },

    parseDxf(text) {
      const parser = new DxfParser()
      const dxf = parser.parseSync(text)
      if (!dxf?.entities?.length) return

      if (this.dxfGroup) this.scene.remove(this.dxfGroup)
      this.dxfGroup = new THREE.Group()

      dxf.entities.forEach((e) => {
        if (e.type === 'LINE') {
          const points = e.vertices.map((v) => new THREE.Vector3(v.x, v.y, 0))
          const geom = new THREE.BufferGeometry().setFromPoints(points)
          const line = new THREE.Line(
            geom,
            new THREE.LineBasicMaterial({ color: 0x000000 })
          )
          this.dxfGroup.add(line)
        }
      })

      this.scene.add(this.dxfGroup)
      this.fitToView()
      this.renderer.render(this.scene, this.camera)
    },

    fitToView() {
      const box = new THREE.Box3().setFromObject(this.dxfGroup)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      this.dxfGroup.position.sub(center)
      const max = Math.max(size.x, size.y) || 1
      const dist = max / (2 * Math.tan((this.camera.fov * Math.PI) / 360))
      this.camera.position.set(0, 0, dist * 1.5)
      this.camera.lookAt(0, 0, 0)
    },

    cleanupThreeJS() {
      this.renderer?.dispose()
      this.scene?.clear()
      this.dxfGroup?.clear()
    },
  },
}
</script>
