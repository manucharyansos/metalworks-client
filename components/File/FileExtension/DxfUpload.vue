<template>
  <div :width="width" :height="height">
    <canvas
      ref="canvas"
      class="line-color w-full h-full flex items-center justify-center"
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
    // eslint-disable-next-line vue/require-default-prop
    width: {
      type: String,
    },
    height: {
      type: String,
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

        renderer.setClearColor(0xffffff, 1)

        renderer.setSize(
          this.$refs.canvas.clientWidth,
          this.$refs.canvas.clientHeight
        )

        const dxfGroup = new THREE.Group()

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

        scene.add(dxfGroup)

        const box = new THREE.Box3().setFromObject(dxfGroup)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        dxfGroup.position.set(-center.x, -center.y, 0)

        const maxDim = Math.max(size.x, size.y)
        const fov = camera.fov * (Math.PI / 180)
        const cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)))

        camera.position.set(0, 0, cameraZ + 10)
        camera.lookAt(new THREE.Vector3(0, 0, 0))

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
