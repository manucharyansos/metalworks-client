<template>
  <div>
    <canvas
      ref="canvas"
      class="line-color w-full h-96 flex items-center justify-center"
    ></canvas>
  </div>
</template>

<script>
import * as THREE from 'three'
// eslint-disable-next-line import/no-named-as-default
import DxfParser from 'dxf-parser'

export default {
  props: {
    dxfUrl: {
      type: String,
      required: true,
    },
  },
  mounted() {
    this.loadDxfFile()
  },
  methods: {
    async loadDxfFile() {
      try {
        const response = await fetch(this.dxfUrl)
        const dxfText = await response.text()

        const parser = new DxfParser()
        const dxf = parser.parseSync(dxfText)

        // Three.js setup
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(
          75,
          this.$refs.canvas.clientWidth / this.$refs.canvas.clientHeight,
          0.1,
          1000
        )
        const renderer = new THREE.WebGLRenderer({
          canvas: this.$refs.canvas,
          antialias: true,
        })

        // Set renderer background color to white
        renderer.setClearColor(0xffffff, 1)

        renderer.setSize(
          this.$refs.canvas.clientWidth,
          this.$refs.canvas.clientHeight
        )

        // Create a group for all DXF entities
        const dxfGroup = new THREE.Group()

        // Add DXF lines to the group
        dxf.entities.forEach((entity) => {
          if (entity.type === 'LINE') {
            const material = new THREE.LineBasicMaterial({ color: 0x000000 }) // Սև գույն
            const geometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(entity.vertices[0].x, entity.vertices[0].y, 0),
              new THREE.Vector3(entity.vertices[1].x, entity.vertices[1].y, 0),
            ])
            const line = new THREE.Line(geometry, material)
            dxfGroup.add(line)
          }
        })

        // Add the group to the scene
        scene.add(dxfGroup)

        // Center the group and adjust the camera
        const box = new THREE.Box3().setFromObject(dxfGroup)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        dxfGroup.position.set(-center.x, -center.y, 0)

        // Adjust camera position based on DXF size
        const maxDim = Math.max(size.x, size.y)
        const fov = camera.fov * (Math.PI / 180)
        const cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)))

        camera.position.set(0, 0, cameraZ + 10) // Keep a little padding
        camera.lookAt(new THREE.Vector3(0, 0, 0))

        // Render the scene
        renderer.render(scene, camera)
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
  stroke: #000000; /* Սև գիծ */
}
</style>
