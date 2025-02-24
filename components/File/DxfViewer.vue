<template>
  <div>
    <canvas
      ref="canvas"
      class="line-color w-full flex items-center justify-center hover:scale-150"
    ></canvas>
    <div v-if="error" class="error-message">
      Failed to load DXF file: {{ error }}
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import DxfParser from 'dxf-parser'

export default {
  props: {
    dxfUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      dxfGroup: null,
      error: null,
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
  },
  beforeDestroy() {
    this.cleanupThreeJS()
  },
  methods: {
    initThreeJS() {
      // Initialize Three.js scene, camera, and renderer
      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(
        75,
        this.$refs.canvas.clientWidth / this.$refs.canvas.clientHeight,
        0.1,
        1000
      )
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.$refs.canvas,
        antialias: true,
      })
      this.renderer.setClearColor(0xffffff, 1)
      this.renderer.setSize(
        this.$refs.canvas.clientWidth,
        this.$refs.canvas.clientHeight
      )
    },
    cleanupThreeJS() {
      // Clean up Three.js resources
      if (this.renderer) {
        this.renderer.dispose()
      }
      if (this.scene) {
        this.scene.traverse((object) => {
          if (object.isMesh || object.isLine) {
            if (object.geometry) {
              object.geometry.dispose()
            }
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((material) => material.dispose())
              } else {
                object.material.dispose()
              }
            }
          }
        })
        this.scene.clear()
      }
      if (this.dxfGroup) {
        this.dxfGroup.traverse((object) => {
          if (object.isMesh || object.isLine) {
            if (object.geometry) {
              object.geometry.dispose()
            }
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((material) => material.dispose())
              } else {
                object.material.dispose()
              }
            }
          }
        })
        this.dxfGroup.clear()
      }
    },
    async loadDxfFile() {
      try {
        const response = await this.$axios.get(
          `/api/factories/getFile/${this.dxfUrl}`
        )
        console.log('API Response:', response.data)

        if (response.status !== 200) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const fileData = response.data
        const jsonData = atob(fileData.content)
        const parsedData = JSON.parse(jsonData)
        const dxfText = atob(parsedData.content)
        const parser = new DxfParser()
        const dxf = parser.parseSync(dxfText)
        if (!dxf || !dxf.entities) {
          throw new Error('Failed to parse DXF file or no entities found.')
        }

        if (this.dxfGroup) {
          this.scene.remove(this.dxfGroup)
          this.dxfGroup = null
        }
        this.dxfGroup = new THREE.Group()

        dxf.entities.forEach((entity) => {
          if (entity.type === 'LINE') {
            const material = new THREE.LineBasicMaterial({ color: 0x000000 })
            const geometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(entity.vertices[0].x, entity.vertices[0].y, 0),
              new THREE.Vector3(entity.vertices[1].x, entity.vertices[1].y, 0),
            ])
            const line = new THREE.LineSegments(geometry, material)
            this.dxfGroup.add(line)
          }
        })

        this.scene.add(this.dxfGroup)

        const box = new THREE.Box3().setFromObject(this.dxfGroup)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        this.dxfGroup.position.set(-center.x, -center.y, 0)

        const maxDim = Math.max(size.x, size.y)
        const fov = this.camera.fov * (Math.PI / 180)
        const cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)))

        this.camera.position.set(0, 0, cameraZ + 10)
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))

        this.renderer.render(this.scene, this.camera)
        this.error = null
      } catch (error) {
        console.error('Failed to load DXF file:', error)
      }
    },
  },
}
</script>

<style>
canvas {
  background-color: #ffffff;
  display: block;
  margin: auto;
  border: 1px solid #ccc;
}

.line-color {
  stroke: #000000;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 10px;
}
</style>
