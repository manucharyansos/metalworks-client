<template>
  <section
    ref="shell"
    class="cad-viewer overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
  >
    <div
      class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-3 dark:border-slate-700"
    >
      <p class="text-xs text-slate-500 dark:text-slate-400">
        <span
          class="mr-2 font-mono font-semibold text-slate-900 dark:text-white"
          >{{ model.format.toUpperCase() }}</span
        >
        {{ $t('model_preview.part_count', { count: model.meshes.length }) }}
      </p>
      <div
        class="flex flex-wrap gap-1"
        role="toolbar"
        :aria-label="$t('model_preview.views')"
      >
        <button
          v-for="view in views"
          :key="view"
          type="button"
          class="cad-button"
          :disabled="!!renderError"
          :aria-pressed="currentView === view"
          @click="setView(view)"
        >
          {{ $t('model_preview.' + view) }}
        </button>
      </div>
    </div>

    <div
      class="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-700"
      role="toolbar"
      :aria-label="$t('model_preview.controls')"
    >
      <button
        type="button"
        class="cad-button"
        :disabled="!!renderError"
        :aria-label="$t('model_preview.zoom_in')"
        :title="$t('model_preview.zoom_in')"
        @click="zoom(1.25)"
      >
        +
      </button>
      <button
        type="button"
        class="cad-button"
        :disabled="!!renderError"
        :aria-label="$t('model_preview.zoom_out')"
        :title="$t('model_preview.zoom_out')"
        @click="zoom(0.8)"
      >
        −
      </button>
      <button
        type="button"
        class="cad-button"
        :disabled="!!renderError"
        @click="fitModel"
      >
        {{ $t('model_preview.fit') }}
      </button>
      <button
        type="button"
        class="cad-button"
        :disabled="!!renderError"
        :aria-pressed="wireframe"
        @click="toggleWireframe"
      >
        {{ $t('model_preview.wireframe') }}
      </button>
      <button
        type="button"
        class="cad-button"
        :disabled="!!renderError"
        :aria-pressed="showBounds"
        @click="toggleBounds"
      >
        {{ $t('model_preview.bounds') }}
      </button>
      <button
        v-if="hasModelColors"
        type="button"
        class="cad-button"
        :disabled="!!renderError"
        :aria-pressed="useModelColors"
        @click="toggleColors"
      >
        {{ $t('model_preview.model_colors') }}
      </button>
      <button
        v-if="fullscreenSupported"
        type="button"
        class="cad-button"
        :disabled="!!renderError"
        :aria-pressed="isFullscreen"
        @click="toggleFullscreen"
      >
        {{
          $t(
            isFullscreen
              ? 'model_preview.exit_fullscreen'
              : 'model_preview.fullscreen'
          )
        }}
      </button>
      <button
        type="button"
        class="cad-button"
        :disabled="!!renderError"
        @click="saveImage"
      >
        {{ $t('model_preview.snapshot') }}
      </button>
    </div>

    <div ref="stage" class="cad-stage relative bg-slate-50 dark:bg-slate-950">
      <canvas
        ref="canvas"
        class="block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
        tabindex="0"
        :aria-label="$t('model_preview.canvas', { name: filename })"
        :aria-describedby="hintId"
        @pointerdown="focusCanvas"
        @keydown="handleKey"
      ></canvas>
      <p
        v-if="renderError"
        role="alert"
        class="absolute inset-x-4 top-4 rounded-lg bg-white p-4 text-sm text-red-600 dark:bg-slate-900 dark:text-red-300"
      >
        {{ renderError }}
      </p>
      <p
        v-else-if="visibleParts.length === 0"
        class="absolute inset-x-4 top-4 rounded-lg bg-white/90 p-3 text-center text-sm text-slate-500 dark:bg-slate-900/90 dark:text-slate-300"
      >
        {{ $t('model_preview.no_visible_parts') }}
      </p>
      <div
        aria-hidden="true"
        class="pointer-events-none absolute bottom-3 left-3 flex gap-2 rounded-lg bg-white/90 px-2 py-1 font-mono text-xs dark:bg-slate-900/90"
      >
        <span class="text-red-600 dark:text-red-400">X</span
        ><span class="text-green-600 dark:text-green-400">Y</span
        ><span class="text-blue-600 dark:text-blue-400">Z</span>
      </div>
    </div>

    <div class="border-t border-slate-200 p-3 dark:border-slate-700">
      <p :id="hintId" class="mb-3 text-xs text-slate-500 dark:text-slate-400">
        {{ $t('model_preview.navigation_hint') }}
      </p>
      <p class="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        {{ $t('model_preview.dimensions') }} ·
        {{
          $t(
            model.unit === 'mm'
              ? 'model_preview.millimeters'
              : 'model_preview.file_units'
          )
        }}
      </p>
      <dl class="grid grid-cols-3 gap-2 text-sm">
        <div
          v-for="(size, axis) in dimensions"
          :key="axis"
          class="rounded-lg bg-slate-50 p-2 dark:bg-slate-800"
        >
          <dt class="text-xs text-slate-500 dark:text-slate-400">
            {{ ['X', 'Y', 'Z'][axis] }}
          </dt>
          <dd
            class="mt-1 break-all font-mono font-semibold text-slate-900 dark:text-white"
          >
            {{ number(size) }}
          </dd>
        </div>
      </dl>
      <div class="mt-4 flex items-center justify-between gap-3">
        <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {{ $t('model_preview.parts') }}
        </h4>
        <button
          type="button"
          class="text-xs font-medium text-blue-600 hover:underline dark:text-blue-300"
          :disabled="!!renderError"
          @click="showAll"
        >
          {{ $t('model_preview.show_all') }}
        </button>
      </div>
      <ul
        class="mt-2 grid max-h-40 grid-cols-1 gap-1 overflow-auto sm:grid-cols-2"
      >
        <li
          v-for="part in model.meshes"
          :key="part.id"
          class="flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800"
        >
          <input
            :id="'cad-part-' + instanceId + '-' + part.id"
            type="checkbox"
            :checked="visibleParts.includes(part.id)"
            :disabled="!!renderError"
            class="h-4 w-4 shrink-0 rounded"
            :aria-label="
              $t('model_preview.show_part', { name: partName(part) })
            "
            @change="togglePart(part.id)"
          />
          <label
            :for="'cad-part-' + instanceId + '-' + part.id"
            class="sr-only"
            >{{ partName(part) }}</label
          >
          <button
            type="button"
            class="min-w-0 flex-1 truncate text-left text-xs text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-300"
            :title="$t('model_preview.isolate_part', { name: partName(part) })"
            :disabled="!!renderError"
            @click="showOnly(part.id)"
          >
            {{ partName(part) }}
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default {
  name: 'ModelViewer',
  props: {
    model: { type: Object, required: true },
    filename: { type: String, default: '' },
  },
  data() {
    return {
      views: ['isometric', 'top', 'front', 'right'],
      currentView: 'isometric',
      wireframe: false,
      showBounds: false,
      useModelColors: false,
      visibleParts: this.model.meshes.map((part) => part.id),
      renderError: '',
      fullscreenSupported: false,
      isFullscreen: false,
    }
  },
  computed: {
    hasModelColors() {
      return this.model.meshes.some(
        (part) => part.color || part.faceColors.length
      )
    },
    instanceId() {
      return this._uid
    },
    hintId() {
      return 'cad-hint-' + this._uid
    },
    dimensions() {
      return this.model.bounds.max.map(
        (value, axis) => value - this.model.bounds.min[axis]
      )
    },
  },
  created() {
    // WebGL objects stay outside Vue observation.
    this.viewport = null
    this.resizeObserver = null
    this.themeObserver = null
  },
  mounted() {
    this.fullscreenSupported = !!document.fullscreenEnabled
    this.initViewport()
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
  },
  beforeDestroy() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange)
    window.removeEventListener('resize', this.resize)
    this.resizeObserver?.disconnect()
    this.themeObserver?.disconnect()
    this.disposeViewport()
  },
  methods: {
    number(value) {
      return new Intl.NumberFormat(this.$i18n.locale, {
        maximumFractionDigits: 2,
      }).format(value)
    },
    partName(part) {
      return part.name || this.$t('model_preview.part', { number: part.id + 1 })
    },
    initViewport() {
      try {
        const renderer = new THREE.WebGLRenderer({
          canvas: this.$refs.canvas,
          antialias: true,
          powerPreference: 'low-power',
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        const scene = new THREE.Scene()
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 1000)
        this.viewport = { renderer, scene, camera, controls: null }
        camera.up.set(0, 0, 1)
        scene.add(new THREE.HemisphereLight(0xffffff, 0x475569, 2))
        const light = new THREE.DirectionalLight(0xffffff, 3)
        light.position.set(2, -3, 5)
        scene.add(light)
        const group = new THREE.Group()
        const center = new THREE.Vector3()
          .fromArray(this.model.bounds.min)
          .add(new THREE.Vector3().fromArray(this.model.bounds.max))
          .multiplyScalar(0.5)
        group.position.copy(center).multiplyScalar(-1)
        const parts = this.model.meshes.map((part) => {
          const geometry = new THREE.BufferGeometry()
          geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(part.position, 3)
          )
          geometry.setIndex(new THREE.BufferAttribute(part.index, 1))
          if (part.normal)
            geometry.setAttribute(
              'normal',
              new THREE.BufferAttribute(part.normal, 3)
            )
          else geometry.computeVertexNormals()
          if (part.color || part.faceColors.length) {
            const colors = new Float32Array(part.position.length)
            const base = part.color || [0.58, 0.65, 0.75]
            for (let i = 0; i < colors.length; i += 3) colors.set(base, i)
            for (const face of part.faceColors) {
              for (let i = face.start; i < face.start + face.count; i++)
                colors.set(face.color, part.index[i] * 3)
            }
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
          }
          const material = new THREE.MeshStandardMaterial({
            color: 0x94a3b8,
            vertexColors: false,
            roughness: 0.48,
            metalness: 0.08,
            side: THREE.DoubleSide,
          })
          const mesh = new THREE.Mesh(geometry, material)
          mesh.userData.partId = part.id
          group.add(mesh)
          return mesh
        })
        scene.add(group)
        group.updateMatrixWorld(true)
        const box = new THREE.Box3().setFromObject(group)
        const radius = Math.max(
          box.getSize(new THREE.Vector3()).length() / 2,
          0.001
        )
        const grid = new THREE.GridHelper(radius * 3, 10, 0x64748b, 0x94a3b8)
        grid.rotation.x = Math.PI / 2
        grid.position.z = box.min.z - radius * 0.03
        grid.material.transparent = true
        grid.material.opacity = 0.35
        scene.add(grid)
        const axes = new THREE.AxesHelper(radius * 0.45)
        axes.position.set(-radius, -radius, box.min.z)
        scene.add(axes)
        const boxHelper = new THREE.Box3Helper(box, 0x2563eb)
        boxHelper.visible = false
        scene.add(boxHelper)
        this.viewport = {
          renderer,
          scene,
          camera,
          group,
          parts,
          controls: null,
          radius,
          boxHelper,
        }
        this.syncTheme()
        this.setView('isometric')
        if (typeof ResizeObserver !== 'undefined') {
          this.resizeObserver = new ResizeObserver(this.resize)
          this.resizeObserver.observe(this.$refs.stage)
        } else window.addEventListener('resize', this.resize)
        this.themeObserver = new MutationObserver(this.syncTheme)
        this.themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class'],
        })
        this.resize()
      } catch (_) {
        this.disposeViewport()
        this.renderError = this.$t('model_preview.webgl_failed')
      }
    },
    disposeViewport() {
      const view = this.viewport
      if (!view) return
      view.controls?.dispose()
      view.scene.traverse((object) => {
        object.geometry?.dispose()
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material]
        materials.forEach((material) => material?.dispose())
      })
      view.renderer.dispose()
      view.renderer.forceContextLoss()
      this.viewport = null
    },
    createControls() {
      const view = this.viewport
      view.controls?.dispose()
      view.controls = new OrbitControls(view.camera, this.$refs.canvas)
      view.controls.enableDamping = false
      view.controls.minZoom = 0.05
      view.controls.maxZoom = 100
      view.controls.listenToKeyEvents(this.$refs.canvas)
      view.controls.addEventListener('change', this.renderScene)
      view.controls.addEventListener('start', this.onOrbitStart)
    },
    onOrbitStart() {
      this.currentView = ''
    },
    setView(name) {
      const view = this.viewport
      if (!view || this.renderError) return
      const directions = {
        isometric: [1, -1, 0.8],
        top: [0, 0, 1],
        front: [0, -1, 0],
        right: [1, 0, 0],
      }
      view.camera.up.set(...(name === 'top' ? [0, 1, 0] : [0, 0, 1]))
      view.camera.position
        .fromArray(directions[name])
        .normalize()
        .multiplyScalar(view.radius * 3)
      this.createControls()
      this.currentView = name
      this.fitModel()
    },
    fitModel() {
      const view = this.viewport
      if (!view || this.renderError) return
      const box = new THREE.Box3()
      view.group.updateMatrixWorld(true)
      view.parts.forEach((part) => {
        if (part.visible) box.expandByObject(part)
      })
      if (box.isEmpty()) return
      const center = box.getCenter(new THREE.Vector3())
      view.radius = Math.max(
        box.getSize(new THREE.Vector3()).length() / 2,
        0.001
      )
      const direction = view.camera.position
        .clone()
        .sub(view.controls.target)
        .normalize()
      view.camera.position
        .copy(center)
        .addScaledVector(direction, view.radius * 3)
      view.controls.target.copy(center)
      view.camera.zoom = 1
      view.controls.update()
      this.resize()
    },
    zoom(factor) {
      if (!this.viewport || this.renderError) return
      const camera = this.viewport.camera
      camera.zoom = Math.max(0.05, Math.min(100, camera.zoom * factor))
      camera.updateProjectionMatrix()
      this.renderScene()
    },
    resize() {
      const view = this.viewport
      if (!view) return
      const width = this.$refs.stage.clientWidth
      const height = this.$refs.stage.clientHeight
      if (!width || !height) return
      const aspect = width / height
      const scale = (view.radius * 1.3) / Math.min(1, aspect)
      Object.assign(view.camera, {
        left: -scale * aspect,
        right: scale * aspect,
        top: scale,
        bottom: -scale,
        near: Math.max(view.radius / 1000, 0.00001),
        far: Math.max(view.radius * 1000, 10),
      })
      view.camera.updateProjectionMatrix()
      view.renderer.setSize(width, height, false)
      this.renderScene()
    },
    syncTheme() {
      if (!this.viewport) return
      this.viewport.scene.background = new THREE.Color(
        document.documentElement.classList.contains('dark')
          ? 0x020617
          : 0xf8fafc
      )
      this.renderScene()
    },
    renderScene() {
      const view = this.viewport
      if (view) view.renderer.render(view.scene, view.camera)
    },
    toggleWireframe() {
      this.wireframe = !this.wireframe
      this.viewport.parts.forEach((part) => {
        part.material.wireframe = this.wireframe
      })
      this.renderScene()
    },
    toggleBounds() {
      this.showBounds = !this.showBounds
      this.viewport.boxHelper.visible = this.showBounds
      this.renderScene()
    },
    toggleColors() {
      this.useModelColors = !this.useModelColors
      this.viewport.parts.forEach((part) => {
        const colored = this.useModelColors && !!part.geometry.attributes.color
        part.material.color.setHex(colored ? 0xffffff : 0x94a3b8)
        part.material.vertexColors = colored
        part.material.needsUpdate = true
      })
      this.renderScene()
    },
    updateVisibility() {
      this.viewport.parts.forEach((part) => {
        part.visible = this.visibleParts.includes(part.userData.partId)
      })
      this.renderScene()
    },
    togglePart(id) {
      this.visibleParts = this.visibleParts.includes(id)
        ? this.visibleParts.filter((value) => value !== id)
        : this.visibleParts.concat(id)
      this.updateVisibility()
    },
    showOnly(id) {
      this.visibleParts = [id]
      this.updateVisibility()
      this.fitModel()
    },
    showAll() {
      this.visibleParts = this.model.meshes.map((part) => part.id)
      this.updateVisibility()
      this.fitModel()
    },
    focusCanvas() {
      this.$refs.canvas.focus({ preventScroll: true })
    },
    handleKey(event) {
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault()
        this.fitModel()
      }
    },
    onFullscreenChange() {
      this.isFullscreen = document.fullscreenElement === this.$refs.shell
      this.$nextTick(this.resize)
    },
    async toggleFullscreen() {
      try {
        if (this.isFullscreen) await document.exitFullscreen()
        else await this.$refs.shell.requestFullscreen()
      } catch (_) {
        this.fullscreenSupported = false
      }
    },
    saveImage() {
      if (!this.viewport || this.renderError) return
      this.renderScene()
      this.$refs.canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = this.filename.replace(/\.[^.]*$/, '') + '-preview.png'
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }, 'image/png')
    },
  },
}
</script>

<style scoped>
.cad-button {
  @apply rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800;
}
.cad-button[aria-pressed='true'] {
  @apply border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200;
}
.cad-stage {
  height: clamp(300px, 56vh, 640px);
  touch-action: none;
}
.cad-viewer:fullscreen {
  overflow: auto;
}
.cad-viewer:fullscreen .cad-stage {
  height: 65vh;
}
</style>
